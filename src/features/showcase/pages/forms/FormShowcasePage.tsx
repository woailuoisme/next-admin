"use client";

import { useForm } from "@tanstack/react-form";
import { useMemoizedFn } from "ahooks";
import { Calendar, CheckCircle2, Layers, MapPin, Palette, Send, ShieldCheck, UploadCloud } from "lucide-react";
import { type SyntheticEvent, useMemo, useState } from "react";
import { toast } from "sonner";

import { FormTabs } from "@/components/form";
import { Button } from "@/components/ui/button";

import { ResourceShowcaseSection } from "../../components/ResourceShowcaseSection";
import { BackToTopShowcaseCard } from "./components/BackToTopShowcaseCard";
import { FormSubmittedCard } from "./components/FormSubmittedCard";
import { DEFAULT_VALUES } from "./constants";
import { AdvancedTab } from "./tabs/AdvancedTab";
import { BasicsTab } from "./tabs/BasicsTab";
import { ChoicesTab } from "./tabs/ChoicesTab";
import { DateTimeTab } from "./tabs/DateTimeTab";
import { GeospatialTab } from "./tabs/GeospatialTab";
import { MediaTab } from "./tabs/MediaTab";
import { SecurityFinanceTab } from "./tabs/SecurityFinanceTab";
import type { ShowcaseFormValues } from "./types";

export function FormShowcasePage() {
  const [submittedData, setSubmittedData] = useState<ShowcaseFormValues | null>(null);

  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: async ({ value }) => {
      toast.success("Form submitted successfully!");
      setSubmittedData(value);
    },
  });

  const handleSubmit = useMemoizedFn((e: SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  });

  const handleReset = useMemoizedFn(() => {
    form.reset();
  });

  const tabs = useMemo(
    () => [
      {
        id: "basics",
        label: "Basic Controls",
        icon: Layers,
        children: <BasicsTab form={form} />,
      },
      {
        id: "choices",
        label: "Selection & Toggles",
        icon: CheckCircle2,
        badge: "Interactive",
        children: <ChoicesTab form={form} />,
      },
      {
        id: "datetime",
        label: "Date & Time",
        icon: Calendar,
        children: <DateTimeTab form={form} />,
      },
      {
        id: "advanced",
        label: "Advanced & Composite",
        icon: Palette,
        badge: "Repeater / KV",
        children: <AdvancedTab form={form} />,
      },
      {
        id: "media",
        label: "Media & Rich Text",
        icon: UploadCloud,
        badge: "Filament v5",
        children: <MediaTab form={form} />,
      },
      {
        id: "security-finance",
        label: "Security & Finance",
        icon: ShieldCheck,
        badge: "New Pro",
        children: <SecurityFinanceTab form={form} />,
      },
      {
        id: "geospatial",
        label: "Map & Location",
        icon: MapPin,
        badge: "MapLibre / Amap",
        children: <GeospatialTab form={form} />,
      },
    ],
    [form],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Filament v5 Form Fields & Layouts Showcase</h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Comprehensive gallery demonstrating all 20+ input controls, segmented toggles, array repeaters, key-value
          maps, geographic location pickers, and layout containers.
        </p>
      </div>

      <ResourceShowcaseSection />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormTabs tabs={tabs} />

        <div className="border-border flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground text-xs">
            Click Submit to inspect reactive form serialized output below.
          </span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              Reset Defaults
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 font-semibold">
              <Send className="size-3.5" /> Submit Form
            </Button>
          </div>
        </div>
      </form>

      {submittedData && <FormSubmittedCard data={submittedData} />}

      <BackToTopShowcaseCard />
    </div>
  );
}
