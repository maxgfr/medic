"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { SearchForm } from "~/components/ui/search-form";
import { PublicJobCard } from "~/components/ui/public-job-card";
import { Badge } from "~/components/ui/badge";
import { StructuredData } from "~/components/seo/structured-data";
import { api } from "~/trpc/react";
import Link from "next/link";
import { getSpecialtyName } from "~/lib/constants";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchFilters, setSearchFilters] = useState<{
    specialty?: string;
    location?: string;
  }>({});

  // Fetch public job offers with filters
  const { data: jobOffers, isLoading } = api.jobOffers.getPublic.useQuery({
    limit: 6,
    specialties: searchFilters.specialty
      ? [searchFilters.specialty]
      : undefined,
    location: searchFilters.location,
  });

  // Stats for hero section
  const totalJobs = jobOffers?.length || 0;

  // Prepare structured data for SEO
  const structuredJobData = jobOffers?.map((job) => ({
    title: job.title,
    description:
      job.description ||
      `Remplacement en ${getSpecialtyName(job.specialty)} à ${job.location}`,
    location: job.location,
    datePosted: job.createdAt.toISOString(),
    validThrough: job.endDate.toISOString(),
    hiringOrganization: {
      name: job.cabinet.cabinetName,
      address: job.location,
    },
    employmentType: job.type === "URGENT" ? "TEMPORARY" : "PART_TIME",
    specialty: getSpecialtyName(job.specialty),
  }));

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleSearch = (filters: { specialty?: string; location?: string }) => {
    setSearchFilters(filters);
  };

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
    <>
      <StructuredData jobPostings={structuredJobData} />
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

                {/* Stats */}
                <div className="flex justify-center items-center gap-4 mt-6">
                  <Badge variant="secondary" className="text-sm">
                    <Icons.briefcase className="w-4 h-4 mr-1" />
                    {totalJobs} annonces disponibles
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    <Icons.user className="w-4 h-4 mr-1" />
                    Rejoignez notre communauté
                  </Badge>
                </div>
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

        {/* Search Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trouvez votre remplacement idéal
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Recherchez parmi nos annonces par spécialité et localisation
            </p>
          </div>

          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Recent Job Offers Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Annonces récentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les dernières opportunités de remplacement médical
            </p>
            <div className="mt-4">
              <Badge variant="outline" className="text-sm">
                <Icons.clock className="w-4 h-4 mr-1" />
                Mis à jour en temps réel
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, index) => (
                <Card
                  key={`skeleton-${Date.now()}-${index}-${Math.random()}`}
                  className="h-80 animate-pulse"
                >
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 rounded w-4/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobOffers && jobOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobOffers.map((job) => (
                <PublicJobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  specialty={job.specialty}
                  location={job.location}
                  startDate={job.startDate.toISOString()}
                  endDate={job.endDate.toISOString()}
                  contractType={job.type}
                  description={job.description || undefined}
                  requirements={undefined}
                  isUrgent={job.type === "URGENT"}
                  createdAt={job.createdAt.toISOString()}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Icons.search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune annonce trouvée
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche ou
              </p>
              <Button asChild variant="outline">
                <Link href="/register">
                  <Icons.bell className="w-4 h-4 mr-2" />
                  Créer une alerte
                </Link>
              </Button>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Vous souhaitez voir plus d'annonces et postuler ?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/register">
                  <Icons.user className="mr-2 h-5 w-5" />
                  Créer mon compte médecin
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">
                  <Icons.building className="mr-2 h-5 w-5" />
                  Inscrire mon cabinet
                </Link>
              </Button>
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
                <div className="pt-4">
                  <Button asChild className="w-full">
                    <Link href="/register?type=cabinet">
                      <Icons.arrowRight className="mr-2 h-4 w-4" />
                      Démarrer maintenant
                    </Link>
                  </Button>
                </div>
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
                <div className="pt-4">
                  <Button asChild className="w-full">
                    <Link href="/register?type=doctor">
                      <Icons.arrowRight className="mr-2 h-4 w-4" />
                      Démarrer maintenant
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Rejoignez notre communauté et simplifiez vos remplacements
              médicaux
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">
                  <Icons.user className="mr-2 h-5 w-5" />
                  Créer mon compte gratuitement
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
