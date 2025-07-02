import { createContext, useContext, useState, ReactNode } from 'react';

interface ExitIntentContextType {
  showExitIntent: boolean;
  hasShownExitIntent: boolean;
  triggerExitIntent: () => void;
  closeExitIntent: () => void;
  proceedWithLogout: () => void;
  setPendingLogout: (callback: () => void) => void;
}

const ExitIntentContext = createContext<ExitIntentContextType | undefined>(undefined);

interface ExitIntentProviderProps {
  children: ReactNode;
}

export function ExitIntentProvider({ children }: ExitIntentProviderProps) {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasShownExitIntent, setHasShownExitIntent] = useState(false);
  const [pendingLogoutCallback, setPendingLogoutCallback] = useState<(() => void) | null>(null);

  const triggerExitIntent = () => {
    if (!hasShownExitIntent) {
      setShowExitIntent(true);
      setHasShownExitIntent(true);
    }
  };

  const closeExitIntent = () => {
    setShowExitIntent(false);
    setPendingLogoutCallback(null);
  };

  const proceedWithLogout = () => {
    setShowExitIntent(false);
    if (pendingLogoutCallback) {
      pendingLogoutCallback();
      setPendingLogoutCallback(null);
    }
  };

  const setPendingLogout = (callback: () => void) => {
    setPendingLogoutCallback(() => callback);
  };

  return (
    <ExitIntentContext.Provider value={{
      showExitIntent,
      hasShownExitIntent,
      triggerExitIntent,
      closeExitIntent,
      proceedWithLogout,
      setPendingLogout
    }}>
      {children}
    </ExitIntentContext.Provider>
  );
}

export function useExitIntent() {
  const context = useContext(ExitIntentContext);
  if (context === undefined) {
    throw new Error('useExitIntent must be used within an ExitIntentProvider');
  }
  return context;
}