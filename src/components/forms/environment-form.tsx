"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTenant } from "@/hooks/use-tenant";
import { environmentsApi, ApiError } from "@/lib/api";
import type { Environment } from "@/types";

interface EnvironmentFormProps {
  environment?: Environment;
  onSuccess?: (environment: Environment) => void;
}

export function EnvironmentForm({ environment, onSuccess }: EnvironmentFormProps) {
  const router = useRouter();
  const { tenantId } = useTenant();

  const [name, setName] = useState(environment?.name || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!environment;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Environment name is required");
      return;
    }

    if (name.length < 2) {
      setError("Environment name must be at least 2 characters");
      return;
    }

    if (!tenantId) {
      setError("No tenant selected");
      return;
    }

    setIsLoading(true);

    try {
      let result: Environment;

      if (isEditing) {
        result = await environmentsApi.update(tenantId, environment.id, { name });
      } else {
        result = await environmentsApi.create(tenantId, { name });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/environments/${result.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Environment" : "Create Environment"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the environment details"
              : "Create a new isolated environment for your users"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Environment Name</Label>
            <Input
              id="name"
              placeholder="e.g., production, staging, development"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              A descriptive name for this environment
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
              ? "Save Changes"
              : "Create Environment"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
