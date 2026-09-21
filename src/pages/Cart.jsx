import { useNavigate } from "react-router-dom";
import { trackCheckout } from "../lib/analytics";
import AnimatedIcon, { ICONS } from "../components/AnimatedIcon";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "923233334492";

export default function Cart({ cart, removeFromCart, updateQuantity }) {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const whatsappUrl = (() => {
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
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  })();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6 py-12">
        <div className="w-36 h-36 mb-6 rounded-2xl overflow-hidden border border-brand-border/60 shadow-sm">
          <img src="/Empty Cart Wishlist Luxury Mood Visual.webp" alt="Empty Cart" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold mb-3 text-brand-burgundy">Your cart is empty</h1>
        <p className="text-brand-wine-dark/60 text-sm mb-6">Discover our curated collection.</p>
        <button
          onClick={() => navigate("/shop")}
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
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCheckout(total, cart.length)}
            className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] text-brand-cream py-3.5 text-sm font-semibold tracking-wider uppercase hover:bg-[#128C7E] transition-colors shadow-sm rounded-full"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Order via WhatsApp
          </a>
          <p className="text-[10px] text-brand-wine-dark/60 text-center mt-3">Fast response & safe delivery</p>
        </div>
      </div>
    </div>
  );
}

