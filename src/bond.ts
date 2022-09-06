import { BigInt } from '@graphprotocol/graph-ts';

import {
  Bond,
  Bond__Metadata as Metadata,
  Bond__Deposit as Deposit,
  Bond__Sweep as Sweep,
  Bond__Redemption as Redemption,
  Bond__RewardDebt as RewardDebt,
  Bond__RewardClaimed as RewardClaimed,
  Bond__RewardPool as RewardPool,
  Bond__SlashDeposit as SlashDeposit,
  Bond__Transfer as Transfer
} from '../generated/schema';

import {
  AllowRedemption,
  BeneficiaryUpdate,
  ClaimReward,
  Deposit as DepositFilter,
  ERC20Sweep,
  Expire,
  FullCollateral,
  MetaDataUpdate,
  OwnershipTransferred,
  PartialCollateral,
  Paused,
  RedeemableUpdate,
  Redemption as RedemptionFilter,
  RedemptionTimestampUpdate,
  RegisterReward,
  RewardDebt as RewardDebtFilter,
  RewardTimeLockUpdate,
  SlashDeposits,
  Transfer as TransferFilter,
  Unpaused,
  WithdrawCollateral
} from '../generated/templates/SingleCollateralMultiRewardPerformanceBond/SingleCollateralMultiRewardPerformanceBond';

// - AllowRedemption(indexed address,string)
export function handleAllowRedemption(event: AllowRedemption): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.isRedeemable = true;
  bond.redeemableReason = event.params.reason;
  bond.redeemableAuthorizer = event.params.authorizer;

  bond.createdAtTimestamp = bond.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bond.createdAtTimestamp
    : event.block.timestamp;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - BeneficiaryUpdate(indexed address,indexed address)
export function handleBeneficiaryUpdate(event: BeneficiaryUpdate): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.beneficiary = event.params.beneficiary;

  bond.createdAtTimestamp = bond.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bond.createdAtTimestamp
    : event.block.timestamp;
  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - ClaimReward(indexed address,uint256,indexed address)
export function handleClaimReward(event: ClaimReward): void {
  const claimId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  let claim = RewardClaimed.load(claimId);
  claim = claim === null ? new RewardClaimed(claimId) : claim;

  claim.bond = bond.id;
  claim.amount = event.params.amount;
  claim.tokens = event.params.tokens;
  claim.claimant = event.params.instigator;

  claim.createdAtTimestamp = event.block.timestamp;

  claim.save();
}

// - Deposit(indexed address,indexed address,uint256)
export function handleDeposit(event: DepositFilter): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  const collateralAmount: BigInt = bond.collateralAmount || BigInt.fromI32(0);
  bond.collateralAmount = collateralAmount.plus(event.params.collateralAmount);

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  // --

  const depositId = `${event.address.toHex()}-${event.params.depositor.toHex()}-${event.params.collateralTokens.toHex()}`;

  let deposit = Deposit.load(depositId);
  deposit = deposit === null ? new Deposit(depositId) : deposit;

  const depositAmount: BigInt = deposit.collateralAmount || BigInt.fromI32(0);

  deposit.bond = bond.id;
  deposit.depositor = event.params.depositor;
  deposit.collateralAmount = depositAmount.plus(event.params.collateralAmount);
  deposit.collateralTokens = event.params.collateralTokens;

  deposit.createdAtTimestamp = deposit.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? deposit.createdAtTimestamp
    : event.block.timestamp;
  deposit.lastUpdatedTimestamp = event.block.timestamp;

  deposit.save();
}

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
export function handleERC20Sweep(event: ERC20Sweep): void {
  const sweepId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  // eslint-disable-next-line eqeqeq
  const sweepCollateral = event.params.tokens.toHex() == bond.collateralTokens.toHex();

  if (sweepCollateral) {
    const collateralAmount: BigInt = bond.collateralAmount || BigInt.fromI32(0);
    bond.collateralAmount = collateralAmount.minus(event.params.amount);
  }

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  // --

  let sweep = Sweep.load(sweepId);
  sweep = sweep === null ? new Sweep(sweepId) : sweep;

  sweep.bond = bond.id;

  sweep.token = event.params.tokens;
  sweep.amount = event.params.amount;
  sweep.beneficiary = event.params.beneficiary;

  sweep.createdAtTimestamp = event.block.timestamp;

  sweep.save();
}

