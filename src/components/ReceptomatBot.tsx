import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ChefHat, Send, HelpCircle, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API setup
const GEMINI_API_KEY = 'AIzaSyArfBbvVJSo4InD5OTmoP4TLUYCNKx2hvg';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export function ReceptomatBot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{type: 'bot' | 'user', message: string}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [botState, setBotState] = useState<'idle' | 'thinking' | 'talking' | 'bouncing'>('bouncing');

  // Kontinuirano skakutanje - SAMO VIZUELNI EFEKAT
  useEffect(() => {
    if (chatOpen) return;

    const bounceInterval = setInterval(() => {
      setBotState('bouncing');
      setTimeout(() => setBotState('idle'), 2000);
    }, 8000); // Skače svakih 8 sekundi

    return () => clearInterval(bounceInterval);
  }, [chatOpen]);

  // 🔥 JEDNOSTAVAN KLIK - OTVARA CHAT ODMAH
  const handleBotClick = () => {
    if (chatOpen) {
      // Zatvori chat
      setChatOpen(false);
      setBotState('bouncing');
    } else {
      // Otvori chat direktno
      setChatOpen(true);
      setBotState('talking');
      
      // Postavi welcome poruku SAMO AKO NEMA PORUKA
      if (chatMessages.length === 0) {
        setChatMessages([{ 
          type: 'bot', 
          message: "Zdravo! 👋 Ja sam Receptomat, tvoj pozitivni kulinarski asistent! Pitaj me bilo šta o kuvanju - uvek ću ti naći rešenje! 👨‍🍳✨" 
        }]);
      }
    }
  };

  // Gemini chat funkcija
  const handleGeminiChat = async (userQuestion: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const systemPrompt = `Ti si Receptomat Bot, pozitivni AI kulinarski asistent koji UVEK POMAŽE i UVEK NUDI REŠENJA!

KLJUČNE KARAKTERISTIKE:
- NIKAD ne kažeš "ne možeš", "nemoguće", "bez toga ne ide"
- UVEK ponudiš KREATIVNE ALTERNATIVE i ZAMENE
- UVEK daš POZITIVNE predloge kako da se napravi jelo
- Fokusiraš se na REŠENJA, ne na probleme

TVOJA EKSPERTIZA:
- Recepti i kuvanje (GLAVNA TEMA)
- Kreativne zamene sastojaka
- Tehnike pripreme hrane
- Kulinarski saveti i trikovi
- Načini čuvanja hrane
- Nutritivne informacije o hrani

VAŽNO PONAŠANJE:
- Ako neko pita kako da napravi jelo bez nekih sastojaka → ODMAH predloži zamene!
- Ako nema osnovne sastojke → predloži ALTERNATIVNE recepte sa onim što ima
- Ako pita o ne-kulinarskim temama → ljubazno preusmeri na kuvanje
- Odgovori kratko, jasno i POZITIVNO (maksimalno 2-3 rečenice)
- Koristi emoji da budeš prijateljski nastrojen
- Govori na srpskom jeziku

PRIMERI POZITIVNIH ODGOVORA:
❌ "Ne možeš napraviti palačinke bez brašna"
✅ "Odličo! Umesto brašna koristi ovsene pahuljice ili bananu! Evo kako..."

❌ "Bez mleka nema palačinki"  
✅ "Super izazov! Umesto mleka koristi vodu + malo ulja, ili biljno mleko!"

Pitanje korisnika: "${userQuestion}"`;

      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "Izvini, trenutno imam problema sa odgovaranjem. Ali ne brini - uvek postoji način da napraviš nešto ukusno! Pokušaj ponovo za malo! 😅✨";
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const currentMessage = userMessage.trim();
    setChatMessages(prev => [...prev, { type: 'user', message: currentMessage }]);
    setUserMessage('');
    
    setIsTyping(true);
    setBotState('thinking');

    try {
      const botResponse = await handleGeminiChat(currentMessage);
      
      setIsTyping(false);
      setBotState('talking');
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        message: botResponse
      }]);
    } catch (error) {
      setIsTyping(false);
      setBotState('talking');
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        message: "Ups! Nešto je pošlo po zlu. Ali ne brini - uvek postoji način da napraviš nešto ukusno! Pokušaj ponovo! 😅✨" 
      }]);
    }
  };

  const closeChat = () => {
    setChatOpen(false);
    setBotState('bouncing');
    // NE BRIŠI PORUKE - ostaju sačuvane
  };

  const clearChat = () => {
    setChatMessages([{ 
      type: 'bot', 
      message: "Zdravo! 👋 Ja sam Receptomat, tvoj pozitivni kulinarski asistent! Pitaj me bilo šta o kuvanju - uvek ću ti naći rešenje! 👨‍🍳✨" 
    }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble - SAMO KADA JE OTVOREN */}
      {chatOpen && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-slide-up mb-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <img 
                  src="/images/logo.webp" 
                  alt="Receptomat" 
                  className="w-6 h-6 rounded-full"
                />
              </div>
              <div>
                <h4 className="font-semibold text-white">Receptomat Bot</h4>
                <div className="flex items-center gap-1 text-xs text-white/80">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Spreman za tvoja pitanja!
                </div>
              </div>
            </div>
            <button 
              onClick={closeChat}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 max-h-80 overflow-y-auto space-y-3">
            {/* Chat Messages */}
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <ChefHat size={16} className="text-white" />
                  </div>
                )}
                <div className={`rounded-2xl p-3 max-w-xs ${
                  msg.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm' 
                    : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-gray-800 rounded-tl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Loader2 size={16} className="text-white animate-spin" />
                </div>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - UVEK PRIKAŽI */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                placeholder="Pitaj me bilo šta o kuvanju..."
                disabled={isTyping}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userMessage.trim() || isTyping}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTyping ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            
            {/* Clear chat button */}
            <button
              onClick={clearChat}
              className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Obriši razgovor
            </button>
          </div>
        </div>
      )}

      {/* Bot Avatar Button - SAMO KLIK, NEMA BUBBLE PORUKA */}
      <button
        onClick={handleBotClick}
        className={`w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg transition-all duration-300 ${
          botState === 'bouncing' ? 'animate-bounce' : 'hover:scale-110'
        } ${chatOpen ? 'scale-90' : ''}`}
        style={{ 
          position: 'relative',
          zIndex: 60,
          pointerEvents: 'auto'
        }}
      >
        <img 
          src="/images/logo.webp" 
          alt="Receptomat Bot" 
          className="w-full h-full rounded-full object-cover"
        />
        
        {/* Notification Dot - SAMO VIZUELNI EFEKAT */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>

        {/* Thinking Animation */}
        {(botState === 'thinking' || isTyping) && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="text-white text-xs">💭</div>
          </div>
        )}

        {/* Chat Icon when open */}
        {chatOpen && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <MessageCircle size={12} className="text-white" />
          </div>
        )}
      </button>

      {/* Pulse Effect - SAMO VIZUELNI EFEKAT */}
      <div 
        className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 animate-ping opacity-20"
        style={{ pointerEvents: 'none' }}
      ></div>
    </div>
  );
}