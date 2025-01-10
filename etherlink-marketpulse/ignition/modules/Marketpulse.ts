// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MarketpulseModule = buildModule("MarketpulseModule", (m) => {
  const MarketpulseContract = m.contract("Marketpulse", []);

  m.call(MarketpulseContract, "ping", []);

  return { MarketpulseContract };
});

export default MarketpulseModule;
