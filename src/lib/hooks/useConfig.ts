"use client";

import { useEffect, useState } from "react";
import { getConfig } from "@/lib/db/config-repo";
import type { AppConfigRecord } from "@/lib/db/schema";

interface ConfigState {
  config: AppConfigRecord | null;
  loading: boolean;
}

export function useConfig(): ConfigState {
  const [state, setState] = useState<ConfigState>({ config: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    getConfig()
      .then((record) => {
        if (!cancelled) setState({ config: record ?? null, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ config: null, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
