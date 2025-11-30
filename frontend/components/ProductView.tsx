'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react'; // Eliminamos Truck y RotateCcw
import { useCartStore } from '@/store/cart';
import Swal from 'sweetalert2';

interface Variant { id: string; size: string; color: string; stock: number; images: string[]; }
interface Product { id: string; name: string; basePrice: string | number; description: string; images: string[]; variants: Variant[]; }

export default function ProductView({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  // Estado para la foto que se muestra (Empieza con la principal del producto)
  const [currentImage, setCurrentImage] = useState(product.images[0] || 'https://via.placeholder.com/600');
  
  const addItem = useCartStore((state) => state.addItem);

  // 1. Obtener Talles Únicos (S, M, L)
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size))).sort();

  // 2. Colores disponibles DEPENDIENDO del talle seleccionado
  const availableColors = selectedSize 
    ? Array.from(new Set(product.variants.filter(v => v.size === selectedSize).map(v => v.color)))
    : Array.from(new Set(product.variants.map(v => v.color)));

  // 3. Detectar variante seleccionada
  const selectedVariant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
  const hasStock = selectedVariant ? selectedVariant.stock > 0 : false;

  // EFECTO MAGICO: Cuando cambia el color (o variante), cambiamos la foto
  useEffect(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      setCurrentImage(selectedVariant.images[0]);
    } else if (!selectedColor) {
      setCurrentImage(product.images[0]);
    }
  }, [selectedVariant, selectedColor, product.images]);

  // Resetear color si cambio de talle y ese color no existe en el nuevo talle
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const exists = product.variants.some(v => v.size === selectedSize && v.color === selectedColor);
      if (!exists) setSelectedColor('');
    }
  }, [selectedSize]);

  const handleAddToCart = () => {
    if (!selectedVariant || !hasStock) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      price: Number(product.basePrice),
      size: selectedVariant.size,
      color: selectedVariant.color,
      image: currentImage,
      quantity: 1,
    });
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Agregado', timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
      
      {/* COLUMNA IZQUIERDA: FOTO DINÁMICA */}
      <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-8 lg:mb-0 border border-gray-200 shadow-sm relative">
        <img 
          key={currentImage} 
          src={currentImage} 
          alt={product.name} 
          className="w-full h-full object-cover object-center animate-in fade-in duration-300" 
        />
      </div>

      {/* COLUMNA DERECHA: INFO Y SELECTORES */}
      <div className="lg:pl-8 flex flex-col justify-start pt-4">
        <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Colección 2025</p>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-4">{product.name}</h1>
        <div className="flex items-end mb-6">
           <p className="text-3xl text-gray-900 font-medium">${Number(product.basePrice).toLocaleString()}</p>
        </div>
        <div className="border-t border-b border-gray-100 py-6 mb-8">
           <p className="text-base text-gray-600 leading-relaxed">{product.description || "Sin descripción."}</p>
        </div>

        {/* SELECTORES */}
        <div className="space-y-6">
            {/* TALLES */}
            <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Talle</h3>
                <div className="flex flex-wrap gap-3">
                    {uniqueSizes.map(size => (
                        <button key={size} onClick={() => setSelectedSize(size)}
                            className={`min-w-[3rem] h-12 px-3 flex items-center justify-center rounded border text-sm font-medium transition-all ${selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* COLORES (Filtrados) */}
            <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Color {selectedSize ? `(en Talle ${selectedSize})` : ''}</h3>
                {availableColors.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {availableColors.map(color => (
                            <button key={color} onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${selectedColor === color ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}>
                                {color}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400 italic">Selecciona un talle para ver colores.</p>
                )}
            </div>

            {/* STOCK INFO */}
            <div className="h-6">
                {hasStock && <p className="text-green-600 text-sm font-medium">Stock disponible: {selectedVariant?.stock} u.</p>}
                {!hasStock && selectedSize && selectedColor && <p className="text-red-500 text-sm font-medium">Sin stock</p>}
            </div>

            <button onClick={handleAddToCart} disabled={!hasStock}
                className={`w-full py-4 rounded-full font-bold text-white transition-all ${hasStock ? 'bg-black hover:opacity-90 shadow-lg' : 'bg-gray-200 cursor-not-allowed'}`}>
                {hasStock ? 'Agregar al Carrito' : 'No disponible'}
            </button>
        </div>
      </div>
    </div>
  );
}