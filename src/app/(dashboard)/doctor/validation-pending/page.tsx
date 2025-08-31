"use client";

import { Clock, FileText, Mail } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function DoctorValidationPendingPage() {
	const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();

	return (
		<div className="container mx-auto max-w-4xl space-y-6 py-8">
			<div className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
					<Clock className="h-8 w-8 text-yellow-600" />
				</div>
				<h1 className="font-bold text-3xl text-gray-900">
					Profil en cours de validation
				</h1>
				<p className="mt-2 text-gray-600 text-lg">
					Votre profil médecin est actuellement en cours d'examen par notre
					équipe administrative.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Badge
							variant="secondary"
							className="bg-yellow-100 text-yellow-800"
						>
							EN ATTENTE
						</Badge>
						Statut de validation
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg bg-yellow-50 p-4">
						<h3 className="font-semibold text-yellow-800">
							Que se passe-t-il maintenant ?
						</h3>
						<p className="mt-1 text-yellow-700">
							Notre équipe vérifie les informations de votre profil médecin,
							notamment vos qualifications, spécialités et documents fournis.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-lg border p-4">
							<h4 className="font-semibold text-gray-900">
								Temps de traitement habituel
							</h4>
							<p className="mt-1 text-gray-600 text-sm">
								Entre 24 et 72 heures ouvrables
							</p>
						</div>
						<div className="rounded-lg border p-4">
							<h4 className="font-semibold text-gray-900">
								Complétude du profil
							</h4>
							<p className="mt-1 text-gray-600 text-sm">
								{profileCompletion?.completionPercentage ?? 0}% complété
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Documents en cours d'examen
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-center justify-between rounded-lg border p-3">
							<span className="text-sm">Diplôme médical</span>
							<Badge
								variant="outline"
								className="border-yellow-200 text-yellow-600"
							>
								En cours
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-lg border p-3">
							<span className="text-sm">Inscription à l'Ordre</span>
							<Badge
								variant="outline"
								className="border-yellow-200 text-yellow-600"
							>
								En cours
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-lg border p-3">
							<span className="text-sm">Spécialités déclarées</span>
							<Badge
								variant="outline"
								className="border-yellow-200 text-yellow-600"
							>
								En cours
							</Badge>
						</div>
						<div className="flex items-center justify-between rounded-lg border p-3">
							<span className="text-sm">Expérience professionnelle</span>
							<Badge
								variant="outline"
								className="border-yellow-200 text-yellow-600"
							>
								En cours
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Mail className="h-5 w-5" />
						Besoin d'aide ?
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-3 text-gray-600 text-sm">
						Si vous avez des questions concernant le processus de validation ou
						si vous souhaitez nous faire parvenir des documents complémentaires,
						n'hésitez pas à nous contacter.
					</p>
					<div className="space-y-2 text-sm">
						<div>
							<strong>Email :</strong>{" "}
							<a
								href="mailto:validation@medic-platform.fr"
								className="text-blue-600 hover:underline"
							>
								validation@medic-platform.fr
							</a>
						</div>
						<div>
							<strong>Téléphone :</strong>{" "}
							<a
								href="tel:+33123456789"
								className="text-blue-600 hover:underline"
							>
								01 23 45 67 89
							</a>
						</div>
						<div className="text-gray-500 text-xs">
							Service disponible du lundi au vendredi de 9h à 18h
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
