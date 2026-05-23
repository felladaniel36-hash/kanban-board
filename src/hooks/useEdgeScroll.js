/*
 * Kanban Board — Edge Scroll Hook
 * Developed by Huncho.dev
 *
 * When the user moves their cursor (or finger) within a hot zone
 * near the left or right edge of the scrollable container, this
 * hook auto-scrolls the container in that direction. Works for
 * both mouse and touch. Scroll speed increases the closer the
 * pointer is to the edge.
 */

import { useEffect, useRef, useCallback } from 'react';

const EDGE_ZONE = 60; // px from edge where scrolling activates
const MAX_SPEED = 18; // px per frame at the very edge
const MIN_SPEED = 3;  // px per frame at the outer boundary of the zone

export default function useEdgeScroll(containerRef) {
  const rafId = useRef(null);
  const scrollDirection = useRef(0); // -1 = left, 0 = none, 1 = right

  const tick = useCallback(() => {
    const el = containerRef.current;
    if (!el || scrollDirection.current === 0) {
      rafId.current = null;
      return;
    }
    el.scrollLeft += scrollDirection.current;
    rafId.current = requestAnimationFrame(tick);
  }, [containerRef]);

  const startLoop = useCallback(() => {
    if (rafId.current) return; // already running
    rafId.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    scrollDirection.current = 0;
  }, []);

  const handlePointerPosition = useCallback(
    (clientX) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const distFromLeft = clientX - rect.left;
      const distFromRight = rect.right - clientX;

      if (distFromLeft < EDGE_ZONE && el.scrollLeft > 0) {
        // Closer to edge = faster scroll
        const ratio = 1 - distFromLeft / EDGE_ZONE;
        const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * ratio;
        scrollDirection.current = -Math.round(speed);
        startLoop();
      } else if (
        distFromRight < EDGE_ZONE &&
        el.scrollLeft < el.scrollWidth - el.clientWidth
      ) {
        const ratio = 1 - distFromRight / EDGE_ZONE;
        const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * ratio;
        scrollDirection.current = Math.round(speed);
        startLoop();
      } else {
        scrollDirection.current = 0;
        // Let the current frame finish, loop will stop on its own
      }
    },
    [containerRef, startLoop]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseMove = (e) => handlePointerPosition(e.clientX);
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        handlePointerPosition(e.touches[0].clientX);
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
  }, [containerRef, handlePointerPosition, stopLoop]);

  // Clean up on unmount
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);
}
