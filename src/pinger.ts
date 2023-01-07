import { Container, Token } from 'typedi';
import fetchToken from './fetch-token';

namespace Pinger {
  export enum NodeType {
    Near,
    CosmosRpc,
    CosmosLcd,
  }

  export class DefaultApi {
    /** @returns Whether the API {@link url} is working as expected. */
    async ping(type: NodeType, url: string): Promise<boolean> {
      let response: Response;
      const fetch = Container.get(fetchToken);
      try {
        response = await fetch(`${url}/${type === NodeType.CosmosLcd ? 'node_info' : 'status'}`);
      } catch (err) {
        return false;
      }
      return response.status === 200;
    }
  }

  export const token = new Token<DefaultApi>('Pinger');
}

export default Pinger;
