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

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Build breadcrumbs for nested paths (skip locale segment if present)
    let currentPath = "";

    // If first segment is a locale (2 letters), skip it
    let startIdx = 0;
    if (pathSegments[0] && pathSegments[0].length === 2) {
      startIdx = 1;
    }

    for (let i = startIdx; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      if (!segment) continue;
      currentPath += `/${segment}`;
      // Build full path from segments
      const fullPath = `/${pathSegments.slice(0, i + 1).join("/")}`;

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

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((item, index) => (
        <Fragment key={item.href}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {index === breadcrumbs.length - 1 ? (
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
