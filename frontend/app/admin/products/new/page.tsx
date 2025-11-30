'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  children: Category[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // 1. Estado para categorías
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    stock: '',
    categoryId: '', // Lo dejamos vacío al inicio para obligar a elegir
  });

  // 2. CARGAR CATEGORÍAS AL INICIAR
  useEffect(() => {
    fetch('http://127.0.0.1:3000/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error cargando categorías", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No estás logueado");
      if (!formData.categoryId) {
        alert("Por favor selecciona una categoría");
        setLoading(false);
        return;
      }

      let finalImageUrl = "";

      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        const resUpload = await fetch('http://127.0.0.1:3000/files/upload', {
          method: 'POST',
          body: uploadData, 
        });

        if (!resUpload.ok) throw new Error("Error subiendo la imagen");
        const dataUpload = await resUpload.json();
        finalImageUrl = dataUpload.url; 
      }

      const productBody = {
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        stock: Number(formData.stock),
        categoryId: Number(formData.categoryId), // Enviamos el ID real seleccionado
        images: finalImageUrl ? [finalImageUrl] : [], 
      };

      const resProduct = await fetch('http://127.0.0.1:3000/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productBody),
      });

      
      if (resProduct.status === 401) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');           
        return;                        
      }

      if (!resProduct.ok) throw new Error("Error creando el producto");

      alert("¡Producto creado con éxito!");
      router.push('/admin'); 

    } catch (error) {
      console.error(error);
      alert("Hubo un error. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      
      <Link href="/admin" className="flex items-center text-gray-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Volver al Panel
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuevo Producto</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow border border-gray-200">
        
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input type="text" name="name" required onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-black focus:border-black" />
        </div>

        {/* Categoría (DINÁMICO) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 bg-white focus:outline-none focus:ring-black focus:border-black sm:text-sm"
          >
            <option value="">-- Selecciona --</option>
            {categories.map(parent => (
              <optgroup key={parent.id} label={parent.name}>
                {/* Opción para seleccionar al Padre mismo (ej: Solo "Hombre") */}
                <option value={parent.id}>{parent.name} (General)</option>
                
                {/* Opciones para los hijos (ej: "Hombre > Remeras") */}
                {parent.children?.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea name="description" rows={3} onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-black focus:border-black" />
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input type="number" name="basePrice" required onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-black focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Inicial</label>
            <input type="number" name="stock" required onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-black focus:border-black" />
          </div>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md inline-flex items-center border border-gray-300 transition-colors">
              <UploadCloud size={20} className="mr-2" />
              Seleccionar Archivo
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            {preview && (
              <div className="h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50">
          {loading ? 'Subiendo...' : <><Save size={18} className="mr-2"/> Crear Producto</>}
        </button>

      </form>
    </div>
  );
}