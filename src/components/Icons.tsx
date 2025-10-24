import React from 'react'
import {
  Gamepad2,
  Coins,
  TrendingUp,
  Users,
  Zap,
  Crown,
  Star,
  Award,
  Bell,
  Settings,
  Home,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Info,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Share,
  Heart,
  MessageCircle,
  Send,
  User,
  Wallet,
  Trophy,
  Target,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Link as LinkIcon,
  Hash,
  AtSign,
  Mail,
  Phone,
  MapPin,
  Globe,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Cpu,
  Database,
  Cloud,
  Server,
  Wifi,
  Bluetooth,
  Battery,
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Image,
  File,
  FileText,
  Folder,
  Archive,
  Code,
  Terminal,
  GitBranch,
  Zap as Lightning,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  Sun as Sunny,
  CloudRain,
  CloudSnow,
  Rainbow,
  Gem,
  Diamond,
  Sparkles,
  PartyPopper,
  Gift,
  ShoppingCart,
  CreditCard,
  Banknote,
  DollarSign,
  Euro,
  PoundSterling,
  Bitcoin,
  type LucideIcon
} from 'lucide-react'

interface IconProps {
  name: string
  size?: number
  className?: string
  color?: string
  strokeWidth?: number
  onClick?: () => void
}

const iconMap: Record<string, LucideIcon> = {
  // Juegos y casino
  game: Gamepad2,
  casino: Coins,
  trending: TrendingUp,
  users: Users,
  zap: Zap,
  crown: Crown,
  star: Star,
  award: Award,

  // Navegación
  home: Home,
  bell: Bell,
  settings: Settings,

  // Media
  play: Play,
  pause: Pause,
  volume: Volume2,
  volumeMuted: VolumeX,

  // Información
  info: Info,
  check: CheckCircle,
  alert: AlertCircle,
  close: X,

  // Navegación
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  maximize: Maximize2,
  minimize: Minimize2,

  // Acciones
  refresh: RefreshCw,
  download: Download,
  share: Share,
  heart: Heart,
  message: MessageCircle,
  send: Send,

  // Usuario
  user: User,
  wallet: Wallet,
  trophy: Trophy,
  target: Target,

  // Tiempo
  clock: Clock,
  calendar: Calendar,

  // Datos
  chart: BarChart3,
  pieChart: PieChart,
  activity: Activity,

  // Seguridad
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
  eye: Eye,
  eyeOff: EyeOff,

  // Búsqueda
  search: Search,
  filter: Filter,
  sortAsc: SortAsc,
  sortDesc: SortDesc,

  // Edición
  plus: Plus,
  minus: Minus,
  edit: Edit,
  trash: Trash2,
  copy: Copy,

  // Enlaces
  externalLink: ExternalLink,
  link: LinkIcon,

  // Comunicación
  hash: Hash,
  atSign: AtSign,
  mail: Mail,
  phone: Phone,

  // Ubicación
  mapPin: MapPin,
  globe: Globe,

  // Tema
  moon: Moon,
  sun: Sun,
  monitor: Monitor,

  // Dispositivos
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  cpu: Cpu,

  // Tecnología
  database: Database,
  cloud: Cloud,
  server: Server,
  wifi: Wifi,
  bluetooth: Bluetooth,

  // Multimedia
  battery: Battery,
  camera: Camera,
  mic: Mic,
  micOff: MicOff,
  video: Video,
  videoOff: VideoOff,
  image: Image,

  // Archivos
  file: File,
  fileText: FileText,
  folder: Folder,
  archive: Archive,

  // Desarrollo
  code: Code,
  terminal: Terminal,
  gitBranch: GitBranch,

  // Elementos
  lightning: Lightning,
  flame: Flame,
  snowflake: Snowflake,
  wind: Wind,
  droplets: Droplets,
  sunny: Sunny,
  cloudRain: CloudRain,
  cloudSnow: CloudSnow,
  rainbow: Rainbow,

  // Lujo
  gem: Gem,
  diamond: Diamond,
  sparkles: Sparkles,

  // Celebración
  party: PartyPopper,
  gift: Gift,

  // Comercio
  cart: ShoppingCart,
  creditCard: CreditCard,
  banknote: Banknote,
  dollar: DollarSign,
  euro: Euro,
  pound: PoundSterling,
  bitcoin: Bitcoin,

  // Fairness
  fairness: Shield,
  shuffle: RefreshCw
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  color = 'currentColor',
  strokeWidth = 2,
  onClick
}) => {
  const LucideIcon = iconMap[name]

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`)
    return null
  }

  return (
    <LucideIcon
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'inherit' }}
    />
  )
}

// Exportar iconos específicos para uso directo
export {
  Gamepad2 as GameIcon,
  Coins as CasinoIcon,
  Home as HomeIcon,
  Bell as NotificationIcon,
  Settings as SettingsIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Volume2 as VolumeIcon,
  VolumeX as VolumeMutedIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  AlertCircle as AlertIcon,
  X as CloseIcon,
  Crown as CrownIcon,
  Star as StarIcon,
  Award as AwardIcon,
  Users as UsersIcon,
  Zap as ZapIcon,
  Wallet as WalletIcon,
  Trophy as TrophyIcon,
  Shield as FairnessIcon,
  RefreshCw as ShuffleIcon,
  Send as SendIcon,
  MessageCircle as ChatIcon
}
