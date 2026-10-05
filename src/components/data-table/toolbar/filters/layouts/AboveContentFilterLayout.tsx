import React from "react";

export interface AboveContentFilterLayoutProps {
  children: React.ReactNode;
}

export const AboveContentFilterLayout: React.FC<AboveContentFilterLayoutProps> = ({ children }) => {
  return <div className="border-border/60 bg-card rounded-xl border p-4 shadow-xs">{children}</div>;
};
