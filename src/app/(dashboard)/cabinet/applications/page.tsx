"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Eye,
	FileText,
	MapPin,
	MoreHorizontal,
	Send,
	User,
	Users,
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
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";

type CabinetApplication = {
	id: string;
	createdAt: Date;
	updatedAt: Date | null;
	status: "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED";
	jobOfferId: string;
	doctorId: string;
	motivationLetter: string;
	attachments: string[] | null;
	jobOffer: {
		id: string;
		title: string;
		specialty: string;
		location: string;
		startDate: Date;
		endDate: Date;
		retrocessionRate: string;
		type: "URGENT" | "PLANNED" | "RECURRING";
		description: string | null;
		status: string;
	};
	doctor: {
		id: string;
		createdAt: Date;
		updatedAt: Date | null;
		userId: string;
		specialties: string[];
		firstName: string;
		lastName: string;
		experienceYears: number;
		preferredLocations: unknown;
		user: {
			name: string | null;
			email: string;
		};
	};
};

export default function CabinetApplicationsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [page, setPage] = useState(1);
	const [selectedApplication, setSelectedApplication] =
		useState<CabinetApplication | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const limit = 10;

	// Fetch cabinet applications
	const {
		data: applications,
		isLoading,
		refetch,
	} = api.applications.getByCabinet.useQuery({
		status: statusFilter as
			| "SENT"
			| "VIEWED"
			| "ACCEPTED"
			| "REJECTED"
			| undefined,
		limit,
		offset: (page - 1) * limit,
	});

	// Update application status mutation
	const updateStatus = api.applications.updateStatus.useMutation({
		onSuccess: () => {
			toast.success("Statut mis à jour avec succès");
			refetch();
			setIsDetailOpen(false);
		},
		onError: (error) => {
			toast.error(`Erreur : ${error.message}`);
		},
	});

	// Get application statistics
	const { data: stats } = api.applications.getStats.useQuery();

	const getStatusColor = (status: string) => {
		switch (status) {
			case "SENT":
				return "default";
			case "VIEWED":
				return "secondary";
			case "ACCEPTED":
				return "default";
			case "REJECTED":
				return "destructive";
			default:
				return "default";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "SENT":
				return "Nouvelle";
			case "VIEWED":
				return "Vue";
			case "ACCEPTED":
				return "Acceptée";
			case "REJECTED":
				return "Refusée";
			default:
				return status;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "SENT":
				return <Send className="h-4 w-4" />;
			case "VIEWED":
				return <Eye className="h-4 w-4" />;
			case "ACCEPTED":
				return <CheckCircle className="h-4 w-4" />;
			case "REJECTED":
				return <XCircle className="h-4 w-4" />;
			default:
				return <Send className="h-4 w-4" />;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "URGENT":
				return "destructive";
			case "RECURRING":
				return "secondary";
			case "PLANNED":
				return "default";
			default:
				return "default";
		}
	};

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "URGENT":
				return "Urgent";
			case "RECURRING":
				return "Récurrent";
			case "PLANNED":
				return "Planifié";
			default:
				return type;
		}
	};

	const handleViewApplication = (application: CabinetApplication) => {
		setSelectedApplication(application);
		setIsDetailOpen(true);

		// Mark as viewed if not already
		if (application.status === "SENT") {
			updateStatus.mutate({
				applicationId: application.id,
				status: "VIEWED",
			});
		}
	};

	const handleAcceptApplication = (applicationId: string) => {
		updateStatus.mutate({
			applicationId,
			status: "ACCEPTED",
		});
	};

	const handleRejectApplication = (applicationId: string) => {
		updateStatus.mutate({
			applicationId,
			status: "REJECTED",
		});
	};

	return (
		<div className="container mx-auto max-w-6xl py-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Candidatures reçues
					</h1>
					<p className="text-muted-foreground">
						Gérez les candidatures aux annonces de votre cabinet
					</p>
				</div>
			</div>

			{/* Statistics */}
			{stats && (
				<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl">{stats.total}</div>
							<p className="text-muted-foreground text-xs">Total</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl text-blue-600">
								{stats.sent}
							</div>
							<p className="text-muted-foreground text-xs">Nouvelles</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl text-yellow-600">
								{stats.viewed}
							</div>
							<p className="text-muted-foreground text-xs">Vues</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl text-green-600">
								{stats.accepted}
							</div>
							<p className="text-muted-foreground text-xs">Acceptées</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-4">
							<div className="font-bold text-2xl text-red-600">
								{stats.rejected}
							</div>
							<p className="text-muted-foreground text-xs">Refusées</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filters */}
			<div className="mb-6 flex items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">Statut :</span>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Tous les statuts" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">Tous les statuts</SelectItem>
							<SelectItem value="SENT">Nouvelles</SelectItem>
							<SelectItem value="VIEWED">Vues</SelectItem>
							<SelectItem value="ACCEPTED">Acceptées</SelectItem>
							<SelectItem value="REJECTED">Refusées</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Applications List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
						<p className="text-muted-foreground">
							Chargement des candidatures...
						</p>
					</div>
				</div>
			) : applications?.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Send className="mb-4 h-12 w-12 text-muted-foreground" />
						<h3 className="mb-2 font-medium text-lg">Aucune candidature</h3>
						<p className="text-center text-muted-foreground">
							Aucune candidature n'a encore été reçue pour vos annonces.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{applications?.map((application) => (
						<Card
							key={application.id}
							className="transition-shadow hover:shadow-md"
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="mb-2 flex items-center gap-3">
											<CardTitle className="text-lg">
												{application.jobOffer.title}
											</CardTitle>
											<Badge variant={getTypeColor(application.jobOffer.type)}>
												{getTypeLabel(application.jobOffer.type)}
											</Badge>
										</div>
										<div className="flex items-center gap-4 text-muted-foreground text-sm">
											<div className="flex items-center gap-1">
												<User className="h-4 w-4" />
												Dr. {application.doctor.firstName}{" "}
												{application.doctor.lastName}
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												{application.jobOffer.location}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Badge
											variant={getStatusColor(application.status)}
											className="flex items-center gap-1"
										>
											{getStatusIcon(application.status)}
											{getStatusLabel(application.status)}
										</Badge>
									</div>
								</div>
							</CardHeader>

							<CardContent className="space-y-4">
								{/* Job Details */}
								<div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Début</p>
											<p className="text-muted-foreground">
												{format(
													new Date(application.jobOffer.startDate),
													"d MMM yyyy",
													{ locale: fr },
												)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Fin</p>
											<p className="text-muted-foreground">
												{format(
													new Date(application.jobOffer.endDate),
													"d MMM yyyy",
													{ locale: fr },
												)}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<DollarSign className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Rétrocession</p>
											<p className="text-muted-foreground">
												{application.jobOffer.retrocessionRate}%
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<Users className="h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Expérience</p>
											<p className="text-muted-foreground">
												{application.doctor.experienceYears} ans
											</p>
										</div>
									</div>
								</div>

								<Separator />

								{/* Application Preview */}
								<div className="space-y-3">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											Candidature reçue le{" "}
											{format(
												new Date(application.createdAt),
												"d MMM yyyy à HH:mm",
												{ locale: fr },
											)}
										</span>
									</div>

									{/* Motivation Letter Preview */}
									<div className="rounded-lg bg-muted/50 p-4">
										<div className="mb-2 flex items-center gap-2">
											<FileText className="h-4 w-4" />
											<span className="font-medium text-sm">
												Lettre de motivation :
											</span>
										</div>
										<p className="line-clamp-2 text-muted-foreground text-sm">
											{application.motivationLetter}
										</p>
									</div>
								</div>

								{/* Actions */}
								<div className="flex items-center justify-between pt-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleViewApplication(application)}
									>
										<Eye className="mr-2 h-4 w-4" />
										Voir détails
									</Button>

									<div className="flex items-center gap-2">
										{application.status === "SENT" ||
										application.status === "VIEWED" ? (
											<>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleRejectApplication(application.id)
													}
													disabled={updateStatus.isPending}
												>
													<XCircle className="mr-2 h-4 w-4" />
													Refuser
												</Button>
												<Button
													size="sm"
													onClick={() =>
														handleAcceptApplication(application.id)
													}
													disabled={updateStatus.isPending}
												>
													<CheckCircle className="mr-2 h-4 w-4" />
													Accepter
												</Button>
											</>
										) : (
											<Badge variant={getStatusColor(application.status)}>
												{getStatusLabel(application.status)}
											</Badge>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}

					{/* Pagination */}
					{applications && applications.length === limit && (
						<div className="mt-8 flex justify-center">
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									Précédent
								</Button>
								<span className="px-4 text-muted-foreground text-sm">
									Page {page}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => p + 1)}
									disabled={applications.length < limit}
								>
									Suivant
								</Button>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Application Detail Modal */}
			<Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
				<DialogContent className="max-w-3xl">
					<DialogHeader>
						<DialogTitle>Détails de la candidature</DialogTitle>
					</DialogHeader>

					{selectedApplication && (
						<div className="space-y-6">
							{/* Applicant Info */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Dr. {selectedApplication.doctor.firstName}{" "}
										{selectedApplication.doctor.lastName}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="font-medium">Email</p>
											<p className="text-muted-foreground">
												{selectedApplication.doctor.user.email}
											</p>
										</div>
										<div>
											<p className="font-medium">Expérience</p>
											<p className="text-muted-foreground">
												{selectedApplication.doctor.experienceYears} ans
											</p>
										</div>
										<div>
											<p className="font-medium">Spécialités</p>
											<p className="text-muted-foreground">
												{selectedApplication.doctor.specialties.join(", ")}
											</p>
										</div>
										<div>
											<p className="font-medium">Zone préférée</p>
											<p className="text-muted-foreground">
												{Array.isArray(
													selectedApplication.doctor.preferredLocations,
												)
													? selectedApplication.doctor.preferredLocations.join(
															", ",
														)
													: "Non spécifié"}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Job Offer Info */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										{selectedApplication.jobOffer.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4 text-sm">
										<div>
											<p className="font-medium">Période</p>
											<p className="text-muted-foreground">
												{format(
													new Date(selectedApplication.jobOffer.startDate),
													"d MMM",
													{ locale: fr },
												)}{" "}
												-{" "}
												{format(
													new Date(selectedApplication.jobOffer.endDate),
													"d MMM yyyy",
													{ locale: fr },
												)}
											</p>
										</div>
										<div>
											<p className="font-medium">Rétrocession</p>
											<p className="text-muted-foreground">
												{selectedApplication.jobOffer.retrocessionRate}%
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Motivation Letter */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">
										Lettre de motivation
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="rounded-lg bg-muted/50 p-4">
										<p className="whitespace-pre-wrap text-sm">
											{selectedApplication.motivationLetter}
										</p>
									</div>
								</CardContent>
							</Card>

							{/* Actions */}
							{(selectedApplication.status === "SENT" ||
								selectedApplication.status === "VIEWED") && (
								<div className="flex justify-end gap-3">
									<Button
										variant="outline"
										onClick={() =>
											handleRejectApplication(selectedApplication.id)
										}
										disabled={updateStatus.isPending}
									>
										<XCircle className="mr-2 h-4 w-4" />
										Refuser
									</Button>
									<Button
										onClick={() =>
											handleAcceptApplication(selectedApplication.id)
										}
										disabled={updateStatus.isPending}
									>
										<CheckCircle className="mr-2 h-4 w-4" />
										Accepter
									</Button>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
