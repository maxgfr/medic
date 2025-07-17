"use client";

import {
	AudioWaveform,
	BookOpen,
	Bot,
	Command,
	Frame,
	GalleryVerticalEnd,
	Map,
	PieChart,
	Settings2,
	SquareTerminal,
} from "lucide-react";
import type * as React from "react";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team-switcher";
import { Icons } from "~/components/ui/icons";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "~/components/ui/sidebar";
import { ROUTES } from "~/lib/constants";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession();

	if (!session) return null;

	const userRole = session.user.role;
	const cabinetRoutes = ROUTES.CABINET;
	const doctorRoutes = ROUTES.DOCTOR;

	// Adapt data based on user role
	const medicData = {
		user: {
			name: session.user.name || "Utilisateur",
			email: session.user.email || "",
			avatar: "/avatars/user.jpg",
		},
		teams: [
			{
				name: "Medic Remplacement",
				logo: Icons.logo,
				plan: userRole === "CABINET" ? "Cabinet médical" : "Médecin remplaçant",
			},
		],
		navMain:
			userRole === "CABINET"
				? [
						{
							title: "Navigation principale",
							url: "#",
							icon: Icons.stethoscope,
							isActive: true,
							items: [
								{
									title: "Dashboard",
									url: cabinetRoutes.DASHBOARD,
								},
								{
									title: "Mes Annonces",
									url: cabinetRoutes.JOB_OFFERS,
								},
								{
									title: "Candidatures",
									url: cabinetRoutes.APPLICATIONS,
								},
							],
						},
						{
							title: "Compte",
							url: "#",
							icon: Icons.user,
							items: [
								{
									title: "Messages",
									url: cabinetRoutes.MESSAGES,
								},
								{
									title: "Mon Profil",
									url: cabinetRoutes.PROFILE,
								},
							],
						},
					]
				: [
						{
							title: "Navigation principale",
							url: "#",
							icon: Icons.stethoscope,
							isActive: true,
							items: [
								{
									title: "Dashboard",
									url: doctorRoutes.DASHBOARD,
								},
								{
									title: "Rechercher",
									url: doctorRoutes.SEARCH,
								},
								{
									title: "Mes Candidatures",
									url: doctorRoutes.APPLICATIONS,
								},
							],
						},
						{
							title: "Compte",
							url: "#",
							icon: Icons.user,
							items: [
								{
									title: "Messages",
									url: doctorRoutes.MESSAGES,
								},
								{
									title: "Mon Profil",
									url: doctorRoutes.PROFILE,
								},
							],
						},
					],
	};

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={medicData.teams} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={medicData.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={medicData.user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
