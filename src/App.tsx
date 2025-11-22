import Homescreen from "./components/Homescreen"

function App() {

  return (
    <div className="bg-black h-screen flex flex-col">
      <main className="flex-1 overflow-hidden">
        <Homescreen />
      </main>
    </div>
  )
}

export default App
