import { store } from '@graphprotocol/graph-ts';

import {
  StakingPool,
  StakingPool__DAO as DAO,
  StakingPool__DAO__CollateralWhitelist as DAOCollateralWhitelist,
  StakingPool__DAO__Metadata as DAOMetadata,
  StakingPool__DAO__Role as DAORole,
  StakingPool__Role as StakingPoolRole,
  StakingPoolFactory,
  StakingPoolMediator,
  StakingPoolMediator__Sweep as Sweep
} from '../generated/schema';

import {
  // bind'able contract instance of the StakingPoolMediator
  StakingPoolMediator as StakingPoolMediatorContract,
  // events types
  AddCollateralWhitelist,
  AddStakingPool,
  AdminChanged,
  BeaconUpgraded,
  BeneficiaryUpdate,
  CreateDao,
  DaoMetaDataUpdate,
  DaoTreasuryUpdate,
  ERC20Sweep,
  GrantDaoRole,
  GrantGlobalRole,
  Initialized,
  Paused,
  RemoveCollateralWhitelist,
  RevokeDaoRole,
  RevokeGlobalRole,
  StakingPoolCreatorUpdate,
  Unpaused,
  Upgraded
} from '../generated/StakingPoolMediator/StakingPoolMediator';

import { StakingPoolFactory as StakingPoolFactoryTemplate } from '../generated/templates';

// - AddCollateralWhitelist(indexed uint256,indexed address,indexed address)
export function handleAddCollateralWhitelist(event: AddCollateralWhitelist): void {
  const whitelistId = `${event.params.daoId.toHex()}-${event.params.collateralTokens.toHex()}`;

  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();

  let whitelist = DAOCollateralWhitelist.load(whitelistId);
  whitelist = whitelist === null ? new DAOCollateralWhitelist(whitelistId) : whitelist;

  whitelist.dao = dao.id;
  whitelist.token = event.params.collateralTokens;
  whitelist.mediator = stakingPoolMediator.id;

  whitelist.createdAtTimestamp = whitelist.createdAtTimestamp || event.block.timestamp;
  whitelist.lastUpdatedTimestamp = event.block.timestamp;

  whitelist.save();
}

// - AddStakingPool(indexed uint256,indexed address,indexed address)
export function handleAddStakingPool(event: AddStakingPool): void {
  let dao = DAO.load(event.params.daoId.toString());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let stakingPool = StakingPool.load(event.params.stakingPool.toHex());
  stakingPool =
    stakingPool === null
      ? new StakingPool(event.params.stakingPool.toHex())
      : stakingPool;

  stakingPool.dao = dao.id;
  stakingPool.mediator = stakingPoolMediator.id;

  stakingPool.createdAtTimestamp =
    stakingPool.createdAtTimestamp || event.block.timestamp;
  stakingPool.lastUpdatedTimestamp = event.block.timestamp;

  stakingPool.save();
}

// - AdminChanged(address,address)
export function handleAdminChanged(event: AdminChanged): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  stakingPoolMediator.admin = event.params.newAdmin;

  stakingPoolMediator.createdAtTimestamp =
    stakingPoolMediator.createdAtTimestamp || event.block.timestamp;
  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();
}

// - BeaconUpgraded(indexed address)
export function handleBeaconUpgraded(event: BeaconUpgraded): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  stakingPoolMediator.beacon = event.params.beacon;

  stakingPoolMediator.createdAtTimestamp =
    stakingPoolMediator.createdAtTimestamp || event.block.timestamp;
  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();
}

// - BeneficiaryUpdate(indexed address,indexed address)
export function handleBeneficiaryUpdate(event: BeneficiaryUpdate): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  stakingPoolMediator.beneficiary = event.params.beneficiary;

  stakingPoolMediator.createdAtTimestamp =
    stakingPoolMediator.createdAtTimestamp || event.block.timestamp;
  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();
}

// - CreateDao(indexed uint256,indexed address,indexed address)
export function handleCreateDao(event: CreateDao): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let dao = DAO.load(event.params.id.toHex());
  dao = dao === null ? new DAO(event.params.id.toHex()) : dao;

  dao.dao = event.params.id;
  dao.mediator = stakingPoolMediator.id;
  dao.treasury = event.params.treasury;
  dao.owner = event.params.instigator;

  dao.createdAtTimestamp = dao.createdAtTimestamp || event.block.timestamp;
  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();
}

// - DaoMetaDataUpdate(indexed uint256,string,indexed address)
export function handleDaoMetaDataUpdate(event: DaoMetaDataUpdate): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();

  let metadata = DAOMetadata.load(event.params.daoId.toHex());
  metadata = metadata === null ? new DAOMetadata(event.params.daoId.toHex()) : metadata;

  metadata.data = event.params.data;
  metadata.dao = dao.id;
  metadata.mediator = stakingPoolMediator.id;

  metadata.createdAtTimestamp = metadata.createdAtTimestamp || event.block.timestamp;
  metadata.lastUpdatedTimestamp = event.block.timestamp;

  metadata.save();
}

// - DaoTreasuryUpdate(indexed uint256,indexed address,indexed address)
export function handleDaoTreasuryUpdate(event: DaoTreasuryUpdate): void {
  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  dao.treasury = event.params.treasury;

  dao.createdAtTimestamp = dao.createdAtTimestamp || event.block.timestamp;
  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();
}

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
export function handleERC20Sweep(event: ERC20Sweep): void {
  const sweepId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let sweep = Sweep.load(sweepId);
  sweep = sweep === null ? new Sweep(sweepId) : sweep;

  sweep.token = event.params.tokens;
  sweep.amount = event.params.amount;
  sweep.beneficiary = event.params.beneficiary;

  sweep.mediator = stakingPoolMediator.id;

  sweep.createdAtTimestamp = event.block.timestamp;

  sweep.save();
}

