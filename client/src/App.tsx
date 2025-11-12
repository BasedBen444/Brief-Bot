import { useMemo, useState } from 'react';

import { BriefPreview } from './components/BriefPreview';
import { EventForm } from './components/EventForm';
import { BriefRequestBody, useGenerateBrief } from './hooks/useGenerateBrief';

const initialState: BriefRequestBody = {
  event: {
    title: 'Decision sync',
    datetime: new Date().toISOString().slice(0, 16),
    attendees: ['TBD (Exec sponsor)', 'TBD (PM)'],
    audience: 'exec',
    description: `Goal: Finalize launch plan for Q3 initiative.
Context: Pipeline trending 12% below target; sales enablement assets blocked.
Option 1: Delay GA by 2 weeks.
Pro: Allows completion of partner onboarding.
Con: Risk of losing competitive momentum.
Option 2: Launch on schedule with reduced feature scope.
Risk: Customer confusion if beta blockers remain.
Decision: Pick launch option and align on readiness signals.
Action: Priya - draft revised enablement brief - 2024-05-01.
Action: Alex - confirm legal review coverage - 2024-05-02.`,
  },
  materials: [
    {
      title: 'GTM launch doc',
      url: 'https://example.com/gtm-launch',
      content:
        'Summary: Exec-ready narrative covering launch requirements and partner blockers. Risks include churn for enterprise pilot if rollout slips.',
    },
  ],
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:gap-8">
      {children}
    </div>
  );
};

const SidebarCard = ({ children, title }: { children: React.ReactNode; title: string }) => {
  return (
    <aside className="sticky top-6 flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-xl lg:max-w-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </aside>
  );
};

function App() {
  const [formState, setFormState] = useState<BriefRequestBody>(initialState);
  const { mutateAsync, data, isPending, error } = useGenerateBrief();
  const audienceLabel = useMemo(() => formState.event.audience.toUpperCase(), [formState.event.audience]);

  const handleSubmit = async () => {
    await mutateAsync(formState);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6">
        <header className="rounded-3xl border border-blue-100 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3">
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
              Audience: {audienceLabel}
            </span>
            <h1 className="text-3xl font-semibold text-slate-900">BriefBot</h1>
            <p className="max-w-3xl text-base text-slate-600">
              A calendar-aware co-pilot that listens to new or updated events, retrieves linked materials, runs Retrieval-Augmented
              Generation, and posts a crisp one-pager back to the invite.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">RAG powered</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">LLM structured output</span>
              <span className="rounded-full bg-slate-100 px-3 py-1">Calendar + Docs APIs</span>
            </div>
          </div>
        </header>

        <EventForm value={formState} onChange={setFormState} disabled={isPending} />
      </div>

      <div className="flex w-full flex-col gap-6 lg:max-w-md">
        <SidebarCard title="Generate">
          <p className="text-sm text-slate-300">
            In production, BriefBot triggers when calendar events fire. Use this sandbox to simulate the workflow and see the
            structured output.
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-900/50"
          >
            {isPending ? 'Generating…' : 'Generate brief'}
          </button>
          {error ? <p className="text-sm font-medium text-rose-400">{error.message}</p> : null}
        </SidebarCard>

        <BriefPreview data={data} isLoading={isPending} error={error?.message ?? null} />
      </div>
    </Layout>
  );
}

export default App;
