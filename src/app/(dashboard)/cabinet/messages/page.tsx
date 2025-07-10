"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	Archive,
	Calendar,
	MapPin,
	MessageCircle,
	Phone,
	Search,
	Send,
	Stethoscope,
	User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

export default function CabinetMessagesPage() {
	const [selectedConversation, setSelectedConversation] = useState<
		string | null
	>(null);
	const [newMessage, setNewMessage] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch conversations
	const { data: conversations, isLoading: loadingConversations } =
		api.messages.getConversations.useQuery({
			limit: 50,
			offset: 0,
		});

	// Fetch selected conversation details
	const { data: conversationDetails, isLoading: loadingMessages } =
		api.messages.getConversation.useQuery(
			{
				conversationId: selectedConversation || "",
				limit: 100,
				offset: 0,
			},
			{
				enabled: !!selectedConversation,
			},
		);

	// Send message mutation
	const sendMessageMutation = api.messages.sendMessage.useMutation({
		onSuccess: () => {
			setNewMessage("");
			toast.success("Message envoyé");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Archive conversation mutation
	const toggleArchiveMutation = api.messages.toggleArchive.useMutation({
		onSuccess: () => {
			toast.success("Conversation archivée");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handleSendMessage = () => {
		if (!selectedConversation || !newMessage.trim()) return;

		sendMessageMutation.mutate({
			conversationId: selectedConversation,
			content: newMessage.trim(),
		});
	};

	const handleArchiveConversation = (
		conversationId: string,
		isArchived: boolean,
	) => {
		toggleArchiveMutation.mutate({
			conversationId,
			isArchived: !isArchived,
		});
	};

	// Filter conversations based on search
	const filteredConversations = conversations?.filter(
		(conv) =>
			conv.doctor.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			conv.jobOffer.title.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (loadingConversations) {
		return (
			<div className="container mx-auto py-8">
				<div className="animate-pulse">
					<div className="mb-4 h-8 w-1/4 rounded bg-gray-200" />
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<div className="space-y-4">
							{[...Array(5)].map(() => (
								<div
									key={crypto.randomUUID()}
									className="h-24 rounded bg-gray-200"
								/>
							))}
						</div>
						<div className="h-96 rounded bg-gray-200 lg:col-span-2" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="font-bold text-3xl">Messages</h1>
				<Badge variant="secondary" className="flex items-center gap-2">
					<MessageCircle className="h-4 w-4" />
					{filteredConversations?.length || 0} conversation(s)
				</Badge>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Conversations List */}
				<div className="space-y-4">
					<div className="relative">
						<Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
						<Input
							placeholder="Rechercher une conversation..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					<div className="max-h-[600px] space-y-3 overflow-y-auto">
						{filteredConversations?.map((conversation) => {
							const lastMessage = conversation.messages[0];
							const isSelected = selectedConversation === conversation.id;

							return (
								<Card
									key={conversation.id}
									className={`cursor-pointer transition-colors hover:bg-gray-50 ${
										isSelected ? "border-blue-500 bg-blue-50" : ""
									}`}
									onClick={() => setSelectedConversation(conversation.id)}
								>
									<CardContent className="p-4">
										<div className="mb-2 flex items-start justify-between">
											<div>
												<h3 className="font-semibold text-sm">
													Dr. {conversation.doctor.firstName}{" "}
													{conversation.doctor.lastName}
												</h3>
												<p className="text-gray-500 text-xs">
													{conversation.doctor.experienceYears} ans d'expérience
												</p>
											</div>
											<div className="flex items-center gap-1">
												{conversation.isArchived && (
													<Badge variant="outline" className="text-xs">
														<Archive className="mr-1 h-3 w-3" />
														Archivé
													</Badge>
												)}
												<Button
													variant="ghost"
													size="sm"
													onClick={(e) => {
														e.stopPropagation();
														handleArchiveConversation(
															conversation.id,
															conversation.isArchived ?? false,
														);
													}}
												>
													<Archive className="h-4 w-4" />
												</Button>
											</div>
										</div>

										<p className="mb-2 text-gray-600 text-sm">
											{conversation.jobOffer.title}
										</p>

										{lastMessage && (
											<div className="text-gray-500 text-xs">
												<p className="mb-1 truncate">{lastMessage.content}</p>
												<span>
													{formatDistanceToNow(lastMessage.createdAt, {
														addSuffix: true,
														locale: fr,
													})}
												</span>
											</div>
										)}

										{!lastMessage && (
											<p className="text-gray-400 text-xs italic">
												Aucun message
											</p>
										)}
									</CardContent>
								</Card>
							);
						})}

						{filteredConversations?.length === 0 && (
							<Card>
								<CardContent className="p-8 text-center">
									<MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
									<h3 className="mb-2 font-semibold text-gray-900">
										Aucune conversation
									</h3>
									<p className="text-gray-600">
										Les conversations avec les médecins apparaîtront ici lorsque
										vous accepterez leurs candidatures.
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>

				{/* Messages Panel */}
				<div className="lg:col-span-2">
					{selectedConversation && conversationDetails ? (
						<Card className="flex h-[600px] flex-col">
							<CardHeader className="border-b">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-lg">
											Dr. {conversationDetails.doctor.firstName}{" "}
											{conversationDetails.doctor.lastName}
										</CardTitle>
										<p className="text-gray-600 text-sm">
											{conversationDetails.jobOffer.title}
										</p>
									</div>

									<Dialog>
										<DialogTrigger asChild>
											<Button variant="outline" size="sm">
												Profil du médecin
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-2xl">
											<DialogHeader>
												<DialogTitle>
													Dr. {conversationDetails.doctor.firstName}{" "}
													{conversationDetails.doctor.lastName}
												</DialogTitle>
											</DialogHeader>
											<div className="space-y-4">
												<div className="grid grid-cols-2 gap-4">
													<div className="flex items-center gap-2">
														<User className="h-4 w-4 text-gray-500" />
														<span className="text-sm">
															{conversationDetails.doctor.experienceYears} ans
															d'expérience
														</span>
													</div>
													<div className="flex items-center gap-2">
														<MapPin className="h-4 w-4 text-gray-500" />
														<span className="text-sm">
															{conversationDetails.doctor
																.preferredLocations?.[0]?.name ||
																"Non spécifié"}
														</span>
													</div>
												</div>

												<Separator />

												<div>
													<h4 className="mb-2 flex items-center gap-2 font-semibold">
														<Stethoscope className="h-4 w-4" />
														Spécialités
													</h4>
													<div className="flex flex-wrap gap-2">
														{conversationDetails.doctor.specialties.map(
															(specialty) => (
																<Badge key={specialty} variant="secondary">
																	{specialty}
																</Badge>
															),
														)}
													</div>
												</div>

												<div>
													<h4 className="mb-2 font-semibold">Disponibilités</h4>
													<div className="grid grid-cols-2 gap-2 text-sm">
														{Object.entries(
															conversationDetails.doctor.generalAvailability,
														).map(([day, available]) => (
															<div key={day} className="flex justify-between">
																<span className="capitalize">{day}:</span>
																<span
																	className={
																		available
																			? "text-green-600"
																			: "text-gray-400"
																	}
																>
																	{available ? "Disponible" : "Non disponible"}
																</span>
															</div>
														))}
													</div>
												</div>

												<div>
													<h4 className="mb-2 font-semibold">
														À propos de l'annonce
													</h4>
													<div className="space-y-2">
														<div className="flex items-center gap-2">
															<Calendar className="h-4 w-4 text-gray-500" />
															<span className="text-sm">
																{new Date(
																	conversationDetails.jobOffer.startDate,
																).toLocaleDateString("fr-FR")}{" "}
																-{" "}
																{new Date(
																	conversationDetails.jobOffer.endDate,
																).toLocaleDateString("fr-FR")}
															</span>
														</div>
														<div className="flex items-center gap-2">
															<MapPin className="h-4 w-4 text-gray-500" />
															<span className="text-sm">
																{conversationDetails.jobOffer.location}
															</span>
														</div>
													</div>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</CardHeader>

							{/* Messages */}
							<div className="flex-1 space-y-4 overflow-y-auto p-4">
								{loadingMessages ? (
									<div className="animate-pulse space-y-4">
										{[...Array(3)].map(() => (
											<div
												key={crypto.randomUUID()}
												className="h-16 rounded bg-gray-200"
											/>
										))}
									</div>
								) : (
									conversationDetails.messages.map((message) => {
										const isOwnMessage = message.sender.role === "CABINET";

										return (
											<div
												key={message.id}
												className={`flex ${
													isOwnMessage ? "justify-end" : "justify-start"
												}`}
											>
												<div
													className={`max-w-[70%] rounded-lg p-3 ${
														isOwnMessage
															? "bg-blue-500 text-white"
															: "bg-gray-100 text-gray-900"
													}`}
												>
													<p className="text-sm">{message.content}</p>
													<p
														className={`mt-1 text-xs ${
															isOwnMessage ? "text-blue-100" : "text-gray-500"
														}`}
													>
														{formatDistanceToNow(message.createdAt, {
															addSuffix: true,
															locale: fr,
														})}
													</p>
												</div>
											</div>
										);
									})
								)}
							</div>

							{/* Message Input */}
							<div className="border-t p-4">
								<div className="flex gap-2">
									<Textarea
										placeholder="Tapez votre message..."
										value={newMessage}
										onChange={(e) => setNewMessage(e.target.value)}
										className="min-h-[80px] flex-1"
										onKeyDown={(e) => {
											if (e.key === "Enter" && !e.shiftKey) {
												e.preventDefault();
												handleSendMessage();
											}
										}}
									/>
									<Button
										onClick={handleSendMessage}
										disabled={
											!newMessage.trim() || sendMessageMutation.isPending
										}
										className="self-end"
									>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</Card>
					) : (
						<Card className="flex h-[600px] items-center justify-center">
							<div className="text-center">
								<MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
								<h3 className="mb-2 font-semibold text-gray-900 text-xl">
									Sélectionnez une conversation
								</h3>
								<p className="text-gray-600">
									Choisissez une conversation dans la liste pour commencer à
									échanger.
								</p>
							</div>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
