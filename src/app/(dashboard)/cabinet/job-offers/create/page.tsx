"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  DollarSign,
  Stethoscope,
} from "lucide-react";

export default function CreateJobOfferPage() {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    specialty: "",
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
    <div className="container max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Créer une annonce
          </h1>
          <p className="text-muted-foreground">
            Publiez une nouvelle offre de remplacement médical
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Informations principales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    setFormData((prev) => ({ ...prev, specialty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une spécialité" />
                  </SelectTrigger>
                  <SelectContent>
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
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
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
              <Calendar className="w-5 h-5" />
              Période et conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retrocessionRate">
                  Taux de rétrocession (%)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
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
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addEquipment())
                }
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
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
