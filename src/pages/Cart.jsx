import { useNavigate } from "react-router-dom";
import { trackCheckout } from "../lib/analytics";

export default function Cart({ cart, removeFromCart, updateQuantity }) {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleCheckout = () => {
    trackCheckout(total, cart.length);
    const itemsList = cart
      .map((item, i) => `${i + 1}. ${item.name} (Qty: ${item.quantity || 1}) - Rs.${item.price * item.quantity}`)
      .join("\n");
    const message = `Hello Honeybee Lane,

I would like to confirm this order.

*Order Details:*
${itemsList}

*Total Amount:* Rs.${total}

*Delivery Location:*
I will share my delivery location in the next message.

*Payment:*
Please let me know the available payment methods and delivery charges.

Thank you.`;
    window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-gray-400 text-sm mb-6">Discover our curated collection.</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-brand-black text-brand-cream px-8 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-brand-gold transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 py-4 border-b border-gray-100">
              <div className="w-20 h-20 bg-gray-100 overflow-hidden shrink-0">
                <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-gray-600 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50">-</button>
                    <span className="w-8 text-center text-sm">{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50">+</button>
                  </div>
                  <span className="text-sm font-semibold">Rs. {item.price * (item.quantity || 1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-6 h-fit sticky top-24">
          <h2 className="text-sm font-semibold tracking-wider uppercase mb-4">Summary</h2>
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">Rs. {total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-xs text-gray-400">Calculated at WhatsApp</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">Rs. {total}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-[#25D366] text-brand-cream py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-[#128C7E] transition-colors"
          >
            Order via WhatsApp
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-3">Fast response & safe delivery</p>
        </div>
      </div>
    </div>
  );
}
