import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';

import {
  BondMediator,
  BondFactory,
  DAO,
  Bond,
  StakingPoolFactory,
  StakingPool,
  StakingPool__Reward as StakingPoolReward
} from '../generated/schema';

export const DAO_ID = 1;
export const DAO_ID_HEX = `0x${DAO_ID.toString(16)}`;
export const TOKEN_ADDESS = '0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc';
export const BOND_ADDRESS = '0xa0ee7a142d267c1f36714e4a8f75612f20a79720';
export const BOND_FACTORY_ADDRESS = '0x97226ae60a3fb891e61e8a6b6c069b97852ab6c7';
export const BOND_MEDIATOR_ADDRESS = '0x7b4f352cd40114f12e82fc675b5ba8c7582fc513';
export const STAKINGPOOL_FACTORY_ADDRESS = '0x14dc79964da2c08b23698b3d3cc7ca32193d9955';
export const STAKINGPOOL_ADDRESS = '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65';
export const STAKINGPOOL_REWARD_ADDRESS = `${STAKINGPOOL_ADDRESS}-${TOKEN_ADDESS}`;

export const createBondMediator = (): BondMediator => {
  const bondMediator = new BondMediator(BOND_MEDIATOR_ADDRESS);
  bondMediator.save();

  return bondMediator;
};

export const createBondFactory = (): BondFactory => {
  const bondFactory = new BondFactory(BOND_FACTORY_ADDRESS);
  bondFactory.save();

  return bondFactory;
};

export const createDAO = (): DAO => {
  const dao = new DAO(DAO_ID_HEX);
  dao.save();

  return dao;
};

export const createBond = (): Bond => {
  const bond = new Bond(BOND_ADDRESS);
  bond.save();

  return bond;
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
