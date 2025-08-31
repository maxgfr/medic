"use client";

import {
	CheckCircle,
	Clock,
	Mail,
	MapPin,
	Phone,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

export default function AdminValidationPage() {
	const [selectedCabinet, setSelectedCabinet] = useState<string | null>(null);
	const [adminNotes, setAdminNotes] = useState("");
	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

	const { data: pendingCabinets, refetch } =
		api.auth.getPendingCabinets.useQuery();

	const approveMutation = api.auth.approveCabinet.useMutation({
		onSuccess: () => {
			toast.success("Cabinet approuvé avec succès");
			refetch();
			setIsApproveDialogOpen(false);
			setSelectedCabinet(null);
			setAdminNotes("");
		},
		onError: (error) => {
			toast.error(`Erreur lors de l'approbation: ${error.message}`);
		},
	});

	const rejectMutation = api.auth.rejectCabinet.useMutation({
		onSuccess: () => {
			toast.success("Cabinet rejeté avec succès");
			refetch();
			setIsRejectDialogOpen(false);
			setSelectedCabinet(null);
			setAdminNotes("");
		},
		onError: (error) => {
			toast.error(`Erreur lors du rejet: ${error.message}`);
		},
	});

	const handleApprove = () => {
		if (!selectedCabinet) return;
		approveMutation.mutate({
			cabinetId: selectedCabinet,
			adminNotes: adminNotes.trim() || undefined,
		});
	};

	const handleReject = () => {
		if (!selectedCabinet || !adminNotes.trim()) return;
		rejectMutation.mutate({
			cabinetId: selectedCabinet,
			adminNotes: adminNotes.trim(),
		});
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<h1 className="font-bold text-3xl text-gray-900">
					Validation des cabinets médicaux
				</h1>
				<p className="mt-2 text-gray-600">
					Gérez les demandes de validation des profils cabinet
				</p>
			</div>

			{!pendingCabinets || pendingCabinets.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<Clock className="mx-auto h-16 w-16 text-gray-400" />
						<h3 className="mt-4 font-medium text-gray-900 text-lg">
							Aucune demande en attente
						</h3>
						<p className="mt-2 text-gray-500">
							Toutes les demandes de validation ont été traitées.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{pendingCabinets.map((cabinet) => (
						<Card key={cabinet.id} className="border-yellow-200 bg-yellow-50">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="font-semibold text-xl">
										{cabinet.cabinetName}
									</CardTitle>
									<Badge
										variant="outline"
										className="border-yellow-600 text-yellow-800"
									>
										EN ATTENTE
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-3">
										<div className="flex items-center space-x-2">
											<User className="h-4 w-4 text-gray-500" />
											<span className="font-medium text-sm">Utilisateur:</span>
											<span className="text-sm">{cabinet.user.name}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Mail className="h-4 w-4 text-gray-500" />
											<span className="font-medium text-sm">Email:</span>
											<span className="text-sm">{cabinet.user.email}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Phone className="h-4 w-4 text-gray-500" />
											<span className="font-medium text-sm">Téléphone:</span>
											<span className="text-sm">{cabinet.phone}</span>
										</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-start space-x-2">
											<MapPin className="mt-0.5 h-4 w-4 text-gray-500" />
											<div>
												<span className="font-medium text-sm">Adresse:</span>
												<p className="text-gray-600 text-sm">
													{cabinet.address}
												</p>
											</div>
										</div>
										<div>
											<span className="font-medium text-sm">Spécialités:</span>
											<div className="mt-1 flex flex-wrap gap-1">
												{cabinet.specialties.map((specialty) => (
													<Badge
														key={specialty}
														variant="secondary"
														className="text-xs"
													>
														{specialty}
													</Badge>
												))}
											</div>
										</div>
									</div>
								</div>

								{cabinet.description && (
									<div>
										<span className="font-medium text-sm">Description:</span>
										<p className="mt-1 text-gray-600 text-sm">
											{cabinet.description}
										</p>
									</div>
								)}

								<div className="flex justify-end space-x-3 pt-4">
									<Dialog
										open={isRejectDialogOpen && selectedCabinet === cabinet.id}
										onOpenChange={(open) => {
											setIsRejectDialogOpen(open);
											if (!open) {
												setSelectedCabinet(null);
												setAdminNotes("");
											}
										}}
									>
										<DialogTrigger asChild>
											<Button
												variant="destructive"
												onClick={() => {
													setSelectedCabinet(cabinet.id);
													setIsRejectDialogOpen(true);
												}}
											>
												<XCircle className="mr-2 h-4 w-4" />
												Rejeter
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Rejeter le cabinet</DialogTitle>
											</DialogHeader>
											<div className="space-y-4">
												<p className="text-gray-600 text-sm">
													Vous êtes sur le point de rejeter le cabinet "
													{cabinet.cabinetName}". Veuillez expliquer les raisons
													du rejet:
												</p>
												<Textarea
													placeholder="Expliquez pourquoi ce profil est rejeté..."
													value={adminNotes}
													onChange={(e) => setAdminNotes(e.target.value)}
													className="min-h-[100px]"
												/>
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														onClick={() => {
															setIsRejectDialogOpen(false);
															setSelectedCabinet(null);
															setAdminNotes("");
														}}
													>
														Annuler
													</Button>
													<Button
														variant="destructive"
														onClick={handleReject}
														disabled={
															!adminNotes.trim() || rejectMutation.isPending
														}
													>
														{rejectMutation.isPending
															? "Rejet..."
															: "Confirmer le rejet"}
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>

									<Dialog
										open={isApproveDialogOpen && selectedCabinet === cabinet.id}
										onOpenChange={(open) => {
											setIsApproveDialogOpen(open);
											if (!open) {
												setSelectedCabinet(null);
												setAdminNotes("");
											}
										}}
									>
										<DialogTrigger asChild>
											<Button
												onClick={() => {
													setSelectedCabinet(cabinet.id);
													setIsApproveDialogOpen(true);
												}}
											>
												<CheckCircle className="mr-2 h-4 w-4" />
												Approuver
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Approuver le cabinet</DialogTitle>
											</DialogHeader>
											<div className="space-y-4">
												<p className="text-gray-600 text-sm">
													Vous êtes sur le point d'approuver le cabinet "
													{cabinet.cabinetName}".
												</p>
												<Textarea
													placeholder="Notes optionnelles pour l'approbation..."
													value={adminNotes}
													onChange={(e) => setAdminNotes(e.target.value)}
													className="min-h-[100px]"
												/>
												<div className="flex justify-end space-x-2">
													<Button
														variant="outline"
														onClick={() => {
															setIsApproveDialogOpen(false);
															setSelectedCabinet(null);
															setAdminNotes("");
														}}
													>
														Annuler
													</Button>
													<Button
														onClick={handleApprove}
														disabled={approveMutation.isPending}
													>
														{approveMutation.isPending
															? "Approbation..."
															: "Confirmer l'approbation"}
													</Button>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
