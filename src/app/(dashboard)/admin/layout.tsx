import { AdminAccessGuard } from "~/components/admin-access-guard";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AdminAccessGuard>{children}</AdminAccessGuard>;
}
