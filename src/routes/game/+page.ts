import type { PageLoad } from './$types';
import { rpc } from '$lib/passkeyClient';

import { Address, humanizeEvents, nativeToScVal } from '@stellar/stellar-sdk';
import type { Api } from '@stellar/stellar-sdk/rpc';

// const DAY_OF_LEDGERS = 12 * 60 * 24;

export const load: PageLoad = async () => {
    const startLedger = (await rpc.getLatestLedger()).sequence - 10_000;
    const { events } = await rpc.getEvents({
        startLedger,
        filters: [
            {
                type: 'contract',
                topics: [
                    [
                        nativeToScVal('ROLLER', { type: 'symbol' }).toXDR('base64'),
                        nativeToScVal('ready', { type: 'symbol' }).toXDR('base64'),
                        '*',
                    ],
                ],
            },
        ],
    });

    events.map((e) => {
        try {
            console.log(e.topic[2].address());
        } catch (err) {
            console.log(err);
        }
    });

    return {
        events: events.map((e) => ({
            contractId: e.contractId,
            admin: Address.fromScVal(e.topic[2]).toString(),
            numFaces: e.value.u32(),
        })),
        // events: events.filter(e => e.topic[2].address().switch().value !== 1),
    };
};
