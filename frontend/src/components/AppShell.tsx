"use client";

import { usePathname } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import GlobalNavbar from "./GlobalNavbar";
import MobileNavbar from "./MobileNavbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useAppContext();
  const hideNav = pathname === "/login" || pathname === "/verify-mobile";

  return (
    <>
      {state.isLoggedIn && !hideNav && <GlobalNavbar />}
      {children}
      {state.isLoggedIn && !hideNav && <MobileNavbar />}
    </>
  );
}
