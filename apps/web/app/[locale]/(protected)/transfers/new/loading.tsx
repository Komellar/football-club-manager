import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewTransferLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2"></div>
      </div>

      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
                      <div className="h-10 w-full bg-gray-50 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-4 justify-end pt-4">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
