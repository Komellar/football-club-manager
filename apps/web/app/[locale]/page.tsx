import { getProfile } from "@/features/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let user;
  try {
    user = await getProfile();
  } catch {
    redirect(`/${locale}/login`);
  }
  redirect(user ? `/${locale}/dashboard` : `/${locale}/login`);
}
