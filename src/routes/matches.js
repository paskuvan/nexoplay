import { Router } from 'express';
import { createMatchSchema } from '../validation/matches.js';
import { getMatchStatus } from '../utils/match-status.js';
import { matches } from '../db/schema.js';
import { db } from '../db/db.js';

export const matchRouter = Router();

matchRouter.get('/', async (_req, res) => {
    res.status(200).json({ message: 'Matches List' });
});

matchRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', details: JSON.stringify(parsed.error) });
    }

    const { startTime, endTime, homeScore, awayScore } = parsed.data;

    try {
        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: endTime ? new Date(endTime) : null,
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status: getMatchStatus(startTime, endTime) ?? 'scheduled',
        }).returning();

        res.status(201).json({ data: event });
    } catch (e) {
        res.status(500).json({ error: 'Failed to create match', details: JSON.stringify(e) });
    }
});