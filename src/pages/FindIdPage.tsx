import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { AuthLayout } from "../components/layout";
import { FindIdForm } from "../components/forms";
import { Button } from "../components/common";

/**
 * FindIdPage Component
 * - ID 찾기 페이지 (Page 컴포넌트)
 * - 뒤로가기 버튼과 FindIdForm을 조합
 * - 성공 시 결과를 표시한 후 로그인으로 이동
 */
export default function FindIdPage() {
  const navigate = useNavigate();

  const handleFindIdSuccess = () => {
    // ID 찾기 성공 후 2초 뒤 로그인 페이지로 이동
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <AuthLayout title="아이디 찾기" subtitle="이름과 이메일로 아이디를 찾으세요.">
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

      {/* 아이디 찾기 폼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <FindIdForm onSuccess={handleFindIdSuccess} />
      </motion.div>
    </AuthLayout>
  );
}
