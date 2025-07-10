"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Building2,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Eye,
	MapPin,
	Send,
	Users,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";

export default function DoctorApplicationsPage() {
	const [statusFilter, setStatusFilter] = useState<string>("");
	const [page, setPage] = useState(1);
	const limit = 10;

	// Fetch doctor applications
	const {
		data: applications,
		isLoading,
		refetch,
	} = api.applications.getByDoctor.useQuery({
		status: statusFilter as
			| "SENT"
			| "VIEWED"
			| "ACCEPTED"
			| "REJECTED"
			| undefined,
		limit,
		offset: (page - 1) * limit,
	});

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
				return "Envoyée";
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

	return (
		<div className="container mx-auto max-w-6xl py-8">
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl tracking-tight">
						Mes candidatures
					</h1>
					<p className="text-muted-foreground">
						Suivez le statut de vos candidatures aux annonces de remplacement
					</p>
				</div>
			</div>

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
							<SelectItem value="SENT">Envoyées</SelectItem>
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
							Vous n'avez encore envoyé aucune candidature.
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
												<Building2 className="h-4 w-4" />
												{application.jobOffer.cabinet.cabinetName}
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-4 w-4" />
												{application.jobOffer.location}
											</div>
										</div>
									</div>
									<Badge
										variant={getStatusColor(application.status)}
										className="flex items-center gap-1"
									>
										{getStatusIcon(application.status)}
										{getStatusLabel(application.status)}
									</Badge>
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
									{application.jobOffer.estimatedPatients && (
										<div className="flex items-center gap-2">
											<Users className="h-4 w-4 text-muted-foreground" />
											<div>
												<p className="font-medium">Patients/jour</p>
												<p className="text-muted-foreground">
													~{application.jobOffer.estimatedPatients}
												</p>
											</div>
										</div>
									)}
								</div>

								<Separator />

								{/* Application Details */}
								<div className="space-y-3">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											Candidature envoyée le{" "}
											{format(
												new Date(application.createdAt),
												"d MMM yyyy à HH:mm",
												{ locale: fr },
											)}
										</span>
										{application.updatedAt &&
											application.updatedAt !== application.createdAt && (
												<span className="text-muted-foreground">
													Mise à jour le{" "}
													{format(
														new Date(application.updatedAt),
														"d MMM yyyy à HH:mm",
														{ locale: fr },
													)}
												</span>
											)}
									</div>

									{/* Motivation Letter Preview */}
									<div className="rounded-lg bg-muted/50 p-4">
										<h4 className="mb-2 font-medium text-sm">
											Lettre de motivation :
										</h4>
										<p className="line-clamp-3 text-muted-foreground text-sm">
											{application.motivationLetter}
										</p>
									</div>
								</div>

								{/* Status-specific content */}
								{application.status === "ACCEPTED" && (
									<div className="rounded-lg border border-green-200 bg-green-50 p-4">
										<div className="flex items-center gap-2 text-green-800">
											<CheckCircle className="h-5 w-5" />
											<span className="font-medium">
												Candidature acceptée !
											</span>
										</div>
										<p className="mt-1 text-green-700 text-sm">
											Le cabinet va vous contacter prochainement pour finaliser
											les modalités du remplacement.
										</p>
									</div>
								)}

								{application.status === "REJECTED" && (
									<div className="rounded-lg border border-red-200 bg-red-50 p-4">
										<div className="flex items-center gap-2 text-red-800">
											<XCircle className="h-5 w-5" />
											<span className="font-medium">Candidature refusée</span>
										</div>
										<p className="mt-1 text-red-700 text-sm">
											Cette candidature n'a pas été retenue pour cette offre.
										</p>
									</div>
								)}
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
		</div>
	);
}
