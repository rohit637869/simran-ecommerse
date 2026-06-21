// components/admin/AdminDashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  BarChart3,
  Layers,
  Tag,
  FileText,
  Truck,
  CreditCard,
  LogOut,
  Menu,
  ChevronDown,
  Bell,
  Search,
  Plus,
  Moon,
  Sun,
  User,
  Sparkles,
  Gift,
  MessageSquare,
  Image,
  ShoppingCart,
  DollarSign,
  Store,
  Palette,
  Zap,
  Clock,
  AlertCircle,
  Building2
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/app/actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// ============================================
// NAVIGATION CONFIGURATION
// ============================================

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: <ShoppingBag className="h-5 w-5" />,
    children: [
      { title: "All Products", href: "/admin/products", icon: <Package className="h-4 w-4" /> },
      { title: "Add New", href: "/admin/products/new", icon: <Plus className="h-4 w-4" /> },
      { title: "Categories", href: "/admin/products/categories", icon: <Layers className="h-4 w-4" /> },
      { title: "Collections", href: "/admin/products/collections", icon: <Palette className="h-4 w-4" /> },
      { title: "Tags", href: "/admin/products/tags", icon: <Tag className="h-4 w-4" /> },
      { title: "Brands", href: "/admin/products/brands", icon: <Building2 className="h-4 w-4" /> },
    ],
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
    badge: 12,
    children: [
      { title: "All Orders", href: "/admin/orders", icon: <ShoppingCart className="h-4 w-4" /> },
      { title: "Pending", href: "/admin/orders?status=pending", icon: <Clock className="h-4 w-4" /> },
      { title: "Processing", href: "/admin/orders?status=processing", icon: <Zap className="h-4 w-4" /> },
      { title: "Shipped", href: "/admin/orders?status=shipped", icon: <Truck className="h-4 w-4" /> },
      { title: "Delivered", href: "/admin/orders?status=delivered", icon: <Package className="h-4 w-4" /> },
    ],
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: <Users className="h-5 w-5" />,
    children: [
      { title: "All Customers", href: "/admin/customers", icon: <Users className="h-4 w-4" /> },
      { title: "Segments", href: "/admin/customers/segments", icon: <User className="h-4 w-4" /> },
      { title: "Reviews", href: "/admin/customers/reviews", icon: <MessageSquare className="h-4 w-4" /> },
    ],
  },
  {
    title: "Design Studio",
    href: "/admin/design",
    icon: <Palette className="h-5 w-5" />,
    children: [
      { title: "Designs", href: "/admin/design", icon: <Palette className="h-4 w-4" /> },
      { title: "Samples", href: "/admin/design/samples", icon: <Sparkles className="h-4 w-4" /> },
      { title: "Manufacturing", href: "/admin/design/manufacturing", icon: <Store className="h-4 w-4" /> },
    ],
  },
  {
    title: "Marketing",
    href: "/admin/marketing",
    icon: <Gift className="h-5 w-5" />,
    children: [
      { title: "Coupons", href: "/admin/marketing/coupons", icon: <Gift className="h-4 w-4" /> },
      { title: "Blog Posts", href: "/admin/marketing/blog", icon: <FileText className="h-4 w-4" /> },
      { title: "Lookbooks", href: "/admin/marketing/lookbooks", icon: <Image className="h-4 w-4" /> },
    ],
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    children: [
      { title: "Overview", href: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
      { title: "Sales", href: "/admin/analytics/sales", icon: <DollarSign className="h-4 w-4" /> },
      { title: "Inventory", href: "/admin/analytics/inventory", icon: <Package className="h-4 w-4" /> },
      { title: "Customers", href: "/admin/analytics/customers", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    children: [
      { title: "General", href: "/admin/settings/general", icon: <Settings className="h-4 w-4" /> },
      { title: "Store", href: "/admin/settings/store", icon: <Store className="h-4 w-4" /> },
      { title: "Shipping", href: "/admin/settings/shipping", icon: <Truck className="h-4 w-4" /> },
      { title: "Payment", href: "/admin/settings/payment", icon: <CreditCard className="h-4 w-4" /> },
    ],
  },
];

// ============================================
// COMPONENTS
// ============================================

// --- Sidebar Navigation Item ---
const NavItem = ({ item, depth = 0, isCollapsed, pathname }: { 
  item: NavItem; 
  depth?: number; 
  isCollapsed: boolean;
  pathname: string;
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const [isOpen, setIsOpen] = useState(hasChildren && isActive);

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.title}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-0.5">
      <Link
        href={item.href}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        style={{ paddingLeft: `${16 + depth * 12}px` }}
      >
        <span className="shrink-0">{item.icon}</span>
        <span className="flex-1 truncate">{item.title}</span>
        {item.badge && (
          <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center">
            {item.badge}
          </Badge>
        )}
        {hasChildren && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        )}
      </Link>
      {hasChildren && isOpen && (
        <div className="ml-4 space-y-0.5 border-l border-border pl-2">
          {item.children!.map((child) => (
            <NavItem
              key={child.href}
              item={child}
              depth={depth + 1}
              isCollapsed={false}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Mobile Sidebar ---
const MobileSidebar = ({ pathname }: { pathname: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-full flex-col bg-background">
          <div className="flex items-center gap-3 border-b px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Fashion Admin</h1>
              <p className="text-xs text-muted-foreground">Manage your store</p>
            </div>
          </div>
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  isCollapsed={false}
                  pathname={pathname}
                />
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <UserMenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// --- User Menu ---
const UserMenu = () => {
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-1">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 px-2 py-2 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span>Session error</span>
      </div>
    );
  }

  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col items-start text-left">
            <span className="text-sm font-medium">{user?.name || "Admin"}</span>
            <span className="text-xs text-muted-foreground">
              {user?.email || "admin@fashion.com"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/admin/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- Theme Toggle ---
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

// --- Header ---
const Header = ({ pathname }: { pathname: string }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const pageTitle = navItems.find(item => 
    pathname === item.href || pathname.startsWith(item.href + "/")
  )?.title || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <MobileSidebar pathname={pathname} />
      
      <div className="flex flex-1 items-center gap-4">
        <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
        <div className="relative ml-auto flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products, orders, customers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                3
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 py-3">
                  <span className="text-sm font-medium">New order #ORD-{1000 + i}</span>
                  <span className="text-xs text-muted-foreground">
                    {i === 1 ? "Just now" : i === 2 ? "2 hours ago" : "5 hours ago"}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-center text-sm font-medium text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu />
      </div>
    </header>
  );
};

// --- Main Sidebar ---
const Sidebar = ({ pathname, isCollapsed, setIsCollapsed }: { 
  pathname: string; 
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) => {
  return (
    <aside
      className={cn(
        "hidden h-screen bg-background border-r transition-all duration-300 lg:flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn(
        "flex items-center gap-3 border-b px-4 h-16 shrink-0",
        isCollapsed ? "justify-center" : "px-4"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold leading-tight">Fashion Admin</h1>
            <p className="text-xs text-muted-foreground">Manage your store</p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full",
            isCollapsed ? "px-2" : ""
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 rotate-90" />
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

interface AdminDashboardClientProps {
  children: React.ReactNode;
}

export default function AdminDashboardClient({ children }: AdminDashboardClientProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  // Public admin pages that don't require authentication
  const publicPaths = ["/admin/login", "/admin/register", "/admin/forgot-password"];
  const isPublicPage = publicPaths.includes(pathname);

  // Protect admin routes
  useEffect(() => {
    if (isPublicPage) return;
    if (!isPending && !session) {
      router.push("/admin/login");
    }
  }, [isPending, session, router, isPublicPage]);

  // Verify admin role
  useEffect(() => {
    if (isPublicPage) return;
    if (session?.user) {
      getUserRole(session.user.id).then((role) => {
        if (role !== "admin") {
          authClient.signOut();
          router.push("/admin/login");
        } else {
          setAdminVerified(true);
        }
      });
    }
  }, [session, router, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (isPending || (session && !adminVerified)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        pathname={pathname} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header pathname={pathname} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}