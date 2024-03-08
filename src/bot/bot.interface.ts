import { Scenes } from 'telegraf';

export interface IChat {
  id: number;
  first_name: string;
  username: string;
  type: 'private' | 'public';
}

interface ProductCreateSense extends Scenes.SceneSessionData {
  name: string;
  price: string;
  image: string;
  description: string;
}

export type ProductCreateContext = Scenes.SceneContext<ProductCreateSense>;
