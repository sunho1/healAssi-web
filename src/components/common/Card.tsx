import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated";
}

/**
 * Card Component
 * - 재사용 가능한 카드/박스 컴포넌트
 * - variant: 카드 스타일 (default, elevated)
 * - 배경, 테두리, 그림자 등을 통일적으로 관리
 */
export default function Card({
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const variantClasses = {
    default: "bg-white border border-slate-100 shadow-lg",
    elevated: "bg-white border border-slate-100 shadow-2xl",
  };

  return (
    <div
      className={`
        rounded-3xl p-8
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
