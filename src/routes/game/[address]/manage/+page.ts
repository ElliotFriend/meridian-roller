import type { PageLoad } from './$types';
import { contractId } from '$lib/stores/contractId';
import { get } from 'svelte/store';
import { error } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
    const { gameAdmin } = await parent();
    if (get(contractId) !== gameAdmin) {
        error(403, { message: 'unauthorized admin' });
    }
    return {};
}) satisfies PageLoad;
