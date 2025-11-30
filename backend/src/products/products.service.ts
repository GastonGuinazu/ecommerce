import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // 1. Extraemos las imágenes y el stock del DTO
    const { images, stock, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        images: images || [], // Guardamos el array de fotos
        
        // 2. MAGIA: Creamos automáticamente la primera variante
        variants: {
          create: [
            {
              size: 'Estándar', // O puedes poner 'M' o 'Único'
              color: 'Estándar', // O 'Negro'
              stock: stock,      // Usamos el stock que vino del formulario
              sku: `SKU-${Date.now()}`, // Generamos un código único rápido
              priceAdjustment: 0
            }
          ]
        }
      },
      include: {
        variants: true, // Para que nos devuelva todo creado
      }
    });
  }

  async findAll() {
    return await this.prisma.product.findMany({
      include: { variants: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { 
        variants: true,
      }, 
    });

    if (!product) {
      throw new Error(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }
  
  async update(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        categoryId: data.categoryId,
        // Si viene imagen la actualizamos, si no, no la tocamos
        images: data.images && data.images.length > 0 ? data.images : undefined,
      },
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async addVariant(productId: string, size: string, color: string, stock: number, imageUrl?: string) {    
    const existingVariant = await this.prisma.productVariant.findFirst({
      where: {
        productId: productId,
        size: size,
        color: color,
      },
    });

    if (existingVariant) {
      return this.prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          stock: existingVariant.stock + stock,
          images: imageUrl ? [imageUrl] : existingVariant.images, 
        },
      });
    } else {
      return this.prisma.productVariant.create({
        data: {
          productId,
          size,
          color,
          stock,
          sku: `${size}-${color}-${Date.now()}`.toUpperCase(),
          priceAdjustment: 0,
          images: imageUrl ? [imageUrl] : [],
        },
      });
    }
  }

  // Borrar Variante
  async removeVariant(variantId: string) {
    return this.prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  
}