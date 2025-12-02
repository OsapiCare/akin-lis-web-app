"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Collapsible } from "@/components/ui/collapsible"
import { TeamSwitcher } from "./team-switcher"
import { NavUser } from "./nav-user"
import { APP_CONFIG } from "@/components/layout/app"
import { getAllDataInCookies } from "@/utils/get-data-in-cookies"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { type LucideIcon } from "lucide-react"

interface SubMenuItem {
  id: string
  title: string
  icon?: LucideIcon
  path: string
  access: string[]
}

interface MenuItem {
  id: string
  title: string
  icon: LucideIcon
  path: string
  access: string[]
  items?: SubMenuItem[]
}

const transformMenuData = (menuItems: any[], userRole: string): MenuItem[] => {
  return menuItems
    .filter((item) => item.access.includes(userRole))
    .map((item) => ({
      id: item.label.toLowerCase().replace(/\s+/g, '-'),
      title: item.label,
      icon: item.icon,
      path: item.path,
      access: item.access,
      items: item.subItems ? item.subItems
        .filter((subItem: any) => subItem.access.includes(userRole))
        .map((subItem: any) => ({
          id: subItem.label.toLowerCase().replace(/\s+/g, '-'),
          title: subItem.label,
          icon: subItem.icon,
          path: subItem.path,
          access: subItem.access,
        })) : undefined,
    }))
}

const data = {
  teams: [
    {
      name: "OsapiCare",
      plan: "Akin System",
      image: "/avatars/osapicare.png",
    },
  ],
}

interface ExpandableAppSidebarProps extends React.ComponentProps<typeof Sidebar> { }

