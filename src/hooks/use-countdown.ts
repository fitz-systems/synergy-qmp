import { useEffect, useRef, useState } from "react";
import { examTimerTickMs } from "@/constants/student";
import { newTimeWarnings, remainingMs } from "@/lib/helpers/student";
import type { CountdownCallbacks } from "@/types/student";

export function useCountdown(deadline: number, callbacks: CountdownCallbacks) {
  const [now, setNow] = useState(() => Date.now());
  const callbacksRef = useRef(callbacks);
  const announcedRef = useRef<number[]>([]);
  const expiredRef = useRef(false);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const tick = () => {
      const current = Date.now();
      const remaining = remainingMs(deadline, current);
      setNow(current);

      const warnings = newTimeWarnings(remaining, announcedRef.current);
      if (warnings.length > 0) {
        announcedRef.current.push(...warnings);
        if (remaining > 0) callbacksRef.current.onWarning(Math.ceil(remaining / 60_000));
      }

      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(interval);
        callbacksRef.current.onExpire();
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    }

    const interval = setInterval(tick, examTimerTickMs);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    }
  }, [deadline]);

  return remainingMs(deadline, now);
}
