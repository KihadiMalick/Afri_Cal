import LixumShell from "@/components/lixum/LixumShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LixumShell>{children}</LixumShell>;
}
