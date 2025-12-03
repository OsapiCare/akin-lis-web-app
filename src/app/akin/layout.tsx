"use client";
import { Suspense, useState, type ReactNode } from "react";
import Loading from "../loading";
import QueryProvider from "@/config/tanstack-query/queryClientProvider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ExpandableAppSidebar } from "@/components/layout/sidebarConfig/expandable-app-sidebar";
import { motion } from "framer-motion";
import { MessageCircleMoreIcon } from "lucide-react";
import { Chatbot } from "@/components/chatbot/ChatbotImproved";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { APP_CONFIG } from "@/components/layout/app";
import { useMemo } from "react";
import { NotificationIndicator } from "@/components/notifications/NotificationIndicator";

function generateBreadcrumbs(pathname: string) {
  if (!pathname || pathname === "/akin" || pathname === "/akin/" || pathname === "/akin/dashboard") {
    return [
      {
        label: "Painel Geral",
        href: "/akin/dashboard",
        isCurrentPage: true
      }
    ];
  }

  let bestMatch = null;
  let matchedSubItem = null;
  let bestMatchLength = 0;

  for (const menuItem of APP_CONFIG.ROUTES.MENU) {
    if (pathname.startsWith(menuItem.path) && menuItem.path.length > bestMatchLength) {
      bestMatch = menuItem;
      matchedSubItem = null;
      bestMatchLength = menuItem.path.length;
    }

    if (menuItem.subItems) {
      for (const subItem of menuItem.subItems) {
        if (pathname.startsWith(subItem.path) && subItem.path.length > bestMatchLength) {
          bestMatch = menuItem;
          matchedSubItem = subItem;
          bestMatchLength = subItem.path.length;
        }
      }
    }
  }

  const breadcrumbs = [];

  if (bestMatch) {
    if (matchedSubItem) {
      // Se está em um subitem
      // Verificar se o path atual é exatamente igual ao path do subitem
      if (pathname === matchedSubItem.path) {
        // Mostrar: MenuPrincipal > SubItem
        breadcrumbs.push({
          label: bestMatch.label,
          href: bestMatch.path,
          isCurrentPage: false
        });
        breadcrumbs.push({
          label: matchedSubItem.label,
          href: matchedSubItem.path,
          isCurrentPage: true
        });
      } else {
        // Se está numa subpágina do subitem, mostrar: MenuPrincipal > SubItem > PáginaAtual
        breadcrumbs.push({
          label: bestMatch.label,
          href: bestMatch.path,
          isCurrentPage: false
        });
        breadcrumbs.push({
          label: matchedSubItem.label,
          href: matchedSubItem.path,
          isCurrentPage: false
        });

        // Adicionar o último segmento como página atual
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        const formattedLabel = lastSegment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        breadcrumbs.push({
          label: formattedLabel,
          href: pathname,
          isCurrentPage: true
        });
      }
    } else {
      // Se está no item principal ou numa subpágina do item principal
      if (pathname === bestMatch.path) {
        // Exatamente no item principal
        breadcrumbs.push({
          label: bestMatch.label,
          href: bestMatch.path,
          isCurrentPage: true
        });
      } else {
        // Numa subpágina do item principal
        breadcrumbs.push({
          label: bestMatch.label,
          href: bestMatch.path,
          isCurrentPage: false
        });

        // Adicionar segmentos adicionais se houver
        const itemPathSegments = bestMatch.path.split('/').filter(Boolean);
        const currentPathSegments = pathname.split('/').filter(Boolean);

        // Adicionar segmentos que vêm depois do path do item
        for (let i = itemPathSegments.length; i < currentPathSegments.length; i++) {
          const isLast = i === currentPathSegments.length - 1;
          const segmentPath = '/' + currentPathSegments.slice(0, i + 1).join('/');

          const formattedLabel = currentPathSegments[i]
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          breadcrumbs.push({
            label: formattedLabel,
            href: segmentPath,
            isCurrentPage: isLast
          });
        }
      }
    }
  } else {
    // Se não encontrou no menu, gerar baseado nos segmentos da URL
    const segments = pathname.split('/').filter(Boolean);

    // Começar do segundo segmento (após 'akin')
    for (let i = 1; i < segments.length; i++) {
      const isLast = i === segments.length - 1;
      const segmentPath = '/' + segments.slice(0, i + 1).join('/');

      const formattedLabel = segments[i]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label: formattedLabel,
        href: segmentPath,
        isCurrentPage: isLast
      });
    }
  }

  return breadcrumbs;
}
interface IDashboard {
  children: ReactNode;
}

export default function Akin({ children }: IDashboard) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <QueryProvider>
      <SidebarProvider>
        <ExpandableAppSidebar />
        <SidebarContentWrapper>{children}</SidebarContentWrapper>

        {/* Floating Chatbot Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-akin-turquoise text-white rounded-full shadow-lg hover:bg-akin-turquoise/80  transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <MessageCircleMoreIcon size={24} />
        </motion.button>
        {/* Chatbot */}
        <Chatbot isChatOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </SidebarProvider>
    </QueryProvider>
  );
}

// Wrapper para o conteúdo principal
function SidebarContentWrapper({ children }: { children: ReactNode }) {
  const { state } = useSidebar();
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(pathname || "");
  }, [pathname]);

  return (
    <SidebarInset className={`flex-1 flex flex-col transition-all duration-300 gap-3`}>
      <header className="flex h-[51px] shrink-0 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="w-full">
          <BreadcrumbList className="w-full flex flex-nowrap">
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.href} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                  {breadcrumb.isCurrentPage ? (
                    <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={breadcrumb.href}
                      className="w-full text-akin-turquoise hover:text-akin-turquoise/80"
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Indicador de notificações */}
        <div className="w-full flex justify-end pr-6">
          <NotificationIndicator />
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Suspense fallback={< Loading />}>{children}</Suspense>
      </main>
    </SidebarInset>
  );
}