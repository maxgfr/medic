import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { cabinetProfiles, doctorProfiles } from "~/server/db/schema";

export async function middleware(req: NextRequest) {
	const token = await getToken({ req });
	const { pathname } = req.nextUrl;

	// Protected routes for cabinets
	const protectedCabinetRoutes = [
		"/cabinet/dashboard",
		"/cabinet/profile",
		"/cabinet/job-offers",
		"/cabinet/applications",
		"/cabinet/messages",
	];

	// Protected routes for doctors
	const protectedDoctorRoutes = [
		"/doctor/dashboard",
		"/doctor/profile",
		"/doctor/search",
		"/doctor/applications",
		"/doctor/messages",
	];

	const isProtectedCabinetRoute = protectedCabinetRoutes.some((route) =>
		pathname.startsWith(route),
	);

	const isProtectedDoctorRoute = protectedDoctorRoutes.some((route) =>
		pathname.startsWith(route),
	);

	// If user is not authenticated, let NextAuth handle it
	if (!token) {
		return NextResponse.next();
	}

	// Check cabinet users on protected cabinet routes
	if (token.role === "CABINET" && isProtectedCabinetRoute) {
		try {
			// Get cabinet profile status
			const cabinetProfile = await db.query.cabinetProfiles.findFirst({
				where: eq(cabinetProfiles.userId, token.sub as string),
			});

			// If no profile exists, redirect to onboarding
			if (!cabinetProfile) {
				return NextResponse.redirect(new URL("/onboarding", req.url));
			}

			// If profile is pending validation, redirect to validation page
			if (cabinetProfile.status === "PENDING") {
				if (!pathname.startsWith("/cabinet/validation-pending")) {
					return NextResponse.redirect(
						new URL("/cabinet/validation-pending", req.url),
					);
				}
				return NextResponse.next();
			}

			// If profile is rejected, redirect to rejected page
			if (cabinetProfile.status === "REJECTED") {
				if (!pathname.startsWith("/cabinet/validation-rejected")) {
					return NextResponse.redirect(
						new URL("/cabinet/validation-rejected", req.url),
					);
				}
				return NextResponse.next();
			}

			// If trying to access validation pages but approved, redirect to dashboard
			if (
				cabinetProfile.status === "APPROVED" &&
				(pathname.startsWith("/cabinet/validation-pending") ||
					pathname.startsWith("/cabinet/validation-rejected"))
			) {
				return NextResponse.redirect(new URL("/cabinet/dashboard", req.url));
			}
		} catch (error) {
			console.error("Error checking cabinet profile status:", error);
			// In case of error, allow access but log the issue
			return NextResponse.next();
		}
	}

	// Check doctor users on protected doctor routes
	if (token.role === "DOCTOR" && isProtectedDoctorRoute) {
		try {
			// Get doctor profile status
			const doctorProfile = await db.query.doctorProfiles.findFirst({
				where: eq(doctorProfiles.userId, token.sub as string),
			});

			// If no profile exists, redirect to onboarding
			if (!doctorProfile) {
				return NextResponse.redirect(new URL("/onboarding", req.url));
			}

			// If profile is pending validation, redirect to validation page
			if (doctorProfile.status === "PENDING") {
				if (!pathname.startsWith("/doctor/validation-pending")) {
					return NextResponse.redirect(
						new URL("/doctor/validation-pending", req.url),
					);
				}
				return NextResponse.next();
			}

			// If profile is rejected, redirect to rejected page
			if (doctorProfile.status === "REJECTED") {
				if (!pathname.startsWith("/doctor/validation-rejected")) {
					return NextResponse.redirect(
						new URL("/doctor/validation-rejected", req.url),
					);
				}
				return NextResponse.next();
			}

			// If trying to access validation pages but approved, redirect to dashboard
			if (
				doctorProfile.status === "APPROVED" &&
				(pathname.startsWith("/doctor/validation-pending") ||
					pathname.startsWith("/doctor/validation-rejected"))
			) {
				return NextResponse.redirect(new URL("/doctor/dashboard", req.url));
			}
		} catch (error) {
			console.error("Error checking doctor profile status:", error);
			// In case of error, allow access but log the issue
			return NextResponse.next();
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - login/register pages
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
	],
};
