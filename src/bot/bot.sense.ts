import { Action, Command, Ctx, On, Scene, SceneEnter } from 'nestjs-telegraf';
import { Markup } from 'telegraf';
import { Message } from 'typegram';
import { ProductCreateContext } from './bot.interface';
import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { v4 } from 'uuid';

@Scene('PRODUCT_CREATE_SENSE')
@Injectable()
export class ProductCreateSense {
  constructor(private readonly productService: ProductsService) {}

  @SceneEnter()
  async start(@Ctx() ctx: ProductCreateContext) {
    await ctx.reply('Please enter the product name');
  }

  @Command('CANCEL_PRODUCT_CREATE')
  async handleCancelCreateProduct(@Ctx() ctx: ProductCreateContext) {
    await ctx.reply('You just discarded the product create process.');
    await ctx.scene.leave();
  }

  @Command('RESTART_PRODUCT_CREATE')
  async handleRestartCreateProduct(@Ctx() ctx: ProductCreateContext) {
    ctx.scene.session.name = undefined;
    ctx.scene.session.price = undefined;
    await ctx.reply('Please enter your product name.');
  }

  @On('text')
  async handleGetProductInfo(
    @Ctx() ctx: ProductCreateContext & { message: Message.TextMessage },
  ) {
    if (ctx.scene.session.name === undefined) {
      ctx.scene.session.name = ctx.message.text;
      await ctx.reply(
        `Your product info\n\nName: ${ctx.scene.session.name}\n\nPlease enter the description of product`,
      );
    } else if (ctx.scene.session.description === undefined) {
      ctx.scene.session.description = ctx.message.text;
      await ctx.reply(
        `Your product info\n\nName: ${ctx.scene.session.name}\n${ctx.scene.session.description}\n\nPlease enter the price of product`,
      );
    } else if (ctx.scene.session.price === undefined) {
      ctx.scene.session.price = ctx.message.text;
      await ctx.reply(
        `Your product info\n\nName: ${ctx.scene.session.name}\n${ctx.scene.session.description}\nPrice: $${ctx.scene.session.price}\n\nPlease send an image for product photo`,
      );
    } else {
      await ctx.reply(
        'Please send an image to complete the product create process\nNote: If you want to cancel the process call the command "/CANCEL_PRODUCT_CREATE"',
      );
    }
  }

  @On('photo')
  async onPhoto(ctx: any) {
    const { name, price, description } = ctx.scene.session;
    if (name && price && description) {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileId = photo.file_id;
      ctx.scene.session.image = fileId;
      await ctx.replyWithPhoto(fileId, {
        caption: `${name} (Preview)\n${description}\nPrice: $${price}`,
      });
      await ctx.reply(
        'Do you want to save the product?',
        Markup.inlineKeyboard([
          Markup.button.callback('Save', 'save-product'),
          Markup.button.callback('Cancel', 'discard-product'),
        ]),
      );
    } else {
      await ctx.reply(
        'To upload the image to product,\nYou need to create the product step by step.\nCall the command \n"/RESTART_PRODUCT_CREATE" to start create product step by step.',
      );
    }
  }

  @Action('save-product')
  async handleSaveProduct(ctx: ProductCreateContext) {
    const { name, price, image, description } = ctx.scene.session;
    if (name && price && description && image) {
      const newProduct = await this.productService.create({
        id: v4(),
        name,
        description,
        price: parseFloat(price).toString() || '0.0',
        photo: image,
        status: 'published',
      });
      await ctx.reply(`You just created a product : ${newProduct.name}`);
      await ctx.scene.leave();
    } else {
      await ctx.reply(
        'To upload the image to product,\nYou need to create the product step by step.\nCall the command \n"/RESTART_PRODUCT_CREATE" to start create product step by step.',
      );
    }
  }

  @Action('discard-product')
  async handleDiscardProduct(ctx: ProductCreateContext) {
    await ctx.reply('You just discarded the product create process.');
    await ctx.scene.leave();
  }
}
