import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ padding: "3rem 1.5rem 1.5rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  background: "var(--gradient-primary)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                  <path d="M2 20l10-16 10 16H2z" />
                  <path d="M12 4L6 14h12L12 4z" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  color: "white",
                }}
              >
                Ori<span style={{ color: "var(--color-accent-light)" }}>Gami</span>
              </span>
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.7, maxWidth: "280px" }}>
              Nền tảng cộng đồng Origami hàng đầu Việt Nam. Học gấp giấy, chia sẻ thành quả và kết nối với hàng nghìn người sáng tạo.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              {["facebook", "youtube", "instagram", "tiktok"].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.7)",
                    transition: "all 0.2s",
                  }}
                  title={social}
                >
                  {social[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Khám phá */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "1rem", fontSize: "0.9375rem" }}>
              Khám phá
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Thư viện hướng dẫn", "Cộng đồng", "Bảng xếp hạng", "Chủ đề nổi bật", "Origami cho trẻ"].map((item) => (
                <li key={item}>
                  <Link href="#" style={{ fontSize: "0.875rem" }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tài khoản */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "1rem", fontSize: "0.9375rem" }}>
              Tài khoản
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Đăng ký", "Đăng nhập", "Gói VIP", "Gói Gia đình", "Trang cá nhân"].map((item) => (
                <li key={item}>
                  <Link href="#" style={{ fontSize: "0.875rem" }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: "1rem", fontSize: "0.9375rem" }}>
              Hỗ trợ
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Trung tâm hỗ trợ", "Chính sách nội dung", "Điều khoản sử dụng", "Quyền riêng tư", "Liên hệ"].map((item) => (
                <li key={item}>
                  <Link href="#" style={{ fontSize: "0.875rem" }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <p style={{ fontSize: "0.8125rem" }}>
            © 2024 OriGami. Tất cả quyền được bảo lưu.
          </p>
          <p style={{ fontSize: "0.8125rem" }}>
            Làm với ❤️ bởi nhóm OriGami Việt Nam
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
