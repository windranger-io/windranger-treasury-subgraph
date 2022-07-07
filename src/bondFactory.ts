import {
  Bond,
  Bond__Metadata as Metadata,
  Bond__Configuration as Configuration,
  Bond__RewardPool as RewardPool,
  BondFactory,
  BondFactory__Sweep as Sweep
} from '../generated/schema';

import {
  BeneficiaryUpdate,
  CreatePerformanceBond,
  ERC20Sweep,
  OwnershipTransferred,
  Paused,
  Unpaused
} from '../generated/PerformanceBondFactory/PerformanceBondFactory';

import { SingleCollateralMultiRewardPerformanceBond as SingleCollateralMultiRewardPerformanceBondTemplate } from '../generated/templates';

// - CreatePerformanceBond(indexed address,(string,string,string),(uint256,address,uint256,uint256),(address,uint128,uint128)[],indexed address,indexed address)
export function handleCreatePerformanceBond(event: CreatePerformanceBond): void {
  let bondFactory = BondFactory.load(event.address.toHex());
  bondFactory =
    bondFactory === null ? new BondFactory(event.address.toHex()) : bondFactory;

  bondFactory.factory = event.address;

  bondFactory.createdAtTimestamp =
    bondFactory.createdAtTimestamp || event.block.timestamp;
  bondFactory.lastUpdatedTimestamp = event.block.timestamp;

  bondFactory.save();

  // Create an instance of SingleCollateralMultiRewardBond to capture events emitted from the new contract
  SingleCollateralMultiRewardPerformanceBondTemplate.create(event.params.bond);

  let bond = Bond.load(event.params.bond.toHex());
  bond = bond === null ? new Bond(event.params.bond.toHex()) : bond;

  bond.bond = event.params.bond;
  bond.factory = bondFactory.id;
  bond.owner = event.transaction.from;
  bond.treasury = event.params.treasury;
  bond.collateralTokens = event.params.configuration.collateralTokens;
  bond.paused = false;

  bond.createdAtTimestamp = event.block.timestamp;
  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  let metadata = Metadata.load(event.params.bond.toHex());
  metadata = metadata === null ? new Metadata(event.params.bond.toHex()) : metadata;

  metadata.bond = bond.id;
  metadata.name = event.params.metadata.name;
  metadata.symbol = event.params.metadata.symbol;
  metadata.data = event.params.metadata.data;

  metadata.createdAtTimestamp = event.block.timestamp;
  metadata.lastUpdatedTimestamp = event.block.timestamp;

  metadata.save();

  let configuration = Configuration.load(event.params.bond.toHex());
  configuration =
    configuration === null ? new Configuration(event.params.bond.toHex()) : configuration;

  configuration.bond = bond.id;
  configuration.debtTokenAmount = event.params.configuration.debtTokenAmount;
  configuration.collateralTokens = event.params.configuration.collateralTokens;
  configuration.expiryTimestamp = event.params.configuration.expiryTimestamp;
  configuration.minimumDeposit = event.params.configuration.minimumDeposit;

  configuration.createdAtTimestamp = event.block.timestamp;
  configuration.lastUpdatedTimestamp = event.block.timestamp;

  configuration.save();

  for (let i = 0; i < event.params.rewards.length; i++) {
    const reward = event.params.rewards[i];
    const rewardPoolId = `${bond.bond.toHex()}-${reward.tokens.toHex()}`;

    let rewardPool = RewardPool.load(rewardPoolId);
    rewardPool = rewardPool === null ? new RewardPool(rewardPoolId) : rewardPool;

    rewardPool.bond = bond.id;
    rewardPool.amount = reward.amount;
    rewardPool.timeLock = reward.timeLock;
    rewardPool.tokens = reward.tokens;

    rewardPool.createdAtTimestamp = event.block.timestamp;
    rewardPool.lastUpdatedTimestamp = event.block.timestamp;

    rewardPool.save();
  }
}

// - BeneficiaryUpdate(indexed address,indexed address)
export function handleBeneficiaryUpdate(event: BeneficiaryUpdate): void {
  let bondFactory = BondFactory.load(event.address.toHex());
  bondFactory =
    bondFactory === null ? new BondFactory(event.address.toHex()) : bondFactory;

  bondFactory.beneficiary = event.params.beneficiary;

  bondFactory.createdAtTimestamp =
    bondFactory.createdAtTimestamp || event.block.timestamp;
  bondFactory.lastUpdatedTimestamp = event.block.timestamp;

  bondFactory.save();
}

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
export function handleERC20Sweep(event: ERC20Sweep): void {
  const sweepId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let bondFactory = BondFactory.load(event.address.toHex());
  bondFactory =
    bondFactory === null ? new BondFactory(event.address.toHex()) : bondFactory;

  let sweep = Sweep.load(sweepId);
  sweep = sweep === null ? new Sweep(sweepId) : sweep;

  sweep.token = event.params.tokens;
  sweep.amount = event.params.amount;
  sweep.beneficiary = event.params.beneficiary;

  sweep.factory = bondFactory.id;

  sweep.createdAtTimestamp = event.block.timestamp;

  sweep.save();
}

// - OwnershipTransferred(indexed address,indexed address)
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let bondFactory = BondFactory.load(event.address.toHex());
  bondFactory =
    bondFactory === null ? new BondFactory(event.address.toHex()) : bondFactory;

  bondFactory.owner = event.params.newOwner;

  bondFactory.createdAtTimestamp =
    bondFactory.createdAtTimestamp || event.block.timestamp;
  bondFactory.lastUpdatedTimestamp = event.block.timestamp;

  bondFactory.save();
}

// - Paused(address)
export function handlePaused(event: Paused): void {
  let bondFactory = BondFactory.load(event.address.toHex());
  bondFactory =
    bondFactory === null ? new BondFactory(event.address.toHex()) : bondFactory;

  bondFactory.paused = true;

  bondFactory.lastUpdatedTimestamp = event.block.timestamp;

  bondFactory.save();
}

// - Unpaused(address)
export function handleUnpaused(event: Unpaused): void {
  let bondFactory = BondFactory.load(event.address.toHex());
  bondFactory =
    bondFactory === null ? new BondFactory(event.address.toHex()) : bondFactory;

  bondFactory.paused = false;

  bondFactory.lastUpdatedTimestamp = event.block.timestamp;

  bondFactory.save();
}
