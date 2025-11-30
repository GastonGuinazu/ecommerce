'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, ShoppingBag } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Protección de Ruta
    const userStored = localStorage.getItem('user');
    if (!userStored) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStored);
    if (user.role !== 'ADMIN') {
      alert("Acceso denegado. Zona restringida.");
      router.push('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-10 text-center">Verificando credenciales...</div>;

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pt-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2 transition-colors">
           <Plus size={18} /> Crear Producto
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200 p-10">
        <p className="text-gray-500 text-lg text-center mb-8">
          ¡Bienvenido al Back Office! 
          <br/>
          Selecciona una opción para comenzar:
        </p>

        {/* MENÚ DE ACCESOS RÁPIDOS (GRID) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          
          {/* BOTÓN 1: GESTIONAR PRODUCTOS */}
          <Link 
            href="/admin/products"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-black transition-all group"
          >
            <div className="bg-white p-3 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Package size={32} className="text-gray-700" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Gestionar Productos</h3>
            <p className="text-sm text-gray-500 mt-2">Ver listado, stock y precios</p>
          </Link>

          {/* BOTÓN 2: VER ÓRDENES (ACTIVADO ✅) */}
          <Link 
            href="/admin/orders"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-black transition-all group"
          >
            <div className="bg-white p-3 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag size={32} className="text-gray-700" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Ver Órdenes</h3>
            <p className="text-sm text-gray-500 mt-2">Aprobar pagos y despachos</p>
          </Link>

        </div>
      </div>
    </div>
  );
}