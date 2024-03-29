import { BigInt, store } from '@graphprotocol/graph-ts';

import {
  Bond,
  Bond__DAO as DAO,
  Bond__DAO__CollateralWhitelist as DAOCollateralWhitelist,
  Bond__DAO__Metadata as DAOMetadata,
  Bond__DAO__Role as DAORole,
  Bond__Role as Role,
  BondFactory,
  BondMediator,
  BondMediator__Sweep as Sweep
} from '../generated/schema';

import {
  // bind'able contract instance of the PerformanceBondMediator
  PerformanceBondMediator as PerformanceBondMediatorContract,
  // events types
  AddPerformanceBond,
  AddCollateralWhitelist,
  AdminChanged,
  BeaconUpgraded,
  BeneficiaryUpdate,
  PerformanceBondCreatorUpdate,
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
  Unpaused,
  Upgraded
} from '../generated/PerformanceBondMediator/PerformanceBondMediator';

import { PerformanceBondFactory as PerformanceBondFactoryTemplate } from '../generated/templates';

// - AddPerformanceBond(indexed uint256,indexed address,indexed address)
export function handleAddPerformanceBond(event: AddPerformanceBond): void {
  let dao = DAO.load(event.params.daoId.toString());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let bond = Bond.load(event.params.bond.toHex());
  bond = bond === null ? new Bond(event.params.bond.toHex()) : bond;

  bond.bond = event.params.bond;
  bond.dao = dao.id;
  bond.mediator = bondMediator.id;

  bond.createdAtTimestamp = bond.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bond.createdAtTimestamp
    : event.block.timestamp;
  bond.lastUpdatedTimestamp = event.block.timestamp;

  bond.save();
}

// - AddCollateralWhitelist(indexed uint256,indexed address,indexed address)
export function handleAddCollateralWhitelist(event: AddCollateralWhitelist): void {
  const whitelistId = `${event.params.daoId.toHex()}-${event.params.collateralTokens.toHex()}`;

  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();

  let whitelist = DAOCollateralWhitelist.load(whitelistId);
  whitelist = whitelist === null ? new DAOCollateralWhitelist(whitelistId) : whitelist;

  whitelist.dao = dao.id;
  whitelist.token = event.params.collateralTokens;
  whitelist.mediator = bondMediator.id;

  whitelist.createdAtTimestamp = whitelist.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? whitelist.createdAtTimestamp
    : event.block.timestamp;
  whitelist.lastUpdatedTimestamp = event.block.timestamp;

  whitelist.save();
}

// - AdminChanged(address,address)
export function handleAdminChanged(event: AdminChanged): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  bondMediator.admin = event.params.newAdmin;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();
}

// - BeaconUpgraded(indexed address)
export function handleBeaconUpgraded(event: BeaconUpgraded): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  bondMediator.beacon = event.params.beacon;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();
}

// - BeneficiaryUpdate(indexed address,indexed address)
export function handleBeneficiaryUpdate(event: BeneficiaryUpdate): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  bondMediator.beneficiary = event.params.beneficiary;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();
}

// - PerformanceBondCreatorUpdate(indexed address,indexed address,indexed address)
export function handlePerformanceBondCreatorUpdate(
  event: PerformanceBondCreatorUpdate
): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let bondFactory = BondFactory.load(event.params.updateCreator.toHex());
  bondFactory =
    bondFactory === null
      ? new BondFactory(event.params.updateCreator.toHex())
      : bondFactory;

  bondMediator.factory = bondFactory.id;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();

  bondFactory.mediator = bondMediator.id;
  bondFactory.factory = event.params.updateCreator;
  bondFactory.createdAtTimestamp = event.block.timestamp;
  bondFactory.lastUpdatedTimestamp = event.block.timestamp;

  bondFactory.save();

  // Bind to new template to capture events on the new BondFactory
  PerformanceBondFactoryTemplate.create(event.params.updateCreator);
}

// - CreateDao(indexed uint256,indexed address,indexed address)
export function handleCreateDao(event: CreateDao): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let dao = DAO.load(event.params.id.toHex());
  dao = dao === null ? new DAO(event.params.id.toHex()) : dao;

  dao.dao = event.params.id;
  dao.mediator = bondMediator.id;
  dao.treasury = event.params.treasury;
  dao.owner = event.params.instigator;

  dao.createdAtTimestamp = dao.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? dao.createdAtTimestamp
    : event.block.timestamp;
  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();
}

// - DaoMetaDataUpdate(indexed uint256,string,indexed address)
export function handleDaoMetaDataUpdate(event: DaoMetaDataUpdate): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();

  let metadata = DAOMetadata.load(event.params.daoId.toHex());
  metadata = metadata === null ? new DAOMetadata(event.params.daoId.toHex()) : metadata;

  metadata.data = event.params.data;
  metadata.dao = dao.id;
  metadata.mediator = bondMediator.id;

  metadata.createdAtTimestamp = metadata.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? metadata.createdAtTimestamp
    : event.block.timestamp;
  metadata.lastUpdatedTimestamp = event.block.timestamp;

  metadata.save();
}

