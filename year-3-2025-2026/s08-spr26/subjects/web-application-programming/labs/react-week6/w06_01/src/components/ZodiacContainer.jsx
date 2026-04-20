function ZodiacContainer({ children }) {
  return (
    <div className="flex justify-center">
      <div className="w-[80%] border border-gray-500 p-2 flex flex-wrap">
        {children}
      </div>
    </div>
  );
}

export default ZodiacContainer;