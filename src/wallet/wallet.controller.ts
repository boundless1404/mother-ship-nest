import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedApiData } from 'src/lib/types';
import { GetAuthPayload } from 'src/shared/getAuthenticatedUserPayload.decorator';
import { IsAuthenticated } from 'src/shared/isAuthenticated.guard';
import { WalletService } from './wallet.service';
import { CreateWalletDto, TransactWalletDto } from 'src/project/dto/dto';

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {
    //
  }

  @Post()
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async createWallet(
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
    @Body() createWalletDto: CreateWalletDto,
  ) {
    return await this.walletService.createWallet({
      userId: createWalletDto.user_id,
      appId: apiData.appId,
      ...(createWalletDto.country_fullname
        ? { countryFullname: createWalletDto.country_fullname }
        : {}),
    });
  }

  @Get('/:public_id/:user_id')
  @UseGuards(new IsAuthenticated({ isApiAccess: true }))
  async getWallet(
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
    @Query() query: { public_id: string; user_id: string },
  ) {
    return await this.walletService.getWallet({
      public_id: query.public_id,
      appId: apiData.appId,
      userId: query.user_id,
      sanitize: true,
    });
  }

  @Put()
  async transactWallet(
    @GetAuthPayload('apiData') apiData: AuthenticatedApiData,
    @Body() transact_wallet_dto: TransactWalletDto,
  ) {
    return await this.walletService.transactWallet({
      ...transact_wallet_dto,
      appId: apiData.appId,
    });
  }
}
