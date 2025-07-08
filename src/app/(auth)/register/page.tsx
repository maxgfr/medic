"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/ui/icons";
import { USER_ROLES } from "~/lib/constants";

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

export default function RegisterPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<"CABINET" | "DOCTOR" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  const handleSignIn = async (providerId: string) => {
    if (!selectedRole) return;

    setIsLoading(providerId);
    try {
      // Store the selected role in localStorage to use after authentication
      localStorage.setItem("selectedRole", selectedRole);
      await signIn(providerId, {
        callbackUrl: `/onboarding?role=${selectedRole}`,
      });
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
        <CardDescription className="text-center">
          Choisissez votre rôle et créez votre compte Medic Remplacement
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Sélection du rôle */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-center">Je suis :</div>
          <div className="grid grid-cols-1 gap-3">
            {USER_ROLES.map((role) => (
              <Button
                key={role.value}
                variant={selectedRole === role.value ? "default" : "outline"}
                onClick={() =>
                  setSelectedRole(role.value as "CABINET" | "DOCTOR")
                }
                className="h-auto p-4 justify-start"
              >
                <div className="flex items-center gap-3">
                  {role.value === "CABINET" ? (
                    <Icons.building className="h-5 w-5" />
                  ) : (
                    <Icons.stethoscope className="h-5 w-5" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{role.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.value === "CABINET"
                        ? "Publier des annonces de remplacement"
                        : "Candidater aux remplacements"}
                    </span>
                  </div>
                </div>
                {selectedRole === role.value && (
                  <Badge variant="secondary" className="ml-auto">
                    Sélectionné
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {selectedRole && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Continuer avec
                </span>
              </div>
            </div>

            {/* Providers d'authentification */}
            {providers &&
              Object.values(providers).map((provider) => (
                <Button
                  key={provider.name}
                  variant="outline"
                  onClick={() => handleSignIn(provider.id)}
                  disabled={isLoading === provider.id}
                  className="w-full"
                >
                  {isLoading === provider.id ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : provider.name === "Discord" ? (
                    <Icons.discord className="mr-2 h-4 w-4" />
                  ) : provider.name === "Google" ? (
                    <Icons.google className="mr-2 h-4 w-4" />
                  ) : (
                    <Icons.user className="mr-2 h-4 w-4" />
                  )}
                  Créer un compte avec {provider.name}
                </Button>
              ))}
          </>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Déjà inscrit ?
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            window.location.href = "/login";
          }}
        >
          Se connecter
        </Button>
      </CardContent>
    </Card>
  );
}
