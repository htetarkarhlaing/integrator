import { Injectable } from '@nestjs/common';
import { Update, Start, Action, Command } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { v4 } from 'uuid';
import { IChat } from './bot.interface';
import { AccountsService } from 'src/accounts/accounts.service';
import { ProductsService } from 'src/products/products.service';
import { ConfigService } from '@nestjs/config';

@Update()
@Injectable()
export class BotService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly productService: ProductsService,
    private readonly configService: ConfigService,
  ) {}

  private async adminVerifier(telegramId: string): Promise<boolean> {
    const adminAccount = await this.accountsService.verifyAdmin(telegramId);
    if (adminAccount.count === 1 && adminAccount[0].role === 'admin') {
      return true;
    } else {
      return false;
    }
  }

  @Start()
  async onStart(ctx: Context) {
    const chat = ctx.chat as IChat;
    await ctx.reply(
      `Welcome ${chat.first_name}!\n(This bot is testing purpose only.)\nPlease choose your Account\n\n\nAdmin - will be able to manage products\nUser - will be able to order`,
      Markup.inlineKeyboard([
        Markup.button.callback('Admin', 'admin-auth'),
        Markup.button.callback('User', 'product-view'),
      ]),
    );
  }

  @Action('admin-auth')
  async handleAdminAuthCheck(ctx: Context) {
    const chat = ctx.chat as IChat;
    const userAccount = await this.accountsService.findUser(chat.id.toString());
    if (userAccount.count === 0) {
      await ctx.reply(
        `Hello ${chat.first_name}!\nYou need to create an administrator account first.\nAdmin - will be able to manage products`,
        Markup.inlineKeyboard([
          Markup.button.callback('Register', 'admin-register'),
          Markup.button.callback('Cancel', 'admin-register-cancel'),
        ]),
      );
    } else {
      await ctx.reply(
        `Welcome Admin ${chat.first_name}\nYou are now able to manage the orders and products`,
        Markup.inlineKeyboard([
          Markup.button.callback('Products', 'product-view'),
        ]),
      );
    }
  }

  @Action('admin-register-cancel')
  async handleCancelAdminRegister(ctx: Context) {
    await ctx.reply(
      'You can apply to work as administrator whatever you want.',
    );
  }

  @Action('admin-register')
  async handleAdminRegister(ctx: Context) {
    const chat = ctx.chat as IChat;
    const userAccount = await this.accountsService.findUser(chat.id.toString());
    if (userAccount.count === 0) {
      try {
        const newAdmin = await this.accountsService.create({
          id: v4(),
          name: chat.first_name,
          telegramUId: chat.id.toString(),
          role: 'admin',
        });
        await ctx.reply(
          `Welcome Admin ${newAdmin.name}\nYou are now able to manage the orders and products`,
          Markup.inlineKeyboard([
            Markup.button.callback('Orders', 'order-view'),
            Markup.button.callback('Products', 'product-view'),
          ]),
        );
      } catch (err) {
        await ctx.reply(
          `Admin registration failed. (Internal server error)`,
          Markup.inlineKeyboard([
            Markup.button.callback('Try again', 'admin-register'),
          ]),
        );
      }
    } else {
      await ctx.reply('You account is already registered as Administrator');
    }
  }

  @Command('products')
  @Action('product-view')
  async handleShowProducts(ctx: Context) {
    const chat = ctx.chat as IChat;
    const isAdmin = await this.adminVerifier(chat.id.toString());
    const products = [];
    if (isAdmin) {
      await ctx.reply('You can send "/CREATE_PRODUCT" to add product');
    }
    const productList = await this.productService.findAll();

    productList.map((item) => {
      products.push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.photo,
      });
    }),
      await ctx.reply('Here is the list of products');

    products.map(async (item) => {
      const invoice = {
        provider_token: this.configService.get('TELEGRAM_PAYMENT_TOKEN'),
        start_parameter: 'time-machine-sku',
        title: item.name,
        description:
          item.description +
          " Note: (The image view need to add the external URL, currently I don't have domain name and hosting server to store image so I just made it blank)",
        currency: 'usd',
        photo_url: item.photo,
        is_flexible: true,
        prices: [{ label: item.name, amount: parseInt(item.price) }],
        payload: JSON.stringify({
          coupon: 'BLACK FRIDAY',
        }),
      };

      if (isAdmin) {
        return await ctx.replyWithPhoto(item.image, {
          caption: `${item.name}\n${item.description}\nPrice: $${item.price}`,
          ...Markup.inlineKeyboard([
            Markup.button.callback('Delete', `delete-product-${item.id}`),
          ]),
        });
      } else {
        return await ctx.replyWithInvoice(invoice);
      }
    });
  }

  @Command('CREATE_PRODUCT')
  async handleCreateProduct(ctx: any) {
    const chat = ctx.chat as IChat;
    const isAdmin = await this.adminVerifier(chat.id.toString());
    if (isAdmin) {
      await ctx.scene.enter('PRODUCT_CREATE_SENSE');
    } else {
      await ctx.reply(
        'You cannot create product. (Only admin can manage products)',
      );
    }
  }

  @Action(/delete-product-(.*)/)
  async deleteProduct(ctx: any) {
    const productId = ctx.match[1];
    await this.productService.deleteById(productId);
    await ctx.reply('You just deleted');
  }
}
