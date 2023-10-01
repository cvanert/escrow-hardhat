import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';
import EscrowStorage from './artifacts/contracts/EscrowStorage.sol/EscrowStorage';

const storageAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
let escrowStorage;

export async function deployStorage(signer, address) {
  // if (address == null) {
  //   if (escrowStorage === undefined) {
  //     escrowStorage = await createEscrowStorage(signer);
  //     sessionStorage.setItem('EscrowStorage', escrowStorage.address);
  //     console.log(escrowStorage);
  //     return escrowStorage;
  //   }
  // } else {
  //   escrowStorage = new ethers.Contract(address, EscrowStorage.abi, signer);
  //   console.log(escrowStorage);
  //   return escrowStorage;
  // }
  sessionStorage.setItem('EscrowStorage', storageAddress);
  escrowStorage = new ethers.Contract(
    storageAddress,
    EscrowStorage.abi,
    signer
  );
  return escrowStorage;
}

async function createEscrowStorage(signer) {
  const factory = new ethers.ContractFactory(
    EscrowStorage.abi,
    EscrowStorage.bytecode,
    signer
  );

  return await factory.deploy();
}

export async function connectToEscrowStorage(signer, address) {
  if (address !== null) {
    return new ethers.Contract(address, EscrowStorage.abi, signer);
  }
}

export async function deployEscrow(signer, arbiter, beneficiary, value) {
  const factory = new ethers.ContractFactory(
    Escrow.abi,
    Escrow.bytecode,
    signer
  );
  return factory.deploy(sessionStorage.getItem('EscrowStorage'), arbiter, beneficiary, { value });
}

export async function connectToEscrow(signer, address) {
  return new ethers.Contract(address, Escrow.abi, signer);
}

export async function getApprovedEscrows() {
  return await escrowStorage.viewApproved();
}

export async function getAllEscrows() {
  return await escrowStorage.viewAllEscrows();
}