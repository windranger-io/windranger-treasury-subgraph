import { BigInt, store } from '@graphprotocol/graph-ts';
import {
  DAO,
  DAO__Role as DAORole,
  Role,
  StakingPool,
  StakingPool__Deposit as StakingPoolDeposit,
  StakingPool__Withdrawal as StakingPoolWithdrawl,
  StakingPool__Reward as StakingPoolReward,
  StakingPool__RewardWithdrawal as StakingPoolRewardWithdrawal
} from '../generated/schema';
import {
  Deposit as DepositFilter,
  EmergencyMode,
  GrantDaoRole,
  GrantGlobalRole,
  InitializeRewards,
  Paused,
  RevokeDaoRole,
  RevokeGlobalRole,
  RewardsAvailableTimestamp,
  Unpaused,
  WithdrawRewards,
  WithdrawStake
} from '../generated/templates/StakingPool/StakingPool';

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

// - EmergencyMode(indexed address)
export function handleEmergencyMode(event: EmergencyMode): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.emergencyMode = true;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - GrantDaoRole(indexed uint256,indexed bytes32,address,indexed address)
export function handleGrantDaoRole(event: GrantDaoRole): void {
  const roleId = `${event.params.daoId.toHex()}-${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  let role = DAORole.load(roleId);
  role = role === null ? new DAORole(roleId) : role;

  role.dao = dao.id;
  role.role = event.params.role;
  role.account = event.params.account;

  role.createdAtTimestamp = role.createdAtTimestamp || event.block.timestamp;
  role.lastUpdatedTimestamp = event.block.timestamp;

  role.save();
}

// - GrantGlobalRole(bytes32,address,indexed address)
export function handleGrantGlobalRole(event: GrantGlobalRole): void {
  const roleId = `${event.params.indexedrole.toHex()}-${event.params.account.toHex()}`;

  let role = Role.load(roleId);
  role = role === null ? new Role(roleId) : role;

  role.role = event.params.indexedrole;
  role.account = event.params.account;

  role.createdAtTimestamp = role.createdAtTimestamp || event.block.timestamp;
  role.lastUpdatedTimestamp = event.block.timestamp;

  role.save();
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

// - Paused(address)
export function handlePaused(event: Paused): void {
  let stakingPool = StakingPool.load(event.address.toHex());
  stakingPool =
    stakingPool === null ? new StakingPool(event.address.toHex()) : stakingPool;

  stakingPool.paused = true;

  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - RevokeDaoRole(indexed uint256,indexed bytes32,address,indexed address)
export function handleRevokeDaoRole(event: RevokeDaoRole): void {
  const roleId = `${event.params.daoId.toHex()}-${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let role = DAORole.load(roleId);
  role = role === null ? new DAORole(roleId) : role;

  store.remove('DAO__Role', role.id);
}

// - RevokeGlobalRole(indexed bytes32,address,indexed address)
export function handleRevokeGlobalRole(event: RevokeGlobalRole): void {
  const roleId = `${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let role = Role.load(roleId);
  role = role === null ? new Role(roleId) : role;

  store.remove('Role', role.id);
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

  const withdrawn: BigInt = withdrawal.amount || BigInt.fromI32(0);
  withdrawal.amount = withdrawn.plus(event.params.stake);

  withdrawal.createdAtTimestamp = withdrawal.createdAtTimestamp || event.block.timestamp;
  withdrawal.lastUpdatedTimestamp = event.block.timestamp;

  withdrawal.save();
}
