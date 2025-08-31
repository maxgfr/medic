"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function ValidationPendingPage() {
	const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mx-auto max-w-2xl">
				<Card className="border-yellow-200 bg-yellow-50">
					<CardHeader className="text-center">
						<div className="mb-4 flex justify-center">
							<Clock className="h-16 w-16 text-yellow-600" />
						</div>
						<CardTitle className="font-bold text-2xl text-yellow-800">
							Profil en cours de validation
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center">
							<Badge
								variant="outline"
								className="border-yellow-600 text-yellow-800"
							>
								{profileCompletion?.status || "PENDING"}
							</Badge>
						</div>

						<div className="space-y-4">
							<p className="text-center text-gray-700">
								Votre profil cabinet a été soumis avec succès et est
								actuellement en cours de validation par notre équipe
								d'administration.
							</p>

							<div className="rounded-lg border bg-white p-4">
								<h3 className="mb-2 flex items-center font-semibold text-gray-800">
									<CheckCircle className="mr-2 h-5 w-5 text-green-600" />
									Profil complété
								</h3>
								<p className="text-gray-600 text-sm">
									Félicitations ! Votre profil est complet à{" "}
									{profileCompletion?.completionPercentage || 0}%.
								</p>
							</div>

							<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
								<h3 className="mb-2 flex items-center font-semibold text-blue-800">
									<AlertCircle className="mr-2 h-5 w-5 text-blue-600" />
									Que se passe-t-il maintenant ?
								</h3>
								<ul className="space-y-1 text-blue-700 text-sm">
									<li>• Notre équipe examine votre profil cabinet</li>
									<li>• Nous vérifions les informations fournies</li>
									<li>
										• Vous recevrez une notification dès que la validation sera
										terminée
									</li>
									<li>• Le processus prend généralement 24 à 48 heures</li>
								</ul>
							</div>

							<div className="rounded-lg border bg-gray-50 p-4">
								<h3 className="mb-2 font-semibold text-gray-800">
									Pendant l'attente
								</h3>
								<p className="text-gray-600 text-sm">
									Vous pouvez vous déconnecter et revenir plus tard. Nous vous
									enverrons un email de confirmation dès que votre profil sera
									validé.
								</p>
							</div>
						</div>

						<div className="pt-4 text-center">
							<p className="text-gray-500 text-sm">
								Besoin d'aide ? Contactez notre support à{" "}
								<a
									href="mailto:support@medic.fr"
									className="text-blue-600 hover:underline"
								>
									support@medic.fr
								</a>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
