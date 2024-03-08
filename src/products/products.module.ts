import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ProductSchema } from './products.schema';

@Module({
  imports: [
    DynamooseModule.forFeature([
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
  providers: [ProductsService],
})
export class ProductsModule {}
