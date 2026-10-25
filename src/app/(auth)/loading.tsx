import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard, AuthShell } from "@/features/auth/components/AuthShell";

export default function AuthLoading() {
  return (
    <AuthShell>
      <AuthCard>
        <div className="space-y-6 p-6">
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-7 w-36" />
            <Skeleton className="mx-auto h-4 w-52" />
          </div>
          <div className="space-y-4 pt-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
