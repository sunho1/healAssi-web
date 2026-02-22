import { useNavigate } from "react-router-dom";
import { AuthLayout, AuthFormFooter } from "../components/layout";
import { LoginForm } from "../components/forms";

/**
 * LoginPage Component
 * - 로그인 페이지 (Page 컴포넌트)
 * - 레이아웃과 폼 컴포넌트를 조합
 * - 실제 로그인 로직은 LoginForm에서 담당
 */
export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <AuthLayout title="로그인" subtitle="계정으로 로그인하세요.">
      {/* 로그인 폼 */}
      <LoginForm onSuccess={handleLoginSuccess} />

      {/* 추가 버튼들 */}
      <AuthFormFooter
        secondaryButtons={[
          {
            label: "회원가입",
            action: () => navigate("/signup"),
            variant: "full",
          },
          {
            label: "아이디 찾기",
            action: () => navigate("/find-id"),
            variant: "half",
          },
          {
            label: "비밀번호 찾기",
            action: () => navigate("/find-password"),
            variant: "half",
          },
        ]}
      />

      {/* 테스트 계정 안내 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-700 font-medium text-center">
          테스트 계정: test@example.com / password123
        </p>
      </div>
    </AuthLayout>
  );
}