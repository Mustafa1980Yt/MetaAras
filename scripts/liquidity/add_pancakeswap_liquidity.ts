import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * PancakeSwap V3 — MTA/WBNB Likidite Ekleme (BSC Mainnet)
 *
 * Senaryo: MTAToken + WBNB çifti için PancakeSwap V3 pool oluştur
 *          ve başlangıç likiditesini ekle.
 *
 * Ön koşullar:
 *   - 02_deploy_vesting.ts çalışmış (token mint tamamlanmış)
 *   - LIQUIDITY_WALLET'ta yeterli MTA var (20M MTA)
 *   - LIQUIDITY_WALLET'ta yeterli BNB var (pool seed + gas)
 *   - deployments/bsc.json mevcut
 *
 * Ağ: BSC Mainnet (bsc)
 * Kullanım: npx hardhat run scripts/liquidity/add_pancakeswap_liquidity.ts --network bsc
 *
 * PancakeSwap V3 BSC Mainnet Adresleri:
 *   Factory:                   0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865
 *   NonfungiblePositionManager: 0x46A15B0b27311cedF172AB29E4f4766fbE7F4364
 *   SwapRouter:                0x1b81D678ffb9C0263b24A97847620C99d213eB14
 *   WBNB:                      0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095b
 */

// ── PancakeSwap V3 BSC Mainnet adresleri ────────────────────────────────────
const PANCAKE_FACTORY       = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865";
const PANCAKE_POSITION_MGR  = "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364";
const WBNB                  = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095b";

// Fee tier: 10000 = 1% (yeni token için uygun)
// Alternatifler: 100, 500, 2500
const FEE_TIER = 10_000;
const TICK_SPACING = 200; // 1% fee tier için tick spacing = 200

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
  "function decimals() external view returns (uint8)",
];

const WBNB_ABI = [
  ...ERC20_ABI,
  "function deposit() external payable",
];

// ── Yardımcı: sqrtPriceX96 hesapla ──────────────────────────────────────────
// price: token1 cinsinden token0'ın fiyatı (token1/token0)
// sqrtPriceX96 = sqrt(price) * 2^96
function computeSqrtPriceX96(price: number): bigint {
  const sqrtPrice = Math.sqrt(price);
  const Q96 = BigInt(2) ** BigInt(96);
  return BigInt(Math.floor(sqrtPrice * Number(Q96)));
}

// ── Yardımcı: Tick'i tickSpacing'e hizala ───────────────────────────────────
function alignTick(tick: number, spacing: number): number {
  return Math.round(tick / spacing) * spacing;
}

// ── İlk fiyat hesapla ───────────────────────────────────────────────────────
// BAŞLANGIÇ FİYATI AYARI: Bu değeri piyasa analizine göre değiştirin!
// Örnek: 1 MTA = 0.001 BNB (BNB = $600 → MTA = $0.60)
const INITIAL_MTA_PRICE_IN_BNB = 0.001; // 1 MTA kaç BNB eder?

// MTA miktarı (Liquidity Wallet'tan)
const MTA_AMOUNT_FOR_POOL = ethers.parseEther("1000000"); // 1M MTA (tokenomics: 20M ayrılmış)

// BNB miktarı (INITIAL_PRICE × MTA_AMOUNT)
const BNB_AMOUNT_FOR_POOL = ethers.parseEther("1000"); // 1000 BNB ≈ MTA_AMOUNT × PRICE

