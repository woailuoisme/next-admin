"use client";

import { Grid, Section } from "@/components/shared/layout";
import { FileUploadInput } from "@/components/form/media/file-upload/FileUploadInput";
import { RichEditorInput } from "@/components/form/media/rich-editor/RichEditorInput";

export interface MediaTabProps {
	// biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
	form: any;
}

export function MediaTab({ form }: MediaTabProps) {
	return (
		<div className="space-y-6">
			<Section
				title="Rich Text Editor (Plate)"
				description="Official Plate + shadcn/ui WYSIWYG editor with fixed & floating toolbars, headings, lists, links, and code blocks."
			>
				<RichEditorInput
					form={form}
					name="articleContent"
					label="Publication Article Content"
					helperText="Stores clean Markdown natively via @platejs/markdown with full theme token support."
					minHeight={200}
				/>
			</Section>

			<Section
				title="File & Avatar Uploaders (UploadCN)"
				description="Built on official UploadCN + shadcn/ui primitives with drag-and-drop, Ctrl/⌘+V paste, circular avatar cropping, image lightbox, and size validation."
			>
				<Grid columns={{ sm: 1, md: 3 }}>
					<FileUploadInput
						form={form}
						name="avatarUrl"
						label="Profile Avatar (mode='avatar')"
						mode="avatar"
						accept="image/*"
						helperText="Single image circular uploader with interactive round cropping and progress ring."
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
				</Grid>
			</Section>
		</div>
	);
}
