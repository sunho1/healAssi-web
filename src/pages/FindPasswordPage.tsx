import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "../components/layout";
import { FindPasswordForm } from "../components/forms";
import { Button } from "../components/common";

/**
 * FindPasswordPage Component
 * - 비밀번호 찾기 페이지 (Page 컴포넌트)
 * - 뒤로가기 버튼과 FindPasswordForm을 조합
 * - 성공 시 확인 메시지 표시 후 로그인으로 이동
 */
export default function FindPasswordPage() {
  const navigate = useNavigate();

  const handleFindPasswordSuccess = () => {
    // 비밀번호 재설정 요청 성공 후 2초 뒤 로그인 페이지로 이동
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <AuthLayout title="비밀번호 찾기" subtitle="계정 복구를 위해 이메일을 입력해주세요.">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6 -mx-8 -mt-8 px-8 pt-6 pb-4 border-b border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/login")}
          className="gap-2 p-0"
        >
          <ArrowLeft size={20} />
          <span>로그인으로 돌아가기</span>
        </Button>
      </div>

      {/* 비밀번호 찾기 폼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <FindPasswordForm onSuccess={handleFindPasswordSuccess} />
      </motion.div>
    </AuthLayout>
  );
}
