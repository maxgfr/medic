"use client";

import { signIn, getProviders } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Icons } from "~/components/ui/icons";
import { loginSchema, type LoginFormData } from "~/lib/validations";

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

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  const onSubmit = async (values: LoginFormData) => {
    setIsLoading("credentials");
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email ou mot de passe incorrect");
      } else {
        toast.success("Connexion réussie !");
        window.location.href = "/dashboard";
      }
    } catch (error) {
      toast.error("Erreur lors de la connexion");
    } finally {
      setIsLoading(null);
    }
  };

  const handleProviderSignIn = async (providerId: string) => {
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
        {/* Formulaire de connexion email/mot de passe */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="votre@email.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading === "credentials"}
            >
              {isLoading === "credentials" && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Se connecter
            </Button>
          </form>
        </Form>

        {/* Séparateur pour autres providers */}
        {providers &&
          Object.values(providers).some((p) => p.id !== "credentials") && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>
          )}

        {/* Autres providers */}
        {providers &&
          Object.values(providers)
            .filter((provider) => provider.id !== "credentials")
            .map((provider) => (
              <Button
                key={provider.name}
                variant="outline"
                onClick={() => handleProviderSignIn(provider.id)}
                disabled={isLoading === provider.id}
                className="w-full"
              >
                {isLoading === provider.id ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
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
