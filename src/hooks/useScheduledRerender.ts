import { useEffect, useState } from "react";

export function useScheduledRerender(ms: number | false) {
  const [_, setToggle] = useState(false);

  useEffect(() => {
    if (ms) {
      const timeout = setTimeout(() => setToggle((prev) => !prev), ms);
      return () => clearTimeout(timeout);
    }
  }, [ms]);
}
