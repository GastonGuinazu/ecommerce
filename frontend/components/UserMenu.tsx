'use client';

import { User, LogOut, LayoutDashboard, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

export default function UserMenu() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const { isLoggedIn, isAdmin, logout, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogout = () => {
    if (window.confirm("¿Cerrar sesión?")) {
      clearCart();
      logout();
      router.push('/');
      router.refresh();
    }
  };

  // 1. SI NO ESTÁ LOGUEADO -> Solo ícono de usuario (Link al Login)
  if (!isLoggedIn) {
    return (
      <Link href="/login" className="text-gray-600 hover:text-black transition-colors">
        <User size={24} strokeWidth={1.5} />
      </Link>
    );
  }

  // 2. SI ESTÁ LOGUEADO -> Ícono + Menú Desplegable (Dropdown)
  return (
    <>
      {/* ÍCONO PRINCIPAL (Siempre visible) */}
      <div className="relative text-gray-600 hover:text-black transition-colors py-1">
        <User size={24} strokeWidth={1.5} />
        {/* Puntito verde de "Online" */}
        <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full ring-1 ring-white"></span>
      </div>

      {/* MENÚ OCULTO (Aparece al hacer Hover gracias a la clase 'group' del Navbar) */}
      <div className="absolute right-0 top-full mt-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        
        {/* OPCIONES DEL MENÚ */}
        <div className="flex flex-col text-sm text-left">
          {isAdmin && (
            <Link href="/admin" className="px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}
          
          <Link href="/orders" className="px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
            <Package size={16} /> Mis Pedidos
          </Link>

          <button onClick={handleLogout} className="px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-2 text-left w-full border-t border-gray-50">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </>
  );
}