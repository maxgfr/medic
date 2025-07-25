"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { CabinetProfileForm } from "~/components/forms/cabinet-profile-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { api } from "~/trpc/react";
import type { MedicalSpecialty } from "~/types";

export default function CabinetProfilePage() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const isOnboarding = searchParams.get("onboarding") === "true";

	const { data: profile, isLoading } = api.auth.getCabinetProfile.useQuery(
		undefined,
		{
			enabled: !!session?.user && !isOnboarding,
			retry: false,
		},
	);

	if (isLoading) {
		return (
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex min-h-[400px] items-center justify-center">
					<Icons.spinner className="h-8 w-8 animate-spin" />
				</div>
			</div>
		);
	}

	const isEditing = !!profile && !isOnboarding;

	return (
		<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="font-bold text-3xl tracking-tight">
						{isOnboarding
							? "Créer votre profil Cabinet"
							: isEditing
								? "Modifier le profil"
								: "Créer votre profil Cabinet"}
					</h2>
					<p className="text-muted-foreground">
						{isOnboarding
							? "Complétez votre profil pour commencer à publier des annonces de remplacement"
							: isEditing
								? "Modifiez les informations de votre cabinet médical"
								: "Renseignez les informations de votre cabinet médical"}
					</p>
				</div>
			</div>

			{isOnboarding && (
				<Card className="border-blue-200 bg-blue-50">
					<CardContent className="flex items-center space-x-4 p-4">
						<Icons.info className="h-5 w-5 text-blue-600" />
						<div>
							<p className="font-medium text-blue-800">
								Configuration initiale
							</p>
							<p className="text-blue-600 text-sm">
								Complétez votre profil pour accéder à toutes les fonctionnalités
								de la plateforme
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="max-w-4xl">
				<CabinetProfileForm
					initialData={
						profile
							? {
									cabinetName: profile.cabinetName,
									address: profile.address,
									phone: profile.phone,
									description: profile.description || undefined,
									specialties: profile.specialties as MedicalSpecialty[],
									photos: profile.photos || undefined,
								}
							: undefined
					}
					isEditing={isEditing}
				/>
			</div>
		</div>
	);
}
