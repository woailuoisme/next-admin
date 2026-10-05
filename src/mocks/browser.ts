import { handlers } from "./handlers";

export async function getWorker() {
  if (typeof window === "undefined") {
    return null;
  }
  const { setupWorker } = await import("msw/browser");
  return setupWorker(...handlers);
}
