function ZodiacDragDrop({ children, handleClick }) {
  return (
    <div className="flex flex-col items-center">
      <button
        className="m-4 p-2 w-[10em] bg-blue-500 text-white rounded-md hover:bg-blue-600 active:bg-blue-900"
        onClick={handleClick}
      >
        Add Zodiac
      </button>

      <div className="w-[80%] h-screen relative border border-gray-500 p-2">
        {children}
      </div>
    </div>
  );
}

export default ZodiacDragDrop;