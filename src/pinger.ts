import { Container, Token } from 'typedi';
import fetchToken from './fetch-token';

namespace Pinger {
  export enum NodeType {
    Near,
    CosmosRpc,
    CosmosLcd,
  }

  export type ResponseInfo = {
    /** The number of milliseconds the API request took to complete. */
    readonly resTimeInMs: number;
    /** Whether the API is working as expected. */
    readonly isHealthy: boolean;
  };

  export class DefaultApi {
    // TODO: Update tests.
    async ping(type: NodeType, url: string): Promise<ResponseInfo> {
      let response: Response;
      const fetch = Container.get(fetchToken);
      const startTime = new Date().getTime();
      try {
        response = await fetch(`${url}/${type === NodeType.CosmosLcd ? 'node_info' : 'status'}`);
      } catch (err) {
        return { isHealthy: false, resTimeInMs: new Date().getTime() - startTime };
      }
      return { isHealthy: response.status === 200, resTimeInMs: new Date().getTime() - startTime };
    }
  }

  export const token = new Token<DefaultApi>('Pinger');
}

export default Pinger;
