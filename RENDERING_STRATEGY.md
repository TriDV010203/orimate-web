# Chiến lược Rendering — OriMate (Next.js App Router + ASP.NET Core)

> Tài liệu phân tích, **không kèm thay đổi code**. Phạm vi: toàn bộ `app/` (FE) và 23 controller BE tại `backend_OriMate/OrigamiPlatform.API/Controllers`.
> Next.js version: **16.2.7**, `cacheComponents` **chưa bật** trong `next.config.ts` → dự án đang ở "Previous Model" (route segment config `dynamic`/`revalidate` + `fetch(..., { next: { revalidate, tags } })`), chưa dùng `"use cache"`/`cacheLife`/`cacheTag`.

---

## 0. Phát hiện nền tảng (ảnh hưởng toàn bộ khuyến nghị bên dưới)

### 0.1. JWT lưu ở đâu?

`lib/auth.ts` lưu token **hoàn toàn phía client**:

```ts
storage.setItem(TOKEN_KEY, data.token);       // localStorage (remember=true) hoặc sessionStorage
localStorage.setItem(REFRESH_KEY, data.refreshToken);
```

`AuthController` (BE) xác nhận: `Login`/`Register`/`RefreshToken` chỉ `return Ok(result)` — **không có `Set-Cookie`/`CookieOptions` ở đâu trong `Application`/`Infrastructure`**. Đây là JWT bearer thuần JSON, không có HttpOnly cookie.

**Hệ quả kỹ thuật quan trọng nhất của toàn bộ audit này:**
Next.js Server Component/`generateMetadata` chạy trên server, **không có quyền truy cập `localStorage`/`sessionStorage`**. Vì token chỉ tồn tại ở nơi Server Component không đọc được, **Server Component không thể tạo ra một request đã xác thực thay cho user**. Điều này có nghĩa:

- Mọi dữ liệu **cá nhân hoá** (isLiked, isWishlisted, isFollowing, "của tôi", role-gated...) **bắt buộc phải fetch phía client** — không có cách nào SSR đúng nghĩa cho phần này nếu không đổi cơ chế lưu token.
- Dữ liệu **công khai** (danh sách tutorial ẩn danh, mô tả lộ trình học, bài viết cộng đồng, sản phẩm shop...) thì **hoàn toàn có thể** fetch phía server (anonymous request, không cần token) — nhưng codebase hiện tại **không làm vậy**: gần như 100% route fetch dữ liệu client-side kể cả khi dữ liệu đó công khai.

→ Đây chính là gốc rễ của phần lớn các route "triển khai sai" ở mục 2.

### 0.2. Pattern hiện tại lặp lại ở gần như mọi route

Đã kiểm tra toàn bộ `app/**/page.tsx` (grep `"use client"` ở đầu file `page.tsx` → **0 kết quả**, tức không page.tsx nào tự là Client Component):

- `page.tsx` = Server Component rỗng, chỉ export `metadata` tĩnh, render một component `"use client"` trong `app/_components/`.
- Component client đó fetch toàn bộ dữ liệu trong `useEffect`/TanStack Query, đọc token qua `getToken()`/`isLoggedIn()`.
- Không route nào dùng `export const dynamic`, `export const revalidate`, `generateStaticParams`. Chỉ **2 route** dùng `generateMetadata` động: `huong-dan/[id]` và `lo-trinh/[id]`.
- `app/providers.tsx` (`"use client"`) chỉ bọc `QueryClientProvider`, không phải nguyên nhân buộc CSR (không có Context Provider nào cần chạy trên client bọc quanh nội dung).

→ Nói cách khác: **toàn bộ site hiện là CSR** (Server Component chỉ generate một shell rỗng/skeleton), bất kể route đó có cần SEO hay không.

### 0.3. BE không có tầng cache nào

`Program.cs`: không có `AddResponseCaching`/`UseResponseCaching`/`AddOutputCache`, không `Cache-Control`/ETag ở bất kỳ controller nào. Mọi GET đều hit DB trực tiếp → **toàn bộ trách nhiệm cache/revalidate phải nằm ở FE** (Next.js fetch cache hoặc CDN), BE không giúp được gì.

