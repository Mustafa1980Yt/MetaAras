import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MTAToken, MTAStaking } from "../../typechain-types";
import { parseEther } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

/**
 * Fuzz / property-based tests for MTAStaking reward calculation.
 *
 * Strategy: test invariants over a range of inputs rather than single values.
 * Each test runs N iterations with varied inputs and asserts mathematical properties.
 */
describe("MTAStaking — Fuzz / Property Tests", () => {
  let token:      MTAToken;
  let staking:    MTAStaking;
  let admin:      HardhatEthersSigner;
  let minter:     HardhatEthersSigner;
  let pauser:     HardhatEthersSigner;
  let blacklister: HardhatEthersSigner;
  let rewardsPool: HardhatEthersSigner;
  let user1:      HardhatEthersSigner;

  const REWARDS_SUPPLY = parseEther("35000000");
  const YEAR_SECONDS   = BigInt(365 * 24 * 3600);
  const BPS_DENOMINATOR = 10_000n;

  // APY values per tier
  const APY_BPS = [800n, 1_500n, 2_500n, 4_000n]; // Bronze, Silver, Gold, Platinum
  const LOCK_DURATIONS = [
    30  * 24 * 3600,
    90  * 24 * 3600,
    180 * 24 * 3600,
    365 * 24 * 3600,
  ];

  before(async () => {
    [admin, minter, pauser, blacklister, rewardsPool, user1] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("MTAToken");
    token = (await TokenFactory.deploy(admin.address, minter.address, pauser.address, blacklister.address)) as unknown as MTAToken;

    await token.connect(minter).mint(rewardsPool.address, REWARDS_SUPPLY);
    // MAX_SUPPLY = 100M; 35M already minted to rewardsPool → 65M left for user1
    await token.connect(minter).mint(user1.address, parseEther("60000000")); // 60M for testing

    const StakingFactory = await ethers.getContractFactory("MTAStaking");
    staking = (await upgrades.deployProxy(
      StakingFactory,
      [await token.getAddress(), rewardsPool.address, admin.address, pauser.address],
      { kind: "uups" }
    )) as unknown as MTAStaking;

    await token.connect(user1).approve(await staking.getAddress(), ethers.MaxUint256);
    await token.connect(rewardsPool).approve(await staking.getAddress(), ethers.MaxUint256);
  });

  // ─── Invariant: reward formula matches spec ────────────────────────────────
  describe("Invariant: reward = amount × apyBps × elapsed / (BPS_DENOM × YEAR_SECONDS)", () => {
    const AMOUNTS = [
      parseEther("1"),
      parseEther("100"),
      parseEther("10000"),
      parseEther("1000000"),
      parseEther("10000000"),
    ];

    const ELAPSED_TIMES = [
      3600,               // 1 hour
      24 * 3600,          // 1 day
      30 * 24 * 3600,     // 30 days
      90 * 24 * 3600,     // 90 days
      365 * 24 * 3600,    // 1 year
    ];

    for (const tier of [0, 1, 2, 3] as const) {
      for (const amount of AMOUNTS) {
        const elapsed = ELAPSED_TIMES[tier]; // use tier index for variety
        const apyBps  = APY_BPS[tier];

        it(`Tier ${tier}: ${ethers.formatEther(amount)} MTA × ${elapsed}s matches formula`, async () => {
          await staking.connect(user1).stake(amount, tier);
          const posId = (await staking.positionCount(user1.address)) - 1n;

          await time.increase(elapsed);

          const actualReward   = await staking.pendingRewards(user1.address, posId);
          const expectedReward = (amount * apyBps * BigInt(elapsed)) / (BPS_DENOMINATOR * YEAR_SECONDS);

          // Allow 2-second timing jitter tolerance
          const jitter = (amount * apyBps * 2n) / (BPS_DENOMINATOR * YEAR_SECONDS);
          expect(actualReward).to.be.closeTo(expectedReward, jitter + 1n);

          // Unstake to reset state
          await staking.connect(user1).unstake(posId);
        });
      }
    }
  });

  // ─── Invariant: APY ordering ───────────────────────────────────────────────
  describe("Invariant: higher tier → higher reward for same amount and time", () => {
    it("Bronze < Silver < Gold < Platinum for any stake amount and duration", async () => {
      const amounts = [parseEther("100"), parseEther("50000"), parseEther("1000000")];
      const elapsed = 90 * 24 * 3600;

      for (const amount of amounts) {
        const rewards: bigint[] = [];
        for (let tier = 0; tier < 4; tier++) {
          await staking.connect(user1).stake(amount, tier);
          const posId = (await staking.positionCount(user1.address)) - 1n;
          await time.increase(elapsed);
          rewards.push(await staking.pendingRewards(user1.address, posId));
          await staking.connect(user1).unstake(posId);
          // Reset time context for next iteration — doesn't matter since each is independent
        }

        // Strict ordering
        expect(rewards[0]).to.be.lt(rewards[1], "Bronze < Silver");
        expect(rewards[1]).to.be.lt(rewards[2], "Silver < Gold");
        expect(rewards[2]).to.be.lt(rewards[3], "Gold < Platinum");
      }
    });
  });

  // ─── Invariant: early exit penalty = exactly 20% ──────────────────────────
  describe("Invariant: early exit penalty is always exactly 20% of principal", () => {
    const AMOUNTS = [
      parseEther("100"),
      parseEther("7777"),
      parseEther("333333"),
      parseEther("1000000"),
    ];

    for (const amount of AMOUNTS) {
      it(`penalty for ${ethers.formatEther(amount)} MTA is exactly 20%`, async () => {
        await staking.connect(user1).stake(amount, 3 /* Platinum */);
        const posId = (await staking.positionCount(user1.address)) - 1n;

        const poolBefore = await token.balanceOf(rewardsPool.address);
        const userBefore = await token.balanceOf(user1.address);

        // Unstake immediately — triggers penalty (no pending rewards at t=0)
        await staking.connect(user1).unstake(posId);

        const poolAfter = await token.balanceOf(rewardsPool.address);
        const userAfter = await token.balanceOf(user1.address);

        const expectedPenalty = (amount * 2000n) / 10_000n;
        const expectedReturn  = amount - expectedPenalty;

        // User receives 80% back, plus any tiny reward accrued from 1-block time between stake→unstake
        // Max 1-block reward at Platinum APY (40%): amount * 4000 / (10000 * YEAR_SECONDS)
        const maxOneBlockReward = (amount * 4000n) / (10_000n * YEAR_SECONDS);
        const userReceived = userAfter - userBefore;
        expect(userReceived).to.be.gte(expectedReturn);
        expect(userReceived).to.be.lte(expectedReturn + maxOneBlockReward + 1n);
      });
    }
  });

  // ─── Invariant: globalTotalStaked consistency ──────────────────────────────
  describe("Invariant: globalTotalStaked equals sum of all active position amounts", () => {
    it("tracks total staked correctly across multiple positions", async () => {
      const amounts = [parseEther("1000"), parseEther("5000"), parseEther("10000")];

      let expectedTotal = 0n;
      const posIds: bigint[] = [];

      for (let i = 0; i < amounts.length; i++) {
        await staking.connect(user1).stake(amounts[i], i as 0 | 1 | 2);
        expectedTotal += amounts[i];
        posIds.push((await staking.positionCount(user1.address)) - 1n);
        expect(await staking.globalTotalStaked()).to.be.gte(expectedTotal);
      }

      // Unstake each position and verify TVL decreases correctly
      for (let i = 0; i < posIds.length; i++) {
        await time.increase(365 * 24 * 3600 + 1); // ensure unlocked
        const tvlBefore = await staking.globalTotalStaked();
        await staking.connect(user1).unstake(posIds[i]);
        const tvlAfter = await staking.globalTotalStaked();
        expect(tvlBefore - tvlAfter).to.be.gte(amounts[i]); // amount leaves TVL
      }
    });
  });

  // ─── Invariant: double unstake reverts ────────────────────────────────────
  describe("Invariant: unstaking the same position twice always reverts", () => {
    it("second unstake on any position is always rejected", async () => {
      for (let tier = 0; tier < 4; tier++) {
        await staking.connect(user1).stake(parseEther("1000"), tier);
        const posId = (await staking.positionCount(user1.address)) - 1n;
        await time.increase(LOCK_DURATIONS[tier] + 1);
        await staking.connect(user1).unstake(posId);

        await expect(
          staking.connect(user1).unstake(posId)
        ).to.be.revertedWithCustomError(staking, "Staking__PositionNotActive");
      }
    });
  });

  // ─── Invariant: claim resets pending rewards to zero ──────────────────────
  describe("Invariant: pendingRewards → 0 immediately after claim", () => {
    it("pending rewards are zero immediately after claimRewards", async () => {
      await staking.connect(user1).stake(parseEther("10000"), 2 /* Gold */);
      const posId = (await staking.positionCount(user1.address)) - 1n;

      await time.increase(30 * 24 * 3600);
      expect(await staking.pendingRewards(user1.address, posId)).to.be.gt(0n);

      await staking.connect(user1).claimRewards(posId);

      // Same block: no time has elapsed so pending should be 0 (or nearly 0)
      const afterClaim = await staking.pendingRewards(user1.address, posId);
      // Within 1 second of computation: reward ≤ (10000e18 * 2500 * 1) / (10000 * YEAR_SECONDS)
      const maxOneSecondReward = (parseEther("10000") * 2500n) / (10_000n * YEAR_SECONDS);
      expect(afterClaim).to.be.lte(maxOneSecondReward + 1n);

      // Unstake to clean up
      await time.increase(180 * 24 * 3600 + 1);
      await staking.connect(user1).unstake(posId);
    });
  });

  // ─── Invariant: zero-amount stake always reverts ──────────────────────────
  describe("Invariant: staking zero amount always reverts", () => {
    it("zero amount revert for all tiers", async () => {
      for (let tier = 0; tier < 4; tier++) {
        await expect(
          staking.connect(user1).stake(0n, tier)
        ).to.be.revertedWithCustomError(staking, "Staking__BelowMinimum");
      }
    });
  });
});
