'use client';

import Link from 'next/link';
import { CheckCircle, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  
  // Datos que devuelve Mercado Pago
  const paymentId = searchParams.get('payment_id'); 
  const status = searchParams.get('status'); // 'approved', 'pending', 'in_process', 'rejected'
  const orderId = searchParams.get('external_reference'); 

  const { clearCart } = useCartStore();

  useEffect(() => {
    // Vaciamos el carrito en ambos casos, porque la orden ya se creó en tu BD
    clearCart();
  }, []);

  // --- LÓGICA DE ESTADOS ---
  const isApproved = status === 'approved';
  const isPending = status === 'pending' || status === 'in_process';

  // --- LÓGICA WHATSAPP (Solo para Aprobados inmediatos) ---
  const myPhoneNumber = "5493513433916";
  const message = `Hola! 👋 Ya realicé el pago de la *Orden #${orderId?.slice(0,8)}*.\n\nID MP: ${paymentId}\nEstado: ${status}\n\nAdjunto el comprobante!`;
  const whatsappUrl = `https://wa.me/${myPhoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen pt-24 pb-10 flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        
        {/* --- ICONO DINÁMICO --- */}
        <div className="flex justify-center mb-6">
          {isApproved ? (
            <div className="bg-green-100 p-4 rounded-full animate-in zoom-in">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          ) : (
            <div className="bg-yellow-100 p-4 rounded-full animate-in zoom-in">
              <Clock className="w-16 h-16 text-yellow-600" />
            </div>
          )}
        </div>

        {/* --- TÍTULO DINÁMICO --- */}
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          {isApproved ? '¡Pago Acreditado!' : '¡Orden Reservada!'}
        </h1>

        {/* --- MENSAJE DINÁMICO (Aquí está lo que pediste) --- */}
        <div className="text-gray-500 mb-8 space-y-2">
          {isApproved ? (
            <p>Tu pago ya impactó en el sistema. Envíanos el comprobante para agilizar el despacho.</p>
          ) : (
            <>
              <p>Tu pedido quedó registrado esperando el pago.</p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 font-medium">
                📢 IMPORTANTE:<br/>
                Cuando realices el pago en efectivo, ingresa a la sección 
                <span className="font-bold underline ml-1">"Mis Pedidos"</span> 
                y envíanos la foto del comprobante para aprobar tu compra.
              </div>
            </>
          )}
        </div>

        {/* INFO CARD */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Orden:</span>
            <span className="font-mono font-bold">#{orderId?.slice(0,8) || '---'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Estado:</span>
            <span className={`font-bold uppercase ${isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
              {isApproved ? 'Pagado' : 'Pendiente'}
            </span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN DINÁMICOS */}
        <div className="space-y-3">
          
          {isApproved ? (
            // CASO 1: TARJETA -> Botón directo a WhatsApp
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-green-500 text-white py-4 rounded-lg font-bold hover:bg-green-600 transition-all shadow-lg transform hover:-translate-y-1"
            >
              <MessageCircle className="mr-2" /> Enviar Comprobante Ahora
            </a>
          ) : (
            // CASO 2: EFECTIVO -> Botón directo a Mis Pedidos (La instrucción que pediste)
            <Link 
              href="/orders" 
              className="flex items-center justify-center w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-md"
            >
              Ir a Mis Pedidos <ArrowRight className="ml-2" size={18} />
            </Link>
          )}
          
          <Link 
            href="/" 
            className="block w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50 transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>

      </div>
    </div>
  );
}