Hai endpoint nặng nhất cần lưu ý khi chọn `revalidate`:
- `GET /api/tutorials` (danh sách): N+1 nặng nhất — loop mỗi tutorial gọi thêm 3-5 query (like/wishlist/comment count, isLiked, isWishlisted) → ~100 query phụ cho 1 trang 20 item.
- `GET /api/community-posts/feed`: N+1 tương tự (2-3 query/post).
- `GET /api/subscriptions/admin/revenue`, `GET /api/subscriptions/creators/{id}/revenue`: aggregate nặng, nhưng traffic thấp (admin/creator-only).

### 0.4. Ràng buộc kỹ thuật khi thêm server-fetch (áp dụng cho mọi khuyến nghị Hybrid ở mục 1)

`lib/api/client.ts`: `BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""`, và mọi request gọi `fetch(`${BASE_URL}${path}`)` với `path` dạng `/api/...`. Khi `NEXT_PUBLIC_API_URL` rỗng (mặc định dev), URL thành `/api/...` — **URL tương đối**. Trên trình duyệt việc này OK (resolve theo origin hiện tại, đi qua `rewrites()` trong `next.config.ts` để proxy sang BE). Nhưng khi gọi từ Server Component/`generateMetadata` (chạy trong Node, không có "current origin" của trình duyệt), `fetch("/api/...")` **sẽ ném lỗi parse URL** trừ khi `NEXT_PUBLIC_API_URL` được set thành URL tuyệt đối tới BE.

→ Đây là lý do nghi vấn `generateMetadata` trong `app/lo-trinh/[id]/page.tsx` (route SSR duy nhất hiện có) **có thể đang fail âm thầm** và luôn rơi vào nhánh `catch` (metadata generic) mỗi khi `NEXT_PUBLIC_API_URL` không phải URL tuyệt đối — xem mục 2, route #1.

**Khuyến nghị chung cho mọi Hybrid route ở mục 1:** tạo một hàm fetch riêng cho server (ví dụ `lib/api/server-client.ts`) dùng biến môi trường **không có tiền tố `NEXT_PUBLIC_`** (vd. `API_INTERNAL_URL`, mặc định trỏ thẳng BE, không qua rewrite) để tránh phụ thuộc vào biến dùng chung với client và tránh lỗi URL tương đối trên server.

---

## 1. Bảng chiến lược theo route

Chú thích chiến lược: **SSG** = static, build 1 lần; **ISR** = SSR + `revalidate` theo thời gian; **SSR** = render mỗi request (do dùng `searchParams`/dynamic params); **Hybrid** = Server Component fetch phần công khai (ISR/SSR) + Client Component overlay phần cá nhân hoá/tương tác; **CSR** = giữ nguyên client-fetch toàn bộ (bắt buộc do dữ liệu 100% cá nhân hoá và JWT ở localStorage).

### 1.1. Trang tĩnh / pháp lý

| Route | Chiến lược | Lý do | Config cần thêm |
|---|---|---|---|
| `/chinh-sach-bao-mat` | **SSG** | Nội dung tĩnh hard-code trong JSX, không fetch, không auth. SEO có giá trị (policy pages được index). | `export const revalidate = false` (tường minh hoá default hiện tại) |
| `/dieu-khoan` | **SSG** | Tương tự trên. | `export const revalidate = false` |

Hai route này **đã đúng** — không cần sửa, chỉ nên set tường minh để tránh nhầm lẫn sau này khi thêm data fetch.

### 1.2. Auth flow

| Route | Chiến lược | Lý do | Config cần thêm |
|---|---|---|---|
| `/dang-ky`, `/dang-nhap`, `/quen-mat-khau` | **CSR (form) + static shell** | Form thuần, không cần SEO sâu (chỉ cần title/OG cơ bản đã có), giá trị SSR ≈ 0. | Giữ nguyên |
| `/dat-lai-mat-khau`, `/xac-minh-email` | **CSR (form) + static shell** | Phụ thuộc `token` trong query string (`useSearchParams`, chỉ biết ở client/runtime) — không SSG được vì nội dung gắn với 1 token dùng 1 lần. | Giữ nguyên, đã bọc đúng `<Suspense>` quanh phần dùng `useSearchParams` |

