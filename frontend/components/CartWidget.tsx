'use client';

import { useCartStore } from '@/store/cart';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartWidget() {
  // 1. Conectamos con el store
  const totalItems = useCartStore((state) => state.getTotalItems());
  
  // 2. Truco para Next.js: Esperamos a que el navegador cargue para mostrar el número
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Mientras carga, mostramos solo el ícono sin número
    return (
      <Link href="/cart" className="p-2 text-gray-600 hover:text-black relative">
        <ShoppingBag size={20} />
      </Link>
    );
  }

  return (
    <Link href="/cart" className="p-2 text-gray-600 hover:text-black relative">
      <ShoppingBag size={20} />
      
      {/* 3. Solo mostramos el globo rojo si hay cosas */}
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </Link>
  );
}