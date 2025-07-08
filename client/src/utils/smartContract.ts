import detectEthereumProvider from '@metamask/detect-provider';
import { toast } from 'react-toastify';
import Web3 from 'web3';
import ContractToken from '@/abis/BEP20USDT.json';

export const loadWeb3 = async () => {
  let web3;
  const provider = await detectEthereumProvider();
  if (provider) {
    web3 = new Web3(provider);
    const netId = await web3.eth.getChainId();
    console.log({ netId });
    if (parseInt(netId) !== 56) {
      if (parseInt(netId) !== 1) {
        toast.error(
          'Your Wallet network is not supported yet, please select BSC',
        );
        return false;
      }
    }
  } else {
    // no ethereum provider
    console.log('no ethereum wallet detected');
    toast.error('Please install EVM wallet.', { delay: 1000 });
    return false;
  }
  return web3;
};

export const getContract = async (abiOfContract, addressOfContract) => {
  const web3 = await loadWeb3();
  if (!web3) {
    return false;
  }
  const tokenContract = new web3.eth.Contract(abiOfContract, addressOfContract);
  return tokenContract;
};

export const getAccount = async () => {
  const web3 = await loadWeb3();
  if (!web3) {
    return false;
  }
  const accounts = await web3.eth.getAccounts();
  if (accounts.length > 0) {
    return accounts[0];
  } else {
    throw new Error('Please connect metamask wallet');
  }
};

export const getToken = async (abiOfToken, addressOfToken) => {
  const web3 = await loadWeb3();
  if (!web3) {
    return false;
  }
  const tokenContract = new web3.eth.Contract(abiOfToken, addressOfToken);
  return tokenContract;
};

export const getBalance = async (account) => {
  const web3 = await loadWeb3();
  const token = await getToken(
    ContractToken,
    import.meta.env.VITE_TOKEN_ADDRESS,
  );

  const balance = await token.methods.balanceOf(account).call();
  return web3.utils.fromWei(balance, 'ether');
};

const isValidAddress = async (address) => {
  const web3 = await loadWeb3();
  return web3.utils.isAddress(address);
};

export const transfer = async (address, amount) => {
  const account = await getAccount();
  const web3 = await loadWeb3();

  const validAddress = await isValidAddress(address);

  if (!validAddress) {
    throw new Error('Invalid receiving wallet address!');
  } else {
    const token = await getToken(
      ContractToken,
      import.meta.env.VITE_TOKEN_ADDRESS,
    );

    return token.methods
      .transfer(address, web3.utils.toWei(amount.toString(), 'ether'))
      .send({ from: account })
      .then((transactionHash) => {
        return transactionHash;
      })
      .catch((error) => {
        if (
          error.message ===
          'Returned error: MetaMask Tx Signature: User denied transaction signature.'
        ) {
          toast.error('You have refused to pay');
        } else {
          toast.error(error.message);
        }
      });
  }
};