Nhóm này **đã triển khai đúng** với pattern hiện tại (server shell tĩnh + client form).

### 1.3. Nội dung công khai, có giá trị SEO — trọng tâm cần sửa

| Route | Chiến lược đề xuất | Lý do | Config cần thêm |
|---|---|---|---|
| `/` (Home) | **Hybrid** | Top tutorials + top creators là dữ liệu công khai, đúng nội dung "trang chủ" cần SEO/LCP nhanh cho crawler & người dùng ẩn danh. Phần cá nhân hoá (nút thích/lưu, CTA khác nhau theo login) tách client. | `revalidate: 300`, `tags:['tutorials','creators']` cho fetch trong Server Component |
| `/huong-dan` (danh sách) | **Hybrid + SSR khi có `?search=`** | Danh sách + filter công khai; `search`/`category` là `searchParams` → buộc dynamic render (không SSG được toàn bộ), nhưng vẫn nên SSR lần đầu thay vì client fetch từ rỗng. | `dynamic = 'force-dynamic'` khi có searchParams, hoặc để `'auto'`; fetch base list `next:{revalidate:120, tags:['tutorials']}` |
| `/huong-dan/[id]` | **Hybrid** | Trang chi tiết tutorial là nội dung SEO quan trọng nhất của app (title/description/ảnh cover thật). Hiện `generateMetadata` **không fetch tutorial thật** — chỉ nhét slug vào title generic. | `generateMetadata` fetch `tutorialsApi.getBySlug(slug)` (anonymous) để lấy title/description/OG image thật; `generateStaticParams` cho N tutorial phổ biến nhất (top N theo lượt xem) + `revalidate: 600, tags:['tutorial-{slug}']` |
| `/huong-dan/[id]/vip` | **CSR** | Trang checkout/paywall, có polling 4s chờ webhook thanh toán — không có giá trị SEO, nội dung phụ thuộc trạng thái subscription cá nhân. | Giữ CSR |
| `/lo-trinh` (danh sách) | **Hybrid** | Danh sách lộ trình công khai, filter theo mode. | `next:{revalidate:300, tags:['learning-paths']}` |
| `/lo-trinh/[id]` | **Hybrid — sửa lỗi hiện có** | Route **duy nhất** đã có `generateMetadata` fetch thật (`learningPathsApi.getById`), nhưng (a) có nguy cơ lỗi do URL tương đối (mục 0.4), và (b) client component fetch lại y hệt lần nữa (double-fetch: 1 lần server cho metadata, 1 lần client cho nội dung). | Dùng chung 1 fetch: đưa data từ `generateMetadata`/Server Component xuống làm `initialData` cho client thay vì để client tự fetch lại; `revalidate: 600, tags:['learning-path-{id}']` |
| `/cong-dong` (feed) | **Hybrid (trang 1 SSR, "load more" CSR)** | Trang 1 của feed công khai nên SSR để LCP nhanh + crawlable; các trang tiếp theo (nút "Xem thêm") giữ client fetch vì không ai deep-link tới trang 5 của feed. | `next:{revalidate:60, tags:['community-feed']}` (feed đổi nhanh nên revalidate ngắn) |
| `/cong-dong/[id]` | **Hybrid** | Chi tiết bài viết + comment công khai, có giá trị chia sẻ social (OG tags). | `generateMetadata` fetch `communityPostsApi.getById`; `revalidate: 120, tags:['post-{id}']` |
| `/cong-dong/@modal/(.)[id]` | **CSR (giữ nguyên)** | Route intercepting cho modal overlay — về bản chất là điều hướng SPA phía client, không phải entry point cần SEO (khi crawler/direct visit thì Next tự route sang `/cong-dong/[id]` đầy đủ). | Không đổi |
| `/cua-hang` | **ISR** | Danh sách affiliate link, hoàn toàn công khai, **không có cá nhân hoá** (không có isLiked/isWishlisted gì cả), do admin quản lý, ít đổi. Ứng viên ISR tốt nhất trong toàn bộ app. | `revalidate: 600, tags:['shop']` |
| `/thach-thuc` (thử thách ngày) | **Hybrid** | Thử thách hôm nay + leaderboard là nội dung công khai đổi theo ngày; đồng hồ đếm ngược và nút submit/like giữ client. | `revalidate: 300` (đổi mỗi ngày lúc 0h GMT+7 nên không cần ngắn hơn); leaderboard `tags:['daily-leaderboard']` |
| `/kenh/[username]` | **Hybrid** | Trang kênh công khai của creator (SEO cho tên creator), phần "đang theo dõi/VIP của tôi" tách client. | `generateMetadata` fetch `usersApi.getProfile(username)`; `revalidate: 300, tags:['creator-{username}']` |
| `/kenh/[username]/dang-theo-doi`, `/kenh/[username]/nguoi-theo-doi` | **Hybrid** | Danh sách follower/following của người khác — dữ liệu công khai, hiện đang 100% CSR không cần thiết. | `revalidate: 300` |

