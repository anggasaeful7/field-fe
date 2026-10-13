import { LucideIcon, LayoutDashboard, FileText, Users } from "lucide-react";

export interface ChildItem {
  id?: number | string;
  name: string;
  icon?: LucideIcon;
  items?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  badgeContent?: string;
  isActive?: boolean;
  external?: boolean;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: LucideIcon;
  id?: number | string;
  to?: string;
  item?: MenuItem[];
  items?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  badgeContent?: string;
  isActive?: boolean;
  isPro?: boolean;
}

const SidebarContent: MenuItem[] = [
  {
    heading: "Menu Utama",
    items: [
      {
        id: "nav-dashboard",
        name: "Dashboard",
        icon: LayoutDashboard,
        url: "/",
      },
      {
        id: "nav-reports",
        name: "Laporan Lapangan",
        icon: FileText,
        url: "/reports",
      },
      {
        id: "nav-users",
        name: "Kelola Pengguna",
        icon: Users,
        url: "/admin/users",
      },
    ],
  },
];

export default SidebarContent;
