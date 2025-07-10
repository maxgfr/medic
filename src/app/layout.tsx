import "~/styles/globals.css";

import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Medic Remplacement - Plateforme de remplacements médicaux",
	description:
		"Trouvez facilement des remplacements médicaux. Plateforme de mise en relation entre cabinets médicaux et médecins remplaçants en France.",
	keywords: [
		"remplacement médical",
		"médecin remplaçant",
		"cabinet médical",
		"annonce médicale",
		"emploi médical",
		"intérim médical",
		"remplacer médecin",
		"offre emploi médecin",
	],
	authors: [{ name: "Medic Remplacement" }],
	creator: "Medic Remplacement",
	publisher: "Medic Remplacement",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	icons: [{ rel: "icon", url: "/favicon.ico" }],
	metadataBase: new URL("https://medic-remplacement.com"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "fr_FR",
		url: "https://medic-remplacement.com",
		title: "Medic Remplacement - Plateforme de remplacements médicaux",
		description:
			"Trouvez facilement des remplacements médicaux. Plateforme de mise en relation entre cabinets médicaux et médecins remplaçants en France.",
		siteName: "Medic Remplacement",
		images: [
			{
				url: "/og-image.jpg",
				width: 1200,
				height: 630,
				alt: "Medic Remplacement - Plateforme de remplacements médicaux",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Medic Remplacement - Plateforme de remplacements médicaux",
		description:
			"Trouvez facilement des remplacements médicaux. Plateforme de mise en relation entre cabinets médicaux et médecins remplaçants en France.",
		images: ["/og-image.jpg"],
		creator: "@medic_remplacement",
	},
	verification: {
		google: "your-google-verification-code",
		yandex: "your-yandex-verification-code",
		yahoo: "your-yahoo-verification-code",
	},
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<SessionProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</SessionProvider>
				<Toaster />
			</body>
		</html>
	);
}