### 1.4. Trang cá nhân hoá 100% — CSR là lựa chọn ĐÚNG (không phải lỗi)

Các route này không có cách nào SSR cá nhân hoá vì Server Component không đọc được token trong localStorage. Giữ nguyên CSR là quyết định **hợp lý với ràng buộc hiện tại** (không tính vào danh sách "triển khai sai" ở mục 2), miễn là shell loading tối giản.

| Route nhóm | Route | Lý do bắt buộc CSR |
|---|---|---|
| Hồ sơ | `/ho-so`, `/ho-so/chinh-sua`, `/ho-so/doi-mat-khau`, `/ho-so/dang-theo-doi`, `/ho-so/nguoi-theo-doi`, `/ho-so/thanh-tich` | Toàn bộ dữ liệu là "của tôi" — cần token mà server không đọc được |
| Wishlist / Thông báo | `/danh-sach-yeu-thich`, `/thong-bao` | Như trên; `NotificationPopover` còn poll 30s (React Query `refetchInterval`) — tính realtime-nhẹ, không hợp SSR/cache |
| Studio (CMS tác giả) | `/studio`, `/studio/[id]`, `/studio/[id]/xem-truoc`, `/studio/doanh-thu`, `/tao-bai` | Editor/form/dashboard riêng tư, có upload ảnh, validate — không có giá trị SSR | 
| Admin (18 route) | toàn bộ `/(dashboard)/admin/**` | Nội bộ, role-gated, không SEO, dữ liệu 100% qua `adminApi` cần Bearer token |

**Riêng `/studio/[id]/xem-truoc`**: component `TutorialPreviewStudioPage` hiện **hard-code dữ liệu mock** (`const PREVIEW = {...}`, không đọc `[id]`, không gọi API nào) — đây là dead/placeholder code, cần backlog riêng để hoàn thiện logic trước khi bàn tới chiến lược render.

---

## 2. Route đang triển khai SAI so với đề xuất

### 2.1. `app/huong-dan/[id]/page.tsx` — metadata giả

**Hiện trạng:** `generateMetadata` chỉ dùng `slug` thô, không gọi `tutorialsApi.getBySlug`. Kết quả: mọi tutorial khi share lên Facebook/Zalo hoặc xuất hiện trên Google đều có cùng 1 title/description chung chung "Hướng dẫn gấp giấy | OriGami" — **mất hoàn toàn giá trị SEO** cho trang quan trọng nhất của sản phẩm (nội dung lõi: hàng nghìn bài hướng dẫn).

**Cách sửa:** trong `generateMetadata`, gọi `tutorialsApi.getBySlug(slug)` (không kèm token — bản anonymous), lấy `title`, `description`, `coverImageUrl` để build `openGraph.images`. Bọc `try/catch` fallback về metadata generic như route `lo-trinh/[id]` đang làm (pattern đã có sẵn, chỉ cần copy).

