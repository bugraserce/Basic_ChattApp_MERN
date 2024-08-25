import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import ChatPage from "./Pages/ChatPage"; // Correct typo in ChatPage
import './App.css';
import ChatProvider from "./Context/ChatProvider";

const ChatAppRouters = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chats" element={<ChatPage />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ChatProvider>
          <ChatAppRouters />
        </ChatProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
