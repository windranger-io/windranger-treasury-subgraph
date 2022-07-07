// - Testing tools
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

// - Helpers, consts and utils
import {
  createStakingPool,
  createStakingPoolReward,
  defaultAddress,
  defaultBigInt,
  defaultLogType,
  newBlock,
  newTransaction,
  STAKINGPOOL_ADDRESS,
  STAKINGPOOL_REWARD_ADDRESS
} from './utils';

// - Event methods
import {
  BeneficiaryUpdate,
  Deposit,
  EmergencyMode,
  ERC20Sweep,
  InitializeRewards,
  OwnershipTransferred,
  Paused,
  RewardsAvailableTimestamp,
  Unpaused,
  WithdrawRewards,
  WithdrawStake
} from '../generated/templates/StakingPool/StakingPool';

// - Test subjects
import {
  handleBeneficiaryUpdate,
  handleDeposit,
  handleEmergencyMode,
  handleERC20Sweep,
  handleInitializeRewards,
  handleOwnershipTransferred,
  handlePaused,
  handleRewardsAvailableTimestamp,
  handleUnpaused,
  handleWithdrawRewards,
  handleWithdrawStake
} from '../src/stakingPool';

// - BeneficiaryUpdate(indexed address,indexed address)
test('Will handle BeneficiaryUpdate event', () => {
  const instigatorAddress = Address.fromString(
    '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
  );
  const beneficiaryAddress = Address.fromString(
    '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
  );

  createStakingPool();

  handleBeneficiaryUpdate(
    new BeneficiaryUpdate(
      Address.fromString(STAKINGPOOL_ADDRESS),
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
    'StakingPool',
    STAKINGPOOL_ADDRESS,
    'beneficiary',
    beneficiaryAddress.toHex()
  );

  clearStore();
});

// - OwnershipTransferred(indexed address,indexed address)
test('Will handle OwnershipTransferred event', () => {
  const newOwner = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const previousOwner = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createStakingPool();

  handleOwnershipTransferred(
    new OwnershipTransferred(
      Address.fromString(STAKINGPOOL_ADDRESS),
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

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'owner', newOwner.toHex());

  clearStore();
});

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
test('Will handle ERC20Sweep event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const beneficiary = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  const sweepId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  createStakingPool();

  handleERC20Sweep(
    new ERC20Sweep(
      Address.fromString(STAKINGPOOL_ADDRESS),
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

  assert.fieldEquals('StakingPool', STAKINGPOOL_ADDRESS, 'sweeps', `[${sweepId}]`);

  assert.fieldEquals('StakingPool__Sweep', sweepId, 'amount', `${amount}`);
  assert.fieldEquals('StakingPool__Sweep', sweepId, 'token', `${tokens.toHex()}`);
  assert.fieldEquals(
    'StakingPool__Sweep',
    sweepId,
    'beneficiary',
    `${beneficiary.toHex()}`
  );

  clearStore();
});

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

// - Export so that these are named in the generated .wat files
export {
  handleBeneficiaryUpdate,
  handleDeposit,
  handleEmergencyMode,
  handleERC20Sweep,
  handleInitializeRewards,
  handleOwnershipTransferred,
  handlePaused,
  handleRewardsAvailableTimestamp,
  handleUnpaused,
  handleWithdrawRewards,
  handleWithdrawStake
} from '../src/stakingPool';
