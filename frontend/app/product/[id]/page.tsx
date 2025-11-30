import { notFound } from 'next/navigation';
import ProductView from '@/components/ProductView';

export const revalidate = 0;

async function getProduct(id: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3000/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return undefined;
    return res.json();
  } catch (error) { return undefined; }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return notFound();

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <ProductView product={product} />
    </div>
  );
}