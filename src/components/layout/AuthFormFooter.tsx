import { Button } from "../common";

interface AuthFormFooterProps {
  secondaryButtons?: Array<{
    label: string;
    action: () => void;
    variant?: "full" | "half";
  }>;
}

/**
 * AuthFormFooter Component
 * - 인증 폼 하단에 추가 버튼들을 표시하는 컴포넌트
 * - full: 전체 너비 버튼 (회원가입 등)
 * - half: 절반 너비 버튼 (아이디 찾기, 비밀번호 찾기) → 같은 행에 2개씩 배치
 */
export default function AuthFormFooter({
  secondaryButtons = [],
}: AuthFormFooterProps) {
  const fullButtons = secondaryButtons.filter((btn) => btn.variant !== "half");
  const halfButtons = secondaryButtons.filter((btn) => btn.variant === "half");

  if (secondaryButtons.length === 0) return null;

  return (
    <>
      {/* 구분선 */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">또는</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="space-y-3">
        {/* 전체 너비 버튼 */}
        {fullButtons.map((btn, idx) => (
          <Button
            key={idx}
            variant="secondary"
            size="md"
            fullWidth
            onClick={btn.action}
          >
            {btn.label}
          </Button>
        ))}

        {/* 절반 너비 버튼들 - 한 행에 나란히 배치 */}
        {halfButtons.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {halfButtons.map((btn, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="md"
                fullWidth
                onClick={btn.action}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
