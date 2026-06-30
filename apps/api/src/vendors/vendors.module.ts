import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { AdminVendorsController } from './admin-vendors.controller';
import { VendorController } from './vendor.controller';

@Module({
  controllers: [AdminVendorsController, VendorController],
  providers: [VendorsService],
})
export class VendorsModule {}
