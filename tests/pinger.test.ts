import { Container } from 'typedi';
import Pinger from '../src/pinger';
import fetchToken from '../src/fetch-token';

afterEach(() => Container.reset());

describe('Pinger', () => {
  describe('DefaultApi', () => {
    describe('ping', () => {
      const setUpErrorTest = () => {
        const mockFetch = () => {
          throw new Error();
        };

        Container.set(fetchToken, mockFetch);
        Container.set(Pinger.token, new Pinger.DefaultApi());
      };

      it('must return <false> if the network request failed', async () => {
        setUpErrorTest();
        const pinger = Container.get(Pinger.token);
        const actual = await pinger.ping(Pinger.NodeType.Near, 'url');
        expect(actual.isHealthy).toBe(false);
      });

      const setUpBadStatusTest = () => {
        const mockFetch = () => ({ status: 429 });

        Container.set(fetchToken, mockFetch);
        Container.set(Pinger.token, new Pinger.DefaultApi());
      };

      it('must return <false> if the API returned an HTTP status code other than 200', async () => {
        setUpBadStatusTest();
        const pinger = Container.get(Pinger.token);
        const actual = await pinger.ping(Pinger.NodeType.Near, 'url');
        expect(actual.isHealthy).toBe(false);
      });

      const setUpGoodStatusTest = () => {
        const mockFetch = () => ({ status: 200 });

        Container.set(fetchToken, mockFetch);
        Container.set(Pinger.token, new Pinger.DefaultApi());
      };

      it('must return <true> if the API returned an HTTP status code of 200', async () => {
        setUpGoodStatusTest();
        const pinger = Container.get(Pinger.token);
        const actual = await pinger.ping(Pinger.NodeType.Near, 'url');
        expect(actual.isHealthy).toBe(true);
      });
    });
  });
});
