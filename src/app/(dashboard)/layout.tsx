"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/ui/icons";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { ROUTES } from "~/lib/constants";
import { NotificationsDropdown } from "~/components/ui/notifications-dropdown";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user.role;
  const cabinetRoutes = ROUTES.CABINET;
  const doctorRoutes = ROUTES.DOCTOR;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link
              href={
                userRole === "CABINET"
                  ? cabinetRoutes.DASHBOARD
                  : doctorRoutes.DASHBOARD
              }
              className="mr-6 flex items-center space-x-2"
            >
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">Medic Remplacement</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center space-x-2 justify-end">
            <Badge variant="outline">
              {userRole === "CABINET" ? "Cabinet" : "Médecin"}
            </Badge>

            <NotificationsDropdown />

            <Button variant="ghost" size="sm">
              <Icons.user className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <nav className="grid items-start gap-2">
              <Link
                href={
                  userRole === "CABINET"
                    ? cabinetRoutes.DASHBOARD
                    : doctorRoutes.DASHBOARD
                }
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Icons.stethoscope className="mr-2 h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href={
                  userRole === "CABINET"
                    ? cabinetRoutes.PROFILE
                    : doctorRoutes.PROFILE
                }
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Icons.user className="mr-2 h-4 w-4" />
                Mon Profil
              </Link>

              {userRole === "CABINET" ? (
                <>
                  <Link
                    href={cabinetRoutes.JOB_OFFERS}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.fileText className="mr-2 h-4 w-4" />
                    Mes Annonces
                  </Link>

                  <Link
                    href={cabinetRoutes.APPLICATIONS}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.user className="mr-2 h-4 w-4" />
                    Candidatures
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={doctorRoutes.SEARCH}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.search className="mr-2 h-4 w-4" />
                    Rechercher
                  </Link>

                  <Link
                    href={doctorRoutes.APPLICATIONS}
                    className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icons.fileText className="mr-2 h-4 w-4" />
                    Mes Candidatures
                  </Link>
                </>
              )}

              <Link
                href={
                  userRole === "CABINET"
                    ? cabinetRoutes.MESSAGES
                    : doctorRoutes.MESSAGES
                }
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                <Icons.messageCircle className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
