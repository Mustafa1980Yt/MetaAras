import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { MTAToken, MTAGovernor, MTATimelock } from "../../typechain-types";
import { parseEther, ZeroAddress } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("MTAGovernor", () => {
  let token: MTAToken;
  let timelock: MTATimelock;
  let governor: MTAGovernor;

  let admin: HardhatEthersSigner;
  let minter: HardhatEthersSigner;
  let pauser: HardhatEthersSigner;
  let blacklister: HardhatEthersSigner;
  let proposer: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;

  // Governance params — MTAToken uses EIP-6372 timestamp clock (mode=timestamp)
  // so votingDelay / votingPeriod are in SECONDS, not blocks.
  const VOTING_DELAY   = 86_400n;            // 1 day in seconds
  const VOTING_PERIOD  = 604_800n;           // 7 days in seconds
  const QUORUM_PCT     = 4n;
  const TIMELOCK_DELAY = 48n * 3600n;        // 48h in seconds (MTATimelock.MIN_DELAY)
  const PROPOSAL_THRESHOLD = parseEther("500000"); // 500K MTA

  beforeEach(async () => {
    [admin, minter, pauser, blacklister, proposer, voter1, voter2, voter3] =
      await ethers.getSigners();

    // Deploy MTAToken
    const TokenFactory = await ethers.getContractFactory("MTAToken");
    token = (await TokenFactory.deploy(
      admin.address,
      minter.address,
      pauser.address,
      blacklister.address
    )) as unknown as MTAToken;

    // Deploy MTATimelock (MIN_DELAY hardcoded to 48h in contract)
    const TimelockFactory = await ethers.getContractFactory("MTATimelock");
    timelock = (await TimelockFactory.deploy(
      [],            // proposers — granted to governor below
      [],            // executors — granted to address(0) below
      admin.address
    )) as unknown as MTATimelock;

    // Deploy MTAGovernor
    const GovFactory = await ethers.getContractFactory("MTAGovernor");
    governor = (await GovFactory.deploy(
      await token.getAddress(),
      await timelock.getAddress()
    )) as unknown as MTAGovernor;

    // Setup timelock roles
    const PROPOSER_ROLE    = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE    = await timelock.EXECUTOR_ROLE();
    const CANCELLER_ROLE   = await timelock.CANCELLER_ROLE();
    const DEFAULT_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();

    await timelock.connect(admin).grantRole(PROPOSER_ROLE,  await governor.getAddress());
    await timelock.connect(admin).grantRole(EXECUTOR_ROLE,  ZeroAddress); // anyone can execute
    await timelock.connect(admin).grantRole(CANCELLER_ROLE, await governor.getAddress());
    await timelock.connect(admin).renounceRole(DEFAULT_ADMIN_ROLE, admin.address);

    // Distribute tokens and delegate
    await token.connect(minter).mint(proposer.address, parseEther("600000"));  // 600K — above threshold
    await token.connect(minter).mint(voter1.address,   parseEther("3000000")); // 3M
    await token.connect(minter).mint(voter2.address,   parseEther("2000000")); // 2M
    await token.connect(minter).mint(voter3.address,   parseEther("1000000")); // 1M
    // voter1+voter2+voter3 = 6M — above 4% quorum on 6.6M total (quorum = 264K)

    // Self-delegate to activate voting power (checkpoint at current block.timestamp)
    await token.connect(proposer).delegate(proposer.address);
    await token.connect(voter1).delegate(voter1.address);
    await token.connect(voter2).delegate(voter2.address);
    await token.connect(voter3).delegate(voter3.address);
  });

  // ─── Deployment ─────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("should set correct token", async () => {
      expect(await governor.token()).to.equal(await token.getAddress());
    });

    it("should set correct timelock", async () => {
      expect(await governor.timelock()).to.equal(await timelock.getAddress());
    });

    it("should set correct voting delay (1 day in seconds)", async () => {
      expect(await governor.votingDelay()).to.equal(VOTING_DELAY);
    });

    it("should set correct voting period (7 days in seconds)", async () => {
      expect(await governor.votingPeriod()).to.equal(VOTING_PERIOD);
    });

    it("should set correct proposal threshold", async () => {
      expect(await governor.proposalThreshold()).to.equal(PROPOSAL_THRESHOLD);
    });

    it("should set correct quorum fraction (4%)", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(await (governor as any).quorumNumerator()).to.equal(QUORUM_PCT);
    });

    it("should use timestamp-based clock (EIP-6372)", async () => {
      const clockValue = await governor.clock();
      const latestBlock = await ethers.provider.getBlock("latest");
      // Governor.clock() should match block.timestamp (via GovernorVotes → token.clock())
      expect(clockValue).to.be.closeTo(BigInt(latestBlock!.timestamp), 5n);
    });

    it("CLOCK_MODE should return mode=timestamp", async () => {
      expect(await governor.CLOCK_MODE()).to.equal("mode=timestamp");
    });
  });

  // ─── Proposal Creation ───────────────────────────────────────────────────────
  describe("Proposal Creation", () => {
    it("should allow proposal creation above threshold", async () => {
      const calldata = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (token.interface as any).encodeFunctionData("pause", []);
      const targets   = [await token.getAddress()];
      const values    = [0n];
      const calldatas = [calldata];
      const description = "Proposal #1: Emergency pause token";

      await expect(
        governor.connect(proposer).propose(targets, values, calldatas, description)
      ).to.emit(governor, "ProposalCreated");
    });

    it("should allow proposal from address with 1M MTA (above 500K threshold)", async () => {
      const calldata = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (token.interface as any).encodeFunctionData("pause", []);
      await expect(
        governor.connect(voter3).propose(
          [await token.getAddress()], [0n], [calldata], "Proposal"
        )
      ).to.not.be.reverted;
    });

    it("should reject proposal from address with no tokens", async () => {
      const calldata = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (token.interface as any).encodeFunctionData("pause", []);
      await expect(
        governor.connect(admin).propose(
          [await token.getAddress()], [0n], [calldata], "Proposal"
        )
      ).to.be.revertedWithCustomError(governor, "GovernorInsufficientProposerVotes");
    });
  });

  // ─── Voting ──────────────────────────────────────────────────────────────────
  describe("Voting", () => {
    let proposalId: bigint;

    beforeEach(async () => {
      const calldata  = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (token.interface as any).encodeFunctionData("pause", []);
      const targets   = [await token.getAddress()];
      const values    = [0n];
      const calldatas = [calldata];
      const desc      = "Proposal: pause token";
      const tx = await governor.connect(proposer).propose(targets, values, calldatas, desc);
      const receipt = await tx.wait();
      const event = receipt?.logs.find((l) => {
        try { governor.interface.parseLog(l as any); return true; } catch { return false; }
      });
      proposalId = governor.interface.parseLog(event as any)!.args[0] as bigint;

      // Skip voting delay (SECONDS for timestamp-based clock)
      await time.increase(Number(VOTING_DELAY) + 1);
    });

    it("should allow voting FOR", async () => {
      await expect(
        governor.connect(voter1).castVote(proposalId, 1)
      ).to.emit(governor, "VoteCast");
    });

    it("should allow voting AGAINST", async () => {
      await expect(
        governor.connect(voter1).castVote(proposalId, 0)
      ).to.emit(governor, "VoteCast");
    });

    it("should allow voting ABSTAIN", async () => {
      await expect(
        governor.connect(voter1).castVote(proposalId, 2)
      ).to.emit(governor, "VoteCast");
    });

    it("should reject double voting", async () => {
      await governor.connect(voter1).castVote(proposalId, 1);
      await expect(
        governor.connect(voter1).castVote(proposalId, 1)
      ).to.be.revertedWithCustomError(governor, "GovernorAlreadyCastVote");
    });

    it("should reject voting before delay period", async () => {
      // Create a brand-new proposal (beforeEach advanced time past previous proposal's delay)
      const calldata = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (token.interface as any).encodeFunctionData("pause", []);
      const tx2 = await governor.connect(proposer).propose(
        [await token.getAddress()], [0n], [calldata], "New proposal"
      );
      const receipt2 = await tx2.wait();
      const event2 = receipt2?.logs.find((l) => {
        try { governor.interface.parseLog(l as any); return true; } catch { return false; }
      });
      const newProposalId = governor.interface.parseLog(event2 as any)!.args[0] as bigint;

      await expect(
        governor.connect(voter1).castVote(newProposalId, 1)
      ).to.be.revertedWithCustomError(governor, "GovernorUnexpectedProposalState");
    });

    it("should correctly track vote tallies", async () => {
      await governor.connect(voter1).castVote(proposalId, 1); // FOR  — 3M
      await governor.connect(voter2).castVote(proposalId, 1); // FOR  — 2M
      await governor.connect(voter3).castVote(proposalId, 0); // AGAINST — 1M

      const [against, forVotes, abstain] = await governor.proposalVotes(proposalId);
      expect(forVotes).to.equal(parseEther("5000000"));
      expect(against).to.equal(parseEther("1000000"));
      expect(abstain).to.equal(0n);
    });
  });

  // ─── Proposal State Machine ──────────────────────────────────────────────────
  describe("Proposal State Machine", () => {
    let proposalId: bigint;
    let targets: string[];
    let values: bigint[];
    let calldatas: string[];
    let descHash: `0x${string}`;

    beforeEach(async () => {
      const calldata = // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (token.interface as any).encodeFunctionData("pause", []);
      targets   = [await token.getAddress()];
      values    = [0n];
      calldatas = [calldata];
      const desc = "Proposal: pause token";
      descHash   = ethers.id(desc) as `0x${string}`;

      const tx = await governor.connect(proposer).propose(targets, values, calldatas, desc);
      const receipt = await tx.wait();
      const event = receipt?.logs.find((l) => {
        try { governor.interface.parseLog(l as any); return true; } catch { return false; }
      });
      proposalId = governor.interface.parseLog(event as any)!.args[0] as bigint;
    });

    it("Pending: proposal starts in Pending state", async () => {
      expect(await governor.state(proposalId)).to.equal(0);
    });

    it("Active: proposal moves to Active after voting delay", async () => {
      await time.increase(Number(VOTING_DELAY) + 1);
      expect(await governor.state(proposalId)).to.equal(1);
    });

    it("Defeated: proposal is Defeated when no one votes (quorum not reached)", async () => {
      await time.increase(Number(VOTING_DELAY) + 1);
      // No votes cast — quorum not reached → Defeated
      await time.increase(Number(VOTING_PERIOD) + 1);
      expect(await governor.state(proposalId)).to.equal(3); // Defeated
    });

    it("Succeeded: proposal Succeeds with quorum and FOR majority", async () => {
      await time.increase(Number(VOTING_DELAY) + 1);
      await governor.connect(voter1).castVote(proposalId, 1); // 3M FOR
      await governor.connect(voter2).castVote(proposalId, 1); // 2M FOR — total 5M > quorum
      await time.increase(Number(VOTING_PERIOD) + 1);
      expect(await governor.state(proposalId)).to.equal(4); // Succeeded
    });

    it("Queued: proposal enters Queued after successful queue call", async () => {
      await time.increase(Number(VOTING_DELAY) + 1);
      await governor.connect(voter1).castVote(proposalId, 1);
      await governor.connect(voter2).castVote(proposalId, 1);
      await time.increase(Number(VOTING_PERIOD) + 1);

      await governor.queue(targets, values, calldatas, descHash);
      expect(await governor.state(proposalId)).to.equal(5); // Queued
    });

    it("Executed: proposal attempts execution after timelock delay (fails without PAUSER_ROLE)", async () => {
      await time.increase(Number(VOTING_DELAY) + 1);
      await governor.connect(voter1).castVote(proposalId, 1);
      await governor.connect(voter2).castVote(proposalId, 1);
      await time.increase(Number(VOTING_PERIOD) + 1);

      await governor.queue(targets, values, calldatas, descHash);
      await time.increase(Number(TIMELOCK_DELAY) + 1);

      // Timelock doesn't have PAUSER_ROLE in test setup — execution expected to revert
      await expect(
        governor.execute(targets, values, calldatas, descHash)
      ).to.be.reverted;

      // Proposal state stays at 5 (Queued) since execution failed
      expect(await governor.state(proposalId)).to.equal(5);
    });
  });

  // ─── Quorum ─────────────────────────────────────────────────────────────────
  describe("Quorum", () => {
    it("should calculate quorum as 4% of supply at timestamp", async () => {
      // Total supply = 600K + 3M + 2M + 1M = 6.6M
      const totalMinted = parseEther("6600000");
      expect(await token.totalSupply()).to.equal(totalMinted);

      // With timestamp-based clock, pass a past timestamp (not block number)
      const latestBlock = await ethers.provider.getBlock("latest");
      const pastTimestamp = BigInt(latestBlock!.timestamp) - 1n;
      const quorum = await governor.quorum(pastTimestamp);
      const expectedQuorum = (totalMinted * 4n) / 100n;
      expect(quorum).to.equal(expectedQuorum);
    });
  });
});
