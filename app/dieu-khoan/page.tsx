import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng — OriGami",
  description: "Điều khoản sử dụng dịch vụ của nền tảng OriGami.",
};

export default function DieuKhoanPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* Hero */}
        <div style={{ background: "var(--gradient-primary)", padding: "3rem 0 2.5rem" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.875rem" }}>Trang chủ</Link>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>›</span>
              <span style={{ color: "white", fontSize: "0.875rem" }}>Điều khoản sử dụng</span>
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
              Điều khoản sử dụng
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9375rem" }}>
              Cập nhật lần cuối: 25/06/2026
            </p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: "2.5rem" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "2rem 2.5rem", boxShadow: "var(--shadow-card)" }}>

              <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.75, marginBottom: "2rem", fontSize: "0.9375rem" }}>
                Chào mừng bạn đến với <strong>OriGami</strong> — nền tảng học và chia sẻ nghệ thuật gấp giấy Origami. Bằng cách truy cập và sử dụng dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi các điều khoản dưới đây.
              </p>

              {[
                {
                  num: "1",
                  title: "Chấp nhận điều khoản",
                  content: "Khi đăng ký và sử dụng OriGami, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi. Chúng tôi có quyền cập nhật điều khoản bất kỳ lúc nào và sẽ thông báo cho người dùng qua email hoặc thông báo trên nền tảng.",
                },
                {
                  num: "2",
                  title: "Tài khoản người dùng",
                  content: "Bạn phải từ 13 tuổi trở lên để tạo tài khoản. Bạn chịu trách nhiệm duy trì bảo mật thông tin đăng nhập và tất cả hoạt động xảy ra dưới tài khoản của mình. Mỗi người chỉ được phép tạo một tài khoản cá nhân. OriGami có quyền đình chỉ hoặc xóa tài khoản vi phạm điều khoản mà không cần thông báo trước.",
                },
                {
                  num: "3",
                  title: "Nội dung người dùng",
                  content: "Bạn giữ toàn bộ quyền sở hữu đối với nội dung bạn đăng tải (bài hướng dẫn, bài viết cộng đồng, nhật ký). Tuy nhiên, bằng cách đăng nội dung lên OriGami, bạn cấp cho chúng tôi giấy phép không độc quyền, miễn phí bản quyền để hiển thị, phân phối và quảng bá nội dung đó trên nền tảng. Bạn cam kết không đăng nội dung vi phạm bản quyền, nội dung khiêu dâm, bạo lực, thù ghét, hoặc thông tin sai sự thật.",
                },
                {
                  num: "4",
                  title: "Hành vi được chấp nhận",
                  content: "Người dùng được phép: Học và chia sẻ kiến thức về Origami, tương tác tích cực với cộng đồng, đăng tải tác phẩm cá nhân, theo dõi và giao lưu với các creator. Người dùng không được phép: Spam, quấy rối người dùng khác, đăng nội dung vi phạm pháp luật, cố tình phá hoại hệ thống, sử dụng bot hoặc công cụ tự động để tương tác giả mạo.",
                },
                {
                  num: "5",
                  title: "Nội dung VIP và thanh toán",
                  content: "Một số nội dung trên OriGami yêu cầu đăng ký gói VIP có phí. Tất cả giao dịch thanh toán được xử lý qua các cổng thanh toán bảo mật. Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn. Gói đăng ký VIP tự động gia hạn theo chu kỳ đã chọn. Bạn có thể hủy bất kỳ lúc nào nhưng không được hoàn tiền cho chu kỳ hiện tại.",
                },
                {
                  num: "6",
                  title: "Quyền sở hữu trí tuệ",
                  content: "Toàn bộ giao diện, thương hiệu, logo và mã nguồn của OriGami là tài sản của chúng tôi và được bảo hộ bởi luật sở hữu trí tuệ. Bạn không được sao chép, phân phối hoặc sửa đổi bất kỳ phần nào của nền tảng mà không có sự cho phép bằng văn bản từ OriGami.",
                },
                {
                  num: "7",
                  title: "Giới hạn trách nhiệm",
                  content: "OriGami cung cấp dịch vụ theo hiện trạng (as-is) và không đảm bảo tính liên tục hay không có lỗi của dịch vụ. Chúng tôi không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.",
                },
                {
                  num: "8",
                  title: "Chấm dứt dịch vụ",
                  content: "Chúng tôi có quyền chấm dứt hoặc đình chỉ tài khoản của bạn ngay lập tức, không cần thông báo, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở việc vi phạm Điều khoản này. Khi tài khoản bị chấm dứt, quyền sử dụng dịch vụ của bạn sẽ ngay lập tức chấm dứt.",
                },
                {
                  num: "9",
                  title: "Luật áp dụng",
                  content: "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp phát sinh từ hoặc liên quan đến các điều khoản này sẽ được giải quyết tại tòa án có thẩm quyền tại Hà Nội, Việt Nam.",
                },
                {
                  num: "10",
                  title: "Liên hệ",
                  content: "Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi qua email: support@origami.vn hoặc qua mục Hỗ trợ trên nền tảng.",
                },
              ].map((section) => (
                <section key={section.num} style={{ marginBottom: "1.75rem" }}>
                  <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.625rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", background: "var(--color-primary)", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 800, flexShrink: 0 }}>{section.num}</span>
                    {section.title}
                  </h2>
                  <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.75, fontSize: "0.9375rem", paddingLeft: "2.375rem" }}>
                    {section.content}
                  </p>
                </section>
              ))}

              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", marginTop: "0.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/chinh-sach-bao-mat" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem" }}>
                  Chính sách bảo mật →
                </Link>
                <Link href="/dang-ky" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.875rem" }}>
                  Quay lại đăng ký
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
