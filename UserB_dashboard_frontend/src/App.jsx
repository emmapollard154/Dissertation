import React, { useEffect, useState } from 'react';
import { act } from 'react';
import './App.css'
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

// Main App component for dashboard
function App() {
  const [browsingData, setBrowsingData] = useState([]);
  const [actionData, setActionData] = useState([]);
  const [unresolvedData, setUnresolvedData] = useState([]); 
  const [messageData, setMessageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let UNRESOLVED = [];
  const noUnresolved = "No unresolved actions";

  const processActionID = (data) => {
    const action_ids = data.map(row => [row.actionID, row.resolved]);
    for (let i=0; i < action_ids.length; i++) {
      if (action_ids[i][1] === "N" && !UNRESOLVED.includes(action_ids[i][0])) {
        UNRESOLVED.push(action_ids[i][0]);
      } // collect unresolved actions
    }
    setUnresolvedData(UNRESOLVED);
    if (UNRESOLVED.length > 0) {
      document.getElementById('unresolved_number_statement').innerHTML = UNRESOLVED.length + " unresolved action(s)";
    } else {
      document.getElementById('unresolved_number_statement').innerHTML = noUnresolved;
    }
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
      setError(e.message); // Set error state
    } finally {
      setLoading(false);
    }
  };



  const fetchMessageData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dashboard-data/message');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setMessageData(result.data);
    } catch (e) {
      console.error("Error fetching message history:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };


  // Function to allow user B to accept/reject a request
  function responseBtn(btn, actionID) {

    const yesBtn = document.getElementById('btn_yes');
    const noBtn = document.getElementById('btn_no');

    if (btn.id === 'btn_yes') {
      console.log("Yes button clicked: ", actionID.item);
      window.postMessage({
        type: 'USER_B_RESPONSE',
        id: actionID.item,
        outcome: "Y"
      }, 'http://localhost:6173');

    } else if (btn.id === 'btn_no') {
      console.log("No button clicked: ", actionID.item);
      window.postMessage({
        type: 'USER_B_RESPONSE',
        id: actionID.item,
        outcome: "N"
      }, 'http://localhost:6173');

    } else {
      console.warn("Error: invalid button id found");
    }
    yesBtn.disabled = true;
    noBtn.disabled = true;
  }

  // send message to backend using socket.io
  function sendMessage() {
    const messageInput = document.getElementById('messageInput')
    const message = messageInput.value;
    if (message) {

        // socket.emit('clientMessage', message);
      const time = new Date().toISOString();

      window.postMessage({
        type: 'USER_B_MESSAGE',
        payload: { message, time },
      }, 'http://localhost:6173');

        console.log("sendMessage: sent ", message);
        messageInput.value = '';
    }
  };

  // hook to fetch data when the component mounts
  useEffect(() => {
    fetchBrowserData();
    fetchActionData();
    fetchMessageData();

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server on port 8080!');
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

    socket.on('a_message', (data) => {
        console.log('App (B): User A has sent a message:', data);
        fetchMessageData();
    });

    socket.on('a_browser', (data) => {
        console.log('App (B): User A has updated browsing history:', data);
        fetchBrowserData();
    });

    socket.on('a_choice', () => {
        console.log('App (B): User A has made a choice:');
        fetchActionData();
    });

    socket.on('b_response', (data) => {
        console.log('App (B): User B has sent a response:', data);
        fetchActionData();
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('message');
      socket.off('a_message');
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
          <h1>User B Dashboard</h1>
        </header>
      </div>

      <div className='top_panel'>

        <div className='top_left_container'>

          <div className='top_container'>
            <h2 className="subtitle">Status</h2>
              <p id="unresolved_number_statement"></p>

              {unresolvedData.length > 0 ? (
                <table id="responseTable" className="table_format">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="column_title">Action</th>
                      <th scope="col" className="column_title">Response No</th>
                      <th scope="col" className="column_title">Response Yes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unresolvedData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="entry_format">{item}</td>
                        <td className="entry_format"><button id="btn_no" onClick={(event) => responseBtn(event.target, {item})}>REJECT</button></td>
                        <td className="entry_format"><button id="btn_yes" onClick={(event) => responseBtn(event.target, {item})}>ACCEPT</button></td>
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

              <table className="table_format">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="column_title">User</th>
                    <th scope="col" className="column_title">Message</th>
                    <th scope="col" className="column_title">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messageData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="entry_format">{item.userID}</td>
                      <td className="entry_format">{item.message}</td>
                      <td className="entry_format">{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>


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
