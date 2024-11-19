import type { PageLoad } from './$types';
import { rpc } from '$lib/passkeyClient';
import { contractAddress } from '$lib/stores/contractAddress';

export const load: PageLoad = async ({ params }) => {
    return {};
};
