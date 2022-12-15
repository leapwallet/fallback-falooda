import { Container } from 'typedi';
import fetchToken from './fetch-token';
import fetch from 'cross-fetch';
import Pinger from './pinger';

Container.set(fetchToken, fetch);
Container.set(Pinger.token, new Pinger.DefaultApi());

export { default as DefaultUrls } from './default-urls';
export { default as Fallback } from './fallback';
