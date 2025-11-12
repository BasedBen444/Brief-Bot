import { ChangeEvent } from 'react';
import clsx from 'clsx';

import { BriefRequestBody, MaterialLink } from '../hooks/useGenerateBrief';

export interface EventFormProps {
  value: BriefRequestBody;
  onChange: (value: BriefRequestBody) => void;
  disabled?: boolean;
}

const labelClass = 'text-sm font-medium text-slate-600 mb-1';
const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100';

const parseAttendees = (value: string): string[] =>
  value
    .split(',')
    .map((attendee) => attendee.trim())
    .filter(Boolean);

const stringifyAttendees = (attendees: string[]): string => attendees.join(', ');

interface MaterialEditorProps {
  materials: MaterialLink[] | undefined;
  onMaterialsChange: (materials: MaterialLink[]) => void;
  disabled?: boolean;
}

const MaterialEditor = ({ materials = [], onMaterialsChange, disabled }: MaterialEditorProps) => {
  const handleMaterialChange = (
    index: number,
    field: keyof MaterialLink,
    value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>['target']['value'],
  ) => {
    const updated = materials.map((material, materialIndex) =>
      materialIndex === index ? { ...material, [field]: value } : material,
    );
    onMaterialsChange(updated);
  };

  const addMaterial = () => {
    onMaterialsChange([
      ...materials,
      {
        title: '',
        url: '',
        content: '',
      },
    ]);
  };

  const removeMaterial = (index: number) => {
    onMaterialsChange(materials.filter((_, materialIndex) => materialIndex !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-700">Linked materials</h3>
        <button
          type="button"
          onClick={addMaterial}
          disabled={disabled}
          className="rounded-lg border border-blue-500 px-3 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:border-slate-200 disabled:text-slate-400"
        >
          Add material
        </button>
      </div>
      {materials.length === 0 ? (
        <p className="text-sm text-slate-500">
          Add the most relevant links, docs, or threads. BriefBot will extract the highlights for the one-pager.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {materials.map((material, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-600">Material {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  disabled={disabled}
                  className="text-xs font-semibold uppercase tracking-wide text-rose-500 disabled:text-slate-300"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col">
                  <span className={labelClass}>Title</span>
                  <input
                    type="text"
                    value={material.title}
                    onChange={(event) => handleMaterialChange(index, 'title', event.target.value)}
                    className={inputClass}
                    placeholder="Quarterly roadmap deck"
                    disabled={disabled}
                  />
                </label>
                <label className="flex flex-col">
                  <span className={labelClass}>Link</span>
                  <input
                    type="url"
                    value={material.url}
                    onChange={(event) => handleMaterialChange(index, 'url', event.target.value)}
                    className={inputClass}
                    placeholder="https://docs..."
                    disabled={disabled}
                  />
                </label>
                <label className="flex flex-col md:col-span-2">
                  <span className={labelClass}>Key passages (BriefBot will auto-scan real docs)</span>
                  <textarea
                    rows={4}
                    value={material.content}
                    onChange={(event) => handleMaterialChange(index, 'content', event.target.value)}
                    className={clsx(inputClass, 'resize-y min-h-[120px]')}
                    placeholder="Summarize the relevant parts here for now."
                    disabled={disabled}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EventForm = ({ value, onChange, disabled }: EventFormProps) => {
  const { event } = value;

  const handleFieldChange = (field: keyof typeof event, val: string) => {
    onChange({
      ...value,
      event: {
        ...event,
        [field]: val,
      },
    });
  };

  const handleAttendeesChange = (attendees: string) => {
    onChange({
      ...value,
      event: {
        ...event,
        attendees: parseAttendees(attendees),
      },
    });
  };

  return (
    <form className="flex flex-col gap-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Meeting metadata</h2>
          <p className="text-sm text-slate-500">
            BriefBot listens to calendar webhooks. Use this playground to preview the auto-generated one-pager.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col">
            <span className={labelClass}>Title</span>
            <input
              type="text"
              value={event.title}
              onChange={(event) => handleFieldChange('title', event.target.value)}
              className={inputClass}
              placeholder="Q3 GTM Alignment"
              disabled={disabled}
              required
            />
          </label>
          <label className="flex flex-col">
            <span className={labelClass}>Date & time</span>
            <input
              type="datetime-local"
              value={event.datetime}
              onChange={(event) => handleFieldChange('datetime', event.target.value)}
              className={inputClass}
              disabled={disabled}
              required
            />
          </label>
          <label className="flex flex-col">
            <span className={labelClass}>Attendees (comma-separated)</span>
            <input
              type="text"
              value={stringifyAttendees(event.attendees)}
              onChange={(event) => handleAttendeesChange(event.target.value)}
              className={inputClass}
              placeholder="Alex (VP Sales), Priya (PMM)"
              disabled={disabled}
            />
          </label>
          <label className="flex flex-col">
            <span className={labelClass}>Audience</span>
            <select
              value={event.audience}
              onChange={(event) => handleFieldChange('audience', event.target.value)}
              className={inputClass}
              disabled={disabled}
            >
              <option value="exec">Exec</option>
              <option value="ic">IC</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
        </div>
        <label className="mt-4 flex flex-col">
          <span className={labelClass}>Invite description</span>
          <textarea
            value={event.description ?? ''}
            onChange={(event) => handleFieldChange('description', event.target.value)}
            className={clsx(inputClass, 'min-h-[160px] resize-y')}
            placeholder={
              'Paste the current invite description. Include bullet points such as Option:, Risk:, Decision:, and Action: to see how BriefBot parses context.'
            }
            disabled={disabled}
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <MaterialEditor
          materials={value.materials}
          onMaterialsChange={(materials) =>
            onChange({
              ...value,
              materials,
            })
          }
          disabled={disabled}
        />
      </section>
    </form>
  );
};
