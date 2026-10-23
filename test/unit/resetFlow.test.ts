import { beforeEach, describe, expect, it } from "vitest";

import {
  clearResetFlow,
  hasStoredResetFlow,
  hasUsableResetToken,
  patchResetFlow,
  readResetFlow,
  saveResetFlow,
} from "@/features/auth/resetFlow";

const FUTURE = () => Date.now() + 60_000;
const PAST = () => Date.now() - 1_000;

describe("auth reset flow storage", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("saves and reads a valid flow", () => {
    saveResetFlow({ ticket: "t-1", email: "a@example.com", expiresAt: FUTURE() });

    const state = readResetFlow();
    expect(state?.ticket).toBe("t-1");
    expect(state?.email).toBe("a@example.com");
  });

  it("drops an expired flow and clears storage", () => {
    saveResetFlow({ ticket: "t-2", email: "a@example.com", expiresAt: PAST() });

    expect(readResetFlow()).toBeNull();
    expect(window.sessionStorage.getItem("auth:reset-flow")).toBeNull();
  });

  it("drops malformed payloads", () => {
    window.sessionStorage.setItem("auth:reset-flow", "{not-json");

    expect(readResetFlow()).toBeNull();
    expect(window.sessionStorage.getItem("auth:reset-flow")).toBeNull();
  });

  it("patches the reset token onto an existing flow", () => {
    saveResetFlow({ ticket: "t-3", email: "a@example.com", expiresAt: FUTURE() });

    const patched = patchResetFlow({ resetToken: "r-3", resetExpiresAt: FUTURE() });

    expect(patched?.resetToken).toBe("r-3");
    expect(readResetFlow()?.resetToken).toBe("r-3");
  });

  it("ignores patches when there is no flow", () => {
    expect(patchResetFlow({ resetToken: "r-x" })).toBeNull();
  });

  it("reports whether anything was stored before cleanup", () => {
    expect(hasStoredResetFlow()).toBe(false);

    saveResetFlow({ ticket: "t-6", email: "a@example.com", expiresAt: PAST() });
    expect(hasStoredResetFlow()).toBe(true);

    readResetFlow();
    expect(hasStoredResetFlow()).toBe(false);
  });

  it("clears the flow", () => {
    saveResetFlow({ ticket: "t-4", email: "a@example.com", expiresAt: FUTURE() });
    clearResetFlow();

    expect(readResetFlow()).toBeNull();
  });

  it("only treats a present, unexpired token as usable", () => {
    const base = { ticket: "t-5", email: "a@example.com", expiresAt: FUTURE() };

    expect(hasUsableResetToken(base)).toBe(false);
    expect(hasUsableResetToken({ ...base, resetToken: "r-5", resetExpiresAt: FUTURE() })).toBe(true);
    expect(hasUsableResetToken({ ...base, resetToken: "r-5", resetExpiresAt: PAST() })).toBe(false);
  });
});
