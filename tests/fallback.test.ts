import { Container } from 'typedi';
import Fallback from '../src/fallback';
import Pinger from '../src/pinger';
import sleep from '../src/sleep';

afterEach(() => Container.reset());

describe('Fallback', () => {
  describe('DefaultApi', () => {
    describe('validateConfig', () => {
      it("must throw an error if the interval isn't positive", () => {
        const fn = () => {
          new Fallback.Falooda({
            intervalInSecs: 0,
            urls: { near: ['url'] },
          });
        };
        expect(fn).toThrowError(Fallback.ConfigError);
      });
    });

    describe('assignUrls', () => {
      const setUpUrlsTest = () => {
        class MockPinger {
          ping() {}
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must initialize the URLs', () => {
        setUpUrlsTest();
        const falooda = new Fallback.Falooda({
          intervalInSecs: 1,
          urls: {
            cosmos: {
              juno: { rpcNodes: ['rpc1', 'rpc2'], lcdNodes: ['lcd1', 'lcd2'] },
              osmosis: { rpcNodes: ['rpc1', 'rpc2'], lcdNodes: ['lcd1', 'lcd2'] },
            },
            near: ['url1', 'url2'],
          },
        });
        for (const blockchain of ['juno', 'osmosis']) {
          expect(falooda.getCosmosLcdNodeUrl(blockchain)).toBe('lcd1');
          expect(falooda.getCosmosRpcNodeUrl(blockchain)).toBe('rpc1');
        }
        expect(falooda.getNearNodeUrl()).toBe('url1');
        falooda.stop();
      });
    });

    describe('monitor', () => {
      const setUpRunningTest = () => {
        class MockPinger {
          ping(_: Pinger.NodeType, url: string): boolean {
            return url === 'url2';
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must overwrite the URL if the fallback system is running', async () => {
        setUpRunningTest();
        const falooda = new Fallback.Falooda({
          intervalInSecs: 0.1,
          urls: { near: ['url1', 'url2'] },
        });
        falooda.start();
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(falooda.getNearNodeUrl()).toBe('url2');
        falooda.stop();
      });

      const setUpNotRunningTest = () => {
        class MockPinger {
          ping() {}
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it("must not overwrite the URL if the fallback system isn't running", async () => {
        setUpNotRunningTest();
        const pinger = Container.get(Pinger.token);
        const spy = jest.spyOn(pinger, 'ping');
        const falooda = new Fallback.Falooda({
          intervalInSecs: 0.1,
          urls: { near: ['url'] },
        });
        falooda.start();
        await sleep({ ms: 101 }); // Wait for the fallback system to run twice.
        falooda.stop();
        await sleep({ ms: 201 }); // Wait for the fallback system to run two more times.
        expect(spy).toHaveBeenCalledTimes(2);
        falooda.stop();
      });

      const setUpNearTest = () => {
        class MockPinger {
          ping() {}
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must ping a NEAR node', async () => {
        setUpNearTest();
        const pinger = Container.get(Pinger.token);
        const spy = jest.spyOn(pinger, 'ping');
        const url = 'url';
        const falooda = new Fallback.Falooda({
          intervalInSecs: 0.1,
          urls: { near: [url] },
        });
        falooda.start();
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(spy).toHaveBeenCalledWith(Pinger.NodeType.Near, 'url');
        falooda.stop();
      });

      const setUpNotNearTest = () => {
        class MockPinger {
          ping() {}
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must ping a Cosmos node', async () => {
        setUpNotNearTest();
        const pinger = Container.get(Pinger.token);
        const spy = jest.spyOn(pinger, 'ping');
        const url = 'url';
        const falooda = new Fallback.Falooda({
          intervalInSecs: 0.1,
          urls: {
            cosmos: {
              juno: { rpcNodes: [], lcdNodes: [url] },
            },
          },
        });
        falooda.start();
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(spy).toHaveBeenCalledWith(Pinger.NodeType.CosmosLcd, 'url');
        falooda.stop();
      });
    });
  });
});
