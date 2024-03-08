import { Controller, Get, HttpException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Account Auth')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('me')
  @ApiOperation({ summary: 'User validate me (whoami)' })
  @ApiBearerAuth()
  async userValidateMe(): Promise<any> {
    try {
      const userData = await this.accountsService.findAll();
      return userData;
    } catch (error) {
      const err = JSON.parse(error.message);
      throw new HttpException(
        {
          message: err.message,
        },
        err.status,
      );
    }
  }
}
