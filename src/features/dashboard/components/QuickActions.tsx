import Link from "next/link";
import { Layers, PackagePlus, ShoppingCart, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const QUICK_ACTIONS = [
  {
    to: "/products",
    icon: PackagePlus,
    labelKey: "quick_action_products",
  },
  {
    to: "/orders",
    icon: ShoppingCart,
    labelKey: "quick_action_orders",
  },
  {
    to: "/categories",
    icon: Layers,
    labelKey: "quick_action_categories",
  },
  {
    to: "/users",
    icon: Users,
    labelKey: "quick_action_customers",
  },
] as const;

export function QuickActions() {
  const t = useTranslations("dashboard");

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{t("quick_actions_title")}</CardTitle>
        <CardDescription className="text-xs">{t("quick_actions_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ to, icon: Icon, labelKey }) => (
          <Button
            key={to}
            asChild
            variant="outline"
            className="border-border/70 hover:border-primary/60 hover:bg-primary/5 h-auto flex-col items-center justify-center gap-2 p-3 transition-colors"
          >
            <Link href={to}>
              <Icon className="text-primary size-5" />
              <span className="text-xs font-semibold">{t(labelKey)}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
