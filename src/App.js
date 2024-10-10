import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="text-center">
      <header className="bg-gray-800 min-h-screen flex flex-col items-center justify-center text-white text-2xl">
        <img src={logo} className="h-40 pointer-events-none animate-spin-slow" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
