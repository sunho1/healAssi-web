import React from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * AuthLayout Component
 * - 로그인, 회원가입 등 인증 관련 페이지의 레이아웃
 * - 헤더와 폼 컨테이너를 관리
 * - 애니메이션 포함
 */
export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-center px-6 py-12">
      <motion.div
        className="max-w-md mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 헤더 */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            HealAssi
          </h1>
          <p className="text-slate-500 font-medium">
            AI와 함께하는 건강한 습관
          </p>
        </div>

        {/* 페이지 제목 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{title}</h2>
          {subtitle && <p className="text-slate-600 text-sm">{subtitle}</p>}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
