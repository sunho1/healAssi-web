import React, { createContext, useContext, useState } from "react";

export type PersonaType = "friendly" | "bestie" | "strict";

interface AIContextType {
  persona: PersonaType;
  setPersona: (p: PersonaType) => void;
  isRescheduleModalOpen: boolean;
  openRescheduleModal: () => void;
  closeRescheduleModal: () => void;
  nudgeMessage: string | null;
  triggerNudge: (msg: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: React.ReactNode }) => {
  const [persona, setPersona] = useState<PersonaType>("friendly");
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  const triggerNudge = (msg: string) => {
    setNudgeMessage(msg);
    setTimeout(() => setNudgeMessage(null), 3000); // 3초 후 사라짐
  };

  return (
    <AIContext.Provider
      value={{
        persona,
        setPersona,
        isRescheduleModalOpen,
        openRescheduleModal: () => setIsRescheduleModalOpen(true),
        closeRescheduleModal: () => setIsRescheduleModalOpen(false),
        nudgeMessage,
        triggerNudge,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within an AIProvider");
  return context;
};