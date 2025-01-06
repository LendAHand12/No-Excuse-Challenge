import { ethers } from "ethers";
import tokenAbi from "../abis/BEP20USDT.json" assert { type: "json" };

const senderPrivateKey = process.env.SENDER_HEWE_ADDRESS_PRIVATE_KEY;
const tokenAddress = process.env.HEWE_ADDRESS;

const provider = new ethers.JsonRpcProvider(process.env.NODE_HEWE_URL);

const senderWallet = new ethers.Wallet(senderPrivateKey, provider);

async function sendHewe({ amount, receiverAddress }) {
  try {
    const amountToSend = ethers.parseUnits(amount.toString(), 18);

    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, senderWallet);

    const tx = await tokenContract.transfer(receiverAddress, amountToSend);

    const receipt = await tx.wait();

    return receipt;
  } catch (error) {
    console.error("An error occurred while sending the token:", error);
    throw new Error(error);
  }
}

export default sendHewe;
