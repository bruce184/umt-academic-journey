function ZodiacSignDD({
  index,
  symbol = "🐭",
  color = "bg-green",
  handleClick = undefined,
  handleMouseDown = undefined,
}) {
  const i = index;

  return (
    <div
      className={`box ${color} select-none cursor-move absolute top-0 left-0`}
      onClick={() => handleClick(i)}
      onMouseDown={handleMouseDown}
    >
      {symbol}
    </div>
  );
}

export default ZodiacSignDD;