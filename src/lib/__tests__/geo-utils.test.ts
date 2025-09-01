import { describe, expect, test } from "bun:test";
import {
	calculateDistance,
	getSmartRadiusFromGeocodingResult,
	isCityWideSearch,
} from "../geo-utils";

describe("Smart Radius - Geographic Intelligence", () => {
	// Cas de test pour différents types de localisation
	const testCases = [
		{
			name: "Paris (grande ville)",
			geocodingResult: {
				types: ["locality", "political"],
				geometry: {
					bounds: {
						northeast: { lat: 48.9021449, lng: 2.4699208 },
						southwest: { lat: 48.815573, lng: 2.224199 },
					},
				},
			},
			requestedRadius: 0,
			expectedMinRadius: 10, // Au moins 10km pour couvrir Paris
		},
		{
			name: "Montrouge (petite ville)",
			geocodingResult: {
				types: ["locality", "political"],
				geometry: {
					bounds: {
						northeast: { lat: 48.8229, lng: 2.3319 },
						southwest: { lat: 48.8109, lng: 2.3089 },
					},
				},
			},
			requestedRadius: 2,
			expectedMinRadius: 2, // Assez petit pour ne pas être ajusté
		},
		{
			name: "16ème arrondissement Paris (arrondissement)",
			geocodingResult: {
				types: ["sublocality_level_1", "sublocality", "political"],
				geometry: {
					bounds: {
						northeast: { lat: 48.8784, lng: 2.2979 },
						southwest: { lat: 48.8484, lng: 2.2479 },
					},
				},
			},
			requestedRadius: 1,
			expectedMinRadius: 1, // Pas ajusté car c'est un arrondissement
		},
		{
			name: "Adresse spécifique (pas une ville)",
			geocodingResult: {
				types: ["street_address"],
				geometry: {},
			},
			requestedRadius: 5,
			expectedMinRadius: 5, // Pas ajusté car pas une ville
		},
	];

	describe("getSmartRadiusFromGeocodingResult", () => {
		test.each(testCases)(
			"should handle $name correctly",
			({ geocodingResult, requestedRadius, expectedMinRadius }) => {
				const result = getSmartRadiusFromGeocodingResult(
					geocodingResult,
					requestedRadius,
				);

				expect(result).toBeGreaterThanOrEqual(expectedMinRadius);
				expect(result).toBeGreaterThanOrEqual(requestedRadius);
			},
		);

		test("should adjust radius for large cities when requested radius is too small", () => {
			const parisCase = testCases.find((tc) => tc.name.includes("Paris"));
			expect(parisCase).toBeDefined();
			if (!parisCase) return;

			const result = getSmartRadiusFromGeocodingResult(
				parisCase.geocodingResult,
				parisCase.requestedRadius,
			);

			// Paris avec rayon 0 devrait être ajusté à au moins 10km
			expect(result).toBeGreaterThan(parisCase.requestedRadius);
			expect(result).toBeGreaterThanOrEqual(10);
		});

		test("should not adjust radius for small cities when radius is sufficient", () => {
			const montrougeCase = testCases.find((tc) =>
				tc.name.includes("Montrouge"),
			);
			expect(montrougeCase).toBeDefined();
			if (!montrougeCase) return;

			const result = getSmartRadiusFromGeocodingResult(
				montrougeCase.geocodingResult,
				montrougeCase.requestedRadius,
			);

			// Montrouge avec rayon 2km ne devrait pas être ajusté
			expect(result).toBe(montrougeCase.requestedRadius);
		});

		test("should not adjust radius for non-city locations", () => {
			const addressCase = testCases.find((tc) => tc.name.includes("Adresse"));
			expect(addressCase).toBeDefined();
			if (!addressCase) return;

			const result = getSmartRadiusFromGeocodingResult(
				addressCase.geocodingResult,
				addressCase.requestedRadius,
			);

			// Adresse spécifique ne devrait pas être ajustée
			expect(result).toBe(addressCase.requestedRadius);
		});

		test("should handle null/invalid geocoding results gracefully", () => {
			expect(getSmartRadiusFromGeocodingResult(null, 5)).toBe(5);
			expect(getSmartRadiusFromGeocodingResult({ types: [] }, 5)).toBe(5);
		});
	});

	describe("isCityWideSearch", () => {
		test("should identify locality as city-wide search", () => {
			const parisCase = testCases.find((tc) => tc.name.includes("Paris"));
			expect(parisCase).toBeDefined();
			if (!parisCase) return;
			expect(isCityWideSearch(parisCase.geocodingResult)).toBe(true);
		});

		test("should identify administrative_area_level_2 as city-wide search", () => {
			const geocodingResult = {
				types: ["administrative_area_level_2", "political"],
			};
			expect(isCityWideSearch(geocodingResult)).toBe(true);
		});

		test("should not identify sublocality as city-wide search", () => {
			const arrondissementCase = testCases.find((tc) =>
				tc.name.includes("arrondissement"),
			);
			expect(arrondissementCase).toBeDefined();
			if (!arrondissementCase) return;
			expect(isCityWideSearch(arrondissementCase.geocodingResult)).toBe(false);
		});

		test("should not identify street address as city-wide search", () => {
			const addressCase = testCases.find((tc) => tc.name.includes("Adresse"));
			expect(addressCase).toBeDefined();
			if (!addressCase) return;
			expect(isCityWideSearch(addressCase.geocodingResult)).toBe(false);
		});

		test("should handle null/invalid results gracefully", () => {
			expect(isCityWideSearch(null)).toBe(false);
			expect(isCityWideSearch({ types: [] })).toBe(false);
		});
	});

	describe("calculateDistance", () => {
		test("should calculate distance between Paris coordinates correctly", () => {
			// Distance entre deux points de Paris (approximativement)
			const lat1 = 48.8566; // Centre de Paris
			const lng1 = 2.3522;
			const lat2 = 48.8584; // Tour Eiffel
			const lng2 = 2.2945;

			const distance = calculateDistance(lat1, lng1, lat2, lng2);

			// La distance entre ces deux points est d'environ 4-5km
			expect(distance).toBeGreaterThan(3);
			expect(distance).toBeLessThan(7);
		});

		test("should return 0 for identical coordinates", () => {
			const distance = calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);
			expect(distance).toBe(0);
		});

		test("should handle long distances correctly", () => {
			// Distance Paris - Lyon (environ 400km)
			const parisLat = 48.8566;
			const parisLng = 2.3522;
			const lyonLat = 45.764;
			const lyonLng = 4.8357;

			const distance = calculateDistance(parisLat, parisLng, lyonLat, lyonLng);

			expect(distance).toBeGreaterThan(350);
			expect(distance).toBeLessThan(450);
		});
	});

	describe("Integration Tests", () => {
		test("should provide realistic radius adjustments for major French cities", () => {
			// Test avec des données réalistes pour différentes villes
			const cities = [
				{
					name: "Paris",
					bounds: {
						northeast: { lat: 48.9021449, lng: 2.4699208 },
						southwest: { lat: 48.815573, lng: 2.224199 },
					},
					requestedRadius: 0,
					expectedMinAdjustment: 8,
				},
				{
					name: "Lyon",
					bounds: {
						northeast: { lat: 45.7873, lng: 4.8755 },
						southwest: { lat: 45.7271, lng: 4.7947 },
					},
					requestedRadius: 1,
					expectedMinAdjustment: 3,
				},
			];

			for (const city of cities) {
				const geocodingResult = {
					types: ["locality", "political"],
					geometry: { bounds: city.bounds },
				};

				const adjustedRadius = getSmartRadiusFromGeocodingResult(
					geocodingResult,
					city.requestedRadius,
				);

				expect(adjustedRadius).toBeGreaterThanOrEqual(
					city.expectedMinAdjustment,
				);
			}
		});
	});
});
