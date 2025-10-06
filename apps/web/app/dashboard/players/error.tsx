"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PlayersError({ error, reset }: ErrorPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Players</h1>
        <p className="text-muted-foreground">
          Manage your club&apos;s player list
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-4">
            <p className="text-muted-foreground mb-2">
              We encountered an error while loading the players.
            </p>
            <p className="text-sm text-gray-500">
              {error.message || "An unexpected error occurred"}
            </p>
          </div>
          <div className="space-x-2">
            <Button onClick={reset} variant="default">
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              variant="outline"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
