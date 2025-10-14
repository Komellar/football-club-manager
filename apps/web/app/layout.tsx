import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Football Club Manager",
  description: "Manage your football club with ease",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
