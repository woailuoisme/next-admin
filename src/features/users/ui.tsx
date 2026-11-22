"use client";

import { defineResourceUI } from "@/components/resource";

import { customerResource } from "./resource";
import { customerTableConfig } from "./table";

export const customerUI = defineResourceUI(customerResource, {
	table: customerTableConfig,
});

export const UsersListView = customerUI.ListView;
