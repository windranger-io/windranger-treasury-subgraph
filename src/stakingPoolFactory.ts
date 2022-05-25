import { BigInt, store } from '@graphprotocol/graph-ts';
import {
  DAO,
  DAO__Role as DAORole,
  Role,
  StakingPool,
  StakingPoolFactory,
  StakingPool__Reward as StakingPoolReward
} from '../generated/schema';
import {
  GrantDaoRole,
  GrantGlobalRole,
  Paused,
  RevokeDaoRole,
  RevokeGlobalRole,
  StakingPoolCreated,
  Unpaused
} from '../generated/StakingPoolFactory/StakingPoolFactory';
import { StakingPool as StakingPoolTemplate } from '../generated/templates';

// - StakingPoolCreated(indexed address,address,indexed address,(address,uint256,uint256)[],address,uint128,uint128,uint128,uint8)
export function handleStakingPoolCreated(event: StakingPoolCreated): void {
  let stakingPoolFactory = StakingPoolFactory.load(event.address.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.address.toHex())
      : stakingPoolFactory;

  stakingPoolFactory.factory = event.address;
  
  stakingPoolFactory.createdAtTimestamp = stakingPoolFactory.createdAtTimestamp || event.block.timestamp;
  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();

  let stakingPool = StakingPool.load(event.params.stakingPool.toHex());
  stakingPool =
    stakingPool === null
      ? new StakingPool(event.params.stakingPool.toHex())
      : stakingPool;

  stakingPool.pool = event.params.stakingPool;
  stakingPool.stakeToken = event.params.stakeToken;
  stakingPool.creator = event.params.creator;
  stakingPool.treasury = event.params.treasury;

  stakingPool.epochStartTimestamp = event.params.epochStartTimestamp;
  stakingPool.epochDuration = event.params.epochDuration;
  stakingPool.minimumContribution = event.params.minimumContribution;
  stakingPool.rewardType = event.params.rewardType;
  stakingPool.factory = stakingPoolFactory.id;

  stakingPool.createdAtTimestamp = stakingPool.createdAtTimestamp || event.block.timestamp;
  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();

  for (let i = 0; i < event.params.rewardTokens.length; i++) {
    const reward = event.params.rewardTokens[i];
    const rewardId = `${event.params.stakingPool.toHex()}-${reward.tokens.toHex()}`;

    let poolReward = StakingPoolReward.load(rewardId);
    poolReward = poolReward === null ? new StakingPoolReward(rewardId) : poolReward;

    poolReward.pool = stakingPool.id;
    poolReward.amount = BigInt.fromI32(0);
    poolReward.maxAmount = reward.maxAmount;
    poolReward.ratio = reward.ratio;

    poolReward.createdAtTimestamp = poolReward.createdAtTimestamp || event.block.timestamp;
    poolReward.lastUpdatedTimestamp = event.block.timestamp;

    poolReward.save();
  }

  // Create an instance of StakingPool to capture events there
  StakingPoolTemplate.create(event.params.stakingPool);
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
