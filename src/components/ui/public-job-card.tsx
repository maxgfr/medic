"use client";

import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { getSpecialtyName } from "~/lib/constants";
import { cn } from "~/lib/utils";

interface PublicJobCardProps {
	id: string;
	title: string;
	specialty: string;
	location: string;
	startDate: string;
	endDate: string;
	contractType: string;
	description?: string;
	requirements?: string[];
	isUrgent?: boolean;
	createdAt: string;
	className?: string;
}

export function PublicJobCard({
	id,
	title,
	specialty,
	location,
	startDate,
	endDate,
	contractType,
	description,
	requirements,
	isUrgent,
	createdAt,
	className,
}: PublicJobCardProps) {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const getDurationText = () => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diffTime = Math.abs(end.getTime() - start.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) return "1 jour";
		if (diffDays < 30) return `${diffDays} jours`;
		if (diffDays < 365) return `${Math.ceil(diffDays / 30)} mois`;
		return `${Math.ceil(diffDays / 365)} an${
			Math.ceil(diffDays / 365) > 1 ? "s" : ""
		}`;
	};

	const getContractTypeLabel = (type: string) => {
		const labels: Record<string, string> = {
			temporary: "Temporaire",
			permanent: "Permanent",
			freelance: "Libéral",
			locum: "Remplacement",
		};
		return labels[type] || type;
	};

	return (
		<Card className={cn("h-full transition-all hover:shadow-lg", className)}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<div className="mb-2 flex items-center gap-2">
							<h3 className="line-clamp-1 font-semibold text-gray-900 text-lg">
								{title}
							</h3>
							{isUrgent && (
								<Badge variant="destructive" className="text-xs">
									<Icons.clock className="mr-1 h-3 w-3" />
									Urgent
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2 text-gray-600 text-sm">
							<Icons.stethoscope className="h-4 w-4" />
							<span>{getSpecialtyName(specialty)}</span>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pb-3">
				<div className="space-y-3">
					{/* Location */}
					<div className="flex items-center gap-2 text-gray-600 text-sm">
						<Icons.mapPin className="h-4 w-4" />
						<span>{location}</span>
					</div>

					{/* Duration and Contract Type */}
					<div className="flex items-center gap-4 text-gray-600 text-sm">
						<div className="flex items-center gap-2">
							<Icons.calendar className="h-4 w-4" />
							<span>{getDurationText()}</span>
						</div>
						<div className="flex items-center gap-2">
							<Icons.briefcase className="h-4 w-4" />
							<span>{getContractTypeLabel(contractType)}</span>
						</div>
					</div>

					{/* Dates */}
					<div className="flex items-center gap-2 text-gray-600 text-sm">
						<Icons.calendar className="h-4 w-4" />
						<span>
							Du {formatDate(startDate)} au {formatDate(endDate)}
						</span>
					</div>

					{/* Description */}
					{description && (
						<div className="mt-3">
							<p className="line-clamp-3 text-gray-700 text-sm">
								{description}
							</p>
						</div>
					)}

					{/* Requirements */}
					{requirements && requirements.length > 0 && (
						<div className="mt-3">
							<h4 className="mb-1 font-medium text-gray-900 text-sm">
								Exigences:
							</h4>
							<ul className="space-y-1 text-gray-700 text-sm">
								{requirements.slice(0, 3).map((req) => (
									<li key={req} className="flex items-start gap-2">
										<Icons.check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
										<span className="line-clamp-1">{req}</span>
									</li>
								))}
								{requirements.length > 3 && (
									<li className="ml-5 text-gray-500 text-xs">
										+{requirements.length - 3} autres exigences
									</li>
								)}
							</ul>
						</div>
					)}
				</div>
			</CardContent>

			<CardFooter className="border-t pt-3">
				<div className="flex w-full items-center justify-between">
					<div className="text-gray-500 text-xs">
						Publié le {formatDate(createdAt)}
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" asChild>
							<Link href={`/register?redirect=/job-offers/${id}`}>
								<Icons.eye className="mr-2 h-4 w-4" />
								Voir détails
							</Link>
						</Button>
						<Button size="sm" asChild>
							<Link href={`/register?redirect=/job-offers/${id}/apply`}>
								<Icons.send className="mr-2 h-4 w-4" />
								Postuler
							</Link>
						</Button>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
