import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentsService } from 'src/payments/payments.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    
    // 1. TRANSACCIÓN DB: Crear orden y descontar stock
    // (Si algo falla aquí, no se cobra nada y se devuelve el stock)
    const order = await this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of createOrderDto.items) {
        // Buscar variante y producto padre
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) {
          throw new NotFoundException(`El producto ${item.variantId} no existe`);
        }

        // Verificar Stock
        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Sin stock para ${variant.product.name} (${variant.size}). Quedan: ${variant.stock}`
          );
        }

        // Calcular precio unitario real en el momento de la compra
        const unitPrice = Number(variant.product.basePrice) + Number(variant.priceAdjustment);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;

        // RESTAR STOCK
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: variant.stock - item.quantity },
        });

        // Preparar ítem para la DB
        orderItemsData.push({
          variantId: variant.id,
          quantity: item.quantity,
          price: unitPrice, // Guardamos el precio congelado
        });
      }

      // Crear la Orden en la DB
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: 'PENDING',
          items: {
            create: orderItemsData,
          },
        },
      });

      return newOrder;
    });

    // ---------------------------------------------------------
    // 2. INTEGRACIÓN MERCADO PAGO
    // ---------------------------------------------------------

    // Recuperamos la orden con todos los detalles (Nombre producto, Talle, etc.)
    // para mostrarlos en el ticket de pago.
    const orderWithDetails = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: { 
        items: { 
          include: { 
            variant: { include: { product: true } } 
          } 
        } 
      }
    });

    if (!orderWithDetails) throw new BadRequestException("Error al procesar la orden para el pago");

    // Mapeamos los ítems al formato que pide Mercado Pago
    const mpItems = orderWithDetails.items.map(item => ({
      variantId: item.variantId,
      title: `${item.variant.product.name} (${item.variant.size} / ${item.variant.color})`,
      quantity: item.quantity,
      price: Number(item.price)
    }));

    // Creamos la preferencia de pago
    const preference = await this.paymentsService.createPreference(mpItems, order.id);

    // 3. RETORNAMOS LA URL AL FRONTEND
    return {
      order,
      paymentUrl: preference.init_point, // Este es el link azul de MP
    };
  }

  // Ver todas las órdenes
  findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId: userId },
      include: { 
        items: {
            include: { 
                variant: { 
                    include: { product: true } 
                } 
            } 
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { 
        items: {
            include: { variant: { include: { product: true } } }
        }
      }
    });
  }

  // Ver TODAS las órdenes (Para el panel de Admin)
  findAllAdmin() {
    return this.prisma.order.findMany({
      include: { 
        user: true, // Incluimos datos del usuario para saber quién compró
        items: {
            include: { variant: { include: { product: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Actualizar Estado
  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { 
        status: status as OrderStatus 
      }
    });
  }
}