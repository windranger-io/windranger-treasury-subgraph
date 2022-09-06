import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';

import {
  BondMediator,
  BondFactory,
  Bond__DAO as DAO,
  Bond,
  StakingPoolMediator,
  StakingPoolFactory,
  StakingPool,
  StakingPool__DAO as StakingPoolDAO,
  StakingPool__Reward as StakingPoolReward
} from '../generated/schema';

export const DAO_ID = 1;
export const DAO_ID_HEX = `0x${DAO_ID.toString(16)}`;
export const EMPTY_ADDRESS = '0x00000000';
export const TOKEN_ADDESS = '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc';
export const BOND_ADDRESS = '0xa0ee7a142d267c1f36714e4a8f75612f20a79720';
export const BOND_FACTORY_ADDRESS = '0x97226ae60a3fb891e61e8a6b6c069b97852ab6c7';
export const BOND_MEDIATOR_ADDRESS = '0x7b4f352cd40114f12e82fc675b5ba8c7582fc513';
export const STAKINGPOOL_MEDIATOR_ADDRESS = '0x48fea11299cb25d8ae3451d6ed9a9d288fdc94ff';
export const STAKINGPOOL_FACTORY_ADDRESS = '0x14dc79964da2c08b23698b3d3cc7ca32193d9955';
export const STAKINGPOOL_ADDRESS = '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65';
export const STAKINGPOOL_REWARD_ADDRESS = `${STAKINGPOOL_ADDRESS}-${TOKEN_ADDESS}`;

export const INSTIGATOR = Address.fromString(
  '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
);
export const AUTHORIZER = Address.fromString(
  '0x93ca6fa7d4b473ddc5e4506a26db225b6640bbbc'
);
export const BENEFICIARY = Address.fromString(
  '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
);
export const TREASURY = Address.fromString('0x3d4a1331cc1a11cc3e1cb51e67ecac7ac1a03adf');
export const DEPOSITOR = Address.fromString('0x9c0f5532ac4c88b0f94ce12978db7dba55c5401a');
export const CLAIMANT = Address.fromString('0xad3c7f1aa574ccdc74e37110499eab1ebb339dde');
export const TOKEN = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
export const OWNER_OLD = Address.fromString('0xadcb53bc00b0cedd90a2094cab35f4800d7d67d4');
export const OWNER_NEW = Address.fromString('0x53fcd82c87509aeb703f14a3b533834292789b9c');
export const REDEEMER = Address.fromString('0xbdd26b10e2c7b09e94abc31ee397a86e9e2526ed');
export const FROM = Address.fromString('0x7080c05352aeb253f08979d95f76442af64ace9f');
export const TO = Address.fromString('0x6b7844da24a8d90ada20348a52f77882d50001e3');
export const ACCOUNT = Address.fromString('0x20f576688fa253120e5a396b18b878fef1c05695');
export const ADMIN_NEW = Address.fromString('0x8d82e8490ecb106fb2e61717556eda1ae53fada9');
export const ADMIN_OLD = Address.fromString('0xc9b6f4d50cf8759ab967e860493dd48b1be59563');
export const FACTORY_OLD = Address.fromString(
  '0x002c2275bef538f772f4a22f3d0649c1ca1420f0'
);
export const FACTORY_NEW = Address.fromString(
  '0x9aaff2a100b1549728b7ccb74f9ef3158d333451'
);
export const BEACON = Address.fromString('0xbe42bbb1f26a943f849632325692b1f69496d65d');
export const IMPLEMENTATION = Address.fromString(
  '0xb81bacddf7d99e85c2f98ce0be3317f96010dece'
);

export const createPerformanceBondMediator = (): BondMediator => {
  const bondMediator = new BondMediator(BOND_MEDIATOR_ADDRESS);
  bondMediator.save();

  return bondMediator;
};

export const createPerformanceBondDAO = (): DAO => {
  const dao = new DAO(DAO_ID_HEX);
  dao.save();

  return dao;
};

export const createPerformanceBondFactory = (): BondFactory => {
  const bondFactory = new BondFactory(BOND_FACTORY_ADDRESS);
  bondFactory.save();

  return bondFactory;
};

export const createPerformanceBond = (): Bond => {
  const bond = new Bond(BOND_ADDRESS);
  bond.save();

  return bond;
};

export const createStakingPoolMediator = (): StakingPoolMediator => {
  const stakingPoolMediator = new StakingPoolMediator(STAKINGPOOL_MEDIATOR_ADDRESS);
  stakingPoolMediator.save();

  return stakingPoolMediator;
};

export const createStakingPoolDAO = (): StakingPoolDAO => {
  const stakingPoolDAO = new StakingPoolDAO(DAO_ID_HEX);
  stakingPoolDAO.save();

  return stakingPoolDAO;
};

export const createStakingPoolFactory = (): StakingPoolFactory => {
  const stakingPoolFactory = new StakingPoolFactory(STAKINGPOOL_FACTORY_ADDRESS);
  stakingPoolFactory.save();

  return stakingPoolFactory;
};

export const createStakingPool = (): StakingPool => {
  const stakingPool = new StakingPool(STAKINGPOOL_ADDRESS);
  stakingPool.save();

  return stakingPool;
};

export const createStakingPoolReward = (): StakingPoolReward => {
  const stakingPoolReward = new StakingPoolReward(STAKINGPOOL_REWARD_ADDRESS);
  stakingPoolReward.save();

  return stakingPoolReward;
};

export const defaultAddress = Address.fromString(BOND_MEDIATOR_ADDRESS);
export const defaultAddressBytes = Address.fromString(BOND_MEDIATOR_ADDRESS) as Bytes;
export const defaultBigInt = BigInt.fromI32(1);
export const defaultLogType = 'default_log_type';

export const newBlock = (): ethereum.Block =>
  new ethereum.Block(
    defaultAddressBytes,
    defaultAddressBytes,
    defaultAddressBytes,
    defaultAddress,
    defaultAddressBytes,
    defaultAddressBytes,
    defaultAddressBytes,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultBigInt
  );

export const newTransaction = (
  from: string | null = null,
  to: string | null = null,
  value: BigInt | null = null
): ethereum.Transaction =>
  new ethereum.Transaction(
    defaultAddressBytes,
    defaultBigInt,
    from ? Address.fromString(from) : defaultAddress,
    to ? Address.fromString(to) : defaultAddress,
    value ? value : defaultBigInt,
    defaultBigInt,
    defaultBigInt,
    defaultAddressBytes,
    defaultBigInt
  );
