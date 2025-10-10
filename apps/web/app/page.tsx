import { getProfile } from "@/features/auth";
import { redirect } from "next/navigation";

// Force this page to be dynamic since it uses cookies for auth
export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getProfile();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
