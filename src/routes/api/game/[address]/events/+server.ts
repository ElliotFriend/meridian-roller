import { rpc } from '$lib/passkeyClient';
import type { RequestHandler } from './$types';
import { scValToNative, nativeToScVal } from '@stellar/stellar-sdk';
import { produce } from 'sveltekit-sse';

function delay(milliseconds: number) {
    return new Promise(function run(resolve) {
        setTimeout(resolve, milliseconds);
    });
}

export const POST: RequestHandler = async ({ params }) => {
    return produce(
        async function start({ emit, lock }) {
            console.log('connection open');
            const contractAddress = params.address;
            const startLedger = (await rpc.getLatestLedger()).sequence - 1000;

            let foundWinner: boolean = false;
            let gameCalled: boolean = false;
            const retObj: Record<string, any> = {};

            while (!(foundWinner || gameCalled)) {
                const { events } = await rpc.getEvents({
                    startLedger: startLedger,
                    filters: [
                        {
                            type: 'contract',
                            contractIds: [contractAddress],
                            topics: [
                                [
                                    nativeToScVal('ROLLER', { type: 'symbol' }).toXDR('base64'),
                                    '*',
                                    '*'
                                ]
                            ]
                        }
                    ],
                    limit: 10000
                });

                events
                    .filter((event) => event.inSuccessfulContractCall)
                    .sort((a, b) => {
                        if (a.ledger === b.ledger) {
                            return parseInt(b.id.split('-')[0]) - parseInt(a.id.split('-')[0]);
                        }
                        return b.ledger - a.ledger;
                    })
                    .forEach((event) => {
                        const topics = event.topic.map(scValToNative);
                        const data = scValToNative(event.value);
                        switch (topics[1]) {
                            case 'rolled':
                                if (!(topics[2] in retObj) || retObj[topics[2]].rolled < data) {
                                    retObj[topics[2]] = {
                                        rolled: data,
                                        ledger: event.ledger
                                    };
                                }
                                break;
                            case 'winner':
                                retObj['winner'] = {
                                    address: topics[2],
                                    prize: data.toString(),
                                    ledger: event.ledger
                                };
                                foundWinner = true;
                                break;
                            case 'called':
                                retObj['called'] = {
                                    prize: data.toString(),
                                    ledger: event.ledger
                                };
                                gameCalled = true;
                                break;
                            default:
                                break;
                        }
                    });

                const { error } = emit('leaderboard', JSON.stringify(retObj));
                if (error) {
                    return;
                }
                await delay(3000);
            }
            lock.set(false);
        },
        {
            stop() {
                console.log('connection stopped');
            }
        }
    );
};
