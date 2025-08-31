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
import { Textarea } from "~/components/ui/textarea";
import { MEDICAL_SPECIALTIES } from "~/lib/constants";
import { cabinetProfileSchema } from "~/lib/validations";
import { api } from "~/trpc/react";
import type { CabinetProfileFormData } from "~/types";

interface CabinetProfileFormProps {
	initialData?: Partial<CabinetProfileFormData>;
	isEditing?: boolean;
}

export function CabinetProfileForm({
	initialData,
	isEditing = false,
}: CabinetProfileFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<CabinetProfileFormData>({
		resolver: zodResolver(cabinetProfileSchema),
		defaultValues: {
			cabinetName: initialData?.cabinetName || "",
			address: initialData?.address || "",
			phone: initialData?.phone || "",
			description: initialData?.description || "",
			specialties: initialData?.specialties || [],
			photos: initialData?.photos || [],
		},
	});

	const createMutation = api.auth.createCabinetProfile.useMutation({
		onSuccess: () => {
			toast.success("Profil cabinet soumis pour validation !");
			router.push("/cabinet/validation-pending");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la création du profil");
			setIsLoading(false);
		},
	});

	const updateMutation = api.auth.updateCabinetProfile.useMutation({
		onSuccess: () => {
			toast.success("Profil cabinet mis à jour avec succès !");
			if (profileCompletion?.isRejected) {
				// If profile was rejected, resubmit for validation
				resubmitMutation.mutate();
			} else {
				router.push("/cabinet/dashboard");
			}
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la mise à jour du profil");
			setIsLoading(false);
		},
	});

	const resubmitMutation = api.auth.resubmitCabinetProfile.useMutation({
		onSuccess: () => {
			toast.success("Profil re-soumis pour validation !");
			router.push("/cabinet/validation-pending");
		},
		onError: (error) => {
			toast.error(error.message || "Erreur lors de la re-soumission");
			setIsLoading(false);
		},
	});

	const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();

	function onSubmit(values: CabinetProfileFormData) {
		setIsLoading(true);

		if (isEditing) {
			updateMutation.mutate(values);
		} else {
			createMutation.mutate(values);
		}
	}

	const selectedSpecialties = form.watch("specialties");

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{/* Validation Information */}
				{!isEditing && (
					<Card className="border-blue-200 bg-blue-50">
						<CardContent className="pt-6">
							<div className="flex items-start space-x-3">
								<Icons.info className="mt-0.5 h-5 w-5 text-blue-600" />
								<div>
									<h4 className="font-medium text-blue-900">
										Validation requise
									</h4>
									<p className="mt-1 text-blue-700 text-sm">
										Votre profil cabinet sera soumis pour validation par notre
										équipe avant activation. Ce processus prend généralement 24
										à 48 heures.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Rejection Information */}
				{isEditing && profileCompletion?.isRejected && (
					<Card className="border-red-200 bg-red-50">
						<CardContent className="pt-6">
							<div className="flex items-start space-x-3">
								<Icons.xCircle className="mt-0.5 h-5 w-5 text-red-600" />
								<div>
									<h4 className="font-medium text-red-900">Profil rejeté</h4>
									<p className="mt-1 text-red-700 text-sm">
										Modifiez votre profil selon les remarques ci-dessous et
										re-soumettez-le pour validation.
									</p>
									{profileCompletion.adminNotes && (
										<div className="mt-3 rounded border border-red-200 bg-white p-3">
											<p className="text-gray-700 text-sm">
												<strong>Remarques:</strong>{" "}
												{profileCompletion.adminNotes}
											</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Basic Information */}
				<Card>
					<CardHeader>
						<CardTitle>Informations du Cabinet</CardTitle>
						<CardDescription>
							Renseignez les informations principales de votre cabinet médical
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="cabinetName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nom du Cabinet *</FormLabel>
									<FormControl>
										<Input placeholder="Cabinet Dr. Martin" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Adresse Complète *</FormLabel>
									<FormControl>
										<Textarea
											placeholder="123 Avenue de la République, 75011 Paris"
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Adresse complète avec code postal et ville
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Téléphone *</FormLabel>
									<FormControl>
										<Input type="tel" placeholder="01 42 34 56 78" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description du Cabinet</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Décrivez votre cabinet, vos équipements, votre équipe..."
											className="resize-none"
											rows={4}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Cette description sera visible par les médecins remplaçants
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Specialties */}
				<Card>
					<CardHeader>
						<CardTitle>Spécialités Médicales</CardTitle>
						<CardDescription>
							Sélectionnez les spécialités pratiquées dans votre cabinet
						</CardDescription>
					</CardHeader>
					<CardContent>
						<FormField
							control={form.control}
							name="specialties"
							render={() => (
								<FormItem>
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
										{MEDICAL_SPECIALTIES.map((specialty) => (
											<FormField
												key={specialty.id}
												control={form.control}
												name="specialties"
												render={({ field }) => {
													return (
														<FormItem
															key={specialty.id}
															className="flex flex-row items-start space-x-3 space-y-0"
														>
															<FormControl>
																<Checkbox
																	checked={field.value?.includes(specialty.id)}
																	onCheckedChange={(checked) => {
																		return checked
																			? field.onChange([
																					...field.value,
																					specialty.id,
																				])
																			: field.onChange(
																					field.value?.filter(
																						(value: string) =>
																							value !== specialty.id,
																					),
																				);
																	}}
																/>
															</FormControl>
															<FormLabel className="font-normal text-sm">
																{specialty.name}
															</FormLabel>
														</FormItem>
													);
												}}
											/>
										))}
									</div>
									<FormMessage />
									{selectedSpecialties.length > 0 && (
										<FormDescription>
											{selectedSpecialties.length} spécialité(s) sélectionnée(s)
										</FormDescription>
									)}
								</FormItem>
							)}
						/>
					</CardContent>
				</Card>

				{/* Submit Button */}
				<div className="flex items-center gap-4">
					<Button type="submit" disabled={isLoading} className="min-w-[120px]">
						{isLoading ? (
							<>
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
								{isEditing ? "Mise à jour..." : "Soumission..."}
							</>
						) : (
							<>
								<Icons.checkCircle className="mr-2 h-4 w-4" />
								{isEditing
									? profileCompletion?.isRejected
										? "Re-soumettre pour validation"
										: "Mettre à jour"
									: "Soumettre pour validation"}
							</>
						)}
					</Button>

					<Button type="button" variant="outline" onClick={() => router.back()}>
						Annuler
					</Button>
				</div>
			</form>
		</Form>
	);
}
