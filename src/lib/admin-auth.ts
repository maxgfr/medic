import jwt from "jsonwebtoken";
import { env } from "~/env";

/**
 * Vérifie si l'utilisateur est authentifié comme admin via le token JWT
 * dans les cookies de la requête
 */
export function verifyAdminAuth(cookies: {
	get: (name: string) => { value: string } | undefined;
}) {
	try {
		const token = cookies.get("admin_token")?.value;

		if (!token) {
			return false;
		}

		// Vérifier et décoder le JWT
		const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET) as {
			admin: boolean;
			exp: number;
		};

		// Vérifier que c'est bien un token admin valide
		return decoded.admin === true;
	} catch (error) {
		// Token invalide ou expiré
		return false;
	}
}

/**
 * Middleware pour protéger les routes admin côté serveur
 * Utilisable dans les API routes
 */
export function requireAdminAuth(cookies: {
	get: (name: string) => { value: string } | undefined;
}) {
	const isAuthenticated = verifyAdminAuth(cookies);

	if (!isAuthenticated) {
		throw new Error("Accès admin requis");
	}

	return true;
}
