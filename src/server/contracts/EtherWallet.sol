// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract EtherWallet {
  mapping(address => uint256) balances;

  modifier notEnoughFunds(uint256 _amount) {
    require(balances[msg.sender] >= _amount, "Insufficient funds!");
    _;
  }

  fallback() external payable {
    deposit();
  }

  receive() external payable {
    deposit();
  }

  function deposit() public payable {
    balances[msg.sender] += msg.value;
  }

  function withdraw(uint256 _amount) external notEnoughFunds(_amount) {
    balances[msg.sender] -= _amount;
    payable(msg.sender).transfer(_amount);
  }

  function transfer(address _receiver, uint256 _amount) public payable notEnoughFunds(_amount) {
    balances[msg.sender] -= _amount;
    balances[_receiver] += _amount;
  }

  function balance() external view returns (uint256) {
    return balances[msg.sender];
  }

  function getTotalBalance() external view returns (uint256) {
    return address(this).balance;
  }
}
