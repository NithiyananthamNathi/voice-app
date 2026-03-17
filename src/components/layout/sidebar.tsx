"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Bot,
  FileText,
  Wrench,
  Puzzle,
  Mic2,
  MessageSquare,
  FlaskConical,
  Settings,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const configureNav = [
  { name: "Home", href: "/", icon: Home },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Knowledge Base", href: "/knowledge", icon: FileText },
  { name: "Tools", href: "/tools", icon: Wrench },
  { name: "Integrations", href: "/api-keys", icon: Puzzle },
  { name: "Voices", href: "/voices", icon: Mic2 },
];

const monitorNav = [
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Conversations", href: "/conversations", icon: MessageSquare },
  { name: "Evals", href: "/evaluations", icon: FlaskConical },
];

const deployNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
      {children}
    </p>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
        isActive
          ? "bg-white/10 text-white"
          : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span>{item.name}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-screen w-56 bg-[#0f0f1a] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center h-6 w-6 rounded bg-white/10 shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight leading-tight">
            Config Driven Dashboard
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 pt-2">
        <nav className="space-y-5">
          {/* Configure */}
          <div className="space-y-0.5">
            <SectionLabel>Configure</SectionLabel>
            {configureNav.map((item) => (
              <NavLink key={item.name} item={item} pathname={pathname} />
            ))}
          </div>

          {/* Monitor */}
          <div className="space-y-0.5">
            <SectionLabel>Monitor</SectionLabel>
            {monitorNav.map((item) => (
              <NavLink key={item.name} item={item} pathname={pathname} />
            ))}
          </div>

          {/* Deploy */}
          <div className="space-y-0.5">
            <SectionLabel>Deploy</SectionLabel>
            {deployNav.map((item) => (
              <NavLink key={item.name} item={item} pathname={pathname} />
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Upgrade button at bottom */}
      <div className="p-3">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white/10 text-white/80 text-[13px] font-medium hover:bg-white/15 transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
          Upgrade plan
        </button>
      </div>
    </aside>
  );
}
