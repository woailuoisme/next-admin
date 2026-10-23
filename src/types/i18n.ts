import type en from "@/messages/en.json";

/** 消息文件的一级命名空间 */
export type MessageNamespace = keyof typeof en;

/** 某个命名空间下的合法键（与 next-intl 的类型增强同源，用于内部映射表与工具函数签名） */
export type MessageKeyOf<N extends MessageNamespace> = keyof (typeof en)[N] & string;
