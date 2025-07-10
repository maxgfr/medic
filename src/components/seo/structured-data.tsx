"use client";

import Script from "next/script";

interface JobPostingProps {
	title: string;
	description: string;
	location: string;
	datePosted: string;
	validThrough: string;
	hiringOrganization: {
		name: string;
		address: string;
	};
	employmentType: string;
	specialty: string;
}

interface StructuredDataProps {
	jobPostings?: JobPostingProps[];
}

export function StructuredData({ jobPostings }: StructuredDataProps) {
	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "Medic Remplacement",
		url: "https://medic-remplacement.com",
		description:
			"Plateforme de mise en relation entre cabinets médicaux et médecins remplaçants en France",
		potentialAction: {
			"@type": "SearchAction",
			target:
				"https://medic-remplacement.com/?specialty={specialty}&location={location}",
			"query-input": "required name=specialty,location",
		},
	};

	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Medic Remplacement",
		url: "https://medic-remplacement.com",
		logo: "https://medic-remplacement.com/logo.png",
		description:
			"Plateforme de mise en relation entre cabinets médicaux et médecins remplaçants en France",
		contactPoint: {
			"@type": "ContactPoint",
			telephone: "+33-1-XX-XX-XX-XX",
			contactType: "customer service",
			availableLanguage: "French",
		},
		sameAs: [
			"https://www.facebook.com/medic.remplacement",
			"https://www.twitter.com/medic_remplacement",
			"https://www.linkedin.com/company/medic-remplacement",
		],
	};

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Accueil",
				item: "https://medic-remplacement.com",
			},
		],
	};

	const jobPostingsSchema = jobPostings?.map((job, index) => ({
		"@context": "https://schema.org",
		"@type": "JobPosting",
		title: job.title,
		description: job.description,
		identifier: {
			"@type": "PropertyValue",
			name: "Medic Remplacement",
			value: `job-${index}`,
		},
		datePosted: job.datePosted,
		validThrough: job.validThrough,
		employmentType: job.employmentType,
		hiringOrganization: {
			"@type": "Organization",
			name: job.hiringOrganization.name,
			address: {
				"@type": "PostalAddress",
				addressLocality: job.location,
				addressCountry: "FR",
			},
		},
		jobLocation: {
			"@type": "Place",
			address: {
				"@type": "PostalAddress",
				addressLocality: job.location,
				addressCountry: "FR",
			},
		},
		industry: "Healthcare",
		occupationalCategory: job.specialty,
		workHours: "Full-time",
		baseSalary: {
			"@type": "MonetaryAmount",
			currency: "EUR",
			value: {
				"@type": "QuantitativeValue",
				unitText: "HOUR",
			},
		},
	}));

	return (
		<>
			<Script
				id="website-schema"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
			/>
			<Script
				id="organization-schema"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
			/>
			<Script
				id="breadcrumb-schema"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>
			{jobPostingsSchema?.map((schema, index) => (
				<Script
					key={`job-schema-${schema.identifier?.value || Date.now()}-${index}`}
					id={`job-schema-${index}`}
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(schema),
					}}
				/>
			))}
		</>
	);
}