// ── Ana fonksiyon ────────────────────────────────────────────────────────────
async function main() {
  if (network.name !== "bsc") {
    throw new Error(`Bu script sadece BSC Mainnet için! Mevcut: ${network.name}`);
  }

  const [deployer] = await ethers.getSigners();
  const liquidityWallet = process.env.LIQUIDITY_WALLET || deployer.address;

  // Deployment dosyasını oku
  const depFile = path.join(__dirname, "../../deployments/bsc.json");
  if (!fs.existsSync(depFile)) {
    throw new Error("deployments/bsc.json bulunamadı. Önce deploy edin.");
  }
  const dep = JSON.parse(fs.readFileSync(depFile, "utf-8"));
  const mtaAddress = dep.contracts.MTAToken;

  console.log("══════════════════════════════════════════════════════");
  console.log("  MetaAras — PancakeSwap V3 Likidite Ekleme (BSC)");
  console.log("══════════════════════════════════════════════════════");
  console.log(`  MTA Token   : ${mtaAddress}`);
  console.log(`  WBNB        : ${WBNB}`);
  console.log(`  Fee Tier    : ${FEE_TIER / 100}%`);
  console.log(`  MTA Miktarı : ${ethers.formatEther(MTA_AMOUNT_FOR_POOL)} MTA`);
  console.log(`  BNB Miktarı : ${ethers.formatEther(BNB_AMOUNT_FOR_POOL)} BNB`);
  console.log(`  İlk Fiyat   : 1 MTA = ${INITIAL_MTA_PRICE_IN_BNB} BNB`);
  console.log("──────────────────────────────────────────────────────");

  const factory = new ethers.Contract(PANCAKE_FACTORY, FACTORY_ABI, deployer);
  const mta     = new ethers.Contract(mtaAddress,       ERC20_ABI,   deployer);
  const wbnb    = new ethers.Contract(WBNB,             WBNB_ABI,    deployer);

  // Bakiye kontrolleri
  const mtaBalance = await mta.balanceOf(liquidityWallet);
  const bnbBalance = await ethers.provider.getBalance(liquidityWallet);
  console.log(`  MTA Bakiye  : ${ethers.formatEther(mtaBalance)} MTA`);
  console.log(`  BNB Bakiye  : ${ethers.formatEther(bnbBalance)} BNB`);

  if (mtaBalance < MTA_AMOUNT_FOR_POOL) {
    throw new Error(`Yetersiz MTA! Gerekli: ${ethers.formatEther(MTA_AMOUNT_FOR_POOL)}, Mevcut: ${ethers.formatEther(mtaBalance)}`);
  }
  if (bnbBalance < BNB_AMOUNT_FOR_POOL + ethers.parseEther("0.05")) {
    throw new Error(`Yetersiz BNB! Gerekli: ~${ethers.formatEther(BNB_AMOUNT_FOR_POOL + ethers.parseEther("0.05"))} (pool + gas)`);
  }

  // ── Adım 1: WBNB'ye wrap et ───────────────────────────────────────────────
  console.log("\n[1/5] BNB → WBNB wrap ediliyor...");
  const wrapTx = await wbnb.deposit({ value: BNB_AMOUNT_FOR_POOL });
  await wrapTx.wait();
  console.log(`  ✓ ${ethers.formatEther(BNB_AMOUNT_FOR_POOL)} WBNB mint edildi`);

  // ── Adım 2: Pool oluştur veya mevcut pool'u al ───────────────────────────
  console.log("\n[2/5] Pool kontrol ediliyor...");
  let poolAddress = await factory.getPool(mtaAddress, WBNB, FEE_TIER);

  if (poolAddress === ethers.ZeroAddress) {
    console.log("  Pool mevcut değil, oluşturuluyor...");
    const createTx = await factory.createPool(mtaAddress, WBNB, FEE_TIER);
    const receipt  = await createTx.wait();
    poolAddress    = await factory.getPool(mtaAddress, WBNB, FEE_TIER);
    console.log(`  ✓ Pool oluşturuldu: ${poolAddress}`);
  } else {
    console.log(`  ✓ Pool mevcut: ${poolAddress}`);
  }

  // ── Adım 3: Pool'u initialize et (henüz başlatılmamışsa) ─────────────────
  console.log("\n[3/5] Pool initialize ediliyor...");
  const pool     = new ethers.Contract(poolAddress, POOL_ABI, deployer);
  const token0   = (await pool.token0()).toLowerCase();
  const isMtaT0  = token0 === mtaAddress.toLowerCase();

  // Pool'daki sıraya göre fiyatı ayarla
  // sqrtPriceX96 token1/token0 bazında — eğer MTA token0 ise price = BNB/MTA
  let price = isMtaT0 ? INITIAL_MTA_PRICE_IN_BNB : 1 / INITIAL_MTA_PRICE_IN_BNB;
  const sqrtPriceX96 = computeSqrtPriceX96(price);

  const slot0 = await pool.slot0();
  if (slot0.sqrtPriceX96 === BigInt(0)) {
    const initTx = await pool.initialize(sqrtPriceX96);
    await initTx.wait();
    console.log(`  ✓ Pool initialize edildi (sqrtPriceX96: ${sqrtPriceX96})`);
  } else {
    console.log(`  ✓ Pool zaten initialize edilmiş (tick: ${slot0.tick})`);
  }

  // ── Adım 4: PositionManager'a approve ver ────────────────────────────────
  console.log("\n[4/5] Token onayları veriliyor...");
  const MAX = ethers.MaxUint256;

  await (await mta.approve(PANCAKE_POSITION_MGR, MAX)).wait();
  console.log("  ✓ MTA approve → PositionManager");

  await (await wbnb.approve(PANCAKE_POSITION_MGR, MAX)).wait();
  console.log("  ✓ WBNB approve → PositionManager");

  // ── Adım 5: Likidite ekle ─────────────────────────────────────────────────
  console.log("\n[5/5] Likidite ekleniyor...");

  // Geniş aralık (-887200 ile 887200 arası, tickSpacing'e hizalanmış)
  const MIN_TICK = alignTick(-887272, TICK_SPACING);
  const MAX_TICK = alignTick(887272, TICK_SPACING);

  const positionMgr = new ethers.Contract(PANCAKE_POSITION_MGR, POSITION_MGR_ABI, deployer);
  const deadline    = Math.floor(Date.now() / 1000) + 3600; // 1 saat

  // token0/token1 sıralamasına göre amount'ları ayarla
  const amount0Desired = isMtaT0 ? MTA_AMOUNT_FOR_POOL : BNB_AMOUNT_FOR_POOL;
  const amount1Desired = isMtaT0 ? BNB_AMOUNT_FOR_POOL : MTA_AMOUNT_FOR_POOL;

  const mintParams = {
    token0: isMtaT0 ? mtaAddress : WBNB,
    token1: isMtaT0 ? WBNB : mtaAddress,
    fee: FEE_TIER,
    tickLower: MIN_TICK,
    tickUpper: MAX_TICK,
    amount0Desired,
    amount1Desired,
    amount0Min: 0n, // Slippage: production'da %2-5 ekleyin
    amount1Min: 0n,
    recipient: deployer.address,
    deadline,
  };

  const mintTx = await positionMgr.mint(mintParams);
  const receipt = await mintTx.wait();

  // TokenId'yi loglardan çıkar
  console.log(`  ✓ Likidite pozisyonu oluşturuldu!`);
  console.log(`  ✓ Tx Hash: ${receipt.hash}`);
  console.log(`  ✓ Pool: ${poolAddress}`);

  // Deployment kaydını güncelle
  const depFilePath = path.join(__dirname, "../../deployments/bsc.json");
  const depData     = JSON.parse(fs.readFileSync(depFilePath, "utf-8"));
  depData.liquidity = {
    pancakeswapV3Pool: poolAddress,
    feeTier: FEE_TIER,
    token0: mintParams.token0,
    token1: mintParams.token1,
    addedAt: new Date().toISOString(),
    txHash: receipt.hash,
  };
  fs.writeFileSync(depFilePath, JSON.stringify(depData, null, 2));

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  ✓ PancakeSwap V3 Likidite Ekleme TAMAMLANDI");
  console.log("──────────────────────────────────────────────────────");
  console.log(`  Pool           : ${poolAddress}`);
  console.log(`  MTA            : ${ethers.formatEther(MTA_AMOUNT_FOR_POOL)}`);
  console.log(`  BNB (WBNB)     : ${ethers.formatEther(BNB_AMOUNT_FOR_POOL)}`);
  console.log(`  Fee Tier       : ${FEE_TIER / 100}%`);
  console.log("──────────────────────────────────────────────────────");
  console.log("  ⚠ Önemli: LP NFT'ini kilitlemeden önce doğrula!");
  console.log("    1. PancakeSwap UI'dan pozisyon NFT ID'sini bul");
  console.log("    2. team.finance veya UNCX ile LP'yi kilitle (1 yıl min.)");
  console.log("    3. Lock hash'ini listing dosyalarına ekle");
  console.log("══════════════════════════════════════════════════════");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
