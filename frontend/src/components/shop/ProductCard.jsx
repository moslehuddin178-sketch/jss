import { Link } from 'react-router-dom';

const PURITY_LABEL = { '925':'Sterling 925', '999':'Fine 999', '950':'Britannia 950', '800':'Silver 800' };

export default function ProductCard({ product }) {
  return (
    <Link to={`/shop/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden border hover:shadow-lg hover:-translate-y-0.5 transition-all">
      {/* Image */}
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">💍</div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNewArrival && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">New</span>}
          {product.isBestSeller && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Bestseller</span>}
        </div>
        {/* Availability */}
        <div className="absolute bottom-2 right-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            product.available === 'in_stock'
              ? 'bg-white/90 text-green-600'
              : 'bg-white/90 text-amber-600'
          }`}>
            {product.available === 'in_stock' ? '✓ In Stock' : 'Made to Order'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{PURITY_LABEL[product.purity] || product.purity}</span>
          <span className="text-xs text-gray-400">{product.weightGram}g</span>
        </div>
        <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-amber-600 transition-colors">{product.name}</h3>
        <p className="text-xs text-gray-400 capitalize mt-0.5">{product.category}{product.collection ? ` · ${product.collection}` : ''}</p>
        <p className="font-bold text-gray-900 mt-2">${product.price?.toFixed(2)}</p>
      </div>
    </Link>
  );
}