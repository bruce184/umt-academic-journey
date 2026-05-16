import "./styles/utilities.css";
import ZodiacContainer from "./components/ZodiacContainer";
import ZodiacSign from "./components/ZodiacSign";

function App() {
  const signs = [
    { symbol: "🐭", color: "bg-green" },
    { symbol: "🐃", color: "bg-red" },
    { symbol: "🐅", color: "bg-blue" },
    { symbol: "🐇", color: "bg-yellow" },
    { symbol: "🐉", color: "bg-purple" },
    { symbol: "🐍", color: "bg-green" },
    { symbol: "🐎", color: "bg-red" },
    { symbol: "🐐", color: "bg-blue" },
    { symbol: "🐒", color: "bg-yellow" },
    { symbol: "🐓", color: "bg-purple" },
    { symbol: "🐕", color: "bg-green" },
    { symbol: "🐖", color: "bg-red" },
  ];

  return (
    <ZodiacContainer>
      {signs.map((sign, index) => (
        <ZodiacSign
          key={index}
          symbol={sign.symbol}
          color={sign.color}
        />
      ))}
    </ZodiacContainer>
  );
}

export default App;