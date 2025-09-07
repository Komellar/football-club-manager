import { MobileNav } from "./mobile-nav";
import { UserNav } from "./user-nav";

export function ClientNavigation() {
  return (
    <div className="flex flex-1 items-center justify-end space-x-4">
      <nav className="flex items-center space-x-1">
        <MobileNav />
        <UserNav />
      </nav>
    </div>
  );
}
