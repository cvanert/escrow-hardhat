import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { deploy, deployStorage, getAllEscrows, getEscrowContracts, connectToEscrow } from './deploy';
import Escrow from './Escrow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  console.log(approveTxn);
  await approveTxn.wait();
}

function App() {
  // const [escrowStorage, setEscrowStorage] = useState();
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
    setAllEscrowContracts();
  }, [account]);

  async function newStorageContract() {
    deployStorage(signer, localStorage.getItem('EscrowContracts')).then((res) => {
      console.log(localStorage.getItem('EscrowContracts'));
      window.location.reload(false);
    })
  }

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseEther(document.getElementById('eth').value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value.toString());
    console.log(escrowContract);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        console.log(`WTF for real`);
        console.log((await provider.getBalance(escrowContract.address)).toString());
        escrowContract.on('Approved', () => {
          console.log(`WTF`);
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

  async function setAllEscrowContracts() {
    getEscrowContracts(signer, localStorage.getItem('EscrowContracts')).then((res) => {
      res.viewEscrows().then((res) => {
        console.log(res);
        setEscrows(() =>
          res.map(escrowObject => ({
            address: escrowObject.contractAddress,
            arbiter: escrowObject.arbiter,
            beneficiary: escrowObject.beneficiary,
            depositor: escrowObject.depositor,
            value: escrowObject.amount.toString(),
            handleApprove: async () => {
              const escrowContract = await connectToEscrow(signer, escrowObject.contractAddress);
              console.log(escrowContract);
              console.log(`WTF for real`);
              console.log((await provider.getBalance(escrowObject.contractAddress)).toString());
              escrowContract.on('Approved', () => {
                console.log(`WTF`);
                document.getElementById(escrowObject.contractAddress).className =
                  'complete';
                document.getElementById(escrowObject.contractAddress).innerText =
                  "✓ It's been approved!";
              });

              await approve(escrowContract, signer);
            }
          })))
      });
    });
  }

  function StorageHTML() {
    if (localStorage.getItem('EscrowContracts') === null) {
      return DeployEscrowStorageHTML();
    } else {
      return EscrowStorageDeployedHTML();
    }
  }

  function DeployEscrowStorageHTML() {
    return (
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
    )
  }

  function EscrowStorageDeployedHTML() {
    return (
      <div className="storageDeployed">
        {localStorage.getItem('EscrowContracts')}
      </div>
    )
  }

  return (
    <>
      <div className="storageContract">
        <h1> Escrow Storage Contract </h1>
        <div className="storageContractDescription">
          Deploy contract to store future escrow contracts. Must be completed prior to deploying escrow contracts.
        </div>
        {StorageHTML()}
        {/* <div
          className="button"
          id="deployStorage"
          onClick={(e) => {
            e.preventDefault();

            newStorageContract();

          }}
        >
          Deploy Escrow Holding Contract
        </div> */}
      </div>

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
  );
}

export default App;
