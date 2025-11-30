import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN 
    });
  }

  async createPreference(items: any[], orderId: string) {
    const preference = new Preference(this.client);

    const result = await preference.create({
      body: {
        external_reference: orderId,
        items: items.map((item) => ({
          id: item.variantId,
          title: item.title,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: 'ARS',
        })),
        
        payer: {
            email: 'test_user_123456@test.com', // Email dummy para pruebas
        },

        back_urls: {
          success: 'http://localhost:3001/checkout/success',
          failure: 'http://localhost:3001/checkout/failure',
          pending: 'http://localhost:3001/checkout/pending',
        },
        // auto_return: 'approved', // (Desactivado para localhost)
      }
    });

    return result;
  }
}