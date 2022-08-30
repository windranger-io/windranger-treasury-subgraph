// - Testing tools
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';

// - Helpers, consts and utils
import {
  AUTHORIZER,
  BENEFICIARY,
  BOND_ADDRESS,
  CLAIMANT,
  createPerformanceBond,
  defaultAddress,
  defaultBigInt,
  defaultLogType,
  DEPOSITOR,
  FROM,
  INSTIGATOR,
  newBlock,
  newTransaction,
  OWNER_NEW,
  OWNER_OLD,
  REDEEMER,
  TO,
  TOKEN,
  TREASURY
} from './utils';

// - Event methods
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
} from '../generated/templates/SingleCollateralMultiRewardPerformanceBond/SingleCollateralMultiRewardPerformanceBond';

// - Test subjects
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

// - AllowRedemption(indexed address,string)
test('Will handle AllowRedemption event', () => {
  createPerformanceBond();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'isRedeemable', 'false');

  handleAllowRedemption(
    new AllowRedemption(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam(
          'redeemableAuthorizer',
          ethereum.Value.fromAddress(AUTHORIZER)
        ),
        new ethereum.EventParam('redeemableReason', ethereum.Value.fromString('test'))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'isRedeemable', 'true');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableReason', 'test');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableAuthorizer', AUTHORIZER.toHex());

  clearStore();
});

// - ClaimReward(indexed address,uint256,indexed address)
test('Will handle ClaimReward event', () => {  
  const amount = 100;

  createPerformanceBond();

  handleClaimReward(
    new ClaimReward(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(CLAIMANT.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(CLAIMANT))
      ],
      null
    )
  );

  const claimId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  assert.fieldEquals('Bond', BOND_ADDRESS, 'rewardsClaimed', `[${claimId}]`);

  assert.fieldEquals('Bond__RewardClaimed', claimId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__RewardClaimed', claimId, 'claimant', CLAIMANT.toHex());
  assert.fieldEquals('Bond__RewardClaimed', claimId, 'amount', amount.toString());
  assert.fieldEquals('Bond__RewardClaimed', claimId, 'tokens', TOKEN.toHex());

  clearStore();
});

// - Deposit(indexed address,indexed address,uint256,indexed address)
test('Will handle Deposit event', () => {
  const amount = 100;

  const depositId = `${BOND_ADDRESS}-${DEPOSITOR.toHex()}-${TOKEN.toHex()}`;

  createPerformanceBond();

  handleDeposit(
    new Deposit(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('depositor', ethereum.Value.fromAddress(DEPOSITOR)),
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', amount.toString());
  assert.fieldEquals('Bond', BOND_ADDRESS, 'deposits', `[${depositId}]`);

  assert.fieldEquals('Bond__Deposit', depositId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Deposit', depositId, 'depositor', DEPOSITOR.toHex());
  assert.fieldEquals('Bond__Deposit', depositId, 'collateralAmount', amount.toString());
  assert.fieldEquals('Bond__Deposit', depositId, 'collateralTokens', TOKEN.toHex());

  clearStore();
});

// - ERC20Sweep(indexed address,indexed address,uint256,indexed address)
test('Will handle ERC20Sweep event', () => {
  const amount = 100;

  const sweepId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  const bond = createPerformanceBond();
  bond.collateralTokens = TOKEN;
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

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'sweeps', `[${sweepId}]`);

  assert.fieldEquals('Bond__Sweep', sweepId, 'amount', `${amount}`);
  assert.fieldEquals('Bond__Sweep', sweepId, 'token', `${TOKEN.toHex()}`);
  assert.fieldEquals('Bond__Sweep', sweepId, 'beneficiary', `${BENEFICIARY.toHex()}`);

  clearStore();
});

// - Expire(indexed address,indexed address,uint256,indexed address)
test('Will handle Expire event', () => {
  const amount = 100;

  const bond = createPerformanceBond();
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
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(TREASURY)),
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'expired', 'true');

  clearStore();
});