// - DaoTreasuryUpdate(indexed uint256,indexed address,indexed address)
export function handleDaoTreasuryUpdate(event: DaoTreasuryUpdate): void {
  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  dao.treasury = event.params.treasury;

  dao.createdAtTimestamp = dao.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? dao.createdAtTimestamp
    : event.block.timestamp;
  dao.lastUpdatedTimestamp = event.block.timestamp;

  dao.save();
}

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
export function handleERC20Sweep(event: ERC20Sweep): void {
  const sweepId = `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;

  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let sweep = Sweep.load(sweepId);
  sweep = sweep === null ? new Sweep(sweepId) : sweep;

  sweep.token = event.params.tokens;
  sweep.amount = event.params.amount;
  sweep.beneficiary = event.params.beneficiary;

  sweep.mediator = bondMediator.id;

  sweep.createdAtTimestamp = event.block.timestamp;

  sweep.save();
}

// - GrantDaoRole(indexed uint256,indexed bytes32,address,indexed address)
export function handleGrantDaoRole(event: GrantDaoRole): void {
  const roleId = `${event.params.daoId.toHex()}-${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let dao = DAO.load(event.params.daoId.toHex());
  dao = dao === null ? new DAO(event.params.daoId.toHex()) : dao;

  let role = DAORole.load(roleId);
  role = role === null ? new DAORole(roleId) : role;

  role.dao = dao.id;
  role.mediator = bondMediator.id;
  role.role = event.params.role;
  role.account = event.params.account;

  role.createdAtTimestamp = role.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? role.createdAtTimestamp
    : event.block.timestamp;
  role.lastUpdatedTimestamp = event.block.timestamp;

  role.save();
}

// - GrantGlobalRole(bytes32,address,indexed address)
export function handleGrantGlobalRole(event: GrantGlobalRole): void {
  const roleId = `${event.params.indexedrole.toHex()}-${event.params.account.toHex()}`;

  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let role = Role.load(roleId);
  role = role === null ? new Role(roleId) : role;

  role.mediator = bondMediator.id;
  role.role = event.params.indexedrole;
  role.account = event.params.account;

  role.createdAtTimestamp = role.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? role.createdAtTimestamp
    : event.block.timestamp;
  role.lastUpdatedTimestamp = event.block.timestamp;

  role.save();
}

// - Initialized(uint8)
export function handleInitialized(event: Initialized): void {
  const mediator = PerformanceBondMediatorContract.bind(event.address);
  const factory = mediator.bondCreator();

  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  let bondFactory = BondFactory.load(factory.toHex());
  bondFactory = bondFactory === null ? new BondFactory(factory.toHex()) : bondFactory;

  bondMediator.factory = bondFactory.id;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();

  bondFactory.mediator = bondMediator.id;
  bondFactory.factory = factory;

  bondFactory.createdAtTimestamp = bondFactory.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondFactory.createdAtTimestamp
    : event.block.timestamp;
  bondFactory.lastUpdatedTimestamp = event.block.timestamp;

  bondFactory.save();

  // Bind to new template to capture events on the new BondFactory
  PerformanceBondFactoryTemplate.create(factory);
}

// - Paused(address)
export function handlePaused(event: Paused): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  bondMediator.paused = true;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();
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

  store.remove('Bond__DAO__CollateralWhitelist', whitelist.id);
}

// - RevokeDaoRole(indexed uint256,indexed bytes32,address,indexed address)
export function handleRevokeDaoRole(event: RevokeDaoRole): void {
  const roleId = `${event.params.daoId.toHex()}-${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let role = DAORole.load(roleId);
  role = role === null ? new DAORole(roleId) : role;

  store.remove('Bond__DAO__Role', role.id);
}

// - RevokeGlobalRole(indexed bytes32,address,indexed address)
export function handleRevokeGlobalRole(event: RevokeGlobalRole): void {
  const roleId = `${event.params.role.toHex()}-${event.params.account.toHex()}`;

  let role = Role.load(roleId);
  role = role === null ? new Role(roleId) : role;

  store.remove('Bond__Role', role.id);
}

// - Unpaused(address)
export function handleUnpaused(event: Unpaused): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  bondMediator.paused = false;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();
}

// - Upgraded(indexed address)
export function handleUpgraded(event: Upgraded): void {
  let bondMediator = BondMediator.load(event.address.toHex());
  bondMediator =
    bondMediator === null ? new BondMediator(event.address.toHex()) : bondMediator;

  bondMediator.implementation = event.params.implementation;

  bondMediator.createdAtTimestamp = bondMediator.createdAtTimestamp.gt(BigInt.fromI32(0))
    ? bondMediator.createdAtTimestamp
    : event.block.timestamp;
  bondMediator.lastUpdatedTimestamp = event.block.timestamp;

  bondMediator.save();
}
