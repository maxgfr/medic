"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { DAYS_OF_WEEK, MEDICAL_SPECIALTIES } from "~/lib/constants";
import { doctorProfileSchema } from "~/lib/validations";
import { api } from "~/trpc/react";
import type { DoctorProfileFormData } from "~/types";

interface DoctorProfileFormProps {
	initialData?: Partial<DoctorProfileFormData>;
	isEditing?: boolean;
}

export function DoctorProfileForm({
	initialData,
	isEditing = false,
}: DoctorProfileFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<DoctorProfileFormData>({
		resolver: zodResolver(doctorProfileSchema),
		defaultValues: {
			firstName: initialData?.firstName || "",
			lastName: initialData?.lastName || "",
			specialties: initialData?.specialties || [],
			experienceYears: initialData?.experienceYears || 0,
			preferredLocations: initialData?.preferredLocations || [
				{
					name: "",
					travelRadius: 50,
					priority: 1,
				},
			],
			documents: initialData?.documents || [],
			generalAvailability: initialData?.generalAvailability || {
				monday: true,
				tuesday: true,
				wednesday: true,
				thursday: true,
				friday: true,
				saturday: false,
				sunday: false,
			},
			specificAvailabilities: initialData?.specificAvailabilities || [],
			preferredRate: initialData?.preferredRate || undefined,
		},
	});

	const createMutation = api.auth.createDoctorProfile.useMutation({
		onSuccess: () => {
			toast.success("Profil médecin créé avec succès !");
			router.push("/doctor/dashboard");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création du profil");
			setIsLoading(false);
		},
	});

	const updateMutation = api.auth.updateDoctorProfile.useMutation({
		onSuccess: () => {
			toast.success("Profil médecin mis à jour avec succès !");
			setIsLoading(false);
			router.refresh();
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour du profil");
			setIsLoading(false);
		},
	});

	function onSubmit(values: DoctorProfileFormData) {
		setIsLoading(true);

		if (isEditing) {
			updateMutation.mutate(values);
		} else {
			createMutation.mutate(values);
		}
	}

	const generalAvailability = form.watch("generalAvailability");

	return (
		<Card className="mx-auto w-full max-w-2xl">
			<CardHeader>
				<CardTitle>
					{isEditing ? "Modifier le profil médecin" : "Créer le profil médecin"}
				</CardTitle>
				<CardDescription>
					{isEditing
						? "Mettez à jour vos informations professionnelles"
						: "Renseignez vos informations professionnelles pour commencer"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Personal Information */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Prénom *</FormLabel>
										<FormControl>
											<Input placeholder="Jean" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nom *</FormLabel>
										<FormControl>
											<Input placeholder="Dupont" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="experienceYears"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Années d'expérience *</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="5"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Specialties */}
						<FormField
							control={form.control}
							name="specialties"
							render={() => (
								<FormItem>
									<FormLabel>Spécialités *</FormLabel>
									<FormDescription>
										Sélectionnez au moins une spécialité
									</FormDescription>
									<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
										{MEDICAL_SPECIALTIES.map((specialty) => (
											<FormField
												key={specialty.id}
												control={form.control}
												name="specialties"
												render={({ field }) => (
													<FormItem className="flex flex-row items-start space-x-3 space-y-0">
														<FormControl>
															<Checkbox
																checked={field.value?.includes(specialty.id)}
																onCheckedChange={(checked) => {
																	const currentValue = field.value || [];
																	if (checked) {
																		field.onChange([
																			...currentValue,
																			specialty.id,
																		]);
																	} else {
																		field.onChange(
																			currentValue.filter(
																				(value: string) =>
																					value !== specialty.id,
																			),
																		);
																	}
																}}
															/>
														</FormControl>
														<FormLabel className="font-normal text-sm">
															{specialty.name}
														</FormLabel>
													</FormItem>
												)}
											/>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Primary Preferred Location */}
						<FormField
							control={form.control}
							name="preferredLocations.0.name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Localisation Préférée *</FormLabel>
									<FormControl>
										<Input placeholder="Paris, Lyon, Marseille..." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="preferredLocations.0.travelRadius"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rayon de Déplacement *</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="50"
											{...field}
											onChange={(e) => field.onChange(Number(e.target.value))}
										/>
									</FormControl>
									<FormDescription>Distance en kilomètres</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* General Availability */}
						<FormField
							control={form.control}
							name="generalAvailability"
							render={() => (
								<FormItem>
									<FormLabel>Disponibilités générales *</FormLabel>
									<FormDescription>
										Sélectionnez vos jours de disponibilité habituels
									</FormDescription>
									<div className="grid grid-cols-2 gap-2">
										{DAYS_OF_WEEK.map((day) => (
											<FormField
												key={day.key}
												control={form.control}
												name={`generalAvailability.${
													day.key as keyof typeof generalAvailability
												}`}
												render={({ field }) => (
													<FormItem className="flex flex-row items-start space-x-3 space-y-0">
														<FormControl>
															<Checkbox
																checked={field.value}
																onCheckedChange={(checked) => {
																	const currentAvailability = form.getValues(
																		"generalAvailability",
																	);
																	form.setValue("generalAvailability", {
																		...currentAvailability,
																		[day.key]: checked,
																	});
																}}
															/>
														</FormControl>
														<FormLabel className="font-normal text-sm">
															{day.label}
														</FormLabel>
													</FormItem>
												)}
											/>
										))}
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Preferred Rate */}
						<FormField
							control={form.control}
							name="preferredRate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tarif journalier souhaité (optionnel)</FormLabel>
									<FormControl>
										<Input
											type="number"
											placeholder="400"
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value ? Number(e.target.value) : undefined,
												)
											}
										/>
									</FormControl>
									<FormDescription>Tarif en euros par jour</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading && (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							)}
							{isEditing ? "Mettre à jour" : "Créer le profil"}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
