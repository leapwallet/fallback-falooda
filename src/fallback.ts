import Urls from './urls';
import { Container } from 'typedi';
import Pinger from './pinger';
import sleep from './sleep';

namespace Fallback {
  export type Config = {
    /** Each URL list must have at least one element. */
    readonly urls: Urls.Blockchains;
    /** The fallback system kicks in at this interval. Must be greater than `0`. `3` if `undefined` */
    readonly intervalInSecs?: number;
  };

  /** The {@link Config} was invalid because the {@link Config.intervalInSecs} wasn't greater than `0`. */
  export class ConfigError extends Error {}

  /** Every healthy node along with their API call durations. */
  export type Dataset = {
    /** Every key is the name of a Cosmos blockchain. */
    cosmosLcdNodes: Record<string, BlockchainResponse[]>;
    /** Every key is the name of a Cosmos blockchain. */
    cosmosRpcNodes: Record<string, BlockchainResponse[]>;
    nearUrls?: BlockchainResponse[];
  };

  export type BlockchainResponse = {
    /** A blockchain node's URL that's working as expected. */
    readonly url: string;
    /** The number of milliseconds it took to make an API request. */
    readonly resTimeInMs: number;
  };

  /**
   * @example
   * ```
   * new Falooda({
   *   intervalInSecs: 2,
   *   urls: {
   *     ...Urls.defaults,
   *     cosmos: {
   *       ...Urls.defaults.cosmos,
   *       osmosis: { rpcNodes: [], lcdNodes: ['osmosis.example.com', ...Urls.defaults.cosmos.osmosis] },
   *       newChain: { rpcNodes: [], lcdNodes: ['newChain-1.example.com', 'newChain-2.example.com'] },
   *     },
   *   },
   * });
   * ```
   */
  export class Falooda {
    /**
     * Only use this if you want raw data such as the duration it takes to make an API call to a particular node.
     * Otherwise, use functions such as {@link getFastestCosmosLcd}.
     */
    readonly dataset: Dataset = {
      cosmosLcdNodes: {},
      cosmosRpcNodes: {},
    };
    /** The interval to use if {@link Config.intervalInSecs} is `undefined`. */
    private static readonly defaultInterval: number = 3;
    /** Whether the fallback system must be running. */
    private isRunning = false;

    /**
     * Calls {@link start} for you.
     *
     * @throws {@link ConfigError}
     */
    constructor(private readonly config: Config = { urls: Urls.defaults, intervalInSecs: Falooda.defaultInterval }) {
      if (config.intervalInSecs !== undefined && config.intervalInSecs <= 0) throw new ConfigError();
      this.start();
    }

    /**
     * @returns The fastest {@link BlockchainResponse.url}. `undefined` if {@link responses} is either `undefined` or
     * empty.
     */
    private static getFastestUrl(responses: BlockchainResponse[] | undefined): string | undefined {
      if (responses === undefined || responses.length === 0) return undefined;
      return responses.reduce(
        (fastest, curr) => (curr.resTimeInMs < fastest.resTimeInMs ? curr : fastest),
        responses[0]!,
      ).url;
    }

    /**
     * @returns A random {@link BlockchainResponse.url}. `undefined` if {@link responses} is either `undefined` or
     * empty.
     */
    private static getRandomUrl(responses: BlockchainResponse[] | undefined): string | undefined {
      return responses?.[Math.floor(Math.random() * responses.length)]?.url;
    }

    /**
     * @returns `undefined` if no Cosmos {@link blockchain} RPC URLs were supplied in the constructor, and the fastest
     * URL otherwise.
     */
    getFastestCosmosRpc(blockchain: string): string | undefined {
      const fastest = Falooda.getFastestUrl(this.dataset.cosmosRpcNodes[blockchain]);
      return fastest ?? this.config.urls.cosmos?.[blockchain]?.rpcNodes?.[0];
    }

    /**
     * @returns `undefined` if no Cosmos {@link blockchain} RPC URLs were supplied in the constructor, and a random URL
     * otherwise.
     */
    getRandomCosmosRpc(blockchain: string): string | undefined {
      const random = Falooda.getRandomUrl(this.dataset.cosmosRpcNodes[blockchain]);
      return random ?? this.config.urls.cosmos?.[blockchain]?.rpcNodes?.[0];
    }

    /**
     * @returns `undefined` if no Cosmos {@link blockchain} LCD URLs were supplied in the constructor, and the fastest
     * URL otherwise.
     */
    getFastestCosmosLcd(blockchain: string): string | undefined {
      const fastest = Falooda.getFastestUrl(this.dataset.cosmosLcdNodes[blockchain]);
      return fastest ?? this.config.urls.cosmos?.[blockchain]?.lcdNodes?.[0];
    }

