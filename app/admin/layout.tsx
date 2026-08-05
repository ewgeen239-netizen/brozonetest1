"use client";

import * as React from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { CommandBar } from "@/components/admin/command-bar";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem("brozone-sidebar");
    if (stored) setCollapsed(stored === "1");
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("brozone-sidebar", c ? "0" : "1");
      return !c;
    });
  };

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-16" : "lg:pl-60",
        )}
      >
        <Topbar onOpenCommand={() => setCommandOpen(true)} onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
      <CommandBar open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
