"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { SidebarUser } from "./sidebar/types";

export interface LayoutAuthContextValue {
	user?: SidebarUser | null;
	onLogout?: () => void;
	isLoggingOut?: boolean;
}

const LayoutAuthContext = createContext<LayoutAuthContextValue>({});

export interface LayoutAuthProviderProps extends LayoutAuthContextValue {
	children: ReactNode;
}

export function LayoutAuthProvider({ user, onLogout, isLoggingOut, children }: LayoutAuthProviderProps) {
	return <LayoutAuthContext value={{ user, onLogout, isLoggingOut }}>{children}</LayoutAuthContext>;
}

export function useLayoutAuth(): LayoutAuthContextValue {
	return useContext(LayoutAuthContext);
}
