import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { PreferencesProvider } from "@/lib/preferences";
import "@/lib/i18n";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("common:errors.pageNotFound")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("common:errors.pageMissing")}</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            {t("common:actions.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VoteRoute — Your Personal Voting Journey Assistant" },
      { name: "description", content: "VoteRoute is the GPS for your vote. From registration to election day — personalised, step by step, in plain language." },
      { name: "author", content: "VoteRoute" },
      { name: "theme-color", content: "#1d4ed8" },
      { property: "og:title", content: "VoteRoute — Your Personal Voting Journey Assistant" },
      { property: "og:description", content: "VoteRoute is the GPS for your vote. From registration to election day — personalised, step by step, in plain language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VoteRoute — Your Personal Voting Journey Assistant" },
      { name: "twitter:description", content: "VoteRoute is the GPS for your vote. From registration to election day — personalised, step by step, in plain language." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0fe667a5-dbb7-4c9f-9bea-87d9ae001b1f/id-preview-ec3376b3--d8f4c411-d929-4565-af05-190c8a6fdad7.lovable.app-1776954861052.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0fe667a5-dbb7-4c9f-9bea-87d9ae001b1f/id-preview-ec3376b3--d8f4c411-d929-4565-af05-190c8a6fdad7.lovable.app-1776954861052.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" }
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  return (
    <PreferencesProvider>
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </PreferencesProvider>
  );
}
