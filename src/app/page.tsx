"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (session) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icons.spinner className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">
            Redirection vers votre dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-8">
              <Icons.stethoscope className="h-8 w-8 text-white" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                Medic{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Remplacement
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                La plateforme de mise en relation entre cabinets médicaux et
                médecins remplaçants
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/register">
                  <Icons.user className="mr-2 h-5 w-5" />
                  Créer un compte
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Une solution pour tous
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Que vous soyez cabinet médical ou médecin remplaçant, notre
            plateforme facilite vos recherches
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Cabinet Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Icons.building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Cabinets Médicaux</CardTitle>
                  <CardDescription>
                    Trouvez rapidement des médecins remplaçants qualifiés
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Publier des annonces de remplacement
                </li>
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Recevoir des candidatures qualifiées
                </li>
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Messagerie intégrée
                </li>
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Gestion simplifiée des remplacements
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Doctor Card */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Icons.stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Médecins Remplaçants
                  </CardTitle>
                  <CardDescription>
                    Accédez à de nombreuses opportunités de remplacement
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Recherche d'annonces personnalisée
                </li>
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Recommandations basées sur votre profil
                </li>
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Candidature en un clic
                </li>
                <li className="flex items-center">
                  <Icons.check className="h-4 w-4 text-green-500 mr-2" />
                  Communication directe avec les cabinets
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez notre communauté et simplifiez vos remplacements médicaux
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">Créer mon compte gratuitement</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
