"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTenant } from "@/hooks/use-tenant";
import { useAuth } from "@/hooks/use-auth";
import { tenantsApi, ApiError } from "@/lib/api";
import type { Tenant } from "@/types";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

export default function SettingsPage() {
  const { tenantId } = useTenant();
  const { session } = useAuth();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tenant name edit state
  const [tenantName, setTenantName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchTenant() {
      if (!tenantId) return;

      try {
        const data = await tenantsApi.get(tenantId);
        setTenant(data);
        setTenantName(data.name);
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

  const handleSaveName = async () => {
    if (!tenantId) return;

    if (!tenantName.trim()) {
      setNameError("Tenant name is required");
      return;
    }

    if (tenantName.length < 2) {
      setNameError("Tenant name must be at least 2 characters");
      return;
    }

    setIsSavingName(true);
    setNameError(null);

    try {
      const updated = await tenantsApi.update(tenantId, { name: tenantName });
      setTenant(updated);
      toast.success("Tenant name updated");
    } catch (err) {
      if (err instanceof ApiError) {
        setNameError(err.message);
      } else {
        setNameError("Failed to update tenant name");
      }
    } finally {
      setIsSavingName(false);
    }
  };

  const copyTenantId = async () => {
    if (!tenantId) return;
    await navigator.clipboard.writeText(tenantId);
    setCopied(true);
    toast.success("Tenant ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
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
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your tenant and account settings
        </p>
      </div>

      <Tabs defaultValue="tenant" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tenant">Tenant</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="space-y-6">
          {/* Tenant Name */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Name</CardTitle>
              <CardDescription>
                The display name for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nameError && (
                <Alert variant="destructive">
                  <AlertDescription>{nameError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="tenantName">Name</Label>
                <Input
                  id="tenantName"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSaveName}
                disabled={isSavingName || tenantName === tenant?.name}
              >
                {isSavingName ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          {/* Tenant Info */}
          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
              <CardDescription>
                Details about your tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {new Date(tenant.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              {tenant?.updatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">
                    {new Date(tenant.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Environments</p>
                <p className="text-sm">
                  {tenant?.environments?.length || 0} environment(s)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Properties</CardTitle>
              <CardDescription>
                Metadata stored on your tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tenant?.customProperties &&
              Object.keys(tenant.customProperties).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(tenant.customProperties).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-sm p-2 bg-muted rounded"
                    >
                      <Badge variant="outline">{key}</Badge>
                      <span className="text-muted-foreground font-mono">
                        {JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No custom properties set
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>
                Your current session details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {session ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Session ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {session.id}
                    </code>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Account ID</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {session.accountId}
                    </code>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <Badge variant="secondary">{session.accountType}</Badge>
                  </div>

                  {session.expiresAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expires</p>
                      <p className="text-sm">
                        {new Date(session.expiresAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {session.lastActiveAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p className="text-sm">
                        {new Date(session.lastActiveAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No session information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
