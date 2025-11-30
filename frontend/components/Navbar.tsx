'use client';

import Link from 'next/link';
import { Search, Menu, X, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartWidget from './CartWidget';
import UserMenu from './UserMenu';

interface Category {
  id: number;
  name: string;
  slug: string;
  children: Category[];
}

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:3000/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error cargando menú:", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Estilo unificado para los textos
  const labelStyle = "hidden lg:block text-[10px] uppercase tracking-wide font-bold mt-1 text-gray-500 group-hover:text-black transition-colors text-center";

  return (
    <nav className="fixed w-full z-50 bg-white shadow-sm top-0 font-sans">
      
      {/* FILA 1 */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-8">
            
            {/* LOGO */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-3xl font-black tracking-tighter uppercase font-serif italic">
                Mi Marca
              </Link>
            </div>

            {/* BUSCADOR */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="w-full relative group">
                <input 
                  type="text" 
                  placeholder="¿Qué estás buscando?"
                  className="w-full border border-gray-300 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-transparent hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors">
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* HERRAMIENTAS DERECHA */}
            <div className="flex items-center space-x-8">

              {/* MI CUENTA (Ahora con dropdown) */}
              {/* 👇 "relative group" es vital para que funcione el menú desplegable */}
              <div className="relative group flex flex-col items-center justify-center cursor-pointer min-w-[50px] h-full">
                 <UserMenu />
                 <span className={labelStyle}>Mi Cuenta</span>
              </div>

              {/* MI CARRITO */}
              <div className="group flex flex-col items-center justify-center cursor-pointer min-w-[50px]">
                <CartWidget />
                <span className={labelStyle}>Mi Carrito</span>
              </div>

              {/* MÓVIL */}
              <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILA 2: CATEGORÍAS */}
      <div className="hidden md:block bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-10 h-12 items-center">
            
            <Link href="/products" className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-widest transition-colors">
              • Ver Todo •
            </Link>

            {categories.map((category) => (
              <div key={category.id} className="relative group h-full flex items-center">
                <Link 
                  href={`/category/${category.slug}`} 
                  className="text-xs font-bold text-gray-700 hover:text-black uppercase tracking-widest transition-colors h-full flex items-center border-b-2 border-transparent hover:border-black px-1"
                >
                  • {category.name} •
                </Link>

                {category.children && category.children.length > 0 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-48 bg-white shadow-xl border border-gray-100 rounded-b-lg py-2 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-150 z-50">
                    {category.children.map((child) => (
                      <Link
                        key={child.id}
                        href={`/category/${child.slug}`}
                        className="block px-4 py-2 text-xs text-gray-500 hover:text-black hover:bg-gray-50 transition-colors uppercase tracking-wide text-center"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 h-screen absolute w-full left-0 top-20 overflow-y-auto z-40">
          <div className="p-4 border-b border-gray-100">
             <form onSubmit={handleSearch} className="relative">
                <input type="text" placeholder="Buscar..." className="w-full border border-gray-300 rounded-md py-2 pl-4 pr-10 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button type="submit" className="absolute right-2 top-2 text-gray-400"><Search size={18}/></button>
             </form>
          </div>
          <div className="pt-2 pb-3 space-y-1">
            {categories.map((category) => (
              <div key={category.id}>
                <Link href={`/category/${category.slug}`} className="block px-6 py-3 text-sm font-bold text-gray-900 uppercase bg-gray-50 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                  {category.name}
                </Link>
                {category.children?.map((child) => (
                  <Link key={child.id} href={`/category/${child.slug}`} className="block px-6 py-3 text-sm text-gray-500 hover:text-black pl-10 border-b border-gray-50" onClick={() => setIsOpen(false)}>
                    {child.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}