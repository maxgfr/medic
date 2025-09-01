import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const input = searchParams.get("input");

	if (!input) {
		return NextResponse.json({ error: "Input manquant" }, { status: 400 });
	}

	try {
		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		if (!apiKey) {
			console.error("GOOGLE_MAPS_API_KEY n'est pas configuré");
			return NextResponse.json(
				{ error: "Configuration manquante" },
				{ status: 500 },
			);
		}

		// Utiliser Geocoding API pour obtenir les coordonnées exactes d'une adresse/ville
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
				input,
			)}&key=${apiKey}&region=fr&language=fr`,
		);

		const data = await response.json();

		if (data.status === "OK" && data.results.length > 0) {
			const result = data.results[0];
			return NextResponse.json({
				location: result.formatted_address,
				coordinates: {
					lat: result.geometry.location.lat,
					lng: result.geometry.location.lng,
				},
				place_id: result.place_id,
				// Ajouter les métadonnées pour le smart radius
				geocodingResult: {
					types: result.types,
					geometry: {
						bounds: result.geometry.bounds,
					},
				},
			});
		}

		return NextResponse.json(
			{ error: "Aucun résultat trouvé" },
			{ status: 404 },
		);
	} catch (error) {
		console.error("Erreur lors du geocoding:", error);
		return NextResponse.json(
			{ error: "Erreur lors de la géolocalisation" },
			{ status: 500 },
		);
	}
}
