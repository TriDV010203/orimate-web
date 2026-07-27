"use client";
// _components/ShopPage.tsx — Trang công khai "Cửa hàng" (FT-18, Should-have)
//
// Chỉ là danh sách link affiliate ra shop ngoài (giấy, kit, sách...), Admin quản lý.
// Không có giỏ hàng/thanh toán — click "Mua ngay" mở thẳng link ngoài.

import { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { shopApi, type ShopLinkDto, type ApiError } from "@/lib/api";
import { isValidImageUrl } from "@/lib/utils";
import { Loader2, ShoppingBag, ExternalLink } from "lucide-react";

export default function ShopPage() {
  const [links, setLinks] = useState<ShopLinkDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await shopApi.getActive();
        if (!cancelled) setLinks(res);
      } catch (err) {
        if (!cancelled) setError((err as ApiError).message ?? "Không thể tải danh sách cửa hàng.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(links.map((l) => l.category).filter((c): c is string => !!c))),
    [links]
  );

  const visibleLinks = activeCategory ? links.filter((l) => l.category === activeCategory) : links;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ background: "var(--gradient-primary)", padding: "3.5rem 0 3rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.12, fontSize: "8rem", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "2rem", pointerEvents: "none" }}>
            🛍️
          </div>
          <div className="container" style={{ position: "relative" }}>
            <div style={{ maxWidth: "640px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-full)", padding: "0.375rem 1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>🛍️ Cửa hàng</span>
              </div>
              <h1 className="text-display" style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", color: "white", marginBottom: "0.75rem" }}>
                Dụng cụ gấp giấy do OriGami gợi ý
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.0625rem", lineHeight: 1.7 }}>
                Giấy, kit và sách gấp giấy được đội ngũ OriGami chọn lọc — bấm vào để mua trực tiếp tại shop đối tác. Đây chỉ là link tham khảo, OriGami không xử lý đơn hàng hay thanh toán.
              </p>
            </div>
          </div>
        </section>

        <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: "0 auto 0.75rem" }} />
              <p style={{ color: "var(--color-text-muted)" }}>Đang tải cửa hàng...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-error)" }}>{error}</div>
          ) : links.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <ShoppingBag size={40} style={{ margin: "0 auto 0.75rem", color: "var(--color-text-muted)" }} />
              <p style={{ color: "var(--color-text-muted)" }}>Chưa có sản phẩm nào trong cửa hàng.</p>
            </div>
          ) : (
            <>
              {/* ── Category filter ──────────────────────────────────────────── */}
              {categories.length > 0 && (
                <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                  <button
                    className={`filter-chip ${activeCategory === null ? "active" : ""}`}
                    onClick={() => setActiveCategory(null)}
                  >
                    Tất cả
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      className={`filter-chip ${activeCategory === c ? "active" : ""}`}
                      onClick={() => setActiveCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Product cards ────────────────────────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
                {visibleLinks.map((link) => (
                  <article
                    key={link.id}
                    className="card"
                    style={{ overflow: "hidden", display: "flex", flexDirection: "column", border: "1.5px solid var(--color-border)" }}
                  >
                    <div style={{ aspectRatio: "4 / 3", background: "var(--color-surface-2)", position: "relative", overflow: "hidden" }}>
                      {isValidImageUrl(link.imageUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={link.imageUrl!} alt={link.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
                          🛍️
                        </div>
                      )}
                      {link.category && (
                        <span style={{ position: "absolute", top: "0.75rem", left: "0.75rem", background: "rgba(255,255,255,0.92)", color: "var(--color-primary)", fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)" }}>
                          {link.category}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: "1.125rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h2 style={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.4, marginBottom: "1rem", flex: 1 }}>
                        {link.title}
                      </h2>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="btn btn-primary"
                        style={{ marginTop: "auto", justifyContent: "center" }}
                      >
                        Mua ngay
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