// - FullCollateral(indexed address,uint256,indexed address)
test('Will handle FullCollateral event', () => {
  const amount = 100;

  createPerformanceBond();

  handleFullCollateral(
    new FullCollateral(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', amount.toString());
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralFull', 'true');

  clearStore();
});

// - MetaDataUpdate(string,indexed address)
test('Will handle MetaDataUpdate event', () => {
  const data = 'data string;';

  createPerformanceBond();

  handleMetaDataUpdate(
    new MetaDataUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('data', ethereum.Value.fromString(data)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'metadata', `[${BOND_ADDRESS}]`);
  assert.fieldEquals('Bond__Metadata', BOND_ADDRESS, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Metadata', BOND_ADDRESS, 'data', data);

  clearStore();
});

// - OwnershipTransferred(indexed address,indexed address)
test('Will handle OwnershipTransferred event', () => {

  createPerformanceBond();

  handleOwnershipTransferred(
    new OwnershipTransferred(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(OWNER_OLD.toHex()),
      [
        new ethereum.EventParam(
          'OWNER_OLD',
          ethereum.Value.fromAddress(OWNER_OLD)
        ),
        new ethereum.EventParam('newOwner', ethereum.Value.fromAddress(OWNER_NEW))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'owner', OWNER_NEW.toHex());

  clearStore();
});

// - PartialCollateral(indexed address,uint256,indexed address,uint256,indexed address)
test('Will handle PartialCollateral event', () => {
  const amount = 100;
  const debt = 10;

  createPerformanceBond();

  handlePartialCollateral(
    new PartialCollateral(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('debtTokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('debtRemaining', ethereum.Value.fromI32(debt)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'redemptionExcess', '10');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '100');

  clearStore();
});

// - Paused(address)
test('Will handle Paused event', () => {

  createPerformanceBond();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'false');

  handlePaused(
    new Paused(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(INSTIGATOR))],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'true');

  clearStore();
});

// - RedeemableUpdate(bool,string,indexed address)
test('Will handle RedeemableUpdate event', () => {
  const isRedeemable = true;
  const reason = 'it is time';

  createPerformanceBond();

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'false');

  handleRedeemableUpdate(
    new RedeemableUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('isRedeemable', ethereum.Value.fromBoolean(isRedeemable)),
        new ethereum.EventParam('reason', ethereum.Value.fromString(reason)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'isRedeemable', isRedeemable.toString());
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableReason', reason);
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redeemableAuthorizer', INSTIGATOR.toHex());

  clearStore();
});

// - Redemption(indexed address,indexed address,uint256,indexed address,uint256)
test('Will handle Redemption event', () => {
  const amount = 100;
  const debt = 0;

  const redemptionId = `${BOND_ADDRESS}-${REDEEMER.toHex()}-${TOKEN.toHex()}`;

  const bond = createPerformanceBond();
  bond.collateralAmount = BigInt.fromI32(100);

  bond.save();

  handleRedemption(
    new Redemption(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('redeemer', ethereum.Value.fromAddress(REDEEMER)),
        new ethereum.EventParam('debtTokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('debtRemaining', ethereum.Value.fromI32(debt)),
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'redemptions', `[${redemptionId}]`);

  assert.fieldEquals('Bond__Redemption', redemptionId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Redemption', redemptionId, 'redeemer', REDEEMER.toHex());
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
    TOKEN.toHex()
  );
  assert.fieldEquals('Bond__Redemption', redemptionId, 'debtAmount', debt.toString());
  assert.fieldEquals('Bond__Redemption', redemptionId, 'debtTokens', TOKEN.toHex());

  clearStore();
});

// - RedemptionTimestampUpdate(uint256,indexed address)
test('Will handle RedemptionTimestampUpdate event', () => {
  const date = new Date(1215752000);
  const timestamp = i32(Math.floor(i32(date.getTime()) / 1000));

  createPerformanceBond();

  handleRedemptionTimestampUpdate(
    new RedemptionTimestampUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
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

// - RegisterReward(indexed address,uint256,uint256,indexed address)
test('Will handle RegisterReward event', () => {
  const date = new Date(1215752000);
  const timestamp = i32(Math.floor(i32(date.getTime()) / 1000));
  const amount = 100;

  const rewardPoolId = `${BOND_ADDRESS}-${TOKEN.toHex()}`;

  createPerformanceBond();

  handleRegisterReward(
    new RegisterReward(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('amount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('timelock', ethereum.Value.fromI32(timestamp)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'rewards', `[${rewardPoolId}]`);

  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'tokens', TOKEN.toHex());
  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'timeLock', timestamp.toString());
  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'amount', amount.toString());

  clearStore();
});

// - RewardDebt(indexed address,indexed address,uint256,indexed address)
test('Will handle RewardDebt event', () => {
  const rewardDebt = 100;

  const rewardDebtId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  createPerformanceBond();

  handleRewardDebt(
    new RewardDebt(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('claimant', ethereum.Value.fromAddress(CLAIMANT)),
        new ethereum.EventParam('rewardDebt', ethereum.Value.fromI32(rewardDebt)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'rewardDebts', `[${rewardDebtId}]`);

  assert.fieldEquals('Bond__RewardDebt', rewardDebtId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__RewardDebt', rewardDebtId, 'claimant', CLAIMANT.toHex());
  assert.fieldEquals('Bond__RewardDebt', rewardDebtId, 'tokens', TOKEN.toHex());
  assert.fieldEquals(
    'Bond__RewardDebt',
    rewardDebtId,
    'rewardDebt',
    rewardDebt.toString()
  );

  clearStore();
});

// - RewardTimeLockUpdate(indexed address,uint256,indexed address)
test('Will handle RewardTimeLockUpdate event', () => {
  const date = new Date(1215752000);
  const timestamp = i32(Math.floor(i32(date.getTime()) / 1000));

  const rewardPoolId = `${BOND_ADDRESS}-${TOKEN.toHex()}`;

  handleRewardTimeLockUpdate(
    new RewardTimeLockUpdate(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('tokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('timelock', ethereum.Value.fromI32(timestamp)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('Bond__RewardPool', rewardPoolId, 'timeLock', timestamp.toString());

  clearStore();
});

// - SlashDeposits(indexed address,uint256,string,indexed address)
test('Will handle SlashDeposits event', () => {
  const reason = 'coz';
  const amount = 100;

  const slashId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  const bond = createPerformanceBond();
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
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('reason', ethereum.Value.fromString(reason)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '0');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'slashedDeposits', `[${slashId}]`);

  assert.fieldEquals('Bond__SlashDeposit', slashId, 'bond', bond.id);
  assert.fieldEquals('Bond__SlashDeposit', slashId, 'collateralTokens', TOKEN.toHex());
  assert.fieldEquals(
    'Bond__SlashDeposit',
    slashId,
    'collateralAmount',
    amount.toString()
  );
  assert.fieldEquals('Bond__SlashDeposit', slashId, 'reason', reason);

  clearStore();
});

// - Transfer(indexed address,indexed address,uint256)
test('Will handle Transfer event', () => {
  const value = 100;

  const transferId = `${defaultAddress.toHex()}-${defaultBigInt.toHex()}`;

  const bond = createPerformanceBond();
  bond.collateralAmount = BigInt.fromI32(100);

  bond.save();

  handleTransfer(
    new Transfer(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('from', ethereum.Value.fromAddress(FROM)),
        new ethereum.EventParam('to', ethereum.Value.fromAddress(TO)),
        new ethereum.EventParam('value', ethereum.Value.fromI32(value))
      ],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'transfers', `[${transferId}]`);

  assert.fieldEquals('Bond__Transfer', transferId, 'bond', BOND_ADDRESS);
  assert.fieldEquals('Bond__Transfer', transferId, 'from', FROM.toHex());
  assert.fieldEquals('Bond__Transfer', transferId, 'to', TO.toHex());
  assert.fieldEquals('Bond__Transfer', transferId, 'value', value.toString());

  clearStore();
});

// - Unpaused(address)
test('Will handle Unpaused event', () => {

  const bond = createPerformanceBond();
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
      newTransaction(INSTIGATOR.toHex()),
      [new ethereum.EventParam('account', ethereum.Value.fromAddress(INSTIGATOR))],
      null
    )
  );

  assert.fieldEquals('Bond', BOND_ADDRESS, 'paused', 'false');

  clearStore();
});

// - WithdrawCollateral(indexed address,indexed address,uint256,indexed address)
const withdrawCollateral = (
  amount: i32,
): void => {
  handleWithdrawCollateral(
    new WithdrawCollateral(
      Address.fromString(BOND_ADDRESS),
      defaultBigInt,
      defaultBigInt,
      defaultLogType,
      newBlock(),
      newTransaction(INSTIGATOR.toHex()),
      [
        new ethereum.EventParam('treasury', ethereum.Value.fromAddress(TREASURY)),
        new ethereum.EventParam('collateralTokens', ethereum.Value.fromAddress(TOKEN)),
        new ethereum.EventParam('collateralAmount', ethereum.Value.fromI32(amount)),
        new ethereum.EventParam('instigator', ethereum.Value.fromAddress(INSTIGATOR))
      ],
      null
    )
  );
};
test('Will handle WithdrawCollateral event', () => {
  const bond = createPerformanceBond();
  bond.collateralAmount = BigInt.fromI32(1000);

  bond.save();

  withdrawCollateral(100);
  assert.fieldEquals(
    'Bond',
    BOND_ADDRESS,
    'collateralAmount',
    (bond.collateralAmount = bond.collateralAmount.minus(BigInt.fromI32(100))).toString()
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralAmount', '900');
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralWithdrawn', 'false');

  withdrawCollateral(900);
  assert.fieldEquals(
    'Bond',
    BOND_ADDRESS,
    'collateralAmount',
    (bond.collateralAmount = bond.collateralAmount.minus(BigInt.fromI32(900))).toString()
  );
  assert.fieldEquals('Bond', BOND_ADDRESS, 'collateralWithdrawn', 'true');

  clearStore();
});

// - Export so that these are named in the generated .wat files
export {
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
