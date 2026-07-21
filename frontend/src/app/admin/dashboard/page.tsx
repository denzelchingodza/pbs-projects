"use client";

/**
 * Overview: real counts from the things an admin actually manages here,
 * quote requests, gallery projects, and testimonials, plus quick links into
 * each section. No fake numbers, if a fetch fails, that card shows an error
 * instead of a silently wrong 0.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminGallery, getAdminQuotes, getAdminTestimonials } from "@/lib/adminApi";
import type { AdminQuote, Project, Testimonial } from "@/types";

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
      <h1 className="text-2xl font-bold text-dark mb-1">Dashboard</h1>
      <p className="text-neutral-500 text-sm mb-8">A quick overview of activity on the site.</p>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white border border-neutral-200 border-l-4 border-l-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-dark">{quotes?.length ?? "..."}</div>
          <div className="text-sm text-neutral-500 mt-1">Total Quote Requests</div>
        </div>
        <div className="bg-white border border-neutral-200 border-l-4 border-l-orange rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-orange">{newCount ?? "..."}</div>
          <div className="text-sm text-neutral-500 mt-1">New, Not Yet Contacted</div>
        </div>
        <div className="bg-white border border-neutral-200 border-l-4 border-l-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-dark">{gallery?.length ?? "..."}</div>
          <div className="text-sm text-neutral-500 mt-1">Gallery Projects</div>
        </div>
        <div className="bg-white border border-neutral-200 border-l-4 border-l-orange rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-orange">{pendingTestimonials ?? "..."}</div>
          <div className="text-sm text-neutral-500 mt-1">Testimonials Awaiting Review</div>
        </div>
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
