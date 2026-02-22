import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Button, Input, Alert } from "../common";
import { authService } from "../../services/api";

interface LoginFormProps {
  onSuccess: () => void;
}

/**
 * LoginForm Component
 * - 로그인 폼을 담당하는 재사용 가능한 컴포넌트
 * - 페이지와 폼을 분리하여 재사용성 향상
 * - 로그인 로직과 UI를 한곳에서 관리
 */
export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 로그인 폼 제출
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(email, password);

      if (res.data) {
        // 토큰과 사용자 정보를 localStorage에 저장
        localStorage.setItem("accessToken", res.data.access_token);
        localStorage.setItem("refreshToken", res.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        onSuccess();
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.detail || "로그인에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 에러 메시지 */}
      {error && <Alert type="error" message={error} />}

      {/* 이메일 입력 */}
      <Input
        type="email"
        label="이메일"
        placeholder="user@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        required
      />

      {/* 비밀번호 입력 */}
      <Input
        type="password"
        label="비밀번호"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
        required
      />

      {/* 로그인 버튼 */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
        className="mt-8"
      >
        로그인
      </Button>
    </form>
  );
}
