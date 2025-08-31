"use client";

import { AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";

export default function ValidationRejectedPage() {
	const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();
	const router = useRouter();

	const handleGoToProfile = () => {
		router.push("/cabinet/profile");
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mx-auto max-w-2xl">
				<Card className="border-red-200 bg-red-50">
					<CardHeader className="text-center">
						<div className="mb-4 flex justify-center">
							<XCircle className="h-16 w-16 text-red-600" />
						</div>
						<CardTitle className="font-bold text-2xl text-red-800">
							Profil non validé
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="text-center">
							<Badge variant="outline" className="border-red-600 text-red-800">
								{profileCompletion?.status || "REJECTED"}
							</Badge>
						</div>

						<div className="space-y-4">
							<p className="text-center text-gray-700">
								Malheureusement, votre profil cabinet n'a pas pu être validé par
								notre équipe d'administration.
							</p>

							{profileCompletion?.adminNotes && (
								<div className="rounded-lg border border-red-200 bg-white p-4">
									<h3 className="mb-2 flex items-center font-semibold text-red-800">
										<AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
										Motif du rejet
									</h3>
									<p className="text-gray-700 text-sm">
										{profileCompletion.adminNotes}
									</p>
								</div>
							)}

							<div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
								<h3 className="mb-2 flex items-center font-semibold text-orange-800">
									<RefreshCw className="mr-2 h-5 w-5 text-orange-600" />
									Prochaines étapes
								</h3>
								<ul className="space-y-1 text-orange-700 text-sm">
									<li>• Consultez les remarques de notre équipe ci-dessus</li>
									<li>• Modifiez votre profil selon les recommandations</li>
									<li>
										• Resoumettez votre profil pour une nouvelle validation
									</li>
									<li>• Notre équipe réexaminera votre dossier</li>
								</ul>
							</div>

							<div className="rounded-lg border bg-gray-50 p-4">
								<h3 className="mb-2 font-semibold text-gray-800">
									Besoin d'aide ?
								</h3>
								<p className="text-gray-600 text-sm">
									Si vous avez des questions sur les motifs du rejet ou besoin
									d'aide pour corriger votre profil, n'hésitez pas à nous
									contacter.
								</p>
							</div>
						</div>

						<div className="pt-4 text-center">
							<Button onClick={handleGoToProfile} className="mb-4">
								Modifier mon profil
							</Button>
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
