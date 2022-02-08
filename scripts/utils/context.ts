import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';

let __network: string;

export const context = {
  setNetwork(_network: string) {
    __network = _network;
  },

  netwrok: (): Promise<string> => {
    if (__network) return Promise.resolve(__network);

    return ethers.provider.getNetwork().then((_network) => {
      let name = process.env.NETWORK_NAME;
      console.log("name  is: ", name);
      console.log("_network  is: ", _network);

      let network;
      if (name) {
        network = name.toLowerCase().trim();
      } else {
        network = _network.name;
      }
      if (_network.chainId === 43114) {
        network = "avax";
      }
      console.log("network set is: ", network);
      return network == "unknown" ? "localhost" : network;
    });
  },

  signers: (): Promise<SignerWithAddress[]> => {
    return ethers.getSigners();
  },

  signerAddress: (): Promise<string> => {
    return ethers.provider.getSigner().getAddress();
  },
} as const;
