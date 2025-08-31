"use client";

import { CheckCircle, Clock, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

export default function DoctorValidationPage() {
	const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
	const [adminNotes, setAdminNotes] = useState("");
	const [actionType, setActionType] = useState<"approve" | "reject" | null>(
		null,
	);

	const { data: pendingDoctors, refetch } =
		api.auth.getPendingDoctors.useQuery();
	const approveMutation = api.auth.approveDoctor.useMutation({
		onSuccess: () => {
			toast.success("Médecin approuvé avec succès !");
			void refetch();
			resetForm();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const rejectMutation = api.auth.rejectDoctor.useMutation({
		onSuccess: () => {
			toast.success("Médecin rejeté avec succès !");
			void refetch();
			resetForm();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const resetForm = () => {
		setSelectedDoctor(null);
		setAdminNotes("");
		setActionType(null);
	};

	const handleAction = async () => {
		if (!selectedDoctor || !actionType) return;

		if (actionType === "approve") {
			await approveMutation.mutateAsync({
				doctorId: selectedDoctor,
				adminNotes: adminNotes || undefined,
			});
		} else {
			if (!adminNotes.trim()) {
				toast.error("Les notes administratives sont requises pour un rejet");
				return;
			}
			await rejectMutation.mutateAsync({
				doctorId: selectedDoctor,
				adminNotes: adminNotes,
			});
		}
	};

	const openDialog = (doctorId: string, action: "approve" | "reject") => {
		setSelectedDoctor(doctorId);
		setActionType(action);
		setAdminNotes("");
	};

	if (!pendingDoctors) {
		return (
			<div className="container mx-auto max-w-6xl py-8">
				<div className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-blue-200 border-t-blue-600">
						<Clock className="h-8 w-8" />
					</div>
					<p className="text-gray-600">Chargement des médecins en attente...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-6xl space-y-6 py-8">
			<div className="text-center">
				<h1 className="font-bold text-3xl text-gray-900">
					Validation des médecins
				</h1>
				<p className="mt-2 text-gray-600">
					Interface d'administration pour valider les profils médecins
				</p>
			</div>

			<div className="mb-6 grid gap-4 sm:grid-cols-3">
				<Card>
					<CardContent className="flex items-center gap-4 p-6">
						<div className="rounded-full bg-yellow-100 p-3">
							<Clock className="h-6 w-6 text-yellow-600" />
						</div>
						<div>
							<p className="text-gray-600 text-sm">En attente</p>
							<p className="font-bold text-2xl">{pendingDoctors.length}</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-4 p-6">
						<div className="rounded-full bg-green-100 p-3">
							<CheckCircle className="h-6 w-6 text-green-600" />
						</div>
						<div>
							<p className="text-gray-600 text-sm">Approuvés aujourd'hui</p>
							<p className="font-bold text-2xl">0</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="flex items-center gap-4 p-6">
						<div className="rounded-full bg-red-100 p-3">
							<XCircle className="h-6 w-6 text-red-600" />
						</div>
						<div>
							<p className="text-gray-600 text-sm">Rejetés aujourd'hui</p>
							<p className="font-bold text-2xl">0</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{pendingDoctors.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
						<h3 className="mb-2 font-semibold text-gray-900 text-lg">
							Aucun médecin en attente
						</h3>
						<p className="text-gray-600 text-sm">
							Tous les médecins ont été traités. Revenez plus tard pour de
							nouvelles demandes.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{pendingDoctors.map((doctor) => (
						<Card key={doctor.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div>
										<CardTitle className="flex items-center gap-2">
											<User className="h-5 w-5" />
											Dr. {doctor.firstName} {doctor.lastName}
										</CardTitle>
										<CardDescription className="flex items-center gap-2">
											<Badge
												variant="secondary"
												className="bg-yellow-100 text-yellow-800"
											>
												EN ATTENTE
											</Badge>
											Inscrit le{" "}
											{new Date(doctor.createdAt).toLocaleDateString("fr-FR")}
										</CardDescription>
									</div>
									<div className="flex gap-2">
										<Dialog>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													className="border-green-200 text-green-700 hover:bg-green-50"
													onClick={() => openDialog(doctor.id, "approve")}
												>
													<CheckCircle className="mr-1 h-4 w-4" />
													Approuver
												</Button>
											</DialogTrigger>
											{actionType === "approve" &&
												selectedDoctor === doctor.id && (
													<DialogContent>
														<DialogHeader>
															<DialogTitle>
																Approuver le médecin Dr. {doctor.firstName}{" "}
																{doctor.lastName}
															</DialogTitle>
															<DialogDescription>
																Cette action approuvera le profil du médecin et
																lui donnera accès aux fonctionnalités de la
																plateforme.
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-4">
															<div>
																<Label htmlFor="adminNotes">
																	Notes administratives (optionnel)
																</Label>
																<Textarea
																	id="adminNotes"
																	placeholder="Ajoutez des notes concernant cette validation..."
																	value={adminNotes}
																	onChange={(e) =>
																		setAdminNotes(e.target.value)
																	}
																/>
															</div>
														</div>
														<DialogFooter>
															<Button variant="outline" onClick={resetForm}>
																Annuler
															</Button>
															<Button
																onClick={handleAction}
																disabled={approveMutation.isPending}
																className="bg-green-600 hover:bg-green-700"
															>
																{approveMutation.isPending
																	? "Approbation..."
																	: "Approuver"}
															</Button>
														</DialogFooter>
													</DialogContent>
												)}
										</Dialog>

										<Dialog>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													className="border-red-200 text-red-700 hover:bg-red-50"
													onClick={() => openDialog(doctor.id, "reject")}
												>
													<XCircle className="mr-1 h-4 w-4" />
													Rejeter
												</Button>
											</DialogTrigger>
											{actionType === "reject" &&
												selectedDoctor === doctor.id && (
													<DialogContent>
														<DialogHeader>
															<DialogTitle>
																Rejeter le médecin Dr. {doctor.firstName}{" "}
																{doctor.lastName}
															</DialogTitle>
															<DialogDescription>
																Cette action rejettera le profil du médecin.
																Veuillez indiquer les raisons du rejet.
															</DialogDescription>
														</DialogHeader>
														<div className="space-y-4">
															<div>
																<Label htmlFor="adminNotes">
																	Raisons du rejet *
																</Label>
																<Textarea
																	id="adminNotes"
																	placeholder="Expliquez pourquoi ce profil est rejeté..."
																	value={adminNotes}
																	onChange={(e) =>
																		setAdminNotes(e.target.value)
																	}
																	required
																/>
															</div>
														</div>
														<DialogFooter>
															<Button variant="outline" onClick={resetForm}>
																Annuler
															</Button>
															<Button
																onClick={handleAction}
																disabled={rejectMutation.isPending}
																variant="destructive"
															>
																{rejectMutation.isPending
																	? "Rejet..."
																	: "Rejeter"}
															</Button>
														</DialogFooter>
													</DialogContent>
												)}
										</Dialog>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<h4 className="mb-2 font-semibold">
											Informations personnelles
										</h4>
										<div className="space-y-1 text-sm">
											<div>
												<span className="text-gray-600">Email:</span>{" "}
												{doctor.user.email}
											</div>
											<div>
												<span className="text-gray-600">Expérience:</span>{" "}
												{doctor.experienceYears} ans
											</div>
										</div>
									</div>
									<div>
										<h4 className="mb-2 font-semibold">Spécialités</h4>
										<div className="flex flex-wrap gap-1">
											{doctor.specialties.map((specialty, index) => (
												<Badge
													key={`specialty-${doctor.id}-${index}`}
													variant="secondary"
												>
													{specialty}
												</Badge>
											))}
										</div>
									</div>
									<div className="md:col-span-2">
										<h4 className="mb-2 font-semibold">Zones préférées</h4>
										<div className="flex flex-wrap gap-1">
											{doctor.preferredLocations.map((location, index) => (
												<Badge
													key={`location-${doctor.id}-${index}`}
													variant="outline"
												>
													{location.name} ({location.travelRadius}km)
												</Badge>
											))}
										</div>
									</div>
									{doctor.documents && doctor.documents.length > 0 && (
										<div className="md:col-span-2">
											<h4 className="mb-2 font-semibold">Documents</h4>
											<div className="flex flex-wrap gap-1">
												{doctor.documents.map((doc, index) => (
													<Badge
														key={`doc-${doctor.id}-${index}`}
														variant="outline"
													>
														Document {index + 1}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
