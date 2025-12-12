import { useState, useMemo } from 'react';
import { Header } from '@/components/dashboard/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ProductCard } from '@/components/dashboard/ProductCard';
import { AddProductModal } from '@/components/dashboard/AddProductModal';
import { ProductDetailsModal } from '@/components/dashboard/ProductDetailsModal';
import { mockProducts, mockPriceHistory, mockStats } from '@/data/mockData';
import { Product } from '@/types/product';
import { Package, Activity, TrendingDown, Brain } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.lastVerdict.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleAddProduct = (url: string, targetPrice: number) => {
    const newProduct: Product = {
      id: `${Date.now()}`,
      name: 'Novo Produto (Carregando...)',
      url,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      currentPrice: 0,
      targetPrice,
      status: 'ativo',
      lastVerdict: 'Análise pendente',
      sentimentScore: 0,
      verdictType: 'neutro',
      pros: [],
      cons: [],
      lastUpdated: new Date()
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header 
        onAddProduct={() => setIsAddModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total de Produtos"
            value={mockStats.totalProducts}
            icon={Package}
            delay={0}
          />
          <StatsCard
            title="Monitorando Ativamente"
            value={mockStats.activeProducts}
            icon={Activity}
            trend={{ value: 12, isPositive: true }}
            delay={100}
          />
          <StatsCard
            title="Quedas de Preço (7 dias)"
            value={mockStats.priceDrops}
            icon={TrendingDown}
            delay={200}
          />
          <StatsCard
            title="Sentimento Médio"
            value={`${mockStats.avgSentiment}/10`}
            icon={Brain}
            delay={300}
          />
        </section>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Produtos Monitorados</h2>
              <p className="text-muted-foreground">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <div className="rounded-full bg-secondary p-6 mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery 
                  ? 'Tente ajustar sua busca ou adicione novos produtos para monitorar.'
                  : 'Comece adicionando produtos para monitorar preços e análises de IA.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                  delay={index * 100}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <AddProductModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddProduct}
      />

      <ProductDetailsModal
        product={selectedProduct}
        priceHistory={mockPriceHistory}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      <Toaster />
    </div>
  );
};

export default Index;
