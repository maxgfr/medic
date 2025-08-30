"use client";

import { AuthLoginForm } from "~/components/forms/auth-login-form";

export default function LoginDoctorPage() {
	return <AuthLoginForm userRole="DOCTOR" />;
}
