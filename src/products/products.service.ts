import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from 'nestjs-dynamoose';
import { Product, ProductKey } from './product.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel('Product')
    private productModel: Model<Product, ProductKey>,
  ) {}

  create(product: Product) {
    return this.productModel.create(product);
  }

  findAll() {
    return this.productModel.scan().filter('status').eq('published').exec();
  }

  deleteById(key: ProductKey) {
    return this.productModel.delete(key);
  }
}
