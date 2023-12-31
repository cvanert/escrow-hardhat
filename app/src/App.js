import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { connectToEscrow, connectToEscrowStorage, deployStorage, deployEscrow } from './contractFunctions';
import Escrow from './Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
    setEscrowsAfterRefresh();

  }, [account]);

  async function newStorageContract() {
    deployStorage(signer, sessionStorage.getItem('EscrowContracts')).then((res) => {
      console.log(res);
      window.location.reload(false);
    });
  }

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseEther(document.getElementById('eth').value);
    const escrowContract = await deployEscrow(signer, arbiter, beneficiary, value.toString());


    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: ethers.utils.formatEther(value),
      handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  async function setEscrowsAfterRefresh() {
    const eStorage = await connectToEscrowStorage(signer, sessionStorage.getItem('EscrowStorage'));
    const approved = await eStorage.viewApproved();
    const allEscrows = await eStorage.viewAllEscrows();
    console.log(approved);
    console.log(allEscrows);

    setEscrows(() =>
      allEscrows.map(esc => ({
        address: esc.contractAddress,
        arbiter: esc.arbiter,
        beneficiary: esc.beneficiary,
        depositor: esc.depositor,
        value: ethers.utils.formatEther(esc.amount),
        approved: approved.findIndex(a => {
          return a.toLowerCase() === esc.contractAddress.toLowerCase()
        }) !== -1,
        handleApprove: async () => {
          const escrowContract = await connectToEscrow(signer, esc.contractAddress);
          escrowContract.on('Approved', () => {
            document.getElementById(esc.contractAddress).className =
              'complete';
            document.getElementById(esc.contractAddress).innerText =
              "✓ It's been approved!";
          });

          await approve(escrowContract, signer);
        }
      }))
    )
  }

  function StorageHTML() {
    if (sessionStorage.getItem('EscrowStorage') === null) {
      return DeployEscrowStorageHTML();
    } else {
      return EscrowStorageDeployedHTML();
    }
  }

  function DeployEscrowStorageHTML() {
    return (
      <div className="storageContractAddressContainer">
        <div
          className="button"
          id="deployStorage"
          onClick={(e) => {
            e.preventDefault();

            newStorageContract();
          }}
        >
          Deploy Escrow Holding Contract
        </div>
      </div>
    )
  }

  function EscrowStorageDeployedHTML() {
    return (
      <div className="storageContractAddressContainer">
        <h3>Contract Address:</h3>
        <div className="storageContractAddress">
          <div className="storageDeployed">
            {sessionStorage.getItem('EscrowStorage')}
          </div>
        </div>
      </div>
    )
  }

  function EscrowContractCreationHTML() {
    if (sessionStorage.getItem('EscrowStorage') !== null) {
      return (
        <>
          <div className="contract">
            <h1> New Contract </h1>
            <label>
              Arbiter Address
              <input type="text" id="arbiter" />
            </label>

            <label>
              Beneficiary Address
              <input type="text" id="beneficiary" />
            </label>

            <label>
              Deposit Amount (in ETH)
              <input type="text" id="eth" />
            </label>

            <div
              className="button"
              id="deploy"
              onClick={(e) => {
                e.preventDefault();
                newContract();
                document.getElementById('arbiter').value = "";
                document.getElementById('beneficiary').value = "";
                document.getElementById('eth').value = ""
              }}
            >
              Deploy
            </div>
          </div>

          <div className="existing-contracts">
            <h1> Existing Contracts </h1>

            <div id="container">
              {escrows.map((escrow) => {
                return <Escrow key={escrow.address} {...escrow} />;
              })}
            </div>
          </div>
        </>
      )
    };
  }

  return (
    <>
      <div className="contentContainer">
        <div className="storageContractContainer">
          <div className="storageContract">
            <div className="storageContractTitleContainer">
              <h1 className="storageContractTitle"> Escrow Storage Contract </h1>
            </div>
            <div className="storageContractDescriptionContainer">
              <div className="storageContractDescription">
                Must deploy smart contract to store escrow contracts prior to deploying escrow contracts.
              </div>
            </div>
            {StorageHTML()}
          </div>
        </div>
        <div className="escrowContractContainer">
          {EscrowContractCreationHTML()}
        </div>
      </div>
    </>
  );
}

export default App;
