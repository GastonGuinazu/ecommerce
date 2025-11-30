'use client';

import { useCartStore } from '@/store/cart';
import { Trash2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, removeItem, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const total = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  // --- LÓGICA DE PAGO DIRECTO ---
  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // 1. Validar usuario
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
            title: "Inicia sesión",
            text: "Necesitas una cuenta para procesar el pago",
            icon: "info",
            confirmButtonText: "Ir al Login",
            confirmButtonColor: "#000"
        }).then(() => router.push('/login'));
        return;
      }

      // 2. Preparar orden
      const orderBody = {
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      };

      // 3. Contactar al Backend
      const res = await fetch('http://127.0.0.1:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderBody)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al procesar");

      // 4. Éxito y Redirección
      clearCart();
      
      Swal.fire({
        icon: 'success',
        title: 'Procesando...',
        text: `Redirigiendo a Mercado Pago`,
        timer: 1500,
        showConfirmButton: false,
        willClose: () => {
            if (data.paymentUrl) window.location.href = data.paymentUrl;
        }
      });

    } catch (error: any) {
      console.error(error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">¡Mirá la tienda para llenarlo!</p>
        <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Tu Compra</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        
        {/* LISTA DE PRODUCTOS */}
        <section className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.variantId} className="flex py-6 px-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative bg-gray-100">
                  <Image 
                    src={item.image || '/placeholder.png'} 
                    alt={item.name} 
                    fill 
                    className="object-cover object-center"
                  />
                </div>
                <div className="ml-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between font-bold text-gray-900">
                      <h3>{item.name}</h3>
                      <p>${(Number(item.price) * item.quantity).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.size} | {item.color}</p>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-4">
                    <div className="bg-white border px-3 py-1 rounded-full text-gray-600 font-medium">
                        Cant: {item.quantity}
                    </div>
                    <button onClick={() => removeItem(item.variantId)} className="text-red-400 hover:text-red-600 font-medium text-xs uppercase tracking-wide flex items-center gap-1">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* RESUMEN DE PAGO (STICKY) */}
        <section className="lg:col-span-5 mt-16 lg:mt-0 sticky top-24">
            <div className="bg-gray-50 rounded-xl px-4 py-6 sm:p-8 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Resumen</h2>
                
                <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Envío</span>
                        <span>Gratis</span>
                    </div>
                    <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Total Final</span>
                        <span className="text-2xl font-black text-gray-900">${total.toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-black border border-transparent rounded-full shadow-lg py-4 px-4 text-base font-bold text-white hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1"
                    >
                        {loading ? 'Procesando...' : <>Pagar con Mercado Pago <CreditCard size={20}/></>}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                        🔒 Pago seguro SSL
                    </p>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}