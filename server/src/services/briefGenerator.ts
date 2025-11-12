import {
  ActionChecklistItem,
  BriefOption,
  BriefRequestBody,
  BriefResponseBody,
  BriefSchema,
  MaterialLink,
} from '../types/brief.js';
import {
  clampWords,
  extractActionItems,
  isoDateOrFallback,
  normalizeAttendee,
  parseListByPrefix,
  takeSentences,
} from '../utils/text.js';

interface DerivedNotes {
  goal: string;
  context: string[];
  options: BriefOption[];
  risks: string[];
  decisions: string[];
  actionItems: ActionChecklistItem[];
}

const MAX_CONTEXT_BULLETS_EXEC = 3;
const MAX_CONTEXT_BULLETS_DEFAULT = 6;
const GOAL_WORD_BUDGET = 32;

const sanitizeMaterials = (materials: MaterialLink[] = []): MaterialLink[] => {
  return materials.map((material) => ({
    ...material,
    lastModified: material.lastModified ?? null,
    isLatestVersion: material.isLatestVersion ?? true,
  }));
};

const deriveGoal = (description: string | undefined, materials: MaterialLink[]): string => {
  if (description) {
    const sentences = takeSentences(description, 1);
    if (sentences.length > 0) {
      return clampWords(sentences[0], GOAL_WORD_BUDGET);
    }
  }

  if (materials.length > 0) {
    const [firstMaterial] = materials;
    const sentences = takeSentences(firstMaterial.content, 1);
    if (sentences.length > 0) {
      return clampWords(sentences[0], GOAL_WORD_BUDGET);
    }
  }

  return 'Align on meeting objectives and prepare decision-ready context.';
};

const deriveContext = (
  description: string | undefined,
  materials: MaterialLink[],
  audience: BriefSchema['event']['audience'],
): string[] => {
  const context: string[] = [];

  if (description) {
    context.push(...takeSentences(description, 3));
  }

  for (const material of materials) {
    const sentences = takeSentences(material.content, 2);
    if (sentences.length > 0) {
      context.push(`${material.title}: ${sentences.join(' ')}`);
    }
  }

  const limit = audience === 'exec' ? MAX_CONTEXT_BULLETS_EXEC : MAX_CONTEXT_BULLETS_DEFAULT;

  return context.slice(0, limit);
};

const deriveOptions = (description: string | undefined, materials: MaterialLink[]): BriefOption[] => {
  const options: BriefOption[] = [];
  const lines = `${description ?? ''}\n${materials.map((m) => m.content).join('\n')}`
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const optionMatch = line.match(/^option\s*(\d+|[a-z])?[:\-]\s*(.+)$/i);
    if (optionMatch) {
      const name = optionMatch[2];
      options.push({
        name,
        pros: [],
        cons: [],
      });
      continue;
    }

    const proMatch = line.match(/^pro[:\-]\s*(.+)$/i);
    if (proMatch && options.length > 0) {
      options[options.length - 1].pros.push(proMatch[1]);
      continue;
    }

    const conMatch = line.match(/^con[:\-]\s*(.+)$/i);
    if (conMatch && options.length > 0) {
      options[options.length - 1].cons.push(conMatch[1]);
    }
  }

  return options;
};

const deriveRisks = (description: string | undefined, materials: MaterialLink[]): string[] => {
  const combined = `${description ?? ''}\n${materials.map((m) => m.content).join('\n')}`;
  const risks = parseListByPrefix(combined, 'risk:').concat(parseListByPrefix(combined, 'trade-off:'));
  if (risks.length > 0) {
    return risks;
  }
  return ['No explicit risks captured; validate assumptions with stakeholders.'];
};

const deriveDecisions = (description: string | undefined): string[] => {
  const decisions = parseListByPrefix(description ?? '', 'decision:');
  if (decisions.length > 0) {
    return decisions;
  }
  return ['Confirm go/no-go and agree on next steps.'];
};

