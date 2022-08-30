// - Testing tools
import { Address, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

// - Helpers, consts and utils
import {
  defaultBigInt,
  defaultLogType,
  newBlock,
  newTransaction,
  createStakingPoolFactory,
  STAKINGPOOL_FACTORY_ADDRESS,
  defaultAddress,
  DAO_ID
} from './utils';

// - Event methods
import {
  Paused,
  Unpaused,
  StakingPoolCreated,
  BeneficiaryUpdate,
  OwnershipTransferred,
  ERC20Sweep
} from '../generated/StakingPoolFactory/StakingPoolFactory';

// - Test subjects
import {
  handlePaused,
  handleUnpaused,
  handleStakingPoolCreated,
  handleBeneficiaryUpdate,
  handleOwnershipTransferred,
  handleERC20Sweep
} from '../src/stakingPoolFactory';

// - BeneficiaryUpdate(indexed address,indexed address)
test('Will handle BeneficiaryUpdate event', () => {
  const instigatorAddress = Address.fromString(
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  );
  const beneficiaryAddress = Address.fromString(
    '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
  );

  createStakingPoolFactory();

  handleBeneficiaryUpdate(
    new BeneficiaryUpdate(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigatorAddress.toHex()),
      [
        new ethereum.EventParam(
          'beneficiary',
          ethereum.Value.fromAddress(beneficiaryAddress)
        ),
        new ethereum.EventParam(
          'instigator',
          ethereum.Value.fromAddress(instigatorAddress)
        )
      ],
      null
    )
  );

  assert.fieldEquals(
    'StakingPoolFactory',
    STAKINGPOOL_FACTORY_ADDRESS,
    'beneficiary',
    beneficiaryAddress.toHex()
  );

  clearStore();
});

// - OwnershipTransferred(indexed address,indexed address)
test('Will handle OwnershipTransferred event', () => {
  const newOwner = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const previousOwner = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createStakingPoolFactory();

  handleOwnershipTransferred(
    new OwnershipTransferred(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(),
      [
        new ethereum.EventParam(
          'previousOwner',
          ethereum.Value.fromAddress(previousOwner)
        ),
        new ethereum.EventParam('newOwner', ethereum.Value.fromAddress(newOwner))
      ],
      null
    )
  );

  assert.fieldEquals(
    'StakingPoolFactory',
    STAKINGPOOL_FACTORY_ADDRESS,
    'owner',
    newOwner.toHex()
  );

  clearStore();
});

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
test('Will handle ERC20Sweep event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const beneficiary = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  const sweepId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  createStakingPoolFactory();

  handleERC20Sweep(
    new ERC20Sweep(
      Address.fromString(STAKINGPOOL_FACTORY_ADDRESS),
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

  assert.fieldEquals(
    'StakingPoolFactory',
    STAKINGPOOL_FACTORY_ADDRESS,
    'sweeps',
    `[${sweepId}]`
  );

  assert.fieldEquals('StakingPoolFactory__Sweep', sweepId, 'amount', `${amount}`);
  assert.fieldEquals('StakingPoolFactory__Sweep', sweepId, 'token', `${tokens.toHex()}`);
  assert.fieldEquals(
    'StakingPoolFactory__Sweep',
    sweepId,
    'beneficiary',
    `${beneficiary.toHex()}`
  );

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
        new ethereum.EventParam('config', ethereum.Value.fromTuple(changetype<ethereum.Tuple>([
          ethereum.Value.fromI32(DAO_ID),
          ethereum.Value.fromI32(0),
          ethereum.Value.fromI32(0),
          ethereum.Value.fromI32(minimumContribution),
          ethereum.Value.fromI32(epochDuration),
          ethereum.Value.fromI32(epochStartTimestamp),
          ethereum.Value.fromAddress(treasury),
          ethereum.Value.fromAddress(stakeToken),
          ethereum.Value.fromArray([ethereum.Value.fromTuple(reward)]),
          ethereum.Value.fromI32(rewardType)
        ]))),
        new ethereum.EventParam('creator', ethereum.Value.fromAddress(creator))
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

// - Export so that these are named in the generated .wat files
export {
  handlePaused,
  handleUnpaused,
  handleStakingPoolCreated,
  handleBeneficiaryUpdate,
  handleOwnershipTransferred,
  handleERC20Sweep
} from '../src/stakingPoolFactory';