    /**
     * @returns `undefined` if no Cosmos {@link blockchain} LCD URLs were supplied in the constructor, and a random URL
     * otherwise.
     */
    getRandomCosmosLcd(blockchain: string): string | undefined {
      const random = Falooda.getRandomUrl(this.dataset.cosmosLcdNodes[blockchain]);
      return random ?? this.config.urls.cosmos?.[blockchain]?.lcdNodes?.[0];
    }

    /** @returns `undefined` if no NEAR URLs were supplied in the constructor, and the fastest URL otherwise. */
    getFastestNearUrl(): string | undefined {
      return Falooda.getFastestUrl(this.dataset.nearUrls) ?? this.config.urls.near?.[0];
    }

    /** @returns `undefined` if no NEAR URLs were supplied in the constructor, and a random URL otherwise. */
    getRandomNearUrl(): string | undefined {
      return Falooda.getRandomUrl(this.dataset.nearUrls) ?? this.config.urls.near?.[0];
    }

    /** Starts the fallback system. */
    start(): void {
      if (this.isRunning) return;
      this.isRunning = true;
      for (const blockchain of Object.keys(this.config.urls.cosmos ?? {})) {
        const { lcdNodes, rpcNodes } = this.config.urls.cosmos![blockchain]!;
        if (lcdNodes !== undefined && lcdNodes.length > 0) this.monitor(Pinger.NodeType.CosmosLcd, blockchain);
        if (rpcNodes !== undefined && rpcNodes.length > 0) this.monitor(Pinger.NodeType.CosmosRpc, blockchain);
      }
      if (this.config.urls.near !== undefined) this.monitor(Pinger.NodeType.Near, 'near');
    }

    /** Stops the fallback system. */
    stop(): void {
      this.isRunning = false;
    }

    /**
     * Pings each URL listed for each blockchain in the {@link config} until a successful response is received. The
     * first responsive URL is used to overwrite the {@link dataset}'s entry for that blockchain. This procedure will
     * repeat while {@link isRunning}.
     *
     * @param blockchain - The name of the blockchain; to be retrieved from the {@link config}. Unused if
     * {@link Pinger.NodeType} is {@link Pinger.NodeType.Near} (any value will work).
     */
    private async monitor(type: Pinger.NodeType, blockchain: string): Promise<void> {
      while (this.isRunning) {
        const configUrls = this.getConfigUrls(type, blockchain);
        const healthyUrls = Array<BlockchainResponse>();
        const pinger = Container.get(Pinger.token);
        const promises = Array<Promise<Pinger.ResponseInfo>>();
        for (const url of configUrls) promises.push(pinger.ping(type, url));
        const awaited = await Promise.allSettled(promises);
        for (let index = 0; index < awaited.length; ++index) {
          const resInfo = awaited[index]!;
          if (resInfo.status === 'rejected') continue;
          const { isHealthy, resTimeInMs } = resInfo.value;
          if (isHealthy) healthyUrls.push({ url: configUrls[index]!, resTimeInMs });
        }
        switch (type) {
          case Pinger.NodeType.Near:
            this.dataset.nearUrls = healthyUrls;
            break;
          case Pinger.NodeType.CosmosLcd:
            this.dataset.cosmosLcdNodes[blockchain] = healthyUrls;
            break;
          case Pinger.NodeType.CosmosRpc:
            this.dataset.cosmosRpcNodes[blockchain] = healthyUrls;
        }
        const interval = this.config.intervalInSecs ?? Falooda.defaultInterval;
        await sleep({ ms: interval * 1_000 });
      }
    }

    /**
     * The URLs of the specified {@link blockchain} and {@link type}.
     *
     * @param blockchain - The name of the blockchain; to be retrieved from the {@link config}. Unused if
     * {@link Pinger.NodeType} is {@link Pinger.NodeType.Near} (any value will work).
     */
    private getConfigUrls(type: Pinger.NodeType, blockchain: string): Urls.Nodes {
      switch (type) {
        case Pinger.NodeType.Near:
          return this.config.urls.near!;
        case Pinger.NodeType.CosmosLcd:
          return this.config.urls.cosmos![blockchain]!.lcdNodes!;
        case Pinger.NodeType.CosmosRpc:
          return this.config.urls.cosmos![blockchain]!.rpcNodes!;
      }
    }
  }
}

export default Fallback;
