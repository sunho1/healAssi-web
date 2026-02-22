import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "../components/layout";
import { SignupForm } from "../components/forms";
import { Button } from "../components/common";

/**
 * SignupPage Component
 * - 회원가입 페이지 (Page 컴포넌트)
 * - 뒤로가기 버튼과 SignupForm을 조합
 * - 성공 시 로그인 페이지로 이동
 */
export default function SignupPage() {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    // 회원가입 성공 후 성공 메시지 표시 및 로그인 페이지로 이동
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <AuthLayout title="회원가입" subtitle="새 계정을 만드세요.">
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

      {/* 회원가입 폼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <SignupForm onSuccess={handleSignupSuccess} />
      </motion.div>
    </AuthLayout>
  );
}
