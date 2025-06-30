import React, { useEffect, useState } from 'react';
import { act } from 'react';
import './App.css'
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Main App component for dashboard
function App() {
  const [browsingData, setBrowsingData] = useState([]);
  const [actionData, setActionData] = useState([]);
  const [unresolvedData, setUnresolvedData] = useState([]);
  // const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let UNRESOLVED = [];
  const noUnresolved = "No unresolved actions";
  const EXTENSION_ID = "bcdjfglkdcfeeekbkhbambhhjgdllcom";

  function processActionID(data) {
    const action_ids = data.map(row => [row.actionID, row.resolved]);
    for (let i=0; i < action_ids.length; i++) {
      if (action_ids[i][1] === "N" && !UNRESOLVED.includes(action_ids[i][0])) {
        UNRESOLVED.push(action_ids[i][0]);
      } // collect unresolved actions
    }
    setUnresolvedData(UNRESOLVED);
    const length = UNRESOLVED.length;
    if (length > 0) {
      document.getElementById('unresolved_number_statement').innerHTML = length + " unresolved action(s)";
    } else {
      document.getElementById('unresolved_number_statement').innerHTML = noUnresolved;
    }
    sendToExt("NUM_PENDING", JSON.stringify(length));
  }


  const fetchBrowserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard-data/browsingHistory');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setBrowsingData(result.data); // update the state with the fetched data
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard-data/action');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setActionData(result.data); // update the state with the fetched data
      processActionID(result.data);
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // function to send number of unresolved actions to chrome extension
  function sendToExt(msgType, msgContent) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: msgType, 
            payload: msgContent },
          function(response) {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError.message);
            } else {
              console.log("Response from extension:", response);
              if (response && response.status === "success") {
                console.log("Message sent successfully to extension: " + response.message);
              } else {
                console.error("Failed to send message to extension or extension reported an error.");
              }
            }
          }
        );
      } catch (error) {
        console.error("Could not send message to extension (likely not installed or wrong ID):", error);
      }
    } else {
      console.warn("Chrome extension API (chrome.runtime) not available.");
    }
  }

  // send message to backend using socket.io
  function sendMessage() {
    const messageInput = document.getElementById('messageInput')
    const message = messageInput.value;
    if (message) {
        socket.emit('clientMessage', message);
        console.log("sendMessage: sent ", message);
        messageInput.value = '';
    }
  };

  // hook to fetch data when the component mounts
  useEffect(() => {
    fetchBrowserData(); //  fetch data
    fetchActionData();

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server on port 5000!');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      // setMessages(prevMessages => [...prevMessages, `Error: ${error.message}`]);
    });

    // listen for welcome message from server
    socket.on('welcome', (msg) => {
        console.log('Frontend: received welcome message from server:', msg);
    });

    // listen for messages from server
    socket.on('message', (msg) => {
        console.log('Frontend: received message from server:', msg);
    });

    socket.on('update', (data) => {
        console.log('Received update from server:', data);
        // setMessages(prevMessages => [...prevMessages, `Update: ${data}`]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('message');
      // socket.off('update');
      socket.off('connect');
      socket.off('connect_error');
    };
  }, []);


  // Render loading state
  if (loading) {
    return (
      <div className="loading_class">
        <p className="loading_message">Loading dashboard data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="error_class">
        <p className="error_message">Error: {error}. Please ensure the Node.js backend is running.</p>
      </div>
    );
  }

  return (

    <div className='dashboard_background'>

      <div className='title_banner'>
        <header className="dashboard_title">
          <h1>User A Dashboard</h1>
        </header>
      </div>

      <div className='top_panel'>

        <div className='top_left_container'>

          <div className='top_container'>
            <h2 className="subtitle">Status</h2>
              <p id="unresolved_number_statement"></p>

              {unresolvedData.length > 0 ? (
                <table className="table_format">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="column_title">Action</th>
                      <th scope="col" className="column_title">Response</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unresolvedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="entry_format">{item}</td>
                        <td className="entry_format">Pending</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-center text-gray-500">Browsing history is empty.</p>
              )}
          </div>

        </div>

        <div className='top_right_container'>
          <div className='top_container'>
            <h2 className="subtitle">Messages</h2>

              <input type="text" id="messageInput" placeholder="Type a message..."/>
              <button onClick={sendMessage}>Send</button>


          </div>
        </div>
      </div>

      <div className='bottom_panel'>

        <div className='bottom_left_container'>

          <div className='bottom_container'>
            <h2 className="subtitle">History</h2>

              {actionData.length > 0 ? (
                <table className="table_format">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="column_title">Action ID</th>
                      <th scope="col" className="column_title">Context</th>
                      <th scope="col" className="column_title">User A Choice</th>
                      <th scope="col" className="column_title">Time</th>
                      <th scope="col" className="column_title">Resolved</th>
                      <th scope="col" className="column_title">Response Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {actionData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="entry_format">{item.actionID}</td>
                        <td className="entry_format">{item.context}</td>
                        <td className="entry_format">{item.userAChoice}</td>
                        <td className="entry_format">{item.time}</td>
                        <td className="entry_format">{item.resolved}</td>
                        <td className="entry_format">{item.responseOutcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-center text-gray-500">Action history is empty.</p>
              )}


          </div>

        </div>

        <div className='bottom_middle_container'>

          <div className='bottom_container'>
            <h2 className="subtitle">Account Settings</h2>
            <p>View browsing history</p>

            {browsingData.length > 0 ? (
              <table className="table_format">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="column_title">URL</th>
                    <th scope="col" className="column_title">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {browsingData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="entry_format"><a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{item.url}</a></td>
                      <td className="entry_format">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-center text-gray-500">Browsing history is empty.</p>
            )}


          </div>

        </div>

        <div className='bottom_right_container'>

          <div className='bottom_container'>
            <h2 className="subtitle">Educational Resources</h2>
          </div>

        </div>

      </div>

          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Emma Pollard. All rights reserved.</p>
          </footer>
    </div>
  );
}

export default App;
