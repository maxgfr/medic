"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Icons } from "~/components/ui/icons";

export default function DashboardRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // Redirect to role-specific dashboard
    if (session.user.role === "CABINET") {
      router.push("/cabinet/dashboard");
    } else if (session.user.role === "DOCTOR") {
      router.push("/doctor/dashboard");
    } else {
      // If no role is set, redirect to role selection
      router.push("/onboarding");
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Icons.spinner className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Redirection en cours...</p>
      </div>
    </div>
  );
}
