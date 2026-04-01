import type React from "react";
import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context)
    throw new Error("useLoading must be used within LoadingProvider");
  return context;
}

function LoadingProvider({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading: setIsLoading }}>
      <ProgressLoading isLoading={isLoading} className={className} />
      {children}
    </LoadingContext.Provider>
  );
}

function ProgressLoading({
  isLoading,
  className,
}: {
  isLoading: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed w-full z-999999999999999",
        isLoading ? "visible" : "invisible",
      )}
    >
      <div className={`relative w-full h-1.25 overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-primary animate-[slide_2s_ease-in-out_infinite_alternate]" />
        <style>{`
            @keyframes slide {
              0% {
                transform: translateX(-80%);
              }
              100% {
                transform: translateX(80%);
              }
            }
          `}</style>
      </div>
    </div>
  );
}

export default LoadingProvider;
