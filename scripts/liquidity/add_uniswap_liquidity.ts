import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Uniswap V3 — MTA/WETH Likidite Ekleme (Ethereum Mainnet)
 *
 * Senaryo: MTAToken + WETH çifti için Uniswap V3 pool oluştur
 *          ve başlangıç likiditesini ekle.
 *
 * Ön koşullar:
 *   - 02_deploy_vesting.ts çalışmış (token mint tamamlanmış)
 *   - LIQUIDITY_WALLET'ta yeterli MTA var
 *   - LIQUIDITY_WALLET'ta yeterli ETH var (pool seed + gas)
 *   - deployments/mainnet.json mevcut
 *
 * Ağ: Ethereum Mainnet
 * Kullanım: npx hardhat run scripts/liquidity/add_uniswap_liquidity.ts --network mainnet
 *
 * Uniswap V3 Ethereum Mainnet Adresleri:
 *   Factory:                   0x1F98431c8aD98523631AE4a59f267346ea31F984
 *   NonfungiblePositionManager: 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
 *   SwapRouter02:              0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45
 *   WETH:                      0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
 */

// ── Uniswap V3 Ethereum Mainnet adresleri ───────────────────────────────────
const UNISWAP_FACTORY      = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const UNISWAP_POSITION_MGR = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const WETH                 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

// Fee tier: 10000 = 1% (yeni token için uygun)
// Alternatifler: 500 (0.05%), 3000 (0.3%)
const FEE_TIER    = 10_000;
const TICK_SPACING = 200; // 1% fee tier için

// ── ABI fragmentleri ─────────────────────────────────────────────────────────
const FACTORY_ABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
  "function createPool(address tokenA, address tokenB, uint24 fee) external returns (address pool)",
];

const POOL_ABI = [
  "function initialize(uint160 sqrtPriceX96) external",
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
];

