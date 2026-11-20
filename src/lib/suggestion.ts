import { cva } from "class-variance-authority";

export const inlineSuggestionVariants = cva(
  "in-data-[inline-suggestion=insert]:bg-primary/10! in-data-[inline-suggestion=remove]:bg-destructive/10! in-data-[inline-suggestion=insert]:text-primary! in-data-[inline-suggestion=remove]:text-destructive! data-[inline-suggestion=insert]:bg-primary/10! data-[inline-suggestion=remove]:bg-destructive/10! data-[inline-suggestion=insert]:text-primary! data-[inline-suggestion=remove]:text-destructive!",
);
