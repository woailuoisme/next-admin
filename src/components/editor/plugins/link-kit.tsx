"use client";

import { LinkRules } from "@platejs/link";
import { LinkPlugin } from "@platejs/link/react";

import { sanitizeRichEditorUrl } from "@/components/shared/url";
import { LinkElement } from "@/components/ui/link-node";
import { LinkFloatingToolbar } from "@/components/ui/link-toolbar";

export const LinkKit = [
  LinkPlugin.configure({
    // 迁移至 Plate 后仍需协议白名单，否则可插入 javascript: 链接
    options: { isUrl: (text) => sanitizeRichEditorUrl(text) !== null },
    inputRules: [
      LinkRules.markdown(),
      LinkRules.autolink({ variant: "paste" }),
      LinkRules.autolink({ variant: "space" }),
      LinkRules.autolink({ variant: "break" }),
    ],
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
];
