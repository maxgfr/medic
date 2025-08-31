import { NextResponse } from "next/server";

export async function POST() {
	try {
		const response = NextResponse.json({ success: true });

		// Supprimer le cookie admin en le remplaçant par un cookie expiré
		response.cookies.set({
			name: "admin_token",
			value: "",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 0, // Expire immédiatement
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Erreur lors de la déconnexion admin:", error);
		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 },
		);
	}
}
