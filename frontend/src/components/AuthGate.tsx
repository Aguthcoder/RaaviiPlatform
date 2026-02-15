"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";

const PUBLIC_ROUTES = ["/login", "/verify-mobile"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { state } = useAppContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname || "");

    if (!state.isLoggedIn && !isPublic) {
      router.replace("/login");
      return;
    }

    if (state.isLoggedIn && pathname === "/login") {
      router.replace(state.isTestTaken ? "/dashboard" : "/test");
      return;
    }

    if (state.isLoggedIn && !state.isTestTaken && pathname !== "/test") {
      router.replace("/test");
    }
  }, [pathname, router, state.isLoggedIn, state.isTestTaken]);

  return <>{children}</>;
}
