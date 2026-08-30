import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Send, 
  Bot, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  Tag,
  Star,
  CheckCircle2,
  Mic,
  MicOff
} from 'lucide-react';

export default function ConversationalStorefront({ onCheckoutOrder }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Welcome to **RiskSense Nexus Store**! I'm your AI Commerce Co-Pilot. I can recommend developer hardware, bundle complementary items for instant volume discounts, or answer any technical questions. What are you building today?",
      suggestedAction: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products) setProducts(data.products);
      })
      .catch(e => console.error(e));
  }, []);

  // Handle Chat Submit
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setInputMessage('');
    
    // Add user message to thread
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          cart
        })
      });
      const data = await res.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: data.message,
        products: data.products,
        suggestedAction: data.suggestedAction
      }]);

      if (data.unlockedDiscount > 0) {
        setAppliedDiscountPercent(data.unlockedDiscount);
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I'm experiencing a brief latency spike, but our storefront is fully operational. How else can I assist?"
      }]);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Calculations
  const rawTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((rawTotal * appliedDiscountPercent) / 100);
  const finalTotal = rawTotal - discountAmount;

  const handleTriggerCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Add products first.');
      return;
    }
    onCheckoutOrder({
      amount: finalTotal,
      cartItems: cart,
      discountPercent: appliedDiscountPercent
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-mono text-[#38bdf8] font-bold">
            CONVERSATIONAL IN-APP CHECKOUT & REVENUE ENGINE
          </span>
          <h2 className="text-xl font-extrabold text-white mt-0.5">
            RiskSense Smart Storefront
          </h2>
        </div>

        {appliedDiscountPercent > 0 && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Tag className="w-4 h-4" />
            <span>AI Loyalty Discount Unlocked: {appliedDiscountPercent}% OFF</span>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Left Chat Assistant & Right Products + Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (5 cols): Conversational Assistant */}
        <div className="lg:col-span-5 flex flex-col h-[700px] glass-panel rounded-2xl overflow-hidden">
          
          {/* Assistant Header */}
          <div className="p-4 bg-[#0c2340] border-b border-[#0c8ce9]/30 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0c8ce9] flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Commerce AI Co-Pilot</h3>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Autonomous Intent & Upsell Engine</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
              Live In-App
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#0c8ce9] text-white rounded-br-none shadow-md'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>

                {/* Optional suggested products embedded by AI in chat */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full max-w-[88%]">
                    {m.products.map(p => (
                      <div 
                        key={p.id} 
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-white block truncate">{p.name}</span>
                          <span className="text-slate-400 font-mono">₹{p.price.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          onClick={() => addToCart(p)}
                          className="px-2.5 py-1 rounded-lg bg-[#0c8ce9]/20 hover:bg-[#0c8ce9]/40 text-[#38bdf8] text-[11px] font-semibold flex items-center space-x-1 shrink-0"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-1.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 w-24">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0c8ce9] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0c8ce9] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0c8ce9] animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Preset Smart Prompts */}
          <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => { setInputMessage("Can you give me a discount for my order?"); }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
            >
              🎁 Ask for Discount
            </button>
            <button
              onClick={() => { setInputMessage("Show me AI edge computing hardware"); }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
            >
              🧠 Edge AI Hardware
            </button>
            <button
              onClick={() => { setInputMessage("I want to secure my agent API with FIDO2"); }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap"
            >
              🔑 Security Tokens
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask anything or negotiate a custom bundle..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-[#0c8ce9]"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-gradient-to-r from-[#0c8ce9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white transition shadow-md shadow-[#0c8ce9]/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Col (7 cols): Catalog + Cart Sidebar */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="p-4 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3 bg-slate-900">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover opacity-85 hover:opacity-100 transition duration-300" 
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-mono text-[#38bdf8] font-semibold border border-white/10">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">List Price</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-[#0c8ce9] text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-[#0c8ce9] transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart & Real-Time Checkout Drawer */}
          <div className="p-5 rounded-2xl glass-panel border-[#0c8ce9]/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-[#38bdf8]" />
                <span>Active Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono bg-slate-950/40 rounded-xl border border-slate-800/80">
                Cart is currently empty. Pick items from above or ask the AI Co-Pilot for recommendations.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-3">
                        <span className="font-semibold text-white block truncate">{item.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ₹{item.price.toLocaleString('en-IN')} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs text-white font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 flex items-center justify-center ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal, Discount & Checkout Button */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">₹{rawTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedDiscountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>AI Growth Loyalty Discount ({appliedDiscountPercent}%):</span>
                      <span className="font-mono font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span>Final Amount (INR):</span>
                    <span className="text-base font-extrabold text-[#38bdf8] font-mono">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleTriggerCheckout}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0c8ce9] via-[#0284c7] to-[#0369a1] hover:from-[#0284c7] hover:to-[#0c8ce9] text-white font-semibold text-sm shadow-xl shadow-[#0c8ce9]/25 flex items-center justify-center space-x-2 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Razorpay Checkout (₹{finalTotal.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

