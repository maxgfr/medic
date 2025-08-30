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
import { type LoginFormData, loginSchema } from "~/lib/validations";

type Provider = {
	id: string;
	name: string;
	type: string;
	signinUrl: string;
	callbackUrl: string;
};

type UserRole = "DOCTOR" | "CABINET";

interface AuthFormProps {
	type: "login" | "register";
	userRole: UserRole;
	title: string;
	description: string;
	successRedirect: string;
	registerLink: string;
	loginLink: string;
	alternativeRole: UserRole;
	alternativeLoginLink: string;
	alternativeRegisterLink: string;
}

const AUTH_CONFIG: Record<
	UserRole,
	{
		login: {
			title: string;
			description: string;
			successRedirect: string;
			registerLink: string;
			alternativeText: string;
			alternativeLink: string;
		};
		register: {
			title: string;
			description: string;
			successRedirect: string;
			loginLink: string;
			alternativeText: string;
			alternativeLink: string;
		};
	}
> = {
	DOCTOR: {
		login: {
			title: "Connexion Médecin",
			description:
				"Connectez-vous à votre compte médecin pour rechercher des remplacements",
			successRedirect: "/doctor/dashboard",
			registerLink: "/register-doctor",
			alternativeText: "Vous êtes un cabinet médical ?",
			alternativeLink: "/login-cabinet",
		},
		register: {
			title: "Inscription Médecin",
			description:
				"Créez votre compte médecin pour rechercher des remplacements",
			successRedirect: "/login-doctor",
			loginLink: "/login-doctor",
			alternativeText: "Vous êtes un cabinet médical ?",
			alternativeLink: "/register-cabinet",
		},
	},
	CABINET: {
		login: {
			title: "Connexion Cabinet",
			description:
				"Connectez-vous à votre compte cabinet pour publier des offres de remplacement",
			successRedirect: "/cabinet/dashboard",
			registerLink: "/register-cabinet",
			alternativeText: "Vous êtes un médecin ?",
			alternativeLink: "/login-doctor",
		},
		register: {
			title: "Inscription Cabinet",
			description:
				"Créez votre compte cabinet pour publier des offres de remplacement",
			successRedirect: "/login-cabinet",
			loginLink: "/login-cabinet",
			alternativeText: "Vous êtes un médecin ?",
			alternativeLink: "/register-doctor",
		},
	},
};

export function AuthLoginForm({ userRole }: { userRole: UserRole }) {
	const [providers, setProviders] = useState<Record<string, Provider> | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState<string | null>(null);
	const router = useRouter();
	const config = AUTH_CONFIG[userRole].login;

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
			} else if (result?.ok) {
				toast.success("Connexion réussie !");
				router.push(config.successRedirect);
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
			localStorage.setItem("userRole", userRole);
			await signIn(providerId, { callbackUrl: config.successRedirect });
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
							{userRole === "DOCTOR" ? "Nouveau médecin" : "Nouveau cabinet"}
						</span>
					</div>
				</div>

				<Button
					variant="ghost"
					className="w-full"
					onClick={() => router.push(config.registerLink)}
				>
					{userRole === "DOCTOR"
						? "Créer un compte médecin"
						: "Créer un compte cabinet"}
				</Button>

				<div className="text-center text-muted-foreground text-sm">
					{config.alternativeText}{" "}
					<Button
						variant="link"
						className="h-auto p-0 font-medium"
						onClick={() => router.push(config.alternativeLink)}
					>
						{userRole === "DOCTOR"
							? "Se connecter en tant que cabinet"
							: "Se connecter en tant que médecin"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
