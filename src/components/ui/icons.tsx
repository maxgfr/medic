import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Bell,
	Briefcase,
	Building,
	Calendar,
	Check,
	CheckCircle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clock,
	Copy,
	Download,
	Edit,
	Euro,
	ExternalLink,
	Eye,
	EyeOff,
	FileText,
	Filter,
	Heart,
	Info,
	Loader2,
	LogIn,
	LogOut,
	type LucideIcon,
	Mail,
	MapPin,
	Menu,
	MessageCircle,
	Phone,
	Plus,
	Search,
	Send,
	Settings,
	Share2,
	Star,
	Stethoscope,
	Trash2,
	Upload,
	User,
	Users,
	X,
	XCircle,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
	spinner: Loader2,
	user: User,
	mail: Mail,
	building: Building,
	stethoscope: Stethoscope,
	mapPin: MapPin,
	calendar: Calendar,
	clock: Clock,
	euro: Euro,
	search: Search,
	filter: Filter,
	plus: Plus,
	edit: Edit,
	trash: Trash2,
	eye: Eye,
	eyeOff: EyeOff,
	check: Check,
	x: X,
	chevronLeft: ChevronLeft,
	chevronRight: ChevronRight,
	chevronDown: ChevronDown,
	chevronUp: ChevronUp,
	arrowLeft: ArrowLeft,
	arrowRight: ArrowRight,
	menu: Menu,
	settings: Settings,
	logOut: LogOut,
	bell: Bell,
	messageCircle: MessageCircle,
	phone: Phone,
	fileText: FileText,
	upload: Upload,
	download: Download,
	heart: Heart,
	star: Star,
	share: Share2,
	copy: Copy,
	externalLink: ExternalLink,
	alertCircle: AlertCircle,
	checkCircle: CheckCircle,
	xCircle: XCircle,
	info: Info,
	briefcase: Briefcase,
	send: Send,
	users: Users,
	logIn: LogIn,
	google: ({ ...props }) => (
		<svg role="img" viewBox="0 0 24 24" {...props}>
			<title>Google</title>
			<path
				fill="currentColor"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="currentColor"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="currentColor"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="currentColor"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	),
	logo: ({ ...props }) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" {...props}>
			<title>Medic Logo</title>
			<rect width="256" height="256" fill="none" />
			<line
				x1="208"
				y1="128"
				x2="128"
				y2="208"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="16"
			/>
			<line
				x1="192"
				y1="40"
				x2="40"
				y2="192"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="16"
			/>
		</svg>
	),
} as const;
