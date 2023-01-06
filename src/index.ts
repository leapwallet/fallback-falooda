/**
 * @example
 * ```
 * const falooda = new Fallback.Falooda({
 *   intervalInSecs: 3,
 *   urls: {
 *     ...DefaultUrls.urls,
 *     cosmos: {
 *       ...DefaultUrls.urls.cosmos,
 *       osmosis: { rpcNodes: [], lcdNodes: ['osmosis.example.com', ...DefaultUrls.urls.cosmos.osmosis] },
 *       newChain: { rpcNodes: [], lcdNodes: ['newChain-1.example.com', 'newChain-2.example.com'] },
 *     },
 *   },
 * });
 * const osmosisLcd = falooda.getCosmosLcdNodeUrl('osmosis')!
 * ```
 *
 * @packageDocumentation
 */

import { Container } from 'typedi';
import fetchToken from './fetch-token';
import fetch from 'cross-fetch';
import Pinger from './pinger';

Container.set(fetchToken, fetch);
Container.set(Pinger.token, new Pinger.DefaultApi());

export { default as DefaultUrls } from './default-urls';
export { default as Fallback } from './fallback';
