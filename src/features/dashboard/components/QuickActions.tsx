import Link from "next/link";
import { Layers, PackagePlus, ShoppingCart, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS = [
  {
    to: "/products",
    icon: PackagePlus,
    label: "Catalog Inventory",
  },
  {
    to: "/orders",
    icon: ShoppingCart,
    label: "Process Orders",
  },
  {
    to: "/categories",
    icon: Layers,
    label: "Categories",
  },
  {
    to: "/users",
    icon: Users,
    label: "Customer Base",
  },
] as const;

export function QuickActions() {
  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Operational Quick Actions</CardTitle>
        <CardDescription className="text-xs">
          Direct shortcuts for frequent management operations
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map(({ to, icon: Icon, label }) => (
          <Button
            key={to}
            asChild
            variant="outline"
            className="border-border/70 hover:border-primary/60 hover:bg-primary/5 h-auto flex-col items-center justify-center gap-2 p-3 transition-colors"
          >
            <Link href={to}>
              <Icon className="text-primary size-5" />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
