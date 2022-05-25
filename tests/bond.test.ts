import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

import {
  BOND_ADDRESS,
  createBond,
  defaultAddress,
  defaultBigInt,
  defaultLogType,
  newBlock,
  newTransaction
} from './utils';

import {
  AllowRedemption,
  ClaimReward,
  Deposit,
  ERC20Sweep,
  Expire,
  FullCollateral,
  MetaDataUpdate,
  OwnershipTransferred,
  PartialCollateral,
  Paused,
  RedeemableUpdate,
  Redemption,
  RedemptionTimestampUpdate,
  RegisterReward,
  RewardDebt,
  RewardTimeLockUpdate,
  SlashDeposits,
  Transfer,
  Unpaused,
  WithdrawCollateral
} from '../generated/templates/SingleCollateralMultiRewardBond/SingleCollateralMultiRewardBond';
import {
  handleAllowRedemption,
  handleClaimReward,
  handleDeposit,
  handleERC20Sweep,
  handleExpire,
  handleFullCollateral,
  handleMetaDataUpdate,
  handleOwnershipTransferred,
  handlePartialCollateral,
  handlePaused,
  handleRedeemableUpdate,
  handleRedemption,
  handleRedemptionTimestampUpdate,
  handleRegisterReward,
  handleRewardDebt,
  handleRewardTimeLockUpdate,
  handleSlashDeposits,
  handleTransfer,
  handleUnpaused,
  handleWithdrawCollateral
} from '../src/bond';

// -  AllowRedemption(indexed address,string)
test('Will handle AllowRedemption event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const authorizer = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');

  createBond();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'isRedeemable', 'false');

  handleAllowRedemption(
    new AllowRedemption(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam(
          'redeemableAuthorizer',
          ethereum.Value.fromAddress(authorizer)
        ),
        new ethereum.EventParam('redeemableReason', ethereum.Value.fromString('test'))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'isRedeemable', 'true');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableReason', 'test');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableAuthorizer', authorizer.toHex());

  clearStore();
});

