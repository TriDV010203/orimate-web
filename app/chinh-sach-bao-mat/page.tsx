import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../_components/Navbar";
import Footer from "../_components/Footer";

export const metadata: Metadata = {
  title: "Chính sách bảo mật — OriGami",
  description: "Chính sách bảo mật và quyền riêng tư của nền tảng OriGami.",
};

export default function ChinhSachBaoMatPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "var(--color-bg)", minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #1B4332 0%, #40916C 100%)", padding: "3rem 0 2.5rem" }}>
          <div className="container">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Link href="/" style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.875rem" }}>Trang chủ</Link>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>›</span>
              <span style={{ color: "white", fontSize: "0.875rem" }}>Chính sách bảo mật</span>
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 800, marginBottom: "0.5rem" }}>
              Chính sách bảo mật
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
                Tại <strong>OriGami</strong>, chúng tôi coi trọng quyền riêng tư của bạn. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi sử dụng nền tảng của chúng tôi.
              </p>

              {[
                {
                  icon: "📥",
                  title: "Thông tin chúng tôi thu thập",
                  items: [
                    "Thông tin tài khoản: email, tên hiển thị, ảnh đại diện bạn cung cấp khi đăng ký.",
                    "Nội dung bạn tạo: bài hướng dẫn, bài viết cộng đồng, nhật ký, bình luận.",
                    "Dữ liệu sử dụng: lịch sử xem, tương tác (like, follow, lưu bài), thời gian truy cập.",
                    "Thông tin thiết bị: loại trình duyệt, địa chỉ IP (được ẩn danh hóa sau 90 ngày).",
                  ],
                },
                {
                  icon: "🔄",
                  title: "Cách chúng tôi sử dụng thông tin",
                  items: [
                    "Cung cấp, duy trì và cải thiện các tính năng của nền tảng.",
                    "Cá nhân hóa nội dung và gợi ý phù hợp với sở thích của bạn.",
                    "Gửi email thông báo quan trọng (xác minh tài khoản, đặt lại mật khẩu).",
                    "Phát hiện và ngăn chặn hành vi gian lận hoặc vi phạm điều khoản.",
                    "Phân tích xu hướng để cải thiện trải nghiệm người dùng.",
                  ],
                },
                {
                  icon: "🤝",
                  title: "Chia sẻ thông tin",
                  items: [
                    "Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ ba.",
                    "Chúng tôi có thể chia sẻ dữ liệu với các nhà cung cấp dịch vụ (hosting, email, phân tích) theo hợp đồng bảo mật.",
                    "Chúng tôi có thể tiết lộ thông tin khi được yêu cầu bởi pháp luật hoặc để bảo vệ quyền lợi hợp pháp.",
                    "Thông tin công khai trong hồ sơ của bạn có thể được xem bởi người dùng khác.",
                  ],
                },
                {
                  icon: "🔒",
                  title: "Bảo mật dữ liệu",
                  items: [
                    "Mật khẩu được mã hóa bằng thuật toán bcrypt — chúng tôi không bao giờ lưu mật khẩu dạng văn bản thuần.",
                    "Kết nối HTTPS/TLS được áp dụng cho tất cả giao tiếp với server.",
                    "JWT token có thời hạn ngắn (1 giờ) và được làm mới tự động.",
                    "Dữ liệu được sao lưu định kỳ và lưu trữ tại các trung tâm dữ liệu bảo mật.",
                  ],
                },
                {
                  icon: "👤",
                  title: "Quyền của bạn",
                  items: [
                    "Xem và chỉnh sửa thông tin cá nhân bất kỳ lúc nào trong mục Hồ sơ.",
                    "Xóa tài khoản và toàn bộ dữ liệu cá nhân — liên hệ support@origami.vn.",
                    "Yêu cầu xuất dữ liệu cá nhân của bạn dưới dạng file JSON.",
                    "Từ chối nhận email marketing (giữ lại email giao dịch bắt buộc).",
                    "Khiếu nại về việc xử lý dữ liệu theo quy định pháp luật Việt Nam.",
                  ],
                },
                {
                  icon: "🍪",
                  title: "Cookie và lưu trữ cục bộ",
                  items: [
                    "Chúng tôi sử dụng localStorage để lưu JWT token và thông tin phiên đăng nhập.",
                    "Cookie phân tích được sử dụng để hiểu cách người dùng tương tác với nền tảng.",
                    "Bạn có thể xóa dữ liệu cục bộ bất kỳ lúc nào qua cài đặt trình duyệt.",
                  ],
                },
                {
                  icon: "👶",
                  title: "Trẻ em",
                  items: [
                    "OriGami không chủ động thu thập thông tin từ trẻ em dưới 13 tuổi.",
                    "Nếu bạn phát hiện trẻ em đã tạo tài khoản, vui lòng liên hệ chúng tôi để xử lý.",
                  ],
                },
              ].map((section) => (
                <section key={section.title} style={{ marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <span style={{ fontSize: "1.25rem" }}>{section.icon}</span>
                    {section.title}
                  </h2>
                  <ul style={{ margin: 0, paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {section.items.map((item, i) => (
                      <li key={i} style={{ color: "var(--color-text-secondary)", lineHeight: 1.7, fontSize: "0.9375rem" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              <div style={{ background: "rgba(45,106,79,0.06)", border: "1px solid rgba(45,106,79,0.18)", borderRadius: "var(--radius-lg)", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
                <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                  <strong style={{ color: "var(--color-primary)" }}>Liên hệ về quyền riêng tư:</strong>{" "}
                  Nếu bạn có bất kỳ câu hỏi hoặc lo ngại nào về chính sách bảo mật này, vui lòng liên hệ qua{" "}
                  <strong>privacy@origami.vn</strong>.
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/dieu-khoan" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem" }}>
                  ← Điều khoản sử dụng
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
