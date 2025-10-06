import { getProfile } from "@/features/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getProfile();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
