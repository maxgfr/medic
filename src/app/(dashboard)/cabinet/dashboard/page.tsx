"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { api } from "~/trpc/react";

export default function CabinetDashboardPage() {
	const { data: session } = useSession();
	const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();
	const { data: profile } = api.auth.getCabinetProfile.useQuery(undefined, {
		enabled: !!session?.user,
	});

	// Fetch analytics data
	const { data: stats, isLoading: statsLoading } =
		api.analytics.getCabinetStats.useQuery();
	const { data: recentActivity } =
		api.analytics.getCabinetRecentActivity.useQuery({
			limit: 3,
		});
	const { data: unreadMessages } = api.messages.getUnreadCount.useQuery();

	return (
		<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="font-bold text-3xl tracking-tight">Dashboard Cabinet</h2>
				<div className="flex items-center space-x-2">
					<Button asChild>
						<Link href="/cabinet/job-offers/new">
							<Icons.plus className="mr-2 h-4 w-4" />
							Nouvelle annonce
						</Link>
					</Button>
				</div>
			</div>

			{/* Profile completion banner */}
			{profileCompletion && !profileCompletion.isComplete && (
				<Card className="border-yellow-200 bg-yellow-50">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-2">
							<Icons.alertCircle className="h-5 w-5 text-yellow-600" />
							<div>
								<p className="font-medium text-yellow-800">
									Complétez votre profil (
									{profileCompletion.completionPercentage}%)
								</p>
								<p className="text-sm text-yellow-600">
									Éléments manquants :{" "}
									{profileCompletion.missingFields.join(", ")}
								</p>
							</div>
						</div>
						<Button asChild variant="outline" size="sm">
							<Link href="/cabinet/profile">Compléter</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Annonces Actives
						</CardTitle>
						<Icons.fileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{statsLoading ? "..." : (stats?.activeJobOffers ?? 0)}
						</div>
						<p className="text-muted-foreground text-xs">
							{stats?.totalJobOffers ?? 0} annonces au total
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Candidatures Reçues
						</CardTitle>
						<Icons.user className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{statsLoading ? "..." : (stats?.pendingApplications ?? 0)}
						</div>
						<p className="text-muted-foreground text-xs">
							{stats?.totalApplications ?? 0} candidatures reçues
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Postes Pourvus
						</CardTitle>
						<Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">
							{statsLoading ? "..." : (stats?.acceptedApplications ?? 0)}
						</div>
						<p className="text-muted-foreground text-xs">
							Candidatures acceptées
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Messages Non Lus
						</CardTitle>
						<Icons.messageCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">{unreadMessages ?? 0}</div>
						<p className="text-muted-foreground text-xs">
							{stats?.activeConversations ?? 0} conversations actives
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				{/* Recent Job Offers */}
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Mes Dernières Annonces</CardTitle>
						<CardDescription>
							Vos annonces de remplacement récentes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[1, 2, 3].map((item) => (
								<div key={item} className="flex items-center space-x-4">
									<div className="flex-1 space-y-1">
										<p className="font-medium text-sm leading-none">
											Remplacement Médecine Générale - Urgence
										</p>
										<p className="text-muted-foreground text-sm">
											Paris 15e • 15-20 Janvier 2025 • 70% rétrocession
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant="secondary">5 candidatures</Badge>
										<Badge variant="outline">Publié</Badge>
									</div>
								</div>
							))}
						</div>
						<div className="mt-4">
							<Button asChild variant="outline" className="w-full">
								<Link href="/cabinet/job-offers">Voir toutes mes annonces</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Recent Applications */}
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Candidatures Récentes</CardTitle>
						<CardDescription>Nouvelles candidatures à examiner</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentActivity && recentActivity.length > 0 ? (
								recentActivity.map((activity) => (
									<div
										key={activity.id}
										className="flex items-center space-x-4"
									>
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-sm text-white">
											{activity.title.charAt(activity.title.indexOf("Dr.") + 3)}
										</div>
										<div className="flex-1 space-y-1">
											<p className="font-medium text-sm leading-none">
												{activity.title}
											</p>
											<p className="text-muted-foreground text-sm">
												{activity.description}
											</p>
										</div>
										<Badge
											variant={
												activity.status === "SENT"
													? "secondary"
													: activity.status === "ACCEPTED"
														? "default"
														: activity.status === "REJECTED"
															? "destructive"
															: "outline"
											}
										>
											{activity.status === "SENT"
												? "Nouveau"
												: activity.status === "ACCEPTED"
													? "Accepté"
													: activity.status === "REJECTED"
														? "Refusé"
														: activity.status}
										</Badge>
									</div>
								))
							) : (
								<div className="py-4 text-center">
									<p className="text-muted-foreground text-sm">
										Aucune candidature récente
									</p>
								</div>
							)}
						</div>
						<div className="mt-4">
							<Button asChild variant="outline" className="w-full">
								<Link href="/cabinet/applications">
									Voir toutes les candidatures
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Actions Rapides</CardTitle>
					<CardDescription>
						Raccourcis vers vos actions les plus fréquentes
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<Button asChild variant="outline" className="h-auto p-4">
							<Link href="/cabinet/job-offers/new">
								<div className="flex flex-col items-center space-y-2">
									<Icons.plus className="h-6 w-6" />
									<span>Créer une annonce</span>
								</div>
							</Link>
						</Button>

						<Button asChild variant="outline" className="h-auto p-4">
							<Link href="/cabinet/applications">
								<div className="flex flex-col items-center space-y-2">
									<Icons.user className="h-6 w-6" />
									<span>Gérer les candidatures</span>
								</div>
							</Link>
						</Button>

						<Button asChild variant="outline" className="h-auto p-4">
							<Link href="/cabinet/messages">
								<div className="flex flex-col items-center space-y-2">
									<Icons.messageCircle className="h-6 w-6" />
									<span>Messages</span>
								</div>
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
