"use client";

import {
	FileText,
	Home,
	MessageCircle,
	Search,
	Send,
	User,
	Users,
} from "lucide-react";
import type * as React from "react";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "~/components/nav-user";
import { Icons } from "~/components/ui/icons";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "~/components/ui/sidebar";
import { ROUTES } from "~/lib/constants";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession();
	const pathname = usePathname();

	if (!session) return null;

	const userRole = session.user.role;
	const cabinetRoutes = ROUTES.CABINET;
	const doctorRoutes = ROUTES.DOCTOR;

	// Simple navigation menu based on user role
	const navigationItems =
		userRole === "CABINET"
			? [
					{
						title: "Dashboard",
						url: cabinetRoutes.DASHBOARD,
						icon: Home,
					},
					{
						title: "Mes Annonces",
						url: cabinetRoutes.JOB_OFFERS,
						icon: FileText,
					},
					{
						title: "Candidatures",
						url: cabinetRoutes.APPLICATIONS,
						icon: Users,
					},
					{
						title: "Messages",
						url: cabinetRoutes.MESSAGES,
						icon: MessageCircle,
					},
					{
						title: "Mon Profil",
						url: cabinetRoutes.PROFILE,
						icon: User,
					},
				]
			: [
					{
						title: "Dashboard",
						url: doctorRoutes.DASHBOARD,
						icon: Home,
					},
					{
						title: "Rechercher",
						url: doctorRoutes.SEARCH,
						icon: Search,
					},
					{
						title: "Mes Candidatures",
						url: doctorRoutes.APPLICATIONS,
						icon: Send,
					},
					{
						title: "Messages",
						url: doctorRoutes.MESSAGES,
						icon: MessageCircle,
					},
					{
						title: "Mon Profil",
						url: doctorRoutes.PROFILE,
						icon: User,
					},
				];

	const user = {
		name: session.user.name || "Utilisateur",
		email: session.user.email || "",
		avatar: "/avatars/user.jpg",
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-4 py-2">
					<Icons.logo className="h-8 w-8" />
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">Medic Remplacement</span>
						<span className="truncate text-xs">
							{userRole === "CABINET"
								? "Cabinet médical"
								: "Médecin remplaçant"}
						</span>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarMenu>
					{navigationItems.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								isActive={pathname === item.url}
								tooltip={item.title}
							>
								<Link href={item.url}>
									<item.icon className="h-4 w-4" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
