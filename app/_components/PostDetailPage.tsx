"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const POST = {
  id: "post-3",
  author: "Hoàng Nam",
  authorColor: "#2C7DA0",
  username: "@hoangnam.origami3d",
  time: "1 ngày trước",
  fullDate: "21/06/2026 09:30",
  content: `Bộ sưu tập 1000 con hạc giấy của tôi sau 6 tháng kiên trì! 🦢✨

Mỗi con hạc mang một ước nguyện. Theo truyền thuyết Nhật Bản (Senbazuru - Thiên Hạc), ai gấp được 1000 con hạc giấy sẽ được thần linh ban cho một điều ước.

Tôi bắt đầu dự án này vào tháng 12/2025 với mục tiêu rèn luyện kiên nhẫn và tập trung. Mỗi ngày gấp khoảng 5-6 con, kết hợp với thiền định buổi sáng.

Vật liệu tôi dùng:
• Giấy washi Nhật Bản (15×15cm) nhiều màu sắc
• Chỉ buộc bằng len tơ tằm
• Khung gỗ tùy chỉnh để trưng bày

Cảm ơn cộng đồng OriGami đã đồng hành và ủng hộ tôi trong suốt hành trình này! 🙏`,
  image: "🦢",
  imageColor: "#E8F5E8",
  likes: 512,
  comments: 93,
  shares: 47,
  saves: 128,
  tags: ["#1000HạcGiấy", "#Senbazuru", "#Origami", "#KiênTrì"],
  tutorialRef: { title: "Hạc giấy nghệ thuật", id: "hac-giay-nghe-thuat" },
  isLiked: false,
};

const COMMENTS = [
  { id: 1, author: "Thu Hương", color: "#D4713B", username: "@thunguyen.craft", time: "23 giờ trước", text: "Wow! 1000 con hạc thật sự ấn tượng! Bạn có thể chia sẻ cách tổ chức thời gian gấp giấy mỗi ngày không? Mình cũng muốn thử nhưng hay bỏ cuộc giữa chừng 😅", likes: 34, isLiked: false },
  { id: 2, author: "Quang Minh", color: "#2D6A4F", username: "@quangminh_origami", time: "20 giờ trước", text: "Tuyệt vời! Khung gỗ trưng bày rất đẹp. Bạn mua ở đâu hay tự làm vậy? Mình cũng muốn trưng bày tác phẩm như thế này!", likes: 28, isLiked: true },
  { id: 3, author: "Lan Anh", color: "#9B59B6", username: "@lananh.papercraft", time: "18 giờ trước", text: "Mình ngưỡng mộ sự kiên nhẫn của bạn quá! 6 tháng, mỗi ngày đều gấp — đó là tinh thần Origami thực sự ❤️", likes: 67, isLiked: false },
  { id: 4, author: "Minh Tâm", color: "#E03131", username: "@minhtam.fold", time: "15 giờ trước", text: "Dự án đầy cảm hứng! Bạn có thể cho biết điều ước của bạn là gì không? 🙏 (nếu không tiết lộ thì ước nguyện sẽ không thành haha)", likes: 89, isLiked: false },
  { id: 5, author: "Bảo Châu", color: "#F59F00", username: "@baochau.origami", time: "8 giờ trước", text: "Tôi cũng đang trong hành trình 1000 hạc! Hiện được 347 con rồi, mỗi lần nhìn bài của bạn lại có thêm động lực tiếp tục 💪", likes: 45, isLiked: false },
];

const RELATED_POSTS = [
  { id: "post-1", title: "Vừa hoàn thành con rồng Origami 3D...", author: "Quang Minh", color: "#2D6A4F", emoji: "🐉", emojiColor: "#F0F0FF" },
  { id: "post-2", title: "Workshop gấp hoa sen cho các em nhỏ...", author: "Thu Hương", color: "#D4713B", emoji: "🌸", emojiColor: "#FFF0F5" },
];

