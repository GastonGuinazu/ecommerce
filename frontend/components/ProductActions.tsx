'use client';

import { useState } from 'react';
import { ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { useCartStore } from '@/store/cart'; 
import Swal from 'sweetalert2';

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  basePrice: string | number;
  images: string[];
  variants: Variant[];
}

// Recibimos solo 'product' porque las variantes ya viven dentro de él
export default function ProductActions({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  const addItem = useCartStore((state) => state.addItem);

  // 1. Extraemos Talles Únicos disponibles
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));
  
  // 2. Extraemos Colores disponibles (Opcional: podrías filtrar colores según el talle seleccionado)
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));

  // 3. Buscamos la variante exacta basada en la selección del usuario
  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  // 4. Verificamos si esa combinación específica tiene stock
  const hasStock = selectedVariant ? selectedVariant.stock > 0 : false;

  const handleAddToCart = () => {
    if (!selectedVariant || !hasStock) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      price: Number(product.basePrice),
      size: selectedVariant.size,
      color: selectedVariant.color,
      image: product.images[0] || '', 
      quantity: 1,
    });

    // Feedback visual elegante
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Agregado al carrito',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  };

  return (
    <div className="space-y-8 mt-6">
      
      {/* SELECTOR DE TALLE */}
      <div>
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">Seleccionar Talle</h3>
            <button className="text-xs text-gray-500 underline hover:text-black">Guía de talles</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {uniqueSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`
                py-3 px-4 text-sm font-medium rounded-md border transition-all
                ${selectedSize === size 
                  ? 'border-black ring-1 ring-black text-black' 
                  : 'border-gray-200 text-gray-600 hover:border-black'}
              `}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* SELECTOR DE COLOR */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Seleccionar Color</h3>
        <div className="flex flex-wrap gap-3">
          {uniqueColors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`
                px-6 py-2 rounded-full border text-sm font-medium transition-all
                ${selectedColor === color
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-black'}
              `}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* MENSAJE DE STOCK / ESTADO */}
      <div className="h-6">
        {selectedSize && selectedColor ? (
            selectedVariant ? (
                hasStock ? (
                    <p className="text-sm text-green-600 font-medium flex items-center animate-in fade-in">
                        <span className="block w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Stock disponible ({selectedVariant.stock} u.)
                    </p>
                ) : (
                    <p className="text-sm text-red-500 font-medium">❌ Agotado en esta combinación</p>
                )
            ) : (
                <p className="text-sm text-orange-500">Combinación no existente</p>
            )
        ) : (
            <p className="text-sm text-gray-400">Selecciona talle y color</p>
        )}
      </div>

      {/* BOTÓN DE COMPRA */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedSize || !selectedColor || !hasStock}
        className={`
          w-full py-4 px-8 flex items-center justify-center rounded-full text-base font-bold text-white transition-all shadow-md
          ${(!selectedSize || !selectedColor || !hasStock)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
            : 'bg-black hover:opacity-90 hover:shadow-lg transform active:scale-95'
          }
        `}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {hasStock ? 'Agregar al Carrito' : 'Sin Stock'}
      </button>

      {/* INFO EXTRA DE ENVÍO */}
      <div className="pt-6 border-t border-gray-100 space-y-3">
        <div className="flex items-center text-sm text-gray-600">
            <Truck size={18} className="mr-3" />
            <span>Envío gratis a todo el país</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
            <RotateCcw size={18} className="mr-3" />
            <span>Devoluciones sin cargo (30 días)</span>
        </div>
      </div>

    </div>
  );
}