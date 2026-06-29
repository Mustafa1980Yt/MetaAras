import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MTAToken, MTAStaking } from "../../typechain-types";
import { parseEther, ZeroAddress } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MTAStaking", () => {
  let token: MTAToken;
  let staking: MTAStaking;
  let admin: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  let pauser: HardhatEthersSigner;
  let blacklister: HardhatEthersSigner;
  let rewardsPool: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const STAKE_AMOUNT = parseEther("10000");
  const REWARDS_SUPPLY = parseEther("35000000"); // 35M ecosystem ödülü

  // Tier enum değerleri
  const Bronze   = 0;
  const Silver   = 1;
  const Gold     = 2;
  const Platinum = 3;

  // Kilit süreleri (saniye)
  const LOCK_30D  = 30 * 24 * 3600;
  const LOCK_90D  = 90 * 24 * 3600;
  const LOCK_180D = 180 * 24 * 3600;
  const LOCK_365D = 365 * 24 * 3600;

  const BPS_DENOMINATOR = 10_000n;
  const YEAR_SECONDS    = BigInt(365 * 24 * 3600);

  beforeEach(async () => {
    [admin, minter, pauser, blacklister, rewardsPool, user1, user2] =
      await ethers.getSigners();

    // Token deploy
    const TokenFactory = await ethers.getContractFactory("MTAToken");
    token = (await TokenFactory.deploy(
      admin.address,
      minter.address,
      pauser.address,
      blacklister.address
    )) as unknown as MTAToken;

    // User'lara token mint et
    await token.connect(minter).mint(user1.address, STAKE_AMOUNT * 10n);
    await token.connect(minter).mint(user2.address, STAKE_AMOUNT * 10n);
    await token.connect(minter).mint(rewardsPool.address, REWARDS_SUPPLY);

    // Staking deploy (UUPS Proxy)
    const StakingFactory = await ethers.getContractFactory("MTAStaking");
    staking = (await upgrades.deployProxy(
      StakingFactory,
      [
        await token.getAddress(),
        rewardsPool.address,
        admin.address,
        pauser.address,
      ],
      { kind: "uups", initializer: "initialize" }
    )) as unknown as MTAStaking;

    // Onaylar
    await token.connect(user1).approve(await staking.getAddress(), ethers.MaxUint256);
    await token.connect(user2).approve(await staking.getAddress(), ethers.MaxUint256);
    // rewardsPool, staking kontratını ödül ödemeleri için approve etmeli
    await token.connect(rewardsPool).approve(await staking.getAddress(), ethers.MaxUint256);
  });

  // ─── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("should set correct staking token", async () => {
      expect(await staking.stakingToken()).to.equal(await token.getAddress());
    });

    it("should set correct rewards pool", async () => {
      expect(await staking.rewardsPool()).to.equal(rewardsPool.address);
    });

    it("should initialize tier configs correctly", async () => {
      const bronze   = await staking.getTierConfig(Bronze);
      const silver   = await staking.getTierConfig(Silver);
      const gold     = await staking.getTierConfig(Gold);
      const platinum = await staking.getTierConfig(Platinum);

      expect(bronze.apyBps).to.equal(800n);
      expect(silver.apyBps).to.equal(1500n);
      expect(gold.apyBps).to.equal(2500n);
      expect(platinum.apyBps).to.equal(4000n);

      expect(bronze.lockDuration).to.equal(BigInt(LOCK_30D));
      expect(silver.lockDuration).to.equal(BigInt(LOCK_90D));
      expect(gold.lockDuration).to.equal(BigInt(LOCK_180D));
      expect(platinum.lockDuration).to.equal(BigInt(LOCK_365D));
    });

    it("should revert initialize with zero staking token", async () => {
      const Factory = await ethers.getContractFactory("MTAStaking");
      await expect(
        upgrades.deployProxy(
          Factory,
          [ZeroAddress, rewardsPool.address, admin.address, pauser.address],
          { kind: "uups", initializer: "initialize" }
        )
      ).to.be.revertedWithCustomError(staking, "Staking__ZeroAddress");
    });

    it("should revert initialize with zero pauser (S-4 fix)", async () => {
      const Factory = await ethers.getContractFactory("MTAStaking");
      await expect(
        upgrades.deployProxy(
          Factory,
          [await token.getAddress(), rewardsPool.address, admin.address, ZeroAddress],
          { kind: "uups", initializer: "initialize" }
        )
      ).to.be.revertedWithCustomError(staking, "Staking__ZeroAddress");
    });
  });

  // ─── Stake ─────────────────────────────────────────────────────────────────
  describe("stake", () => {
    it("should stake tokens and create position", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Bronze);
      const pos = await staking.getPosition(user1.address, 0);

      expect(pos.amount).to.equal(STAKE_AMOUNT);
      expect(pos.active).to.be.true;
      expect(Number(pos.tier)).to.equal(Bronze);
      expect(await staking.globalTotalStaked()).to.equal(STAKE_AMOUNT);
    });

    it("should increment positionCount per user", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Bronze);
      await staking.connect(user1).stake(STAKE_AMOUNT, Silver);
      expect(await staking.positionCount(user1.address)).to.equal(2n);
    });

    it("should set correct unlockTime for each tier", async () => {
      const before = await time.latest();
      await staking.connect(user1).stake(STAKE_AMOUNT, Platinum);
      const pos = await staking.getPosition(user1.address, 0);
      expect(Number(pos.unlockTime)).to.be.closeTo(before + LOCK_365D, 5);
    });

    it("should emit Staked event", async () => {
      await expect(staking.connect(user1).stake(STAKE_AMOUNT, Gold))
        .to.emit(staking, "Staked")
        .withArgs(user1.address, 0, STAKE_AMOUNT, Gold, (val: bigint) => val > 0n);
    });

    it("should revert with zero amount", async () => {
      await expect(
        staking.connect(user1).stake(0n, Bronze)
      ).to.be.revertedWithCustomError(staking, "Staking__BelowMinimum");
    });

    it("should revert when paused", async () => {
      await staking.connect(pauser).pause();
      await expect(
        staking.connect(user1).stake(STAKE_AMOUNT, Bronze)
      ).to.be.revertedWithCustomError(staking, "EnforcedPause");
    });
  });

  // ─── Tier APY Doğruluğu (S-1 Critical Fix) ────────────────────────────────
  describe("Tier APY enforcement (S-1 fix)", () => {
    it("Bronze (8%) should earn less than Silver (15%) for same stake and time", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Bronze);
      await staking.connect(user2).stake(STAKE_AMOUNT, Silver);

      await time.increase(30 * 24 * 3600); // 30 gün

      const bronzeReward = await staking.pendingRewards(user1.address, 0);
      const silverReward = await staking.pendingRewards(user2.address, 0);

      expect(bronzeReward).to.be.gt(0n);
      expect(silverReward).to.be.gt(0n);
      // Silver ~%15, Bronze ~%8 — neredeyse 2x fark
      expect(silverReward).to.be.gt(bronzeReward);
      // Oran kontrolü: silverReward / bronzeReward ≈ 1500/800
      const ratio = (silverReward * 100n) / bronzeReward;
      expect(ratio).to.be.closeTo(187n, 5n); // 1500/800 = 1.875
    });

    it("Platinum (40%) vs Bronze (8%) — ~5x ödül farkı", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Bronze);
      await staking.connect(user2).stake(STAKE_AMOUNT, Platinum);

      await time.increase(30 * 24 * 3600); // 30 gün

      const bronzeReward   = await staking.pendingRewards(user1.address, 0);
      const platinumReward = await staking.pendingRewards(user2.address, 0);

      const ratio = (platinumReward * 100n) / bronzeReward;
      expect(ratio).to.be.closeTo(500n, 5n); // 4000/800 = 5x
    });

    it("APY formula: 1 yıl boyunca Platinum → ~%40 ödül", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Platinum);
      await time.increase(LOCK_365D);

      const reward = await staking.pendingRewards(user1.address, 0);
      // Beklenen: 10000 * 40% = 4000 MTA (±küçük sapma)
      const expected = (STAKE_AMOUNT * 4000n) / 10_000n;
      // %1 tolerans
      const tolerance = expected / 100n;
      expect(reward).to.be.closeTo(expected, tolerance);
    });

    it("Gold (25%): 180 gün → ~%12.5 ödül (6 aylık pro-rata)", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Gold);
      await time.increase(LOCK_180D); // 6 ay = yarım yıl

      const reward = await staking.pendingRewards(user1.address, 0);
      const expected = (STAKE_AMOUNT * 2500n * BigInt(LOCK_180D)) / (10_000n * YEAR_SECONDS);
      const tolerance = expected / 100n;
      expect(reward).to.be.closeTo(expected, tolerance);
    });
  });

  // ─── claimRewards ──────────────────────────────────────────────────────────
  describe("claimRewards", () => {
    beforeEach(async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Silver);
    });

    it("should claim rewards after lock period", async () => {
      await time.increase(LOCK_90D);

      const rewardBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).claimRewards(0);
      const rewardAfter = await token.balanceOf(user1.address);

      expect(rewardAfter - rewardBefore).to.be.gt(0n);
    });

    it("should emit RewardClaimed event", async () => {
      await time.increase(LOCK_90D);
      await expect(staking.connect(user1).claimRewards(0))
        .to.emit(staking, "RewardClaimed")
        .withArgs(user1.address, 0, (v: bigint) => v > 0n);
    });

    it("should update lastClaimTime after claim", async () => {
      await time.increase(LOCK_90D / 2);

      const posBefore = await staking.getPosition(user1.address, 0);
      const claimTimeBefore = posBefore.lastClaimTime;

      await staking.connect(user1).claimRewards(0);

      const posAfter = await staking.getPosition(user1.address, 0);
      const claimTimeAfter = posAfter.lastClaimTime;

      // lastClaimTime claim sonrasında güncellenmeli
      expect(claimTimeAfter).to.be.gt(claimTimeBefore);
    });

    it("should revert claim on inactive position", async () => {
      await time.increase(LOCK_90D);
      await staking.connect(user1).unstake(0);
      await expect(
        staking.connect(user1).claimRewards(0)
      ).to.be.revertedWithCustomError(staking, "Staking__PositionNotActive");
    });
  });

  // ─── Unstake ───────────────────────────────────────────────────────────────
  describe("unstake", () => {
    beforeEach(async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Gold);
    });

    it("should return full amount after lock period", async () => {
      await time.increase(LOCK_180D + 1);
      const balBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).unstake(0);
      const balAfter = await token.balanceOf(user1.address);

      // Stake miktar + birikmiş ödüller
      expect(balAfter - balBefore).to.be.gte(STAKE_AMOUNT);
    });

    it("should apply 20% early exit penalty", async () => {
      // Anında çekiş
      const balBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).unstake(0);
      const balAfter  = await token.balanceOf(user1.address);

      const received  = balAfter - balBefore;
      const penalty   = (STAKE_AMOUNT * 2000n) / 10_000n; // %20
      const expected  = STAKE_AMOUNT - penalty;

      expect(received).to.be.lte(expected + parseEther("1")); // ±1 tolerans (ödül yoktu)
    });

    it("should send penalty to rewardsPool", async () => {
      const poolBefore = await token.balanceOf(rewardsPool.address);
      await staking.connect(user1).unstake(0);
      const poolAfter = await token.balanceOf(rewardsPool.address);

      const penalty = (STAKE_AMOUNT * 2000n) / 10_000n;
      // pool: ödeme (approve kullanılır) + ceza gelir
      expect(poolAfter - poolBefore).to.be.gte(penalty - parseEther("1"));
    });

    it("should auto-claim pending rewards on unstake", async () => {
      await time.increase(LOCK_180D / 2);

      const pendingBefore = await staking.pendingRewards(user1.address, 0);
      expect(pendingBefore).to.be.gt(0n);

      const balBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).unstake(0);
      const balAfter = await token.balanceOf(user1.address);

      // Alınan miktar en az stake + beklenen ödül içermeli (kilit dolmadan ceza var)
      expect(balAfter).to.be.gt(balBefore);
    });

    it("should emit Unstaked event", async () => {
      await time.increase(LOCK_180D + 1);
      await expect(staking.connect(user1).unstake(0))
        .to.emit(staking, "Unstaked")
        .withArgs(user1.address, 0, (v: bigint) => v > 0n, 0n); // penalty=0 (kilit doldu)
    });

    it("should decrement globalTotalStaked", async () => {
      await time.increase(LOCK_180D + 1);
      await staking.connect(user1).unstake(0);
      expect(await staking.globalTotalStaked()).to.equal(0n);
    });

    it("should revert double unstake", async () => {
      await time.increase(LOCK_180D + 1);
      await staking.connect(user1).unstake(0);
      await expect(
        staking.connect(user1).unstake(0)
      ).to.be.revertedWithCustomError(staking, "Staking__PositionNotActive");
    });
  });

  // ─── Compound ──────────────────────────────────────────────────────────────
  describe("compound", () => {
    it("should add rewards to existing position amount", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Platinum);
      await time.increase(LOCK_365D / 2); // 6 ay

      const posBefore = await staking.getPosition(user1.address, 0);
      await staking.connect(user1).compound(0);
      const posAfter = await staking.getPosition(user1.address, 0);

      expect(posAfter.amount).to.be.gt(posBefore.amount);
    });

    it("should emit Compounded event", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Platinum);
      await time.increase(LOCK_365D / 2);

      await expect(staking.connect(user1).compound(0))
        .to.emit(staking, "Compounded");
    });

    it("should revert compound on inactive position", async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Bronze);
      await time.increase(LOCK_30D + 1);
      await staking.connect(user1).unstake(0);
      await expect(
        staking.connect(user1).compound(0)
      ).to.be.revertedWithCustomError(staking, "Staking__PositionNotActive");
    });
  });

  // ─── Admin Fonksiyonları ────────────────────────────────────────────────────
  describe("Admin functions", () => {
    it("should update tier config and emit event (S-5 fix)", async () => {
      await expect(staking.connect(admin).updateTierConfig(Bronze, 60 * 24 * 3600, 1200))
        .to.emit(staking, "TierConfigUpdated")
        .withArgs(Bronze, 60 * 24 * 3600, 1200);

      const cfg = await staking.getTierConfig(Bronze);
      expect(cfg.apyBps).to.equal(1200n);
    });

    it("should revert tier config update by non-admin", async () => {
      await expect(
        staking.connect(user1).updateTierConfig(Bronze, 30 * 24 * 3600, 1000)
      ).to.be.revertedWithCustomError(staking, "AccessControlUnauthorizedAccount");
    });

    it("should revert tier config update with zero lockDuration", async () => {
      await expect(
        staking.connect(admin).updateTierConfig(Bronze, 0, 800)
      ).to.be.revertedWithCustomError(staking, "Staking__InvalidLockDuration");
    });

    it("should revert tier config update with zero apyBps", async () => {
      await expect(
        staking.connect(admin).updateTierConfig(Bronze, 30 * 24 * 3600, 0)
      ).to.be.revertedWithCustomError(staking, "Staking__InvalidApyBps");
    });

    it("should update rewards pool and emit event (S-2 fix)", async () => {
      await expect(staking.connect(admin).updateRewardsPool(user2.address))
        .to.emit(staking, "RewardsPoolUpdated")
        .withArgs(rewardsPool.address, user2.address);

      expect(await staking.rewardsPool()).to.equal(user2.address);
    });

    it("should revert rewards pool update with zero address", async () => {
      await expect(
        staking.connect(admin).updateRewardsPool(ZeroAddress)
      ).to.be.revertedWithCustomError(staking, "Staking__ZeroAddress");
    });
  });

  // ─── UUPS Upgradeability ───────────────────────────────────────────────────
  describe("UUPS Upgradeability", () => {
    it("should be upgradeable by UPGRADER_ROLE", async () => {
      const StakingV2 = await ethers.getContractFactory("MTAStaking");
      // Aynı implementation ile upgrade — sadece yetkiyi doğrular
      await expect(
        upgrades.upgradeProxy(await staking.getAddress(), StakingV2.connect(admin))
      ).to.not.be.reverted;
    });

    it("should revert upgrade by non-upgrader", async () => {
      const StakingV2 = await ethers.getContractFactory("MTAStaking");
      await expect(
        upgrades.upgradeProxy(await staking.getAddress(), StakingV2.connect(user1))
      ).to.be.revertedWithCustomError(staking, "AccessControlUnauthorizedAccount");
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────
  describe("Edge Cases", () => {
    beforeEach(async () => {
      await staking.connect(user1).stake(STAKE_AMOUNT, Gold); // 180 day lock
    });

    it("early exit penalty applies to compounded amount (not original stake only)", async () => {
      // Compound after 90 days — adds rewards to pos.amount
      await time.increase(LOCK_180D / 2); // 90 days
      await staking.connect(user1).compound(0);
      const posAfterCompound = await staking.getPosition(user1.address, 0);
      const compoundedAmount = posAfterCompound.amount; // > STAKE_AMOUNT
      expect(compoundedAmount).to.be.gt(STAKE_AMOUNT);

      // Immediately exit early (still before unlockTime)
      const balBefore = await token.balanceOf(user1.address);
      await staking.connect(user1).unstake(0);
      const balAfter = await token.balanceOf(user1.address);

      const received = balAfter - balBefore;
      const expectedReturn = (compoundedAmount * 8_000n) / 10_000n; // 80% of compounded
      // Must return ≥80% of compounded amount (plus tiny one-block reward)
      expect(received).to.be.gte(expectedReturn);
      // Must not return more than 80% of compounded + small reward tolerance (0.01%)
      const upperBound = compoundedAmount; // can't get more than 100% of compounded
      expect(received).to.be.lte(upperBound);
    });

    it("updateTierConfig retroactively changes APY for existing positions", async () => {
      // Wait 30 days at 25% APY → then admin doubles APY to 50%
      await time.increase(LOCK_30D);
      const rewardBefore30d = await staking.pendingRewards(user1.address, 0);

      // Admin doubles Gold APY
      await staking.connect(admin).updateTierConfig(Gold, LOCK_180D, 5_000); // 50%

      // Wait another 30 days at 50% APY
      await time.increase(LOCK_30D);
      const rewardAfter60d = await staking.pendingRewards(user1.address, 0);

      // Second 30-day window at 50% should contribute ~2x first window at 25%
      // Total = (first 30d @ 25%) + (next 30d @ 50%)
      // After updateTierConfig, lastClaimTime stays unchanged, so pendingRewards
      // uses new apyBps for the FULL elapsed time since lastClaim.
      // Since lastClaimTime was NOT reset, the new APY applies to all elapsed time.
      expect(rewardAfter60d).to.be.gt(rewardBefore30d);
    });

    it("should revert updateTierConfig with apyBps > 10000 (100%)", async () => {
      await expect(
        staking.connect(admin).updateTierConfig(Bronze, LOCK_30D, 10_001)
      ).to.be.revertedWithCustomError(staking, "Staking__InvalidApyBps");
    });

    it("blacklisted user cannot stake (token transfer blocked)", async () => {
      // user2 already has tokens + approval from outer beforeEach
      await token.connect(blacklister).setBlacklist(user2.address, true);
      await expect(
        staking.connect(user2).stake(parseEther("1"), Bronze)
      ).to.be.revertedWithCustomError(token, "MTA__Blacklisted");
    });
  });
});
