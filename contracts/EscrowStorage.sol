// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract EscrowStorage {
    struct EscrowContract {
        address arbiter;
        address beneficiary;
		address depositor;
		uint amount;
		bool approved;
		address contractAddress;
    }

    // Store contracts
    EscrowContract[] public allEscrows;
    address[] public approvedEscrows;

    function createContract(address _contractAddress, address _depositor, address _arbiter, address _beneficiary, uint _value) public payable {

        EscrowContract memory escrow = EscrowContract(
            _arbiter,
            _beneficiary,
            _depositor,
            _value,
            false,
            _contractAddress
		);

        allEscrows.push(escrow);
    }

    function updateApproved(address _contractAddress) external {
        approvedEscrows.push(_contractAddress);
    }

    function viewAllEscrows() external view returns (EscrowContract[] memory) {
        return allEscrows;
    }

    function viewApproved() external view returns (address[] memory) {
        return approvedEscrows;
    }

}