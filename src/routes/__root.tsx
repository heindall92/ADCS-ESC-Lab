import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { ThemeLangToggle } from "@/components/theme-lang-toggle";
import { cn } from "@/lib/utils";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ADCS ESC Lab — Aprende a identificar los 16 ESC" },
      {
        name: "description",
        content:
          "Lab multimedia inmersivo para identificar los 16 casos ESC de ADCS con Certipy v5 en entornos controlados.",
      },
      { name: "author", content: "ADCS ESC Lab" },
      { property: "og:title", content: "ADCS ESC Lab — Aprende a identificar los 16 ESC" },
      {
        property: "og:description",
        content:
          "Lab multimedia inmersivo para identificar los 16 casos ESC de ADCS con Certipy v5 en entornos controlados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ADCS ESC Lab — Aprende a identificar los 16 ESC" },
      {
        name: "twitter:description",
        content:
          "Lab multimedia inmersivo para identificar los 16 casos ESC de ADCS con Certipy v5 en entornos controlados.",
      },
      { property: "og:image", content: "/og.png" },
      { name: "twitter:image", content: "/og.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <SidebarProvider>
            <AppShell />
          </SidebarProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppShell() {
  const { t } = useI18n();
  return (
    <>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {t("a11y.skip")}
      </a>
      <div className="flex min-h-dvh w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="glass-header flex min-h-[4rem] items-center gap-3 border-b px-4 py-3 md:px-6">
            <SidebarTrigger className="glass-control h-10 w-10 rounded-full" />
            <span className="text-sm font-medium text-muted-foreground md:text-base">{t("app.tagline")}</span>
            <div className="ml-auto">
              <ThemeLangToggle size="md" />
            </div>
          </header>
          <main
            id="contenido-principal"
            tabIndex={-1}
            className={cn("app-glass-shell relative flex-1 overflow-auto px-4 py-2 focus:outline-none md:px-8 md:py-4")}
          >
            <div className="app-glass-bg" aria-hidden>
              <div className="app-glass-mesh" />
            </div>
            <div className="relative z-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
