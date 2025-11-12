export type AudienceLabel = 'exec' | 'ic' | 'mixed';

export interface CalendarEventMetadata {
  title: string;
  datetime: string;
  attendees: string[];
  audience: AudienceLabel;
  description?: string;
}

export interface MaterialLink {
  title: string;
  url: string;
  content: string;
  lastModified?: string | null;
  isLatestVersion?: boolean;
}

export interface BriefOption {
  name: string;
  pros: string[];
  cons: string[];
}

export interface ActionChecklistItem {
  owner: string;
  task: string;
  due: string;
  sourceUrl: string | null;
}

export interface BriefSchema {
  event: CalendarEventMetadata;
  goal: string;
  context: string[];
  options: BriefOption[];
  risksTradeoffs: string[];
  decisionsToMake: string[];
  actionChecklist: ActionChecklistItem[];
  sources: Array<{
    url: string;
    title: string;
    lastModified: string | null;
    isLatestVersion: boolean;
  }>;
}

export interface BriefRequestBody {
  event: CalendarEventMetadata;
  materials?: MaterialLink[];
}

export interface BriefResponseBody {
  brief: BriefSchema;
  onePager: string;
}
