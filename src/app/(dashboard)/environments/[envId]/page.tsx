"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenant } from "@/hooks/use-tenant";
import { environmentsApi, ApiError } from "@/lib/api";
import type { Environment } from "@/types";
import {
  ArrowLeft,
  Copy,
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function EnvironmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenantId } = useTenant();
  const envId = params.envId as string;

  const [environment, setEnvironment] = useState<Environment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchEnvironment() {
      if (!tenantId || !envId) return;

      try {
        const data = await environmentsApi.get(tenantId, envId);
        setEnvironment(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to load environment");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnvironment();
  }, [tenantId, envId]);

  const copyEnvId = async () => {
    await navigator.clipboard.writeText(envId);
    setCopied(true);
    toast.success("Environment ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!tenantId || !envId) return;

    setIsDeleting(true);
    try {
      await environmentsApi.delete(tenantId, envId);
      toast.success("Environment deleted");
      router.push("/environments");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete environment");
      }
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{environment?.name}</h1>
            <p className="text-muted-foreground">Environment details</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/environments/${envId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Environment</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete &quot;{environment?.name}&quot;?
                    This will permanently delete all users in this environment.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Environment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{environment?.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Environment ID</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {envId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={copyEnvId}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {environment?.createdAt && (
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">
                  {new Date(environment.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {environment?.customProperties &&
              Object.keys(environment.customProperties).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Custom Properties
                  </p>
                  <div className="space-y-1">
                    {Object.entries(environment.customProperties).map(
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

        {/* Users Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>
              Manage users in this environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and manage user accounts for this environment.
            </p>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href={`/environments/${envId}/users/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create User
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/environments/${envId}/users`}>
                  <Users className="mr-2 h-4 w-4" />
                  View All Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
