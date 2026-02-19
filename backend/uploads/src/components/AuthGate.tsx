"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

const PUBLIC_ROUTES = ["/", "/login", "/about", "/events"];
const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
  "/chat",
  "/wallet",
  "/notifications",
];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is done
    if (state.isLoading) return;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname?.startsWith(r));
    const isAuthPage = pathname === "/login";

    if (!state.isLoggedIn && isProtected) {
      router.replace("/login");
      return;
    }

    if (state.isLoggedIn && isAuthPage) {
      router.replace("/dashboard");
      return;
    }
  }, [pathname, router, state.isLoggedIn, state.isLoading]);

  return <>{children}</>;
}
