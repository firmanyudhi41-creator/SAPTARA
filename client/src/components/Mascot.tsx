import { useState, useEffect } from "react";

// Mascot tips (static data)
const MASCOT_TIPS = [
  { mascot: "kaka", text: "Halo Kapten! Jangan lupa makan sayur agar energimu penuh untuk berlayar! 🥬" },
  { mascot: "kaka", text: "Wah, cuaca cerah hari ini! Yuk selesaikan semua misi! ☀️" },
  { mascot: "momo", text: "Grrrr! Momo bangga padamu, Kapten! Terus berjuang! 💪" },
  { mascot: "kaka", text: "Kaka dengar ada harta karun di Pulau Cerdas! Sudah belajar hari ini? 📖" },
  { mascot: "momo", text: "Momo sudah berolahraga pagi ini! Kapten juga dong! 🏃" },
  { mascot: "kaka", text: "Ingat ya Kapten, tidur cepat agar besok bisa berlayar lagi! 🌙" },
  { mascot: "momo", text: "Terima kasih sudah bermasyarakat dan bantu sesama! Kamu hebat, Kapten! 🤗" },
  { mascot: "kaka", text: "Ayo kita jelajahi samudra bersama! Setiap langkah berarti! 🗺️" },
];

/**
 * Mascot Component
 *
 * Floating mascot that shows random tips.
 * Kaka = 🐢 (turtle), Momo = 🐙 (octopus)
 */
export function Mascot() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(MASCOT_TIPS[0]);

  useEffect(() => {
    // Show mascot after a delay
    const timer = setTimeout(() => {
      setCurrentTip(MASCOT_TIPS[Math.floor(Math.random() * MASCOT_TIPS.length)]);
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleNewTip = () => {
    setCurrentTip(MASCOT_TIPS[Math.floor(Math.random() * MASCOT_TIPS.length)]);
  };

  if (!isVisible) {
    return (
      <button
        className="mascot-toggle"
        onClick={() => {
          handleNewTip();
          setIsVisible(true);
        }}
        type="button"
        title="Panggil Maskot"
      >
        🐢
      </button>
    );
  }

  return (
    <div className="mascot-container" id="mascot">
      <div className="mascot-bubble">
        <button className="mascot-close" onClick={handleDismiss} type="button">✕</button>
        <p className="mascot-text">{currentTip.text}</p>
        <button className="mascot-next" onClick={handleNewTip} type="button">
          Tips lain 🔄
        </button>
      </div>
      <div className="mascot-character">
        {currentTip.mascot === "kaka" ? "🐢" : "🐙"}
      </div>
    </div>
  );
}
