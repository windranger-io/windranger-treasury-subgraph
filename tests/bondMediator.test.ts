// - Testing tools
import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, createMockedFunction, test } from 'matchstick-as/assembly/index';

// - Helpers, consts and utils
import {
  BOND_ADDRESS,
  BOND_MEDIATOR_ADDRESS,
  createPerformanceBond,
  createPerformanceBondFactory,
  createPerformanceBondMediator,
  createPerformanceBondDAO,
  DAO_ID,
  DAO_ID_HEX,
  defaultAddress,
  defaultBigInt,
  defaultLogType,
  newBlock,
  newTransaction
} from './utils';

// - Entities we will be modifying
import {
  Bond__DAO__CollateralWhitelist as DAOCollateralWhitelist,
  Bond__DAO__Role as DAORole,
  Bond__Role as Role
} from '../generated/schema';

// - Event methods
import {
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

// - Test subjects
import {
  handleAddPerformanceBond,
  handleAddCollateralWhitelist,
  handleAdminChanged,
  handleBeaconUpgraded,
  handleBeneficiaryUpdate,
  handlePerformanceBondCreatorUpdate,
  handleCreateDao,
  handleDaoMetaDataUpdate,
  handleDaoTreasuryUpdate,
  handleERC20Sweep,
  handleGrantDaoRole,
  handleGrantGlobalRole,
  handleInitialized,
  handlePaused,
  handleRemoveCollateralWhitelist,
  handleRevokeDaoRole,
  handleRevokeGlobalRole,
  handleUnpaused,
  handleUpgraded
} from '../src/bondMediator';

// - AddPerformanceBond(indexed uint256,indexed address,indexed address)
test('Will handle AddPerformanceBond event', () => {
  const bondAddress = Address.fromString(BOND_ADDRESS);
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  createPerformanceBondMediator();
  createPerformanceBondDAO();
  createPerformanceBond();

  handleAddPerformanceBond(
    new AddPerformanceBond(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('daoId', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam('bond', ethereum.Value.fromAddress(bondAddress)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'dao', DAO_ID_HEX);
  assert.fieldEquals('Bond', BOND_ADDRESS, 'mediator', BOND_MEDIATOR_ADDRESS);

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'bonds', `[${BOND_ADDRESS}]`);
  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'bonds', `[${BOND_ADDRESS}]`);

  clearStore();
});

// - AddCollateralWhitelist(indexed uint256,indexed address,indexed address)
test('Will handle AddCollateralWhitelist event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const treasuryAddress = Address.fromString(
    '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513'
  );

  createPerformanceBondDAO();

  handleAddCollateralWhitelist(
    new AddCollateralWhitelist(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('daoId', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam(
          'collateralTokens',
          ethereum.Value.fromAddress(treasuryAddress)
        ),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  const whitelistId = `${DAO_ID_HEX}-${treasuryAddress.toHex()}`;

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'collateralWhitelist', `[${whitelistId}]`);

  assert.fieldEquals('Bond__DAO__CollateralWhitelist', whitelistId, 'dao', DAO_ID_HEX);
  assert.fieldEquals(
    'Bond__DAO__CollateralWhitelist',
    whitelistId,
    'token',
    `${treasuryAddress.toHex()}`
  );

  clearStore();
});

// - AdminChanged(address,address)
test('Will handle AdminChanged event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const newAdmin = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const previousAdmin = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  createPerformanceBondMediator();

  handleAdminChanged(
    new AdminChanged(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam(
          'previousAdmin',
          ethereum.Value.fromAddress(previousAdmin)
        ),
        new ethereum.EventParam('newAdmin', ethereum.Value.fromAddress(newAdmin))
      ],
      null
    )
  );

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'admin', newAdmin.toHex());

  clearStore();
});

// - BeaconUpgraded(indexed address)
test('Will handle BeaconUpgraded event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const beacon = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createPerformanceBondMediator();

  handleBeaconUpgraded(
    new BeaconUpgraded(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('beacon', ethereum.Value.fromAddress(beacon))],
      null
    )
  );

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'beacon', beacon.toHex());

  clearStore();
});

