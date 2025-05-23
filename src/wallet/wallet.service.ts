import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import Wallet from './entities/wallet.entity';
import Wallet_Owner from './entities/wallet_owner.entity';
import AppUser from 'src/project/entities/AppUser.entity';
import { Currency } from 'src/project/entities/Currency.entity';
import { pick } from 'lodash';
import { bignumber } from 'mathjs';
import { throwBadRequest } from 'src/utils/helpers';
import Wallet_Transaction from './entities/wallet_transaction.entity';
import { Credit_Source_Type, Wallet_Transaction_Type } from 'src/lib/enums';

@Injectable()
export class WalletService {
  constructor(private dbSource: DataSource) {
    this.dbManager = dbSource.manager;
  }
  dbManager: EntityManager;
  // get wallet
  async getWallet({
    public_id,
    appId,
    userId,
    sanitize = true,
  }: {
    public_id: string;
    appId: string;
    userId: string;
    sanitize?: boolean;
  }) {
    const wallet = await this.dbManager.findOne(Wallet, {
      where: {
        public_id,
        wallet_owner: {
          app_user: {
            appId,
            userId,
          },
        },
      },
      relations: {
        currency: true,
      },
    });

    return sanitize ? this.pickWalletFields(wallet) : wallet;
  }

  async pickWalletFields(wallet: Wallet): Promise<Partial<Wallet> | void> {
    if (!wallet) {
      return;
    }
    return pick(wallet, [
      'name',
      'public_id',
      'status',
      'currency.fullname',
      'balance',
    ]);
  }

  async createWallet({
    userId,
    appId,
    countryFullname,
  }: {
    userId: string;
    appId: string;
    countryFullname?: string;
  }) {
    const appUser = await this.dbManager.findOne(AppUser, {
      where: {
        appId,
        userId,
      },
      relations: {
        user: true,
      },
    });

    if (!appUser) {
      throwBadRequest('Invalid request parameter. User does not exist.');
    }

    countryFullname = countryFullname || 'Nigeria';

    const currency = await this.dbManager.findOne(Currency, {
      where: {
        country: {
          fullname: countryFullname,
        },
      },
    });

    currency || throwBadRequest('Invalid Currency');

    let wallet: Wallet = await this.dbManager.findOne(Wallet, {
      where: {
        currencyId: currency.id,
        wallet_owner: {
          app_user_id: appUser.id,
        },
      },
      relations: {
        wallet_owner: true,
        currency: true,
      },
    });

    const walletOwner: Wallet_Owner = Boolean(wallet)
      ? wallet.wallet_owner
      : // create and save new wallet
        await this.dbManager.save(
          this.dbManager.create(Wallet_Owner, {
            app_user_id: appUser.id,
          }),
        );

    const formatName = () => {
      return (
        appUser.user.firstName ||
        '' + '_' + appUser.user.lastName ||
        '' + '_' + currency.fullname
      ).trim();
    };

    if (!wallet) {
      wallet = this.dbManager.create(Wallet, {
        name: formatName(),
        wallet_owner_app_user_id: walletOwner.app_user_id,
        currencyId: currency.id,
      });

      wallet = await this.dbManager.save(wallet);
      wallet = await this.dbManager.findOne(Wallet, {
        where: {
          id: wallet.id,
        },
        relations: { currency: true },
      });
    }

    return this.pickWalletFields(wallet);
  }

  async transactWallet({
    public_id,
    appId,
    user_id,
    amount,
    credit_source_data,
    credit_source_type,
    type,
  }: {
    public_id: string;
    appId: string;
    user_id: string;
    amount: string;
    credit_source_data?: string;
    credit_source_type: Credit_Source_Type;
    type: Wallet_Transaction_Type;
  }) {
    const amountAsNum = Number(amount || '');
    const amountIsInValid = Number.isNaN(amountAsNum);
    if (amountIsInValid) {
      throwBadRequest('amount field is invalid');
    }

    let wallet = (await this.getWallet({
      public_id,
      appId,
      userId: user_id,
      sanitize: false,
    })) as Wallet;

    wallet || throwBadRequest('Invalid wallet reference.');

    wallet = await this.updateSaveWallet({
      wallet,
      op: type === Wallet_Transaction_Type.CREDIT ? 'add' : 'sub',
      amount: amountAsNum,
      dbManager: this.dbManager,
    });

    await this.createSaveWalletTransaction({
      type: Wallet_Transaction_Type.CREDIT,
      description: `Wallet ${type}`,
      destination_wallet_reference: wallet.public_id,
      ...(credit_source_data ? { credit_source_data } : {}),
      credit_source_type,
      destination_wallet_id: wallet.id,
      dbManager: this.dbManager,
    });
  }

  private async createSaveWalletTransaction({
    dbManager,
    ...rest
  }: { [P in keyof Wallet_Transaction]?: any } & { dbManager: EntityManager }) {
    const wallet_transaction = dbManager.create(Wallet_Transaction, rest);
    await this.dbManager.save(wallet_transaction);
  }

  private async updateSaveWallet({
    wallet,
    op,
    dbManager,
    amount,
  }: {
    wallet: Wallet;
    op: 'add' | 'sub' /**Addition or Subtraction */;
    amount: number;
    dbManager: EntityManager;
  }) {
    wallet.balance = bignumber(wallet.balance)[op](amount).toString();

    this.checkWalletBalanceLesserZero(wallet.balance);

    return await dbManager.save(wallet);
  }

  /**This checks if wallet balance not lesser than zero. It throws an error if it is lesser than zero. */
  checkWalletBalanceLesserZero(balance: string | number) {
    const walletBalance = Number(balance);
    const minimumWalletBalance = 0;

    if (minimumWalletBalance > walletBalance) {
      throwBadRequest('Cannot perform operation. Insufficient wallet balance!');
    }
  }
}
