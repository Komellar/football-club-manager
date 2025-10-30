import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-6">
              {/* Metrics Cards Skeleton */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-32 mb-1" />
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Skeleton */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-56 mb-4" />
                    <Skeleton className="h-[300px]" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-56 mb-4" />
                    <Skeleton className="h-[300px]" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
