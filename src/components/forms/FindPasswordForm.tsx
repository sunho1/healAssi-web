import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Button, Input, Alert } from "../common";
import { authService } from "../../services/api";

interface FindPasswordFormProps {
  onSuccess: () => void;
}

/**
 * FindPasswordForm Component
 * - 비밀번호 찾기 폼을 담당하는 재사용 가능한 컴포넌트
 * - 이메일로 비밀번호 재설정 토큰 요청
 * - 메일 전송 후 성공 콜백
 */
export default function FindPasswordForm({ onSuccess }: FindPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 비밀번호 찾기 요청
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.findPassword(email);
      onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.detail ||
          "요청 처리 중 오류가 발생했습니다."
      );
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

      {/* 전송 버튼 */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
        className="mt-8"
      >
        재설정 링크 받기
      </Button>
    </form>
  );
}
