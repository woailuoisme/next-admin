import { createContext, useContext, useMemo, type ReactNode, type SubmitEvent } from "react";

import { cn } from "@/lib/utils";

export interface FormContextValue {
  form?: any;
}

export const FormContext = createContext<FormContextValue>({});

export function useFormContext() {
  return useContext(FormContext);
}

export interface FormProps {
  /** TanStack Form useForm 实例 */
  form?: any;
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "form" | "div";
  onSubmit?: (e: SubmitEvent<HTMLFormElement>) => void;
}

export function Form({ form, children, className, id, as = "form", onSubmit }: FormProps) {
  // 稳定的 Context 值，避免所有 useFormContext 消费方随 Form 重渲染
  const contextValue = useMemo(() => ({ form }), [form]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    if (onSubmit) {
      onSubmit(e);
      return;
    }
    if (form?.handleSubmit) {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }
  };

  return (
    <FormContext value={contextValue}>
      {as === "div" ? (
        <div id={id} className={cn("w-full space-y-5", className)}>
          {children}
        </div>
      ) : (
        <form id={id} onSubmit={handleSubmit} className={cn("w-full space-y-6", className)}>
          {children}
        </form>
      )}
    </FormContext>
  );
}
