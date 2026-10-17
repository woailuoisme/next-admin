"use client";

import { FileUploadInput, FormGrid, FormSection, LazyRichEditorInput } from "@/components/form";

export interface MediaTabProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
  form: any;
}

export function MediaTab({ form }: MediaTabProps) {
  return (
    <div className="space-y-6">
      <FormSection
        title="Rich Text Editor (TipTap)"
        description="Full WYSIWYG rich content editor supporting bold, italic, headings, lists, blockquotes, links, and code blocks."
      >
        <LazyRichEditorInput
          form={form}
          name="articleContent"
          label="Publication Article Content"
          helperText="Supports dual output modes (HTML / Markdown). Matches Filament RichEditor toolbar and style."
          minHeight={200}
        />
      </FormSection>

      <FormSection
        title="File & Avatar Uploaders (Dropzone)"
        description="1:1 FilePond-like design with drag-and-drop, image preview thumbnails, circular avatar mode, and size validation."
      >
        <FormGrid columns={{ sm: 1, md: 3 }}>
          <FileUploadInput
            form={form}
            name="avatarUrl"
            label="Profile Avatar (mode='avatar')"
            mode="avatar"
            accept="image/*"
            helperText="Single image circular uploader with hover camera overlay."
            colSpan={1}
          />
          <div className="md:col-span-2">
            <FileUploadInput
              form={form}
              name="attachments"
              label="Project Documents & Images (mode='grid')"
              mode="grid"
              multiple
              maxFiles={6}
              maxSize={5 * 1024 * 1024}
              accept="image/*,.pdf,.zip"
              helperText="Supports multi-file drag-and-drop, image lightbox modal, size limits, and progress bar."
            />
          </div>
        </FormGrid>
      </FormSection>
    </div>
  );
}
