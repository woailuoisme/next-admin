"use client";

import {
  ColorPickerInput,
  FormGrid,
  FormSection,
  KeyValueInput,
  NumberInput,
  Repeater,
  TagsInput,
  TextInput,
} from "@/components/form";

import {
  createDefaultAttribute,
  createDefaultInvoiceItem,
  getAttributeTitle,
  TAG_SUGGESTIONS,
} from "../constants";

export interface AdvancedTabProps {
  // biome-ignore lint/suspicious/noExplicitAny: TanStack FormApi instance
  form: any;
}

export function AdvancedTab({ form }: AdvancedTabProps) {
  return (
    <div className="space-y-6">
      <FormSection
        title="Colors, Chips & Dynamic Dictionaries"
        description="Color picker with preset palette, tags chips, and KeyValue dictionary editor."
      >
        <FormGrid columns={{ sm: 1, md: 2 }}>
          <ColorPickerInput form={form} name="accentColor" label="Accent Brand Color" colSpan={1} />
          <TagsInput
            form={form}
            name="tags"
            label="Technical Skills (TagsInput)"
            suggestions={TAG_SUGGESTIONS}
            colSpan={1}
          />
        </FormGrid>

        <div className="mt-4">
          <KeyValueInput
            form={form}
            name="metadata"
            label="Environment Metadata (KeyValueInput - Raw Mode & Masked)"
            helperText="Dynamic key-value pairs with dual-mode (.env & JSON raw editor), key suggestions, and secret masking."
            keyPlaceholder="Config Key"
            valuePlaceholder="Config Value"
            keyLabel="Environment Key"
            valueLabel="Configuration Value"
            keySuggestions={["NODE_ENV", "API_BASE_URL", "DATABASE_URL", "REDIS_PORT", "AUTH_SECRET"]}
            enableRawMode
            masked
          />
        </div>
      </FormSection>

      <FormSection
        title="Array Subform Repeater (Card Layout)"
        description="Full-featured dynamic sub-forms with DnD-Kit reordering, collapse all, item cloning, and deletion popover."
      >
        <Repeater<{ name: string; value: string }>
          form={form}
          name="customAttributes"
          label="Custom Entity Attributes (Card Stream)"
          createItem={createDefaultAttribute}
          itemTitle={getAttributeTitle}
          addButtonText="Add Attribute Card"
          collapsible
          reorderable
          canDuplicate
          confirmDelete
          minItems={1}
          maxItems={5}
          renderItem={(item, _idx, update) => (
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="Attribute Key"
                value={item.name}
                onChange={(val) => update({ ...item, name: val })}
                placeholder="e.g. Clearance"
              />
              <TextInput
                label="Attribute Value"
                value={item.value}
                onChange={(val) => update({ ...item, value: val })}
                placeholder="e.g. Secret"
              />
            </div>
          )}
        />
      </FormSection>

      <FormSection
        title="Table Subform Repeater (Compact Line Items)"
        description="Compact tabular layout with column headers, auto-calculated summary footer, and inline operations."
      >
        <Repeater<{ sku: string; description: string; quantity: number; unitPrice: number }>
          form={form}
          name="invoiceItems"
          label="Invoice Line Items (Table Layout)"
          layout="table"
          headers={[
            { label: "SKU", width: "w-32", required: true },
            { label: "Item Description", width: "w-1/2" },
            { label: "Quantity", width: "w-24" },
            { label: "Unit Price ($)", width: "w-28" },
          ]}
          createItem={createDefaultInvoiceItem}
          addButtonText="Add Invoice Line"
          reorderable
          canDuplicate
          confirmDelete
          renderSummary={(items) => {
            const total = items.reduce(
              (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
              0,
            );
            return (
              <div className="flex items-center justify-between px-2 text-xs font-semibold">
                <span className="text-muted-foreground">Line Items Count: {items.length}</span>
                <span className="text-foreground">
                  Estimated Total: <span className="text-primary font-mono">${total.toLocaleString()}</span>
                </span>
              </div>
            );
          }}
          renderItem={(item, _idx, update) => (
            <>
              <td className="px-2 py-1.5 align-middle">
                <TextInput
                  value={item.sku}
                  onChange={(val) => update({ ...item, sku: val })}
                  placeholder="SKU-..."
                  className="h-8 font-mono text-xs"
                />
              </td>
              <td className="px-2 py-1.5 align-middle">
                <TextInput
                  value={item.description}
                  onChange={(val) => update({ ...item, description: val })}
                  placeholder="Item description"
                  className="h-8 text-xs"
                />
              </td>
              <td className="px-2 py-1.5 align-middle">
                <NumberInput
                  value={item.quantity}
                  onChange={(val) => update({ ...item, quantity: Number(val) || 0 })}
                  min={1}
                  className="h-8 text-xs"
                />
              </td>
              <td className="px-2 py-1.5 align-middle">
                <NumberInput
                  value={item.unitPrice}
                  onChange={(val) => update({ ...item, unitPrice: Number(val) || 0 })}
                  min={0}
                  className="h-8 font-mono text-xs"
                />
              </td>
            </>
          )}
        />
      </FormSection>
    </div>
  );
}
