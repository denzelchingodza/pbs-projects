"use client";

/**
 * Overview: real counts from the things an admin actually manages here,
 * quote requests, gallery projects, and testimonials, plus quick links into
 * each section. No fake numbers, if a fetch fails, that card shows an error
 * instead of a silently wrong 0.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { getAdminGallery, getAdminQuotes, getAdminTestimonials } from "@/lib/adminApi";
import type { AdminQuote, Project, Testimonial } from "@/types";

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function GalleryStatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.83 0L6 21" />
    </svg>
  );
}

function StarStatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number | null;
  label: string;
  tone: "dark" | "orange";
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
          tone === "orange" ? "bg-orange/10 text-orange" : "bg-dark/5 text-dark"
        }`}
      >
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold ${tone === "orange" ? "text-orange" : "text-dark"}`}>
          {value ?? "..."}
        </div>
        <div className="text-sm text-neutral-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [quotes, setQuotes] = useState<AdminQuote[] | null>(null);
  const [gallery, setGallery] = useState<Project[] | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getAdminQuotes(), getAdminGallery(), getAdminTestimonials()])
      .then(([q, g, t]) => {
        setQuotes(q);
        setGallery(g);
        setTestimonials(t);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dashboard data."));
  }, []);

  const newCount = quotes?.filter((q) => q.status === "new").length ?? null;
  const pendingTestimonials = testimonials?.filter((t) => t.status === "pending").length ?? null;

  return (
    <div>
      <PageHeader title="Dashboard" description="A quick overview of activity on the site." />

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={<InboxIcon />} value={quotes?.length ?? null} label="Total Quote Requests" tone="dark" />
        <StatCard icon={<BellIcon />} value={newCount} label="New, Not Yet Contacted" tone="orange" />
        <StatCard icon={<GalleryStatIcon />} value={gallery?.length ?? null} label="Gallery Projects" tone="dark" />
        <StatCard
          icon={<StarStatIcon />}
          value={pendingTestimonials}
          label="Testimonials Awaiting Review"
          tone="orange"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        <Link
          href="/admin/quotes"
          className="bg-orange text-white text-sm font-semibold px-5 py-3 rounded-md hover:brightness-95 transition"
        >
          Review Quotes
        </Link>
        <Link
          href="/admin/gallery"
          className="border border-neutral-300 text-dark text-sm font-semibold px-5 py-3 rounded-md hover:border-dark transition"
        >
          Manage Gallery
        </Link>
        <Link
          href="/admin/testimonials"
          className="border border-neutral-300 text-dark text-sm font-semibold px-5 py-3 rounded-md hover:border-dark transition"
        >
          Review Testimonials
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6 max-w-xl shadow-sm">
        <p className="text-sm font-semibold text-dark mb-3">Getting started</p>
        <ol className="text-sm text-neutral-600 space-y-2.5 list-decimal list-inside">
          <li>
            Add a project in <span className="font-medium text-dark">Gallery</span>, sorted into
            one of the 6 product categories, this is what fills in the public
            portfolio page and the homepage. If the same job has more than one
            photo, add the rest to that project instead of starting a new one.
          </li>
          <li>
            Turn on <span className="font-medium text-dark">Feature this</span> on your best
            projects so they also show up on the homepage, not just the portfolio.
          </li>
          <li>
            When a quote request comes in, open{" "}
            <span className="font-medium text-dark">Quotes</span> and move it from{" "}
            <span className="font-medium text-dark">New</span> to{" "}
            <span className="font-medium text-dark">Contacted</span>, then{" "}
            <span className="font-medium text-dark">Quoted</span>, and finally{" "}
            <span className="font-medium text-dark">Won</span> or{" "}
            <span className="font-medium text-dark">Lost</span>, so nothing gets forgotten.
          </li>
          <li>
            When a customer leaves a testimonial, open{" "}
            <span className="font-medium text-dark">Testimonials</span> and approve it to show
            it on the homepage, or delete it if it&apos;s spam.
          </li>
        </ol>
      </div>
    </div>
  );
}
