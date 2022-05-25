import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

import {
  defaultBigInt,
  defaultLogType,
  newBlock,
  newTransaction,
  createStakingPoolFactory,
  STAKINGPOOL_FACTORY_ADDRESS,
  createDAO,
  DAO_ID,
  DAO_ID_HEX
} from './utils';

import { DAO__Role as DAORole, Role } from '../generated/schema';

import {
  GrantDaoRole,
  GrantGlobalRole,
  RevokeDaoRole,
  RevokeGlobalRole,
  Paused,
  Unpaused,
  StakingPoolCreated
} from '../generated/StakingPoolFactory/StakingPoolFactory';
import {
  handleGrantDaoRole,
  handleGrantGlobalRole,
  handleRevokeDaoRole,
  handleRevokeGlobalRole,
  handlePaused,
  handleUnpaused,
  handleStakingPoolCreated
} from '../src/stakingPoolFactory';

// - GrantDaoRole(indexed uint256,indexed bytes32,address,indexed address)
test('Will handle GrantDaoRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  createDAO();
  createStakingPoolFactory();

  handleGrantDaoRole(
    new GrantDaoRole(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
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
  createStakingPoolFactory();

  handleGrantGlobalRole(
    new GrantGlobalRole(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
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

// - Paused(address)
test('Will handle Paused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  createStakingPoolFactory();

  assert.fieldEquals(
    'StakingPoolFactory',
    STAKINGPOOL_FACTORY_ADDRESS,
    'paused',
    'false'
  );

  handlePaused(
    new Paused(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('StakingPoolFactory', STAKINGPOOL_FACTORY_ADDRESS, 'paused', 'true');

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
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
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
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
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

// - StakingPoolCreated(indexed address,address,indexed address,(address,uint256,uint256)[],address,uint128,uint128,uint128,uint8)
test('Will handle StakingPoolCreated event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const stakingPool = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const treasury = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const creator = Address.fromString('0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc');
  const stakeToken = Address.fromString('0x90f79bf6eb2c4f870365e785982e1f101e93b906');
  const token = Address.fromString('0x15d34aaf54267db7d7c367839aaf71a00a2c6a65');

  const epochStartTimestamp = 0;
  const epochDuration = 1000;
  const minimumContribution = 0;
  const rewardType = 0;

  const reward = changetype<ethereum.Tuple>([
    ethereum.Value.fromAddress(token),
    ethereum.Value.fromI32(99),
    ethereum.Value.fromI32(1)
  ]);

  createStakingPoolFactory();

  handleStakingPoolCreated(
    new StakingPoolCreated(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('stakingPool', ethereum.Value.fromAddress(stakingPool)),
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(treasury)),
        new ethereum.EventParam('creator', ethereum.Value.fromAddress(creator)),
        new ethereum.EventParam(
          'rewardTokens',
          ethereum.Value.fromArray([ethereum.Value.fromTuple(reward)])
        ),
        new ethereum.EventParam('stakeToken', ethereum.Value.fromAddress(stakeToken)),

        new ethereum.EventParam(
          'epochStartTimestamp',
          ethereum.Value.fromI32(epochStartTimestamp)
        ),
        new ethereum.EventParam('epochDuration', ethereum.Value.fromI32(epochDuration)),
        new ethereum.EventParam(
          'minimumContribution',
          ethereum.Value.fromI32(minimumContribution)
        ),

        new ethereum.EventParam('rewardType', ethereum.Value.fromI32(rewardType))
      ],
      null
    )
  );

  const rewardId = `${stakingPool.toHex()}-${token.toHex()}`;

  assert.fieldEquals('StakingPool__Reward', rewardId, 'ratio', `1`);
  assert.fieldEquals('StakingPool__Reward', rewardId, 'maxAmount', `99`);

  assert.fieldEquals(
    'StakingPoolFactory',
    STAKINGPOOL_FACTORY_ADDRESS,
    'stakingPools',
    `[${stakingPool.toHex()}]`
  );

  assert.fieldEquals(
    'StakingPool',
    stakingPool.toHex(),
    'treasury',
    `${treasury.toHex()}`
  );
  assert.fieldEquals('StakingPool', stakingPool.toHex(), 'creator', `${creator.toHex()}`);
  assert.fieldEquals(
    'StakingPool',
    stakingPool.toHex(),
    'stakeToken',
    `${stakeToken.toHex()}`
  );
  assert.fieldEquals(
    'StakingPool',
    stakingPool.toHex(),
    'epochStartTimestamp',
    `${epochStartTimestamp}`
  );
  assert.fieldEquals(
    'StakingPool',
    stakingPool.toHex(),
    'epochDuration',
    `${epochDuration}`
  );
  assert.fieldEquals(
    'StakingPool',
    stakingPool.toHex(),
    'minimumContribution',
    `${minimumContribution}`
  );
  assert.fieldEquals('StakingPool', stakingPool.toHex(), 'rewardType', `${rewardType}`);

  assert.fieldEquals('StakingPool', stakingPool.toHex(), 'rewards', `[${rewardId}]`);

  clearStore();
});

// - Unpaused(address)
test('Will handle Unpaused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  const stakingPoolFactory = createStakingPoolFactory();
  stakingPoolFactory.paused = true;

  stakingPoolFactory.save();

  assert.fieldEquals('StakingPoolFactory', STAKINGPOOL_FACTORY_ADDRESS, 'paused', 'true');

  handleUnpaused(
    new Unpaused(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals(
    'StakingPoolFactory',
    STAKINGPOOL_FACTORY_ADDRESS,
    'paused',
    'false'
  );

  clearStore();
});
