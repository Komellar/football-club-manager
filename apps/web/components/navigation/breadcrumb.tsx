"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  players: "Players",
  contracts: "Contracts",
  transfers: "Transfers",
  expenses: "Expenses",
  revenues: "Revenues",
  reports: "Reports",
  profile: "Profile",
  settings: "Settings",
};

export function Breadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with dashboard
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard" });

    // Build breadcrumbs for nested paths
    let currentPath = "";
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      if (!segment) continue;

      currentPath += `/${segment}`;
      const fullPath = `/dashboard${currentPath}`;

      breadcrumbs.push({
        label:
          routeLabels[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        href: fullPath,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard root
  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbs.slice(1).map((item, index) => (
        <Fragment key={item.href}>
          <ChevronRight className="h-4 w-4" />
          {index === breadcrumbs.length - 2 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
