import {
  LayoutGrid, BookOpen, ShoppingBag, Users, ChartColumn, House, ShoppingCart,
  Package, Tag, FileText, Eye, Pencil, Trash2, Copy, Upload, CloudUpload,
  EllipsisVertical, ChevronRight, ChevronLeft, RefreshCw, Save, Mail, Phone,
  MapPin, Store, CreditCard, Truck, Star, Image, Settings, Search, ArrowRight,
  ExternalLink, Bell, Plus, Download, CalendarDays, Wallet, Menu, Check, CircleAlert,
  HandHeart, ReceiptText, LibraryBig, Scale, Landmark, Shield, BriefcaseBusiness, GraduationCap, ScrollText, Gavel,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  grid: LayoutGrid, book: BookOpen, bag: ShoppingBag, users: Users,
  chart: ChartColumn, home: House, cart: ShoppingCart, box: Package, tag: Tag,
  file: FileText, bars: ChartColumn, eye: Eye, pencil: Pencil, trash: Trash2,
  copy: Copy, upload: Upload, cloud: CloudUpload, dots: EllipsisVertical,
  right: ChevronRight, left: ChevronLeft, refresh: RefreshCw, save: Save,
  mail: Mail, phone: Phone, pin: MapPin, store: Store, card: CreditCard,
  truck: Truck, star: Star, image: Image, settings: Settings, search: Search,
  arrow: ArrowRight, external: ExternalLink, bell: Bell, plus: Plus,
  down: Download, calendar: CalendarDays, wallet: Wallet, menu: Menu,
  check: Check, alert: CircleAlert,
  family: HandHeart, receipt: ReceiptText, library: LibraryBig,
  scale: Scale, landmark: Landmark, shield: Shield,
  briefcase: BriefcaseBusiness, graduation: GraduationCap,
  scroll: ScrollText, gavel: Gavel,
};

export function Glyph({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = icons[name] || BookOpen;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
