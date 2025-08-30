"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import { type RegisterFormData, registerSchema } from "~/lib/validations";
import { api } from "~/trpc/react";

type Provider = {
	id: string;
	name: string;
	type: string;
	signinUrl: string;
	callbackUrl: string;
};

type UserRole = "DOCTOR" | "CABINET";

const AUTH_CONFIG: Record<
	UserRole,
	{
		register: {
			title: string;
			description: string;
			successRedirect: string;
			loginLink: string;
			alternativeText: string;
			alternativeLink: string;
			namePlaceholder: string;
			emailPlaceholder: string;
			submitText: string;
			loginText: string;
		};
	}
> = {
	DOCTOR: {
		register: {
			title: "Inscription Médecin",
			description:
				"Créez votre compte médecin pour rechercher des remplacements",
			successRedirect: "/login-doctor",
			loginLink: "/login-doctor",
			alternativeText: "Vous êtes un cabinet médical ?",
			alternativeLink: "/register-cabinet",
			namePlaceholder: "Dr. Jean Dupont",
			emailPlaceholder: "votre@email.com",
			submitText: "Créer mon compte médecin",
			loginText: "Se connecter à mon compte médecin",
		},
	},
	CABINET: {
		register: {
			title: "Inscription Cabinet",
			description:
				"Créez votre compte cabinet pour publier des offres de remplacement",
			successRedirect: "/login-cabinet",
			loginLink: "/login-cabinet",
			alternativeText: "Vous êtes un médecin ?",
			alternativeLink: "/register-doctor",
			namePlaceholder: "Cabinet Médical Dupont",
			emailPlaceholder: "contact@cabinet.com",
			submitText: "Créer mon compte cabinet",
			loginText: "Se connecter à mon compte cabinet",
		},
	},
};

export function AuthRegisterForm({ userRole }: { userRole: UserRole }) {
	const [providers, setProviders] = useState<Record<string, Provider> | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState<string | null>(null);
	const router = useRouter();
	const config = AUTH_CONFIG[userRole].register;

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
			role: userRole,
		},
	});

	const registerMutation = api.auth.register.useMutation({
		onSuccess: (data) => {
			toast.success(data.message);
			router.push(config.successRedirect);
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
			role: userRole,
		});
		setIsLoading(null);
	};

	const handleProviderSignIn = async (providerId: string) => {
		setIsLoading(providerId);
		try {
			localStorage.setItem("selectedRole", userRole);
			await signIn(providerId, {
				callbackUrl: `/onboarding?role=${userRole}`,
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
				<CardTitle className="text-center text-2xl">{config.title}</CardTitle>
				<CardDescription className="text-center">
					{config.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{/* Formulaire d'inscription email/mot de passe */}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										{userRole === "DOCTOR" ? "Nom complet" : "Nom du cabinet"}
									</FormLabel>
									<FormControl>
										<Input placeholder={config.namePlaceholder} {...field} />
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
											placeholder={config.emailPlaceholder}
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
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirmer le mot de passe</FormLabel>
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
							disabled={
								isLoading === "credentials" || registerMutation.isPending
							}
						>
							{(isLoading === "credentials" || registerMutation.isPending) && (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							)}
							{config.submitText}
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
									Ou s'inscrire avec
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
								S'inscrire avec {provider.name}
							</Button>
						))}

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Déjà inscrit
						</span>
					</div>
				</div>

				<Button
					variant="ghost"
					className="w-full"
					onClick={() => router.push(config.loginLink)}
				>
					{config.loginText}
				</Button>

				<div className="text-center text-muted-foreground text-sm">
					{config.alternativeText}{" "}
					<Button
						variant="link"
						className="h-auto p-0 font-medium"
						onClick={() => router.push(config.alternativeLink)}
					>
						{userRole === "DOCTOR"
							? "S'inscrire en tant que cabinet"
							: "S'inscrire en tant que médecin"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
