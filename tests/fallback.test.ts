import { Container } from 'typedi';
import Fallback from '../src/fallback';
import Pinger from '../src/pinger';
import sleep from '../src/sleep';

afterEach(() => Container.reset());

describe('Fallback', () => {
  describe('DefaultApi', () => {
    describe('validateConfig', () => {
      it("must throw an error if there's an empty URL list", () => {
        const fn = () => {
          new Fallback.Falooda({
            intervalInSecs: 3,
            urls: {
              cosmos: { blockchain: [] },
            },
          });
        };
        expect(fn).toThrowError(Fallback.ConfigError);
      });

      it("must throw an error if the interval isn't positive", () => {
        const fn = () => {
          new Fallback.Falooda({
            intervalInSecs: 0,
            urls: {
              cosmos: { blockchain: ['url'] },
            },
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
            cosmos: { juno: ['url1', 'url2'], osmosis: ['url1', 'url2'] },
            near: ['url1', 'url2'],
          },
        });
        for (const blockchain of ['juno', 'osmosis', 'near']) expect(falooda.urls[blockchain]).toBe('url1');
        falooda.stop();
      });
    });

    describe('monitor', () => {
      const setUpRunningTest = () => {
        class MockPinger {
          ping({ url }: Pinger.PingInput): boolean {
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
        expect(falooda.urls.near).toBe('url2');
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
        expect(spy).toHaveBeenCalledWith({ isNear: true, url });
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
            cosmos: { juno: [url] },
          },
        });
        falooda.start();
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(spy).toHaveBeenCalledWith({ isNear: false, url });
        falooda.stop();
      });
    });
  });
});
