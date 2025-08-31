import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "~/env";

export async function POST(request: NextRequest) {
	try {
		const { accessCode } = await request.json();

		if (!accessCode || typeof accessCode !== "string") {
			return NextResponse.json(
				{ error: "Code d'accès requis" },
				{ status: 400 },
			);
		}

		// Vérifier le code d'accès avec la variable d'environnement
		if (accessCode === env.ADMIN_ACCESS_CODE) {
			// Créer un JWT avec expiration (2 heures)
			const token = jwt.sign(
				{
					admin: true,
					exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 heures
				},
				env.ADMIN_JWT_SECRET,
			);

			// Créer la réponse et setter le cookie HTTP-only sécurisé
			const response = NextResponse.json({ success: true });

			response.cookies.set({
				name: "admin_token",
				value: token,
				httpOnly: true, // Pas accessible via JavaScript côté client
				secure: process.env.NODE_ENV === "production", // HTTPS en production
				sameSite: "strict", // Protection CSRF
				maxAge: 2 * 60 * 60, // 2 heures en secondes
				path: "/", // Accessible sur tout le site
			});

			return response;
		}

		return NextResponse.json(
			{ error: "Code d'accès incorrect" },
			{ status: 401 },
		);
	} catch (error) {
		console.error("Erreur lors de la vérification du code d'accès:", error);
		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 },
		);
	}
}