// -  ClaimReward(indexed address,uint256,indexed address)
test('Will handle ClaimReward event', () => {
  const claimant = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  const claimId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  createBond();

  handleClaimReward(
    new ClaimReward(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(claimant.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(claimant))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'rewardsClaimed', `[${claimId}]`);

  assert.fieldEquals('Bond__RewardClaimed', claimId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__RewardClaimed', claimId, 'claimant', claimant.toHex());
  assert.fieldEquals('Bond__RewardClaimed', claimId, 'amount', amount.toString());
  assert.fieldEquals('Bond__RewardClaimed', claimId, 'tokens', tokens.toHex());

  clearStore();
});

// -  Deposit(indexed address,indexed address,uint256,indexed address)
test('Will handle Deposit event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const depositor = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  const depositId = `${BOND_ADDRESS}-${depositor.toHex()}-${tokens.toHex()}`;

  createBond();

  handleDeposit(
    new Deposit(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('depositor', ethereum.Value.fromAddress(depositor)),
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', amount.toString());
  assert.fieldEquals('Bond', BOND_ADDRESS, 'deposits', `[${depositId}]`);

  assert.fieldEquals('Bond__Deposit', depositId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Deposit', depositId, 'depositor', depositor.toHex());
  assert.fieldEquals('Bond__Deposit', depositId, 'collateralAmount', amount.toString());
  assert.fieldEquals('Bond__Deposit', depositId, 'collateralTokens', tokens.toHex());

  clearStore();
});

// -  ERC20Sweep(indexed address,indexed address,uint256,indexed address)
test('Will handle ERC20Sweep event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const beneficiary = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  const bond = createBond();
  bond.collateralAmount = BigInt.fromI32(amount);

  bond.save();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', amount.toString());

  handleERC20Sweep(
    new ERC20Sweep(
      Address.fromString(BOND_ADDRESS),
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

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');

  clearStore();
});

// -  Expire(indexed address,indexed address,uint256,indexed address)
test('Will handle Expire event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const treasury = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  const bond = createBond();
  bond.collateralAmount = BigInt.fromI32(amount);

  bond.save();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', amount.toString());

  handleExpire(
    new Expire(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(treasury)),
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'expired', 'true');

  clearStore();
});

// -  FullCollateral(indexed address,uint256,indexed address)
test('Will handle FullCollateral event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;

  createBond();

  handleFullCollateral(
    new FullCollateral(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', amount.toString());
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralFull', 'true');

  clearStore();
});

// -  MetaDataUpdate(string,indexed address)
test('Will handle MetaDataUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const data = 'data string;';

  createBond();

  handleMetaDataUpdate(
    new MetaDataUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('data', ethereum.Value.fromString(data)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'metadata', `[${BOND_ADDRESS}]`);
  assert.fieldEquals('Bond__Metadata', BOND_ADDRESS, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Metadata', BOND_ADDRESS, 'data', data);

  clearStore();
});

// -  OwnershipTransferred(indexed address,indexed address)
test('Will handle OwnershipTransferred event', () => {
  const previousOwner = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const newOwner = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');

  createBond();

  handleOwnershipTransferred(
    new OwnershipTransferred(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(previousOwner.toHex()),
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

  assert.fieldEquals('Bond', BOND_ADDRESS, 'owner', newOwner.toHex());

  clearStore();
});

// -  PartialCollateral(indexed address,uint256,indexed address,uint256,indexed address)
test('Will handle PartialCollateral event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;
  const debt = 10;

  createBond();

  handlePartialCollateral(
    new PartialCollateral(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('debtTokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('debtRemaining', ethereum.Value.fromI32(debt)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'redemptionExcess', '10');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '100');

  clearStore();
});

// -  Paused(address)
test('Will handle Paused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  createBond();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'false');

  handlePaused(
    new Paused(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'true');

  clearStore();
});

// -  RedeemableUpdate(bool,string,indexed address)
test('Will handle RedeemableUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const isRedeemable = true;
  const reason = 'it is time';

  createBond();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'false');

  handleRedeemableUpdate(
    new RedeemableUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('isRedeemable', ethereum.Value.fromBoolean(isRedeemable)),
        new ethereum.EventParam('reason', ethereum.Value.fromString(reason)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'isRedeemable', isRedeemable.toString());
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableReason', reason);
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableAuthorizer', instigator.toHex());

  clearStore();
});

// -  Redemption(indexed address,indexed address,uint256,indexed address,uint256)
test('Will handle Redemption event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const redeemer = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const amount = 100;
  const debt = 0;

  const redemptionId = `${BOND_ADDRESS}-${redeemer.toHex()}-${tokens.toHex()}`;

  const bond = createBond();
  bond.collateralAmount = BigInt.fromI32(100);

  bond.save();

  handleRedemption(
    new Redemption(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('redeemer', ethereum.Value.fromAddress(redeemer)),
        new ethereum.EventParam('debtTokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('debtRemaining', ethereum.Value.fromI32(debt)),
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redemptions', `[${redemptionId}]`);

  assert.fieldEquals('Bond__Redemption', redemptionId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Redemption', redemptionId, 'redeemer', redeemer.toHex());
  assert.fieldEquals(
    'Bond__Redemption',
    redemptionId,
    'collateralAmount',
    amount.toString()
  );
  assert.fieldEquals(
    'Bond__Redemption',
    redemptionId,
    'collateralTokens',
    tokens.toHex()
  );
  assert.fieldEquals('Bond__Redemption', redemptionId, 'debtAmount', debt.toString());
  assert.fieldEquals('Bond__Redemption', redemptionId, 'debtTokens', tokens.toHex());

  clearStore();
});

// -  RedemptionTimestampUpdate(uint256,indexed address)
test('Will handle RedemptionTimestampUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const date = new Date(1215752000);
  const timestamp = i32(Math.floor(i32(date.getTime()) / 1000));

  createBond();

  handleRedemptionTimestampUpdate(
    new RedemptionTimestampUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('redeemableTimestamp', ethereum.Value.fromI32(timestamp))],
      null
    )
  );

  assert.fieldEquals(
    'Bond',
    BOND_ADDRESS,
    'redeemableTimestamp',
    `${timestamp.toString()}`
  );

  clearStore();
});

// -  RegisterReward(indexed address,uint256,uint256,indexed address)
test('Will handle RegisterReward event', () => {
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const date = new Date(1215752000);
  const timestamp = i32(Math.floor(i32(date.getTime()) / 1000));
  const amount = 100;
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  const rewardPoolId = `${BOND_ADDRESS}-${tokens.toHex()}`;

  createBond();

  handleRegisterReward(
    new RegisterReward(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('timelock', ethereum.Value.fromI32(timestamp)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'rewards', `[${rewardPoolId}]`);

  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'tokens', tokens.toHex());
  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'timeLock', timestamp.toString());
  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'amount', amount.toString());

  clearStore();
});

// -  RewardDebt(indexed address,indexed address,uint256,indexed address)
test('Will handle RewardDebt event', () => {
  const claimant = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const rewardDebt = 100;
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  const rewardDebtId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  createBond();

  handleRewardDebt(
    new RewardDebt(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('claimant', ethereum.Value.fromAddress(claimant)),
        new ethereum.EventParam('rewardDebt', ethereum.Value.fromI32(rewardDebt)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'rewardDebts', `[${rewardDebtId}]`);

  assert.fieldEquals('Bond__RewardDebt', rewardDebtId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__RewardDebt', rewardDebtId, 'claimant', claimant.toHex());
  assert.fieldEquals('Bond__RewardDebt', rewardDebtId, 'tokens', tokens.toHex());
  assert.fieldEquals('Bond__RewardDebt', rewardDebtId, 'rewardDebt', rewardDebt.toString());

  clearStore();
});

// -  RewardTimeLockUpdate(indexed address,uint256,indexed address)
test('Will handle RewardTimeLockUpdate event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const date = new Date(1215752000);
  const timestamp = i32(Math.floor(i32(date.getTime()) / 1000));

  const rewardPoolId = `${BOND_ADDRESS}-${tokens.toHex()}`;

  handleRewardTimeLockUpdate(
    new RewardTimeLockUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('timelock', ethereum.Value.fromI32(timestamp)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'timeLock', timestamp.toString());

  clearStore();
});

// -  SlashDeposits(indexed address,uint256,string,indexed address)
test('Will handle SlashDeposits event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const reason = 'coz';
  const amount = 100;

  const slashId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  const bond = createBond();
  bond.collateralAmount = BigInt.fromI32(amount);

  bond.save();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', amount.toString());

  handleSlashDeposits(
    new SlashDeposits(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('reason', ethereum.Value.fromString(reason)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'slashedDeposits', `[${slashId}]`);

  assert.fieldEquals('Bond__SlashDeposit', slashId, 'bond', bond.id);
  assert.fieldEquals('Bond__SlashDeposit', slashId, 'collateralTokens', tokens.toHex());
  assert.fieldEquals(
    'Bond__SlashDeposit',
    slashId,
    'collateralAmount',
    amount.toString()
  );
  assert.fieldEquals('Bond__SlashDeposit', slashId, 'reason', reason);

  clearStore();
});

// -  Transfer(indexed address,indexed address,uint256)
test('Will handle Transfer event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const from = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const to = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');
  const value = 100;

  const transferId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  const bond = createBond();
  bond.collateralAmount = BigInt.fromI32(100);

  bond.save();

  handleTransfer(
    new Transfer(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('from', ethereum.Value.fromAddress(from)),
        new ethereum.EventParam('to', ethereum.Value.fromAddress(to)),
        new ethereum.EventParam('value', ethereum.Value.fromI32(value))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'transfers', `[${transferId}]`);

  assert.fieldEquals('Bond__Transfer', transferId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Transfer', transferId, 'from', from.toHex());
  assert.fieldEquals('Bond__Transfer', transferId, 'to', to.toHex());
  assert.fieldEquals('Bond__Transfer', transferId, 'value', value.toString());

  clearStore();
});

// -  Unpaused(address)
test('Will handle Unpaused event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');

  const bond = createBond();
  bond.paused = true;

  bond.save();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'true');

  handleUnpaused(
    new Unpaused(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(instigator))],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'false');

  clearStore();
});

// -  WithdrawCollateral(indexed address,indexed address,uint256,indexed address)
const withdrawCollateral = (
  treasury: Address,
  tokens: Address,
  amount: i32,
  instigator: Address
): void => {
  handleWithdrawCollateral(
    new WithdrawCollateral(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(instigator.toHex()),
      [
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(treasury)),
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(tokens)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(instigator))
      ],
      null
    )
  );
};
test('Will handle WithdrawCollateral event', () => {
  const instigator = Address.fromString('0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266');
  const treasury = Address.fromString('0x70997970c51812dc3a010c7d01b50e0d17dc79c8');
  const tokens = Address.fromString('0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199');

  const bond = createBond();
  bond.collateralAmount = BigInt.fromI32(1000);

  bond.save();

  withdrawCollateral(treasury, tokens, 100, instigator);
  assert.fieldEquals(
    'Bond',
    BOND_ADDRESS,
    'collateralAmount',
    (bond.collateralAmount = bond.collateralAmount.minus(BigInt.fromI32(100))).toString()
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '900');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralWithdrawn', 'false');

  withdrawCollateral(treasury, tokens, 900, instigator);
  assert.fieldEquals(
    'Bond',
    BOND_ADDRESS,
    'collateralAmount',
    (bond.collateralAmount = bond.collateralAmount.minus(BigInt.fromI32(900))).toString()
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralWithdrawn', 'true');

  clearStore();
});