// - GrantDaoRole(indexed uint256,indexed bytes32,address,indexed address)
export function handleGrantDaoRole(event: GrantDaoRole): void {
  const roleId = `${event.params.daoId.toHex()}-${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  let role = DAORole.load(roleId);
  role = role === null ? new DAORole(roleId) : role;

  role.dao = dao.id;
  role.mediator = stakingPoolMediator.id;
  role.role = event.params.role;
  role.account = event.params.account;

  role.createdAtTimestamp = role.createdAtTimestamp || event.block.timestamp;
  role.lastUpdatedTimestamp = event.block.timestamp;

  role.save();
}

// - GrantGlobalRole(bytes32,address,indexed address)
export function handleGrantGlobalRole(event: GrantGlobalRole): void {
  const roleId = `${event.params.indexedrole.toHex()}-${event.params.account.toHex()}`;

  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let role = StakingPoolRole.load(roleId);
  role = role === null ? new StakingPoolRole(roleId) : role;

  role.mediator = stakingPoolMediator.id;
  role.role = event.params.indexedrole;
  role.account = event.params.account;

  role.createdAtTimestamp = role.createdAtTimestamp || event.block.timestamp;
  role.lastUpdatedTimestamp = event.block.timestamp;

  role.save();
}

// - Initialized(uint8)
export function handleInitialized(event: Initialized): void {
  const mediator = StakingPoolMediatorContract.bind(event.address);
  const factory = mediator.stakingPoolCreator();

  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let stakingPoolFactory = StakingPoolFactory.load(factory.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(factory.toHex())
      : stakingPoolFactory;

  stakingPoolMediator.factory = stakingPoolFactory.id;

  stakingPoolMediator.createdAtTimestamp =
    stakingPoolMediator.createdAtTimestamp || event.block.timestamp;
  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();

  stakingPoolFactory.mediator = stakingPoolMediator.id;
  stakingPoolFactory.factory = factory;
  
  stakingPoolFactory.createdAtTimestamp = 
    stakingPoolFactory.createdAtTimestamp || event.block.timestamp;
  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();

  // Bind to new template to capture events on the new StakingPoolFactory
  StakingPoolFactoryTemplate.create(factory);
}

// - Paused(address)
export function handlePaused(event: Paused): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  stakingPoolMediator.paused = true;

  stakingPoolMediator.createdAtTimestamp =
    stakingPoolMediator.createdAtTimestamp || event.block.timestamp;
  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();
}

// - RemoveCollateralWhitelist(indexed uint256,indexed address,indexed address)
export function handleRemoveCollateralWhitelist(event: RemoveCollateralWhitelist): void {
  const whitelistId = `${event.params.daoId.toHex()}-${event.params.collateralTokens.toHex()}`;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();

  let whitelist = DAOCollateralWhitelist.load(whitelistId);
  whitelist = whitelist === null ? new DAOCollateralWhitelist(whitelistId) : whitelist;

  store.remove('StakingPool__DAO__CollateralWhitelist', whitelist.id);
}

// - RevokeDaoRole(indexed uint256,indexed bytes32,address,indexed address)
export function handleRevokeDaoRole(event: RevokeDaoRole): void {
  const roleId = `${event.params.daoId.toHex()}-${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let role = DAORole.load(roleId);
  role = role === null ? new DAORole(roleId) : role;

  store.remove('StakingPool__DAO__Role', role.id);
}

// - RevokeGlobalRole(indexed bytes32,address,indexed address)
export function handleRevokeGlobalRole(event: RevokeGlobalRole): void {
  const roleId = `${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let role = StakingPoolRole.load(roleId);
  role = role === null ? new StakingPoolRole(roleId) : role;

  store.remove('StakingPool__Role', role.id);
}

// - StakingPoolCreatorUpdate(indexed address,indexed address,indexed address)
export function handleStakingPoolCreatorUpdate(event: StakingPoolCreatorUpdate): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  let stakingPoolFactory = StakingPoolFactory.load(event.params.updateCreator.toHex());
  stakingPoolFactory =
    stakingPoolFactory === null
      ? new StakingPoolFactory(event.params.updateCreator.toHex())
      : stakingPoolFactory;

  stakingPoolMediator.factory = stakingPoolFactory.id;

  stakingPoolMediator.createdAtTimestamp =
    stakingPoolMediator.createdAtTimestamp || event.block.timestamp;
  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();

  stakingPoolFactory.mediator = stakingPoolMediator.id;
  stakingPoolFactory.factory = event.params.updateCreator;
  stakingPoolFactory.createdAtTimestamp = event.block.timestamp;
  stakingPoolFactory.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolFactory.save();

  // Bind to new template to capture events on the new StakingPoolFactory
  StakingPoolFactoryTemplate.create(event.params.updateCreator);
}

// - Unpaused(address)
export function handleUnpaused(event: Unpaused): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  stakingPoolMediator.paused = false;

  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();
}

// - Upgraded(indexed address)
export function handleUpgraded(event: Upgraded): void {
  let stakingPoolMediator = StakingPoolMediator.load(event.address.toHex());
  stakingPoolMediator =
    stakingPoolMediator === null
      ? new StakingPoolMediator(event.address.toHex())
      : stakingPoolMediator;

  stakingPoolMediator.implementation = event.params.implementation;

  stakingPoolMediator.createdAtTimestamp =
    stakingPoolMediator.createdAtTimestamp || event.block.timestamp;
  stakingPoolMediator.lastUpdatedTimestamp = event.block.timestamp;

  stakingPoolMediator.save();
}
