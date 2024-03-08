import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { AccountsService } from 'src/accounts/accounts.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AccountSchema } from 'src/accounts/account.schema';
import { ProductCreateSense } from './bot.sense';
import { ProductSchema } from 'src/products/products.schema';
import { ProductsService } from 'src/products/products.service';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'Account',
        schema: AccountSchema,
        options: {
          tableName: 'account',
        },
      },
      {
        name: 'Product',
        schema: ProductSchema,
        options: {
          tableName: 'product',
        },
      },
    ]),
  ],
  controllers: [],
  providers: [BotService, AccountsService, ProductsService, ProductCreateSense],
})
export class BotModule {}
