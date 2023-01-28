import { Container } from 'typedi';
import Fallback from '../src/fallback';
import Pinger from '../src/pinger';
import sleep from '../src/sleep';

afterEach(() => Container.reset());

describe('Fallback', () => {
  describe('DefaultApi', () => {
    describe('constructor', () => {
      it("must throw an error if the interval isn't positive", () => {
        const fn = () => {
          new Fallback.Falooda({
            intervalInSecs: 0,
            urls: { near: ['url'] },
          });
        };
        expect(fn).toThrowError(Fallback.ConfigError);
      });

      it("must not throw an error if the interval isn't defined", () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        new Fallback.Falooda({
          urls: { near: ['url'] },
        });
      });
    });

    describe('getFastestUrl', () => {
      const setUpFastestTest = () => {
        class MockPinger {
          ping(_: Pinger.NodeType, url: string): Pinger.ResponseInfo {
            switch (url) {
              case '1':
                return { isHealthy: true, resTimeInMs: 100 };
              case '2':
                return { isHealthy: false, resTimeInMs: 200 };
              case '3':
                return { isHealthy: true, resTimeInMs: 50 };
              case '4':
                return { isHealthy: true, resTimeInMs: 400 };
              case '5':
                return { isHealthy: false, resTimeInMs: 25 };
              default:
                throw new Error('This test case needs to be updated.');
            }
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must return the fastest URL', async () => {
        setUpFastestTest();
        const falooda = new Fallback.Falooda({
          urls: { near: ['1', '2', '3', '4', '5'] },
        });
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(falooda.getFastestNearUrl()).toBe('3');
      });

      const setUpUnhealthyTest = () => {
        class MockPinger {
          ping(): Pinger.ResponseInfo {
            return { isHealthy: false, resTimeInMs: 100 };
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must return an unhealthy URL if every URL is unhealthy', () => {
        setUpUnhealthyTest();
        const falooda = new Fallback.Falooda({
          urls: { near: ['1', '2', '3'] },
        });
        expect(falooda.getFastestNearUrl()).toBe('1');
      });

      it('must return <undefined> if the input was <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getFastestNearUrl()).toBeUndefined();
      });

      it('must return <undefined> if the input was empty', async () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        const falooda = new Fallback.Falooda({
          urls: { near: [] },
        });
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(falooda.getFastestNearUrl()).toBeUndefined();
      });
    });

    describe('getRandomUrl', () => {
      const setUpRandomTest = () => {
        class MockPinger {
          ping(_: Pinger.NodeType, url: string): Pinger.ResponseInfo {
            switch (url) {
              case '1':
                return { isHealthy: true, resTimeInMs: 100 };
              case '2':
                return { isHealthy: false, resTimeInMs: 200 };
              case '3':
                return { isHealthy: true, resTimeInMs: 50 };
              case '4':
                return { isHealthy: true, resTimeInMs: 400 };
              case '5':
                return { isHealthy: false, resTimeInMs: 25 };
              default:
                throw new Error('This test case needs to be updated.');
            }
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must return a random URL', async () => {
        setUpRandomTest();
        const falooda = new Fallback.Falooda({
          urls: { near: ['1', '2', '3', '4', '5'] },
        });
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        const fastest = falooda.getRandomNearUrl()!;
        expect(['1', '3', '4'].includes(fastest)).toBe(true);
      });

      const setUpUnhealthyTest = () => {
        class MockPinger {
          ping(): Pinger.ResponseInfo {
            return { isHealthy: false, resTimeInMs: 100 };
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must return an unhealthy URL if every URL is unhealthy', () => {
        setUpUnhealthyTest();
        const falooda = new Fallback.Falooda({
          urls: { near: ['1', '2', '3'] },
        });
        expect(falooda.getRandomNearUrl()).toBe('1');
      });

      it('must return <undefined> if the input was <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getRandomNearUrl()).toBeUndefined();
      });

      it('must return <undefined> if the input was empty', async () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        const falooda = new Fallback.Falooda({
          urls: { near: [] },
        });
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(falooda.getRandomNearUrl()).toBeUndefined();
      });
    });

    describe('getFastestCosmosRpc', () => {
      it('must return a URL', () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        const falooda = new Fallback.Falooda({
          urls: {
            cosmos: {
              agoric: { rpcNodes: ['1'] },
            },
          },
        });
        expect(falooda.getFastestCosmosRpc('agoric')).toBe('1');
      });

      it('must return <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getFastestCosmosRpc('agoric')).toBeUndefined();
      });
    });

    describe('getRandomCosmosRpc', () => {
      it('must return a URL', () => {
        const falooda = new Fallback.Falooda({
          urls: {
            cosmos: {
              agoric: { rpcNodes: ['1'] },
            },
          },
        });
        expect(falooda.getRandomCosmosRpc('agoric')).toBe('1');
      });

      it('must return <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getRandomCosmosRpc('agoric')).toBeUndefined();
      });
    });

    describe('getFastestCosmosLcd', () => {
      it('must return a URL', () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        const falooda = new Fallback.Falooda({
          urls: {
            cosmos: {
              agoric: { lcdNodes: ['1'] },
            },
          },
        });
        expect(falooda.getFastestCosmosLcd('agoric')).toBe('1');
      });

      it('must return <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getFastestCosmosLcd('agoric')).toBeUndefined();
      });
    });

    describe('getRandomCosmosLcd', () => {
      it('must return a URL', () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        const falooda = new Fallback.Falooda({
          urls: {
            cosmos: {
              agoric: { lcdNodes: ['1'] },
            },
          },
        });
        expect(falooda.getRandomCosmosLcd('agoric')).toBe('1');
      });

      it('must return <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getRandomCosmosLcd('agoric')).toBeUndefined();
      });
    });

    describe('getFastestNearUrl', () => {
      it('must return a URL', () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        const falooda = new Fallback.Falooda({
          urls: { near: ['1'] },
        });
        expect(falooda.getFastestNearUrl()).toBe('1');
      });

      it('must return <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getFastestNearUrl()).toBeUndefined();
      });
    });

    describe('getRandomNearUrl', () => {
      it('must return a URL', () => {
        Container.set(Pinger.token, new Pinger.DefaultApi());
        const falooda = new Fallback.Falooda({
          urls: {
            near: ['1'],
          },
        });
        expect(falooda.getRandomNearUrl()).toBe('1');
      });

      it('must return <undefined>', () => {
        const falooda = new Fallback.Falooda({
          urls: {},
        });
        expect(falooda.getRandomNearUrl()).toBeUndefined();
      });
    });

    describe('monitor', () => {
      const setUpRunningTest = () => {
        class MockPinger {
          ping(_: Pinger.NodeType, url: string): Pinger.ResponseInfo {
            return url === '1' ? { isHealthy: false, resTimeInMs: 100 } : { isHealthy: true, resTimeInMs: 100 };
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must overwrite the URL if the fallback system is running', async () => {
        setUpRunningTest();
        const falooda = new Fallback.Falooda({
          urls: { near: ['1', '2'] },
        });
        falooda.start();
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(falooda.getFastestNearUrl()).toBe('2');
        falooda.stop();
      });

      const setUpNotRunningTest = () => {
        class MockPinger {
          ping(): Pinger.ResponseInfo {
            return { isHealthy: false, resTimeInMs: 100 };
          }
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
        await sleep({ ms: 101 }); // Wait for the fallback system to run twice.
        falooda.stop();
        await sleep({ ms: 201 }); // Wait for the fallback system to run two more times.
        expect(spy).toHaveBeenCalledTimes(2);
        falooda.stop();
      });

      const setUpNearTest = () => {
        class MockPinger {
          ping(): Pinger.ResponseInfo {
            return { isHealthy: false, resTimeInMs: 100 };
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must ping a NEAR node', async () => {
        setUpNearTest();
        const pinger = Container.get(Pinger.token);
        const spy = jest.spyOn(pinger, 'ping');
        const url = 'url';
        const falooda = new Fallback.Falooda({
          urls: { near: [url] },
        });
        falooda.start();
        await sleep({ ms: 1 }); // Wait for the fallback system to run once.
        expect(spy).toHaveBeenCalledWith(Pinger.NodeType.Near, 'url');
        falooda.stop();
      });

      const setUpNotNearTest = () => {
        class MockPinger {
          ping(): Pinger.ResponseInfo {
            return { isHealthy: false, resTimeInMs: 100 };
          }
        }

        Container.set(Pinger.token, new MockPinger());
      };

      it('must ping a Cosmos node', async () => {
        setUpNotNearTest();
        const pinger = Container.get(Pinger.token);
        const spy = jest.spyOn(pinger, 'ping');
        const url = 'url';
        const falooda = new Fallback.Falooda({
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
