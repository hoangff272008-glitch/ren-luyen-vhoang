import { Home, BookOpen, Heart, CheckSquare, LogOut, Settings } from "lucide-react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Tổng quan", icon: Home, url: "/" },
  { title: "Ghi chú học tập", icon: BookOpen, url: "/study" },
  { title: "Sức khỏe", icon: Heart, url: "/health" },
  { title: "Hoạt động", icon: CheckSquare, url: "/activities" },
  { title: "Cài đặt", icon: Settings, url: "/settings" },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ứng dụng</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={() => window.location.href = "/logout"}
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
