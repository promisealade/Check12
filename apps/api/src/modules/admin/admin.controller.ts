import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../../database/entities/user.entity';
import { JwtAuthGuard } from '../identity/jwt-auth.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Platform metrics (admin)' })
  getMetrics() {
    return this.admin.getMetrics();
  }

  @Get('kyc-queue')
  @ApiOperation({ summary: 'Pending KYC review queue' })
  getKycQueue() {
    return this.admin.getKycQueue();
  }

  @Post('kyc/:docId/review')
  @ApiOperation({ summary: 'Approve or reject KYC document' })
  reviewKyc(
    @CurrentUser() user: UserEntity,
    @Param('docId') docId: string,
    @Body() body: { decision: 'approved' | 'rejected'; notes?: string },
  ) {
    return this.admin.reviewKyc(user.id, docId, body.decision, body.notes);
  }

  @Get('aml-alerts')
  @ApiOperation({ summary: 'List AML alerts' })
  getAmlAlerts(@Query('status') status?: string) {
    return this.admin.getAmlAlerts(status);
  }

  @Post('aml-alerts/:alertId/review')
  @ApiOperation({ summary: 'Review AML alert — clear or escalate' })
  reviewAmlAlert(
    @CurrentUser() user: UserEntity,
    @Param('alertId') alertId: string,
    @Body() body: { decision: 'cleared' | 'escalated'; sarFiled?: boolean; notes?: string },
  ) {
    return this.admin.reviewAmlAlert(
      user.id,
      alertId,
      body.decision,
      body.sarFiled,
      body.notes,
    );
  }

  @Get('reserves')
  @ApiOperation({ summary: 'Stablecoin reserve reconciliation history' })
  getReserves() {
    return this.admin.getReserves();
  }

  @Get('users')
  @ApiOperation({ summary: 'Paginated user list' })
  listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.admin.listUsers(page, limit);
  }
}
