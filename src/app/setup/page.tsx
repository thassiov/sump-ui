import Link from "next/link";
import { TenantSetupForm } from "@/components/forms/tenant-setup-form";

export default function SetupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
            S
          </div>
          <span className="text-2xl font-bold">SUMP</span>
        </div>
        <p className="text-muted-foreground">
          Simple User Management Platform
        </p>
      </div>

      <TenantSetupForm />

      <p className="mt-6 text-sm text-muted-foreground">
        Already have a tenant?{" "}
        <Link href="/login" className="underline hover:text-foreground">
          Sign in
        </Link>
      </p>
    </div>
  );
}
