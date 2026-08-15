"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    if (resolver.current) resolver.current(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver.current) resolver.current(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          animation: "fadeIn 0.2s ease-out"
        }}>
          <div style={{
            background: "var(--color-surface, #fff)",
            padding: "1.5rem",
            borderRadius: "var(--radius-xl, 24px)",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--color-border)",
            animation: "slideUp 0.2s ease-out"
          }}>
            <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              {options.title}
            </h3>
            {options.description && (
              <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.5 }}>
                {options.description}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button 
                onClick={handleCancel}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "var(--radius-full, 9999px)",
                  border: "2px solid var(--color-border)",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: "var(--color-text-secondary)",
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--color-surface-2)"}
                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
              >
                {options.cancelText || "Hủy"}
              </button>
              <button 
                onClick={handleConfirm}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "var(--radius-full, 9999px)",
                  border: "none",
                  background: options.danger ? "var(--color-error)" : "var(--gradient-primary)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  transition: "all 0.15s ease",
                  boxShadow: options.danger ? "0 4px 12px rgba(192, 57, 43, 0.3)" : "0 4px 12px rgba(45, 106, 79, 0.3)"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                {options.confirmText || "Đồng ý"}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(16px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}
