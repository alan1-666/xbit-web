import { ethers } from 'ethers';

export async function getSigner() {
  if (!window.ethereum) {
    throw new Error("No crypto wallet found");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);

  const signer = await provider.getSigner();

  return signer;
}