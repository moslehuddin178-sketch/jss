import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { publicAPI } from '../../api';
import ShopLayout from '../../components/shop/ShopLayout';

const PURITY_LABEL = { '925':'Sterling Silver 925', '999':'Fine Silver 999', '950':'Britannia 950', '800':'Silver 800' };

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    setLoading(true);
    publicAPI.getProduct(id)
      .then(r => setProduct(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ShopLayout><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div></ShopLayout>;

  if (error || !product) return (
    <ShopLayout>
      <div className="text-center py-20">
        <p className="text-5xl mb-3">💔</p>
        <p className="font-medium text-gray-700">Product not found</p>
        <Link to="/shop" className="mt-4 inline-block text-sm text-amber-600">← Back to shop</Link>
      </div>
    </ShopLayout>
  );

  return (
    <ShopLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/shop" className="hover:text-amber-600">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-amber-600 capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="aspect-square bg-white rounded-2xl border overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">💍</div>
            )}
          </div>
          {/* QR code */}
          {product.qrCode && (
            <div className="mt-3 flex items-center gap-3 bg-white rounded-xl border p-3">
              <img src={product.qrCode} alt="QR" className="w-16 h-16" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Scan in store</p>
                <p className="text-xs text-gray-400">Show this code to verify authenticity</p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.isNewArrival && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">New Arrival</span>}
            {product.isBestSeller && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Bestseller</span>}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              product.available === 'in_stock' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {product.available === 'in_stock' ? '✓ In Stock' : 'Made to Order'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-400 text-sm mt-1 font-mono">{product.sku}</p>

          <p className="text-3xl font-bold text-gray-900 mt-4">${product.price?.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Price reflects current live silver rate</p>

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed mt-5">{product.description}</p>
          )}

          {/* Specs */}
          <div className="mt-6 bg-white rounded-2xl border divide-y">
            {[
              ['Purity',     PURITY_LABEL[product.purity] || product.purity],
              ['Weight',     `${product.weightGram}g`],
              ['Category',   product.category],
              ['Finish',     product.finish || 'Polished'],
              ['For',        product.gender || 'Unisex'],
              product.size && ['Size', product.size],
              product.collection && ['Collection', product.collection],
              ['Stones',     product.hasStone ? 'Yes' : 'None'],
            ].filter(Boolean).map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="font-medium text-gray-800 capitalize">{v}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3">
            <button onClick={() => setShowInquiry(true)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors">
              📩 Reserve / Inquire
            </button>
            <button onClick={() => navigate('/shop')}
              className="px-5 border rounded-xl text-sm text-gray-600 hover:bg-stone-50 transition-colors">
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Inquiry modal */}
      {showInquiry && <InquiryModal product={product} onClose={() => setShowInquiry(false)} />}
    </ShopLayout>
  );
}

function InquiryModal({ product, onClose }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:'', phone:'', message:'' });

  const submit = () => {
    if (!form.name || !form.phone) return;
    // For now, just show success. Later: POST to a backend inquiry endpoint.
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {sent ? (
          <div className="text-center py-6">
            <p className="text-5xl mb-3">✅</p>
            <h3 className="font-bold text-lg text-gray-900">Inquiry sent!</h3>
            <p className="text-sm text-gray-500 mt-1">Our team will contact you shortly about <strong>{product.name}</strong>.</p>
            <button onClick={onClose} className="mt-5 w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-medium">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-lg text-gray-900">Reserve / Inquire</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">About: <strong>{product.name}</strong> · ${product.price?.toFixed(2)}</p>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))}
                placeholder="Your name *" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone:e.target.value}))}
                placeholder="Phone number *" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <textarea value={form.message} onChange={e => setForm(f => ({...f, message:e.target.value}))}
                placeholder="Message (optional)" className="w-full border rounded-lg px-3 py-2.5 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <button onClick={submit} disabled={!form.name || !form.phone}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white py-2.5 rounded-xl font-medium transition-colors">
              Send Inquiry
            </button>
          </>
        )}
      </div>
    </div>
  );
}