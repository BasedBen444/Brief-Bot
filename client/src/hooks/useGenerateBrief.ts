import { useMutation } from '@tanstack/react-query';

type AudienceLabel = 'exec' | 'ic' | 'mixed';

type BriefOption = {
  name: string;
  pros: string[];
  cons: string[];
};

type ActionChecklistItem = {
  owner: string;
  task: string;
  due: string;
  sourceUrl: string | null;
};

type BriefSchema = {
  event: {
    title: string;
    datetime: string;
    attendees: string[];
    audience: AudienceLabel;
    description?: string;
  };
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
};

type BriefResponseBody = {
  brief: BriefSchema;
  onePager: string;
};

type MaterialLink = {
  title: string;
  url: string;
  content: string;
  lastModified?: string;
  isLatestVersion?: boolean;
};

type BriefRequestBody = {
  event: BriefSchema['event'];
  materials?: MaterialLink[];
};

const postBrief = async (payload: BriefRequestBody): Promise<BriefResponseBody> => {
  const response = await fetch('/api/brief', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error ?? 'Unable to generate brief');
  }

  return response.json() as Promise<BriefResponseBody>;
};

export const useGenerateBrief = () => {
  return useMutation({
    mutationFn: postBrief,
  });
};

export type { BriefRequestBody, BriefResponseBody, MaterialLink };
