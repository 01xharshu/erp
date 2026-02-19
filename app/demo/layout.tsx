import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo Mode - College ERP",
  description: "Explore the College ERP system by role",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
