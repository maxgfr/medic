import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { env } from "~/env";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("admin_token")?.value;

		if (!token) {
			return NextResponse.json({ authenticated: false });
		}

		// Vérifier et décoder le JWT
		const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET) as {
			admin: boolean;
			exp: number;
		};

		// Vérifier que c'est bien un token admin valide
		if (decoded.admin === true) {
			return NextResponse.json({ authenticated: true });
		}

		return NextResponse.json({ authenticated: false });
	} catch (error) {
		// Token invalide ou expiré
		console.error("Token admin invalide:", error);
		return NextResponse.json({ authenticated: false });
	}
}
