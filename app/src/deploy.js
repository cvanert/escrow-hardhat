import EscrowContracts from './artifacts/contracts/Escrow.sol/EscrowContracts';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';
const ethers = require("ethers");

let escrowContracts;

export async function deployStorage(signer, address) {
  console.log(signer, address);
  if (address == null) {
    if (escrowContracts == undefined) {
      escrowContracts = await createEscrowStorage(signer);
      localStorage.setItem('EscrowContracts', escrowContracts.address);
      return escrowContracts;
    }
  } else {
    escrowContracts = new ethers.Contract(address, EscrowContracts.abi, signer);
    console.log(escrowContracts);
    return escrowContracts;
  }
}

export async function deploy(signer, arbiter, beneficiary, value) {
  let escrow;
  console.log(escrowContracts);
  console.log(signer, arbiter, beneficiary, value);
  escrow = await createEscrow(signer, arbiter, beneficiary, value);
  getAllEscrows();
  return escrow;
}

export async function getEscrowContracts(signer, address) {
  escrowContracts = new ethers.Contract(address, EscrowContracts.abi, signer);
  console.log(escrowContracts);
  return escrowContracts;
}

async function createEscrowStorage(signer) {
  const factory = new ethers.ContractFactory(
    EscrowContracts.abi,
    EscrowContracts.bytecode,
    signer
  );

  return await factory.deploy();
}

async function createEscrow(signer, arbiter, beneficiary, value) {
  const factory = new ethers.ContractFactory(
    Escrow.abi,
    Escrow.bytecode,
    signer
  );

  return await factory.deploy(localStorage.getItem('EscrowContracts'), arbiter, beneficiary, { value });
}

export async function connectToEscrow(signer, address) {
  return new ethers.Contract(address, Escrow.abi, signer);
}

export async function getAllEscrows() {
  try {
    return await escrowContracts.viewEscrows();
  } catch (e) {
    console.log(e);
  }
}