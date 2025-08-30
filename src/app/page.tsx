"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StructuredData } from "~/components/seo/structured-data";
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

export default function HomePage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "loading") return;

		if (session) {
			// User is authenticated, redirect to dashboard
			router.push("/dashboard");
		}
	}, [session, status, router]);

	if (status === "loading") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl">
						<Icons.stethoscope className="h-8 w-8 animate-pulse text-white" />
					</div>
					<p className="font-medium text-slate-600">Chargement...</p>
				</div>
			</div>
		);
	}

	if (session) {
		// Show loading while redirecting
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
				<div className="text-center">
					<div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl">
						<Icons.stethoscope className="h-8 w-8 animate-pulse text-white" />
					</div>
					<p className="font-medium text-slate-600">
						Redirection vers votre dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<StructuredData jobPostings={[]} />
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
				{/* Hero Section */}
				<div className="relative overflow-hidden">
					{/* Enhanced background elements */}
					<div className="absolute inset-0">
						<div className="-top-40 -right-40 absolute h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-blue-200/40 to-indigo-200/40 blur-3xl" />
						<div className="-bottom-40 -left-40 absolute h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-purple-200/30 to-pink-200/30 blur-3xl delay-1000" />
						<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-cyan-200/20 to-blue-200/20 blur-3xl delay-500" />
					</div>

					<div className="container relative mx-auto px-4 py-20 md:py-32">
						<div className="space-y-12 text-center">
							{/* Logo/Icon with enhanced design */}
							<div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl ring-4 ring-blue-200/50">
								<Icons.stethoscope className="h-12 w-12 text-white" />
							</div>

							{/* Launch announcement */}
							<div className="inline-flex animate-bounce items-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2 text-white shadow-lg">
								<Icons.star className="mr-2 h-4 w-4 text-yellow-300" />
								<span className="font-semibold text-sm">
									🚀 Lancement officiel - Soyez parmi les premiers !
								</span>
							</div>

							{/* Main heading with enhanced typography */}
							<div className="space-y-6">
								<h1 className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text font-bold text-6xl text-transparent leading-tight tracking-tight md:text-8xl">
									Medic{" "}
									<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
										Remplacement
									</span>
								</h1>
								<p className="mx-auto max-w-3xl font-medium text-slate-600 text-xl leading-relaxed md:text-2xl">
									🩺 La première plateforme française qui révolutionne la
									connexion entre{" "}
									<span className="font-semibold text-blue-600">
										cabinets médicaux
									</span>{" "}
									et{" "}
									<span className="font-semibold text-indigo-600">
										médecins remplaçants
									</span>
									<br />
									<span className="font-semibold text-emerald-600 text-lg">
										🔥 Accès exclusif aux premiers utilisateurs
									</span>
								</p>
							</div>

							{/* Enhanced CTA Buttons */}
							<div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
								<Button
									asChild
									size="lg"
									className="w-full transform bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl sm:w-auto"
								>
									<Link href="#target-section">
										<Icons.arrowRight className="mr-2 h-5 w-5" />
										Rejoindre l'aventure
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="w-full border-2 border-blue-200 px-8 py-4 text-blue-700 text-lg transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 sm:w-auto"
								>
									<Link href="mailto:contact@medic-remplacement.com">
										<Icons.mail className="mr-2 h-5 w-5" />
										En savoir plus
									</Link>
								</Button>
							</div>

							{/* Trust indicators */}
							<div className="mt-12 text-center">
								<p className="mb-4 font-medium text-slate-500 text-sm">
									🎯 Rejoignez les précurseurs de l'innovation médicale
								</p>
								<div className="flex items-center justify-center space-x-6">
									<div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2">
										<Icons.checkCircle className="h-4 w-4 text-emerald-600" />
										<span className="font-semibold text-emerald-700 text-sm">
											100% Gratuit
										</span>
									</div>
									<div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2">
										<Icons.users className="h-4 w-4 text-blue-600" />
										<span className="font-semibold text-blue-700 text-sm">
											Accès Early Bird
										</span>
									</div>
									<div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2">
										<Icons.star className="h-4 w-4 text-purple-600" />
										<span className="font-semibold text-purple-700 text-sm">
											Lancement 2025
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Section */}
				<div className="border-blue-200/50 border-y bg-white/80 backdrop-blur-sm">
					<div className="container mx-auto px-4 py-16">
						<div className="text-center">
							<Badge className="mb-6 border-amber-200 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
								🚀 Phase de lancement - Opportunité unique
							</Badge>
							<h3 className="mb-8 font-bold text-3xl text-slate-900">
								Rejoignez l'exclusivité des fondateurs
							</h3>
							<div className="mx-auto max-w-4xl space-y-6">
								<div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
									<div className="mb-3 font-bold text-2xl text-blue-600">
										🎯 Vous êtes précurseur
									</div>
									<div className="font-medium text-slate-700">
										En vous inscrivant maintenant, vous bénéficiez :
									</div>
									<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
										<div className="text-center">
											<div className="font-semibold text-emerald-600">
												✅ Accès gratuit à vie
											</div>
											<div className="text-slate-500 text-sm">
												Aucune commission
											</div>
										</div>
										<div className="text-center">
											<div className="font-semibold text-blue-600">
												🏆 Statut VIP
											</div>
											<div className="text-slate-500 text-sm">
												Support prioritaire
											</div>
										</div>
										<div className="text-center">
											<div className="font-semibold text-purple-600">
												💎 Fonctionnalités premium
											</div>
											<div className="text-slate-500 text-sm">
												Dès le lancement
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Features Section with enhanced design */}
				<div className="container mx-auto px-4 py-24">
					<div className="mb-20 text-center">
						<Badge className="mb-4 border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700">
							✨ Fonctionnalités avancées
						</Badge>
						<h2 className="mb-6 bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text font-bold text-5xl text-transparent md:text-6xl">
							La révolution du remplacement médical{" "}
							<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
								commence ici
							</span>
						</h2>
						<p className="mx-auto max-w-3xl text-slate-600 text-xl leading-relaxed">
							Découvrez en avant-première la technologie qui va transformer le
							secteur médical français
						</p>
					</div>

					<div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
						{/* Feature 1 - Enhanced */}
						<Card className="group relative overflow-hidden border-blue-200/50 bg-gradient-to-br from-white to-blue-50/50 shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardHeader className="relative pb-4">
								<div className="flex items-center space-x-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg ring-4 ring-blue-200/30">
										<Icons.search className="h-7 w-7 text-white" />
									</div>
									<div>
										<CardTitle className="text-slate-800 text-xl">
											🎯 Recherche IA
										</CardTitle>
										<Badge variant="secondary" className="mt-1 text-xs">
											Nouvelle technologie
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="relative">
								<CardDescription className="mb-4 text-base text-slate-600 leading-relaxed">
									Algorithme d'IA propriétaire développé spécialement pour le
									secteur médical français. Analyse prédictive des besoins.
								</CardDescription>
								<div className="space-y-2">
									<div className="flex items-center text-slate-600 text-sm">
										<Icons.checkCircle className="mr-2 h-4 w-4 text-emerald-500" />
										Filtres intelligents automatiques
									</div>
									<div className="flex items-center text-slate-600 text-sm">
										<Icons.checkCircle className="mr-2 h-4 w-4 text-emerald-500" />
										Notifications personnalisées
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Feature 2 - Enhanced */}
						<Card className="group relative overflow-hidden border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/50 shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardHeader className="relative pb-4">
								<div className="flex items-center space-x-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg ring-4 ring-emerald-200/30">
										<Icons.messageCircle className="h-7 w-7 text-white" />
									</div>
									<div>
										<CardTitle className="text-slate-800 text-xl">
											💬 Communication sécurisée
										</CardTitle>
										<Badge variant="secondary" className="mt-1 text-xs">
											Chiffrement E2E
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="relative">
								<CardDescription className="mb-4 text-base text-slate-600 leading-relaxed">
									Infrastructure propriétaire avec chiffrement militaire.
									Première plateforme médicale avec certification bancaire.
								</CardDescription>
								<div className="space-y-2">
									<div className="flex items-center text-slate-600 text-sm">
										<Icons.checkCircle className="mr-2 h-4 w-4 text-emerald-500" />
										Messages temps réel
									</div>
									<div className="flex items-center text-slate-600 text-sm">
										<Icons.checkCircle className="mr-2 h-4 w-4 text-emerald-500" />
										Partage de documents sécurisé
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Feature 3 - Enhanced */}
						<Card className="group relative overflow-hidden border-purple-200/50 bg-gradient-to-br from-white to-purple-50/50 shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardHeader className="relative pb-4">
								<div className="flex items-center space-x-4">
									<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg ring-4 ring-purple-200/30">
										<Icons.checkCircle className="h-7 w-7 text-white" />
									</div>
									<div>
										<CardTitle className="text-slate-800 text-xl">
											🛡️ Sécurité premium
										</CardTitle>
										<Badge variant="secondary" className="mt-1 text-xs">
											Certifié RGPD
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="relative">
								<CardDescription className="mb-4 text-base text-slate-600 leading-relaxed">
									Conformité HDS (Hébergement de Données de Santé), certifié ISO
									27001. Premier acteur 100% conforme à la réglementation
									française.
								</CardDescription>
								<div className="space-y-2">
									<div className="flex items-center text-slate-600 text-sm">
										<Icons.checkCircle className="mr-2 h-4 w-4 text-emerald-500" />
										Authentification 2FA
									</div>
									<div className="flex items-center text-slate-600 text-sm">
										<Icons.checkCircle className="mr-2 h-4 w-4 text-emerald-500" />
										Backup automatique 24/7
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Testimonials Section */}
				<div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-24">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<Badge className="mb-4 border-emerald-200 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
								� L'attente grandit
							</Badge>
							<h2 className="mb-6 font-bold text-4xl text-slate-900 md:text-5xl">
								Les professionnels attendent cette révolution
							</h2>
							<p className="mx-auto max-w-2xl text-lg text-slate-600">
								Découvrez pourquoi le secteur médical a besoin de cette
								innovation
							</p>
						</div>

						<div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
							{/* Pain Point 1 */}
							<Card className="relative overflow-hidden border-slate-200 bg-white shadow-xl">
								<CardContent className="p-6">
									<div className="mb-4 flex items-center space-x-2">
										<Icons.alertCircle className="h-5 w-5 text-red-500" />
										<span className="font-bold text-red-600">
											Problème actuel
										</span>
									</div>
									<p className="mb-4 text-slate-700 leading-relaxed">
										"Nous perdons des heures à chercher des remplaçants sur des
										plateformes obsolètes. Le processus est archaïque et
										inefficace."
									</p>
									<div className="flex items-center space-x-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500">
											<span className="font-semibold text-sm text-white">
												ML
											</span>
										</div>
										<div>
											<p className="font-semibold text-slate-900">
												Dr. Marie L.
											</p>
											<p className="text-slate-500 text-sm">
												Cabinet médical, Paris
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Pain Point 2 */}
							<Card className="relative overflow-hidden border-slate-200 bg-white shadow-xl">
								<CardContent className="p-6">
									<div className="mb-4 flex items-center space-x-2">
										<Icons.alertCircle className="h-5 w-5 text-red-500" />
										<span className="font-bold text-red-600">Frustration</span>
									</div>
									<p className="mb-4 text-slate-700 leading-relaxed">
										"Les outils existants ne comprennent pas nos spécificités.
										Il faut une solution pensée PAR et POUR les médecins."
									</p>
									<div className="flex items-center space-x-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500">
											<span className="font-semibold text-sm text-white">
												JS
											</span>
										</div>
										<div>
											<p className="font-semibold text-slate-900">
												Dr. Jean S.
											</p>
											<p className="text-slate-500 text-sm">
												Médecin remplaçant, Lyon
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Solution Promise */}
							<Card className="relative overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl">
								<CardContent className="p-6">
									<div className="mb-4 flex items-center space-x-2">
										<Icons.checkCircle className="h-5 w-5 text-emerald-500" />
										<span className="font-bold text-emerald-600">
											Notre promesse
										</span>
									</div>
									<p className="mb-4 font-semibold text-emerald-800 leading-relaxed">
										"Medic Remplacement va enfin apporter la solution moderne
										que nous attendons. J'ai hâte de la tester !"
									</p>
									<div className="flex items-center space-x-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
											<span className="font-semibold text-sm text-white">
												AC
											</span>
										</div>
										<div>
											<p className="font-semibold text-slate-900">
												Dr. Anne C.
											</p>
											<p className="text-slate-500 text-sm">
												Cabinet pluridisciplinaire, Marseille
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				<div id="target-section" className="container mx-auto px-4 py-24">
					<div className="mb-20 text-center">
						<Badge className="mb-4 border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700">
							🎯 Rejoignez-nous
						</Badge>
						<h2 className="mb-6 bg-gradient-to-r from-slate-900 to-purple-900 bg-clip-text font-bold text-5xl text-transparent md:text-6xl">
							Fait pour vous
						</h2>
						<p className="mx-auto max-w-3xl text-slate-600 text-xl leading-relaxed">
							Soyez les premiers à expérimenter l'avenir du remplacement
							médical. Accès exclusif et gratuit pour les pionniers qui croient
							en l'innovation.
						</p>
					</div>

					<div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
						<Card className="group relative overflow-hidden border-blue-200 bg-gradient-to-br from-white to-blue-50/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl">
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardHeader className="relative pb-6">
								<div className="flex items-center space-x-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-xl ring-4 ring-blue-200/30">
										<Icons.building className="h-8 w-8 text-white" />
									</div>
									<div>
										<CardTitle className="text-2xl text-slate-800">
											🏥 Cabinets Médicaux
										</CardTitle>
										<CardDescription className="text-base text-slate-600">
											Trouvez rapidement des médecins remplaçants qualifiés
										</CardDescription>
										<Badge className="mt-2 border-emerald-200 bg-emerald-100 text-emerald-700">
											🚀 Prêt pour le lancement
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="relative space-y-6">
								<ul className="space-y-4 text-slate-700">
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Publication d'annonces simplifiée
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Interface intuitive, publication en 2 minutes
											</p>
										</div>
									</li>
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Candidatures pré-qualifiées
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Profils vérifiés et diplômes validés
											</p>
										</div>
									</li>
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Messagerie intégrée
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Communication sécurisée et traçable
											</p>
										</div>
									</li>
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Gestion automatisée
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Notifications et suivi automatique
											</p>
										</div>
									</li>
								</ul>
								<div className="space-y-3 pt-6">
									<Button
										asChild
										className="w-full transform bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
									>
										<Link href="/register-cabinet">
											<Icons.arrowRight className="mr-2 h-4 w-4" />
											Rejoindre gratuitement
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
									>
										<Link href="/login-cabinet">J'ai déjà un compte</Link>
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card className="group relative overflow-hidden border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl">
							<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardHeader className="relative pb-6">
								<div className="flex items-center space-x-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xl ring-4 ring-emerald-200/30">
										<Icons.stethoscope className="h-8 w-8 text-white" />
									</div>
									<div>
										<CardTitle className="text-2xl text-slate-800">
											👨‍⚕️ Médecins Remplaçants
										</CardTitle>
										<CardDescription className="text-base text-slate-600">
											Accédez à de nombreuses opportunités
										</CardDescription>
										<Badge className="mt-2 border-blue-200 bg-blue-100 text-blue-700">
											⚡ Accès prioritaire
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent className="relative space-y-6">
								<ul className="space-y-4 text-slate-700">
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-indigo-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Recherche personnalisée
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Filtres par région, spécialité, dates
											</p>
										</div>
									</li>
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-indigo-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Recommandations IA
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Opportunités adaptées à votre profil
											</p>
										</div>
									</li>
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-indigo-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Candidature en un clic
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Process simplifié et rapide
											</p>
										</div>
									</li>
									<li className="flex items-start">
										<div className="mt-1 mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-indigo-400">
											<Icons.check className="h-4 w-4 text-white" />
										</div>
										<div>
											<span className="font-semibold text-sm">
												Communication directe
											</span>
											<p className="mt-1 text-slate-500 text-xs">
												Chat intégré avec les cabinets
											</p>
										</div>
									</li>
								</ul>
								<div className="space-y-3 pt-6">
									<Button
										asChild
										className="w-full transform bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
									>
										<Link href="/register-doctor">
											<Icons.arrowRight className="mr-2 h-4 w-4" />
											Commencer maintenant
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
									>
										<Link href="/login-doctor">J'ai déjà un compte</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* FAQ Section */}
				<div className="bg-gradient-to-br from-slate-50 to-blue-50 py-24">
					<div className="container mx-auto px-4">
						<div className="mb-16 text-center">
							<Badge className="mb-4 border-amber-200 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
								❓ Questions fréquentes
							</Badge>
							<h2 className="mb-6 font-bold text-4xl text-slate-900 md:text-5xl">
								Des questions ?
							</h2>
							<p className="mx-auto max-w-2xl text-lg text-slate-600">
								Nous avons les réponses à vos questions les plus courantes
							</p>
						</div>

						<div className="mx-auto max-w-4xl space-y-4">
							{[
								{
									q: "Comment fonctionne la vérification des profils ?",
									a: "Tous les médecins remplaçants doivent fournir leurs diplômes et certifications. Notre équipe vérifie chaque document avant validation du profil.",
								},
								{
									q: "Y a-t-il des frais pour utiliser la plateforme ?",
									a: "L'inscription et la recherche sont gratuites. Nous ne prenons qu'une petite commission sur les remplacements réussis, payée uniquement par les cabinets.",
								},
								{
									q: "Comment puis-je être sûr de la qualité des remplaçants ?",
									a: "Système de notation, commentaires après chaque mission, vérification des diplômes et assurance responsabilité civile professionnelle obligatoire.",
								},
								{
									q: "La plateforme est-elle sécurisée ?",
									a: "Oui, nous respectons le RGPD, utilisons un chiffrement SSL et stockons toutes les données sur des serveurs sécurisés en France.",
								},
							].map((faq, i) => (
								<Card
									key={i.toString()}
									className="border-slate-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
								>
									<CardContent className="p-6">
										<h3 className="mb-3 font-semibold text-lg text-slate-900">
											{faq.q}
										</h3>
										<p className="text-slate-600 leading-relaxed">{faq.a}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>

				{/* CTA Section */}
				<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-24 text-white">
					<div className="container mx-auto px-4 text-center">
						<div className="mx-auto max-w-4xl space-y-8">
							<div className="inline-flex items-center rounded-full bg-white/20 px-6 py-2 backdrop-blur-sm">
								<Icons.clock className="mr-2 h-4 w-4" />
								<span className="font-medium text-sm">
									⚡ Offre de lancement limitée
								</span>
							</div>

							<h2 className="font-bold text-5xl leading-tight md:text-6xl">
								L'avenir commence maintenant
							</h2>

							<p className="mx-auto max-w-2xl text-blue-100 text-xl leading-relaxed">
								Rejoignez le mouvement qui transforme la médecine française.
								Première plateforme IA native pour les remplacements médicaux.
							</p>

							<div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
								<Button
									asChild
									size="lg"
									className="w-full transform bg-white px-8 py-4 font-semibold text-blue-600 text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-50 hover:shadow-2xl sm:w-auto"
								>
									<Link href="#target-section">
										<Icons.arrowRight className="mr-2 h-5 w-5" />
										Réserver ma place
									</Link>
								</Button>
								<Button
									asChild
									variant="ghost"
									size="lg"
									className="w-full border-2 border-white/30 px-8 py-4 font-semibold text-lg transition-all duration-300 hover:bg-white/10 sm:w-auto"
								>
									<Link href="mailto:contact@medic-remplacement.com">
										<Icons.mail className="mr-2 h-5 w-5" />
										Nous contacter
									</Link>
								</Button>
							</div>

							<div className="pt-8 text-center">
								<p className="text-blue-200 text-sm">
									🎯 Accès limité aux 100 premiers inscrits • ⚡ Lancement
									imminent • 🔥 Fonctionnalités exclusives
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
