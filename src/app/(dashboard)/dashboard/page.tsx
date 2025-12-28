"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenant } from "@/hooks/use-tenant";
import { tenantsApi, ApiError } from "@/lib/api";
import type { Tenant } from "@/types";
import { Layers, Settings, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const { tenantId } = useTenant();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchTenant() {
      if (!tenantId) return;

      try {
        const data = await tenantsApi.get(tenantId);
        setTenant(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load tenant data");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchTenant();
  }, [tenantId]);

  const copyTenantId = async () => {
    if (!tenantId) return;
    await navigator.clipboard.writeText(tenantId);
    setCopied(true);
    toast.success("Tenant ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tenant Info Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>Your organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-medium">{tenant?.name}</p>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Tenant ID</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {tenantId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyTenantId}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {tenant?.createdAt && (
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {tenant?.customProperties &&
              Object.keys(tenant.customProperties).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Custom Properties
                  </p>
                  <div className="space-y-1">
                    {Object.entries(tenant.customProperties).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Badge variant="secondary">{key}</Badge>
                          <span className="text-muted-foreground">
                            {JSON.stringify(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/environments/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Environment
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/environments">
                <Layers className="mr-2 h-4 w-4" />
                View Environments
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Tenant Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
