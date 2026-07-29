import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicAPI } from '../../api';
import ShopLayout from '../../components/shop/ShopLayout';
import ProductCard from '../../components/shop/ProductCard';


const CATEGORIES = ['ring','necklace','bracelet','earring','anklet','pendant','chain','bangle','set'];
const PURITIES   = ['925','999','950','800'];
const GENDERS    = ['women','men','unisex'];

export default function Storefront() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [page, setPage]           = useState(1);
  const [silver, setSilver]       = useState(null);

  // Filters from URL
  const category = searchParams.get('category') || '';
  const purity   = searchParams.get('purity')   || '';
  const gender   = searchParams.get('gender')   || '';
  const search   = searchParams.get('search')   || '';
  const sortBy   = searchParams.get('sortBy')   || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else       next.delete(key);
    setSearchParams(next);
    setPage(1);
  };

  const clearFilters = () => { setSearchParams({}); setPage(1); };

  const load = useCallback(() => {
    setLoading(true);
    publicAPI.catalog({
      category, purity, gender, search, sortBy, minPrice, maxPrice,
      page, limit: 12,
    })
      .then(r => {
        setProducts(r.data.data);
        setTotal(r.data.total);
        setPages(r.data.pages);
        setSilver(r.data.silverPrice);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, purity, gender, search, sortBy, minPrice, maxPrice, page]);

  useEffect(() => { load(); }, [load]);

  const activeFilters = [category, purity, gender, search, minPrice, maxPrice].filter(Boolean).length;

  return (
    <ShopLayout>
      {/* Hero */}
      {!activeFilters && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 mb-6 text-white">
          <h1 className="text-2xl font-bold mb-1">Handcrafted Silver Jewelry</h1>
          <p className="text-slate-300 text-sm">Live pricing · {total} pieces available {silver && `· Silver at $${silver}/g`}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <aside className="w-56 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-2xl border p-4 sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-amber-600 hover:text-amber-700">Clear all</button>
              )}
            </div>

            {/* Category */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Category</p>
              <div className="space-y-1">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilter('category', category === c ? '' : c)}
                    className={`block w-full text-left text-sm px-2 py-1 rounded-lg capitalize transition-colors ${
                      category === c ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-600 hover:bg-stone-50'
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Purity */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Purity</p>
              <div className="flex flex-wrap gap-1.5">
                {PURITIES.map(p => (
                  <button key={p} onClick={() => setFilter('purity', purity === p ? '' : p)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      purity === p ? 'bg-amber-500 text-white border-amber-500' : 'text-gray-600 border-gray-200 hover:border-amber-300'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">For</p>
              <div className="flex flex-wrap gap-1.5">
                {GENDERS.map(g => (
                  <button key={g} onClick={() => setFilter('gender', gender === g ? '' : g)}
                    className={`text-xs px-2.5 py-1 rounded-lg border capitalize transition-colors ${
                      gender === g ? 'bg-amber-500 text-white border-amber-500' : 'text-gray-600 border-gray-200 hover:border-amber-300'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Price ($)</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" defaultValue={minPrice}
                  onBlur={e => setFilter('minPrice', e.target.value)}
                  className="w-full text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400" />
                <input type="number" placeholder="Max" defaultValue={maxPrice}
                  onBlur={e => setFilter('maxPrice', e.target.value)}
                  className="w-full text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400" />
              </div>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading…' : `${total} ${total === 1 ? 'item' : 'items'}`}
              {search && <span> for "<span className="font-medium text-gray-700">{search}</span>"</span>}
            </p>
            <select value={sortBy} onChange={e => setFilter('sortBy', e.target.value)}
              className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="weight_desc">Heaviest</option>
            </select>
          </div>

          {/* Active filter chips (mobile) */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
              {category && <Chip label={category} onClear={() => setFilter('category','')} />}
              {purity   && <Chip label={purity}   onClear={() => setFilter('purity','')} />}
              {gender   && <Chip label={gender}   onClear={() => setFilter('gender','')} />}
              <button onClick={clearFilters} className="text-xs text-amber-600">Clear all</button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border overflow-hidden animate-pulse">
                  <div className="aspect-square bg-stone-100" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-3 bg-stone-100 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-3">🔍</p>
              <p className="font-medium text-gray-700">No products found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="mt-4 text-sm text-amber-600 hover:text-amber-700">Clear all filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-stone-50">← Prev</button>
              <span className="text-sm text-gray-500">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-stone-50">Next →</button>
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}

function Chip({ label, onClear }) {
  return (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full capitalize">
      {label}
      <button onClick={onClear} className="hover:text-amber-900">×</button>
    </span>
  );
}