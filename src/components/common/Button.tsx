import React from "react";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * Button Component
 * - 재사용 가능한 버튼 컴포넌트
 * - variant: 버튼 스타일 (primary, secondary, danger, ghost)
 * - size: 버튼 크기 (sm, md, lg)
 * - fullWidth: 전체 너비 사용 여부
 * - loading: 로딩 상태
 */
export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  onClick,
  className = "",
}: ButtonProps) {
  // 버튼 크기별 클래스
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // 버튼 스타일별 클래스
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  const baseClasses =
    "font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses.trim()}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      <span>{children}</span>
    </button>
  );
}
