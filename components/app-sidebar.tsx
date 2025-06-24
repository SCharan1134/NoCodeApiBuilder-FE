"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  //   FileText,
  //   Gift,
  //   HelpCircle,
  Home,
  Layers,
  LogOut,
  MoreVertical,
  //   Plus,
  Settings,
  //   Share2,
  //   UserCircle2,
  //   Variable,
  //   Cloud,
  //   BarChart,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { RootState, AppDispatch } from "@/lib/redux/store";
import {
  fetchProjects,
  selectProject,
  loadSelectedProjectFromStorage,
} from "@/lib/redux/slices/projectsSlice";
import { logout } from "@/lib/redux/slices/authSlice";
import { CreateProjectDialog } from "@/components/project-dialogs/create-project-dialog";
import { useEffect } from "react";

export default function AppSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { projects, isLoading, isCreating } = useSelector(
    (state: RootState) => state.projects
  );

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isProjectActive = (projectId: string) => {
    return pathname.includes(`/projects/${projectId}`);
  };

  const handleProjectSelect = (project: (typeof projects)[0]) => {
    dispatch(selectProject(project));
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Load projects when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(loadSelectedProjectFromStorage());
      dispatch(fetchProjects());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className="border-r border-sidebar-border bg-[#1F1F1F] text-black"
    >
      <SidebarHeader className="py-4">
        <div className="flex items-center justify-center px-4">
          <div className="flex items-center gap-2 text-rose-500 font-bold">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-lg group-data-[collapsible=icon]:hidden">
              No Code API Builder
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard")}
                  tooltip="dashboard"
                >
                  <Link href="/dashboard">
                    <Home className="h-4 w-4" />
                    <span>dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/personal")}
                  tooltip="Personal"
                >
                  <Link href="/personal">
                    <UserCircle2 className="h-4 w-4" />
                    <span>Personal</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/shared")}
                  tooltip="Shared with you"
                >
                  <Link href="/shared">
                    <Share2 className="h-4 w-4" />
                    <span>Shared with you</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Layers className="h-4 w-4 animate-pulse" />
                    <span>Loading...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : projects.length > 0 ? (
                <>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project._id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isProjectActive(project._id)}
                        tooltip={project.name}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <Link href={`/projects/${project._id}`}>
                          <Layers className="h-4 w-4" />
                          <span className="truncate">{project.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <CreateProjectDialog isCreating={isCreating} />
                  </SidebarMenuItem>
                </>
              ) : (
                <SidebarMenuItem>
                  <CreateProjectDialog isCreating={isCreating} />
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 -translate-x-1/2 z-50">
          <button
            onClick={toggleSidebar}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-700 shadow-md"
          >
            {state === "collapsed" ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </button>
        </div>
        {/* <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/admin")}
                  tooltip="Admin Panel"
                >
                  <Link href="/admin">
                    <Cloud className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/templates")}
                  tooltip="Templates"
                >
                  <Link href="/templates">
                    <FileText className="h-4 w-4" />
                    <span>Templates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/variables")}
                  tooltip="Variables"
                >
                  <Link href="/variables">
                    <Variable className="h-4 w-4" />
                    <span>Variables</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/insights")}
                  tooltip="Insights"
                >
                  <Link href="/insights">
                    <BarChart className="h-4 w-4" />
                    <span>Insights</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/help")}
                  tooltip="Help"
                >
                  <Link href="/help">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Updates"
                  className="relative"
                >
                  <Link href="/updates">
                    <Gift className="h-4 w-4" />
                    <span>Updates</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter className="">
        <div className="">
          <DropdownMenu>
            <button className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm">
              <Avatar className="h-8 w-8 bg-blue-500">
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32&query=SC"
                  alt="User"
                />
                <AvatarFallback>
                  {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex-1 overflow-hidden",
                  state === "collapsed" && "hidden"
                )}
              >
                <p className="truncate font-medium">
                  {user?.full_name || "User"}
                </p>
                <p className="truncate text-[10px] text-black/60 font-medium">
                  {user?.email || "user@example.com"}
                </p>
              </div>
              <DropdownMenuTrigger asChild>
                <MoreVertical
                  className={cn(
                    "h-6 w-6  hover:opacity-70 rounded-full text-black",
                    state === "collapsed" && "hidden"
                  )}
                />
              </DropdownMenuTrigger>
            </button>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="" />
              <DropdownMenuItem className="" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
