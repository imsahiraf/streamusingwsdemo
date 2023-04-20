import React, { useState, useEffect } from "react";
import axios from "axios";

function WebSocketClient() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/login",
          { username: "anurag", password: "pass@123" },
          { headers: { "Content-Type": "application/json" } }
        );
        const token = response.data;
        WsConnect(token);
      } catch (error) {
        console.error(error);
        if (error.response.status === 401) {
          setMessages([
            { text: "You are trying to login with wrong credentials." },
          ]);
        } else if (error.response.status === 402) {
          setMessages([
            { text: "You are already logged in with these credentials." },
          ]);
        }
      }
    };
    fetchData();
  }, []);

  function WsConnect(token) {
    const ws = new WebSocket(`ws://localhost:8081?token=${token}`, [token]);

    ws.onopen = function () {
      console.log("Connected to server");
      ws.send(JSON.stringify({ token: token }));
    };

    ws.onmessage = function (event) {
      const data = JSON.parse(event.data);
      console.log(data);
      setMessages([{ text: `Here the random generated number for a second is ${data}` }]);
    };

    ws.onclose = function () {
      console.log("Disconnected from server");
    };
  }

  return (
    <div>
      {messages.map((message, index) => (
        <p key={index}>{message.text}</p>
      ))}
    </div>
  );
}

function App() {
  return (
    <div>
      <h1>WebSocket Client Example</h1>
      <WebSocketClient />
    </div>
  );
}

export default App;
