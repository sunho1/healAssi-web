import React, { useState } from "react";
import { Mail, User } from "lucide-react";
import { Button, Input, Alert } from "../common";
import { authService } from "../../services/api";

interface FindIdFormProps {
  onSuccess: (maskedEmail: string) => void;
}

/**
 * FindIdForm Component
 * - 아이디(이메일) 찾기 폼을 담당하는 재사용 가능한 컴포넌트
 * - 사용자 이름과 이메일로 등록된 아이디 조회
 * - 마스킹된 이메일을 반환
 */
export default function FindIdForm({ onSuccess }: FindIdFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 아이디 찾기 폼 제출
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.findId(username, email);
      onSuccess(res.data.email);
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.detail ||
          "일치하는 사용자를 찾을 수 없습니다."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 에러 메시지 */}
      {error && <Alert type="error" message={error} />}

      {/* 사용자 이름 입력 */}
      <Input
        type="text"
        label="사용자 이름"
        placeholder="가입할 때 등록한 이름"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        icon={User}
        required
      />

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

      {/* 찾기 버튼 */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
        className="mt-8"
      >
        아이디 찾기
      </Button>
    </form>
  );
}
