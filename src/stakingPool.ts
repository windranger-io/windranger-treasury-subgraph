import { BigInt } from '@graphprotocol/graph-ts';

import {
  StakingPool,
  StakingPool__Deposit as StakingPoolDeposit,
  StakingPool__Withdrawal as StakingPoolWithdrawl,
  StakingPool__Reward as StakingPoolReward,
  StakingPool__RewardWithdrawal as StakingPoolRewardWithdrawal,
  StakingPool__Sweep as Sweep
} from '../generated/schema';

import {
  BeneficiaryUpdate,
  Deposit as DepositFilter,
  EmergencyMode,
  ERC20Sweep,
  InitializeRewards,
  OwnershipTransferred,
  Paused,
  RewardsAvailableTimestamp,
  Unpaused,
  WithdrawRewards,
  WithdrawStake
} from '../generated/templates/StakingPool/StakingPool';

// - BeneficiaryUpdate(indexed address,indexed address)
export function handleBeneficiaryUpdate(event: BeneficiaryUpdate): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.beneficiary = event.params.beneficiary;

  stakingPool.createdAtTimestamp =
    stakingPool.createdAtTimestamp || event.block.timestamp;
  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - Deposit(indexed address,uint256)
export function handleDeposit(event: DepositFilter): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  const depositedAmount: BigInt = stakingPool.amount || BigInt.fromI32(0);
  stakingPool.amount = depositedAmount.plus(event.params.depositAmount);

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();

  // --

  const depositId = `${event.address.toHex()}-${event.params.user.toHex()}`;

  let deposit = StakingPoolDeposit.load(depositId);
  deposit = deposit === null ? new StakingPoolDeposit(depositId) : deposit;

  const depositAmount: BigInt = deposit.amount || BigInt.fromI32(0);

  deposit.pool = stakingPool.id;
  deposit.user = event.params.user;
  deposit.amount = depositAmount.plus(event.params.depositAmount);

  deposit.createdAtTimestamp = deposit.createdAtTimestamp || event.block.timestamp;
  deposit.lastUpdatedTimestamp = event.block.timestamp;

  deposit.save();
}

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
export function handleERC20Sweep(event: ERC20Sweep): void {
  const sweepId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let stakingpool = StakingPool.load(event.address.toHex());
  stakingpool =
    stakingpool === null ? new StakingPool(event.address.toHex()) : stakingpool;

  stakingpool.lastUpdatedTimestamp = event.block.timestamp;

  stakingpool.save();

  // --

  let sweep = Sweep.load(sweepId);
  sweep = sweep === null ? new Sweep(sweepId) : sweep;

  sweep.pool = stakingpool.id;

  sweep.token = event.params.tokens;
  sweep.amount = event.params.amount;
  sweep.beneficiary = event.params.beneficiary;

  sweep.createdAtTimestamp = event.block.timestamp;

  sweep.save();
}

// - EmergencyMode(indexed address)
export function handleEmergencyMode(event: EmergencyMode): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.emergencyMode = true;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - InitializeRewards(address,uint256)
export function handleInitializeRewards(event: InitializeRewards): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();

  // --

  const rewardId = `${event.address.toHex()}-${event.params.rewardTokens.toHex()}`;

  let reward = StakingPoolReward.load(rewardId);
  reward = reward === null ? new StakingPoolReward(rewardId) : reward;

  reward.pool = stakingPool.id;
  reward.token = event.params.rewardTokens;
  reward.amount = event.params.amount;

  reward.createdAtTimestamp = reward.createdAtTimestamp || event.block.timestamp;
  reward.lastUpdatedTimestamp = event.block.timestamp;

  reward.save();
}

// - OwnershipTransferred(indexed address,indexed address)
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.owner = event.params.newOwner;

  stakingPool.createdAtTimestamp =
    stakingPool.createdAtTimestamp || event.block.timestamp;
  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - Paused(address)
export function handlePaused(event: Paused): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.paused = true;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - RewardsAvailableTimestamp(uint32)
export function handleRewardsAvailableTimestamp(event: RewardsAvailableTimestamp): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.rewardsAvailable = true;
  stakingPool.rewardsAvailableTimestamp = event.params.rewardsAvailableTimestamp;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - Unpaused(address)
export function handleUnpaused(event: Unpaused): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.paused = false;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - WithdrawRewards(indexed address,address,uint256)
export function handleWithdrawRewards(event: WithdrawRewards): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();

  // --

  const rewardId = `${event.address.toHex()}-${event.params.rewardToken.toHex()}`;

  let reward = StakingPoolReward.load(rewardId);
  reward = reward === null ? new StakingPoolReward(rewardId) : reward;

  const amount: BigInt = reward.amount || BigInt.fromI32(0);
  reward.amount = amount.minus(event.params.rewards);

  reward.lastUpdatedTimestamp = event.block.timestamp;

  reward.save();

  // --

  const withdrawId = `${event.address.toHex()}-${event.params.user.toHex()}-${event.params.rewardToken.toHex()}`;

  let withdrawal = StakingPoolRewardWithdrawal.load(withdrawId);
  withdrawal =
    withdrawal === null ? new StakingPoolRewardWithdrawal(withdrawId) : withdrawal;

  withdrawal.pool = stakingPool.id;
  withdrawal.token = event.params.rewardToken;
  withdrawal.amount = event.params.rewards;
  withdrawal.user = event.params.user;
  withdrawal.reward = reward.id;

  withdrawal.createdAtTimestamp = withdrawal.createdAtTimestamp || event.block.timestamp;
  withdrawal.lastUpdatedTimestamp = event.block.timestamp;

  withdrawal.save();
}

// - WithdrawStake(indexed address,uint256)
export function handleWithdrawStake(event: WithdrawStake): void {
  event.params.user;
  event.params.stake;

  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  const depositedAmount: BigInt = stakingPool.amount || BigInt.fromI32(0);
  stakingPool.amount = depositedAmount.minus(event.params.stake);

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();

  // --

  const withdrawId = `${event.address.toHex()}-${event.params.user.toHex()}`;

  let withdrawal = StakingPoolWithdrawl.load(withdrawId);
  withdrawal = withdrawal === null ? new StakingPoolWithdrawl(withdrawId) : withdrawal;

  withdrawal.pool = stakingPool.id;
  withdrawal.user = event.params.user;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const withdrawn: BigInt = withdrawal.amount as BigInt || BigInt.fromI32(0);
  withdrawal.amount = withdrawn.plus(event.params.stake);

  withdrawal.createdAtTimestamp = withdrawal.createdAtTimestamp || event.block.timestamp;
  withdrawal.lastUpdatedTimestamp = event.block.timestamp;

  withdrawal.save();
}
