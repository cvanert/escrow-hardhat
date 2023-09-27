// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import './EscrowStorage.sol';

contract Escrow {
	EscrowStorage public escrowStorage;

	address public arbiter;
	address public beneficiary;
	address public depositor;
	bool public isApproved;

	constructor(EscrowStorage _escrowStorage, address _arbiter, address _beneficiary) payable {
		escrowStorage = EscrowStorage(_escrowStorage);
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = msg.sender;

		escrowStorage.createContract(address(this), depositor, arbiter, beneficiary, msg.value);
	}

	event Approved(uint);

	function approve() external {
		require(msg.sender == arbiter);
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
		emit Approved(balance);
		isApproved = true;

		escrowStorage.updateApproved(address(this));
	}
}
