"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/ui/icons";
import { USER_ROLES } from "~/lib/constants";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role") as "CABINET" | "DOCTOR" | null;

  const [selectedRole, setSelectedRole] = useState<"CABINET" | "DOCTOR" | null>(
    roleFromUrl ||
      (typeof window !== "undefined"
        ? (localStorage.getItem("selectedRole") as "CABINET" | "DOCTOR")
        : null)
  );
  const [isLoading, setIsLoading] = useState(false);

  const updateRoleMutation = api.auth.updateRole.useMutation({
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedRole");
      }
      toast.success("Rôle mis à jour avec succès !");

      // Redirect to profile completion
      if (selectedRole === "CABINET") {
        router.push("/cabinet/profile?onboarding=true");
      } else {
        router.push("/doctor/profile?onboarding=true");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du rôle");
      setIsLoading(false);
    },
  });

  const handleRoleSelection = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    updateRoleMutation.mutate({ role: selectedRole });
  };

  // If user already has a role, redirect them
  useEffect(() => {
    if (session?.user?.role) {
      if (session.user.role === "CABINET") {
        router.push("/cabinet/dashboard");
      } else {
        router.push("/doctor/dashboard");
      }
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Icons.stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Bienvenue sur Medic Remplacement !
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Pour personnaliser votre expérience, dites-nous qui vous êtes
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Je suis :</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choisissez votre rôle pour accéder aux bonnes fonctionnalités
                </p>
              </div>

              <div className="grid gap-4">
                {USER_ROLES.map((role) => (
                  <Card
                    key={role.value}
                    className={`cursor-pointer transition-all ${
                      selectedRole === role.value
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      setSelectedRole(role.value as "CABINET" | "DOCTOR")
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {role.value === "CABINET" ? (
                            <Icons.building className="h-8 w-8 text-blue-600" />
                          ) : (
                            <Icons.stethoscope className="h-8 w-8 text-green-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-medium">
                              {role.label}
                            </h4>
                            {selectedRole === role.value && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Sélectionné
                              </Badge>
                            )}
                          </div>

                          <p className="text-muted-foreground mt-1">
                            {role.value === "CABINET"
                              ? "Vous gérez un cabinet médical et souhaitez publier des annonces de remplacement"
                              : "Vous êtes médecin et recherchez des opportunités de remplacement"}
                          </p>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-900">
                              Ce que vous pourrez faire :
                            </p>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                              {role.value === "CABINET" ? (
                                <>
                                  <li>
                                    • Publier des annonces de remplacement
                                  </li>
                                  <li>• Recevoir et gérer les candidatures</li>
                                  <li>• Communiquer avec les médecins</li>
                                  <li>• Suivre vos remplacements</li>
                                </>
                              ) : (
                                <>
                                  <li>
                                    • Rechercher des opportunités de
                                    remplacement
                                  </li>
                                  <li>
                                    • Candidater aux annonces qui vous
                                    intéressent
                                  </li>
                                  <li>
                                    • Recevoir des recommandations
                                    personnalisées
                                  </li>
                                  <li>• Échanger avec les cabinets</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {selectedRole && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <Button
                    onClick={handleRoleSelection}
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Configuration en cours...
                      </>
                    ) : (
                      <>
                        Continuer comme{" "}
                        {selectedRole === "CABINET" ? "Cabinet" : "Médecin"}
                        <Icons.arrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Vous pourrez modifier ce choix plus tard dans vos paramètres
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
