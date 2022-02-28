// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CakiaNft is ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    uint256 private _cost;
    IERC20 private _token;
    address private _mintCostAcc;

    constructor(IERC20 token, address mintCostAcc) ERC721("CakiaNft", "CakiaNft") {
        _cost = 100 * 10 ** 18;
        _token = token;
        _mintCostAcc = mintCostAcc;
    }

    function mint() external {
        _token.transferFrom(msg.sender, _mintCostAcc, _cost);

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
    }

    function withdraw(address payable recipient, uint256 amount) public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance >= amount, "Not enough balance");

        recipient.transfer(amount);
    }

    function setCost(uint256 cost) public onlyOwner {
        _cost = cost * 10 ** 18;
    }

    function setMintingCurrency(IERC20 newToken) public onlyOwner {
        _token = newToken;
    }

    function setMintCostAcc(address mintCostAcc) public onlyOwner {
        _mintCostAcc = mintCostAcc;
    }
}
