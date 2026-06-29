import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

/**
 * MetaAras tam deployment modülü.
 *
 * Deployment sırası:
 *  1. MTATimelock       (governance gecikmesi)
 *  2. MTAToken          (ana token)
 *  3. MTAVesting        (vesting programları)
 *  4. MTAGovernor       (DAO)
 *  5. MTAStaking Proxy  (UUPS proxy)
 *  6. Token dağılımı
 *  7. Timelock rolleri
 */
const MTADeployModule = buildModule("MTADeploy", (m) => {
  // ─── Parametreler (env veya default) ───────────────────────────────────────
  const deployer = m.getAccount(0);

  const multisigAddress = m.getParameter("multisig", deployer);
  const teamWallet      = m.getParameter("teamWallet", deployer);
  const seedWallet      = m.getParameter("seedWallet", deployer);
  const treasuryWallet  = m.getParameter("treasuryWallet", deployer);
  const ecosystemWallet = m.getParameter("ecosystemWallet", deployer);
  const liquidityWallet = m.getParameter("liquidityWallet", deployer);
  const publicSaleWallet = m.getParameter("publicSaleWallet", deployer);

  // ─── Tokenomics ────────────────────────────────────────────────────────────
  // Toplam: 100.000.000 MTA
  const ECOSYSTEM_AMOUNT   = parseEther("35000000");  // %35
  const LIQUIDITY_AMOUNT   = parseEther("20000000");  // %20
  const TEAM_AMOUNT        = parseEther("15000000");  // %15
  const TREASURY_AMOUNT    = parseEther("15000000");  // %15
  const SEED_AMOUNT        = parseEther("10000000");  // %10
  const PUBLIC_SALE_AMOUNT = parseEther("5000000");   //  %5

  // ─── 1. Timelock ───────────────────────────────────────────────────────────
  const timelock = m.contract("MTATimelock", [
    [],          // proposers — Governor deploy sonrası eklenir
    [],          // executors — Governor deploy sonrası eklenir
    deployer,    // admin — deploy sonrası renounce edilir
  ]);

  // ─── 2. Token ──────────────────────────────────────────────────────────────
  const token = m.contract("MTAToken", [
    deployer,        // admin (geçici — sonra Timelock'a devredilir)
    deployer,        // minter (geçici — dağılım sonrası revoke)
    multisigAddress, // pauser
    multisigAddress, // blacklister
  ]);

  // ─── 3. Vesting ────────────────────────────────────────────────────────────
  const vesting = m.contract("MTAVesting", [
    token,
    treasuryWallet,
    deployer,
  ]);

  // ─── 4. Governor ───────────────────────────────────────────────────────────
  const governor = m.contract("MTAGovernor", [token, timelock]);

  // ─── 5. Token dağılımı ─────────────────────────────────────────────────────
  // Ekosistem & Ödüller — doğrudan cüzdana
  m.call(token, "mint", [ecosystemWallet, ECOSYSTEM_AMOUNT], {
    id: "mint_ecosystem",
  });

  // Likidite — doğrudan cüzdana
  m.call(token, "mint", [liquidityWallet, LIQUIDITY_AMOUNT], {
    id: "mint_liquidity",
  });

  // Hazine — doğrudan cüzdana
  m.call(token, "mint", [treasuryWallet, TREASURY_AMOUNT], {
    id: "mint_treasury",
  });

  // Public Sale — doğrudan cüzdana
  m.call(token, "mint", [publicSaleWallet, PUBLIC_SALE_AMOUNT], {
    id: "mint_public_sale",
  });

  // Takım & Seed — Vesting kontratına
  m.call(token, "mint", [vesting, TEAM_AMOUNT + SEED_AMOUNT], {
    id: "mint_vesting",
    after: [vesting],
  });

  // ─── 6. Mint kalıcı olarak kilitle ─────────────────────────────────────────
  m.call(token, "revokeMinter", [], {
    id: "revoke_minter",
    after: [
      "mint_ecosystem",
      "mint_liquidity",
      "mint_treasury",
      "mint_public_sale",
      "mint_vesting",
    ],
  });

  return { token, vesting, governor, timelock };
});

export default MTADeployModule;
