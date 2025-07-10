"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { DoctorProfileForm } from "~/components/forms/doctor-profile-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { api } from "~/trpc/react";

export default function DoctorProfilePage() {
	const { data: session } = useSession();
	const searchParams = useSearchParams();
	const isOnboarding = searchParams.get("onboarding") === "true";

	const { data: profile, isLoading } = api.auth.getDoctorProfile.useQuery(
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
							? "Créer votre profil Médecin"
							: isEditing
								? "Modifier le profil"
								: "Créer votre profil Médecin"}
					</h2>
					<p className="text-muted-foreground">
						{isOnboarding
							? "Complétez votre profil pour commencer à rechercher des remplacements"
							: isEditing
								? "Modifiez vos informations professionnelles et préférences"
								: "Renseignez vos informations professionnelles et préférences"}
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
								Complétez votre profil pour recevoir des recommandations
								personnalisées et candidater aux annonces
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="max-w-4xl">
				<DoctorProfileForm
					initialData={
						profile
							? {
									firstName: profile.firstName,
									lastName: profile.lastName,
									specialties: profile.specialties as import(
										"~/types",
									).MedicalSpecialty[],
									experienceYears: profile.experienceYears,
									preferredLocations: profile.preferredLocations,
									documents: profile.documents || undefined,
									generalAvailability: profile.generalAvailability,
									specificAvailabilities:
										profile.specificAvailabilities || undefined,
									preferredRate: profile.preferredRate
										? Number(profile.preferredRate)
										: undefined,
								}
							: undefined
					}
					isEditing={isEditing}
				/>
			</div>
		</div>
	);
}
