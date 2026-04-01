import { useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChangesGuard(shouldBlock) {
  const confirmedRef = useRef(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (!shouldBlock || confirmedRef.current) return false;
      return currentLocation.pathname !== nextLocation.pathname;
    },
    [shouldBlock]
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const timer = setTimeout(() => {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        );

        if (confirmed) {
          confirmedRef.current = true;
          if (blocker.state === "blocked") {
            blocker.proceed();
          }
        } else {
          if (blocker.state === "blocked") {
            blocker.reset();
          }
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [blocker]);

  const markAsSaved = () => {
    confirmedRef.current = true;
  };

  return { markAsSaved };
}