const deriveActionItems = (
  description: string | undefined,
  materials: MaterialLink[],
): ActionChecklistItem[] => {
  const combined = `${description ?? ''}\n${materials.map((m) => m.content).join('\n')}`;
  const extracted = extractActionItems(combined);

  if (extracted.length === 0) {
    return [
      {
        owner: 'TBD',
        task: 'Assign action items during the meeting and capture owners/due dates.',
        due: isoDateOrFallback(undefined, new Date().toISOString().substring(0, 10)),
        sourceUrl: null,
      },
    ];
  }

  return extracted.map((item) => ({
    owner: item.owner || 'TBD',
    task: item.task,
    due: item.due ?? isoDateOrFallback(undefined, new Date().toISOString().substring(0, 10)),
    sourceUrl: null,
  }));
};

const deriveSources = (materials: MaterialLink[]): BriefSchema['sources'] => {
  return materials.map((material) => ({
    url: material.url,
    title: material.title,
    lastModified: material.lastModified ?? null,
    isLatestVersion: material.isLatestVersion ?? true,
  }));
};

const buildOnePager = (brief: BriefSchema): string => {
  const lines: string[] = [];
  lines.push(`# ${brief.event.title}`);
  lines.push(`**Goal**: ${brief.goal}`);
  if (brief.context.length > 0) {
    lines.push('\n**Context**');
    for (const bullet of brief.context) {
      lines.push(`- ${bullet}`);
    }
  }
  if (brief.options.length > 0) {
    lines.push('\n**Options**');
    for (const option of brief.options) {
      lines.push(`- ${option.name}`);
      for (const pro of option.pros) {
        lines.push(`  - ✅ ${pro}`);
      }
      for (const con of option.cons) {
        lines.push(`  - ⚠️ ${con}`);
      }
    }
  }
  if (brief.risksTradeoffs.length > 0) {
    lines.push('\n**Risks / Trade-offs**');
    for (const risk of brief.risksTradeoffs) {
      lines.push(`- ${risk}`);
    }
  }
  if (brief.decisionsToMake.length > 0) {
    lines.push('\n**Decision(s) to Make**');
    for (const decision of brief.decisionsToMake) {
      lines.push(`- ${decision}`);
    }
  }
  if (brief.actionChecklist.length > 0) {
    lines.push('\n**Action Checklist**');
    for (const item of brief.actionChecklist) {
      const due = item.due || 'TBD';
      lines.push(`- ${item.owner} • ${item.task} • ${due}`);
    }
  }
  if (brief.sources.length > 0) {
    lines.push('\n**Sources**');
    for (const source of brief.sources) {
      lines.push(`- ${source.title} (${source.url})`);
    }
  }

  return lines.join('\n');
};

const mapDerivedNotes = (
  request: BriefRequestBody,
  sanitizedMaterials: MaterialLink[],
): DerivedNotes => {
  const { event } = request;
  const goal = deriveGoal(event.description, sanitizedMaterials);
  const context = deriveContext(event.description, sanitizedMaterials, event.audience);
  const options = deriveOptions(event.description, sanitizedMaterials);
  const risks = deriveRisks(event.description, sanitizedMaterials);
  const decisions = deriveDecisions(event.description);
  const actionItems = deriveActionItems(event.description, sanitizedMaterials);

  return {
    goal,
    context,
    options,
    risks,
    decisions,
    actionItems,
  };
};

export const generateBrief = (request: BriefRequestBody): BriefResponseBody => {
  const sanitizedMaterials = sanitizeMaterials(request.materials ?? []);

  const derived = mapDerivedNotes(request, sanitizedMaterials);

  const brief: BriefSchema = {
    event: {
      ...request.event,
      attendees: request.event.attendees.map(normalizeAttendee),
    },
    goal: derived.goal,
    context: derived.context,
    options: derived.options,
    risksTradeoffs: derived.risks,
    decisionsToMake: derived.decisions,
    actionChecklist: derived.actionItems,
    sources: deriveSources(sanitizedMaterials),
  };

  return {
    brief,
    onePager: buildOnePager(brief),
  };
};
