import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';
import EscrowStorage from './artifacts/contracts/EscrowStorage.sol/EscrowStorage';

let escrowStorage;

export async function deployStorage(signer, address) {
  if (address == null) {
    if (escrowStorage === undefined) {
      escrowStorage = await createEscrowStorage(signer);
      localStorage.setItem('EscrowStorage', escrowStorage.address);
      console.log(escrowStorage);
      return escrowStorage;
    }
  } else {
    escrowStorage = new ethers.Contract(address, EscrowStorage.abi, signer);
    console.log(escrowStorage);
    return escrowStorage;
  }
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
  return new ethers.Contract(address, EscrowStorage.abi, signer);
}

export async function deployEscrow(signer, arbiter, beneficiary, value) {
  const factory = new ethers.ContractFactory(
    Escrow.abi,
    Escrow.bytecode,
    signer
  );
  return factory.deploy(localStorage.getItem('EscrowStorage'), arbiter, beneficiary, { value });
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