import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import { Role, DAO__Role as DAORole } from '../generated/schema';

import {
  createDAO,
  createStakingPool,
  createStakingPoolReward,
  DAO_ID,
  DAO_ID_HEX,
  defaultBigInt,
  defaultLogType,
  newBlock,
  newTransaction,
  STAKINGPOOL_ADDRESS,
  STAKINGPOOL_REWARD_ADDRESS
} from './utils';

import {
  Deposit,
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
import {
  handleDeposit,
  handleEmergencyMode,
  handleGrantDaoRole,
  handleGrantGlobalRole,
  handleInitializeRewards,
  handlePaused,
  handleRevokeDaoRole,
  handleRevokeGlobalRole,
  handleRewardsAvailableTimestamp,
  handleUnpaused,
  handleWithdrawRewards,
  handleWithdrawStake
} from '../src/stakingPool';

// - Deposit(indexed address,uint256)
test('Will handle Deposit event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const amount = 100;

  createStakingPool();

  handleDeposit(
    new Deposit(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam('user', ethereum.Value.fromAddress(instigator)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount))
      ],
      null
    )
  );

  const depositId = `${STAKINGPOOL_ADDRESS}-${instigator.toHex()}`;

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'deposits', `[${depositId}]`);
  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'amount', '100');

  assert.fieldEquals('StakingPool__Deposit', depositId, 'user', `${instigator.toHex()}`);
  assert.fieldEquals('StakingPool__Deposit', depositId, 'amount', '100');

  clearStore();
});

