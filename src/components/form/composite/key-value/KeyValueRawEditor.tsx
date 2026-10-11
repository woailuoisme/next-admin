import { useMemoizedFn } from "ahooks";
import { AlertCircle, Check, Code2, Sparkles } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import type { KeyValueRawFormat, KeyValueRowItem } from "./types";

import { rawToRows, rowsToRaw } from "./parsers";

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
  const [format, setFormat] = useState<KeyValueRawFormat>(defaultFormat);
  const [text, setText] = useState<string>(() => rowsToRaw(rows, defaultFormat));
  const [error, setError] = useState<string | null>(null);
  const isInternalTextChangeRef = useRef(false);

  // 统一解析辅助方法，避免多处重复解构与调用
  const parseCurrent = useMemoizedFn((rawText: string = text, targetFormat: KeyValueRawFormat = format) => {
    return rawToRows(rawText, targetFormat);
  });

  // 当格式切换时转换内容
  const handleFormatChange = useMemoizedFn((nextFormat: KeyValueRawFormat) => {
    if (nextFormat === format) return;
    const { rows: currentRows, error: parseErr } = parseCurrent(text, format);
    if (parseErr) {
      setError(`请先修复当前 ${format.toUpperCase()} 语法错误后再切换格式`);
      return;
    }
    setFormat(nextFormat);
    setText(rowsToRaw(currentRows, nextFormat));
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

    const { rows: parsedRows, error: parseErr } = parseCurrent(val, format);
    if (parseErr) {
      setError(parseErr);
    } else {
      setError(null);
      isInternalTextChangeRef.current = true;
      onChange(parsedRows);
    }
  });

  // 格式化（仅限 JSON）
  const handleFormatJson = useMemoizedFn(() => {
    if (format !== "json") return;
    try {
      const obj = JSON.parse(text);
      setText(JSON.stringify(obj, null, 2));
      setError(null);
    } catch (err) {
      setError((err as Error).message || "JSON 格式非法");
    }
  });

  const handleApplyAndClose = useMemoizedFn(() => {
    const { rows: parsedRows, error: parseErr } = parseCurrent(text, format);
    if (parseErr) {
      setError(parseErr);
      return;
    }
    onChange(parsedRows);
    onClose();
  });

  // 仅当外部真正产生变更时同步文本，避免本地输入时光标被打断重置
  useEffect(() => {
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
          <span className="text-foreground text-xs font-semibold">源码批量编辑</span>
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
              .env 文本
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
              title="美化 JSON"
            >
              <Sparkles className="size-3" />
              <span>格式化</span>
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
            <span>完成并切回表格</span>
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
        <div className="bg-destructive/10 text-destructive flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      ) : (
        <p className="text-muted-foreground text-[11px]">
          {format === "json"
            ? "支持标准 JSON 键值对，实时自动解析并同步至表单"
            : "支持 KEY=VALUE 格式，每行一个键值，# 开头为注释"}
        </p>
      )}
    </div>
  );
});
KeyValueRawEditor.displayName = "KeyValueRawEditor";
