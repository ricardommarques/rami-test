import { useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Bot, Info } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  path: string;
  matchPaths?: RegExp;
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: <LayoutDashboard />,
    label: "Dashboard",
    subtitle: "Market signals overview",
    path: "/",
    matchPaths: /^\/(|[a-z]+\/[a-z]+)$/,
  },
  {
    icon: <Bot />,
    label: "AI Assistant",
    subtitle: "Market intelligence chat",
    path: "/chat",
    matchPaths: /^\/chat$/,
  },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.path === "/") return pathname === "/" || /^\/[a-z]+\/[a-zA-Z]+$/.test(pathname);
  return item.matchPaths ? item.matchPaths.test(pathname) : pathname === item.path;
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:px-0">
          <img
            src="/logos/regular/wfp-emblem.svg"
            alt="WFP"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
            <div className="whitespace-nowrap text-xs font-semibold leading-tight text-primary">WFP</div>
            <div className="whitespace-nowrap text-xs leading-tight text-neutral-500">Market Signals</div>
          </div>
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-2 py-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item, location.pathname);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  size="lg"
                  isActive={active}
                  tooltip={item.label}
                  onClick={() => navigate(item.path)}
                  className="data-[active=true]:bg-primary-100 data-[active=true]:text-primary"
                >
                  {item.icon}
                  <div className="overflow-hidden">
                    <div className="truncate text-sm leading-tight">{item.label}</div>
                    <div className="truncate text-xs leading-tight text-neutral-400">{item.subtitle}</div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-neutral-400">About</p>
          <p className="text-xs leading-snug text-neutral-400">
            AI-enabled market intelligence to support WFP crisis response operations in the Middle
            East, with content extracted and reviewed by AI models. Please review all information.
          </p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="About this tool" className="text-neutral-400">
              <Info />
              <span className="text-xs">About this tool</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-2 pt-1 text-[10px] text-neutral-400 group-data-[collapsible=icon]:hidden">
          © 2026 WFP
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
