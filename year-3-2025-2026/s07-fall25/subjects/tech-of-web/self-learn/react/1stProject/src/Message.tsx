function Message(){
    const name = "";
//  const name = ""; // display Hello World
    if (name)
    // JSX: JavaScript XML
        return <h1>Hello {name}</h1>
    return <h1>Hello World</h1>
}

// so that it can be imported in other files
export default Message;
