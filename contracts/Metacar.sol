// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Metacar is ERC721, Ownable, ReentrancyGuard {
  using Counters for Counters.Counter;

  Counters.Counter private currentTokenId;

  // List of admins
  mapping(address => bool) admins;

  // List of whitelisted addresses
  mapping(address => bool) whitelistedAddresses;

  /// Base token URI used as a prefix by tokenURI().
  string public baseTokenURI;

  // Whitelist state
  bool public isWhitelistActive = true;

  // Total cars to be minted
  uint256 public constant totalCarsToMint = 10000;

  constructor() ERC721("Metacars", "CAR") {
    baseTokenURI = "";

    // Set addresses of admins and whitelist them
    admins[0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199] = true;
    admins[0xfdb2c1f70046e90C5607f6403f21BB7F2662a117] = true;
    whitelistedAddresses[0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199] = true;
    whitelistedAddresses[0xfdb2c1f70046e90C5607f6403f21BB7F2662a117] = true;
  }

  function acquire(address recipient, uint256 amount) public payable nonReentrant {
    require(amount > 0, "minimum 1 car");
    require(amount <= totalCarsToMint - currentTokenId.current(), "greater than max supply");
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

  // Whitelist switch
  function stopWhitelist() public onlyAdmin{
		isWhitelistActive = false;
	}

	function startWhitelist() external onlyAdmin{
		isWhitelistActive = true;
	}

  // Check if an address is whitelisted
  function isWhitelisted(address _whitelistedAddress) public view returns(bool) {
      bool addressIsWhitelisted = whitelistedAddresses[_whitelistedAddress];
      return addressIsWhitelisted;
  }

  function isAdmin(address _address) public view returns(bool){
      return admins[_address];
  }

  function getIsWhitelistActive() public view returns(bool){
      return isWhitelistActive;
  }

  // Returns the price of a single car depending on the whitelist state
  // Denies transaction if sold out.
  function getCarPrice() public view returns (uint256){
    if(isWhitelistActive){
      return 0.035 ether; // 0.035 ETH
    }
    return 0.05 ether; // 0.05 ETH
  }

  // Internal mint
  function _mintToken(address destinationAddress) private {
    currentTokenId.increment();
    _safeMint(destinationAddress, currentTokenId.current());
  }

  // This modifiers lets only admin addresses call certain functions
  modifier onlyAdmin() {
        require(admins[msg.sender] == true);
            _;
  }
}
