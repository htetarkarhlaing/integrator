import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Account, AccountKey } from './account.interface';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel('Account')
    private accountModel: Model<Account, AccountKey>,
  ) {}

  create(user: Account) {
    return this.accountModel.create(user);
  }

  update(key: AccountKey, user: Partial<Account>) {
    return this.accountModel.update(key, user);
  }

  findUser(telegramId: string) {
    return this.accountModel.scan('telegramUId').eq(telegramId).exec();
  }

  verifyAdmin(telegramId: string) {
    return this.accountModel
      .scan('telegramUId')
      .eq(telegramId)
      .filter('role')
      .eq('admin')
      .exec();
  }

  findAll() {
    return this.accountModel.scan().exec();
  }
}
