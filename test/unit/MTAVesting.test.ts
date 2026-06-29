import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MTAToken, MTAVesting } from "../../typechain-types";
import { parseEther, ZeroAddress } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MTAVesting", () => {
  let token: MTAToken;
  let vesting: MTAVesting;
  let admin: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  let pauser: HardhatEthersSigner;
  let blacklister: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;
  let beneficiary1: HardhatEthersSigner;
  let beneficiary2: HardhatEthersSigner;

  const VESTING_AMOUNT = parseEther("1000000"); // 1M MTA
  const CLIFF_DURATION = 6 * 30 * 24 * 3600;   // 6 ay saniye
  const VESTING_DURATION = 18 * 30 * 24 * 3600; // 18 ay saniye

  beforeEach(async () => {
    [admin, minter, pauser, blacklister, treasury, beneficiary1, beneficiary2] =
      await ethers.getSigners();

    // Token deploy
    const TokenFactory = await ethers.getContractFactory("MTAToken");
    token = (await TokenFactory.deploy(
      admin.address,
      minter.address,
      pauser.address,
      blacklister.address
    )) as unknown as MTAToken;

    // Vesting deploy
    const VestingFactory = await ethers.getContractFactory("MTAVesting");
    vesting = (await VestingFactory.deploy(
      await token.getAddress(),
      treasury.address,
      admin.address
    )) as unknown as MTAVesting;

    // Vesting kontratına token mint et
    await token.connect(minter).mint(await vesting.getAddress(), VESTING_AMOUNT * 3n);
  });

  // ─── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("should set correct token address", async () => {
      expect(await vesting.token()).to.equal(await token.getAddress());
    });

    it("should set correct treasury address", async () => {
      expect(await vesting.treasury()).to.equal(treasury.address);
    });

    it("should revert with zero token address", async () => {
      const Factory = await ethers.getContractFactory("MTAVesting");
      await expect(
        Factory.deploy(ZeroAddress, treasury.address, admin.address)
      ).to.be.revertedWithCustomError(vesting, "Vesting__ZeroAddress");
    });
  });

  // ─── Schedule Oluşturma ────────────────────────────────────────────────────
  describe("createSchedule", () => {
    it("should create a vesting schedule", async () => {
      const tx = await vesting.connect(admin).createSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        0,
        CLIFF_DURATION,
        VESTING_DURATION,
        true
      );
      const receipt = await tx.wait();

      expect(await vesting.scheduleCount()).to.equal(1n);
      expect(await vesting.totalVestingAmount()).to.equal(VESTING_AMOUNT);
    });

    it("should emit ScheduleCreated event", async () => {
      await expect(
        vesting.connect(admin).createSchedule(
          beneficiary1.address,
          VESTING_AMOUNT,
          0,
          CLIFF_DURATION,
          VESTING_DURATION,
          true
        )
      ).to.emit(vesting, "ScheduleCreated");
    });

    it("should revert with zero beneficiary", async () => {
      await expect(
        vesting.connect(admin).createSchedule(
          ZeroAddress,
          VESTING_AMOUNT,
          0,
          CLIFF_DURATION,
          VESTING_DURATION,
          true
        )
      ).to.be.revertedWithCustomError(vesting, "Vesting__ZeroAddress");
    });

    it("should revert with zero amount", async () => {
      await expect(
        vesting.connect(admin).createSchedule(
          beneficiary1.address,
          0n,
          0,
          CLIFF_DURATION,
          VESTING_DURATION,
          true
        )
      ).to.be.revertedWithCustomError(vesting, "Vesting__ZeroAmount");
    });

    it("should revert when cliff > vesting duration", async () => {
      await expect(
        vesting.connect(admin).createSchedule(
          beneficiary1.address,
          VESTING_AMOUNT,
          0,
          VESTING_DURATION + 1,
          VESTING_DURATION,
          true
        )
      ).to.be.revertedWithCustomError(vesting, "Vesting__InvalidDuration");
    });

    it("should revert when startTime is in the past (V-3)", async () => {
      const pastTime = (await ethers.provider.getBlock("latest"))!.timestamp - 3600;
      await expect(
        vesting.connect(admin).createSchedule(
          beneficiary1.address,
          VESTING_AMOUNT,
          pastTime,
          CLIFF_DURATION,
          VESTING_DURATION,
          true
        )
      ).to.be.revertedWithCustomError(vesting, "Vesting__StartTimeInPast");
    });

    it("should not produce duplicate scheduleId for same-block calls (V-2)", async () => {
      const tx1 = await vesting.connect(admin).createSchedule(
        beneficiary1.address, VESTING_AMOUNT, 0, CLIFF_DURATION, VESTING_DURATION, true
      );
      const tx2 = await vesting.connect(admin).createSchedule(
        beneficiary1.address, VESTING_AMOUNT, 0, CLIFF_DURATION, VESTING_DURATION, true
      );
      const r1 = await tx1.wait();
      const r2 = await tx2.wait();

      const getScheduleId = (receipt: any) =>
        receipt?.logs.find(
          (log: any) => log.topics[0] === ethers.id("ScheduleCreated(bytes32,address,uint256,uint64,uint64,uint64)")
        )?.topics[1];

      const id1 = getScheduleId(r1);
      const id2 = getScheduleId(r2);
      expect(id1).to.not.equal(id2);
      expect(await vesting.scheduleCount()).to.equal(2n);
    });

    it("should revert when insufficient balance", async () => {
      const tooMuch = parseEther("100000000"); // 100M, kontrat yetmez
      await expect(
        vesting.connect(admin).createSchedule(
          beneficiary1.address,
          tooMuch,
          0,
          CLIFF_DURATION,
          VESTING_DURATION,
          true
        )
      ).to.be.revertedWithCustomError(vesting, "Vesting__InsufficientBalance");
    });
  });

  // ─── Token Serbest Bırakma ─────────────────────────────────────────────────
  describe("release", () => {
    let scheduleId: string;

    beforeEach(async () => {
      const tx = await vesting.connect(admin).createSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        0,
        CLIFF_DURATION,
        VESTING_DURATION,
        true
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.topics[0] === ethers.id("ScheduleCreated(bytes32,address,uint256,uint64,uint64,uint64)")
      ) as any;
      scheduleId = event?.topics[1];
    });

    it("should return zero releasable before cliff", async () => {
      expect(await vesting.releasableAmount(scheduleId)).to.equal(0n);
    });

    it("should revert release before cliff", async () => {
      await expect(
        vesting.connect(beneficiary1).release(scheduleId)
      ).to.be.revertedWithCustomError(vesting, "Vesting__NothingToRelease");
    });

    it("should release proportional amount after cliff", async () => {
      // Cliff'i geç (6 ay + 1 saniye)
      await time.increase(CLIFF_DURATION + 1);

      const releasable = await vesting.releasableAmount(scheduleId);
      expect(releasable).to.be.gt(0n);

      await vesting.connect(beneficiary1).release(scheduleId);
      expect(await token.balanceOf(beneficiary1.address)).to.be.gt(0n);
    });

    it("should release full amount after vesting end", async () => {
      await time.increase(VESTING_DURATION + 1);

      await vesting.connect(beneficiary1).release(scheduleId);
      expect(await token.balanceOf(beneficiary1.address)).to.equal(VESTING_AMOUNT);
    });

    it("should emit TokensReleased event", async () => {
      await time.increase(VESTING_DURATION + 1);

      await expect(vesting.connect(beneficiary1).release(scheduleId))
        .to.emit(vesting, "TokensReleased")
        .withArgs(scheduleId, beneficiary1.address, VESTING_AMOUNT);
    });

    it("should revert release by non-beneficiary", async () => {
      await time.increase(VESTING_DURATION + 1);
      await expect(
        vesting.connect(beneficiary2).release(scheduleId)
      ).to.be.revertedWithCustomError(vesting, "Vesting__NotBeneficiary");
    });
  });

  // ─── İptal (Revoke) ────────────────────────────────────────────────────────
  describe("revoke", () => {
    let scheduleId: string;

    beforeEach(async () => {
      const tx = await vesting.connect(admin).createSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        0,
        CLIFF_DURATION,
        VESTING_DURATION,
        true
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.topics[0] === ethers.id("ScheduleCreated(bytes32,address,uint256,uint64,uint64,uint64)")
      ) as any;
      scheduleId = event?.topics[1];
    });

    it("should revoke before cliff and return all tokens to treasury", async () => {
      const treasuryBefore = await token.balanceOf(treasury.address);

      await vesting.connect(admin).revoke(scheduleId);

      const treasuryAfter = await token.balanceOf(treasury.address);
      expect(treasuryAfter - treasuryBefore).to.equal(VESTING_AMOUNT);
    });

    it("should emit ScheduleRevoked event", async () => {
      await expect(vesting.connect(admin).revoke(scheduleId))
        .to.emit(vesting, "ScheduleRevoked");
    });

    it("should revert revoking twice", async () => {
      await vesting.connect(admin).revoke(scheduleId);
      await expect(
        vesting.connect(admin).revoke(scheduleId)
      ).to.be.revertedWithCustomError(vesting, "Vesting__AlreadyRevoked");
    });

    it("should pay earned tokens to beneficiary on revoke", async () => {
      // Cliff sonrası, yarı vesting
      await time.increase(CLIFF_DURATION + VESTING_DURATION / 2);

      const beneficiaryBefore = await token.balanceOf(beneficiary1.address);
      await vesting.connect(admin).revoke(scheduleId);
      const beneficiaryAfter = await token.balanceOf(beneficiary1.address);

      expect(beneficiaryAfter - beneficiaryBefore).to.be.gt(0n);
    });

    it("should correctly update totalVestingAmount after revoke with earned tokens (V-1)", async () => {
      // Cliff + yarım vesting geç
      await time.increase(CLIFF_DURATION + VESTING_DURATION / 2);

      const vestingBefore = await vesting.totalVestingAmount();

      // Revoke — hem releasable hem refund ödenmeli; totalVestingAmount sıfırlanmalı
      await vesting.connect(admin).revoke(scheduleId);

      const vestingAfter = await vesting.totalVestingAmount();
      // totalVestingAmount tamamen sıfırlanmalı (bu schedule tek schedule idi)
      expect(vestingAfter).to.equal(0n);
      expect(vestingBefore).to.be.gt(0n);
    });

    it("should revert revoke on non-revocable schedule", async () => {
      const tx = await vesting.connect(admin).createSchedule(
        beneficiary2.address,
        VESTING_AMOUNT,
        0,
        CLIFF_DURATION,
        VESTING_DURATION,
        false // revocable = false
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.topics[0] === ethers.id("ScheduleCreated(bytes32,address,uint256,uint64,uint64,uint64)")
      ) as any;
      const nonRevocableId = event?.topics[1];

      await expect(
        vesting.connect(admin).revoke(nonRevocableId)
      ).to.be.revertedWithCustomError(vesting, "Vesting__NotRevocable");
    });
  });

  // ─── adminEmergencyRelease ─────────────────────────────────────────────────
  describe("adminEmergencyRelease", () => {
    let scheduleId: string;

    beforeEach(async () => {
      const tx = await vesting.connect(admin).createSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        0,
        CLIFF_DURATION,
        VESTING_DURATION,
        true
      );
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log: any) => log.topics[0] === ethers.id("ScheduleCreated(bytes32,address,uint256,uint64,uint64,uint64)")
      ) as any;
      scheduleId = event?.topics[1];
    });

    it("should release vested tokens to alternate destination after cliff", async () => {
      await time.increase(CLIFF_DURATION + VESTING_DURATION / 2);
      const balBefore = await token.balanceOf(beneficiary2.address);
      const tx = await vesting.connect(admin).adminEmergencyRelease(scheduleId, beneficiary2.address);
      const receipt = await tx.wait();
      // Read actual released amount from event rather than pre-tx estimate (avoids timestamp skew)
      const event = receipt?.logs.find(
        (log: any) => log.topics[0] === ethers.id("EmergencyReleased(bytes32,address,uint256)")
      ) as any;
      const released = BigInt(event?.data ?? 0n);
      expect(released).to.be.gt(0n);
      expect(await token.balanceOf(beneficiary2.address)).to.equal(balBefore + released);
    });

    it("should emit EmergencyReleased event", async () => {
      await time.increase(CLIFF_DURATION);
      await expect(
        vesting.connect(admin).adminEmergencyRelease(scheduleId, beneficiary2.address)
      ).to.emit(vesting, "EmergencyReleased");
    });

    it("should decrement totalVestingAmount", async () => {
      await time.increase(CLIFF_DURATION + VESTING_DURATION / 4);
      const before = await vesting.totalVestingAmount();
      await vesting.connect(admin).adminEmergencyRelease(scheduleId, beneficiary2.address);
      const after = await vesting.totalVestingAmount();
      expect(after).to.be.lt(before);
    });

    it("should revert before cliff (nothing vested)", async () => {
      await expect(
        vesting.connect(admin).adminEmergencyRelease(scheduleId, beneficiary2.address)
      ).to.be.revertedWithCustomError(vesting, "Vesting__NothingToRelease");
    });

    it("should revert when destination is zero address", async () => {
      await time.increase(CLIFF_DURATION);
      await expect(
        vesting.connect(admin).adminEmergencyRelease(scheduleId, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(vesting, "Vesting__ZeroAddress");
    });

    it("should revert on non-existent schedule", async () => {
      await expect(
        vesting.connect(admin).adminEmergencyRelease(ethers.ZeroHash, beneficiary2.address)
      ).to.be.revertedWithCustomError(vesting, "Vesting__ScheduleNotFound");
    });

    it("should revert on revoked schedule", async () => {
      await time.increase(CLIFF_DURATION);
      await vesting.connect(admin).revoke(scheduleId);
      await expect(
        vesting.connect(admin).adminEmergencyRelease(scheduleId, beneficiary2.address)
      ).to.be.revertedWithCustomError(vesting, "Vesting__AlreadyRevoked");
    });

    it("should revert when called by non-admin", async () => {
      await time.increase(CLIFF_DURATION);
      await expect(
        vesting.connect(beneficiary1).adminEmergencyRelease(scheduleId, beneficiary2.address)
      ).to.be.reverted;
    });
  });

  // ─── withdrawExcess ────────────────────────────────────────────────────────
  describe("withdrawExcess", () => {
    it("should withdraw tokens not committed to any schedule", async () => {
      // vesting contract has 3x VESTING_AMOUNT minted; only 0 committed to schedules
      const excess = await token.balanceOf(await vesting.getAddress());
      const balBefore = await token.balanceOf(beneficiary2.address);
      await vesting.connect(admin).withdrawExcess(beneficiary2.address);
      expect(await token.balanceOf(beneficiary2.address)).to.equal(balBefore + excess);
    });

    it("should only withdraw amount beyond totalVestingAmount", async () => {
      // commit 1x VESTING_AMOUNT to a schedule
      await vesting.connect(admin).createSchedule(
        beneficiary1.address, VESTING_AMOUNT, 0, CLIFF_DURATION, VESTING_DURATION, true
      );
      const totalCommitted = await vesting.totalVestingAmount();
      const contractBal    = await token.balanceOf(await vesting.getAddress());
      const expectedExcess = contractBal - totalCommitted;

      const balBefore = await token.balanceOf(beneficiary2.address);
      await vesting.connect(admin).withdrawExcess(beneficiary2.address);
      expect(await token.balanceOf(beneficiary2.address)).to.equal(balBefore + expectedExcess);
    });

    it("should emit ExcessWithdrawn event", async () => {
      const excess = await token.balanceOf(await vesting.getAddress());
      await expect(
        vesting.connect(admin).withdrawExcess(beneficiary2.address)
      ).to.emit(vesting, "ExcessWithdrawn")
        .withArgs(beneficiary2.address, excess);
    });

    it("should revert when no excess tokens", async () => {
      // commit all minted tokens to schedules
      await vesting.connect(admin).createSchedule(
        beneficiary1.address, VESTING_AMOUNT * 3n, 0, CLIFF_DURATION, VESTING_DURATION, true
      );
      await expect(
        vesting.connect(admin).withdrawExcess(beneficiary2.address)
      ).to.be.revertedWithCustomError(vesting, "Vesting__NoExcess");
    });

    it("should revert with zero address destination", async () => {
      await expect(
        vesting.connect(admin).withdrawExcess(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(vesting, "Vesting__ZeroAddress");
    });

    it("should revert when called by non-admin", async () => {
      await expect(
        vesting.connect(beneficiary1).withdrawExcess(beneficiary2.address)
      ).to.be.reverted;
    });
  });
});
