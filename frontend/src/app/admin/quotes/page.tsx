"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
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
      <PageHeader title="Quote Requests" description="Every enquiry submitted through the site, newest first." />
      <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md px-4 py-2.5 mb-8 inline-block">
        Move each one through the pipeline as you work it: New &rarr; Contacted &rarr;
        Quoted &rarr; Won or Lost. The status dropdown on each card updates it instantly.
        Once a lead has been contacted, quoted, won, or lost, a Delete option
        appears so you can clear it out once the job is done or it did not go
        anywhere. Brand new leads cannot be deleted until they have been
        followed up on.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {quotes === null ? (
        <p className="text-sm text-neutral-500">Loading quote requests...</p>
      ) : (
        <QuoteTable
          quotes={quotes}
          onChange={(updated) =>
            setQuotes((prev) => prev?.map((q) => (q.id === updated.id ? updated : q)) ?? null)
          }
          onDeleted={(id) => setQuotes((prev) => prev?.filter((q) => q.id !== id) ?? null)}
        />
      )}
    </div>
  );
}
