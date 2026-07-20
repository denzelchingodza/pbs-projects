"use client";

import { useEffect, useState } from "react";
import QuoteTable from "@/components/admin/QuoteTable";
import { getAdminQuotes } from "@/lib/adminApi";
import type { AdminQuote } from "@/types";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<AdminQuote[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminQuotes()
      .then(setQuotes)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load quote requests."));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-1">Quote Requests</h1>
      <p className="text-neutral-500 text-sm mb-4">
        Every enquiry submitted through the site, newest first.
      </p>
      <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-4 py-2.5 mb-8 inline-block">
        Move each one through the pipeline as you work it: New &rarr; Contacted &rarr;
        Quoted &rarr; Won or Lost. The status dropdown on each card updates it instantly.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {quotes === null ? (
        <p className="text-sm text-neutral-400">Loading quote requests...</p>
      ) : (
        <QuoteTable
          quotes={quotes}
          onChange={(updated) =>
            setQuotes((prev) => prev?.map((q) => (q.id === updated.id ? updated : q)) ?? null)
          }
        />
      )}
    </div>
  );
}
