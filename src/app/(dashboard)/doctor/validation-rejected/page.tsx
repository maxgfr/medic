"use client";

import { AlertTriangle, Edit3, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function DoctorValidationRejectedPage() {
	const [isResubmitting, setIsResubmitting] = useState(false);
	const { data: profileCompletion, refetch } =
		api.auth.getProfileCompletion.useQuery();
	const resubmitMutation = api.auth.resubmitDoctorProfile.useMutation({
		onSuccess: () => {
			toast.success("Profil re-soumis avec succès !");
			void refetch();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleResubmit = async () => {
		setIsResubmitting(true);
		try {
			await resubmitMutation.mutateAsync();
		} finally {
			setIsResubmitting(false);
		}
	};

	if (!profileCompletion || profileCompletion.status !== "REJECTED") {
		return null;
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-6 py-8">
			<div className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
					<AlertTriangle className="h-8 w-8 text-red-600" />
				</div>
				<h1 className="font-bold text-3xl text-gray-900">
					Profil médecin rejeté
				</h1>
				<p className="mt-2 text-gray-600 text-lg">
					Votre profil médecin nécessite des modifications avant d'être
					approuvé.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Badge variant="destructive">REJETÉ</Badge>
						Statut de validation
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg bg-red-50 p-4">
						<h3 className="font-semibold text-red-800">
							Modifications requises
						</h3>
						<p className="mt-1 text-red-700">
							Votre profil a été examiné par notre équipe et nécessite des
							corrections avant d'être approuvé.
						</p>
					</div>

					{profileCompletion.adminNotes && (
						<div className="rounded-lg border-red-500 border-l-4 bg-red-50 p-4">
							<h4 className="font-semibold text-red-800">
								Notes de l'administrateur :
							</h4>
							<p className="mt-1 whitespace-pre-wrap text-red-700">
								{profileCompletion.adminNotes}
							</p>
						</div>
					)}

					<div className="text-gray-600 text-sm">
						<strong>Complétude du profil :</strong>{" "}
						{profileCompletion.completionPercentage}%
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Actions recommandées</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						<div className="flex items-start gap-3 rounded-lg border p-4">
							<Edit3 className="mt-1 h-5 w-5 text-blue-600" />
							<div className="flex-1">
								<h4 className="font-semibold">1. Modifier votre profil</h4>
								<p className="text-gray-600 text-sm">
									Corrigez les informations selon les indications de
									l'administrateur.
								</p>
								<Link href="/doctor/profile" className="mt-2 inline-block">
									<Button variant="outline" size="sm">
										Modifier le profil
									</Button>
								</Link>
							</div>
						</div>

						<div className="flex items-start gap-3 rounded-lg border p-4">
							<RefreshCw className="mt-1 h-5 w-5 text-green-600" />
							<div className="flex-1">
								<h4 className="font-semibold">
									2. Re-soumettre pour validation
								</h4>
								<p className="text-gray-600 text-sm">
									Une fois les modifications effectuées, re-soumettez votre
									profil.
								</p>
								<Button
									onClick={handleResubmit}
									disabled={isResubmitting || resubmitMutation.isPending}
									size="sm"
									className="mt-2"
								>
									{isResubmitting ? "Re-soumission..." : "Re-soumettre"}
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Éléments à vérifier</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="text-gray-600 text-sm">
							Assurez-vous que les éléments suivants sont corrects :
						</div>
						<ul className="space-y-2 text-gray-600 text-sm">
							<li className="flex items-center gap-2">
								<span className="h-1 w-1 rounded-full bg-gray-400" />
								Informations personnelles (nom, prénom)
							</li>
							<li className="flex items-center gap-2">
								<span className="h-1 w-1 rounded-full bg-gray-400" />
								Spécialités médicales déclarées
							</li>
							<li className="flex items-center gap-2">
								<span className="h-1 w-1 rounded-full bg-gray-400" />
								Années d'expérience
							</li>
							<li className="flex items-center gap-2">
								<span className="h-1 w-1 rounded-full bg-gray-400" />
								Documents justificatifs (diplômes, inscription à l'Ordre)
							</li>
							<li className="flex items-center gap-2">
								<span className="h-1 w-1 rounded-full bg-gray-400" />
								Zones géographiques préférées
							</li>
							<li className="flex items-center gap-2">
								<span className="h-1 w-1 rounded-full bg-gray-400" />
								Disponibilités
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Besoin d'aide ?</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-3 text-gray-600 text-sm">
						Si vous avez des questions concernant les raisons du rejet ou besoin
						d'assistance pour modifier votre profil, contactez notre équipe
						support.
					</p>
					<div className="space-y-2 text-sm">
						<div>
							<strong>Email :</strong>{" "}
							<a
								href="mailto:support@medic-platform.fr"
								className="text-blue-600 hover:underline"
							>
								support@medic-platform.fr
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
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
