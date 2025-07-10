"use client";

import { Filter, MoreVertical, Plus, Search } from "lucide-react";
import { useState } from "react";

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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

import { api } from "~/trpc/react";

const statusConfig = {
	DRAFT: { label: "Brouillon", variant: "secondary" as const },
	PUBLISHED: { label: "Publiée", variant: "default" as const },
	FILLED: { label: "Pourvue", variant: "default" as const },
	ARCHIVED: { label: "Archivée", variant: "outline" as const },
};

export default function JobOffersPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Fetch job offers for the cabinet
	const { data: jobOffers, isLoading } = api.jobOffers.getByCabinet.useQuery({
		status:
			statusFilter !== "all"
				? (statusFilter as "DRAFT" | "PUBLISHED" | "FILLED" | "ARCHIVED")
				: undefined,
		limit: 50,
		offset: 0,
	});

	// Get statistics
	const { data: stats } = api.jobOffers.getStats.useQuery();

	const handleCreateOffer = () => {
		// Navigate to creation page
		window.location.href = "/cabinet/job-offers/create";
	};

	const filteredOffers =
		jobOffers?.filter(
			(offer) =>
				offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
				offer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
				offer.location.toLowerCase().includes(searchTerm.toLowerCase()),
		) || [];

	if (isLoading) {
		return (
			<div className="flex h-[calc(100vh-200px)] items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground">Chargement des annonces...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Mes Annonces</h1>
					<p className="text-muted-foreground">
						Gérez vos offres de remplacement médical
					</p>
				</div>
				<Button onClick={handleCreateOffer} size="lg">
					<Plus className="mr-2 h-4 w-4" />
					Créer une annonce
				</Button>
			</div>

			{/* Statistics Cards */}
			{stats && stats.length > 0 && (
				<div className="grid gap-4 md:grid-cols-4">
					{stats.map((stat) => {
						const config =
							statusConfig[stat.status as keyof typeof statusConfig];
						return (
							<Card key={stat.status}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="font-medium text-sm">
										{config.label}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="font-bold text-2xl">{stat.count}</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Filters and Search */}
			<Card>
				<CardHeader>
					<CardTitle>Filtres</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-4 md:flex-row md:items-center">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Rechercher par titre, spécialité ou localisation..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="w-full md:w-[200px]">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue placeholder="Statut" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les statuts</SelectItem>
									<SelectItem value="DRAFT">Brouillon</SelectItem>
									<SelectItem value="PUBLISHED">Publiée</SelectItem>
									<SelectItem value="FILLED">Pourvue</SelectItem>
									<SelectItem value="ARCHIVED">Archivée</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Job Offers Table */}
			<Card>
				<CardHeader>
					<CardTitle>Annonces ({filteredOffers.length})</CardTitle>
					<CardDescription>
						Liste de toutes vos offres de remplacement
					</CardDescription>
				</CardHeader>
				<CardContent>
					{filteredOffers.length === 0 ? (
						<div className="py-8 text-center">
							<p className="mb-4 text-muted-foreground">
								Aucune annonce trouvée
							</p>
							<Button onClick={handleCreateOffer}>
								<Plus className="mr-2 h-4 w-4" />
								Créer votre première annonce
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Titre</TableHead>
									<TableHead>Spécialité</TableHead>
									<TableHead>Localisation</TableHead>
									<TableHead>Dates</TableHead>
									<TableHead>Taux</TableHead>
									<TableHead>Statut</TableHead>
									<TableHead>Candidatures</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredOffers.map((offer) => (
									<TableRow key={offer.id}>
										<TableCell className="font-medium">{offer.title}</TableCell>
										<TableCell>{offer.specialty}</TableCell>
										<TableCell>{offer.location}</TableCell>
										<TableCell>
											<div className="text-sm">
												<div>
													Du{" "}
													{new Date(offer.startDate).toLocaleDateString(
														"fr-FR",
													)}
												</div>
												<div className="text-muted-foreground">
													Au{" "}
													{new Date(offer.endDate).toLocaleDateString("fr-FR")}
												</div>
											</div>
										</TableCell>
										<TableCell>{offer.retrocessionRate}%</TableCell>
										<TableCell>
											<Badge
												variant={
													statusConfig[
														offer.status as keyof typeof statusConfig
													].variant
												}
											>
												{
													statusConfig[
														offer.status as keyof typeof statusConfig
													].label
												}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="text-center">
												{offer.applications?.length || 0}
											</div>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" className="h-8 w-8 p-0">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>Voir les détails</DropdownMenuItem>
													<DropdownMenuItem>Modifier</DropdownMenuItem>
													<DropdownMenuItem>
														Voir les candidatures
													</DropdownMenuItem>
													<DropdownMenuItem>Dupliquer</DropdownMenuItem>
													<DropdownMenuItem className="text-destructive">
														Supprimer
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
