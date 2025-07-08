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
import { Icons } from "~/components/ui/icons";

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

export default function LoginPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
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
    setIsLoading(providerId);
    try {
      await signIn(providerId, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Connexion</CardTitle>
        <CardDescription className="text-center">
          Connectez-vous à votre compte Medic Remplacement
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
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
              Continuer avec {provider.name}
            </Button>
          ))}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Nouvelle inscription
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => {
            window.location.href = "/register";
          }}
        >
          Créer un nouveau compte
        </Button>
      </CardContent>
    </Card>
  );
}
