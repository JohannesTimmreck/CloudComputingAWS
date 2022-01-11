import logo from './logo.svg';
import './App.css';
import LexChat from './input/LexInput';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Lex ChatBot</p>
        <LexChat
          IdentityPoolId="us-east-1:e9e9dfde-c983-4b5d-86df-23d7ef0f623e"
        />
      </header>
    </div>
  );
}

export default App;
