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

export default function DoctorDashboardPage() {
	const { data: session } = useSession();
	const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();
	const { data: profile } = api.auth.getDoctorProfile.useQuery(undefined, {
		enabled: !!session?.user,
	});

	return (
		<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="font-bold text-3xl tracking-tight">Dashboard Médecin</h2>
				<div className="flex items-center space-x-2">
					<Button asChild>
						<Link href="/doctor/search">
							<Icons.search className="mr-2 h-4 w-4" />
							Rechercher des annonces
						</Link>
					</Button>
				</div>
			</div>

			{/* Validation status banners */}
			{profileCompletion?.isPending && (
				<Card className="border-yellow-200 bg-yellow-50">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-2">
							<Icons.clock className="h-5 w-5 text-yellow-600" />
							<div>
								<p className="font-medium text-yellow-800">
									Profil en cours de validation
								</p>
								<p className="text-sm text-yellow-600">
									Votre profil médecin est en cours d'examen par notre équipe.
								</p>
							</div>
						</div>
						<Button asChild variant="outline" size="sm">
							<Link href="/doctor/validation-pending">Voir le statut</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{profileCompletion?.isRejected && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-2">
							<Icons.xCircle className="h-5 w-5 text-red-600" />
							<div>
								<p className="font-medium text-red-800">
									Profil rejeté - Actions requises
								</p>
								<p className="text-red-600 text-sm">
									Votre profil nécessite des modifications avant validation.
								</p>
							</div>
						</div>
						<Button asChild variant="outline" size="sm">
							<Link href="/doctor/validation-rejected">Voir les détails</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{profileCompletion?.isApproved && (
				<Card className="border-green-200 bg-green-50">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-2">
							<Icons.checkCircle className="h-5 w-5 text-green-600" />
							<div>
								<p className="font-medium text-green-800">
									Profil validé avec succès !
								</p>
								<p className="text-green-600 text-sm">
									Votre profil médecin est approuvé. Vous avez accès à toutes
									les fonctionnalités.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

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
							<Link href="/doctor/profile">Compléter</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Candidatures Envoyées
						</CardTitle>
						<Icons.fileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">12</div>
						<p className="text-muted-foreground text-xs">+3 cette semaine</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Candidatures Acceptées
						</CardTitle>
						<Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">4</div>
						<p className="text-muted-foreground text-xs">
							Taux d'acceptation : 33%
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">
							Annonces Correspondantes
						</CardTitle>
						<Icons.search className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl">18</div>
						<p className="text-muted-foreground text-xs">
							Nouvelles cette semaine
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
						<div className="font-bold text-2xl">2</div>
						<p className="text-muted-foreground text-xs">Nouveaux messages</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				{/* Recommended Job Offers */}
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Annonces Recommandées</CardTitle>
						<CardDescription>
							Annonces correspondant à votre profil et disponibilités
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[1, 2, 3].map((item) => (
								<div key={item} className="flex items-center space-x-4">
									<div className="flex-1 space-y-1">
										<p className="font-medium text-sm leading-none">
											{item === 1
												? "Remplacement Médecine Générale - Cabinet Dr. Martin"
												: item === 2
													? "Urgence Cardiologie - Clinique Saint-Joseph"
													: "Pédiatrie - Cabinet Médical du Centre"}
										</p>
										<p className="text-muted-foreground text-sm">
											{item === 1
												? "Paris 15e • 15-20 Janvier 2025 • 70% rétrocession"
												: item === 2
													? "Lyon 6e • 22-25 Janvier 2025 • 65% rétrocession"
													: "Marseille 8e • 1-5 Février 2025 • 75% rétrocession"}
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<Badge variant={item === 1 ? "default" : "secondary"}>
											{item === 1
												? "Urgent"
												: item === 2
													? "Planifié"
													: "Récurrent"}
										</Badge>
										<Badge variant="outline">
											{item === 1
												? "95% match"
												: item === 2
													? "88% match"
													: "92% match"}
										</Badge>
									</div>
								</div>
							))}
						</div>
						<div className="mt-4">
							<Button asChild variant="outline" className="w-full">
								<Link href="/doctor/search">Voir toutes les annonces</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* My Applications Status */}
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Mes Candidatures</CardTitle>
						<CardDescription>
							Statut de vos candidatures récentes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{[1, 2, 3].map((item) => (
								<div key={item} className="flex items-center space-x-4">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 font-medium text-sm text-white">
										{item === 1 ? "CM" : item === 2 ? "SJ" : "MC"}
									</div>
									<div className="flex-1 space-y-1">
										<p className="font-medium text-sm leading-none">
											{item === 1
												? "Cabinet Dr. Martin"
												: item === 2
													? "Clinique Saint-Joseph"
													: "Centre Médical"}
										</p>
										<p className="text-muted-foreground text-sm">
											{item === 1
												? "Paris 15e • Médecine générale"
												: item === 2
													? "Lyon 6e • Cardiologie"
													: "Marseille 8e • Pédiatrie"}
										</p>
									</div>
									<Badge
										variant={
											item === 1
												? "default"
												: item === 2
													? "secondary"
													: "outline"
										}
									>
										{item === 1
											? "Acceptée"
											: item === 2
												? "En attente"
												: "Vue"}
									</Badge>
								</div>
							))}
						</div>
						<div className="mt-4">
							<Button asChild variant="outline" className="w-full">
								<Link href="/doctor/applications">
									Voir toutes mes candidatures
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Profile & Preferences */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Mon Profil</CardTitle>
						<CardDescription>
							Informations de votre profil médecin
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-lg text-white">
									{profile?.firstName?.[0]}
									{profile?.lastName?.[0]}
								</div>
								<div>
									<p className="font-medium">
										Dr. {profile?.firstName} {profile?.lastName}
									</p>
									<p className="text-muted-foreground text-sm">
										{profile?.experienceYears} ans d'expérience
									</p>
								</div>
							</div>

							<div className="space-y-2">
								<p className="font-medium text-sm">Spécialités :</p>
								<div className="flex flex-wrap gap-2">
									{profile?.specialties?.map((specialty) => (
										<Badge key={specialty} variant="secondary">
											{specialty}
										</Badge>
									)) ?? <Badge variant="outline">Non renseigné</Badge>}
								</div>
							</div>

							<div className="space-y-2">
								<p className="font-medium text-sm">Zone de déplacement :</p>
								<p className="text-muted-foreground text-sm">
									{profile?.preferredLocations?.[0]?.name || "Non spécifié"} •
									Rayon {profile?.preferredLocations?.[0]?.travelRadius || 0} km
								</p>
							</div>
						</div>

						<div className="mt-4">
							<Button asChild variant="outline" className="w-full">
								<Link href="/doctor/profile">Modifier mon profil</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Actions Rapides</CardTitle>
						<CardDescription>
							Raccourcis vers vos actions les plus fréquentes
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3">
							<Button asChild variant="outline" className="justify-start">
								<Link href="/doctor/search">
									<Icons.search className="mr-2 h-4 w-4" />
									Rechercher des annonces
								</Link>
							</Button>

							<Button asChild variant="outline" className="justify-start">
								<Link href="/doctor/applications">
									<Icons.fileText className="mr-2 h-4 w-4" />
									Mes candidatures
								</Link>
							</Button>

							<Button asChild variant="outline" className="justify-start">
								<Link href="/doctor/messages">
									<Icons.messageCircle className="mr-2 h-4 w-4" />
									Messages
								</Link>
							</Button>

							<Button asChild variant="outline" className="justify-start">
								<Link href="/doctor/profile">
									<Icons.settings className="mr-2 h-4 w-4" />
									Paramètres du profil
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
