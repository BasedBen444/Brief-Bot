import cors from 'cors';
import express, { Request, Response } from 'express';

import { SYSTEM_PROMPT } from './config/systemPrompt.js';
import { generateBrief } from './services/briefGenerator.js';
import { briefRequestSchema } from './services/validation.js';
import { BriefRequestBody, BriefResponseBody } from './types/brief.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', promptVersion: SYSTEM_PROMPT.length });
});

app.post('/api/brief', (req: Request, res: Response) => {
  const parseResult = briefRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: 'Invalid request body',
      details: parseResult.error.flatten(),
    });
    return;
  }

  const requestBody = parseResult.data as BriefRequestBody;
  const responseBody: BriefResponseBody = generateBrief(requestBody);

  res.json(responseBody);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`BriefBot server listening on port ${PORT}`);
});