// - BeneficiaryUpdate(indexed address,indexed address)
test('Will handle BeneficiaryUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const beneficiary = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createPerformanceBondMediator();

  handleBeneficiaryUpdate(
    new BeneficiaryUpdate(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('beneficiary', ethereum.Value.fromAddress(beneficiary)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals(
    'BondMediator',
    BOND_MEDIATOR_ADDRESS,
    'beneficiary',
    beneficiary.toHex()
  );

  clearStore();
});

// - PerformanceBondCreatorUpdate(indexed address,indexed address,indexed address)
test('Will handle PerformanceBondCreatorUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const prevFactory = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const factory = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createPerformanceBondFactory();
  createPerformanceBondMediator();

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'factory', '');

  handlePerformanceBondCreatorUpdate(
    new PerformanceBondCreatorUpdate(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam(
          'previousCreator',
          ethereum.Value.fromAddress(prevFactory)
        ),
        new ethereum.EventParam('updateCreator', ethereum.Value.fromAddress(factory)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'factory', factory.toHex());
  assert.fieldEquals(
    'BondMediator',
    BOND_MEDIATOR_ADDRESS,
    'factories',
    `[${factory.toHex()}]`
  );

  clearStore();
});

// - CreateDao(indexed uint256,indexed address,indexed address)
test('Will handle CreateDao event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const treasury = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createPerformanceBondMediator();

  handleCreateDao(
    new CreateDao(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('id', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(treasury)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'treasury', treasury.toHex());
  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'daos', `[${DAO_ID_HEX}]`);

  clearStore();
});

// - DaoMetaDataUpdate(indexed uint256,string,indexed address)
test('Will handle DaoMetaDataUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const data = 'sample data;';

  createPerformanceBondDAO();
  createPerformanceBondMediator();

  handleDaoMetaDataUpdate(
    new DaoMetaDataUpdate(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('daoId', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam('data', ethereum.Value.fromString(data)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'metadata', `[${DAO_ID_HEX}]`);
  assert.fieldEquals('Bond__DAO__Metadata', DAO_ID_HEX, 'data', data);

  clearStore();
});

// - DaoTreasuryUpdate(indexed uint256,indexed address,indexed address)
test('Will handle DaoTreasuryUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const treasury = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createPerformanceBondDAO();
  createPerformanceBondMediator();

  handleDaoTreasuryUpdate(
    new DaoTreasuryUpdate(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('daoId', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(treasury)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'treasury', treasury.toHex());

  clearStore();
});

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
test('Will handle ERC20Sweep event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const beneficiary = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  const sweepId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  createPerformanceBondMediator();

  handleERC20Sweep(
    new ERC20Sweep(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('beneficiary', ethereum.Value.fromAddress(beneficiary)),
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'sweeps', `[${sweepId}]`);

  assert.fieldEquals('BondMediator__Sweep', sweepId, 'amount', `${amount}`);
  assert.fieldEquals('BondMediator__Sweep', sweepId, 'token', `${tokens.toHex()}`);
  assert.fieldEquals(
    'BondMediator__Sweep',
    sweepId,
    'beneficiary',
    `${beneficiary.toHex()}`
  );

  clearStore();
});

// - GrantDaoRole(indexed uint256,indexed bytes32,address,indexed address)
test('Will handle GrantDaoRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  createPerformanceBondDAO();
  createPerformanceBondMediator();

  handleGrantDaoRole(
    new GrantDaoRole(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
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

  const roleId = `${DAO_ID_HEX}-${role.toHex()}-${account.toHex()}`;

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'daoRoles', `[${roleId}]`);

  assert.fieldEquals('Bond__DAO__Role', roleId, 'account', account.toHex());
  assert.fieldEquals('Bond__DAO__Role', roleId, 'role', role.toHex());

  clearStore();
});

// - GrantGlobalRole(bytes32,address,indexed address)
test('Will handle GrantGlobalRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  createPerformanceBondDAO();
  createPerformanceBondMediator();

  handleGrantGlobalRole(
    new GrantGlobalRole(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
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

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'roles', `[${roleId}]`);

  assert.fieldEquals('Bond__Role', roleId, 'account', account.toHex());
  assert.fieldEquals('Bond__Role', roleId, 'role', role.toHex());

  clearStore();
});

// - Initialized(uint8)
test('Will handle Initialized event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const factory = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  const contractAddress = Address.fromString(BOND_MEDIATOR_ADDRESS);
  createMockedFunction(contractAddress, "bondCreator", "bondCreator():(address)")
    .returns([ethereum.Value.fromAddress(factory)]);
        
  createPerformanceBondFactory();
  createPerformanceBondMediator();

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'factory', '');

  handleInitialized(
    new Initialized(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('version', ethereum.Value.fromI32(0)),
      ],
      null
    )
  );

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'factory', factory.toHex());
  assert.fieldEquals(
    'BondMediator',
    BOND_MEDIATOR_ADDRESS,
    'factories',
    `[${factory.toHex()}]`
  );

  clearStore();
});

// - Paused(address)
test('Will handle Paused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  createPerformanceBondMediator();

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'paused', 'false');

  handlePaused(
    new Paused(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'paused', 'true');

  clearStore();
});

