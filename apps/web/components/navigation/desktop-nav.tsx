import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";

interface StaticNavProps {
  className?: string;
}

export async function DesktopNav({ className }: StaticNavProps) {
  const t = await getTranslations("Navigation");
  const locale = await getLocale();

  return (
    <nav className={className}>
      <Link
        href={`/${locale}/dashboard`}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t("dashboard")}
      </Link>
      <Link
        href={`/${locale}/players`}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t("players")}
      </Link>
      <Link
        href={`/${locale}/contracts`}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t("contracts")}
      </Link>
      {/* <Link
        href={`/${locale}/transfers`}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t("transfers")}
      </Link> */}
      <Link
        href={`/${locale}/match-simulation`}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t("matchSimulation")}
      </Link>
      {/* <Link
        href={`/${locale}/statistics`}
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t("statistics")}
      </Link> */}
    </nav>
  );
}
