"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useTranslations } from "next-intl";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with dashboard
    breadcrumbs.push({ label: t("dashboard"), href: "/dashboard" });

    // Build breadcrumbs for nested paths
    let currentPath = "";
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      if (!segment) continue;

      currentPath += `/${segment}`;
      const fullPath = `/dashboard${currentPath}`;

      // Try to get translation, fallback to capitalized segment
      let label: string;
      try {
        label = t(segment);
      } catch {
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      breadcrumbs.push({
        label,
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
