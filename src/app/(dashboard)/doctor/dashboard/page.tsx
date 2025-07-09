"use client";

import { useSession } from "next-auth/react";
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
import Link from "next/link";
import { api } from "~/trpc/react";

export default function DoctorDashboardPage() {
  const { data: session } = useSession();
  const { data: profileCompletion } = api.auth.getProfileCompletion.useQuery();
  const { data: profile } = api.auth.getDoctorProfile.useQuery(undefined, {
    enabled: !!session?.user,
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Médecin</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/doctor/search">
              <Icons.search className="mr-2 h-4 w-4" />
              Rechercher des annonces
            </Link>
          </Button>
        </div>
      </div>

      {/* Profile completion banner */}
      {profileCompletion && !profileCompletion.isComplete && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <Icons.alertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Complétez votre profil (
                  {profileCompletion.completionPercentage}%)
                </p>
                <p className="text-sm text-yellow-600">
                  Éléments manquants :{" "}
                  {profileCompletion.missingFields.join(", ")}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/doctor/profile">Compléter</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidatures Envoyées
            </CardTitle>
            <Icons.fileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidatures Acceptées
            </CardTitle>
            <Icons.checkCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Taux d'acceptation : 33%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Annonces Correspondantes
            </CardTitle>
            <Icons.search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Nouvelles cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Messages Non Lus
            </CardTitle>
            <Icons.messageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Nouveaux messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recommended Job Offers */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Annonces Recommandées</CardTitle>
            <CardDescription>
              Annonces correspondant à votre profil et disponibilités
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item === 1
                        ? "Remplacement Médecine Générale - Cabinet Dr. Martin"
                        : item === 2
                        ? "Urgence Cardiologie - Clinique Saint-Joseph"
                        : "Pédiatrie - Cabinet Médical du Centre"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item === 1
                        ? "Paris 15e • 15-20 Janvier 2025 • 70% rétrocession"
                        : item === 2
                        ? "Lyon 6e • 22-25 Janvier 2025 • 65% rétrocession"
                        : "Marseille 8e • 1-5 Février 2025 • 75% rétrocession"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={item === 1 ? "default" : "secondary"}>
                      {item === 1
                        ? "Urgent"
                        : item === 2
                        ? "Planifié"
                        : "Récurrent"}
                    </Badge>
                    <Badge variant="outline">
                      {item === 1
                        ? "95% match"
                        : item === 2
                        ? "88% match"
                        : "92% match"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/doctor/search">Voir toutes les annonces</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Applications Status */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Mes Candidatures</CardTitle>
            <CardDescription>
              Statut de vos candidatures récentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {item === 1 ? "CM" : item === 2 ? "SJ" : "MC"}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item === 1
                        ? "Cabinet Dr. Martin"
                        : item === 2
                        ? "Clinique Saint-Joseph"
                        : "Centre Médical"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item === 1
                        ? "Paris 15e • Médecine générale"
                        : item === 2
                        ? "Lyon 6e • Cardiologie"
                        : "Marseille 8e • Pédiatrie"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item === 1
                        ? "default"
                        : item === 2
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {item === 1
                      ? "Acceptée"
                      : item === 2
                      ? "En attente"
                      : "Vue"}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/doctor/applications">
                  Voir toutes mes candidatures
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile & Preferences */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
            <CardDescription>
              Informations de votre profil médecin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-medium">
                  {profile?.firstName?.[0]}
                  {profile?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-medium">
                    Dr. {profile?.firstName} {profile?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.experienceYears} ans d'expérience
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Spécialités :</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.specialties?.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  )) ?? <Badge variant="outline">Non renseigné</Badge>}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Zone de déplacement :</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.preferredLocations?.[0]?.name || "Non spécifié"} •
                  Rayon {profile?.preferredLocations?.[0]?.travelRadius || 0} km
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/doctor/profile">Modifier mon profil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Raccourcis vers vos actions les plus fréquentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/doctor/search">
                  <Icons.search className="mr-2 h-4 w-4" />
                  Rechercher des annonces
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start">
                <Link href="/doctor/applications">
                  <Icons.fileText className="mr-2 h-4 w-4" />
                  Mes candidatures
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start">
                <Link href="/doctor/messages">
                  <Icons.messageCircle className="mr-2 h-4 w-4" />
                  Messages
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start">
                <Link href="/doctor/profile">
                  <Icons.settings className="mr-2 h-4 w-4" />
                  Paramètres du profil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
