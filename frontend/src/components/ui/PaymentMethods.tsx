/**
 * A short, factual note on how a customer can actually pay, used on the
 * Contact page and next to the Quote form (see ContactPage and
 * QuoteSection), the two places someone is most likely wondering "how do
 * I even pay you" right before they commit to a job. Cash USD, bank
 * transfer, and EcoCash are the three real methods PBS Projects accepts,
 * this intentionally does not claim installments or layaway since that
 * is not something actually offered.
 */
const METHODS = ["Cash (USD)", "Bank Transfer", "EcoCash"];

export default function PaymentMethods({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
        How You Can Pay
      </p>
      <div className="flex flex-wrap gap-2">
        {METHODS.map((method) => (
          <span
            key={method}
            className="text-xs font-medium text-dark bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1.5"
          >
            {method}
          </span>
        ))}
      </div>
    </div>
  );
}
