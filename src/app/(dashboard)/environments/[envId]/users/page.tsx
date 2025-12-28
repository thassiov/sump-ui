"use client";

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
import { ArrowLeft, Plus, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EnvironmentUsersPage() {
  const params = useParams();
  const router = useRouter();
  const envId = params.envId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Environment Users</h1>
            <p className="text-muted-foreground">Manage users in this environment</p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/environments/${envId}/users/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Link>
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>List endpoint not available</AlertTitle>
        <AlertDescription>
          The SUMP API does not currently have a &quot;list all users&quot; endpoint for
          environments. Users can be looked up individually by their ID, email,
          username, or phone number. You can still create new users using the
          button above.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Create and manage users in this environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To view a specific user, you&apos;ll need their account ID, email,
            username, or phone number.
          </p>

          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/environments/${envId}/users/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Create New User
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
