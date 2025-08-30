"use client";

import {
	Calendar,
	ChevronLeft,
	DollarSign,
	MapPin,
	Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { MEDICAL_SPECIALTIES } from "~/lib/constants";
import { api } from "~/trpc/react";
import type { MedicalSpecialty } from "~/types";

export default function NewJobOfferPage() {
	const router = useRouter();

	// Check profile completion
	const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();

	// Form state
	const [formData, setFormData] = useState({
		title: "",
		specialty: "" as MedicalSpecialty | "",
		location: "",
		startDate: "",
		endDate: "",
		retrocessionRate: 70,
		type: "PLANNED" as "URGENT" | "PLANNED" | "RECURRING",
		description: "",
		estimatedPatients: 25,
		housingProvided: false,
		equipment: [] as string[],
		equipmentInput: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	// tRPC mutation
	const createJobOffer = api.jobOffers.create.useMutation({
		onSuccess: () => {
			toast.success("Annonce créée avec succès");
			router.push("/cabinet/job-offers");
		},
		onError: (error) => {
			toast.error(`Erreur lors de la création : ${error.message}`);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Check if profile is complete
		if (!profileCompletion?.isComplete) {
			toast.error(
				"Vous devez compléter votre profil à 100% avant de publier une annonce",
			);
			router.push("/cabinet/profile");
			return;
		}

		if (
			!formData.title ||
			!formData.specialty ||
			!formData.location ||
			!formData.startDate ||
			!formData.endDate
		) {
			toast.error("Veuillez remplir tous les champs obligatoires");
			return;
		}

		if (new Date(formData.endDate) <= new Date(formData.startDate)) {
			toast.error("La date de fin doit être après la date de début");
			return;
		}

		setIsSubmitting(true);

		try {
			await createJobOffer.mutateAsync({
				title: formData.title,
				specialty: formData.specialty,
				location: formData.location,
				startDate: new Date(formData.startDate),
				endDate: new Date(formData.endDate),
				retrocessionRate: formData.retrocessionRate,
				type: formData.type,
				description: formData.description || undefined,
				estimatedPatients: formData.estimatedPatients || undefined,
				housingProvided: formData.housingProvided,
				equipment:
					formData.equipment.length > 0 ? formData.equipment : undefined,
				status: "DRAFT",
			});
		} catch (error) {
			console.error("Erreur création annonce:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const addEquipment = () => {
		if (
			formData.equipmentInput.trim() &&
			!formData.equipment.includes(formData.equipmentInput.trim())
		) {
			setFormData((prev) => ({
				...prev,
				equipment: [...prev.equipment, prev.equipmentInput.trim()],
				equipmentInput: "",
			}));
		}
	};

	const removeEquipment = (index: number) => {
		setFormData((prev) => ({
			...prev,
			equipment: prev.equipment.filter((_, i) => i !== index),
		}));
	};

	return (
		<div className="container mx-auto max-w-4xl py-8">
			{/* Header */}
			<div className="mb-8 flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.back()}
					className="flex items-center gap-2"
				>
					<ChevronLeft className="h-4 w-4" />
					Retour
				</Button>
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Nouvelle annonce
					</h1>
					<p className="text-muted-foreground">
						Créez une nouvelle offre de remplacement médical
					</p>
				</div>
			</div>

			{/* Profile completion warning */}
			{profileCompletion && !profileCompletion.isComplete && (
				<Card className="mb-6 border-yellow-200 bg-yellow-50">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center space-x-2">
							<div className="rounded-full bg-yellow-100 p-2">
								<Icons.alertCircle className="h-5 w-5 text-yellow-600" />
							</div>
							<div>
								<p className="font-medium text-yellow-800">
									Profil incomplet ({profileCompletion.completionPercentage}%)
								</p>
								<p className="text-sm text-yellow-600">
									Vous devez compléter votre profil à 100% pour publier une
									annonce.
									<br />
									Éléments manquants :{" "}
									{profileCompletion.missingFields.join(", ")}
								</p>
							</div>
						</div>
						<Button asChild variant="outline" size="sm">
							<Link href="/cabinet/profile">Compléter le profil</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Informations principales */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Stethoscope className="h-5 w-5" />
							Informations principales
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="title">Titre de l'annonce *</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, title: e.target.value }))
									}
									placeholder="ex: Remplacement médecin généraliste"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="specialty">Spécialité *</Label>
								<Select
									value={formData.specialty}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											specialty: value as MedicalSpecialty,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Sélectionner une spécialité" />
									</SelectTrigger>
									<SelectContent>
										{MEDICAL_SPECIALTIES.map((specialty) => (
											<SelectItem key={specialty.id} value={specialty.id}>
												{specialty.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="location">Localisation *</Label>
							<div className="relative">
								<MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="location"
									value={formData.location}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											location: e.target.value,
										}))
									}
									placeholder="Ville, région ou adresse complète"
									className="pl-10"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								value={formData.description}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder="Décrivez le poste, les missions, l'environnement de travail..."
								rows={4}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Période et conditions */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="h-5 w-5" />
							Période et conditions
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="startDate">Date de début *</Label>
								<Input
									id="startDate"
									type="date"
									value={formData.startDate}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											startDate: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endDate">Date de fin *</Label>
								<Input
									id="endDate"
									type="date"
									value={formData.endDate}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											endDate: e.target.value,
										}))
									}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="type">Type de remplacement</Label>
								<Select
									value={formData.type}
									onValueChange={(value: "URGENT" | "PLANNED" | "RECURRING") =>
										setFormData((prev) => ({ ...prev, type: value }))
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="PLANNED">Planifié</SelectItem>
										<SelectItem value="URGENT">Urgent</SelectItem>
										<SelectItem value="RECURRING">Récurrent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="retrocessionRate">
									Taux de rétrocession (%)
								</Label>
								<div className="relative">
									<DollarSign className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
									<Input
										id="retrocessionRate"
										type="number"
										min="0"
										max="100"
										value={formData.retrocessionRate}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												retrocessionRate: Number(e.target.value),
											}))
										}
										className="pl-10"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="estimatedPatients">Patients estimés/jour</Label>
								<Input
									id="estimatedPatients"
									type="number"
									min="0"
									value={formData.estimatedPatients}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											estimatedPatients: Number(e.target.value),
										}))
									}
								/>
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<Switch
								id="housingProvided"
								checked={formData.housingProvided}
								onCheckedChange={(checked) =>
									setFormData((prev) => ({ ...prev, housingProvided: checked }))
								}
							/>
							<Label htmlFor="housingProvided">Logement fourni</Label>
						</div>
					</CardContent>
				</Card>

				{/* Équipements */}
				<Card>
					<CardHeader>
						<CardTitle>Équipements disponibles</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex gap-2">
							<Input
								value={formData.equipmentInput}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										equipmentInput: e.target.value,
									}))
								}
								placeholder="Ajouter un équipement"
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addEquipment();
									}
								}}
							/>
							<Button type="button" onClick={addEquipment} variant="outline">
								Ajouter
							</Button>
						</div>
						{formData.equipment.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{formData.equipment.map((item, index) => (
									<div
										key={`equipment-${item}`}
										className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-secondary-foreground text-sm"
									>
										{item}
										<button
											type="button"
											onClick={() => removeEquipment(index)}
											className="text-muted-foreground hover:text-foreground"
										>
											×
										</button>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Actions */}
				<div className="flex justify-end gap-4">
					<Button type="button" variant="outline" onClick={() => router.back()}>
						Annuler
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Création..." : "Créer l'annonce"}
					</Button>
				</div>
			</form>
		</div>
	);
}
