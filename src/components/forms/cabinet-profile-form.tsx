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
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { cabinetProfileSchema, type CabinetProfile } from "~/lib/validations";
import { MEDICAL_SPECIALTIES } from "~/lib/constants";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CabinetProfileFormProps {
  initialData?: Partial<CabinetProfile>;
  isEditing?: boolean;
}

export function CabinetProfileForm({
  initialData,
  isEditing = false,
}: CabinetProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CabinetProfile>({
    resolver: zodResolver(cabinetProfileSchema),
    defaultValues: {
      cabinetName: initialData?.cabinetName || "",
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      description: initialData?.description || "",
      specialties: initialData?.specialties || [],
      photos: initialData?.photos || [],
    },
  });

  const createMutation = api.auth.createCabinetProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil cabinet créé avec succès !");
      router.push("/cabinet/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du profil");
      setIsLoading(false);
    },
  });

  const updateMutation = api.auth.updateCabinetProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil cabinet mis à jour avec succès !");
      router.push("/cabinet/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du profil");
      setIsLoading(false);
    },
  });

  function onSubmit(values: CabinetProfile) {
    setIsLoading(true);

    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const selectedSpecialties = form.watch("specialties");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du Cabinet</CardTitle>
            <CardDescription>
              Renseignez les informations principales de votre cabinet médical
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="cabinetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du Cabinet *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cabinet Dr. Martin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse Complète *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="123 Avenue de la République, 75011 Paris"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Adresse complète avec code postal et ville
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="01 42 34 56 78" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du Cabinet</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez votre cabinet, vos équipements, votre équipe..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cette description sera visible par les médecins remplaçants
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Spécialités Médicales</CardTitle>
            <CardDescription>
              Sélectionnez les spécialités pratiquées dans votre cabinet
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
