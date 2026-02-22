import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AlertProps {
  type?: "error" | "success" | "info" | "warning";
  message: string;
  className?: string;
  onClose?: () => void;
}

/**
 * Alert Component
 * - 재사용 가능한 알림 컴포넌트
 * - type: 알림 타입 (error, success, info, warning)
 * - message: 표시할 메시지
 * - onClose: 닫기 콜백
 */
export default function Alert({
  type = "info",
  message,
  className = "",
  onClose,
}: AlertProps) {
  const alertConfig = {
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      icon: AlertCircle,
    },
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      icon: CheckCircle,
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      icon: InfoIcon,
    },
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-600",
      icon: AlertTriangle,
    },
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        flex items-center gap-3
        ${config.bgColor} border ${config.borderColor}
        rounded-xl p-4
        ${className}
      `}
    >
      <Icon size={20} className={config.textColor} />
      <p className={`text-sm font-medium ${config.textColor}`}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-auto text-sm font-bold ${config.textColor} hover:opacity-70 transition`}
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}
