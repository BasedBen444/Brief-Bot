import { BriefResponseBody } from '../hooks/useGenerateBrief';

interface BriefPreviewProps {
  data?: BriefResponseBody;
  isLoading?: boolean;
  error?: string | null;
}

const sectionTitleClass = 'text-sm font-semibold uppercase tracking-wide text-slate-500';
const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';

const renderList = (items: string[]) => {
  return items.length === 0 ? <p className="text-sm text-slate-500">No items captured.</p> : (
    <ul className="mt-2 space-y-2">
      {items.map((item, index) => (
        <li key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {item}
        </li>
      ))}
    </ul>
  );
};

export const BriefPreview = ({ data, isLoading, error }: BriefPreviewProps) => {
  if (isLoading) {
    return (
      <section className={cardClass}>
        <p className="text-sm text-slate-500">Generating a decision-ready one-pager…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={cardClass}>
        <p className="text-sm font-medium text-rose-500">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className={cardClass}>
        <p className="text-sm text-slate-500">
          Briefs will appear here. Provide an invite description and linked materials, then hit “Generate brief.”
        </p>
      </section>
    );
  }

  const { brief, onePager } = data;

  return (
    <section className="flex flex-col gap-6">
      <article className={cardClass}>
        <header className="flex flex-col gap-1 border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Brief schema</span>
          <h2 className="text-lg font-semibold text-slate-800">Structured JSON output</h2>
          <p className="text-sm text-slate-500">
            Deterministic schema makes it easy to sync with docs, tickets, and analytics.
          </p>
        </header>
        <pre className="mt-4 max-h-[360px] overflow-auto rounded-xl bg-slate-900/90 p-4 text-xs leading-6 text-slate-100">
          {JSON.stringify(brief, null, 2)}
        </pre>
      </article>

      <article className={cardClass}>
        <header className="mb-4 border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">One-pager</span>
          <h2 className="text-lg font-semibold text-slate-800">Decision-ready summary</h2>
          <p className="text-sm text-slate-500">Formatted for calendar invites, docs, or Slack recaps.</p>
        </header>
        <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{onePager}</pre>
      </article>

      <article className={cardClass}>
        <header className="mb-3">
          <span className={sectionTitleClass}>Quick view</span>
          <h2 className="text-lg font-semibold text-slate-800">Highlights</h2>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Goal</h3>
            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{brief.goal}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Decisions</h3>
            {renderList(brief.decisionsToMake)}
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700">Context</h3>
            {renderList(brief.context)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Risks / trade-offs</h3>
            {renderList(brief.risksTradeoffs)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Action checklist</h3>
            {brief.actionChecklist.length === 0 ? (
              <p className="text-sm text-slate-500">No action items yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {brief.actionChecklist.map((item, index) => (
                  <li key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <span className="font-semibold">{item.owner}</span> • {item.task} •{' '}
                    <span className="text-slate-500">{item.due}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </article>
    </section>
  );
};
