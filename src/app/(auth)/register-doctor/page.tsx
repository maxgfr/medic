"use client";

import { AuthRegisterForm } from "~/components/forms/auth-register-form";

export default function RegisterDoctorPage() {
	return <AuthRegisterForm userRole="DOCTOR" />;
}