function CommentItem({ comment }: { comment: typeof COMMENTS[0] }) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likes);
  return (
    <div style={{ display: "flex", gap: "0.875rem" }}>
      <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: comment.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "white", flexShrink: 0, marginTop: "0.125rem" }}>
        {comment.author.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ background: "var(--color-surface-2)", borderRadius: "var(--radius-lg)", padding: "0.875rem 1rem", marginBottom: "0.375rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
            <Link href={`/kenh/${comment.username.replace("@", "")}`} style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--color-text-primary)", textDecoration: "none" }}>{comment.author}</Link>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{comment.username}</span>
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{comment.text}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingLeft: "0.25rem" }}>
          <button onClick={() => { setLiked((v) => !v); setLikeCount((c) => liked ? c - 1 : c + 1); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: liked ? "var(--color-error)" : "var(--color-text-muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {liked ? "❤️" : "🤍"} {likeCount}
          </button>
          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "var(--color-text-muted)", fontWeight: 600 }}>Trả lời</button>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{comment.time}</span>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailPage() {
  const [liked, setLiked] = useState(POST.isLiked);
  const [likeCount, setLikeCount] = useState(POST.likes);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(COMMENTS);

  function handleAddComment() {
    if (!comment.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "Bạn",
      color: "#2D6A4F",
      username: "@you",
      time: "Vừa xong",
      text: comment.trim(),
      likes: 0,
      isLiked: false,
    };
    setComments((prev) => [...prev, newComment]);
    setComment("");
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--color-bg)", paddingTop: "1.5rem", paddingBottom: "4rem" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>

            {/* ── Main Post ── */}
            <div>
              {/* Back */}
              <Link href="/cong-dong" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                Quay lại cộng đồng
              </Link>

              {/* Post */}
              <article style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)", marginBottom: "1.5rem" }}>
                {/* Header */}
                <div style={{ padding: "1.25rem 1.25rem 0.75rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <Link href={`/kenh/${POST.username.replace("@", "")}`}>
                    <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: POST.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, color: "white", flexShrink: 0 }}>
                      {POST.author.charAt(0)}
                    </div>
                  </Link>
                  <div>
                    <Link href={`/kenh/${POST.username.replace("@", "")}`} style={{ textDecoration: "none" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)" }}>{POST.author}</span>
                    </Link>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{POST.username} · {POST.time} · {POST.fullDate}</div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "0 1.25rem 0.875rem" }}>
                  <p style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)", lineHeight: 1.75, whiteSpace: "pre-wrap", marginBottom: "0.875rem" }}>{POST.content}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {POST.tags.map((tag) => (
                      <Link key={tag} href={`/tim-kiem?q=${encodeURIComponent(tag)}`} style={{ fontSize: "0.8125rem", color: "var(--color-primary)", fontWeight: 500, textDecoration: "none" }}>{tag}</Link>
                    ))}
                  </div>
                </div>

                {/* Image */}
                <div style={{ background: POST.imageColor, display: "flex", alignItems: "center", justifyContent: "center", height: "300px", fontSize: "8rem", position: "relative" }}>
                  {POST.image}
                  {POST.tutorialRef && (
                    <Link href={`/huong-dan/${POST.tutorialRef.id}`} style={{ position: "absolute", bottom: "1rem", left: "1rem", background: "rgba(45,106,79,0.92)", color: "white", padding: "0.5rem 1rem", borderRadius: "var(--radius-full)", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none", backdropFilter: "blur(4px)" }}>
                      📌 Xem hướng dẫn: {POST.tutorialRef.title}
                    </Link>
                  )}
                </div>

                {/* Stats */}
                <div style={{ padding: "0.875rem 1.25rem", display: "flex", gap: "1.5rem", borderBottom: "1px solid var(--color-border)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  <span>{liked ? likeCount : POST.likes} lượt thích</span>
                  <span>{POST.comments} bình luận</span>
                  <span>{POST.shares} chia sẻ</span>
                  <span style={{ marginLeft: "auto" }}>{POST.saves} đã lưu</span>
                </div>

                {/* Actions */}
                <div style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <button onClick={() => { setLiked((v) => !v); setLikeCount((c) => liked ? c - 1 : c + 1); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer", padding: "0.625rem", borderRadius: "var(--radius-md)", color: liked ? "var(--color-error)" : "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                    Thích
                  </button>
                  <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer", padding: "0.625rem", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    Bình luận
                  </button>
                  <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer", padding: "0.625rem", borderRadius: "var(--radius-md)", color: "var(--color-text-muted)", fontWeight: 600, fontSize: "0.875rem" }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    Chia sẻ
                  </button>
                </div>
              </article>

              {/* ── Comments ── */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-xl)", border: "1px solid var(--color-border)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
                  💬 Bình luận ({comments.length})
                </h2>

                {/* Add Comment */}
                <div style={{ display: "flex", gap: "0.875rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: "white", flexShrink: 0 }}>U</div>
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Viết bình luận của bạn..."
                      rows={2}
                      style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", border: "1.5px solid var(--color-border)", background: "var(--color-surface-2)", fontSize: "0.9rem", color: "var(--color-text-primary)", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                      <button onClick={handleAddComment} disabled={!comment.trim()} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", opacity: comment.trim() ? 1 : 0.5 }}>
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comment List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
                </div>

                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                  <button className="btn btn-outline" style={{ padding: "0.5rem 1.5rem", fontSize: "0.875rem" }}>Xem thêm bình luận</button>
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: "sticky", top: "5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Author */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Về tác giả</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
                  <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", background: POST.authorColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.125rem", fontWeight: 700, color: "white" }}>{POST.author.charAt(0)}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{POST.author}</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>21.3K người theo dõi</p>
                  </div>
                </div>
                <Link href={`/kenh/${POST.username.replace("@", "")}`} className="btn btn-outline" style={{ width: "100%", textDecoration: "none", justifyContent: "center", padding: "0.5rem", display: "flex", fontSize: "0.875rem" }}>Xem kênh</Link>
              </div>

              {/* Related Posts */}
              <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", padding: "1.25rem", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>Bài viết liên quan</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  {RELATED_POSTS.map((p) => (
                    <Link key={p.id} href={`/cong-dong/${p.id}`} style={{ display: "flex", gap: "0.75rem", textDecoration: "none" }}>
                      <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--radius-md)", background: p.emojiColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{p.emoji}</div>
                      <div>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", fontWeight: 500, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.title}</p>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{p.author}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .container > div { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
      `}</style>
    </>
  );
}