### 2.2. `app/lo-trinh/[id]/page.tsx` — SSR có nhưng dữ liệu bị fetch 2 lần, và có nguy cơ fail âm thầm

**Hiện trạng:** Đây là route duy nhất có `generateMetadata` fetch thật, nhưng:
1. Page component không truyền dữ liệu đã fetch xuống — `LearningPathDetailPage` (client) tự `useEffect` gọi lại `learningPathsApi.getById(id)` lần nữa → 2 request cho cùng 1 dữ liệu trên mỗi lượt tải trang.
2. Nếu `NEXT_PUBLIC_API_URL` không phải URL tuyệt đối (mặc định dev là rỗng), `fetch()` trong `generateMetadata` chạy trên server sẽ ném lỗi parse URL → rơi vào `catch` → metadata **luôn luôn generic**, không ai biết vì lỗi bị nuốt im lặng.

**Cách sửa:** 
- Xác nhận/switch sang biến môi trường server-only tuyệt đối (mục 0.4) để loại trừ nguy cơ (2).
- Truyền `initialData` xuống Client Component: `<LearningPathDetailPage id={id} initialData={path} />`, để component dùng `useState(initialData)` làm giá trị khởi tạo thay vì fetch lại từ đầu — chỉ fetch lại phần cá nhân hoá (`achievementsApi.getMine`, tiến độ hoàn thành).

### 2.3. Toàn bộ route ở mục 1.3 (13 route) — bỏ lỡ SSR/ISR dù dữ liệu công khai

**Hiện trạng:** `/`, `/huong-dan`, `/lo-trinh`, `/cong-dong`, `/cong-dong/[id]`, `/cua-hang`, `/thach-thuc`, `/kenh/[username]` và 2 route follower/following của kênh — tất cả fetch dữ liệu **công khai, không cần token** hoàn toàn ở client (`useEffect` sau khi hydrate), dù Server Component thừa sức lấy được cùng dữ liệu đó (endpoint tương ứng đều `[AllowAnonymous]`, xem mục 3).

**Hậu quả cụ thể:**
- Crawler không thực thi JS đầy đủ (hoặc thực thi có độ trễ) sẽ thấy trang gần như rỗng — ảnh hưởng SEO cho toàn bộ nội dung lõi (đây là app "cộng đồng gấp giấy", nội dung UGC + tutorial chính là thứ cần được Google index).
- LCP (Largest Contentful Paint) chậm hơn: phải đợi JS bundle tải + hydrate + gọi API + render, thay vì HTML đã có sẵn nội dung khi tới browser.
- Không tận dụng được cache/CDN — mỗi lượt xem trang chủ của **mọi user ẩn danh** đều kích hoạt lại toàn bộ N+1 query nặng nhất hệ thống (`GET /api/tutorials`) trên BE dù nội dung giống hệt nhau trong nhiều phút.

**Cách sửa (pattern chung, áp dụng cho cả 13 route):**
1. Đổi `page.tsx` từ "chỉ render client component" thành `async function Page()` gọi API **anonymous** (không token) phía server, set `next: { revalidate: <N>, tags: [...] }` theo bảng ở mục 1.3.
2. Truyền kết quả xuống client component qua prop `initialData`.
3. Trong client component: dùng `initialData` để render ngay (không skeleton rỗng ban đầu); nếu `isLoggedIn()`, gọi lại **đúng field cá nhân hoá** (hoặc gọi lại cùng endpoint kèm token) trong `useEffect` để "vá" `isLiked`/`isWishlisted`/`isFollowing` sau khi mount — chấp nhận 1 nhịp flash nhẹ khi các nút tương tác cập nhật trạng thái thật.
4. Filter/search/pagination client-side (chip lọc độ khó, tab...) **giữ nguyên client-side** nếu đang lọc trên list đã fetch — không cần đổi.

### 2.4. Admin layout — auth gate 100% client-side

