'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle, MessageCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: {
    quantity: number;
    price: number;
    variant: {
      product: {
        name: string;
        images: string[];
      };
      size: string;
      color: string;
    }
  }[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR ÓRDENES DEL BACKEND
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Si no hay token, no intentamos fetchear
        setLoading(false);
        return; 
      }

      try {
        const res = await fetch('http://127.0.0.1:3000/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            // Si el backend da error (ej: 401, 500), lanzamos error para ir al catch
            throw new Error('Error al cargar órdenes');
        }

        const data = await res.json();
        
        // Verificación de seguridad: ¿Es un array?
        if (Array.isArray(data)) {
            setOrders(data);
        } else {
            console.error("El backend no devolvió una lista:", data);
            setOrders([]);
        }

      } catch (error) {
        console.error(error);
        setOrders([]); // En caso de error, dejamos la lista vacía para que no rompa
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 2. HELPER PARA WHATSAPP
  const getWhatsAppLink = (order: Order) => {
    const phone = "5493513433916";
    const message = `Hola! Vengo de "Mis Pedidos".\nTe envío el comprobante de pago de la *Orden #${order.id.slice(0,8)}*.\nTotal: $${order.totalAmount}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // 3. HELPER PARA EL ESTADO
  const getStatusBadge = (status: string) => {
    if (status === 'PAID') {
        return <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle size={14} className="mr-1"/> Pagado</span>;
    }
    return <span className="flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14} className="mr-1"/> Pendiente</span>;
  };

  if (loading) return <div className="min-h-screen pt-24 text-center">Cargando tus compras...</div>;

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-8 text-gray-900">Mis Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-6">Aún no has realizado ninguna compra.</p>
          <Link href="/" className="text-black font-bold underline hover:text-gray-700">Ir a comprar</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              
              {/* HEADER DE LA ORDEN */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">Orden #{order.id.slice(0, 8)}</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-black text-lg text-gray-900">${Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              {/* LISTA DE PRODUCTOS */}
              <div className="p-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center py-3 border-b last:border-0 border-gray-100">
                    <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden border border-gray-200 mr-4 flex-shrink-0 relative">
                       <Image 
                          src={item.variant.product.images[0] || '/placeholder.png'} 
                          alt="Foto" 
                          fill
                          className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.variant.product.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.variant.size} / {item.variant.color} • x{item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-600">${Number(item.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* FOOTER: ACCIÓN DE WHATSAPP (Solo si está pendiente) */}
              {order.status === 'PENDING' && (
                <div className="bg-blue-50 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-blue-800">
                        <span className="font-bold">⚠️ Esperando pago:</span> Si pagaste por transferencia o efectivo, envíanos el comprobante.
                    </div>
                    <a 
                        href={getWhatsAppLink(order)} 
                        target="_blank" 
                        className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm w-full sm:w-auto justify-center"
                    >
                        <MessageCircle size={16} className="mr-2"/> Enviar Comprobante
                    </a>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}