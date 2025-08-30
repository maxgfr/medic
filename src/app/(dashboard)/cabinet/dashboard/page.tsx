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

	// Fetch recent job offers from database
	const { data: jobOffersData } = api.jobOffers.getByCabinet.useQuery({
		limit: 3,
	});

	const recentJobOffers =
		jobOffersData?.map((offer) => ({
			...offer,
			applicationCount: offer.applications?.length || 0,
		})) || [];
	const { data: unreadMessages } = api.messages.getUnreadCount.useQuery();

	return (
		<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="font-bold text-3xl tracking-tight">Dashboard Cabinet</h2>
				<div className="flex items-center space-x-2">
					{profileCompletion?.isComplete ? (
						<Button asChild>
							<Link href="/cabinet/job-offers/new">
								<Icons.plus className="mr-2 h-4 w-4" />
								Nouvelle annonce
							</Link>
						</Button>
					) : (
						<Button
							disabled
							title="Complétez votre profil à 100% pour publier une annonce"
						>
							<Icons.plus className="mr-2 h-4 w-4" />
							Nouvelle annonce
						</Button>
					)}
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
							{recentJobOffers.length > 0 ? (
								recentJobOffers.map((offer) => (
									<div key={offer.id} className="flex items-center space-x-4">
										<div className="flex-1 space-y-1">
											<p className="font-medium text-sm leading-none">
												{offer.title}
											</p>
											<p className="text-muted-foreground text-sm">
												{offer.location} •{" "}
												{new Date(offer.startDate).toLocaleDateString("fr-FR")}{" "}
												- {new Date(offer.endDate).toLocaleDateString("fr-FR")}{" "}
												• {Number(offer.retrocessionRate)}% rétrocession
											</p>
										</div>
										<div className="flex items-center space-x-2">
											<Badge variant="secondary">
												{offer.applicationCount} candidatures
											</Badge>
											<Badge
												variant={
													offer.status === "PUBLISHED"
														? "default"
														: offer.status === "DRAFT"
															? "outline"
															: "secondary"
												}
											>
												{offer.status === "PUBLISHED"
													? "Publié"
													: offer.status === "DRAFT"
														? "Brouillon"
														: offer.status === "FILLED"
															? "Pourvu"
															: "Archivé"}
											</Badge>
										</div>
									</div>
								))
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<Icons.briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
									<h3 className="mb-2 font-semibold text-lg">Aucune annonce</h3>
									<p className="mb-4 text-muted-foreground text-sm">
										Vous n'avez pas encore publié d'annonces de remplacement.
									</p>
								</div>
							)}
						</div>
						{recentJobOffers.length > 0 && (
							<div className="mt-4">
								<Button asChild variant="outline" className="w-full">
									<Link href="/cabinet/job-offers">
										Voir toutes mes annonces
									</Link>
								</Button>
							</div>
						)}
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
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<Icons.user className="mb-4 h-12 w-12 text-muted-foreground" />
									<h3 className="mb-2 font-semibold text-lg">
										Aucune candidature récente
									</h3>
									<p className="mb-4 text-muted-foreground text-sm">
										Vous n'avez pas encore reçu de candidatures.
									</p>
								</div>
							)}
						</div>
						{recentActivity && recentActivity.length > 0 && (
							<div className="mt-4">
								<Button asChild variant="outline" className="w-full">
									<Link href="/cabinet/applications">
										Voir toutes les candidatures
									</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