**Hiện trạng:** `app/(dashboard)/admin/layout.tsx` là `"use client"`, kiểm tra `isLoggedIn()`/role trong `useEffect`. Nghĩa là: **bất kỳ ai** (kể cả không đăng nhập) request `/admin/*` đều nhận về, tải và parse toàn bộ JS bundle của trang admin trước khi bị redirect — không lộ dữ liệu (vì data fetch cũng chờ token) nhưng lộ **cấu trúc UI/bundle** của khu vực quản trị, và tốn băng thông/thời gian tải vô ích cho người dùng không có quyền.

**Đây không phải lỗi có thể sửa thuần FE** — nó là hệ quả trực tiếp của 0.1 (không có cookie để middleware đọc). Xem khuyến nghị mục 4.

---

## 3. Tham chiếu nhanh: endpoint BE tương ứng (phần công khai dùng cho SSR)

| Route FE | Endpoint anonymous dùng để SSR | Ghi chú tải |
|---|---|---|
| `/` | `GET /api/tutorials?pageSize=5&sortBy=likes`, `GET /api/users/top-creators?count=4` | N+1 nhẹ (N nhỏ) |
| `/huong-dan` | `GET /api/tutorials`, `GET /api/tutorials/categories` | **N+1 nặng nhất hệ thống** (~5 query/item × pageSize) |
| `/huong-dan/[id]` | `GET /api/tutorials/{slug}` | ~8-9 query tuần tự, không phải loop |
| `/lo-trinh` | `GET /api/learning-paths`, `GET /api/learning-path-modes` | Nhẹ |
| `/lo-trinh/[id]` | `GET /api/learning-paths/{id}` | 1 query `.Include` lồng nhau, không N+1 |
| `/cong-dong` | `GET /api/community-posts/feed` | N+1 (2-3 query/post) |
| `/cong-dong/[id]` | `GET /api/community-posts/{id}`, `GET /api/comments` | Nhẹ |
| `/cua-hang` | `GET /api/shop` | Rất nhẹ, không phân trang (list nhỏ) |
| `/thach-thuc` | `GET /api/daily-challenge/today`, `.../leaderboard` | Nhẹ |
| `/kenh/[username]` | `GET /api/users/{id}/profile` | Vài query tuần tự (follower/following/post count) |

Toàn bộ endpoint trên đều `[AllowAnonymous]` — xác nhận việc SSR không cần token là khả thi ngay hôm nay, không cần đổi BE.

---

## 4. JWT ở localStorage — có nên chuyển sang cookie không?

**Khuyến nghị: Có, nên chuyển access token (và refresh token) sang HttpOnly cookie**, kết hợp mô hình BFF (Backend-For-Frontend) nhẹ qua Next.js Route Handlers. Lý do và đánh đổi:

### 4.1. Vì sao nên đổi

1. **Mở khoá SSR/ISR cá nhân hoá thật sự.** Với cookie, Server Component có thể đọc `cookies()` và forward làm `Authorization: Bearer` khi gọi BE — lúc đó các trang ở mục 1.3 không cần "vá" personalization ở client nữa, mà có thể SSR luôn cả `isLiked`/`isFollowing` cho user đã đăng nhập (vẫn giữ cache/ISR cho phần ẩn danh, dynamic cho phần có cookie).
2. **Sửa được lỗ hổng CSR-gating ở admin (mục 2.4).** Có cookie → viết được `middleware.ts` chặn `/admin`, `/studio`, `/ho-so` ngay tại edge, trước khi bundle JS được gửi về — thay vì đợi `useEffect` chạy xong mới redirect.
3. **Giảm bề mặt tấn công XSS.** Token trong `localStorage` đọc được bởi bất kỳ script nào chạy trong trang (kể cả script bên thứ 3/XSS injection) → có thể bị đánh cắp. HttpOnly cookie thì JS không đọc được, giảm đáng kể rủi ro token theft qua XSS.

### 4.2. Vì sao đây không phải việc nhỏ — cần đánh đổi

