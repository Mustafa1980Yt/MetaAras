// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";

/**
 * @title MTATimelock
 * @notice DAO governance için 48 saatlik gecikme kontrolcüsü.
 *
 * Tüm kritik işlemler (upgrade, parametre değişikliği, hazine hareketleri)
 * bu Timelock üzerinden geçmek zorundadır. Bu sayede topluluğa
 * zararlı işlemlere itiraz etme süresi tanınır.
 */
contract MTATimelock is TimelockController {
    uint256 public constant MIN_DELAY = 48 hours;

    /**
     * @param proposers  Teklif açabilecek adresler (MTAGovernor)
     * @param executors  İşlemi çalıştırabilecekler (address(0) = herkese açık)
     * @param admin      Başlangıç admin (deploy sonrası bırakılmalı)
     */
    constructor(
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(MIN_DELAY, proposers, executors, admin) {}
}
