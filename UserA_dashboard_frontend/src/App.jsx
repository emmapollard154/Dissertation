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
  const [messageData, setMessageData] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let UNRESOLVED = [];
  const EXTENSION_ID = 'bcdjfglkdcfeeekbkhbambhhjgdllcom'; // TEMPORARY

  function processActionID(data) {
    const action_ids = data.map(row => [row.actionID, row.resolved]);
    for (let i=0; i < action_ids.length; i++) {
      if (action_ids[i][1] === 'N' && !UNRESOLVED.includes(action_ids[i][0])) {
        UNRESOLVED.push(action_ids[i][0]);
      } // collect unresolved actions
      if (action_ids[i][1] === 'Y' && UNRESOLVED.includes(action_ids[i][0])) {
        UNRESOLVED = UNRESOLVED.filter(item => item !== action_ids[i][0]);
      } // remove resolved actions
    }

    const length = UNRESOLVED.length;

    if (length > 0) {
      document.getElementById('unresolved_number_statement').innerHTML = length + ' unresolved action(s)';
    } else {
      document.getElementById('unresolved_number_statement').innerHTML = 'No unresolved actions';
    }
    sendToExt('NUM_PENDING', JSON.stringify(length));
    return UNRESOLVED;
  }

  const orderActionData = (data) => {
    return [...data].sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);
      return timeB - timeA; // ascending order
    });
  }

  const fetchBrowserData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/browsingHistory`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setBrowsingData(result.data.reverse()); // update the state with the fetched data, most recent at top
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (browsing history): ', e);
      setError(e.message);
      await new Promise(resolve => setTimeout(resolve, 100));
      location.reload();
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
      const ordered = orderActionData(result.data);
      setActionData(ordered); // update the state with the fetched data, most recent at top
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (action): ', e);
      setError(e.message);
      console.warn('App.jsx (A): reloading page;');
      await new Promise(resolve => setTimeout(resolve, 100));
      location.reload();
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
      setMessageData(result.data.reverse()); // update the state with the fetched data, most recent at the top
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (message): ', e);
      setError(e.message);
      await new Promise(resolve => setTimeout(resolve, 100));
      location.reload();
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
              if (response && response.status === 'success') {
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

  // Function to convert ISO time to simplified format
  function simplifyTime(time) {

    const date = new Date(time);

    if (isNaN(date.getTime())) {
      console.error('App.jsx (A): attempting to convert invalid date.');
    }

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear() % 100;

    const pad = (num) => String(num).padStart(2, '0');

    const simpleHours = pad(hours);
    const simpleMinutes = pad(minutes);
    const simpleDay = pad(day);
    const simpleMonth = pad(month);
    const simpleYear = pad(year);

    return `${simpleHours}:${simpleMinutes} ${simpleDay}/${simpleMonth}/${simpleYear}`;
  } 

  // Function to strip url of excess information
  function redactURL(url) {
    if (!url) {
      return ''
    }
    try {
      const fullURL =  new URL(url);
      const redacted = fullURL.origin;
      return redacted;
    } catch (error) {
      console.error("App.jsx (A): error redacting URL: ", url, error);
      return '';
    }
  }

  // Function to send message to backend A
  function sendMessage() {
    const messageInput = document.getElementById('messageInput')
    const message = messageInput.value;

    if (message) {
      const timeISO = new Date().toISOString();
      const time = simplifyTime(timeISO);
      window.postMessage({
        type: 'USER_A_MESSAGE',
        payload: { message, time },
      }, `http://localhost:${A_FRONTEND}`);
      messageInput.value = '';
    }
  };

  function switchHistoryVisibility() {
    console.log('App.jsx (A): switching visibility of browsing history');
    setHistoryVisible(!historyVisible);
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
      <div className='loading_class'>
        <p className='loading_message'>Loading dashboard data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className='error_class'>
        <p className='error_message'>Error: {error}. Please ensure the Node.js backend is running.</p>
      </div>
    );
  }

  return (

    <div className='dashboard_background'>

      <div className='title_banner'>
        <div className='header_left'>
          <div className='header_icon'>
            <img src='../icons/shield.png'></img>
          </div>

          <div className='header_title'>
            Dashboard
          </div>
        </div>

        <div className='header_right'>
            User A
        </div>
      </div>

      <div className='general_container'>

        <div className='top_panel'>
          <div className='top_left_container'>
            <div className='top_container'>
              <div className='top_scrollbar'>
                <h2 className='subtitle'>Status</h2>
                  <p id='unresolved_number_statement'></p>

                  {actionData.filter(item => item.resolved === 'N').map((item) => (
                    <div className='status_content_container'>
                      <div className='status_icon_container'>
                        <img src='../icons/mail_action_icon.png' className='status_image'></img>
                        {/* {item.context} */}
                      </div>
                      <div className='status_data_container'>
                        <div className='status_meta_container'>A choice: {item.userAChoice}</div>
                        <div className='status_text_container'>{simplifyTime(item.time)}</div>
                      </div>
                    </div>
                  ))}

              </div>
            </div>
          </div>

          <div className='top_right_container'>
            <div className='top_container'>
              <div className='top_scrollbar'>
                <div className='msg_panel'>
                  <div className='msg_subtitle'>Messages</div>
                  <div className='input_container'><input className='msg_input' type='text' id='messageInput' placeholder='Type a message...'/></div>
                  <div className='send_container'><button className='msg_send' onClick={sendMessage}>Send Message</button></div>
                </div>

                {messageData.map((item) => (
                  <div className='msg_content_container'>
                    <div className='msg_icon_container'>
                      <img src='../icons/icon_A_solid.png' className='icon_image'></img>
                    </div>
                    <div className='msg_data_container'>
                      <div className='msg_meta_container'>User {item.userID}&emsp;{item.time}</div>
                      <div className='msg_text_container'>{item.message}</div>
                    </div>
                  </div>
                ))}

                <div className='msg_content_container'>
                  <div className='msg_icon_container'></div>
                  <div className='msg_data_container'>
                    <div className='msg_meta_container'></div>
                    <div className='msg_text_container'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='bottom_panel'>
          <div className='bottom_left_container'>
            <div className='bottom_container'>
              <div className='bottom_scrollbar'>
                <h2 className='subtitle'>History</h2>

                {actionData.filter(item => item.resolved === 'Y').map((item) => (
                  <div className='history_content_container'>
                    <div className='history_icon_container'>
                      <img src='../icons/mail_action_icon.png' className='history_image'></img>
                      {/* {item.context} */}
                    </div>
                    <div className='history_data_container'>
                      <div className='history_meta_container'>A choice: {item.userAChoice}, B response: {item.responseOutcome}</div>
                      <div className='history_text_container'>{simplifyTime(item.time)}</div>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

          <div className='bottom_right_container'>
            <div className='bottom_container'>
              <div className='bottom_scrollbar'>
                <h2 className='subtitle'>Account</h2>
                <div className='account_panel'>

                  <div className='account_container'>
                    <div className='account_left'>Click on the button to the right to access more information about staying safe online.</div>
                    <div className='account_right'><button>Safety Information</button></div>
                  </div>

                  <div className='account_container'>
                    <div className='account_left'>Click on the button to the right to view your browsing history.</div>
                    <div className='account_right'><button id='openHistory' onClick={switchHistoryVisibility}>View Browsing History</button></div>
                  </div>

                  {historyVisible && (
                    <div className='browsing_history_background' id='browsingBackground'>
                      <div className='browsing_popup' id='browsingPopup'>
                        <div className='bottom_scrollbar'>
                          <div className='browsing_history_content'>
                            <div className='browsing_header_container'>

                              <div className='browsing_subtitle'>Browsing History</div>
                              <div className='okay_browsing_top' >
                              <button id='okayBrowsing' onClick={switchHistoryVisibility}>Okay</button>
                              </div>

                            </div>

                              {browsingData.map((item) => (
                                <div className='browsing_entry_container'>
                                  <div className='url_container'>{redactURL(item.url)}</div>
                                  <div className='url_time_container'>{simplifyTime(item.time)}</div>
                                </div>
                              ))}

                              {/* <button className='okay_browsing' id='okayBrowsing' onClick={switchHistoryVisibility}>Okay</button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
          
                  <div className='account_container'>
                    <div className='account_left'>Click on the button to the right to view your account settings. You can also request to modify the settings.</div>
                    <div className='account_right'><button>Settings</button></div>
                  </div> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className='footer'>
        <p>Emma Pollard. University of Bath. 2025.</p>
      </footer>

    </div>
  );
}

export default App;
