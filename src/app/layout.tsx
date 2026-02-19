import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AfriCalo - Assistant Africain de Contrôle Calorique",
  description:
    "AfriCalo est votre assistant intelligent africain pour le suivi et le contrôle de vos calories quotidiennes.",
  keywords: ["calories", "nutrition", "afrique", "santé", "fitness"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
