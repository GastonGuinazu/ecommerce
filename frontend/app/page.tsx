import ProductCard from '@/components/ProductCard';

// 1. Definimos la "forma" de los datos que vienen del Backend
// (Esto debe coincidir con lo que ves en Postman/PowerShell)
interface BackendProduct {
  id: string;
  name: string;
  basePrice: string; // Prisma suele enviar los Decimales como texto
  images: string[];  // El array de URLs que agregamos hoy
  categoryId: number | null;
}

// 2. Función para ir a buscar los datos
async function getProducts() {
  // cache: 'no-store' asegura que siempre traiga datos frescos (no caché)
  // Asegúrate que tu backend corre en el puerto 3000
  const res = await fetch('http://localhost:3000/products', { cache: 'no-store' });
  
  if (!res.ok) {
    // Si el backend está apagado o falla, esto evita que explote todo feo
    throw new Error('No se pudo conectar con el Backend');
  }
  
  return res.json();
}

export default async function Home() {
  // 3. Llamamos a los datos reales
  let products: BackendProduct[] = [];
  
  try {
    products = await getProducts();
  } catch (error) {
    console.error("Error cargando productos:", error);
    // Podríamos mostrar un mensaje de error visual aquí
  }

  return (
    <main className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight text-center uppercase">
        Colección 2025
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            // Convertimos el precio de String a Number
            price={Number(product.basePrice)}
            // Lógica de Imagen: Si tiene fotos, usa la primera. Si no, usa una genérica.
            image={product.images && product.images.length > 0 
              ? product.images[0] 
              : 'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=800' // Placeholder gris
            }
            // Como aun no tenemos nombres de categorías, ponemos un genérico
            category="Indumentaria"
          />
        ))}
      </div>
    </main>
  );
}