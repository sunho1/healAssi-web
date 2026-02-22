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
 * - 회원가입, 아이디 찾기, 비밀번호 찾기 등의 버튼 배치
 * - 재사용 가능한 레이아웃 컴포넌트
 */
export default function AuthFormFooter({
  secondaryButtons = [],
}: AuthFormFooterProps) {
  return (
    <>
      {/* 구분선 */}
      {secondaryButtons.length > 0 && (
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">또는</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
      )}

      {/* 보조 버튼들 */}
      {secondaryButtons.length > 0 && (
        <div className="space-y-3">
          {secondaryButtons.map((btn, idx) => (
            <div key={idx} className={btn.variant === "half" ? "grid grid-cols-2 gap-3" : ""}>
              <Button
                variant="secondary"
                size="md"
                fullWidth={btn.variant === "full"}
                onClick={btn.action}
                className={btn.variant === "half" ? "col-span-1" : ""}
              >
                {btn.label}
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