const POSITION_MGR_ABI = [
  "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

const WETH_ABI = [
  ...ERC20_ABI,
  "function deposit() external payable",
];

// ── Yardımcı fonksiyonlar ────────────────────────────────────────────────────
function computeSqrtPriceX96(price: number): bigint {
  const sqrtPrice = Math.sqrt(price);
  const Q96 = BigInt(2) ** BigInt(96);
  return BigInt(Math.floor(sqrtPrice * Number(Q96)));
}

function alignTick(tick: number, spacing: number): number {
  return Math.round(tick / spacing) * spacing;
}

// ── İlk fiyat ayarı ─────────────────────────────────────────────────────────
// BAŞLANGIÇ FİYATI: Piyasa analizine göre ayarlayın
// Örnek: 1 MTA = 0.0003 ETH (ETH = $2000 → MTA = $0.60)
const INITIAL_MTA_PRICE_IN_ETH = 0.0003; // 1 MTA kaç ETH?

// Likidite miktarları
const MTA_AMOUNT_FOR_POOL = ethers.parseEther("500000"); // 500K MTA
const ETH_AMOUNT_FOR_POOL = ethers.parseEther("150");    // 150 ETH ≈ 500K × 0.0003

// ── Ana fonksiyon ────────────────────────────────────────────────────────────
async function main() {
  if (network.name !== "mainnet") {
    throw new Error(`Bu script sadece Ethereum Mainnet için! Mevcut: ${network.name}`);
  }

  const [deployer] = await ethers.getSigners();
  const liquidityWallet = process.env.LIQUIDITY_WALLET || deployer.address;

  // Deployment dosyasını oku
  const depFile = path.join(__dirname, "../../deployments/mainnet.json");
  if (!fs.existsSync(depFile)) {
    throw new Error("deployments/mainnet.json bulunamadı. Önce deploy edin.");
  }
  const dep        = JSON.parse(fs.readFileSync(depFile, "utf-8"));
  const mtaAddress = dep.contracts.MTAToken;

  console.log("══════════════════════════════════════════════════════");
  console.log("  MetaAras — Uniswap V3 Likidite Ekleme (Ethereum)");
  console.log("══════════════════════════════════════════════════════");
  console.log(`  MTA Token   : ${mtaAddress}`);
  console.log(`  WETH        : ${WETH}`);
  console.log(`  Fee Tier    : ${FEE_TIER / 100}%`);
  console.log(`  MTA Miktarı : ${ethers.formatEther(MTA_AMOUNT_FOR_POOL)} MTA`);
  console.log(`  ETH Miktarı : ${ethers.formatEther(ETH_AMOUNT_FOR_POOL)} ETH`);
  console.log(`  İlk Fiyat   : 1 MTA = ${INITIAL_MTA_PRICE_IN_ETH} ETH`);
  console.log("──────────────────────────────────────────────────────");

  const factory = new ethers.Contract(UNISWAP_FACTORY,      FACTORY_ABI,      deployer);
  const mta     = new ethers.Contract(mtaAddress,           ERC20_ABI,        deployer);
  const weth    = new ethers.Contract(WETH,                 WETH_ABI,         deployer);

  // Bakiye kontrolleri
  const mtaBalance = await mta.balanceOf(liquidityWallet);
  const ethBalance = await ethers.provider.getBalance(liquidityWallet);
  console.log(`  MTA Bakiye  : ${ethers.formatEther(mtaBalance)} MTA`);
  console.log(`  ETH Bakiye  : ${ethers.formatEther(ethBalance)} ETH`);

  if (mtaBalance < MTA_AMOUNT_FOR_POOL) {
    throw new Error(`Yetersiz MTA! Gerekli: ${ethers.formatEther(MTA_AMOUNT_FOR_POOL)}`);
  }
  if (ethBalance < ETH_AMOUNT_FOR_POOL + ethers.parseEther("0.1")) {
    throw new Error(`Yetersiz ETH! Gerekli: ~${ethers.formatEther(ETH_AMOUNT_FOR_POOL + ethers.parseEther("0.1"))} (pool + gas)`);
  }

  // ── Adım 1: ETH → WETH wrap ───────────────────────────────────────────────
  console.log("\n[1/5] ETH → WETH wrap ediliyor...");
  await (await weth.deposit({ value: ETH_AMOUNT_FOR_POOL })).wait();
  console.log(`  ✓ ${ethers.formatEther(ETH_AMOUNT_FOR_POOL)} WETH mint edildi`);

  // ── Adım 2: Pool oluştur ──────────────────────────────────────────────────
  console.log("\n[2/5] Pool kontrol ediliyor...");
  let poolAddress = await factory.getPool(mtaAddress, WETH, FEE_TIER);

  if (poolAddress === ethers.ZeroAddress) {
    console.log("  Pool mevcut değil, oluşturuluyor...");
    await (await factory.createPool(mtaAddress, WETH, FEE_TIER)).wait();
    poolAddress = await factory.getPool(mtaAddress, WETH, FEE_TIER);
    console.log(`  ✓ Pool oluşturuldu: ${poolAddress}`);
  } else {
    console.log(`  ✓ Pool mevcut: ${poolAddress}`);
  }

  // ── Adım 3: Initialize ────────────────────────────────────────────────────
  console.log("\n[3/5] Pool initialize ediliyor...");
  const pool   = new ethers.Contract(poolAddress, POOL_ABI, deployer);
  const token0 = (await pool.token0()).toLowerCase();
  const isMtaT0 = token0 === mtaAddress.toLowerCase();

  const price       = isMtaT0 ? INITIAL_MTA_PRICE_IN_ETH : 1 / INITIAL_MTA_PRICE_IN_ETH;
  const sqrtPriceX96 = computeSqrtPriceX96(price);

  const slot0 = await pool.slot0();
  if (slot0.sqrtPriceX96 === BigInt(0)) {
    await (await pool.initialize(sqrtPriceX96)).wait();
    console.log(`  ✓ Pool initialize edildi`);
  } else {
    console.log(`  ✓ Pool zaten initialize edilmiş`);
  }

  // ── Adım 4: Approve ───────────────────────────────────────────────────────
  console.log("\n[4/5] Token onayları veriliyor...");
  const MAX = ethers.MaxUint256;
  await (await mta.approve(UNISWAP_POSITION_MGR, MAX)).wait();
  console.log("  ✓ MTA approve → PositionManager");
  await (await weth.approve(UNISWAP_POSITION_MGR, MAX)).wait();
  console.log("  ✓ WETH approve → PositionManager");

  // ── Adım 5: Likidite ekle ─────────────────────────────────────────────────
  console.log("\n[5/5] Likidite ekleniyor...");

  const MIN_TICK = alignTick(-887272, TICK_SPACING);
  const MAX_TICK = alignTick(887272,  TICK_SPACING);

  const positionMgr  = new ethers.Contract(UNISWAP_POSITION_MGR, POSITION_MGR_ABI, deployer);
  const deadline     = Math.floor(Date.now() / 1000) + 3600;

  const amount0Desired = isMtaT0 ? MTA_AMOUNT_FOR_POOL : ETH_AMOUNT_FOR_POOL;
  const amount1Desired = isMtaT0 ? ETH_AMOUNT_FOR_POOL : MTA_AMOUNT_FOR_POOL;

  const mintParams = {
    token0: isMtaT0 ? mtaAddress : WETH,
    token1: isMtaT0 ? WETH : mtaAddress,
    fee:    FEE_TIER,
    tickLower:      MIN_TICK,
    tickUpper:      MAX_TICK,
    amount0Desired,
    amount1Desired,
    amount0Min: 0n, // Slippage: production'da %2-5 minimum ekleyin
    amount1Min: 0n,
    recipient: deployer.address,
    deadline,
  };

  const mintTx  = await positionMgr.mint(mintParams);
  const receipt = await mintTx.wait();

  console.log(`  ✓ Likidite pozisyonu oluşturuldu!`);
  console.log(`  ✓ Tx Hash: ${receipt.hash}`);
  console.log(`  ✓ Pool: ${poolAddress}`);

  // Deployment kaydını güncelle
  const depData     = JSON.parse(fs.readFileSync(depFile, "utf-8"));
  depData.liquidity = {
    uniswapV3Pool: poolAddress,
    feeTier:       FEE_TIER,
    token0:        mintParams.token0,
    token1:        mintParams.token1,
    addedAt:       new Date().toISOString(),
    txHash:        receipt.hash,
  };
  fs.writeFileSync(depFile, JSON.stringify(depData, null, 2));

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  ✓ Uniswap V3 Likidite Ekleme TAMAMLANDI");
  console.log("──────────────────────────────────────────────────────");
  console.log(`  Pool           : ${poolAddress}`);
  console.log(`  MTA            : ${ethers.formatEther(MTA_AMOUNT_FOR_POOL)}`);
  console.log(`  ETH (WETH)     : ${ethers.formatEther(ETH_AMOUNT_FOR_POOL)}`);
  console.log(`  Fee Tier       : ${FEE_TIER / 100}%`);
  console.log("──────────────────────────────────────────────────────");
  console.log("  ⚠ Önemli: LP NFT'ini kilitle (team.finance veya UNCX)");
  console.log("══════════════════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
