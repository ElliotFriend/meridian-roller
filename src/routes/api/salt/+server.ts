import type { RequestHandler } from './$types';
import { randomBytes } from 'crypto';

export const GET: RequestHandler = async () => {
    return new Response(randomBytes(32).toString('hex'));
};