// - EmergencyMode(indexed address)
test('Will handle EmergencyMode event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  createStakingPool();

  handleEmergencyMode(
    new EmergencyMode(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [new ethereum.EventParam('admin', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'emergencyMode', 'true');

  clearStore();
});

// - GrantDaoRole(indexed uint256,indexed bytes32,address,indexed address)
test('Will handle GrantDaoRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  createDAO();
  createStakingPool();

  handleGrantDaoRole(
    new GrantDaoRole(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam('daoId', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam('role', ethereum.Value.fromBytes(role)),
        new ethereum.EventParam('account', ethereum.Value.fromAddress(account)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  const roleId = `${DAO_ID_HEX}-${role.toHex()}-${account.toHex()}`;

  assert.fieldEquals('DAO__Role', roleId, 'account', account.toHex());
  assert.fieldEquals('DAO__Role', roleId, 'role', role.toHex());

  clearStore();
});

// - GrantGlobalRole(bytes32,address,indexed address)
test('Will handle GrantGlobalRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  createDAO();
  createStakingPool();

  handleGrantGlobalRole(
    new GrantGlobalRole(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('indexedrole', ethereum.Value.fromBytes(role)),
        new ethereum.EventParam('account', ethereum.Value.fromAddress(account)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  const roleId = `${role.toHex()}-${account.toHex()}`;

  assert.fieldEquals('Role', roleId, 'account', account.toHex());
  assert.fieldEquals('Role', roleId, 'role', role.toHex());

  clearStore();
});

// - InitializeRewards(address,uint256)
test('Will handle InitializeRewards event', () => {
  const token = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const amount = 100;

  createStakingPool();

  handleInitializeRewards(
    new InitializeRewards(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam('rewardTokens', ethereum.Value.fromAddress(token)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount))
      ],
      null
    )
  );

  const rewardId = `${STAKINGPOOL_ADDRESS}-${token.toHex()}`;

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'rewards', `[${rewardId}]`);

  assert.fieldEquals('StakingPool__Reward', rewardId, 'token', `${token.toHex()}`);
  assert.fieldEquals('StakingPool__Reward', rewardId, 'amount', '100');

  clearStore();
});

// - Paused(address)
test('Will handle Paused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  createStakingPool();

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'paused', 'false');

  handlePaused(
    new Paused(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'paused', 'true');

  clearStore();
});

// - RevokeDaoRole(indexed uint256,indexed bytes32,address,indexed address)
test('Will handle RevokeDaoRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  const dao = createDAO();

  const roleId = `${DAO_ID_HEX}-${role.toHex()}-${account.toHex()}`;
  const daoRole = new DAORole(roleId);

  daoRole.dao = dao.id;
  daoRole.role = role;
  daoRole.account = account;

  daoRole.save();

  assert.fieldEquals('DAO', DAO_ID_HEX, 'roles', `[${roleId}]`);

  handleRevokeDaoRole(
    new RevokeDaoRole(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('daoId', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam('role', ethereum.Value.fromBytes(role)),
        new ethereum.EventParam('account', ethereum.Value.fromAddress(account)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.notInStore('DAO__Role', roleId);

  clearStore();
});

// - RevokeGlobalRole(indexed bytes32,address,indexed address)
test('Will handle RevokeGlobalRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  const roleId = `${role.toHex()}-${account.toHex()}`;
  const roleEntity = new Role(roleId);

  roleEntity.role = role;
  roleEntity.account = account;

  roleEntity.save();

  handleRevokeGlobalRole(
    new RevokeGlobalRole(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('indexedrole', ethereum.Value.fromBytes(role)),
        new ethereum.EventParam('account', ethereum.Value.fromAddress(account)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.notInStore('Role', roleId);

  clearStore();
});

// - RewardsAvailableTimestamp(uint32)
test('Will handle RewardsAvailableTimestamp event', () => {
  const timestamp = new Date(0).getTime();

  createStakingPool();

  handleRewardsAvailableTimestamp(
    new RewardsAvailableTimestamp(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam(
          'rewardsAvailableTimestamp',
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          ethereum.Value.fromI32(timestamp as i32)
        )
      ],
      null
    )
  );

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'rewardsAvailable', 'true');
  assert.fieldEquals(
    'StakingPool',
    STAKINGPOOL_ADDRESS,
    'rewardsAvailableTimestamp',
    `${timestamp}`
  );

  clearStore();
});

// - Unpaused(address)
test('Will handle Unpaused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  const stakingPool = createStakingPool();
  stakingPool.paused = true;

  stakingPool.save();

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'paused', 'true');

  handleUnpaused(
    new Unpaused(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'paused', 'false');

  clearStore();
});

// - WithdrawRewards(indexed address,address,uint256)
test('Will handle WithdrawRewards event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const token = Address.fromString('0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc');
  const amount = 100;

  const stakingPoolReward = createStakingPoolReward();
  stakingPoolReward.amount = BigInt.fromI32(100);

  stakingPoolReward.save();

  handleWithdrawRewards(
    new WithdrawRewards(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam('user', ethereum.Value.fromAddress(instigator)),
        new ethereum.EventParam('rewardToken', ethereum.Value.fromAddress(token)),
        new ethereum.EventParam('rewards', ethereum.Value.fromI32(amount))
      ],
      null
    )
  );

  const withdrawalId = `${STAKINGPOOL_ADDRESS}-${instigator.toHex()}-${token.toHex()}`;

  assert.fieldEquals(
    'StakingPool__Reward',
    STAKINGPOOL_REWARD_ADDRESS,
    'withdrawals',
    `[${withdrawalId}]`
  );
  assert.fieldEquals('StakingPool__Reward', STAKINGPOOL_REWARD_ADDRESS, 'amount', '0');

  assert.fieldEquals(
    'StakingPool__RewardWithdrawal',
    withdrawalId,
    'user',
    `${instigator.toHex()}`
  );
  assert.fieldEquals('StakingPool__RewardWithdrawal', withdrawalId, 'amount', '100');

  clearStore();
});

// - WithdrawStake(indexed address,uint256)
test('Will handle WithdrawStake event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const amount = 100;

  const stakingPool = createStakingPool();
  stakingPool.amount = BigInt.fromI32(100);

  stakingPool.save();

  handleWithdrawStake(
    new WithdrawStake(
      Address.fromString(STAKINGPOOL_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam('user', ethereum.Value.fromAddress(instigator)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount))
      ],
      null
    )
  );

  const withdrawalId = `${STAKINGPOOL_ADDRESS}-${instigator.toHex()}`;

  assert.fieldEquals(
    'StakingPool',
    STAKINGPOOL_ADDRESS,
    'withdrawals',
    `[${withdrawalId}]`
  );
  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'amount', `0`);

  assert.fieldEquals(
    'StakingPool__Withdrawal',
    withdrawalId,
    'user',
    `${instigator.toHex()}`
  );
  assert.fieldEquals('StakingPool__Withdrawal', withdrawalId, 'amount', '100');

  clearStore();
});
