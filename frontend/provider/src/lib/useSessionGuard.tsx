"use client";

import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useSessionGuard() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/signin");
    }
  }, [user, router]);

  return { user };
}
