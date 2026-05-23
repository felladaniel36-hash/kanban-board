/*
 * Kanban Board — Edge Scroll Hook (4-directional)
 * Developed by Huncho.dev
 *
 * Auto-scrolls a container when the cursor / finger moves
 * near any edge: left, right, top, or bottom.
 * Speed scales with proximity — closer = faster.
 * Works for mouse and touch.
 */

import { useEffect, useRef, useCallback } from 'react';

const EDGE_ZONE = 60; // px from any edge where scrolling activates
const MAX_SPEED = 18; // px per frame at the very edge
const MIN_SPEED = 3;  // px per frame at the zone boundary

function calcSpeed(distFromEdge) {
  const ratio = 1 - Math.max(0, Math.min(distFromEdge, EDGE_ZONE)) / EDGE_ZONE;
  return Math.round(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * ratio);
}

export default function useEdgeScroll(containerRef) {
  const rafId = useRef(null);
  const scrollX = useRef(0);
  const scrollY = useRef(0);

  const tick = useCallback(() => {
    const el = containerRef.current;
    if (!el || (scrollX.current === 0 && scrollY.current === 0)) {
      rafId.current = null;
      return;
    }
    if (scrollX.current !== 0) el.scrollLeft += scrollX.current;
    if (scrollY.current !== 0) el.scrollTop += scrollY.current;
    rafId.current = requestAnimationFrame(tick);
  }, [containerRef]);

  const startLoop = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    scrollX.current = 0;
    scrollY.current = 0;
  }, []);

  const handlePointer = useCallback(
    (clientX, clientY) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const distLeft = clientX - rect.left;
      const distRight = rect.right - clientX;
      const distTop = clientY - rect.top;
      const distBottom = rect.bottom - clientY;

      let needsLoop = false;

      // Horizontal
      if (distLeft < EDGE_ZONE && el.scrollLeft > 0) {
        scrollX.current = -calcSpeed(distLeft);
        needsLoop = true;
      } else if (
        distRight < EDGE_ZONE &&
        el.scrollLeft < el.scrollWidth - el.clientWidth
      ) {
        scrollX.current = calcSpeed(distRight);
        needsLoop = true;
      } else {
        scrollX.current = 0;
      }

      // Vertical
      if (distTop < EDGE_ZONE && el.scrollTop > 0) {
        scrollY.current = -calcSpeed(distTop);
        needsLoop = true;
      } else if (
        distBottom < EDGE_ZONE &&
        el.scrollTop < el.scrollHeight - el.clientHeight
      ) {
        scrollY.current = calcSpeed(distBottom);
        needsLoop = true;
      } else {
        scrollY.current = 0;
      }

      if (needsLoop) {
        startLoop();
      }
    },
    [containerRef, startLoop]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseMove = (e) => handlePointer(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onLeave = () => stopLoop();

    el.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchend', onLeave);
    el.addEventListener('touchcancel', onLeave);

    return () => {
      stopLoop();
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('touchend', onLeave);
      el.removeEventListener('touchcancel', onLeave);
    };
  }, [containerRef, handlePointer, stopLoop]);

  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);
}
