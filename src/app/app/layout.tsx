"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppSidebar from "@/components/app/AppSidebar";
import { useStore } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useStore((s) => s.user);

  useEffect(() => {
    // run on client; user may briefly be null during SSR snapshot, then re-checked after hydration
    const t = setTimeout(() => {
      if (!user) router.replace("/signin");
    }, 0);
    return () => clearTimeout(t);
  }, [user, router]);

  if (!user) {
    return (
      <div className="grid h-screen place-items-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="text-3xl">🦜</span>
          <p className="text-[13px] text-neutral-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
