"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Filter,
  Home,
  Stethoscope,
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

type JobOfferSearchResult = {
  id: string;
  title: string;
  specialty: string;
  location: string;
  startDate: Date;
  endDate: Date;
  retrocessionRate: string;
  type: "URGENT" | "PLANNED" | "RECURRING";
  description: string | null;
  estimatedPatients: number | null;
  housingProvided: boolean | null;
  equipment: string[] | null;
  status: string;
  createdAt: Date;
  cabinet: {
    cabinetName: string;
    user: {
      name: string | null;
      email: string;
    };
  };
};

export default function DoctorJobOffersPage() {
  // Search filters state
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    type: "",
    housingProvided: "",
    minRetrocession: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 12;

  // Application modal state
  const [selectedOffer, setSelectedOffer] =
    useState<JobOfferSearchResult | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [motivationLetter, setMotivationLetter] = useState("");

  // Search job offers
  const {
    data: searchResults,
    isLoading,
    refetch,
  } = api.jobOffers.search.useQuery({
    specialty: filters.specialty || undefined,
    location: filters.location || undefined,
    type: filters.type as "URGENT" | "PLANNED" | "RECURRING" | undefined,
    housingProvided: filters.housingProvided
      ? filters.housingProvided === "true"
      : undefined,
    retrocessionMin: filters.minRetrocession
      ? Number(filters.minRetrocession)
      : undefined,
    limit,
    offset: (page - 1) * limit,
  });

  // Create application mutation
  const createApplication = api.applications.create.useMutation({
    onSuccess: () => {
      toast.success("Candidature envoyée avec succès");
      setIsApplicationOpen(false);
      setSelectedOffer(null);
      setMotivationLetter("");
    },
    onError: (error) => {
      toast.error(`Erreur lors de l'envoi : ${error.message}`);
    },
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      specialty: "",
      location: "",
      type: "",
      housingProvided: "",
      minRetrocession: "",
    });
    setPage(1);
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

  const handleApply = (offer: JobOfferSearchResult) => {
    setSelectedOffer(offer);
    setIsApplicationOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!selectedOffer || !motivationLetter.trim()) {
      toast.error("Veuillez rédiger une lettre de motivation");
      return;
    }

    createApplication.mutate({
      jobOfferId: selectedOffer.id,
      motivationLetter: motivationLetter.trim(),
    });
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Recherche d'annonces
          </h1>
          <p className="text-muted-foreground">
            Trouvez des opportunités de remplacement médical
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres de recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Specialty */}
              <div className="space-y-2">
                <Label>Spécialité</Label>
                <Select
                  value={filters.specialty}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, specialty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes spécialités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes spécialités</SelectItem>
                    <SelectItem value="medecine-generale">
                      Médecine générale
                    </SelectItem>
                    <SelectItem value="cardiologie">Cardiologie</SelectItem>
                    <SelectItem value="dermatologie">Dermatologie</SelectItem>
                    <SelectItem value="pediatrie">Pédiatrie</SelectItem>
                    <SelectItem value="gynecologie">Gynécologie</SelectItem>
                    <SelectItem value="ophtalmologie">Ophtalmologie</SelectItem>
                    <SelectItem value="psychiatrie">Psychiatrie</SelectItem>
                    <SelectItem value="radiologie">Radiologie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Ville, région..."
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type de remplacement</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous types</SelectItem>
                    <SelectItem value="PLANNED">Planifié</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="RECURRING">Récurrent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Housing */}
              <div className="space-y-2">
                <Label>Logement</Label>
                <Select
                  value={filters.housingProvided}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, housingProvided: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Peu importe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Peu importe</SelectItem>
                    <SelectItem value="true">Logement fourni</SelectItem>
                    <SelectItem value="false">Pas de logement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Retrocession */}
              <div className="space-y-2">
                <Label htmlFor="minRetrocession">Taux minimum (%)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="minRetrocession"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ex: 70"
                    value={filters.minRetrocession}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minRetrocession: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <Button onClick={handleSearch} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Effacer les filtres
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Recherche en cours...</p>
              </div>
            </div>
          ) : searchResults?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Stethoscope className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Aucune annonce trouvée
                </h3>
                <p className="text-muted-foreground text-center">
                  Essayez de modifier vos critères de recherche pour voir plus
                  de résultats.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {searchResults?.length || 0} annonce
                  {(searchResults?.length || 0) > 1 ? "s" : ""} trouvée
                  {(searchResults?.length || 0) > 1 ? "s" : ""}
                </p>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults?.map((offer: JobOfferSearchResult) => (
                  <Card
                    key={offer.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">
                            {offer.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            {offer.location}
                          </div>
                        </div>
                        <Badge variant={getTypeColor(offer.type)}>
                          {getTypeLabel(offer.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {offer.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {offer.description}
                        </p>
                      )}

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Début</p>
                            <p className="text-muted-foreground">
                              {format(new Date(offer.startDate), "d MMM yyyy", {
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Fin</p>
                            <p className="text-muted-foreground">
                              {format(new Date(offer.endDate), "d MMM yyyy", {
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Rétrocession</p>
                            <p className="text-muted-foreground">
                              {offer.retrocessionRate}%
                            </p>
                          </div>
                        </div>
                        {offer.estimatedPatients && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Patients/jour</p>
                              <p className="text-muted-foreground">
                                ~{offer.estimatedPatients}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {offer.housingProvided && (
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="w-4 h-4 text-green-600" />
                          <span className="text-green-600 font-medium">
                            Logement fourni
                          </span>
                        </div>
                      )}

                      {offer.equipment && offer.equipment.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Équipements disponibles :
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {offer.equipment.slice(0, 3).map((item: string) => (
                              <Badge
                                key={`equipment-${item}`}
                                variant="outline"
                                className="text-xs"
                              >
                                {item}
                              </Badge>
                            ))}
                            {offer.equipment.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{offer.equipment.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Publié le{" "}
                          {format(new Date(offer.createdAt), "d MMM yyyy", {
                            locale: fr,
                          })}
                        </span>
                        <Button size="sm" onClick={() => handleApply(offer)}>
                          <Send className="w-4 h-4 mr-2" />
                          Postuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {searchResults && searchResults.length === limit && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-muted-foreground px-4">
                      Page {page}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={searchResults.length < limit}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Application Modal */}
      <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Postuler à l'annonce</DialogTitle>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-6">
              {/* Offer Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{selectedOffer.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {selectedOffer.location}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(selectedOffer.startDate), "d MMM", {
                          locale: fr,
                        })}{" "}
                        -{" "}
                        {format(new Date(selectedOffer.endDate), "d MMM yyyy", {
                          locale: fr,
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        {selectedOffer.retrocessionRate}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivation Letter */}
              <div className="space-y-2">
                <Label htmlFor="motivation">Lettre de motivation *</Label>
                <Textarea
                  id="motivation"
                  placeholder="Expliquez pourquoi vous souhaitez postuler à cette offre..."
                  value={motivationLetter}
                  onChange={(e) => setMotivationLetter(e.target.value)}
                  rows={8}
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Présentez brièvement votre expérience et votre motivation pour
                  ce remplacement.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsApplicationOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmitApplication}
                  disabled={
                    createApplication.isPending || !motivationLetter.trim()
                  }
                >
                  {createApplication.isPending
                    ? "Envoi..."
                    : "Envoyer la candidature"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
