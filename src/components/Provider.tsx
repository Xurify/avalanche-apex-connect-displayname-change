"use client";

import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

const Provider = ({ children }: Props) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class">
      {children}
    </ThemeProvider>
  );
};

export default Provider;
