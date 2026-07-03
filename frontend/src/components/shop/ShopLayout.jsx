import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../../api';

export default function ShopLayout({ children }) {
  const [silver, setSilver] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    publicAPI.silverPrice()
      .then(r => setSilver(r.data.gramPrice))
      .catch(() => {});
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/shop" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-lg">💎</div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">Silver Palace</p>
                <p className="text-xs text-gray-400 hidden sm:block">Fine Silver Jewelry</p>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={submitSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search rings, necklaces, bracelets…"
                  className="w-full bg-stone-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </form>

            {/* Silver price + staff link */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {silver && (
                <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                  <span className="text-amber-500 text-sm">🪙</span>
                  <span className="text-xs font-semibold text-amber-700">${silver}/g</span>
                  <span className="text-xs text-amber-400">live</span>
                </div>
              )}
              <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Staff Login
              </Link>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={submitSearch} className="md:hidden pb-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search jewelry…"
                className="w-full bg-stone-100 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </form>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">💎</div>
              <p className="font-bold">Silver Palace</p>
            </div>
            <p className="text-slate-400 text-sm">Handcrafted fine silver jewelry. Live pricing based on real-time silver rates.</p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Categories</p>
            <div className="space-y-1.5 text-sm text-slate-400">
              <Link to="/shop?category=ring" className="block hover:text-amber-400">Rings</Link>
              <Link to="/shop?category=necklace" className="block hover:text-amber-400">Necklaces</Link>
              <Link to="/shop?category=bracelet" className="block hover:text-amber-400">Bracelets</Link>
              <Link to="/shop?category=earring" className="block hover:text-amber-400">Earrings</Link>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Visit Us</p>
            <p className="text-slate-400 text-sm">Istanbul, Turkey<br />Open daily 10am – 8pm</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-slate-500 text-xs">
          © {new Date().getFullYear()} Silver Palace · All prices update with live silver rates
        </div>
      </footer>
    </div>
  );
}