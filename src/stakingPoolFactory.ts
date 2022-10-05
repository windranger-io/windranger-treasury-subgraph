import { BigInt } from '@graphprotocol/graph-ts';

import {
  StakingPool,
  StakingPool__Reward as StakingPoolReward,
  StakingPoolFactory,
  StakingPoolFactory__Sweep as Sweep
} from '../generated/schema';

import {
  BeneficiaryUpdate,
  ERC20Sweep,
  OwnershipTransferred,
  Paused,
  StakingPoolCreated,
  Unpaused
} from '../generated/StakingPoolFactory/StakingPoolFactory';

import { StakingPool as StakingPoolTemplate } from '../generated/templates';

// - BeneficiaryUpdate(indexed address,indexed address)
export function handleBeneficiaryUpdate(event: BeneficiaryUpdate): void {
  let stakingPoolFactory = StakingPoolFactory.load(event.address.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.address.toHex())
      : stakingPoolFactory;

  stakingPoolFactory.beneficiary = event.params.beneficiary;

  stakingPoolFactory.createdAtTimestamp = stakingPoolFactory.createdAtTimestamp.gt(
    BigInt.fromI32(0)
  )
    ? stakingPoolFactory.createdAtTimestamp
    : event.block.timestamp;
  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();
}

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
export function handleERC20Sweep(event: ERC20Sweep): void {
  const sweepId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let stakingPoolFactory = StakingPoolFactory.load(event.address.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.address.toHex())
      : stakingPoolFactory;

  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();

  // --

  let sweep = Sweep.load(sweepId);
  sweep = sweep === null ? new Sweep(sweepId) : sweep;

  sweep.factory = stakingPoolFactory.id;

  sweep.token = event.params.tokens;
  sweep.amount = event.params.amount;
  sweep.beneficiary = event.params.beneficiary;

  sweep.createdAtTimestamp = event.block.timestamp;

  sweep.save();
}

// - StakingPoolCreated(indexed address,address,indexed address,(address,uint256,uint256)[],address,uint128,uint128,uint128,uint8)
export function handleStakingPoolCreated(event: StakingPoolCreated): void {
  let stakingPoolFactory = StakingPoolFactory.load(event.address.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.address.toHex())
      : stakingPoolFactory;

  stakingPoolFactory.factory = event.address;

  stakingPoolFactory.createdAtTimestamp = stakingPoolFactory.createdAtTimestamp.gt(
    BigInt.fromI32(0)
  )
    ? stakingPoolFactory.createdAtTimestamp
    : event.block.timestamp;

  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();

  let stakingPool = StakingPool.load(event.params.stakingPool.toHex());
  stakingPool =
    stakingPool === null
      ? new StakingPool(event.params.stakingPool.toHex())
      : stakingPool;

  stakingPool.pool = event.params.stakingPool;
  stakingPool.stakeToken = event.params.config.stakeToken;
  stakingPool.creator = event.params.creator;
  stakingPool.treasury = event.params.config.treasury;

  stakingPool.epochStartTimestamp = event.params.config.epochStartTimestamp;
  stakingPool.epochDuration = event.params.config.epochDuration;
  stakingPool.minTotalPoolStake = event.params.config.minTotalPoolStake;
  stakingPool.maxTotalPoolStake = event.params.config.maxTotalPoolStake;
  stakingPool.minimumContribution = event.params.config.minimumContribution;
  stakingPool.rewardType = event.params.config.rewardType;
  stakingPool.factory = stakingPoolFactory.id;

  stakingPool.createdAtTimestamp = stakingPool.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? stakingPool.createdAtTimestamp
    : event.block.timestamp;
  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();

  for (let i = 0; i < event.params.config.rewardTokens.length; i++) {
    const reward = event.params.config.rewardTokens[i];
    const rewardId = `${event.params.stakingPool.toHex()}-${reward.tokens.toHex()}`;

    let poolReward = StakingPoolReward.load(rewardId);
    poolReward = poolReward === null ? new StakingPoolReward(rewardId) : poolReward;

    poolReward.pool = stakingPool.id;
    poolReward.amount = BigInt.fromI32(0);
    poolReward.maxAmount = reward.maxAmount;
    poolReward.ratio = reward.ratio;
    poolReward.token = reward.tokens;

    poolReward.createdAtTimestamp = poolReward.createdAtTimestamp.gt(BigInt.fromI32(0))
      ? poolReward.createdAtTimestamp
      : event.block.timestamp;

    poolReward.lastUpdatedTimestamp = event.block.timestamp;

    poolReward.save();
  }

  // Create an instance of StakingPool to capture events there
  StakingPoolTemplate.create(event.params.stakingPool);
}

// - OwnershipTransferred(indexed address,indexed address)
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let stakingPoolFactory = StakingPoolFactory.load(event.address.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.address.toHex())
      : stakingPoolFactory;

  stakingPoolFactory.owner = event.params.newOwner;

  stakingPoolFactory.createdAtTimestamp = stakingPoolFactory.createdAtTimestamp.gt(
    BigInt.fromI32(0)
  )
    ? stakingPoolFactory.createdAtTimestamp
    : event.block.timestamp;

  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();
}

// - Paused(address)
export function handlePaused(event: Paused): void {
  let stakingPoolFactory = StakingPoolFactory.load(event.address.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.address.toHex())
      : stakingPoolFactory;

  stakingPoolFactory.paused = true;

  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();
}

// - Unpaused(address)
export function handleUnpaused(event: Unpaused): void {
  let stakingPoolFactory = StakingPoolFactory.load(event.address.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.address.toHex())
      : stakingPoolFactory;

  stakingPoolFactory.paused = false;

  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();
}
