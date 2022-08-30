// - Testing tools
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

// - Helpers, consts and utils
import {
  BENEFICIARY,
  BOND_ADDRESS,
  BOND_FACTORY_ADDRESS,
  createPerformanceBondFactory,
  defaultAddress,
  defaultBigInt,
  defaultLogType,
  EMPTY_ADDRESS,
  INSTIGATOR,
  newBlock,
  newTransaction,
  OWNER_NEW,
  OWNER_OLD,
  TOKEN,
  TREASURY
} from './utils';

// - Event methods
import {
  BeneficiaryUpdate,
  CreatePerformanceBond,
  ERC20Sweep,
  OwnershipTransferred,
  Paused,
  Unpaused
} from '../generated/PerformanceBondFactory/PerformanceBondFactory';

// - Test subjects
import {
  handleBeneficiaryUpdate,
  handleCreatePerformanceBond,
  handleERC20Sweep,
  handleOwnershipTransferred,
  handlePaused,
  handleUnpaused
} from '../src/bondFactory';

// - CreatePerformanceBond(indexed address,(string,string,string),(uint256,address,uint256,uint256),(address,uint128,uint128)[],indexed address,indexed address)
test('Will handle CreatePerformanceBond event', () => {
  const bondAddress = Address.fromString(BOND_ADDRESS);

  createPerformanceBondFactory();

  const metadata = changetype<ethereum.Tuple>([
    ethereum.Value.fromString('A highly unique bond name'),
    ethereum.Value.fromString('Bond Symbol'),
    ethereum.Value.fromString('meh')
  ]);

  const configuration = changetype<ethereum.Tuple>([
    ethereum.Value.fromI32(101),
    ethereum.Value.fromAddress(TREASURY),
    ethereum.Value.fromI32(9999),
    ethereum.Value.fromI32(1)
  ]);

  handleCreatePerformanceBond(
    new CreatePerformanceBond(
      Address.fromString(BOND_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('bond', ethereum.Value.fromAddress(bondAddress)),
        new ethereum.EventParam('metadata', ethereum.Value.fromTuple(metadata)),
        new ethereum.EventParam('configuration', ethereum.Value.fromTuple(configuration)),
        new ethereum.EventParam('rewards', ethereum.Value.fromArray([])),
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(TREASURY)),
        new ethereum.EventParam(
          'instigator',
          ethereum.Value.fromAddress(INSTIGATOR)
        )
      ],
      null
    )
  );

  assert.fieldEquals(
    'BondFactory',
    BOND_FACTORY_ADDRESS,
    'bonds',
    `[${bondAddress.toHex()}]`
  );

  assert.fieldEquals('Bond', bondAddress.toHex(), 'treasury', TREASURY.toHex());
  assert.fieldEquals('Bond', bondAddress.toHex(), 'owner', INSTIGATOR.toHex());
  assert.fieldEquals('Bond', bondAddress.toHex(), 'isRedeemable', 'false');
  assert.fieldEquals('Bond', bondAddress.toHex(), 'redeemableReason', '');
  assert.fieldEquals('Bond', bondAddress.toHex(), 'redeemableAuthorizer', EMPTY_ADDRESS);
  assert.fieldEquals('Bond', bondAddress.toHex(), 'redeemableTimestamp', '0');
  assert.fieldEquals('Bond', bondAddress.toHex(), 'redemptionExcess', '0');
  assert.fieldEquals('Bond', bondAddress.toHex(), 'collateralAmount', '0');
  assert.fieldEquals('Bond', bondAddress.toHex(), 'collateralFull', 'false');
  assert.fieldEquals('Bond', bondAddress.toHex(), 'collateralSlashed', '0');
  assert.fieldEquals(
    'Bond',
    bondAddress.toHex(),
    'collateralTokens',
    TREASURY.toHex()
  );
  assert.fieldEquals('Bond', bondAddress.toHex(), 'collateralWithdrawn', 'false');
  assert.fieldEquals('Bond', bondAddress.toHex(), 'paused', 'false');

  assert.fieldEquals('Bond', bondAddress.toHex(), 'metadata', `[${bondAddress.toHex()}]`);
  assert.fieldEquals(
    'Bond',
    bondAddress.toHex(),
    'configuration',
    `[${bondAddress.toHex()}]`
  );

  assert.fieldEquals(
    'Bond__Metadata',
    bondAddress.toHex(),
    'name',
    'A highly unique bond name'
  );
  assert.fieldEquals('Bond__Metadata', bondAddress.toHex(), 'symbol', 'Bond Symbol');
  assert.fieldEquals('Bond__Metadata', bondAddress.toHex(), 'data', 'meh');

  assert.fieldEquals(
    'Bond__Configuration',
    bondAddress.toHex(),
    'debtTokenAmount',
    '101'
  );
  assert.fieldEquals(
    'Bond__Configuration',
    bondAddress.toHex(),
    'collateralTokens',
    TREASURY.toHex()
  );
  assert.fieldEquals(
    'Bond__Configuration',
    bondAddress.toHex(),
    'expiryTimestamp',
    '9999'
  );
  assert.fieldEquals('Bond__Configuration', bondAddress.toHex(), 'minimumDeposit', '1');

  clearStore();
});

