import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) { // Asegúrate que diga 'string', no 'number'
    return this.productsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt')) // Protegemos para que solo admins (con token) borren
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/variants')
  @UseGuards(AuthGuard('jwt'))
  addVariant(
    @Param('id') productId: string, 
    @Body() body: { size: string; color: string; stock: number; imageUrl?: string }
  ) {
    return this.productsService.addVariant(productId, body.size, body.color, Number(body.stock), body.imageUrl);
  }

  @Delete('variants/:variantId')
  @UseGuards(AuthGuard('jwt'))
  deleteVariant(@Param('variantId') variantId: string) {
    return this.productsService.removeVariant(variantId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }
}