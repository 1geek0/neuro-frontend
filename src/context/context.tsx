
"use client"
import { createContext, useContext, useState, } from "react";

interface DemoContext {
  demo: boolean;
  setDemo: (demo: boolean) => void;
}

const demoContext = createContext<DemoContext | undefined>(undefined);

export const useDemoContext = () : DemoContext => {
  const context = useContext(demoContext);
  if (context === undefined) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}

interface DemoProviderProps {
  children: React.ReactNode;
}

export const DemoProvider = ({ children }: DemoProviderProps) => {
  const [demo, setDemo] = useState<boolean>(false);

  return (
    <demoContext.Provider value={{ demo, setDemo }}>
      {children}
    </demoContext.Provider>
  )
}
