"use client";

import Script from "next/script";
import * as React from "react";
import { BOOKSY } from "@/lib/mock-data";

/**
 * Official Booksy widget loader for business 287574.
 *
 * The current widget build (widget-2021) exposes no JS API — it injects its own
 * `.booksy-widget-container` with a launcher anchor that opens the booking
 * dialog. So integration is DOM-based: detect the launcher, and forward our own
 * CTA clicks to it. If it never loads (blocked, offline), everything falls back
 * to the plain profile deep link.
 */

const LAUNCHER_SELECTOR =
  ".booksy-widget-container a, .booksy-widget-button a, .booksy-widget-button";

export function BooksyWidget() {
  return (
    <Script
      id="booksy-widget"
      src={BOOKSY.widgetScriptUrl}
      strategy="lazyOnload"
      type="text/javascript"
    />
  );
}

function findLauncher(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(LAUNCHER_SELECTOR);
}

/** opens the Booksy dialog when the widget is up, otherwise the profile link */
export function openBooksy(fallbackUrl: string) {
  const launcher = findLauncher();
  if (launcher) {
    launcher.click();
    return;
  }
  window.open(fallbackUrl, "_blank", "noopener,noreferrer");
}

/** true once the Booksy launcher exists in the DOM */
export function useBooksyWidgetReady() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (findLauncher()) {
      setReady(true);
      return;
    }
    const observer = new MutationObserver(() => {
      if (findLauncher()) {
        setReady(true);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // the loader is lazy; stop watching once it clearly is not coming
    const stop = setTimeout(() => observer.disconnect(), 20000);
    return () => {
      observer.disconnect();
      clearTimeout(stop);
    };
  }, []);

  return ready;
}
