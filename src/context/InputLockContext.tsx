import { createContext, useContext, useEffect, useState } from "react";

interface InputStatusResponse {
  is_open: boolean;
  message: string;
}

interface InputLockContextType {
  isOpen: boolean;
  message: string;
  loading: boolean;
}

const InputLockContext = createContext<InputLockContextType | null>(null);

interface InputLockProviderProps {
  children: any; 
}

export function InputLockProvider(props: InputLockProviderProps) {
  const { children } = props;

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/input-status", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => res.json() as Promise<InputStatusResponse>)
      .then((data) => {
        setIsOpen(data.is_open);
        setMessage(data.message);
      })
      .catch(() => {
        setIsOpen(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <InputLockContext.Provider value={{ isOpen, message, loading }}>
      {children}
    </InputLockContext.Provider>
  );
}

export function useInputLock(): InputLockContextType {
  const ctx = useContext(InputLockContext);
  if (!ctx) {
    throw new Error("useInputLock harus dipakai di dalam InputLockProvider");
  }
  return ctx;
}
