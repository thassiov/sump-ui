"use client";

import { useParams } from "next/navigation";
import { UserForm } from "@/components/forms/user-form";

export default function NewUserPage() {
  const params = useParams();
  const envId = params.envId as string;

  return (
    <div className="max-w-lg mx-auto">
      <UserForm environmentId={envId} />
    </div>
  );
}
