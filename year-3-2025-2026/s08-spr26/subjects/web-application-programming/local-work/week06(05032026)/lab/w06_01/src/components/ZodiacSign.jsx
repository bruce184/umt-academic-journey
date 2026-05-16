function ZodiacSign({ symbol = "🐭", color = "bg-green" }) {
  return <div className={`box ${color}`}>{symbol}</div>;
}

export default ZodiacSign;