import detectEthereumProvider from '@metamask/detect-provider';
import { toast } from 'react-toastify';
import Web3 from 'web3';
import ContractToken from '@/abis/BEP20USDT.json';

export const loadWeb3 = async () => {
  const provider = await detectEthereumProvider();
  if (!provider) {
    toast.error('Please install or enable MetaMask.');
    return null;
  }

  const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();

  if (chainId !== 56) {
    toast.error('Your Wallet network is not supported. Please select BSC.');
    return null;
  }

  return web3;
};

export const getContract = async (abiOfContract, addressOfContract) => {
  const web3 = await loadWeb3();
  if (!web3) return null;

  return new web3.eth.Contract(abiOfContract, addressOfContract);
};

export const getAccount = async () => {
  const web3 = await loadWeb3();
  if (!web3) return null;

  const accounts = await web3.eth.getAccounts();
  return accounts.length ? accounts[0] : null;
};

export const getBalance = async (account) => {
  const web3 = await loadWeb3();
  if (!web3) return null;

  const token = new web3.eth.Contract(
    ContractToken,
    import.meta.env.VITE_TOKEN_ADDRESS,
  );

  const balance = await token.methods.balanceOf(account).call();
  return web3.utils.fromWei(balance, 'ether');
};

export const transfer = async (address, amount) => {
  try {
    const provider = await detectEthereumProvider();
    if (!provider) {
      throw new Error(
        'Ethereum provider not detected. Please install MetaMask.',
      );
    }

    const web3 = new Web3(provider);

    const chainId = await web3.eth.getChainId();
    if (chainId !== 56) {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: Web3.utils.toHex(56) }],
      });
      toast.success('Switched to Binance Smart Chain.');
    }

    if (!web3.utils.isAddress(address)) {
      throw new Error('Invalid receiving wallet address.');
    }

    const accounts = await web3.eth.getAccounts();
    if (!accounts.length) {
      throw new Error('No accounts detected. Please connect your wallet.');
    }

    const senderAccount = accounts[0];
    const token = new web3.eth.Contract(
      ContractToken,
      import.meta.env.VITE_TOKEN_ADDRESS,
    );

    const amountInWei = web3.utils.toWei(amount.toString(), 'ether');
    const gasPrice = await web3.eth.getGasPrice(); // Legacy gas price for BSC

    const transactionHash = await token.methods
      .transfer(address, amountInWei)
      .send({
        from: senderAccount,
        gas: 21000, // Set appropriate gas limit based on token
        gasPrice, // Legacy gas price
      });

    toast.success('Transfer successful!');
    console.log('Transaction Hash:', transactionHash);

    return transactionHash;
  } catch (error) {
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
