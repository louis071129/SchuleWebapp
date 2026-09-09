"use client";

import { useRouter } from "next/navigation";
import { useConfig } from "@/lib/hooks/useConfig";
import { AmbientScreen } from "@/components/AmbientScreen";

export default function AmbientPage() {
  const router = useRouter();
  const { config, loading } = useConfig();

  if (loading) {
    return <div className="fixed inset-0 bg-black" />;
  }

  if (!config || !config.setupComplete) {
    router.replace("/setup");
    return <div className="fixed inset-0 bg-black" />;
  }

  return <AmbientScreen config={config.schedule} />;
}
