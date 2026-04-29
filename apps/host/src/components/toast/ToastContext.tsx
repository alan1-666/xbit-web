import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";

interface Toast {
  id: number;
  message: string;
}

interface ToastContextType {
  addToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 提供外部可以访问的 ToastService
export const toastService = {
  addToast: (message: string) => {},
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = (message: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current); 
    }

    const id = Date.now();
    setToast({ id, message });

    timerRef.current = setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, 1500);
  };

  useEffect(() => {
    toastService.addToast = addToast;
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toast && (
        <div className="fixed top-[50%] left-[50%] flex justify-center items-center max-w-[90%] w-full translate-x-[-50%] translate-y-[-50%] z-[99]">
          <div className="inline-block">
            <div className="bg-[#27272A] flex items-center text-[#fff] p-3 rounded-[8px] animate-fade-in-out">
              <img className="mr-2" src="/images/toast/info-icon.svg" alt="info" />
              <div className="text-[calc(1rem*(16/16))]">{toast.message}</div>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
