import { redirect } from "next/navigation";
import { getProfileAction } from "@/actions/auth-actions";

export default async function Home() {
  const user = await getProfileAction();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }
}
