"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { doctorProfileSchema, type DoctorProfile } from "~/lib/validations";
import { MEDICAL_SPECIALTIES, DAYS_OF_WEEK } from "~/lib/constants";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DoctorProfileFormProps {
  initialData?: Partial<DoctorProfile>;
  isEditing?: boolean;
}

export function DoctorProfileForm({
  initialData,
  isEditing = false,
}: DoctorProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DoctorProfile>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      specialties: initialData?.specialties || [],
      experienceYears: initialData?.experienceYears || 0,
      preferredLocation: initialData?.preferredLocation || "",
      travelRadius: initialData?.travelRadius || 50,
      documents: initialData?.documents || [],
      availability: initialData?.availability || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      preferredRate: initialData?.preferredRate || undefined,
    },
  });

  const createMutation = api.auth.createDoctorProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil médecin créé avec succès !");
      router.push("/doctor/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du profil");
      setIsLoading(false);
    },
  });

  const updateMutation = api.auth.updateDoctorProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil médecin mis à jour avec succès !");
      router.push("/doctor/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
      setIsLoading(false);
    },
  });

  function onSubmit(values: DoctorProfile) {
    setIsLoading(true);

    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const selectedSpecialties = form.watch("specialties");
  const availability = form.watch("availability");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
            <CardDescription>
              Renseignez vos informations personnelles et professionnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Années d'Expérience *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taux Souhaité (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="70"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Pourcentage de rétrocession souhaité
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Spécialités Médicales</CardTitle>
            <CardDescription>
              Sélectionnez vos spécialités médicales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="specialties"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MEDICAL_SPECIALTIES.map((specialty) => (
                      <FormField
                        key={specialty.id}
                        control={form.control}
                        name="specialties"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={specialty.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(specialty.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          specialty.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== specialty.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {specialty.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                  {selectedSpecialties.length > 0 && (
                    <FormDescription>
                      {selectedSpecialties.length} spécialité(s) sélectionnée(s)
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Préférences de Localisation</CardTitle>
            <CardDescription>
              Définissez votre zone de déplacement préférée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="preferredLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localisation Préférée *</FormLabel>
                  <FormControl>
                    <Input placeholder="Paris, Lyon, Marseille..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Ville ou région où vous souhaitez principalement exercer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travelRadius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rayon de Déplacement *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      placeholder="50"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Distance maximale en kilomètres que vous êtes prêt(e) à
                    parcourir
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Disponibilités</CardTitle>
            <CardDescription>
              Indiquez vos jours de disponibilité habituels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="availability"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {DAYS_OF_WEEK.map((day) => (
                      <FormField
                        key={day.key}
                        control={form.control}
                        name="availability"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day.key}
                              className="flex flex-col items-center space-y-2"
                            >
                              <FormLabel className="text-sm font-normal">
                                {day.label}
                              </FormLabel>
                              <FormControl>
                                <Checkbox
                                  checked={
                                    field.value?.[
                                      day.key as keyof typeof field.value
                                    ]
                                  }
                                  onCheckedChange={(checked) => {
                                    field.onChange({
                                      ...field.value,
                                      [day.key]: checked,
                                    });
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                  <FormDescription>
                    Jours disponibles :{" "}
                    {
                      Object.entries(availability).filter(
                        ([_, available]) => available
                      ).length
                    }
                    /7
                  </FormDescription>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Mise à jour..." : "Création..."}
              </>
            ) : (
              <>
                <Icons.checkCircle className="mr-2 h-4 w-4" />
                {isEditing ? "Mettre à jour" : "Créer le profil"}
              </>
            )}
          </Button>

          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
