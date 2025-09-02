import Link from "next/link";
import { StaticNav } from "./static-nav";
import { ClientNavigation } from "./client-navigation";
import { Breadcrumb } from "./breadcrumb";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="inline-block font-bold">
              Football Club Manager
            </span>
          </Link>

          <StaticNav className="hidden md:flex gap-6" />
        </div>

        <ClientNavigation />
      </div>

      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb />
        </div>
      </div>
    </header>
  );
}
