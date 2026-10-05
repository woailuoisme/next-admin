"use client";

import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Aesthetic subtle background gradients */}
      <div className="bg-primary/10 pointer-events-none absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-primary/5 pointer-events-none absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full blur-3xl" />

      <div className="relative z-10 flex w-full flex-col items-center">
        <LoginForm />
      </div>
    </div>
  );
}
