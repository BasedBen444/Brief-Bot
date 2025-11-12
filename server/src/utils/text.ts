const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+/g;

export const clampWords = (text: string, maxWords: number): string => {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) {
    return text.trim();
  }
  return `${words.slice(0, maxWords).join(' ')}…`;
};

export const takeSentences = (text: string, maxSentences: number): string[] => {
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(SENTENCE_SPLIT_REGEX)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  return sentences.slice(0, maxSentences);
};

export const normalizeAttendee = (attendee: string): string => {
  return attendee.trim().replace(/\s+/g, ' ');
};

export const isoDateOrFallback = (value: string | undefined, fallback: string): string => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
};

export const parseListByPrefix = (content: string, prefix: string): string[] => {
  const lines = content.split(/\r?\n/);
  return lines
    .map((line) => line.trim())
    .filter((line) => line.toLowerCase().startsWith(prefix.toLowerCase()))
    .map((line) => line.substring(prefix.length).trim())
    .filter(Boolean);
};

export const extractActionItems = (content: string): Array<{ owner: string; task: string; due: string | null }> => {
  const lines = content.split(/\r?\n/);
  const dueDateRegex = /(\d{4}-\d{2}-\d{2})/;
  return lines
    .map((line) => line.trim())
    .filter((line) => /^action[:\-\s]/i.test(line))
    .map((line) => line.replace(/^action[:\-\s]*/i, ''))
    .map((line) => {
      const dueMatch = line.match(dueDateRegex);
      const due = dueMatch ? dueMatch[1] : null;
      const [ownerPart, ...taskParts] = line.split(/\s+-\s+|\s+–\s+|:\s+/);
      const owner = ownerPart || 'TBD';
      const task = taskParts.join(' ').trim() || line.trim();
      return {
        owner: owner.trim(),
        task,
        due,
      };
    });
};
