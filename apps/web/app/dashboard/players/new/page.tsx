import { PlayerForm } from "@/features/players/components";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPlayerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/players">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Player</h1>
          <p className="text-muted-foreground">
            Create a new player profile for your squad
          </p>
        </div>
      </div>

      <PlayerForm />
    </div>
  );
}
