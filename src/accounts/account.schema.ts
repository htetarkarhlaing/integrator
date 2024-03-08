import { Schema } from 'dynamoose';

export const AccountSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  name: {
    type: String,
  },
  telegramUId: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
  },
});
