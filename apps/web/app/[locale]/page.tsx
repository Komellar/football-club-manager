import { getProfile } from "@/features/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  try {
    const user = await getProfile();

    if (user) {
      redirect(`/${locale}/dashboard`);
    } else {
      redirect(`/${locale}/login`);
    }
  } catch (error) {
    redirect(`/${locale}/login`);
  }
}
