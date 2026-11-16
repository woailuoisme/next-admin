"use client";

import { useTranslations } from "next-intl";
import { useMemoizedFn } from "ahooks";
import { AlertCircle, Check, Code2, Sparkles } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { KeyValueRawFormat, KeyValueRowItem } from "./types";

import { convertRawFormat, formatJsonText, rawToRows, rowsToRaw } from "./parsers";

interface KeyValueRawEditorProps {
  rows: KeyValueRowItem[];
  defaultFormat?: KeyValueRawFormat;
  disabled?: boolean;
  onChange: (rows: KeyValueRowItem[]) => void;
  onClose: () => void;
}

export const KeyValueRawEditor = memo(function KeyValueRawEditor({
  rows,
  defaultFormat = "json",
  disabled,
  onChange,
  onClose,
}: KeyValueRawEditorProps) {
  const t = useTranslations("form");
  const [format, setFormat] = useState<KeyValueRawFormat>(defaultFormat);
  const [text, setText] = useState<string>(() => rowsToRaw(rows, defaultFormat));
  const [error, setError] = useState<string | null>(null);
  const isInternalTextChangeRef = useRef(false);
  const prevRowsRef = useRef(rows);

  const handleFormatChange = useMemoizedFn((nextFormat: KeyValueRawFormat) => {
    if (nextFormat === format) return;
    const { text: nextText, error: convertErr } = convertRawFormat(text, format, nextFormat);
    if (convertErr || nextText === undefined) {
      setError(t("keyvalue_raw_fix_syntax", { format: format.toUpperCase() }));
      return;
    }
    setFormat(nextFormat);
    setText(nextText);
    setError(null);
  });

  const handleSelectJson = useMemoizedFn(() => {
    handleFormatChange("json");
  });

  const handleSelectEnv = useMemoizedFn(() => {
    handleFormatChange("env");
  });

  const handleTextChange = useMemoizedFn((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    const { rows: parsedRows, error: parseErr } = rawToRows(val, format);
    if (parseErr) {
      setError(parseErr);
    } else {
      setError(null);
      isInternalTextChangeRef.current = true;
      onChange(parsedRows);
    }
  });

  const handleFormatJson = useMemoizedFn(() => {
    if (format !== "json") return;
    const { formatted, error: fmtErr } = formatJsonText(text);
    if (fmtErr || formatted === undefined) {
      setError(fmtErr || t("keyvalue_raw_invalid_json"));
      return;
    }
    setText(formatted);
    setError(null);
  });

  const handleApplyAndClose = useMemoizedFn(() => {
    const { rows: parsedRows, error: parseErr } = rawToRows(text, format);
    if (parseErr) {
      setError(parseErr);
      return;
    }
    onChange(parsedRows);
    onClose();
  });

  // 仅当外部真正产生变更时同步文本，避免本地输入或切换格式时覆盖编辑器文本
  useEffect(() => {
    if (prevRowsRef.current === rows) return;
    prevRowsRef.current = rows;
    if (isInternalTextChangeRef.current) {
      isInternalTextChangeRef.current = false;
      return;
    }
    setText(rowsToRaw(rows, format));
  }, [rows, format]);

  return (
    <div className="border-border/80 bg-card/60 space-y-2 rounded-lg border p-3 shadow-2xs">
      <div className="border-border/40 flex items-center justify-between gap-2 border-b pb-2">
        <div className="flex items-center gap-1.5">
          <Code2 className="text-primary size-3.5" />
          <span className="text-foreground text-xs font-semibold">{t("keyvalue_raw_title")}</span>
          <div className="ml-2 flex items-center gap-1">
            <Button
              type="button"
              variant={format === "json" ? "secondary" : "ghost"}
              size="xs"
              onClick={handleSelectJson}
              className="h-6 px-2 text-[11px]"
            >
              JSON
            </Button>
            <Button
              type="button"
              variant={format === "env" ? "secondary" : "ghost"}
              size="xs"
              onClick={handleSelectEnv}
              className="h-6 px-2 text-[11px]"
            >
              {t("keyvalue_raw_env_tab")}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {format === "json" ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleFormatJson}
              className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
              title={t("keyvalue_raw_format_json")}
            >
              <Sparkles className="size-3" />
              <span>{t("keyvalue_raw_format_action")}</span>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleApplyAndClose}
            className="h-6 gap-1 text-[11px]"
          >
            <Check className="size-3" />
            <span>{t("keyvalue_raw_done")}</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={handleTextChange}
          disabled={disabled}
          rows={8}
          placeholder={
            format === "json"
              ? '{\n  "API_URL": "https://api.example.com",\n  "TIMEOUT": "5000"\n}'
              : "API_URL=https://api.example.com\nTIMEOUT=5000"
          }
          className="font-mono text-xs leading-relaxed"
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      ) : (
        <p className="text-muted-foreground text-[11px]">
          {format === "json" ? t("keyvalue_raw_json_hint") : t("keyvalue_raw_env_hint")}
        </p>
      )}
    </div>
  );
});
KeyValueRawEditor.displayName = "KeyValueRawEditor";