// - Expire(indexed address,indexed address,uint256,indexed address)
export function handleExpire(event: Expire): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  const collateralAmount: BigInt = bond.collateralAmount || BigInt.fromI32(0);
  bond.collateralAmount = collateralAmount.minus(event.params.collateralAmount);

  bond.expired = true;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - FullCollateral(indexed address,uint256,indexed address)
export function handleFullCollateral(event: FullCollateral): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.collateralFull = true;
  bond.collateralAmount = event.params.collateralAmount;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - MetaDataUpdate(string,indexed address)
export function handleMetaDataUpdate(event: MetaDataUpdate): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  let metadata = Metadata.load(event.address.toHex());
  metadata = metadata === null ? new Metadata(event.address.toHex()) : metadata;

  metadata.bond = bond.id;
  metadata.data = event.params.data;

  metadata.createdAtTimestamp = metadata.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? metadata.createdAtTimestamp
    : event.block.timestamp;
  metadata.lastUpdatedTimestamp = event.block.timestamp;

  metadata.save();
}

// - OwnershipTransferred(indexed address,indexed address)
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.owner = event.params.newOwner;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - PartialCollateral(indexed address,uint256,indexed address,uint256,indexed address)
export function handlePartialCollateral(event: PartialCollateral): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.redemptionExcess = event.params.debtRemaining;
  bond.collateralAmount = event.params.collateralAmount;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - Paused(address)
export function handlePaused(event: Paused): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.paused = true;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - RedeemableUpdate(bool,string,indexed address)
export function handleRedeemableUpdate(event: RedeemableUpdate): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.isRedeemable = event.params.isRedeemable;
  bond.redeemableReason = event.params.reason;
  bond.redeemableAuthorizer = event.params.instigator;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - Redemption(indexed address,indexed address,uint256,indexed address,uint256)
export function handleRedemption(event: RedemptionFilter): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  const collateralAmount: BigInt = bond.collateralAmount || BigInt.fromI32(0);
  bond.collateralAmount = collateralAmount.minus(event.params.collateralAmount);

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  // --

  const redemptionId = `${event.address.toHex()}-${event.params.redeemer.toHex()}-${event.params.debtTokens.toHex()}`;

  let redemption = Redemption.load(redemptionId);
  redemption = redemption === null ? new Redemption(redemptionId) : redemption;

  const redemptionCollateralAmount: BigInt =
    redemption.collateralAmount || BigInt.fromI32(0);
  const redemptionDebtAmount: BigInt = redemption.debtAmount || BigInt.fromI32(0);

  redemption.bond = bond.id;
  redemption.redeemer = event.params.redeemer;
  redemption.collateralAmount = redemptionCollateralAmount.plus(
    event.params.collateralAmount
  );
  redemption.collateralTokens = event.params.collateralTokens;
  redemption.debtAmount = redemptionDebtAmount.plus(event.params.debtAmount);
  redemption.debtTokens = event.params.debtTokens;

  redemption.createdAtTimestamp = redemption.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? redemption.createdAtTimestamp
    : event.block.timestamp;
  redemption.lastUpdatedTimestamp = event.block.timestamp;

  redemption.save();
}

// - RedemptionTimestampUpdate(uint256,indexed address)
export function handleRedemptionTimestampUpdate(event: RedemptionTimestampUpdate): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.redeemableTimestamp = event.params.timestamp;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - RegisterReward(indexed address,uint256,uint256,indexed address)
export function handleRegisterReward(event: RegisterReward): void {
  const rewardPoolId = `${event.address.toHex()}-${event.params.tokens.toHex()}`;

  let bond = Bond.load(event.address.toHex());
  let rewardPool = RewardPool.load(rewardPoolId);

  bond = bond === null ? new Bond(event.address.toHex()) : bond;
  rewardPool = rewardPool === null ? new RewardPool(rewardPoolId) : rewardPool;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  // --

  rewardPool.bond = bond.id;
  rewardPool.amount = event.params.amount;
  rewardPool.timeLock = event.params.timeLock;
  rewardPool.tokens = event.params.tokens;

  rewardPool.createdAtTimestamp = rewardPool.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? rewardPool.createdAtTimestamp
    : event.block.timestamp;
  rewardPool.lastUpdatedTimestamp = event.block.timestamp;

  rewardPool.save();
}

