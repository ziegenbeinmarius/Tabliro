"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RevalidatePathProps {
  interval?: number; // Interval in milliseconds
}

export default function RevalidatePath({
  interval = 60000,
}: RevalidatePathProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh(); // Refresh the current path
    }, interval);

    return () => clearInterval(timer);
  }, [interval, router]);

  return null;
}
