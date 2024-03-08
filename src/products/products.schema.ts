import { Schema } from 'dynamoose';

export const ProductSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  photo: {
    type: String,
  },
  price: {
    type: String,
  },
  status: {
    type: String,
    enum: ['published', 'unpublished'],
  },
});
