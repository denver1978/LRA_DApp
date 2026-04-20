import { Contract } from "ethers";
import CONTRACT_ABI from "../utils/contractABI";
import { CONTRACT_ADDRESS } from "../utils/contractAddress";

export default function useContract(signer) {
  if (!signer || !CONTRACT_ADDRESS) return null;

  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}