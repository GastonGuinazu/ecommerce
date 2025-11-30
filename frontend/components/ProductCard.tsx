import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductProps) {
  return (
    <Link href={`/product/${id}`} className="group block">
      {}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {/* Etiqueta flotante (opcional) */}
        <div className="absolute top-2 left-2 bg-white px-2 py-1 text-xs font-bold uppercase tracking-wide">
          Nuevo
        </div>
      </div>

      {/* 2. Información del Producto */}
      <div className="mt-4 flex justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{category}</p>
          <h3 className="text-sm text-gray-900 font-medium">{name}</h3>
        </div>
        <p className="text-sm font-bold text-gray-900">${price.toLocaleString()}</p>
      </div>
    </Link>
  );
}