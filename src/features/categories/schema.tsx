import { s, type SchemaNode } from "@/components/schema";

export const categoryFormSchema: readonly SchemaNode[] = [
	s.text("name", {
		labelKey: "form_name_label",
		required: true,
		placeholder: "e.g. Smart Home",
		slugTarget: "slug",
	}),
	s.text("slug", {
		labelKey: "form_slug_label",
		required: true,
		placeholderKey: "form_slug_placeholder",
	}),
	s.textarea("description", {
		labelKey: "form_desc_label",
		rows: 3,
		placeholderKey: "form_desc_placeholder",
	}),
];
