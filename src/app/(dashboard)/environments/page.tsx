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
import { Skeleton } from "@/components/ui/skeleton";
import { useTenant } from "@/hooks/use-tenant";
import { tenantsApi, ApiError } from "@/lib/api";
import type { TenantEnvironmentSummary } from "@/types";
import { Plus, Layers, ArrowRight } from "lucide-react";

export default function EnvironmentsPage() {
  const { tenantId } = useTenant();
  const [environments, setEnvironments] = useState<TenantEnvironmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnvironments() {
      if (!tenantId) return;

      try {
        const tenant = await tenantsApi.get(tenantId);
        setEnvironments(tenant.environments || []);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load environments");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnvironments();
  }, [tenantId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Environments</h1>
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
        <div>
          <h1 className="text-2xl font-bold">Environments</h1>
          <p className="text-muted-foreground">
            Manage your isolated user environments
          </p>
        </div>
        <Button asChild>
          <Link href="/environments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Environment
          </Link>
        </Button>
      </div>

      {environments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No environments yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first environment to start managing users
            </p>
            <Button asChild>
              <Link href="/environments/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Environment
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {environments.map((env) => (
            <Card key={env.id} className="hover:border-foreground/20 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  {env.name}
                </CardTitle>
                <CardDescription className="font-mono text-xs">
                  {env.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/environments/${env.id}`}>
                    Manage
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
