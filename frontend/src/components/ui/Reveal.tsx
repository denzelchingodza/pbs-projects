"use client";

/**
 * Fades a section in and lifts it slightly into place the moment it enters
 * the viewport, instead of every section just being fully visible the
 * instant the page paints. This is the one thing tying the whole site's
 * "smooth to scroll through" feel together, used the same way on every
 * public page and every admin screen (see app/page.tsx and the various
 * admin pages), one shared mechanism instead of a different animation
 * quietly reinvented in each corner of the app.
 *
 * A plain IntersectionObserver, not a library, this only needs to answer
 * one question (has this element been scrolled into view yet) and stop
 * watching once it has, an actual animation library would be a lot more
 * machinery than a yes/no visibility check needs. Content already in the
 * viewport on page load (an admin page's main content area, for example)
 * still gets the same treatment, IntersectionObserver reports it as
 * intersecting immediately, so this doubles as a gentle "just arrived" cue
 * on page mount, not only a scroll trigger.
 *
 * Respects reduced motion: the CSS itself (see globals.css's `.reveal`
 * rules) skips the transform and fade entirely for anyone with that
 * preference on, content just appears, same as it always did.
 */
import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  /** Optional stagger, in milliseconds, for a row of Reveals entering one after another. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
