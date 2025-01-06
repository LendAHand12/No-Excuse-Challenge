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
    if (parseInt(netId) !== 56) {
      toast.error(
        'Your Wallet network is not supported yet, please select BSC',
      );
      return false;
    }
  } else {
    // no ethereum provider
    console.log('no ethereum wallet detected');
    toast.error('Please install or enable MetaMask.', { delay: 1000 });
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
  if (accounts.length) {
    return accounts[0];
  }
  return;
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
  try {
    // Load Web3
    const provider = await detectEthereumProvider();
    if (!provider) {
      throw new Error(
        'Ethereum provider not detected. Please install MetaMask.',
      );
    }

    const web3 = new Web3(provider);

    // Check network
    const chainId = await web3.eth.getChainId();
    if (chainId !== 56) {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(56) }],
      });
      toast.success('Switched to Binance Smart Chain.');
    }

    // Validate address
    if (!web3.utils.isAddress(address)) {
      throw new Error('Invalid receiving wallet address.');
    }

    // Get sender account
    const accounts = await web3.eth.getAccounts();
    if (!accounts.length) {
      throw new Error('No accounts detected. Please connect your wallet.');
    }
    const senderAccount = accounts[0];

    // Load token contract
    const token = new web3.eth.Contract(
      ContractToken,
      import.meta.env.VITE_TOKEN_ADDRESS,
    );

    // Estimate gas
    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    // const gasLimit = await token.methods
    //   .transfer(address, amountInWei)
    //   .estimateGas({ from: senderAccount });
    // const gasPrice = await web3.eth.getGasPrice();
    console.log({ amountInWei });

    // Perform the transaction
    const transactionHash = await token.methods
      .transfer(address, amountInWei)
      .send({
        from: senderAccount,
        // gas: gasLimit,
        // gasPrice,
      });

    toast.success('Transfer successful!');
    console.log('Transaction Hash:', transactionHash);

    return transactionHash;
  } catch (error) {
    // Handle known errors
    if (
      error.message.includes('MetaMask Tx Signature: User denied transaction')
    ) {
      toast.error('Transaction was cancelled.');
    } else {
      toast.error(error.message || 'An error occurred during the transfer.');
    }

    console.error('Error details:', error);
    throw error;
  }
};
