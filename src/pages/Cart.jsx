import { useNavigate } from "react-router-dom";
import { trackCheckout } from "../lib/analytics";
import AnimatedIcon, { ICONS } from "../components/AnimatedIcon";

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
    window.open(`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "923233334492"}?text=${encodeURIComponent(message)}`, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6 py-12">
        <div className="w-36 h-36 mb-6 rounded-2xl overflow-hidden border border-brand-border/60 shadow-sm">
          <img src="/Empty Cart Wishlist Luxury Mood Visual.webp" alt="Empty Cart" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-brand-burgundy">Your cart is empty</h1>
        <p className="text-brand-wine-dark/60 text-sm mb-6">Discover our curated collection.</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-brand-burgundy text-brand-cream px-8 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-brand-wine-dark transition-colors shadow-sm rounded-full"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-8 text-brand-burgundy">Shopping Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 py-4 border-b border-brand-border">
              <div className="w-20 h-20 bg-brand-cream border border-brand-border overflow-hidden shrink-0">
                <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium truncate text-brand-burgundy">{item.name}</h3>
                    <p className="text-xs text-brand-wine-dark/60 capitalize">{item.category}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-brand-wine-dark/40 hover:text-brand-burgundy transition-colors shrink-0"
                  >
                    <AnimatedIcon
                      path={ICONS.close}
                      animation="none"
                      hoverAnimation="spin"
                      className="w-4 h-4"
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center border border-brand-border">
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-brand-blush text-brand-wine-dark rounded-full">-</button>
                    <span className="w-8 text-center text-sm text-brand-wine-dark">{item.quantity || 1}</span>
                    <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="w-8 h-8 flex items-center justify-center text-sm hover:bg-brand-blush text-brand-wine-dark rounded-full">+</button>
                  </div>
                  <span className="text-sm font-bold text-brand-burgundy">Rs. {item.price * (item.quantity || 1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-brand-blush/40 border border-brand-border p-6 h-fit sticky top-24 rounded-lg">
          <h2 className="text-sm font-semibold tracking-wider uppercase mb-4 text-brand-burgundy">Summary</h2>
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-wine-dark/70">Subtotal</span>
              <span className="font-semibold text-brand-burgundy">Rs. {total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-wine-dark/70">Shipping</span>
              <span className="text-xs text-brand-wine-dark/60">Calculated at WhatsApp</span>
            </div>
            <div className="border-t border-brand-border pt-3">
              <div className="flex justify-between">
                <span className="font-bold text-brand-wine-dark">Total</span>
                <span className="text-lg font-bold text-brand-burgundy">Rs. {total}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-[#25D366] text-brand-cream py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-[#128C7E] transition-colors shadow-sm rounded-full"
          >
            Order via WhatsApp
          </button>
          <p className="text-[10px] text-brand-wine-dark/60 text-center mt-3">Fast response & safe delivery</p>
        </div>
      </div>
    </div>
  );
}
