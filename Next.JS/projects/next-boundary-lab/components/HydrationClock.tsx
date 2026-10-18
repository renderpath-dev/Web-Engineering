"use client";

import { useEffect, useState } from "react";

const publicLabel =
  process.env.NEXT_PUBLIC_CHAPTER_ONE_LABEL ?? "Public label not configured";

export function HydrationClock() {
  const [hydratedAt, setHydratedAt] = useState<string | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setHydratedAt(new Date().toISOString());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <section>
      <h2>Browser hydration</h2>
      <p>
        Public build label: <code>{publicLabel}</code>
      </p>
      <p>
        Hydration timestamp:{" "}
        <code>{hydratedAt ?? "Waiting for browser hydration"}</code>
      </p>
    </section>
  );
}
