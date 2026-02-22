import React from "react";
import type { LucideIcon } from "lucide-react";

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: LucideIcon;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Input Component
 * - 재사용 가능한 입력 필드 컴포넌트
 * - icon: lucide-react 아이콘 컴포넌트
 * - label: 입력 필드 레이블
 * - error: 에러 메시지
 * - required: 필수 입력 표시
 */
export default function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  icon: Icon,
  label = "",
  required = false,
  disabled = false,
  className = "",
}: InputProps) {
  return (
    <div className={className}>
      {/* 레이블 */}
      {label && (
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {/* 입력 필드 */}
      <div className="relative">
        {/* 아이콘 */}
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        {/* 입력창 */}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full bg-slate-50 border transition-all focus:outline-none focus:ring-2 rounded-xl px-4 py-3 text-slate-900 font-medium placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? "pl-11" : ""
          } ${
            error
              ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
              : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
          }`}
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-red-600 text-sm font-medium mt-2 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