// - RewardDebt(indexed address,indexed address,uint256,indexed address)
export function handleRewardDebt(event: RewardDebtFilter): void {
  const rewardDebtId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let bond = Bond.load(event.address.toHex());
  let rewardDebt = RewardDebt.load(rewardDebtId);

  bond = bond === null ? new Bond(event.address.toHex()) : bond;
  rewardDebt = rewardDebt === null ? new RewardDebt(rewardDebtId) : rewardDebt;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  // --

  rewardDebt.bond = bond.id;
  rewardDebt.claimant = event.params.claimant;
  rewardDebt.tokens = event.params.tokens;
  rewardDebt.rewardDebt = event.params.rewardDebt;

  rewardDebt.createdAtTimestamp = event.block.timestamp;

  rewardDebt.save();
}

// - RewardTimeLockUpdate(indexed address,uint256,indexed address)
export function handleRewardTimeLockUpdate(event: RewardTimeLockUpdate): void {
  const rewardPoolId = `${event.address.toHex()}-${event.params.tokens.toHex()}`;

  let bond = Bond.load(event.address.toHex());
  let rewardPool = RewardPool.load(rewardPoolId);

  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  // --

  rewardPool = rewardPool === null ? new RewardPool(rewardPoolId) : rewardPool;

  rewardPool.timeLock = event.params.timeLock;

  rewardPool.lastUpdatedTimestamp = event.block.timestamp;

  rewardPool.save();
}

// - SlashDeposits(indexed address,uint256,string,indexed address)
export function handleSlashDeposits(event: SlashDeposits): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  const collateralSlashed: BigInt = bond.collateralSlashed || BigInt.fromI32(0);
  bond.collateralSlashed = collateralSlashed.plus(event.params.collateralAmount);

  const collateralAmount: BigInt = bond.collateralAmount || BigInt.fromI32(0);
  bond.collateralAmount = collateralAmount.minus(event.params.collateralAmount);

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();

  // --

  const slashId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let slash = SlashDeposit.load(slashId);
  slash = slash === null ? new SlashDeposit(slashId) : slash;

  slash.bond = bond.id;
  slash.collateralAmount = event.params.collateralAmount;
  slash.collateralTokens = event.params.collateralTokens;
  slash.reason = event.params.reason;

  slash.createdAtTimestamp = event.block.timestamp;

  slash.save();
}

// - Transfer(indexed address,indexed address,uint256)
export function handleTransfer(event: TransferFilter): void {
  const transferId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  let transfer = Transfer.load(transferId);
  transfer = transfer === null ? new Transfer(transferId) : transfer;

  transfer.bond = bond.id;
  transfer.from = event.params.from;
  transfer.to = event.params.to;
  transfer.value = event.params.value;

  transfer.createdAtTimestamp = event.block.timestamp;

  transfer.save();
}

// - Unpaused(address)
export function handleUnpaused(event: Unpaused): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  bond.paused = false;

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - WithdrawCollateral(indexed address,indexed address,uint256,indexed address)
export function handleWithdrawCollateral(event: WithdrawCollateral): void {
  let bond = Bond.load(event.address.toHex());
  bond = bond === null ? new Bond(event.address.toHex()) : bond;

  const collateralAmount: BigInt = bond.collateralAmount || BigInt.fromI32(0);
  bond.collateralAmount = collateralAmount.minus(event.params.collateralAmount);

  if (bond.collateralAmount <= BigInt.fromI32(0)) {
    bond.collateralWithdrawn = true;
  }

  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}
