"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

interface ReasonModalProps {
  title: string;
  description: string;
  placeholder?: string;
  minLength?: number;
  confirmLabel?: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function ReasonModal({
  title,
  description,
  placeholder,
  minLength = 10,
  confirmLabel = "Xác nhận",
  busy,
  onClose,
  onConfirm,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const tooShort = reason.trim().length < minLength;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "480px", padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem" }}>{title}</h3>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
          {description}
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          autoFocus
          placeholder={placeholder}
          style={{
            width: "100%", padding: "0.75rem", borderRadius: "var(--radius-md)",
            border: "1.5px solid var(--color-border)", fontSize: "0.9rem",
            fontFamily: "inherit", resize: "vertical", outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
          <button className="btn btn-outline" onClick={onClose} disabled={busy}>Hủy</button>
          <button
            className="btn btn-primary"
            onClick={() => onConfirm(reason.trim())}
            disabled={busy || tooShort}
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <X size={16} />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