// - RemoveCollateralWhitelist(indexed uint256,indexed address,indexed address)
test('Will handle RemoveCollateralWhitelist event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const treasuryAddress = Address.fromString(
    '0x7B4f352Cd40114f12e82fC675b5BA8C7582FC513'
  );

  const dao = createPerformanceBondDAO();

  const whitelistId = `${DAO_ID_HEX}-${treasuryAddress.toHex()}`;
  const whitelist = new DAOCollateralWhitelist(whitelistId);

  whitelist.dao = dao.id;

  whitelist.save();

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'collateralWhitelist', `[${whitelistId}]`);

  handleRemoveCollateralWhitelist(
    new RemoveCollateralWhitelist(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('daoId', ethereum.Value.fromI32(DAO_ID)),
        new ethereum.EventParam(
          'collateralTokens',
          ethereum.Value.fromAddress(treasuryAddress)
        ),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'collateralWhitelist', `[]`);
  assert.notInStore('Bond__DAO__CollateralWhitelist', whitelistId);

  clearStore();
});

// - RevokeDaoRole(indexed uint256,indexed bytes32,address,indexed address)
test('Will handle RevokeDaoRole event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const account = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const role = Bytes.fromI32(1);

  const dao = createPerformanceBondDAO();

  const roleId = `${DAO_ID_HEX}-${role.toHex()}-${account.toHex()}`;
  const daoRole = new DAORole(roleId);

  daoRole.dao = dao.id;
  daoRole.role = role;
  daoRole.account = account;

  daoRole.save();

  assert.fieldEquals('Bond__DAO', DAO_ID_HEX, 'roles', `[${roleId}]`);

  handleRevokeDaoRole(
    new RevokeDaoRole(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
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

  assert.notInStore('Bond__DAO__Role', roleId);

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
      Address.fromString(BOND_MEDIATOR_ADDRESS),
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

  assert.notInStore('Bond__Role', roleId);

  clearStore();
});

// - Unpaused(address)
test('Will handle Unpaused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  const bondMediator = createPerformanceBondMediator();
  bondMediator.paused = true;

  bondMediator.save();

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'paused', 'true');

  handleUnpaused(
    new Unpaused(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('BondMediator', BOND_MEDIATOR_ADDRESS, 'paused', 'false');

  clearStore();
});

// - Upgraded(indexed address)
test('Will handle Upgraded event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const implementation = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createPerformanceBondMediator();

  handleUpgraded(
    new Upgraded(
      Address.fromString(BOND_MEDIATOR_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam(
          'implementation',
          ethereum.Value.fromAddress(implementation)
        )
      ],
      null
    )
  );

  assert.fieldEquals(
    'BondMediator',
    BOND_MEDIATOR_ADDRESS,
    'implementation',
    implementation.toHex()
  );

  clearStore();
});

// - export so that these are named in the generated .wat files
export {
  handleAddPerformanceBond,
  handleAddCollateralWhitelist,
  handleAdminChanged,
  handleBeaconUpgraded,
  handleBeneficiaryUpdate,
  handlePerformanceBondCreatorUpdate,
  handleCreateDao,
  handleDaoMetaDataUpdate,
  handleDaoTreasuryUpdate,
  handleERC20Sweep,
  handleGrantDaoRole,
  handleGrantGlobalRole,
  handleInitialized,
  handlePaused,
  handleRemoveCollateralWhitelist,
  handleRevokeDaoRole,
  handleRevokeGlobalRole,
  handleUnpaused,
  handleUpgraded
} from '../src/bondMediator';
