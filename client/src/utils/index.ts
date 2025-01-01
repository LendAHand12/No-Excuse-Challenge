export const shortenWalletAddress = (walletAddress: string, length = 20) => {
  if (walletAddress) {
    const startLength = Math.ceil(length / 2);
    const endLength = Math.floor(length / 2);
    const start = walletAddress.substring(0, startLength);
    const end = walletAddress.substring(walletAddress.length - endLength);
    return `${start}...${end}`;
  } else {
    return '';
  }
};
