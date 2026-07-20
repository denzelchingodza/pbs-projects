/** Full-screen click-to-enlarge photo viewer. Renders nothing when src is null. */
export default function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-white text-3xl leading-none"
        aria-label="Close"
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
