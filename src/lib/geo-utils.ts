/**
 * Calcule la distance entre deux coordonnées géographiques en utilisant la formule de Haversine
 * @param lat1 Latitude du premier point
 * @param lon1 Longitude du premier point
 * @param lat2 Latitude du second point
 * @param lon2 Longitude du second point
 * @returns Distance en kilomètres
 */
export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371; // Rayon de la Terre en kilomètres
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) *
			Math.cos(toRadians(lat2)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;

	return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
}

/**
 * Convertit des degrés en radians
 */
function toRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

/**
 * Type pour les résultats de l'API Google Geocoding
 */
type GoogleGeocodingResult = {
	types: string[];
	geometry?: {
		bounds?: {
			northeast: { lat: number; lng: number };
			southwest: { lat: number; lng: number };
		};
	};
};

/**
 * Ajuste automatiquement le rayon de recherche basé sur le type de localisation
 * retourné par l'API Google Geocoding
 */
export function getSmartRadiusFromGeocodingResult(
	geocodingResult: GoogleGeocodingResult | null,
	requestedRadius: number,
): number {
	if (!geocodingResult?.types) {
		return requestedRadius;
	}

	const types = geocodingResult.types;

	// Détecter le type de localisation selon les types Google
	if (
		types.includes("locality") ||
		types.includes("administrative_area_level_2")
	) {
		// C'est une ville/commune
		const bounds = geocodingResult.geometry?.bounds;

		if (bounds) {
			// Calculer la taille approximative de la ville
			const northEast = bounds.northeast;
			const southWest = bounds.southwest;

			const width = calculateDistance(
				southWest.lat,
				southWest.lng,
				southWest.lat,
				northEast.lng,
			);
			const height = calculateDistance(
				southWest.lat,
				southWest.lng,
				northEast.lat,
				southWest.lng,
			);

			// Prendre le rayon = moitié de la plus grande dimension + marge de 20%
			const cityRadius = Math.max(width, height) * 0.6;

			// Si l'utilisateur demande un rayon plus petit que la taille de la ville,
			// utiliser au minimum la taille de la ville
			if (requestedRadius < cityRadius) {
				console.log(
					`🏙️ Rayon ajusté automatiquement: ${requestedRadius}km → ${Math.ceil(cityRadius)}km (taille de la ville)`,
				);
				return Math.ceil(cityRadius);
			}
		}
	}

	return requestedRadius;
}

/**
 * Détermine si une recherche concerne une ville entière vs un arrondissement spécifique
 */
export function isCityWideSearch(
	geocodingResult: GoogleGeocodingResult | null,
): boolean {
	if (!geocodingResult?.types) {
		return false;
	}

	const types = geocodingResult.types;

	// C'est une recherche de ville si c'est marqué comme locality ou administrative_area_level_2
	return (
		types.includes("locality") || types.includes("administrative_area_level_2")
	);
}

/**
 * Génère une clause SQL pour la recherche par distance
 * Utilise la formule de Haversine directement en SQL pour de meilleures performances
 */
export function getDistanceClause(
	lat: number,
	lon: number,
	radiusKm: number,
): string {
	return `(
		6371 * acos(
			cos(radians(${lat})) * 
			cos(radians(latitude)) * 
			cos(radians(longitude) - radians(${lon})) + 
			sin(radians(${lat})) * 
			sin(radians(latitude))
		)
	) <= ${radiusKm}`;
}

/**
 * Vérifie si un point est dans le rayon spécifié
 */
export function isWithinRadius(
	centerLat: number,
	centerLon: number,
	pointLat: number,
	pointLon: number,
	radiusKm: number,
): boolean {
	const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
	return distance <= radiusKm;
}
