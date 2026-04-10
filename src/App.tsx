/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, RotateCcw, Star, Heart, Sun, Cloud, Music, ShieldCheck, Info, X } from 'lucide-react';
import { getCharacterStory } from './services/geminiService';

const LETTERS = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");
const NUMBERS = "0123456789".split("");

export default function App() {
  const [isParentVerified, setIsParentVerified] = useState(false);
  const [showParentGate, setShowParentGate] = useState(true);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLegal, setShowLegal] = useState<'privacy' | 'terms' | null>(null);

  const handleCharClick = async (char: string) => {
    if (loading) return;
    setSelectedChar(char);
    setLoading(true);
    setStory(null);
    
    const result = await getCharacterStory(char);
    setStory(result);
    setLoading(false);
    
    speak(result);
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const reset = () => {
    window.speechSynthesis.cancel();
    setSelectedChar(null);
    setStory(null);
    setLoading(false);
    setIsSpeaking(false);
  };

  if (showParentGate) {
    return <ParentalGate onVerify={() => { setShowParentGate(false); setIsParentVerified(true); }} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-4xl mx-auto relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 text-yellow-300 opacity-50 float-animation">
        <Sun size={64} />
      </div>
      <div className="absolute top-20 right-10 text-blue-200 opacity-50 float-animation" style={{ animationDelay: '1s' }}>
        <Cloud size={80} />
      </div>
      <div className="absolute bottom-10 left-20 text-pink-200 opacity-50 float-animation" style={{ animationDelay: '1.5s' }}>
        <Heart size={48} />
      </div>
      <div className="absolute bottom-20 right-20 text-purple-200 opacity-50 float-animation" style={{ animationDelay: '0.5s' }}>
        <Star size={56} />
      </div>

      <header className="text-center mb-8 z-10">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-display font-bold text-orange-500 drop-shadow-sm flex items-center justify-center gap-3"
        >
          <Sparkles className="text-yellow-400" />
          Okul Öncesi Eğitmeni
          <Sparkles className="text-yellow-400" />
        </motion.h1>
        <p className="text-lg md:text-xl text-slate-600 mt-2 font-medium">
          Haydi bir harf veya sayı seç ve maceraya başla!
        </p>
      </header>

      <main className="w-full z-10">
        <AnimatePresence mode="wait">
          {!selectedChar ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="space-y-8"
            >
              <section>
                <h2 className="text-2xl font-display font-semibold text-blue-500 mb-4 flex items-center gap-2">
                  <Music size={24} /> Harfler
                </h2>
                <div className="character-grid">
                  {LETTERS.map((char, idx) => (
                    <CharacterButton 
                      key={char} 
                      char={char} 
                      color={getColor(idx)} 
                      onClick={() => handleCharClick(char)} 
                    />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-display font-semibold text-purple-500 mb-4 flex items-center gap-2">
                  <Star size={24} /> Sayılar
                </h2>
                <div className="character-grid">
                  {NUMBERS.map((char, idx) => (
                    <CharacterButton 
                      key={char} 
                      char={char} 
                      color={getColor(idx + LETTERS.length)} 
                      onClick={() => handleCharClick(char)} 
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="story"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white rounded-3xl p-8 shadow-xl border-4 border-orange-200 flex flex-col items-center text-center relative"
            >
              <button 
                onClick={reset}
                className="absolute top-4 right-4 p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-400"
                title="Geri Dön"
              >
                <RotateCcw size={32} />
              </button>

              <div className="w-32 h-32 md:w-48 md:h-48 bg-orange-100 rounded-full flex items-center justify-center mb-6 border-4 border-orange-400 shadow-inner">
                <span className="text-6xl md:text-8xl font-display font-bold text-orange-600">
                  {selectedChar}
                </span>
              </div>

              <div className="min-h-[150px] flex flex-col items-center justify-center">
                {loading ? (
                  <div className="flex flex-col items-center gap-4">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="text-orange-400"
                    >
                      <Sparkles size={48} />
                    </motion.div>
                    <p className="text-xl font-medium text-slate-500 italic">Arkadaşın düşünüyor...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-700 mb-8">
                      {story}
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => speak(story || "")}
                        disabled={isSpeaking}
                        className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                          isSpeaking 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        <Volume2 size={28} />
                        {isSpeaking ? 'Dinliyoruz...' : 'Tekrar Dinle'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 text-slate-400 text-sm font-medium flex flex-col items-center gap-2">
        <div className="flex gap-4">
          <button onClick={() => setShowLegal('privacy')} className="hover:text-slate-600 underline decoration-dotted">Aydınlatma Metni</button>
          <button onClick={() => setShowLegal('terms')} className="hover:text-slate-600 underline decoration-dotted">Kullanım Koşulları</button>
        </div>
        <p>Sevgiyle çocuklar için hazırlandı ❤️</p>
        <div className="flex items-center gap-1 text-green-600/60 mt-2">
          <ShieldCheck size={14} />
          <span>BTK Güvenli İnternet İlkelerine Uygundur</span>
        </div>
      </footer>

      <LegalModal type={showLegal} onClose={() => setShowLegal(null)} />
    </div>
  );
}

function ParentalGate({ onVerify }: { onVerify: () => void }) {
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer) === num1 + num2) {
      onVerify();
    } else {
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-yellow-400 flex items-center justify-center p-6 z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
      >
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-2">Ebeveyn Kapısı</h2>
        <p className="text-slate-600 mb-6">Lütfen devam etmek için aşağıdaki soruyu cevaplayın. Bu alan sadece yetişkinler içindir.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-3xl font-bold text-orange-500 mb-4">
            {num1} + {num2} = ?
          </div>
          <input 
            type="number" 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Cevap"
            className="w-full p-4 border-2 border-slate-200 rounded-xl text-center text-2xl focus:border-blue-500 outline-none"
            autoFocus
          />
          {error && <p className="text-red-500 font-medium">Hatalı cevap, lütfen tekrar deneyin.</p>}
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold text-xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            Giriş Yap
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function LegalModal({ type, onClose }: { type: 'privacy' | 'terms' | null, onClose: () => void }) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60]">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Info className="text-blue-500" />
          {type === 'privacy' ? 'Aydınlatma Metni' : 'Kullanım Koşulları'}
        </h2>

        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
          {type === 'privacy' ? (
            <div className="space-y-4">
              <p><strong>Veri İşleme Bilgilendirmesi:</strong></p>
              <p>Bu uygulama, çocukların güvenliğini en üst düzeyde tutmak için tasarlanmıştır. Uygulama içerisinde hiçbir kişisel veri (isim, yaş, konum vb.) toplanmaz veya saklanmaz.</p>
              <p>Yapay zeka ile yapılan etkileşimler anonimdir ve sadece eğitici içerik üretmek amacıyla kullanılır. Sesli yanıtlar cihazınızın yerel özellikleri kullanılarak oluşturulur.</p>
              <p>Ebeveynlerin huzuru için tüm içerikler BTK Güvenli İnternet ilkelerine uygun olarak filtrelenmektedir.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p><strong>Kullanım Şartları:</strong></p>
              <p>1. Bu uygulama 3-6 yaş arası çocukların harf ve sayıları tanımasına yardımcı olmak amacıyla geliştirilmiş bir yardımcı eğitim aracıdır.</p>
              <p>2. Uygulama, profesyonel bir öğretmen veya eğitim kurumunun yerini almaz; ebeveyn gözetiminde kullanılması önerilir.</p>
              <p>3. Yapay zeka tarafından üretilen içerikler otomatik olarak filtrelenmektedir, ancak teknolojik sınırlar dahilinde ebeveyn denetimi esastır.</p>
              <p>4. Uygulamanın ticari amaçlarla izinsiz kullanımı yasaktır.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CharacterButton({ char, color, onClick }: { char: string, color: string, onClick: () => void | Promise<void>, key?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      whileTap={{ scale: 0.9 }}
      onClick={() => { onClick(); }}
      className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-display font-bold text-white shadow-md transition-shadow hover:shadow-lg ${color}`}
    >
      {char}
    </motion.button>
  );
}

const COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 
  'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400',
  'bg-teal-400', 'bg-cyan-400', 'bg-lime-400', 'bg-amber-400'
];

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}
