"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { StripeProvider } from "@/components/StripeProvider";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <StripeProvider>
      <>
        {!isDashboard && <Navbar />}
        <main className="flex-1 flex flex-col">{children}</main>
        {!isDashboard && <Footer />}
      </>
    </StripeProvider>
  );
}
