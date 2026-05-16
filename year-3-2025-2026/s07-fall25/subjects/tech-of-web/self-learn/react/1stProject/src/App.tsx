import Buttons from "./components/Buttons";

function App(){
  return (
    <div>
      <Buttons color = 'secondary' onClick={() => console.log('Clicked')}>My Button</Buttons>
    </div>
  );
}

export default App;