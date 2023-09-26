// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
	EscrowContracts public escrowContracts;

	address public contractAddress;
	address public arbiter;
    address public beneficiary;
    address public depositor;
	uint public value;
	bool public isApproved;

	constructor(EscrowContracts _escrowContracts, address _arbiter, address _beneficiary) payable {
		escrowContracts = _escrowContracts;
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = msg.sender;
		value = msg.value;

		_escrowContracts.createContract(address(this), depositor, arbiter, beneficiary, value);
	}

	event Approved(uint);

    function approve() external {
        require(msg.sender == arbiter);
        uint balance = address(this).balance;
        (bool sent, ) = payable(beneficiary).call{value: balance}("");
        require(sent, "Failed to send Ether");
        emit Approved(balance);
		isApproved = true;

		escrowContracts.updateApproval(address(this));
    }
}

contract EscrowContracts {
	struct EscrowContract {
		address arbiter;
		address beneficiary;
		address depositor;
		uint amount;
		bool approved;
		address contractAddress;
	}

    // Store contracts
    mapping(address => EscrowContract) public addressToEscrowContract;
	EscrowContract[] public escrows;

    function createContract(address _contractAddress, address _depositor, address _arbiter, address _beneficiary, uint _value) public payable {
        
		EscrowContract memory escrow = EscrowContract(
            _arbiter,
            _beneficiary,
            _depositor,
            _value,
            false,
            _contractAddress
		);

		addressToEscrowContract[_contractAddress] = escrow;
		escrows.push(escrow);
    }

	function updateApproval(address _contractAddress) public {
		addressToEscrowContract[_contractAddress].approved = true;
	}

	function viewEscrows () external view returns (EscrowContract[] memory) {
		return escrows;
	}
} 