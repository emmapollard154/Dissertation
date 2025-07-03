import { useEffect, useState } from 'react';
import './App.css'
import io from 'socket.io-client';

const A_BACKEND = 5000;
const A_FRONTEND = 5173;
const socket = io(`http://localhost:${A_BACKEND}`);

// Main App component for dashboard
function App() {
  const [browsingData, setBrowsingData] = useState([]);
  const [actionData, setActionData] = useState([]);
  const [unresolvedData, setUnresolvedData] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let UNRESOLVED = [];
  const EXTENSION_ID = "bcdjfglkdcfeeekbkhbambhhjgdllcom"; // TEMPORARY

  function processActionID(data) {
    const action_ids = data.map(row => [row.actionID, row.resolved]);
    for (let i=0; i < action_ids.length; i++) {
      if (action_ids[i][1] === "N" && !UNRESOLVED.includes(action_ids[i][0])) {
        UNRESOLVED.push(action_ids[i][0]);
      } // collect unresolved actions
      if (action_ids[i][1] === 'Y' && UNRESOLVED.includes(action_ids[i][0])) {
        UNRESOLVED = UNRESOLVED.filter(item => item !== action_ids[i][0]);
      } // remove resolved actions
    }

    const length = UNRESOLVED.length;

    if (length > 0) {
      document.getElementById('unresolved_number_statement').innerHTML = length + " unresolved action(s)";
    } else {
      document.getElementById('unresolved_number_statement').innerHTML = 'No unresolved actions';
    }

    sendToExt('NUM_PENDING', JSON.stringify(length));
    return UNRESOLVED;
  }


  const fetchBrowserData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/browsingHistory`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setBrowsingData(result.data); // update the state with the fetched data
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (browsing history): ', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActionData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/action`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setActionData(result.data); // update the state with the fetched data
      processActionID(result.data);
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (action): ', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchMessageData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/message`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setMessageData(result.data); // update the state with the fetched data
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (message): ', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to send messages to chrome extension
  function sendToExt(msgType, msgContent) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: msgType, 
            payload: msgContent },
          function(response) {
            if (chrome.runtime.lastError) {
              console.error('App.jsx (A): error sending message: ', chrome.runtime.lastError.message);
            } else {
              console.log('App.jsx (A): response from extension: ', response);
              if (response && response.status === "success") {
                console.log('App.jsx (A): message sent successfully to extension: ' + response.message);
              } else {
                console.error('App.jsx (A): failed to send message to extension.');
              }
            }
          }
        );
      } catch (error) {
        console.error('App.jsx (A): could not send message to extension: ', error);
      }
    } else {
      console.warn('App.jsx (A): Chrome extension API (chrome.runtime) not available.');
    }
  }

  // Function to send message to backend A
  function sendMessage() {

    const messageInput = document.getElementById('messageInput')
    const message = messageInput.value;

    if (message) {
      const time = new Date().toISOString();
      window.postMessage({
        type: 'USER_A_MESSAGE',
        payload: { message, time },
      }, `http://localhost:${A_FRONTEND}`);
      messageInput.value = '';
    }
  };

  // Hook to fetch data when the component mounts
  useEffect(() => {
    fetchBrowserData(); //  fetch data
    fetchActionData();
    fetchMessageData();

    // Listen for events and messages
    socket.on('connect', () => {
        console.log(`App.jsx (A): connected to websockets server on port ${A_BACKEND}`);
    });

    socket.on('connect_error', (error) => {
      console.error('App.jsx (A): error connecting to websockets server: ', error);
    });

    socket.on('welcome', (msg) => {
      console.log('App.jsx (A) received welcome message from server: ', msg);
    });

    socket.on('message', (msg) => {
      console.log('App.jsx (A) received message from server: ', msg);
    });

    socket.on('a_browser', (data) => {
      console.log('App.jsx (A): User A updated browsing history: ', data);
      fetchBrowserData();
    });

    socket.on('a_choice', (data) => {
      console.log('App.jsx (A): User A made choice: ', data);
      fetchActionData();
    });

    socket.on('a_message', (data) => {
      console.log('App.jsx (A): User A sent message: ', data);
      fetchMessageData();
    });

    socket.on('b_response', (data) => {
      console.log('App.jsx (A): User B sent a response: ', data);
      fetchActionData();
    });

    socket.on('b_message', (data) => {
      console.log('App.jsx (A): User B sent a message: ', data);
      fetchMessageData();
      sendToExt('USER_B_MESSAGE', null);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('message');
      socket.off('a_browser');
      socket.off('a_choice');
      socket.off('a_message');
      socket.off('b_message');
      socket.off('b_response');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('welcome');
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

        <div className='top_top_container'>
          <div className='top_container'>
            <div class="top_scrollbar">
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
                  <p className="p-6 text-center text-gray-500"></p>
                )}
            </div>
          </div>
        </div>

        <div className='top_bottom_container'>
          <div className='top_container'>
            <div class="top_scrollbar">
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
            <p>&copy; {new Date().getFullYear()} Emma Pollard. University of Bath. 2025.</p>
          </footer>
    </div>
  );
}

export default App;
