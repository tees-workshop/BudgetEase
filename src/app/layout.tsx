import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BudgetEase — Make your money make sense",
    template: "%s | BudgetEase",
  },
  description:
    "A calmer way to understand your spending, plan your budget, and make confident money decisions.",
  applicationName: "BudgetEase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}