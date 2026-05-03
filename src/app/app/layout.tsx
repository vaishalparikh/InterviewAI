"use client";

import { useSession } from "next-auth/react";
import AppSidebar from "@/components/app/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  // middleware redirects unauth'd, but during initial fetch show splash
  if (status === "loading") {
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
