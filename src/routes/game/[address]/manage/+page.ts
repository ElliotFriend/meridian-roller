import type { PageLoad } from './$types';
import { contractAddress } from '$lib/stores/contractAddress';
import { get } from 'svelte/store';
import { error } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
    const { gameAdmin } = await parent();
    // if (get(contractAddress) !== gameAdmin) {
    //     error(403, { message: 'unauthorized admin' });
    // }
    return {};
}) satisfies PageLoad;
