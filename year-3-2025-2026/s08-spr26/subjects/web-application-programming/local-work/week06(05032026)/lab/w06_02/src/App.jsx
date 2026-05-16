import { useState } from "react";
import "./styles/utilities.css";
import ZodiacSignDD from "./components/ZodiacSignDD";
import ZodiacDragDrop from "./components/ZodiacDragDrop";

function App() {
  const symbols = [
    "🐭",
    "🐃",
    "🐅",
    "🐇",
    "🐉",
    "🐍",
    "🐎",
    "🐐",
    "🐒",
    "🐓",
    "🐕",
    "🐖",
  ];

  const colors = ["bg-green", "bg-red", "bg-blue", "bg-yellow", "bg-purple"];

  const [signs, setSigns] = useState([]);

  function handleClick() {
    const randomIndex = Math.floor(Math.random() * symbols.length);

    const newSign = {
      symbol: symbols[randomIndex],
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setSigns((prevSigns) => [...prevSigns, newSign]);
  }

  function handleSignClick(i) {
    setSigns((prevSigns) => {
      const newSigns = [...prevSigns];
      const symbolIndex = symbols.indexOf(newSigns[i].symbol);
      const nextSymbolIndex = (symbolIndex + 1) % symbols.length;
      newSigns[i].symbol = symbols[nextSymbolIndex];
      return newSigns;
    });
  }

  function handleMouseDown(e) {
    const el = e.target;
    const startX = e.clientX;
    const startY = e.clientY;

    el.startX = parseInt(el.style.left || 0);
    el.startY = parseInt(el.style.top || 0);

    const oldZIndex = el.style.zIndex;
    el.style.zIndex = 1000;

    function handleMouseMove(e) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      el.style.left = `${el.startX + dx}px`;
      el.style.top = `${el.startY + dy}px`;
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      el.style.zIndex = oldZIndex;
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <ZodiacDragDrop handleClick={handleClick}>
      {signs.map((sign, index) => (
        <ZodiacSignDD
          key={index}
          index={index}
          symbol={sign.symbol}
          color={sign.color}
          handleClick={handleSignClick}
          handleMouseDown={handleMouseDown}
        />
      ))}
    </ZodiacDragDrop>
  );
}

export default App;