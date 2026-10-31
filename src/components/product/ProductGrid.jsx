import ProductCard from './ProductCard';

export default function ProductGrid({
  products = [],
  onQuickAdd,
  viewCols,
  className = '',
}) {
  const getGridClasses = () => {
    if (viewCols === 1) {
      return 'grid-cols-1 gap-y-6';
    }
    if (viewCols === 2) {
      return 'grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-5 sm:gap-y-6';
    }
    if (viewCols === 4) {
      return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 lg:gap-x-5 gap-y-6 sm:gap-y-7';
    }
    if (viewCols === 6) {
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-2.5 sm:gap-x-3.5 xl:gap-x-4 gap-y-5 sm:gap-y-6';
    }
    // Mặc định responsive: Mobile: 1-2 | Tablet: 2-4 | Desktop: 4-6
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-3 sm:gap-x-4 xl:gap-x-5 gap-y-6 sm:gap-y-7';
  };

  return (
    <div className={`grid ${getGridClasses()} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onQuickAdd={onQuickAdd}
        />
      ))}
    </div>
  );
}