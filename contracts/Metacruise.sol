// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Metacruise is ERC721Enumerable, Ownable, ReentrancyGuard {

  // List of admins
  mapping(address => bool) admins;

  // List of whitelisted addresses
  mapping(address => bool) whitelistedAddresses;

  /// Base token URI used as a prefix by tokenURI().
  string public baseTokenURI;

  // Whitelist state
  bool public isWhitelistActive = true;

  // Minting state
  bool public isSaleActive = false;

  // Total cars to be minted
  uint256 public constant totalCarsToMint = 10000;

  // Enumerable index
  uint256 public tokenIndex = 0;

  // Addresses to recieve payout
  address[6] private _shareholders;
  uint[6] private _shares;

  constructor() ERC721("Metacruise", "CRUISER") {
    baseTokenURI = "";

    // Set shareholders
    _shareholders[0] = 0x5B72215e47D49357e21a2F783E9b62b9F8949ED1; //K
    _shareholders[1] = 0x0a35deE58a71804427Feb3150f5aC3681F62A0cF; //I

    _shareholders[2] = 0xcFE1B40E1827fed718b5df38063c6fD5f3df4Ed9; //MH1
    _shareholders[3] = 0xb35772acA12DdA6986B6BD2C972037ec88F097E5; //MH2

    _shareholders[4] = 0x6c3d3F92e52a85f0e89b51E7Cb7795A12911B76E; //Y
    _shareholders[5] = 0xb31361553E63c676421A3e8136518ecfd6E5A7aA; //D


    // Set shares
    _shares[0] = 2000;
    _shares[1] = 2000;

    _shares[2] = 2500;
    _shares[3] = 2500;

    _shares[4] = 700;
    _shares[5] = 300;

    // Set addresses of admins and whitelist them
    admins[_shareholders[0]] = true;
    admins[_shareholders[1]] = true;

    whitelistedAddresses[_shareholders[0]] = true;
    whitelistedAddresses[_shareholders[1]] = true;
  }

  function acquire(address recipient, uint256 amount) public payable nonReentrant {
    require(isSaleActive, "sale is not active");
    require(amount > 0, "minimum 1 car");
    require(amount <= totalCarsToMint - tokenIndex, "greater than max supply");
    require(getCarPrice() * amount <= msg.value,"exact value in ETH needed");
    if(isWhitelistActive){
      require(amount == 1, "max 1 car at once");
      require(this.balanceOf(recipient) < 1, "you can mint only one during whitelist");
      require(isWhitelisted(recipient), "you are not on the whitelist");
    }
    else{
      require(amount <= 5, "max 5 car at once");
    }
    for (uint256 i = 0; i < amount; i++) {
      _mintToken(recipient);
    }
  }

  // Returns an URI for a given token ID
  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }

  /// Sets the base token URI prefix.
  function setBaseTokenURI(string memory _baseTokenURI) public onlyAdmin  {
    baseTokenURI = _baseTokenURI;
  }

  // Add an address to the whitelist
  function whitelistAddress(address _addressToWhitelist) public onlyAdmin{
      whitelistedAddresses[_addressToWhitelist] = true;
  }

  // Remove address from whitelist
  function unWhitelistAddress(address _addressToWhitelist) public onlyAdmin{
      whitelistedAddresses[_addressToWhitelist] = false;
  }

  // Whitelist switch
  function stopWhitelist() public onlyAdmin{
    isWhitelistActive = false;
  }

  function startWhitelist() external onlyAdmin{
    isWhitelistActive = true;
  }

  // Sale switch
  function stopSale() public onlyAdmin{
    isSaleActive = false;
  }

  function startSale() external onlyAdmin{
    isSaleActive = true;
  }

  // Check if an address is whitelisted
  function isWhitelisted(address _whitelistedAddress) public view returns(bool) {
      bool addressIsWhitelisted = whitelistedAddresses[_whitelistedAddress];
      return addressIsWhitelisted;
  }

  // Check if the whitelist is active
  function getIsWhitelistActive() public view returns(bool){
      return isWhitelistActive;
  }

  // Check if the sale is active
  function getIsSaleActive() public view returns(bool){
      return isSaleActive;
  }

  // Check if an address is an admin
  function isAdmin(address _address) public view returns(bool){
      return admins[_address];
  }

  // Returns the price of a single car depending on the whitelist state
  function getCarPrice() public view returns (uint256){
    if(isWhitelistActive){
      return 0.035 ether; // 0.035 ETH
    }
    return 0.06 ether; // 0.06 ETH
  }

  // Returns an URI for a given token ID
  // function getBaseURI() internal view virtual returns (string memory) {
  //   return baseTokenURI;
  // }

  function getCarsOfOwner(address _owner) external view returns (uint256[] memory) {
      uint256 tokenCount = balanceOf(_owner);
      if (tokenCount == 0) {
        return new uint256[](0);
      }
      else {
        uint256[] memory result = new uint256[](tokenCount);
        uint256 index;
        for (index = 0; index < tokenCount; index++) {
          result[index] = tokenOfOwnerByIndex(_owner, index);
        }
        return result;
      }
    }

  // Internal mint
  function _mintToken(address destinationAddress) private {
    tokenIndex++;
    require(!_exists(tokenIndex), "The token already exists.");
    _safeMint(destinationAddress, tokenIndex);
  }

  // This modifiers lets only admin addresses call certain functions
  modifier onlyAdmin() {
        require(admins[msg.sender] == true);
            _;
  }

  // Distributes balance to creators
  function withdrawEarnings(uint256 amount) public onlyAdmin {
    require(address(this).balance >= amount, "Insufficient balance");
    uint256 totalShares = 10000;
    for (uint256 i = 0; i < 6; i++) {
        uint256 payment = amount * _shares[i] / totalShares;
        Address.sendValue(payable(_shareholders[i]), payment);
    }
  }
}