1. **BE phải đổi:** `AuthController` cần `Response.Cookies.Append(...)` với `HttpOnly=true, Secure=true, SameSite=Lax/Strict` ở `login`/`register`/`refresh-token`, và cần quyết định giai đoạn chuyển tiếp (chấp nhận song song cả cookie lẫn Bearer header, hay cắt hẳn).
2. **CORS cần bật credentials:** `Program.cs` hiện `AllowAnyHeader().AllowAnyMethod()` nhưng **không** có `AllowCredentials()` — bắt buộc phải thêm nếu muốn browser gửi cookie cross-site (origin đã whitelist sẵn `orimate-web.vercel.app` nên tương thích được).
3. **CSRF:** cookie tự động đính kèm mọi request, khác với Bearer header (phải chủ động gắn) — cần thêm chống CSRF cho các endpoint mutate (double-submit cookie token, hoặc dựa vào `SameSite=Strict` + kiểm tra header `Origin`/`Sec-Fetch-Site`).
4. **Kiến trúc FE cần thêm 1 tầng BFF:** `next.config.ts` hiện dùng `rewrites()` (proxy thuần URL, không chạy code) — không đủ để "đọc cookie rồi gắn Bearer header". Cần thay bằng Route Handlers (`app/api/[...path]/route.ts`) hoặc gọi trực tiếp BE server-side kèm cookie forward trong từng Server Component.
5. **Refresh token rotation qua cookie** cần thiết kế lại luồng `refresh-token` hiện tại (đang là gọi thủ công từ client với refresh token đọc từ `localStorage`).

### 4.3. Route hiện đang bị "ép CSR" chỉ vì lý do JWT-ở-localStorage

Đây là danh sách route mà **lý do CSR duy nhất/chính** là "server không đọc được token", chứ không phải bản chất dữ liệu không thể SSR:

- Toàn bộ nhóm mục 1.4: `/ho-so/*`, `/danh-sach-yeu-thich`, `/thong-bao`, `/studio/*`, `/tao-bai`, 18 route `/admin/*`.
- Phần **cá nhân hoá** (không phải toàn bộ trang) của mọi route Hybrid ở mục 1.3: nút thích/lưu/theo dõi, banner VIP, trạng thái nộp bài thử thách hôm nay.

Nếu chuyển sang cookie, nhóm `/ho-so/*` và phần cá nhân hoá nói trên có thể SSR được ngay; riêng `/admin/*` và `/studio/*` (form/CMS nặng tương tác, không có giá trị SEO) **vẫn nên giữ CSR** — cookie ở đây chỉ giúp middleware redirect sớm hơn (mục 4.1.2), không đổi chiến lược render.

### 4.4. Khuyến nghị lộ trình (không bắt buộc làm ngay)

Vì đây là thay đổi xuyên suốt cả FE lẫn BE (auth, CORS, CSRF), nên tách thành giai đoạn riêng, **không gộp chung với việc áp dụng Hybrid rendering ở mục 2.3** — mục 2.3 (SSR phần dữ liệu anonymous) làm được ngay hôm nay, không phụ thuộc việc đổi cookie.

---

## 5. Tóm tắt hành động ưu tiên

| Ưu tiên | Việc cần làm | Route ảnh hưởng | Cần đổi BE? |
|---|---|---|---|
| Cao | Thêm `generateMetadata` fetch thật cho `/huong-dan/[id]` | 1 route | Không |
| Cao | Sửa double-fetch + nguy cơ URL tương đối ở `/lo-trinh/[id]` | 1 route | Không |
| Cao | Chuyển 13 route công khai sang Hybrid (SSR/ISR phần anonymous + client overlay cá nhân hoá) | 13 route (mục 1.3) | Không |
| Trung bình | Set tường minh `revalidate = false` cho 2 trang tĩnh pháp lý | 2 route | Không |
| Thấp / cần quyết định sản phẩm | Đánh giá chuyển JWT sang HttpOnly cookie + BFF | Toàn site (gián tiếp) | **Có** |
| Backlog riêng | Hoàn thiện `TutorialPreviewStudioPage` (đang hard-code mock data) | 1 route | Tuỳ |
