import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Button, Input, Alert } from "../common";
import { authService } from "../../services/api";

interface SignupFormProps {
  onSuccess: () => void;
}

/**
 * SignupForm Component
 * - 회원가입 폼을 담당하는 재사용 가능한 컴포넌트
 * - 이메일, 이름, 비밀번호 입력 및 검증
 * - 비밀번호 일치 확인
 */
export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
  }>({});

  /**
   * 회원가입 폼 제출
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // 유효성 검사
    if (password !== confirmPassword) {
      setValidationErrors({ password: "비밀번호가 일치하지 않습니다." });
      return;
    }

    if (password.length < 8) {
      setValidationErrors({ password: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }

    setLoading(true);

    try {
      await authService.signup(email, username, password);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.detail || "회원가입에 실패했습니다.");
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

      {/* 사용자 이름 입력 */}
      <Input
        type="text"
        label="사용자 이름"
        placeholder="John Doe"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        icon={User}
        required
      />

      {/* 비밀번호 입력 */}
      <Input
        type="password"
        label="비밀번호"
        placeholder="최소 8자 이상"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
        required
        error={validationErrors.password}
      />

      {/* 비밀번호 확인 입력 */}
      <Input
        type="password"
        label="비밀번호 확인"
        placeholder="비밀번호를 다시 입력하세요"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        icon={Lock}
        required
      />

      {/* 회원가입 버튼 */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
        className="mt-8"
      >
        회원가입
      </Button>
    </form>
  );
}