// - BeneficiaryUpdate(indexed address,indexed address)
test('Will handle BeneficiaryUpdate event', () => {

  createPerformanceBondFactory();

  handleBeneficiaryUpdate(
    new BeneficiaryUpdate(
      Address.fromString(BOND_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam(
          'beneficiary',
          ethereum.Value.fromAddress(BENEFICIARY)
        ),
        new ethereum.EventParam(
          'instigator',
          ethereum.Value.fromAddress(INSTIGATOR)
        )
      ],
      null
    )
  );

  assert.fieldEquals(
    'BondFactory',
    BOND_FACTORY_ADDRESS,
    'beneficiary',
    BENEFICIARY.toHex()
  );

  clearStore();
});

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
test('Will handle ERC20Sweep event', () => {
  const amount = 100;

  const sweepId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  createPerformanceBondFactory();

  handleERC20Sweep(
    new ERC20Sweep(
      Address.fromString(BOND_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('beneficiary', ethereum.Value.fromAddress(BENEFICIARY)),
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('BondFactory', BOND_FACTORY_ADDRESS, 'sweeps', `[${sweepId}]`);

  assert.fieldEquals('BondFactory__Sweep', sweepId, 'amount', `${amount}`);
  assert.fieldEquals('BondFactory__Sweep', sweepId, 'token', `${TOKEN.toHex()}`);
  assert.fieldEquals(
    'BondFactory__Sweep',
    sweepId,
    'beneficiary',
    `${BENEFICIARY.toHex()}`
  );

  clearStore();
});

// - OwnershipTransferred(indexed address,indexed address)
test('Will handle OwnershipTransferred event', () => {
  createPerformanceBondFactory();

  handleOwnershipTransferred(
    new OwnershipTransferred(
      Address.fromString(BOND_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam(
          'previousOwner',
          ethereum.Value.fromAddress(OWNER_OLD)
        ),
        new ethereum.EventParam('newOwner', ethereum.Value.fromAddress(OWNER_NEW))
      ],
      null
    )
  );

  assert.fieldEquals('BondFactory', BOND_FACTORY_ADDRESS, 'owner', OWNER_NEW.toHex());

  clearStore();
});

// - Paused(address)
test('Will handle Paused event', () => {
  createPerformanceBondFactory();

  assert.fieldEquals('BondFactory', BOND_FACTORY_ADDRESS, 'paused', 'false');

  handlePaused(
    new Paused(
      Address.fromString(BOND_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam(
          'account',
          ethereum.Value.fromString(BOND_FACTORY_ADDRESS)
        )
      ],
      null
    )
  );

  assert.fieldEquals('BondFactory', BOND_FACTORY_ADDRESS, 'paused', 'true');

  clearStore();
});

// - Unpaused(address)
test('Will handle Unpaused event', () => {
  const bondFactory = createPerformanceBondFactory();
  bondFactory.paused = true;
  bondFactory.save();

  assert.fieldEquals('BondFactory', BOND_FACTORY_ADDRESS, 'paused', 'true');

  handleUnpaused(
    new Unpaused(
      Address.fromString(BOND_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam(
          'account',
          ethereum.Value.fromString(BOND_FACTORY_ADDRESS)
        )
      ],
      null
    )
  );

  assert.fieldEquals('BondFactory', BOND_FACTORY_ADDRESS, 'paused', 'false');

  clearStore();
});

// - Export so that these are named in the generated .wat files
export {
  handleBeneficiaryUpdate,
  handleCreatePerformanceBond,
  handleERC20Sweep,
  handleOwnershipTransferred,
  handlePaused,
  handleUnpaused
} from '../src/bondFactory';
