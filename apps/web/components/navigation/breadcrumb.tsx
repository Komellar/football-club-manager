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

    // If first segment is a locale (2 letters), skip it
    let startIdx = 0;
    if (pathSegments[0] && pathSegments[0].length === 2) {
      startIdx = 1;
    }

    for (let i = startIdx; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      if (!segment) continue;

      // Skip numeric segments (like [id] dynamic routes)
      if (/^\d+$/.test(segment)) {
        continue;
      }

      // Build full path from segments
      const fullPath = `/${pathSegments.slice(0, i + 1).join("/")}`;

      let label = segment;

      // Convert kebab-case to camelCase
      if (segment.includes("-")) {
        label = segment
          .split("-")
          .map((word, idx) =>
            idx === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join("");
      }

      // If previous segment is an ID, combine with the segment before for a more descriptive label
      if (i > 1 && /^\d+$/.test(pathSegments[i - 1]!)) {
        const prev = pathSegments[i - 2] || "";
        const labelPart = label.charAt(0).toUpperCase() + label.slice(1);
        label = `${prev.replace(/s$/, "")}${labelPart}`;
      }

      breadcrumbs.push({
        label: t(label),
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
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground container mx-auto px-4 pb-3">
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
