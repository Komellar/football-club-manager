import Link from "next/link";
import { DesktopNav } from "./desktop-nav";
import { Breadcrumb } from "./breadcrumb";
import { MobileNav } from "./mobile-nav";
import { UserNav } from "./user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto flex h-20 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <span className="inline-block font-bold">
              Football Club Manager
            </span>
          </Link>

          <DesktopNav className="hidden md:flex gap-6" />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <MobileNav />
            <UserNav />
          </nav>
        </div>
      </div>

      <Breadcrumb />
    </header>
  );
}
