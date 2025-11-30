'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

// --- LISTAS ---
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Amarillo", "Gris", "Rosa"];

interface Category { id: number; name: string; children: Category[]; }
interface Variant { id: string; size: string; color: string; stock: number; images: string[]; }

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // --- ESTADO DE VARIANTES (MULTIPLE) ---
  const [variants, setVariants] = useState<Variant[]>([]);
  
  // Nuevo Estado para Carga Masiva
  const [bulkColor, setBulkColor] = useState('');
  const [bulkSizes, setBulkSizes] = useState<string[]>([]); 
  const [bulkStock, setBulkStock] = useState('');
  const [variantFile, setVariantFile] = useState<File | null>(null);
  const [addingVariant, setAddingVariant] = useState(false);

  // --- ESTADO PRODUCTO PRINCIPAL ---
  const [formData, setFormData] = useState({ name: '', description: '', basePrice: '', categoryId: '', imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // 1. CARGA INICIAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCat, resProd] = await Promise.all([
          fetch('http://127.0.0.1:3000/categories'),
          fetch(`http://127.0.0.1:3000/products/${id}`)
        ]);
        
        const dataCat = await resCat.json();
        const product = await resProd.json();

        setCategories(dataCat);
        setFormData({
          name: product.name,
          description: product.description || '',
          basePrice: product.basePrice,
          categoryId: product.categoryId ? String(product.categoryId) : '', 
          imageUrl: product.images[0] || '',
        });
        setVariants(product.variants || []);
        if (product.images[0]) setPreview(product.images[0]);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudo cargar el producto", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Manejadores básicos
  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e: any) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // --- LÓGICA DE CARGA MASIVA DE VARIANTES ---
  
  const toggleSize = (size: string) => {
    if (bulkSizes.includes(size)) {
      setBulkSizes(bulkSizes.filter(s => s !== size));
    } else {
      setBulkSizes([...bulkSizes, size]);
    }
  };

  const handleAddBulkVariants = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (bulkSizes.length === 0) return Swal.fire('Falta Talle', 'Selecciona al menos un talle', 'warning');
    if (!bulkColor) return Swal.fire('Falta Color', 'Selecciona un color', 'warning');
    if (!bulkStock) return Swal.fire('Falta Stock', 'Define el stock por talle', 'warning');

    setAddingVariant(true);
    
    try {
      const token = localStorage.getItem('token');
      let variantImageUrl = "";

      // 1. Subir la foto (UNA SOLA VEZ para todas las variantes)
      if (variantFile) {
        const uploadData = new FormData();
        uploadData.append('file', variantFile);
        const resUp = await fetch('http://127.0.0.1:3000/files/upload', { method: 'POST', body: uploadData });
        const dataUp = await resUp.json();
        variantImageUrl = dataUp.url;
      }

      // 2. Crear un array de promesas (peticiones en paralelo)
      const promises = bulkSizes.map(async (size) => {
        const body = {
          size: size,
          color: bulkColor,
          stock: Number(bulkStock),
          imageUrl: variantImageUrl
        };

        const res = await fetch(`http://127.0.0.1:3000/products/${id}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        
        if (!res.ok) throw new Error(`Error creando talle ${size}`);
        return await res.json();
      });

      // 3. Esperar a que se procesen todas
      const newVariants = await Promise.all(promises);
      
      // 4. ACTUALIZACIÓN INTELIGENTE (SIN DUPLICADOS)
      // En lugar de agregar al final, verificamos si la ID ya existe y la actualizamos.
      setVariants((currentVariants) => {
        const updatedList = [...currentVariants];
        
        newVariants.forEach((incoming: any) => {
          const index = updatedList.findIndex(v => v.id === incoming.id);
          if (index >= 0) {
            // SI EXISTE: Reemplazamos (Actualiza el stock visualmente)
            updatedList[index] = incoming;
          } else {
            // SI NO EXISTE: Agregamos al final
            updatedList.push(incoming);
          }
        });
        
        return updatedList;
      });
      
      // Limpiar formulario
      setBulkSizes([]);
      setBulkStock('');
      setVariantFile(null); 
      
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Stock actualizado', timer: 2000, showConfirmButton: false });

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema procesando las variantes", "error");
    } finally {
      setAddingVariant(false);
    }
  };

  const handleDeleteVariant = async (vid: string) => {
    if(!confirm("¿Borrar variante?")) return;
    try {
        const token = localStorage.getItem('token');
        await fetch(`http://127.0.0.1:3000/products/variants/${vid}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        setVariants(variants.filter(v => v.id !== vid));
    } catch (err) { alert("Error al borrar"); }
  };

  // --- LÓGICA GUARDAR DATOS PRINCIPALES ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    console.log("Intentando guardar...", formData);

    try {
      const token = localStorage.getItem('token');
      let finalImageUrl = formData.imageUrl;

      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        const resUpload = await fetch('http://127.0.0.1:3000/files/upload', { method: 'POST', body: uploadData });
        const dataUpload = await resUpload.json();
        finalImageUrl = dataUpload.url;
      }

      const body = {
        name: formData.name,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        categoryId: Number(formData.categoryId),
        images: [finalImageUrl],
      };

      const res = await fetch(`http://127.0.0.1:3000/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar");
      }

      Swal.fire({ icon: 'success', title: 'Cambios Guardados', timer: 1500, showConfirmButton: false });
    } catch (error: any) { 
        console.error(error);
        Swal.fire("Error", error.message || "No se pudo guardar", "error");
    } finally { 
        setSaving(false); 
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6">
        <Link href="/admin/products" className="flex items-center text-gray-500 hover:text-black"><ArrowLeft size={20} className="mr-2" /> Volver</Link>
        <span className="text-sm text-gray-400">ID: {id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: DATOS GENERALES */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6 border border-gray-200">
            <h2 className="text-xl font-bold">Datos Principales</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded focus:ring-black focus:border-black" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} className="w-full border p-2 rounded" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border p-2 rounded bg-white">
                      <option value="">Seleccionar...</option>
                      {categories.map(c => <optgroup key={c.id} label={c.name}><option value={c.id}>{c.name}</option>{c.children?.map(ch=><option key={ch.id} value={ch.id}>{ch.name}</option>)}</optgroup>)}
                  </select>
               </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="description" rows={3} value={formData.description} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>

            <button type="submit" disabled={saving} className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors">
                {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          
          {/* FOTO PRINCIPAL */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold mb-4">Imagen Principal</h3>
            <div className="aspect-square w-full bg-gray-50 rounded-md overflow-hidden mb-4 border border-gray-200 relative flex items-center justify-center">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-gray-400 text-sm">Sin imagen</span>}
            </div>
            <label className="flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">
              <UploadCloud size={18} className="mr-2" />
              {selectedFile ? 'Archivo seleccionado' : 'Cambiar Foto'}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* CARGA MASIVA DE VARIANTES */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="font-bold mb-4">Stock y Variantes</h3>
            
            <form onSubmit={handleAddBulkVariants} className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">1. Configuración General</p>
                
                <div className="flex gap-2 mb-4">
                    <select className="border p-2 rounded text-sm flex-1 bg-white focus:ring-black focus:border-black" value={bulkColor} onChange={e => setBulkColor(e.target.value)}>
                        <option value="">Elegir Color...</option>
                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    
                    <label className="flex items-center justify-center px-3 border bg-white rounded cursor-pointer hover:bg-gray-100 transition-colors" title="Foto para este color">
                         {variantFile ? <Check size={16} className="text-green-600"/> : <ImageIcon size={18} className="text-gray-500"/>}
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && setVariantFile(e.target.files[0])} />
                    </label>
                </div>

                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">2. Talles Disponibles</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {SIZES.map(size => {
                        const isSelected = bulkSizes.includes(size);
                        return (
                            <button 
                                key={size} 
                                type="button"
                                onClick={() => toggleSize(size)}
                                className={`w-9 h-9 rounded text-xs font-bold border transition-all ${isSelected ? 'bg-black text-white border-black shadow-sm' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'}`}
                            >
                                {size}
                            </button>
                        )
                    })}
                </div>

                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">3. Stock por Talle</p>
                
                <div className="flex flex-col gap-3"> 
                    <input 
                        type="number" 
                        placeholder="Ej: 10 unidades" 
                        className="w-full border p-2 rounded text-sm focus:ring-black focus:border-black" 
                        value={bulkStock} 
                        onChange={e => setBulkStock(e.target.value)} 
                    />
                    <button 
                        disabled={addingVariant} 
                        className="w-full bg-black text-white py-3 rounded-md text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-all uppercase tracking-wider shadow-sm"
                    >
                        {addingVariant ? 'Guardando...' : '+ AGREGAR AL STOCK'}
                    </button>
                </div>
            </form>

            {/* LISTADO */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {variants.map((v) => (
                    <div key={v.id} className="flex justify-between items-center bg-white border p-2 rounded text-sm hover:border-gray-300">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden border">
                                {v.images && v.images[0] ? <img src={v.images[0]} className="w-full h-full object-cover"/> : <span className="text-[8px] flex items-center justify-center h-full">N/A</span>}
                            </div>
                            <div>
                                <span className="font-bold bg-gray-100 px-1 rounded">{v.size}</span>
                                <span className="ml-2 text-gray-600">{v.color}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-500">Stock: {v.stock}</span>
                            <button onClick={() => handleDeleteVariant(v.id)} type="button" className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}