export function ExpandableAppSidebar({ ...props }: ExpandableAppSidebarProps) {
  const userRole = getAllDataInCookies().userRole
  const pathname = usePathname()
  const { state } = useSidebar()
  const {
    expandedMenu,
    selectedItem,
    selectedSubItem,
    updateSidebarState
  } = useSidebarState()

  const menuData = React.useMemo(() =>
    transformMenuData(APP_CONFIG.ROUTES.MENU, userRole),
    [userRole]
  )

  // Auto-select current menu based on pathname and expand if in submenu
  React.useEffect(() => {
    if (pathname && menuData.length > 0) {
      const currentItem = menuData.find(item =>
        pathname.startsWith(item.path) ||
        (item.items && item.items.some((subItem: SubMenuItem) => pathname.startsWith(subItem.path)))
      )

      if (currentItem) {
        // Check if current path is in a submenu
        if (currentItem.items) {
          const currentSubItem = currentItem.items.find((subItem: SubMenuItem) =>
            pathname.startsWith(subItem.path)
          )
          if (currentSubItem) {
            // If we're in a submenu, expand the parent menu and select the submenu item
            updateSidebarState({
              selectedItem: currentItem.id,
              expandedMenu: currentItem.id,
              selectedSubItem: currentSubItem.id
            })
          } else if (pathname === currentItem.path) {
            // If we're exactly at the parent menu path, don't expand
            updateSidebarState({
              selectedItem: currentItem.id,
              expandedMenu: null,
              selectedSubItem: null
            })
          }
        } else {
          // For items without subitems, ensure expanded menu is closed
          updateSidebarState({
            selectedItem: currentItem.id,
            expandedMenu: null,
            selectedSubItem: null
          })
        }
      } else {
        // Reset states if no matching item found
        updateSidebarState({
          selectedItem: "",
          expandedMenu: null,
          selectedSubItem: null
        })
      }
    }
  }, [pathname, menuData, updateSidebarState])

  // Collapse expanded menu when sidebar is collapsed
  React.useEffect(() => {
    if (state === "collapsed" && expandedMenu) {
      // Temporariamente fechar o menu expandido quando sidebar colapsa
      // Mas não limpar o estado persistido para que possa ser restaurado
    }
  }, [state, expandedMenu])

  const handleMenuClick = (menuId: string, hasSubItems: boolean, path: string) => {
    // Se a sidebar está colapsada, não expande menus
    if (state === "collapsed") {
      if (hasSubItems) {
        // Para itens com submenus, navega para a página principal do menu
        return
      }
      return
    }

    if (hasSubItems) {
      if (expandedMenu === menuId) {
        // If clicking the same menu, collapse it
        updateSidebarState({
          expandedMenu: null,
          selectedSubItem: null
        })
      } else {
        // Expand the clicked menu
        updateSidebarState({
          expandedMenu: menuId,
          selectedItem: menuId,
          selectedSubItem: null
        })
      }
    } else {
      // For items without subitems, navigate directly
      updateSidebarState({
        selectedItem: menuId,
        expandedMenu: null,
        selectedSubItem: null
      })
    }
  }

  const handleSubMenuClick = (subItemId: string, e?: React.MouseEvent) => {
    // Apenas atualizar o estado, não prevenir navegação
    updateSidebarState({
      selectedSubItem: subItemId
    })
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateSidebarState({
      expandedMenu: null,
      selectedSubItem: null
    })
    // Não fazer navegação automática - apenas fechar o menu expandido
  }

  const expandedMenuData = expandedMenu ? menuData.find((item) => item.id === expandedMenu) : null

  return (
    <Sidebar collapsible="icon" {...props} className={cn(
      "bg-akin-turquoise border-r-akin-turquoise p-0 m-0",
      state === "collapsed" ? "max-w-[60px]" : "max-w-[245px]",
    )}>
      <SidebarHeader className="bg-akin-turquoise text-white">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent className="bg-akin-turquoise text-white">
        {expandedMenu && state !== "collapsed" ? (
          // Expanded submenu view
          <div className="flex flex-col">
            <SidebarSeparator className="bg-white/20" />

            {/* Back button */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      className="w-full justify-start gap-3 py-3 bg-akin-turquoise/50 text-white hover:bg-akin-turquoise/60 rounded-md hover:text-white "
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        {expandedMenuData?.icon && <expandedMenuData.icon className="h-5 w-5 font-bold" />}
                        {expandedMenuData?.title}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator className="bg-white/20" />

            {/* Current menu header and subitems */}
            <SidebarGroup>
              <button
                onClick={handleBackClick}
                className="w-full flex items-center gap-2 py-2 px-3 text-white font-semibold cursor-pointer hover:bg-slate-600/50 mb-1 rounded-md transition-colors"
              >
                <ChevronLeft className="h-6 w-6 font-bold" />
                <span className="text-[12px]">Voltar</span>
              </button>

              <SidebarGroupContent>
                <SidebarMenu>
                  {expandedMenuData?.items?.map((subItem: SubMenuItem) => {
                    const isSubActive = pathname ? pathname.startsWith(subItem.path) : false
                    return (
                      <SidebarMenuItem key={subItem.id}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "w-full justify-start gap-3 px-8 py-3 hover:bg-white/10 hover:text-black rounded-md",
                            isSubActive && "bg-sidebar-accent/80 text-black font-medium",
                          )}
                        >
                          <Link
                            href={subItem.path}
                            className="flex items-center gap-3"
                            onClick={() => handleSubMenuClick(subItem.id)}
                          >
                            {subItem.icon && <subItem.icon className="h-5 w-5" />}
                            <span className="text-xs">{subItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ) : (
          // Main menu view
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuData.map((item) => {
                  const isActive = pathname ? pathname.startsWith(item.path) : false
                  const hasSubItems = Boolean(item.items && item.items.length > 0)
                  const isCollapsed = state === "collapsed"

                  return (
                    <SidebarMenuItem key={item.id}>
                      <Collapsible>
                        <SidebarMenuButton
                          asChild={!hasSubItems}
                          onClick={hasSubItems ? (e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleMenuClick(item.id, hasSubItems, item.path)
                          } : undefined}
                          tooltip={item.title}
                          className={cn(
                            "w-full gap-3 rounded-md",
                            isCollapsed
                              ? "justify-center px-2 py-3 hover:bg-white/10 hover:text-white"
                              : "justify-between px-4 py-3 hover:bg-white/10 hover:text-white",
                            isActive && "bg-sidebar-accent/80 text-black hover:bg-sidebar-accent hover:text-black",
                          )}
                        >
                          {hasSubItems ? (
                            <div className={cn(
                              "flex items-center",
                              isCollapsed ? "justify-center" : "w-full justify-between"
                            )}>
                              <div className={cn(
                                "flex items-center",
                                isCollapsed ? "justify-center" : "gap-3"
                              )}>
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span className="text-xs">{item.title}</span>}
                              </div>
                              {!isCollapsed && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                            </div>
                          ) : (
                            <Link href={item.path} className={cn(
                              "flex items-center",
                              isCollapsed ? "justify-center" : "w-full justify-between"
                            )}>
                              <div className={cn(
                                "flex items-center",
                                isCollapsed ? "justify-center" : "gap-3"
                              )}>
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span className="text-xs">{item.title}</span>}
                              </div>
                            </Link>
                          )}
                        </SidebarMenuButton>
                      </Collapsible>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="bg-akin-turquoise text-white">
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
