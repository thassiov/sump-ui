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
import { tenantsApi, ApiError } from "@/lib/api";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type Step = 1 | 2 | 3;

interface FormData {
  tenantName: string;
  accountName: string;
  accountEmail: string;
  accountUsername: string;
  accountPassword: string;
  accountPasswordConfirm: string;
  accountPhone: string;
  environmentName: string;
}

export function TenantSetupForm() {
  const router = useRouter();
  const { setTenantId } = useTenant();

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    tenantName: "",
    accountName: "",
    accountEmail: "",
    accountUsername: "",
    accountPassword: "",
    accountPasswordConfirm: "",
    accountPhone: "",
    environmentName: "default",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.tenantName.trim()) {
          setError("Tenant name is required");
          return false;
        }
        if (formData.tenantName.length < 2) {
          setError("Tenant name must be at least 2 characters");
          return false;
        }
        return true;

      case 2:
        if (!formData.accountName.trim()) {
          setError("Name is required");
          return false;
        }
        if (!formData.accountEmail.trim()) {
          setError("Email is required");
          return false;
        }
        if (!formData.accountUsername.trim()) {
          setError("Username is required");
          return false;
        }
        if (formData.accountUsername.length < 3) {
          setError("Username must be at least 3 characters");
          return false;
        }
        if (!formData.accountPassword) {
          setError("Password is required");
          return false;
        }
        if (formData.accountPassword.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        if (formData.accountPassword !== formData.accountPasswordConfirm) {
          setError("Passwords do not match");
          return false;
        }
        return true;

      case 3:
        return true;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as Step);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await tenantsApi.create({
        tenant: {
          name: formData.tenantName,
        },
        account: {
          name: formData.accountName,
          email: formData.accountEmail,
          username: formData.accountUsername,
          password: formData.accountPassword,
          phone: formData.accountPhone || undefined,
        },
        environment: formData.environmentName
          ? { name: formData.environmentName }
          : undefined,
      });

      // Store tenant ID and redirect to dashboard
      setTenantId(response.tenantId);
      router.push("/dashboard");
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

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
            s === step
              ? "bg-primary text-primary-foreground"
              : s < step
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {s < step ? <Check className="w-4 h-4" /> : s}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
    >
      <CardHeader>
        <CardTitle>Create your tenant</CardTitle>
        <CardDescription>
          A tenant represents your organization or workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="tenantName">Tenant Name</Label>
          <Input
            id="tenantName"
            placeholder="My Organization"
            value={formData.tenantName}
            onChange={(e) => updateField("tenantName", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            This is the name of your organization or workspace
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button type="submit">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </form>
  );

  const renderStep2 = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleNext();
      }}
    >
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          This will be the owner account for your tenant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accountName">Full Name</Label>
            <Input
              id="accountName"
              placeholder="John Doe"
              value={formData.accountName}
              onChange={(e) => updateField("accountName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountUsername">Username</Label>
            <Input
              id="accountUsername"
              placeholder="johndoe"
              value={formData.accountUsername}
              onChange={(e) => updateField("accountUsername", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountEmail">Email</Label>
          <Input
            id="accountEmail"
            type="email"
            placeholder="john@example.com"
            value={formData.accountEmail}
            onChange={(e) => updateField("accountEmail", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountPhone">Phone (optional)</Label>
          <Input
            id="accountPhone"
            type="tel"
            placeholder="+1234567890"
            value={formData.accountPhone}
            onChange={(e) => updateField("accountPhone", e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accountPassword">Password</Label>
            <Input
              id="accountPassword"
              type="password"
              placeholder="Min 8 characters"
              value={formData.accountPassword}
              onChange={(e) => updateField("accountPassword", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountPasswordConfirm">Confirm Password</Label>
            <Input
              id="accountPasswordConfirm"
              type="password"
              placeholder="Confirm password"
              value={formData.accountPasswordConfirm}
              onChange={(e) =>
                updateField("accountPasswordConfirm", e.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </form>
  );

  const renderStep3 = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <CardHeader>
        <CardTitle>Create your first environment</CardTitle>
        <CardDescription>
          Environments are isolated spaces for your users (e.g., production,
          staging)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="environmentName">Environment Name</Label>
          <Input
            id="environmentName"
            placeholder="default"
            value={formData.environmentName}
            onChange={(e) => updateField("environmentName", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Leave as &quot;default&quot; or customize (e.g., production,
            development)
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <h4 className="font-medium">Summary</h4>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">Tenant:</span>{" "}
              {formData.tenantName}
            </p>
            <p>
              <span className="text-muted-foreground">Account:</span>{" "}
              {formData.accountName} ({formData.accountEmail})
            </p>
            <p>
              <span className="text-muted-foreground">Environment:</span>{" "}
              {formData.environmentName || "default"}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Tenant"}
          {!isLoading && <Check className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </form>
  );

  return (
    <Card className="w-full max-w-lg">
      {renderStepIndicator()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Card>
  );
}
