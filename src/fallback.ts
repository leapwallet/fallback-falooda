import DefaultUrls from './default-urls';
import { Container } from 'typedi';
import Pinger from './pinger';
import sleep from './sleep';
import BlockchainType = Pinger.NodeType;

namespace Fallback {
  export type Config = {
    /** Each URL list must have at least one element. */
    readonly urls: DefaultUrls.Blockchains;
    /** The fallback system kicks in at this interval. Must be at least `1`. */
    readonly intervalInSecs: number;
  };

  /**
   * The {@link Config} was invalid because of at least one of the following reasons:
   * - One of the Cosmos blockchain entries in {@link Config.urls} had a total of zero RPC and LCD URLs supplied.
   * - The NEAR URL list defined in {@link Config.urls} but it was empty.
   * - The {@link Config.intervalInSecs} wasn't greater than `0`.
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
   *       osmosis: { rpcNodes: [], lcdNodes: ['osmosis.example.com', ...DefaultUrls.urls.cosmos.osmosis] },
   *       newChain: { rpcNodes: [], lcdNodes: ['newChain-1.example.com', 'newChain-2.example.com'] },
   *     },
   *   },
   * });
   * ```
   */
  export class Falooda {
    /**
     * Every key is the name of a Cosmos blockchain, and every value is the URL of the blockchain node the user should
     * use.
     */
    private readonly cosmosRpcNodes: Record<string, string> = {};
    /**
     * Every key is the name of a Cosmos blockchain, and every value is the URL of the blockchain node the user should
     * use.
     */
    private readonly cosmosLcdNodes: Record<string, string> = {};
    /** The value is the URL of the blockchain node the user should use. */
    private nearUrl: string | undefined;
    /** Whether the fallback system must be running. */
    private isRunning = false;

    /** @throws {@link ConfigError} */
    constructor(private readonly config: Config = { urls: DefaultUrls.urls, intervalInSecs: 3 }) {
      Falooda.validateConfig(config);
      this.assignUrls(config);
    }

    /** @throws {@link ConfigError} */
    private static validateConfig(config: Config): void {
      const isCosmosValid =
        Object.values(config.urls.cosmos ?? {}).find(
          ({ rpcNodes, lcdNodes }) => rpcNodes.concat(lcdNodes).length === 0,
        ) !== undefined;
      if (!isCosmosValid || config.urls.near?.length === 0 || config.intervalInSecs <= 0) throw new ConfigError();
    }

    /**
     * @returns `undefined` if no Cosmos {@link blockchain} RPC URLs were supplied in the constructor, and the best URL
     * otherwise.
     */
    getCosmosRpcNodeUrl(blockchain: string): string | undefined {
      return this.cosmosRpcNodes[blockchain];
    }

    /**
     * @returns `undefined` if no Cosmos {@link blockchain} LCD URLs were supplied in the constructor, and the best URL
     * otherwise.
     */
    getCosmosLcdNodeUrl(blockchain: string): string | undefined {
      return this.cosmosLcdNodes[blockchain];
    }

    /** @returns `undefined` if no NEAR URLs were supplied in the constructor, and the best URL otherwise. */
    getNearNodeUrl(): string | undefined {
      return this.nearUrl;
    }

    /** Initializes {@link urls}, and calls {@link monitor} for every blockchain in the {@link config}. */
    private assignUrls(config: Config): void {
      for (const [blockchain, { rpcNodes, lcdNodes }] of Object.entries(config.urls.cosmos ?? {})) {
        if (rpcNodes.length > 0) this.cosmosRpcNodes[blockchain] = rpcNodes[0]!;
        if (lcdNodes.length > 0) this.cosmosLcdNodes[blockchain] = lcdNodes[0]!;
      }
      if (config.urls.near !== undefined) this.nearUrl = config.urls.near[0]!;
    }

    /** The fallback system will start/resume running if it wasn't already. */
    start(): void {
      if (this.isRunning) return;
      this.isRunning = true;
      for (const blockchain of Object.keys(this.config.urls.cosmos ?? {})) {
        if (this.config.urls.cosmos![blockchain]!.lcdNodes.length > 0)
          this.monitor(Pinger.NodeType.CosmosLcd, blockchain);
        if (this.config.urls.cosmos![blockchain]!.rpcNodes.length > 0)
          this.monitor(Pinger.NodeType.CosmosRpc, blockchain);
      }
      if (this.config.urls.near !== undefined) this.monitor(Pinger.NodeType.Near, 'near');
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
    private async monitor(type: Pinger.NodeType, blockchain: string): Promise<void> {
      while (true) {
        let urls: DefaultUrls.Nodes;
        switch (type) {
          case Pinger.NodeType.Near:
            urls = this.config.urls.near!;
            break;
          case Pinger.NodeType.CosmosLcd:
            urls = this.config.urls.cosmos![blockchain]!.lcdNodes;
            break;
          case Pinger.NodeType.CosmosRpc:
            urls = this.config.urls.cosmos![blockchain]!.rpcNodes;
        }
        const pinger = Container.get(Pinger.token);
        for (const url of urls) {
          if (!this.isRunning) return;
          if (await pinger.ping(type, url)) {
            switch (type) {
              case Pinger.NodeType.CosmosLcd:
                this.cosmosLcdNodes[blockchain] = url;
                break;
              case BlockchainType.CosmosRpc:
                this.cosmosRpcNodes[blockchain] = url;
                break;
              case Pinger.NodeType.Near:
                this.nearUrl = url;
            }
            break;
          }
        }
        if (this.isRunning) await sleep({ ms: this.config.intervalInSecs * 1_000 });
      }
    }
  }
}

export default Fallback;
