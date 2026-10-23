"use client";

import { LoginForm } from "../components/LoginForm";

export function LoginPage({ initialEmail }: { initialEmail?: string }) {
  return <LoginForm initialEmail={initialEmail} />;
}
