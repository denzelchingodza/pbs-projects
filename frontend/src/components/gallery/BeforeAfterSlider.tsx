"use client";

/**
 * Draggable before/after comparison. Uses a native <input type="range"> for
 * accessibility and mobile touch support (dragging a range slider works out
 * of the box on touchscreens — a custom-drawn drag handle would need extra
 * work to feel right on phones, which is our main audience).
 */
import { useState } from "react";
import Image from "next/image";

export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
}: {
  beforeSrc: string;
  afterSrc: string;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative max-w-2xl mx-auto aspect-video rounded-xl overflow-hidden select-none shadow-lg">
      <Image src={beforeSrc} alt="Before" fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
      <Image
        src={afterSrc}
        alt="After"
        fill
        sizes="(max-width: 768px) 100vw, 672px"
        className="object-cover"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      />
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
        style={{ left: `${position}%` }}
      />
      <span className="absolute top-3 left-3 bg-dark/80 text-white text-xs font-semibold uppercase px-3 py-1 rounded-full">
        Before
      </span>
      <span className="absolute top-3 right-3 bg-dark/80 text-white text-xs font-semibold uppercase px-3 py-1 rounded-full">
        After
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="absolute inset-x-0 bottom-3 w-[90%] mx-[5%]"
        aria-label="Drag to compare before and after"
      />
    </div>
  );
}
