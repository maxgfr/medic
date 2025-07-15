import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const input = searchParams.get("input");

		if (!input || input.length < 3) {
			return NextResponse.json({ predictions: [] });
		}

		const apiKey = process.env.GOOGLE_MAPS_API_KEY;

		if (!apiKey) {
			console.error("GOOGLE_MAPS_API_KEY is not configured");
			return NextResponse.json(
				{ error: "Google Maps API key not configured" },
				{ status: 500 },
			);
		}

		// Construire l'URL pour l'API Google Places Autocomplete
		const url = new URL(
			"https://maps.googleapis.com/maps/api/place/autocomplete/json",
		);
		url.searchParams.append("input", input);
		url.searchParams.append("key", apiKey);
		url.searchParams.append("components", "country:fr"); // Restrict to France
		url.searchParams.append("types", "(cities)");

		const response = await fetch(url.toString());
		const data = await response.json();

		if (data.status === "OK") {
			return NextResponse.json({ predictions: data.predictions || [] });
		}

		console.error("Google Places API error:", data.status, data.error_message);
		return NextResponse.json(
			{ error: "Google Places API error", status: data.status },
			{ status: 400 },
		);
	} catch (error) {
		console.error("Error in Google Maps autocomplete API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
