"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Icons } from "~/components/ui/icons";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { MEDICAL_SPECIALTIES, getSpecialtyOptions } from "~/lib/constants";

interface LocationSuggestion {
	place_id: string;
	description: string;
}

interface SearchFormProps {
	onSearch: (filters: { specialty?: string; location?: string }) => void;
	isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
	const [specialty, setSpecialty] = useState<string>("all");
	const [location, setLocation] = useState<string>("");
	const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	const locationInputRef = useRef<HTMLInputElement>(null);
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleLocationSearch = async (value: string) => {
		setLocation(value);

		if (value.length < 3) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		// Clear previous timeout
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
		}

		// Debounce the search
		debounceTimeoutRef.current = setTimeout(async () => {
			setIsSearching(true);
			try {
				const response = await fetch(
					`/api/google-maps/autocomplete?input=${encodeURIComponent(value)}`,
				);
				const data = await response.json();

				if (response.ok && data.predictions) {
					setSuggestions(data.predictions);
					setShowSuggestions(true);
				} else {
					console.error("Error fetching place predictions:", data.error);
					setSuggestions([]);
					setShowSuggestions(false);
				}
			} catch (error) {
				console.error("Error fetching place predictions:", error);
				setSuggestions([]);
				setShowSuggestions(false);
			} finally {
				setIsSearching(false);
			}
		}, 300);
	};

	const handleLocationSelect = (suggestion: LocationSuggestion) => {
		setLocation(suggestion.description);
		setSuggestions([]);
		setShowSuggestions(false);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (debounceTimeoutRef.current) {
				clearTimeout(debounceTimeoutRef.current);
			}
		};
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch({
			specialty: specialty && specialty !== "all" ? specialty : undefined,
			location: location || undefined,
		});
	};

	const handleClear = () => {
		setSpecialty("all");
		setLocation("");
		setSuggestions([]);
		setShowSuggestions(false);
		onSearch({});
	};

	return (
		<Card className="mx-auto w-full max-w-4xl">
			<CardContent className="p-6">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="mb-6 text-center">
						<h2 className="mb-2 font-bold text-2xl text-gray-900">
							Trouvez votre remplacement médical
						</h2>
						<p className="text-gray-600">
							Recherchez par spécialité et localisation
						</p>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Specialty Search */}
						<div className="space-y-2">
							<label
								htmlFor="specialty-select"
								className="font-medium text-gray-700 text-sm"
							>
								Spécialité médicale
							</label>
							<Select value={specialty} onValueChange={setSpecialty}>
								<SelectTrigger id="specialty-select">
									<SelectValue placeholder="Toutes les spécialités" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Toutes les spécialités</SelectItem>
									{getSpecialtyOptions().map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Location Search with Google Maps */}
						<div className="relative space-y-2">
							<label
								htmlFor="location-input"
								className="font-medium text-gray-700 text-sm"
							>
								Ville ou région
							</label>
							<div className="relative">
								<Input
									id="location-input"
									ref={locationInputRef}
									type="text"
									placeholder="Paris, Lyon, Marseille..."
									value={location}
									onChange={(e) => handleLocationSearch(e.target.value)}
									onFocus={() => setShowSuggestions(suggestions.length > 0)}
									className="pr-10"
								/>
								<Icons.mapPin className="-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 transform text-gray-400" />
							</div>

							{/* Location Suggestions */}
							{showSuggestions && suggestions.length > 0 && (
								<Card className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto">
									<CardContent className="p-2">
										{suggestions.map((suggestion) => (
											<button
												key={suggestion.place_id}
												type="button"
												className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100"
												onClick={() => handleLocationSelect(suggestion)}
											>
												<div className="flex items-center">
													<Icons.mapPin className="mr-2 h-4 w-4 text-gray-400" />
													{suggestion.description}
												</div>
											</button>
										))}
									</CardContent>
								</Card>
							)}

							{/* Loading indicator for suggestions */}
							{isSearching && (
								<div className="absolute z-10 mt-1 w-full">
									<Card>
										<CardContent className="p-3">
											<div className="flex items-center">
												<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
												<span className="text-gray-500 text-sm">
													Recherche en cours...
												</span>
											</div>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-3 pt-4 sm:flex-row">
						<Button type="submit" className="flex-1" disabled={isLoading}>
							{isLoading ? (
								<>
									<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
									Recherche en cours...
								</>
							) : (
								<>
									<Icons.search className="mr-2 h-4 w-4" />
									Rechercher
								</>
							)}
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleClear}
							disabled={isLoading}
						>
							<Icons.x className="mr-2 h-4 w-4" />
							Effacer
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
