import DefaultUrls from './default-urls';
import { Container } from 'typedi';
import Pinger from './pinger';
import sleep from './sleep';

export namespace Fallback {
  export type Config = {
    /** Each URL list must have at least one element. */
    readonly urls: DefaultUrls.Blockchains;
    /** The fallback system kicks in at this interval. Must be at least `1`. */
    readonly intervalInSecs: number;
  };

  /**
   * The {@link Config} was invalid. Either one of the URL lists in {@link Config.urls} had less than one element or
   * the {@link Config.intervalInSecs} wasn't greater than `0`.
   */
  export class ConfigError extends Error {}

  /**
   * @example
   * ```
   * new Falooda({
   *   intervalInSecs: 3,
   *   urls: {
   *     ...DefaultUrls.urls,
   *     cosmos: {
   *       ...DefaultUrls.urls.cosmos,
   *       osmosis: ['osmosis.example.com', ...DefaultUrls.urls.cosmos!.osmosis!],
   *       newChain: ['newChain-1.example.com', 'newChain-2.example.com'],
   *     },
   *   },
   * });
   * ```
   */
  export class Falooda {
    /** Every key is the name of a blockchain, and every value is the URL of the blockchain node the user should use. */
    readonly urls: Record<string, string> = {};
    /** Whether the fallback system must be running. */
    private isRunning = false;

    /** @throws {@link ConfigError} */
    constructor(private readonly config: Config = { urls: DefaultUrls.urls, intervalInSecs: 3 }) {
      Falooda.validateConfig(config);
      this.assignUrls(config);
    }

    /** @throws {@link ConfigError} */
    private static validateConfig(config: Config): void {
      const hasEmptyList =
        Object.values(config.urls.cosmos ?? [])
          .concat(config.urls.near ?? [])
          .find((urls) => urls.length === 0) !== undefined;
      if (hasEmptyList || config.intervalInSecs <= 0) throw new ConfigError();
    }

    /** Initializes {@link urls}, and calls {@link monitor} for every blockchain in the {@link config}. */
    private assignUrls(config: Config): void {
      for (const [blockchain, nodes] of Object.entries(config.urls.cosmos ?? {})) this.urls[blockchain] = nodes[0]!;
      if (config.urls.near !== undefined) this.urls.near = config.urls.near[0]!;
    }

    /** The fallback system will start/resume running if it wasn't already. */
    start(): void {
      if (this.isRunning) return;
      this.isRunning = true;
      for (const blockchain of Object.keys(this.config.urls.cosmos ?? {})) this.monitor(blockchain);
      if (this.config.urls.near !== undefined) this.monitor('near');
    }

    /** The fallback system will stop running if it hadn't already. */
    stop(): void {
      this.isRunning = false;
    }

    /**
     * Sequentially pings each URL listed for each blockchain in the {@link config} until a successful response is
     * received. The first responsive URL is used to overwrite the {@link urls}'s entry for that blockchain. This
     * procedure will repeat indefinitely once called but will only overwrite {@link urls} while {@link isRunning} is
     * `false`.
     *
     * @param blockchain - The name of the blockchain; to be retrieved from the {@link config}.
     */
    private async monitor(blockchain: string): Promise<void> {
      while (true) {
        const isNear = blockchain === 'near';
        const urls = isNear ? this.config.urls.near! : this.config.urls.cosmos![blockchain]!;
        const pinger = Container.get(Pinger.token);
        for (const url of urls) {
          if (!this.isRunning) return;
          if (await pinger.ping({ isNear, url })) {
            this.urls[blockchain] = url;
            break;
          }
        }
        if (this.isRunning) await sleep({ ms: this.config.intervalInSecs * 1_000 });
      }
    }
  }
}
