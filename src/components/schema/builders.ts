import type {
  SchemaCustomSpec,
  SchemaEntrySpec,
  SchemaEntryType,
  SchemaFieldSpec,
  SchemaFieldType,
  SchemaFieldsetSpec,
  SchemaGridSpec,
  SchemaSectionSpec,
  SchemaTabsSpec,
} from "./types";

function field<TValues = Record<string, any>, TType extends SchemaFieldType = SchemaFieldType>(
  type: TType,
  name: string,
  opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">,
): SchemaFieldSpec<TValues> {
  return { ...opts, type, name };
}

function entry<TValues = Record<string, any>, TType extends SchemaEntryType = SchemaEntryType>(
  entryType: TType,
  name?: string,
  opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
): SchemaEntrySpec<TValues> {
  return { ...opts, kind: "entry", entryType, name };
}

/**
 * Filament v5 统一声明式 Schema 构建器命名空间（`s.*`）：
 * 统一覆盖容器、表单全系列字段与只读详情条目（`s.entry.*`）。
 */
export const s = {
  section: <TValues = Record<string, any>>(
    config: Omit<SchemaSectionSpec<TValues>, "type">,
  ): SchemaSectionSpec<TValues> => ({ ...config, type: "section" }),

  grid: <TValues = Record<string, any>>(config: Omit<SchemaGridSpec<TValues>, "type">): SchemaGridSpec<TValues> => ({
    ...config,
    type: "grid",
  }),

  tabs: <TValues = Record<string, any>>(config: Omit<SchemaTabsSpec<TValues>, "type">): SchemaTabsSpec<TValues> => ({
    ...config,
    type: "tabs",
  }),

  fieldset: <TValues = Record<string, any>>(
    config: Omit<SchemaFieldsetSpec<TValues>, "type">,
  ): SchemaFieldsetSpec<TValues> => ({ ...config, type: "fieldset" }),

  custom: <TValues = Record<string, any>>(
    config: Omit<SchemaCustomSpec<TValues>, "type">,
  ): SchemaCustomSpec<TValues> => ({ ...config, type: "custom" }),

  text: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("text", name, opts),

  textarea: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("textarea", name, opts),

  password: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("password", name, opts),

  number: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("number", name, opts),

  slider: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("slider", name, opts),

  select: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("select", name, opts),

  switch: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("switch", name, opts),

  checkbox: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("checkbox", name, opts),

  checkboxGroup: <TValues = Record<string, any>>(
    name: string,
    opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">,
  ) => field("checkboxGroup", name, opts),

  date: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("date", name, opts),

  dateRange: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("dateRange", name, opts),

  time: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("time", name, opts),

  combobox: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("combobox", name, opts),

  radio: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("radio", name, opts),

  toggleButtons: <TValues = Record<string, any>>(
    name: string,
    opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">,
  ) => field("toggleButtons", name, opts),

  rating: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("rating", name, opts),

  tags: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("tags", name, opts),

  masked: <TValues = Record<string, any>>(
    name: string,
    opts: Omit<SchemaFieldSpec<TValues>, "type" | "name"> & { mask: string },
  ) => field("masked", name, opts),

  currency: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("currency", name, opts),

  otp: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("otp", name, opts),

  color: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("color", name, opts),

  file: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("file", name, opts),

  richEditor: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("richEditor", name, opts),

  cascader: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("cascader", name, opts),

  treeSelect: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("treeSelect", name, opts),

  keyValue: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("keyValue", name, opts),

  repeater: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("repeater", name, opts),

  location: <TValues = Record<string, any>>(name: string, opts?: Omit<SchemaFieldSpec<TValues>, "type" | "name">) =>
    field("location", name, opts),

  entry: {
    text: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("text", name, opts),

    badge: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("badge", name, opts),

    date: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("date", name, opts),

    currency: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("currency", name, opts),

    number: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("number", name, opts),

    icon: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("icon", name, opts),

    image: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("image", name, opts),

    color: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("color", name, opts),

    keyValue: <TValues = Record<string, any>>(
      name: string,
      opts?: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType" | "name">,
    ) => entry("keyValue", name, opts),

    callout: <TValues = Record<string, any>>(opts: Omit<SchemaEntrySpec<TValues>, "kind" | "entryType">) =>
      entry("callout", opts.name, opts),
  },
} as const;
