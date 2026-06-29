import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MTAToken } from "../../typechain-types";
import { ZeroAddress, parseEther } from "ethers";

describe("MTAToken", () => {
  let token: MTAToken;
  let admin: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  let pauser: HardhatEthersSigner;
  let blacklister: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const MAX_SUPPLY = parseEther("100000000"); // 100M MTA

  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
  const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
  const BLACKLISTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BLACKLISTER_ROLE"));
  const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

  beforeEach(async () => {
    [admin, minter, pauser, blacklister, user1, user2] = await ethers.getSigners();

    const MTATokenFactory = await ethers.getContractFactory("MTAToken");
    token = (await MTATokenFactory.deploy(
      admin.address,
      minter.address,
      pauser.address,
      blacklister.address
    )) as unknown as MTAToken;
    await token.waitForDeployment();
  });

  // ─── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("should set correct name and symbol", async () => {
      expect(await token.name()).to.equal("MetaAras");
      expect(await token.symbol()).to.equal("MTA");
    });

    it("should set 18 decimals", async () => {
      expect(await token.decimals()).to.equal(18n);
    });

    it("should set correct MAX_SUPPLY", async () => {
      expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("should grant roles correctly", async () => {
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await token.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
      expect(await token.hasRole(BLACKLISTER_ROLE, blacklister.address)).to.be.true;
    });

    it("should start with zero total supply", async () => {
      expect(await token.totalSupply()).to.equal(0n);
    });

    it("should revert with zero address admin", async () => {
      const Factory = await ethers.getContractFactory("MTAToken");
      await expect(
        Factory.deploy(ZeroAddress, minter.address, pauser.address, blacklister.address)
      ).to.be.revertedWithCustomError(token, "MTA__ZeroAddress");
    });

    it("should revert with zero address minter", async () => {
      const Factory = await ethers.getContractFactory("MTAToken");
      await expect(
        Factory.deploy(admin.address, ZeroAddress, pauser.address, blacklister.address)
      ).to.be.revertedWithCustomError(token, "MTA__ZeroAddress");
    });
  });

  // ─── Minting ───────────────────────────────────────────────────────────────
  describe("Minting", () => {
    it("should mint tokens by minter", async () => {
      const amount = parseEther("1000");
      await token.connect(minter).mint(user1.address, amount);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(amount);
    });

    it("should revert mint by non-minter", async () => {
      await expect(
        token.connect(user1).mint(user1.address, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("should revert mint to zero address", async () => {
      await expect(
        token.connect(minter).mint(ZeroAddress, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "MTA__ZeroAddress");
    });

    it("should revert zero amount mint", async () => {
      await expect(
        token.connect(minter).mint(user1.address, 0n)
      ).to.be.revertedWithCustomError(token, "MTA__ZeroAmount");
    });

    it("should revert when exceeding MAX_SUPPLY", async () => {
      await expect(
        token.connect(minter).mint(user1.address, MAX_SUPPLY + 1n)
      ).to.be.revertedWithCustomError(token, "MTA__MaxSupplyExceeded");
    });

    it("should mint exactly up to MAX_SUPPLY", async () => {
      await token.connect(minter).mint(user1.address, MAX_SUPPLY);
      expect(await token.totalSupply()).to.equal(MAX_SUPPLY);
    });

    it("should revert minting after max supply reached", async () => {
      await token.connect(minter).mint(user1.address, MAX_SUPPLY);
      await expect(
        token.connect(minter).mint(user1.address, 1n)
      ).to.be.revertedWithCustomError(token, "MTA__MaxSupplyExceeded");
    });
  });

  // ─── Minter Revoke ─────────────────────────────────────────────────────────
  describe("Minter Revoke", () => {
    it("should disable minting by admin", async () => {
      await token.connect(admin).revokeMinter();
      expect(await token.isMintingDisabled()).to.be.true;
    });

    it("should prevent minting after revoke", async () => {
      await token.connect(admin).revokeMinter();
      await expect(
        token.connect(minter).mint(user1.address, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "MTA__MintingPermanentlyDisabled");
    });

    it("should emit MinterRevoked event", async () => {
      await expect(token.connect(admin).revokeMinter())
        .to.emit(token, "MinterRevoked")
        .withArgs(admin.address);
    });

    it("should revert revoke by non-admin", async () => {
      await expect(
        token.connect(user1).revokeMinter()
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("should revert second revokeMinter call (idempotent guard)", async () => {
      await token.connect(admin).revokeMinter();
      await expect(
        token.connect(admin).revokeMinter()
      ).to.be.revertedWithCustomError(token, "MTA__MintingPermanentlyDisabled");
    });

    it("minter role still exists after revoke but minting is blocked by flag", async () => {
      await token.connect(admin).revokeMinter();
      // MINTER_ROLE hâlâ minter'da var; kalıcı flag minting'i blokluyor
      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      await expect(
        token.connect(minter).mint(user1.address, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "MTA__MintingPermanentlyDisabled");
    });
  });

  // ─── Burning ───────────────────────────────────────────────────────────────
  describe("Burning", () => {
    beforeEach(async () => {
      await token.connect(minter).mint(user1.address, parseEther("10000"));
    });

    it("should burn own tokens", async () => {
      const burnAmount = parseEther("1000");
      await token.connect(user1).burn(burnAmount);
      expect(await token.balanceOf(user1.address)).to.equal(parseEther("9000"));
    });

    it("should burn with allowance (burnFrom)", async () => {
      const burnAmount = parseEther("500");
      await token.connect(user1).approve(user2.address, burnAmount);
      await token.connect(user2).burnFrom(user1.address, burnAmount);
      expect(await token.balanceOf(user1.address)).to.equal(parseEther("9500"));
    });
  });

  // ─── Pause ─────────────────────────────────────────────────────────────────
  describe("Pause", () => {
    beforeEach(async () => {
      await token.connect(minter).mint(user1.address, parseEther("1000"));
    });

    it("should pause and unpause by pauser", async () => {
      await token.connect(pauser).pause();
      expect(await token.paused()).to.be.true;
      await token.connect(pauser).unpause();
      expect(await token.paused()).to.be.false;
    });

    it("should revert transfer when paused", async () => {
      await token.connect(pauser).pause();
      await expect(
        token.connect(user1).transfer(user2.address, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("should revert mint when paused", async () => {
      await token.connect(pauser).pause();
      await expect(
        token.connect(minter).mint(user2.address, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("should revert pause by non-pauser", async () => {
      await expect(
        token.connect(user1).pause()
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });
  });

  // ─── Blacklist ─────────────────────────────────────────────────────────────
  describe("Blacklist", () => {
    beforeEach(async () => {
      await token.connect(minter).mint(user1.address, parseEther("1000"));
    });

    it("should blacklist an address", async () => {
      await token.connect(blacklister).setBlacklist(user1.address, true);
      expect(await token.isBlacklisted(user1.address)).to.be.true;
    });

    it("should remove from blacklist", async () => {
      await token.connect(blacklister).setBlacklist(user1.address, true);
      await token.connect(blacklister).setBlacklist(user1.address, false);
      expect(await token.isBlacklisted(user1.address)).to.be.false;
    });

    it("should revert transfer from blacklisted address", async () => {
      await token.connect(blacklister).setBlacklist(user1.address, true);
      await expect(
        token.connect(user1).transfer(user2.address, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "MTA__Blacklisted");
    });

    it("should revert transfer to blacklisted address", async () => {
      await token.connect(blacklister).setBlacklist(user2.address, true);
      await expect(
        token.connect(user1).transfer(user2.address, parseEther("1"))
      ).to.be.revertedWithCustomError(token, "MTA__Blacklisted");
    });

    it("should emit BlacklistUpdated event", async () => {
      await expect(token.connect(blacklister).setBlacklist(user1.address, true))
        .to.emit(token, "BlacklistUpdated")
        .withArgs(user1.address, true);
    });

    it("should revert blacklist by non-blacklister", async () => {
      await expect(
        token.connect(user1).setBlacklist(user2.address, true)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });

    it("should revert blacklisting zero address", async () => {
      await expect(
        token.connect(blacklister).setBlacklist(ZeroAddress, true)
      ).to.be.revertedWithCustomError(token, "MTA__ZeroAddress");
    });
  });

  // ─── ERC20Votes (Governance) ───────────────────────────────────────────────
  describe("Governance Votes", () => {
    beforeEach(async () => {
      await token.connect(minter).mint(user1.address, parseEther("1000"));
    });

    it("should have zero votes before self-delegation", async () => {
      expect(await token.getVotes(user1.address)).to.equal(0n);
    });

    it("should reflect votes after self-delegation", async () => {
      await token.connect(user1).delegate(user1.address);
      expect(await token.getVotes(user1.address)).to.equal(parseEther("1000"));
    });

    it("should delegate votes to another address", async () => {
      await token.connect(user1).delegate(user2.address);
      expect(await token.getVotes(user2.address)).to.equal(parseEther("1000"));
      expect(await token.getVotes(user1.address)).to.equal(0n);
    });
  });

  // ─── ERC20Permit ───────────────────────────────────────────────────────────
  describe("ERC20Permit", () => {
    it("should support permit (gasless approval)", async () => {
      await token.connect(minter).mint(user1.address, parseEther("1000"));

      // Blockchain zamanını kullan; test sırası blockchain saatini ilerletebilir
      const latestBlock = await ethers.provider.getBlock("latest");
      const deadline = latestBlock!.timestamp + 3600;
      const value = parseEther("100");

      const domain = {
        name: "MetaAras",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress(),
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const nonce = await token.nonces(user1.address);
      const message = {
        owner: user1.address,
        spender: user2.address,
        value,
        nonce,
        deadline,
      };

      const signature = await user1.signTypedData(domain, types, message);
      const { v, r, s } = ethers.Signature.from(signature);

      await token.permit(user1.address, user2.address, value, deadline, v, r, s);
      expect(await token.allowance(user1.address, user2.address)).to.equal(value);
    });
  });
});
