import { ethers } from "ethers";
import tokenAbi from "../abis/BEP20USDT.json" assert { type: "json" };

const senderPrivateKey = process.env.SENDER_USDT_ADDRESS_PRIVATE_KEY;
const tokenAddress = process.env.USDT_ADDRESS;

const provider = new ethers.JsonRpcProvider(process.env.NODE_USDT_URL);

const senderWallet = new ethers.Wallet(senderPrivateKey, provider);

async function sendUsdt({ amount, receiverAddress }) {
  try {
    const amountToSend = ethers.parseUnits(amount.toString(), 18);

    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, senderWallet);

    const tx = await tokenContract.transfer(receiverAddress, amountToSend);

    const gasPrice = tx.gasPrice;
    console.log("Gas Price (wei):", gasPrice.toString());

    const receipt = await tx.wait();

    // Tính phí gas
    const gasUsed = receipt.gasUsed;

    const gasFee = gasUsed * gasPrice;

    console.log("Gas Used:", gasUsed.toString());

    console.log("Gas Fee (wei):", gasFee.toString());
    console.log("Gas Fee (ETH):", ethers.formatEther(gasFee.toString()));

    return receipt;
  } catch (error) {
    // console.error("An error occurred while sending the token:", error);
    throw new Error(error);
  }
}

export default sendUsdt;
