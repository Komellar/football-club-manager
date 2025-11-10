import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h2>{t("notFound")}</h2>
      <p>{t("couldNotFindResource")}</p>
      <Link href="/">{t("backToHome")}</Link>
    </div>
  );
}
