"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "~/components/app-sidebar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Icons } from "~/components/ui/icons";
import { NotificationsDropdown } from "~/components/ui/notifications-dropdown";
import { Separator } from "~/components/ui/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "~/components/ui/sidebar";
import { ROUTES } from "~/lib/constants";

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
			<div className="flex min-h-screen items-center justify-center">
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
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				{/* Header */}
				<header className="flex h-16 shrink-0 items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4" />
					<div className="flex flex-1 items-center justify-end space-x-2">
						<Badge variant="outline">
							{userRole === "CABINET" ? "Cabinet" : "Médecin"}
						</Badge>

						<NotificationsDropdown />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm">
									<Icons.user className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<div className="flex items-center justify-start gap-2 p-2">
									<div className="flex flex-col space-y-1 leading-none">
										<p className="font-medium text-sm">{session.user.name}</p>
										<p className="text-muted-foreground text-xs">
											{session.user.email}
										</p>
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										href={
											userRole === "CABINET"
												? cabinetRoutes.PROFILE
												: doctorRoutes.PROFILE
										}
									>
										<Icons.user className="mr-2 h-4 w-4" />
										Mon Profil
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link
										href={
											userRole === "CABINET"
												? cabinetRoutes.DASHBOARD
												: doctorRoutes.DASHBOARD
										}
									>
										<Icons.stethoscope className="mr-2 h-4 w-4" />
										Dashboard
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => signOut({ callbackUrl: "/login" })}
									className="text-red-600 focus:text-red-600"
								>
									<Icons.logOut className="mr-2 h-4 w-4" />
									Se déconnecter
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>

				{/* Main content */}
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
