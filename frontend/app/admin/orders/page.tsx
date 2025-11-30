'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Search, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string }; 
  items: any[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, PAID
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://127.0.0.1:3000/orders/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. FILTRADO INTELIGENTE (CORREGIDO ✅)
  useEffect(() => {
    let result = orders;

    // A. Filtro por Estado
    if (filterStatus !== 'ALL') {
      result = result.filter(o => o.status === filterStatus);
    } // 👈 FALTABA ESTA LLAVE DE CIERRE

    // B. Filtro por Buscador
    if (search) {
      const term = search.toLowerCase();
      
      result = result.filter(o => {
        const id = o.id || '';
        const email = o.user?.email || '';
        const name = (o.user as any).fullName || o.user?.name || ''; 

        return (
          id.toLowerCase().includes(term) || 
          email.toLowerCase().includes(term) ||
          name.toLowerCase().includes(term)
        );
      });
    }

    setFilteredOrders(result);
  }, [search, filterStatus, orders]);

  // 3. CAMBIAR ESTADO (APROBAR)
  const handleApprove = async (orderId: string) => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://127.0.0.1:3000/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status: 'PAID' })
        });

        if (res.ok) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Orden Aprobada', timer: 1500, showConfirmButton: false });
            // Actualizamos la lista localmente
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'PAID' } : o));
        }
    } catch (error) {
        alert("Error al actualizar");
    }
  };

  // 4. VER DETALLES (MODAL POP-UP) 👁️
  const handleViewDetails = (order: Order) => {
    // Generamos HTML dinámico con los productos
    const itemsHtml = order.items.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center; gap: 10px; text-align: left;">
          <img src="${item.variant.product.images[0] || '/placeholder.png'}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
          <div>
            <div style="font-weight: bold; font-size: 14px;">${item.variant.product.name}</div>
            <div style="font-size: 12px; color: #666;">${item.variant.size} / ${item.variant.color}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px;">x${item.quantity}</div>
          <div style="font-weight: bold;">$${Number(item.price).toLocaleString()}</div>
        </div>
      </div>
    `).join('');

    Swal.fire({
      title: `<strong>Orden #${order.id.slice(0, 8)}</strong>`,
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <p><strong>Cliente:</strong> ${(order.user as any).fullName || order.user.name}</p>
          <p><strong>Email:</strong> ${order.user.email}</p>
          <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px;">
          ${itemsHtml}
        </div>
        <div style="text-align: right; margin-top: 15px; font-size: 18px;">
          Total: <strong>$${Number(order.totalAmount).toLocaleString()}</strong>
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false, 
      width: '600px'
    });
  };

  if (loading) return <div className="p-10 text-center">Cargando órdenes...</div>;

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
             <Link href="/admin" className="text-gray-500 hover:text-black"><ArrowLeft size={24} /></Link>
             <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
        </div>
        
        {/* BUSCADOR Y FILTROS */}
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar por ID, Email..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-black focus:border-black"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <select 
                className="border rounded-lg px-3 py-2 text-sm bg-white"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
            >
                <option value="ALL">Todos</option>
                <option value="PENDING">Pendientes ⏳</option>
                <option value="PAID">Pagados ✅</option>
            </select>
        </div>
      </div>

      {/* TABLA DE ÓRDENES */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                    <tr>
                        <th className="px-6 py-3">Orden ID</th>
                        <th className="px-6 py-3">Cliente</th>
                        <th className="px-6 py-3">Fecha</th>
                        <th className="px-6 py-3">Total</th>
                        <th className="px-6 py-3 text-center">Estado</th>
                        <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-gray-600">
                                #{order.id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-900">
                                   {(order.user as any).fullName || order.user.name || 'Sin nombre'}
                                </p>
                                <p className="text-xs text-gray-500">{order.user.email}</p>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-bold">
                                ${Number(order.totalAmount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                {order.status === 'PAID' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Aprobado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pendiente
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {/* Botón Aprobar (Solo si está pendiente) */}
                                {order.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleApprove(order.id)}
                                        title="Marcar como Pagado"
                                        className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-full transition-colors"
                                    >
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                                
                                {/* Botón Ver Detalle CONECTADO */}
                                <button 
                                    onClick={() => handleViewDetails(order)}
                                    className="text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-colors"
                                    title="Ver productos"
                                >
                                    <Eye size={20}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    
                    {filteredOrders.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                No se encontraron órdenes con este criterio.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}