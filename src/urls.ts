import { chains } from 'chain-registry';

namespace Urls {
  export const near: string[] = [
    'https://rpc.mainnet.near.org',
    'https://rpc.ankr.com/near',
    'https://public-rpc.blockpi.io/http/near',
    'https://near-mainnet-rpc.allthatnode.com:3030',
  ];

  export type RpcNodesAndLcdNodes = {
    readonly rpcNodes: Nodes;
    readonly lcdNodes: Nodes;
  };

  /** A list of blockchain node URLs for a particular blockchain. */
  export type Nodes = string[];

  /** Every key is the name of a Cosmos blockchain such as `'juno'`. */
  export type CosmosBlockchains = Record<string, RpcNodesAndLcdNodes>;

  export type Blockchains = {
    readonly cosmos?: CosmosBlockchains;
    readonly near?: Nodes;
  };

  /**
   * Default URLs to use for your convenience URLs for Cosmos are dynamically fetched from the
   * [chain registry](https://github.com/cosmos/chain-registry), and URLs for NEAR are from {@link near}.
   */
  export const defaults: Blockchains = {
    cosmos: chains.reduce((data, { chain_name: name, apis }) => {
      const rpcNodes = apis?.rpc?.map(({ address }) => address) ?? [];
      const lcdNodes = apis?.rest?.map(({ address }) => address) ?? [];
      data[name] = { rpcNodes, lcdNodes };
      return data;
    }, {} as CosmosBlockchains),
    near,
  };
}

export default Urls;
