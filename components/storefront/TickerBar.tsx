export default function TickerBar() {
  const items = [
    "Complimentary Shipping on Orders Over $500",
    "New Collection Now Available",
    "Complimentary Shipping on Orders Over $500",
    "New Collection Now Available",
    "Complimentary Shipping on Orders Over $500",
    "New Collection Now Available",
  ];

  return (
    <div className="relative bg-[#111111] border-y border-white/5 overflow-hidden py-3">
      <div
        className="flex whitespace-nowrap"
        style={{ animation: "ticker 30s linear infinite" }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="text-xs tracking-[0.25em] uppercase text-[#F5F0EB]/50 mx-8 flex-shrink-0"
          >
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
