"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Bell,
	Check,
	FileText,
	MessageSquare,
	UserCheck,
	UserX,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";

const notificationIcons = {
	NEW_APPLICATION: FileText,
	APPLICATION_ACCEPTED: UserCheck,
	APPLICATION_REJECTED: UserX,
	NEW_MESSAGE: MessageSquare,
	NEW_JOB_OFFER: FileText,
	JOB_OFFER_UPDATED: FileText,
	PROFILE_INCOMPLETE: UserX,
};

export function NotificationsDropdown() {
	const [isOpen, setIsOpen] = useState(false);

	// Get notifications
	const { data: notifications, refetch: refetchNotifications } =
		api.notifications.getNotifications.useQuery({
			limit: 10,
			offset: 0,
		});

	// Get unread count
	const { data: unreadCount } = api.notifications.getUnreadCount.useQuery();

	// Mark as read mutation
	const markAsReadMutation = api.notifications.markAsRead.useMutation({
		onSuccess: () => {
			void refetchNotifications();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Mark all as read mutation
	const markAllAsReadMutation = api.notifications.markAllAsRead.useMutation({
		onSuccess: () => {
			void refetchNotifications();
			toast.success("Toutes les notifications ont été marquées comme lues");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleMarkAsRead = (notificationId: string) => {
		markAsReadMutation.mutate({ notificationId });
	};

	const handleMarkAllAsRead = () => {
		markAllAsReadMutation.mutate();
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm" className="relative">
					<Bell className="h-4 w-4" />
					{(unreadCount ?? 0) > 0 && (
						<Badge
							variant="destructive"
							className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center text-xs"
						>
							{(unreadCount ?? 0) > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="max-h-96 w-80 overflow-y-auto"
			>
				<div className="flex items-center justify-between p-2">
					<DropdownMenuLabel>Notifications</DropdownMenuLabel>
					{(unreadCount ?? 0) > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleMarkAllAsRead}
							disabled={markAllAsReadMutation.isPending}
						>
							<Check className="mr-1 h-3 w-3" />
							Tout marquer
						</Button>
					)}
				</div>

				<DropdownMenuSeparator />

				{!notifications?.length ? (
					<div className="p-4 text-center text-gray-500 text-sm">
						Aucune notification
					</div>
				) : (
					<div className="max-h-80 overflow-y-auto">
						{notifications.map((notification) => {
							const IconComponent =
								notificationIcons[notification.type] || Bell;

							return (
								<DropdownMenuItem
									key={notification.id}
									className={`flex cursor-pointer items-start gap-3 p-3 ${
										!notification.isRead ? "bg-blue-50" : ""
									}`}
									onClick={() => {
										if (!notification.isRead) {
											handleMarkAsRead(notification.id);
										}
									}}
								>
									<div
										className={`mt-0.5 ${
											!notification.isRead ? "text-blue-600" : "text-gray-400"
										}`}
									>
										<IconComponent className="h-4 w-4" />
									</div>

									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between">
											<p
												className={`truncate font-medium text-sm ${
													!notification.isRead
														? "text-gray-900"
														: "text-gray-600"
												}`}
											>
												{notification.title}
											</p>
											{!notification.isRead && (
												<div className="ml-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-600" />
											)}
										</div>

										<p className="mt-1 line-clamp-2 text-gray-500 text-xs">
											{notification.message}
										</p>

										<p className="mt-1 text-gray-400 text-xs">
											{formatDistanceToNow(notification.createdAt, {
												addSuffix: true,
												locale: fr,
											})}
										</p>
									</div>
								</DropdownMenuItem>
							);
						})}
					</div>
				)}

				{notifications?.length ? (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="p-2 text-center text-blue-600 text-sm hover:text-blue-800">
							Voir toutes les notifications
						</DropdownMenuItem>
					</>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
