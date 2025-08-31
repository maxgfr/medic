"use client";

import { Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface AdminAccessGuardProps {
	children: React.ReactNode;
}

export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [accessCode, setAccessCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	// Vérifier l'authentification côté serveur au chargement
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/admin/check-auth");
				const data = await response.json();
				setIsAuthenticated(data.authenticated);
			} catch (error) {
				console.error(
					"Erreur lors de la vérification d'authentification:",
					error,
				);
				setIsAuthenticated(false);
			} finally {
				setIsCheckingAuth(false);
			}
		};

		void checkAuth();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/admin/verify-access", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ accessCode }),
			});

			if (response.ok) {
				setIsAuthenticated(true);
				toast.success("Accès admin accordé !");
			} else {
				toast.error("Code d'accès incorrect");
				setAccessCode("");
			}
		} catch (error) {
			console.error("Erreur lors de la vérification:", error);
			toast.error("Erreur lors de la vérification");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await fetch("/api/admin/logout", {
				method: "POST",
			});
			setIsAuthenticated(false);
			toast.info("Déconnexion admin");
		} catch (error) {
			console.error("Erreur lors de la déconnexion:", error);
			toast.error("Erreur lors de la déconnexion");
		}
	};

	// Afficher un loader pendant la vérification d'authentification
	if (isCheckingAuth) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50">
				<div className="text-center">
					<Shield className="mx-auto h-8 w-8 animate-pulse text-blue-600" />
					<p className="mt-2 text-gray-600 text-sm">
						Vérification de l'accès...
					</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
							<Shield className="h-6 w-6 text-blue-600" />
						</div>
						<CardTitle className="font-bold text-2xl">
							Accès Administrateur
						</CardTitle>
						<CardDescription>
							Veuillez entrer le code d'accès pour accéder à l'interface
							d'administration
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="accessCode">Code d'accès</Label>
								<div className="relative">
									<Lock className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
									<Input
										id="accessCode"
										type="password"
										placeholder="Entrez le code d'accès"
										value={accessCode}
										onChange={(e) => setAccessCode(e.target.value)}
										className="pl-10"
										required
									/>
								</div>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={isLoading || !accessCode.trim()}
							>
								{isLoading ? "Vérification..." : "Accéder"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div>
			{/* Barre de navigation admin avec bouton de déconnexion */}
			<div className="flex items-center justify-between bg-blue-600 px-4 py-2 text-white">
				<div className="flex items-center gap-2">
					<Shield className="h-4 w-4" />
					<span className="font-medium text-sm">Mode Administrateur</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={handleLogout}
					className="border-white text-blue-600 hover:bg-white/10"
				>
					Déconnexion
				</Button>
			</div>
			{children}
		</div>
	);
}
