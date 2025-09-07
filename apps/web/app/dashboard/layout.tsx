import { Header } from "@/components/shared/navigation/header";
import { Footer } from "@/components/shared/layout/footer";
import { AuthGuard } from "@/features/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
