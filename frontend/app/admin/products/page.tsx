'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
  id: string;
  name: string;
  basePrice: string;
  stock: number;
  images: string[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ESTADO PARA EL BUSCADOR
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:3000/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. LÓGICA DE FILTRADO (Magia en tiempo real)
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. NUEVA FUNCIÓN DE BORRADO CON SWEETALERT
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        confirmButton: 'bg-black text-white px-4 py-2 rounded-md mx-2 hover:bg-gray-800 transition-colors',
        cancelButton: 'bg-red-500 text-white px-4 py-2 rounded-md mx-2 hover:bg-red-600 transition-colors',
        popup: 'rounded-xl shadow-xl'
      }
    });

    // B. Si el usuario dijo que NO, no hacemos nada
    if (!result.isConfirmed) return;

    // C. Si dijo que SÍ, borramos
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:3000/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("No se pudo eliminar");

      // Actualizamos la lista visualmente
      setProducts(products.filter(p => p.id !== id));
      
      // Notificación Toast
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Producto eliminado',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });

    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando catálogo...</div>;

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Encabezado + Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="mt-2 text-sm text-gray-700">
            {filteredProducts.length} productos encontrados
          </p>
        </div>

        <div className="flex gap-4 w-full sm:w-auto">
          {/* INPUT BUSCADOR */}
          <div className="relative flex-1 sm:flex-initial">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar producto..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link
            href="/admin/products/new"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} /> Nuevo
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  
                  {/* Nombre e Imagen */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          src={product.images[0] || 'https://via.placeholder.com/40'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Precio */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${Number(product.basePrice).toLocaleString()}</div>
                  </td>

                  {/* Stock/Estado */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Activo
                    </span>
                  </td>

                  {/* Acciones (Corregido) */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-3">
                      <Link 
                        href={`/admin/products/${product.id}`} 
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  No se encontraron productos que coincidan con tu búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}