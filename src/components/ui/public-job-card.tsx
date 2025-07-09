"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/ui/icons";
import { cn } from "~/lib/utils";
import { getSpecialtyName } from "~/lib/constants";
import Link from "next/link";

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
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {title}
              </h3>
              {isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  <Icons.clock className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icons.stethoscope className="w-4 h-4" />
              <span>{getSpecialtyName(specialty)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icons.mapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>

          {/* Duration and Contract Type */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Icons.calendar className="w-4 h-4" />
              <span>{getDurationText()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.briefcase className="w-4 h-4" />
              <span>{getContractTypeLabel(contractType)}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icons.calendar className="w-4 h-4" />
            <span>
              Du {formatDate(startDate)} au {formatDate(endDate)}
            </span>
          </div>

          {/* Description */}
          {description && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 line-clamp-3">
                {description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {requirements && requirements.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Exigences:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {requirements.slice(0, 3).map((req) => (
                  <li key={req} className="flex items-start gap-2">
                    <Icons.check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{req}</span>
                  </li>
                ))}
                {requirements.length > 3 && (
                  <li className="text-xs text-gray-500 ml-5">
                    +{requirements.length - 3} autres exigences
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-gray-500">
            Publié le {formatDate(createdAt)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/register?redirect=/job-offers/${id}`}>
                <Icons.eye className="w-4 h-4 mr-2" />
                Voir détails
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/register?redirect=/job-offers/${id}/apply`}>
                <Icons.send className="w-4 h-4 mr-2" />
                Postuler
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
