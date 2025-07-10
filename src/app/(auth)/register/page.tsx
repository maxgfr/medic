"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
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
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { USER_ROLES } from "~/lib/constants";
import { type RegisterFormData, registerSchema } from "~/lib/validations";
import { api } from "~/trpc/react";

type Provider = {
	id: string;
	name: string;
	type: string;
	signinUrl: string;
	callbackUrl: string;
};

export default function RegisterPage() {
	const [providers, setProviders] = useState<Record<string, Provider> | null>(
		null,
	);
	const [selectedRole, setSelectedRole] = useState<"CABINET" | "DOCTOR" | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState<string | null>(null);

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			role: "DOCTOR",
		},
	});

	const registerMutation = api.auth.register.useMutation({
		onSuccess: (data) => {
			toast.success(data.message);
			// Rediriger vers la page de connexion
			window.location.href = "/login";
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	useEffect(() => {
		(async () => {
			const res = await getProviders();
			setProviders(res);
		})();
	}, []);

	const onSubmit = async (values: RegisterFormData) => {
		setIsLoading("credentials");
		registerMutation.mutate({
			name: values.name,
			email: values.email,
			password: values.password,
			role: values.role,
		});
		setIsLoading(null);
	};

	const handleProviderSignIn = async (providerId: string) => {
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
				<CardTitle className="text-center text-2xl">Créer un compte</CardTitle>
				<CardDescription className="text-center">
					Choisissez votre rôle et créez votre compte Medic Remplacement
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-6">
				{/* Sélection du rôle */}
				<div className="space-y-4">
					<div className="text-center font-medium text-sm">Je suis :</div>
					<div className="grid grid-cols-1 gap-3">
						{USER_ROLES.map((role) => (
							<Button
								key={role.value}
								variant={selectedRole === role.value ? "default" : "outline"}
								onClick={() =>
									setSelectedRole(role.value as "CABINET" | "DOCTOR")
								}
								className="h-auto justify-start p-4"
							>
								<div className="flex items-center gap-3">
									{role.value === "CABINET" ? (
										<Icons.building className="h-5 w-5" />
									) : (
										<Icons.stethoscope className="h-5 w-5" />
									)}
									<div className="flex flex-col items-start">
										<span className="font-medium">{role.label}</span>
										<span className="text-muted-foreground text-xs">
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
									Créer un compte
								</span>
							</div>
						</div>

						{/* Formulaire d'inscription */}
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nom complet</FormLabel>
											<FormControl>
												<Input placeholder="Jean Dupont" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
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
												<Input
													placeholder="••••••••"
													type="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirmer le mot de passe</FormLabel>
											<FormControl>
												<Input
													placeholder="••••••••"
													type="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="role"
									render={({ field }) => (
										<FormItem className="hidden">
											<Input
												type="hidden"
												{...field}
												value={selectedRole}
												onChange={() => field.onChange(selectedRole)}
											/>
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full"
									disabled={
										isLoading === "credentials" || registerMutation.isPending
									}
								>
									{(isLoading === "credentials" ||
										registerMutation.isPending) && (
										<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
									)}
									Créer mon compte
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

						{/* Providers d'authentification */}
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
