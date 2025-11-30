import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }
 
  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    console.log("------------------------------------------------");
    console.log("🔍 Petición GET /orders recibida");
    console.log("👤 Usuario detectado en el Request:", req.user);
    
    if (!req.user || !req.user.userId) {
        console.error("❌ ERROR CRÍTICO: No hay userId en req.user");
    } else {
        console.log("✅ ID del usuario:", req.user.userId);
    }
    console.log("------------------------------------------------");

    return this.ordersService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // 👇 Endpoint para el Admin: Ver TODAS las órdenes
  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  findAllAdmin() {
    return this.ordersService.findAllAdmin();
  }

  // 👇 Endpoint para cambiar estado (Aprobar pago)
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }
}