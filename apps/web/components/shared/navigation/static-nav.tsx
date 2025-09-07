import Link from "next/link";

interface StaticNavProps {
  className?: string;
}

export function StaticNav({ className }: StaticNavProps) {
  return (
    <nav className={className}>
      <Link
        href="/dashboard"
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Dashboard
      </Link>
      <Link
        href="/dashboard/players"
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Players
      </Link>
      <Link
        href="/dashboard/contracts"
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Contracts
      </Link>
      <Link
        href="/dashboard/transfers"
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Transfers
      </Link>
      <Link
        href="/dashboard/reports"
        className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Reports
      </Link>
    </nav>
  );
}
