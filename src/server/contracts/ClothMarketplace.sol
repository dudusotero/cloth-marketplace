// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./EtherWallet.sol";

contract ClothMarketplace is EtherWallet {
  address payable public contractOwner;

  constructor() payable {
    contractOwner = payable(msg.sender);
  }

  struct Cloth {
    uint256 id;
    string name;
    uint256 price;
  }

  struct ClothWithQuantity {
    uint256 id;
    string name;
    uint256 price;
    uint256 quantity;
  }

  Cloth[] public clothes;
  address[] public customers;

  mapping(address => bool) private customerExists;
  mapping(address => mapping(uint256 => uint256)) public customerClothes;

  function updateCustomersList(address _customer) internal {
    if (!customerExists[_customer]) {
      customers.push(_customer);
      customerExists[_customer] = true;
    }
  }

  function getCustomers() public view returns (address[] memory) {
    return customers;
  }

  function addCloth(
    string memory _name,
    uint256 _price,
    uint256 _quantity,
    address _owner
  ) external {
    require(_price > 0, "Price must be greater than 0");
    require(_quantity > 0, "Quantity must be greater than 0");

    uint256 clothId = clothes.length;
    clothes.push(Cloth(clothId, _name, _price));
    customerClothes[_owner][clothId] = _quantity;
    updateCustomersList(_owner);
  }

  function buyCloth(
    address payable _seller,
    uint256 _clothId,
    uint256 _quantity
  ) external payable {
    require(_seller != msg.sender, "You cannot buy your own cloth");
    require(_quantity > 0, "Quantity must be greater than 0");
    require(customerClothes[_seller][_clothId] >= _quantity, "Seller do not have enough cloths to sell");

    uint256 price = clothes[_clothId].price;
    uint256 totalPrice = price * _quantity;

    transfer(_seller, totalPrice);

    customerClothes[_seller][_clothId] -= _quantity;
    customerClothes[msg.sender][_clothId] += _quantity;
    updateCustomersList(msg.sender);
  }

  function getClothsByOwner(address _owner) external view returns (ClothWithQuantity[] memory) {
    return filterClothes(ownerPredicate, uint256(uint160(_owner)));
  }

  function ownerPredicate(Cloth storage _cloth, uint256 _owner) private view returns (bool) {
    return customerClothes[address(uint160(_owner))][_cloth.id] > 0;
  }

  function filterClothes(function(Cloth storage, uint256) view returns (bool) _predicate, uint256 _data0)
    private
    view
    returns (ClothWithQuantity[] memory result)
  {
    uint256 counter = 0;
    for (uint256 i = 0; i < clothes.length; ++i) {
      if (_predicate(clothes[i], _data0)) {
        ++counter;
      }
    }
    result = new ClothWithQuantity[](counter);
    counter = 0;
    for (uint256 i = 0; i < clothes.length; ++i) {
      if (_predicate(clothes[i], _data0)) {
        result[counter++] = ClothWithQuantity(
          clothes[i].id,
          clothes[i].name,
          clothes[i].price,
          customerClothes[address(uint160(_data0))][clothes[i].id]
        );
      }
    }
  }
}
