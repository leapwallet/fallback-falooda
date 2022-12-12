import { Token } from 'typedi';

export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

/** Never use {@link fetch} directly. Use it through the {@link Container} via this {@link Token}. */
const fetchToken = new Token<Fetch>('fetch');

export default fetchToken;
