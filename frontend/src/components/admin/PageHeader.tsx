/**
 * Consistent top section for every /admin/* page: a title, an optional one
 * line description, and an optional right aligned slot for a primary
 * action. Previously each page hand rolled its own <h1>/<p> pair with
 * slightly different spacing and no bottom rule, so the panel felt like a
 * set of separate pages rather than one designed product. Every admin page
 * now starts the same way.
 */
export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
      <div>
        <h1 className="text-2xl font-bold text-dark mb-1">{title}</h1>
        {description && <p className="text-neutral-500 text-sm max-w-2xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
