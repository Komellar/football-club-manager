import { getTranslations } from "next-intl/server";
import Link from "next/link";

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t("companyName")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("companyDescription")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("dashboard")}
                </Link>
              </li>
              <li>
                <Link
                  href="/players"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("players")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contracts"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("contracts")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t("support")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground cursor-not-allowed select-none">
                  {t("helpCenter")}
                </span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed select-none">
                  {t("contactUs")}
                </span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed select-none">
                  {t("documentation")}
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">{t("legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground cursor-not-allowed select-none">
                  {t("privacyPolicy")}
                </span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed select-none">
                  {t("termsOfService")}
                </span>
              </li>
              <li>
                <span className="text-muted-foreground cursor-not-allowed select-none">
                  {t("cookiePolicy")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              {t("copyright", { year: currentYear })}
            </p>
            <div className="flex space-x-4 text-sm">
              <Link
                href="http://localhost:4000/api/docs"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("api")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
