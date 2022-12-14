import { Container, Token } from 'typedi';
import fetchToken from './fetch-token';

namespace Pinger {
  export type PingInput = {
    /** `true` if the {@link url} is a NEAR node, and `false` if it's for a Cosmos blockchain node. */
    readonly isNear: boolean;
    /** Blockchain node's URL. */
    readonly url: string;
  };

  export class DefaultApi {
    /** @returns Whether the API {@link url} is working as expected. */
    async ping({ isNear, url }: PingInput): Promise<boolean> {
      let response: Response;
      const fetch = Container.get(fetchToken);
      try {
        response = await fetch(`${url}/${isNear ? 'status' : 'node_info'}`);
      } catch (err) {
        return false;
      }
      return response.status === 200;
    }
  }

  export const token = new Token<DefaultApi>('Pinger');
}

export default Pinger;
