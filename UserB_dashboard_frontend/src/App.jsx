import { useEffect, useState } from 'react';
import './App.css'
import io from 'socket.io-client';

const A_BACKEND = 5000;
const B_BACKEND = 8080;
const B_FRONTEND = 6173;
const socket = io(`http://localhost:${B_BACKEND}`);

const OPTIONS_MAP = new Map([
  [1 , 'Continue (no interference).'],
  [2 , 'Record action for User B too see later. Continue with action.'],
  [3 , 'Ask User B for advice (accept / reject) regarding this action. Do not continue with action at the moment.'],
  [4 , 'Ask User B for advice (accept / reject) regarding this action. Block action if User B rejects request.'],
  [5 , 'Block this action. Prevent action being carried out in the future. User B will not be informed.'],
]);

const CHOICE_MAP = new Map([
  ['0', 'You checked the browsing history of User A.'],
  ['2', 'User A clicked on a link in an email.'],
  ['3', 'User A requested confirmation to click on an email link (one time request).'],
  ['4', 'User A requested confirmation to click on an email link (link will be blocked if rejected).'],
  ['Y', 'Setting configuration updated.'],

]);

// Main App component for dashboard
function App() {
  const [browsingData, setBrowsingData] = useState([]);
  const [actionData, setActionData] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [settingsData, setSettingsData] = useState([]);
  const [trustedData, setTrustedData] = useState([]);
  const [helpVisible, setHelpVisible] = useState(false);
  const [trustedVisible, setTrustedVisible] = useState(false);
  const [educationVisible, setEducationVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderActionData = (data) => {
    return [...data].sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);
      return timeB - timeA; // ascending order
    });
  }

  function formatRequest(request) {

    let text = '';
    const context = request.context;

    if (context) {
      const env = context[0];
      const user = context[1];
      if (user === 'B' && env === 'E') {
        text = 'You requested to update email settings';
      }
      if (user === 'A' && env === 'E') {
        text = 'User A requested to update email settings';
      }
      if (user === 'A' && env === 'T') {
        text = 'User A requested to update trusted contacts';
      }
      if (user === 'B' && env === 'T') {
        text = 'You requested to update trusted contacts';
      }
      return text;
    }
    else {
      console.error('App.jsx (A): no context found in request.')
    }
  }

  function updateRequest(context) {
    const user = 'B';
    const status = 'Y';
    if (context) {
      window.postMessage({
        type: 'UPDATE_REQUEST',
        payload: { context , user , status},
      }, `http://localhost:${B_FRONTEND}`);
    }
  }

  function formatContext(context) {
    let ctxt = '';
    if (context) {
      ctxt = context;
    }
    return ctxt;
  }

  function displayChoice(choice, url) {
    let msg = '';
    let data = '';
    if (choice) {
      msg = CHOICE_MAP.get(choice);
    }
    if (url) {
      data = url;
    }
    return msg + '\n'+ data;
  }

  function displayOutcome(response) {
    if (response === 'Y') {
      return 'Approved';
    }
    if (response === 'N') {
      return 'Rejected';
    }
    return '';
  }

  function cancelUpdateRequest(context) {
    console.log(context);
    const user = 'B';
    const status = 'N';
    if (context) {
      window.postMessage({
        type: 'UPDATE_REQUEST',
        payload: { context , user , status},
      }, `http://localhost:${B_FRONTEND}`);
    }
  }

  function checkContext(context) {
    if (context === 'Email') {
      return '../icons/mail_action_icon.png'
    }
    if (context === 'Settings') {
      return '../icons/settings_action_icon.png'
    }
    if (context === 'View') {
      return '../icons/browsing_action_icon.png'
    }
  }

  function getMessageIcon(user) {
    if (user === 'A') {
      return '../icons/icon_a_solid.png'
    }
    if (user === 'B') {
      return '../icons/icon_b_white.png'
    }
  }

  const fetchSettingsData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/settings`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setSettingsData(result.data); // update the state with the fetched data
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (message): ', e);
      setError(e.message);
      await new Promise(resolve => setTimeout(resolve, 100));
      location.reload();
    } finally {
      setLoading(false);
    }
  };

  const fetchTrustedData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/trusted`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setTrustedData(result.data); // update the state with the fetched data
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (trusted): ', e);
      setError(e.message);
      await new Promise(resolve => setTimeout(resolve, 100));
      location.reload();
    } finally {
      setLoading(false);
    }
  };

  const fetchBrowserData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/browsingHistory`);
      if (!response.ok) {
        throw new Error(`App.jsx (B): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setBrowsingData(result.data.reverse()); // update the state with the fetched data, most recent at top
    } catch (e) {
      console.error('App.jsx (B): error fetching dashboard data (browsing history): ', e);
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
        throw new Error(`App.jsx (B): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      const ordered = orderActionData(result.data);
      setActionData(ordered); // update the state with the fetched data, most recent at top
    } catch (e) {
      console.error('App.jsx (B): error fetching dashboard data (action): ', e);
      setError(e.message);
      await new Promise(resolve => setTimeout(resolve, 100));
      location.reload();
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/requests`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setRequestData(result.data.reverse()); // update the state with the fetched data, most recent at the top
    } catch (e) {
      console.error('App.jsx (A): error fetching dashboard data (requests): ', e);
      setError(e.message);
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
        throw new Error(`App.jsx (B): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      setMessageData(result.data.reverse()); // update the state with the fetched data, most recent at top
    } catch (e) {
      console.error('App.jsx (B): error fetching dashboard data (message): ', e);
      setError(e.message);
      await new Promise(resolve => setTimeout(resolve, 100));
      location.reload();
    } finally {
      setLoading(false);
    }
  };

  // Function to allow user B to accept/reject a request
  function responseBtn(btn, actionID) {

    if (btn.id === 'btnYes') {
      console.log('App.jsx (B): "Yes" button clicked: ', actionID.item);
      
      let now = new Date().toISOString();
      actionID.item.time = now; // update time to user b response

      window.postMessage({
        type: 'USER_B_RESPONSE',
        data: actionID.item,
        outcome: 'Y'
      }, `http://localhost:${B_FRONTEND}`);

    } else if (btn.id === 'btnNo') {
      console.log('App.jsx (B): "No" button clicked: ', actionID.item);

      let now = new Date().toISOString();
      actionID.item.time = now; // update time to user b response

      window.postMessage({
        type: 'USER_B_RESPONSE',
        data: actionID.item,
        outcome: 'N'
      }, `http://localhost:${B_FRONTEND}`);

    } else {
      console.warn('App.jsx (B): invalid button found: ', btn.id);
    }
  }

  // Function to convert ISO time to simplified format
  function simplifyTime(time) {

    const date = new Date(time);

    if (isNaN(date.getTime())) {
      console.error('App.jsx (B): attempting to convert invalid date.');
      return '';
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
      console.error("App.jsx (B): error redacting URL: ", url, error);
      return '';
    }
  }

  // Format context of settings
  function displayContext(context) {
    if (context === 'E') {
      return 'Email';
    }
  }

  function displayResponse(response) {
    if (response === 'Y') {
      return '✔';
    }
    if (response === 'N') {
      return '✖';
    }
    return '?';
  }

  // Function to send message to backend B
  function sendMessage() {
    const messageInput = document.getElementById('messageInput')
    const message = messageInput.value;

    if (message) {
      const timeISO = new Date().toISOString();
      const time = simplifyTime(timeISO);
      window.postMessage({
        type: 'USER_B_MESSAGE',
        payload: { message, time },
      }, `http://localhost:${B_FRONTEND}`);
      messageInput.value = '';
    }
  };

// Function to get unique ID for viewing actions
function viewID() {
  const now = new Date().toISOString(); // timestamp (unique)
  var id = now.replace(/\D/g, ""); // keep only numeric values from timestamp
  return `v${id}`; // v signifies viewing action
}

  // Function to add browsing history to action table
  function logBrowsingView() {

    const actionID = viewID();
    const context = 'View';
    const time = new Date().toISOString();
    // const time = simplifyTime(timeISO);

    window.postMessage({
      type: 'USER_B_VIEW',
      payload: { actionID, context, time }
    }, `http://localhost:${B_FRONTEND}`);
  }

  function switchSettingsVisibility() {
    console.log('App.jsx (B): switching visibility of settings information.');
    setSettingsVisible(!settingsVisible);
  };

  function switchHelpVisibility() {
    console.log('App.jsx (B): switching visibility of help information.');
    setHelpVisible(!helpVisible);
  };

  function switchEducationVisibility() {
    console.log('App.jsx (B): switching visibility of educational information.');
    setEducationVisible(!educationVisible);
  };

  function switchHistoryVisibility() {
    console.log('App.jsx (B): switching visibility of browsing history.');
    if (!historyVisible) { // User B opens browsing history, add to action history
      logBrowsingView();
    }
    setHistoryVisible(!historyVisible);
  };

  function switchSettingsVisibility() {
    console.log('App.jsx (B): switching visibility of settings.');
    setSettingsVisible(!settingsVisible);
  };

  // Hook to fetch data when the component mounts
  useEffect(() => {

    // Fetch database data
    fetchSettingsData();
    fetchRequestData();
    fetchBrowserData();
    fetchActionData();
    fetchMessageData();
    fetchTrustedData();

    // Listen for events and messages
    socket.on('connect', () => {
      console.log(`App.jsx (B): connected to websockets server on port ${B_BACKEND}.`);
    });

    socket.on('connect_error', (error) => {
      console.error('App.jsx (B): error connecting to websockets server: ', error);
    });

    socket.on('welcome', (msg) => {
      console.log('App.jsx (B) received welcome message from server: ', msg);
    });

    socket.on('message', (msg) => {
      console.log('App.jsx (B) received message from server: ', msg);
    });

    socket.on('a_browser', (data) => {
      console.log('App.jsx (B): User A updated browsing history: ', data);
      fetchBrowserData();
    });

    socket.on('a_choice', (data) => {
      console.log('App.jsx (B): User A made choice: ', data);
      fetchActionData();
    });

    socket.on('a_message', (data) => {
      console.log('App.jsx (B): User A sent message: ', data);
      fetchMessageData();
    });

    socket.on('a_update_request', (data) => {
      console.log('App.jsx (B): settings update request received: ', data);
      fetchRequestData();
      fetchSettingsData();
      fetchActionData();
    });

    socket.on('email_settings', (data) => {
      console.log('App.jsx (B): email settings have been updated: ', data);
      fetchSettingsData();
    });

    socket.on('add_trusted', (data) => {
      console.log('App.jsx (B): new trusted contact has been added: ', data);
      fetchTrustedData();
    });

    socket.on('remove_trusted', (data) => {
      console.log('App.jsx (B): trusted contact has been removed: ', data);
      fetchTrustedData();
    });

    socket.on('b_response', (data) => {
      console.log('App.jsx (B): User B sent a response: ', data);
      fetchActionData();
    });

    socket.on('b_message', (data) => {
      console.log('App.jsx (B): User B sent a message: ', data);
      fetchMessageData();
    });

    socket.on('b_update_request', (data) => {
      console.log('App.jsx (B): settings update request received: ', data);
      fetchRequestData();
      fetchSettingsData();
      fetchActionData();
    });

    socket.on('b_view', () => {
      console.log('App.jsx (B): browsing history view detected.');
      fetchActionData();
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('message');
      socket.off('a_browser');
      socket.off('a_choice');
      socket.off('a_message');
      socket.off('email_settings');
      socket.off('add_trusted');
      socket.off('remove_trusted');
      socket.off('b_response');
      socket.off('b_message');
      socket.off('b_view');
      socket.off('a_update_request');
      socket.off('b_update_request');
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
        <div className='header_left'>
          <div className='header_icon'>
            <img src='../icons/shield.png'></img>
          </div>

          <div className='header_title'>
            Dashboard
          </div>
        </div>

        <div className='header_middle'>
          User B
        </div>

        <div className='header_right'>
          <button className='help_button' onClick={switchHelpVisibility}>?</button>
        </div>

        {helpVisible && (
          <div className='help_background' id='helpBackground'>
            <div className='help_popup' id='helpPopup'>
              <div className='bottom_scrollbar'>
                <div className='help_content'>

                  <div className='help_header_container'>
                    <div className='popup_subtitle'>Help Centre</div>
                    <div className='okay_help_top' >
                      <button className='popup_button' onClick={switchHelpVisibility}>Okay</button>
                    </div>
                  </div>

                  <div className='dashboard_navigation'>
                    <div className='dashboard_navigation_text'>
                      <p><b>Dashboard Navigation</b></p>
                      <p><b>Status</b>&emsp;Any current requests and actions will be shown here</p>
                      <p><b>Messages</b>&emsp;Send messages to each other and view your message history</p>
                      <p><b>History</b>&emsp;Both users can view the history of requests and actions once resolved</p>
                      <p><b>Account</b>&emsp;Access additional safety information, view the browsing history of User A (they will be notified), and view / request to update your account settings.</p>
                      <p><b>?</b>&emsp;Help Centre (here)</p>
                    </div>
                    <img src='../icons/dash_map.png' className='dashboard_navigation_img'></img>
                  </div>

                  <div className='extension_navigation'>
                    <div className='extension_navigation_text'>
                      <p><b>Extension Navigation</b></p>
                      <p>The system requires User A to install and use a Chrome extension that includes a side panel. The extension monitors online activity and prompts intervention when it detects that an email link from a non-trusted contact has been clicked on. </p>
                      <p>When flagged, the click will be suspended and User A will be presented with information on the risk and a menu of options of how to respond which may include requesting your advice.</p>
                      <p>The speech bubble will display concise information and reminders relevant to the user's current situation.</p>
                      <p>The buttons in the panel will change appearance to notify the user of any updates. The dashboard can be accessed by clicking on any button in the panel.</p>
                    </div>
                    <img src='../icons/side_panel.png' className='extension_navigation_img'></img>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className='general_container'>

        <div className='top_panel'>
          <div className='top_left_container'>
            <div className='top_container'>
              <div className='top_scrollbar'>
                <h2 className="subtitle">Actions</h2>
                <p id="unresolved_number_statement"></p>

                {requestData.filter(item => item.status === 'Y').map((item) => (
                  <div className='request_content_container'>
                    
                    <div className='request_icon_container'>
                      <img src='../icons/request_icon.png' className='request_image'></img>
                    </div>

                    <div className='request_data_container'>
                      <div className='request_info_container'>
                        {formatRequest(item)}
                      </div>

                      <div className='request_resolve_container'>
                        <div className='request_resolve_subcontainer'>
                          {item.context[1] === 'B' && (
                          <button onClick={() => cancelUpdateRequest(item.context)}>
                            Cancel
                          </button>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                ))}

                {actionData.filter(item => item.resolved === 'N').map((item) => (
                  <div className='status_content_container'>
                    <div className='status_icon_container'>
                      <img src='../icons/mail_action_icon.png' className='status_image'></img>
                    </div>
                    <div className='status_data_container'>
                      <div className='status_meta_container'>
                        <div className='status_context_container'>
                          {formatContext(item.context)}
                        </div>
                        <div className='status_time_container'>
                          {simplifyTime(item.time)}
                        </div>
                      </div>
                      <div className='status_text_container'>
                        {displayChoice(item.userAChoice, item.url)}
                      </div>
                    </div>
                    <div className='status_resolve_container'>
                      <div className='request_resolve_subcontainer'>
                        <button id="btnNo" className='btn_no' onClick={(event) => responseBtn(event.target, {item})}>Reject</button>
                      </div>
                      <div className='request_resolve_subcontainer'>
                        <button id="btnYes" className='btn_yes' onClick={(event) => responseBtn(event.target, {item})}>Accept</button>
                      </div>
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
                      <img src={getMessageIcon(item.userID)} className='icon_image'></img>
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
                      <img src={checkContext(item.context)} className='history_image'></img>
                    </div>
                    <div className='history_data_container'>
                      <div className='history_meta_container'>
                        <div className='history_context_container'>
                          {formatContext(item.context)}
                        </div>
                        <div className='history_time_container'>
                          {simplifyTime(item.time)}
                        </div>
                      </div>
                      <div className='history_bulk_container'>
                        <div className='history_text_container'>
                          {displayChoice(item.userAChoice, item.url)}
                        </div>
                        <div className='history_response_container'>
                          {displayOutcome(item.responseOutcome)}
                        </div>
                      </div>
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
                    <div className='account_right'><button onClick={switchEducationVisibility}>Safety Information</button></div>
                  </div>

                  {educationVisible && (
                    <div className='education_background' id='educationBackground'>
                      <div className='education_popup' id='settingsPopup'>
                        <div className='bottom_scrollbar'>
                          <div className='education_content'>

                            <div className='education_header_container'>
                              <div className='popup_subtitle'>More information</div>
                              <div className='okay_education_top' >
                              <button className='popup_button' onClick={switchEducationVisibility}>Okay</button>
                              </div>
                            </div>

                            <h2>For more information about staying safe online, the following websites may be helpful.</h2>

                            <p><a href='https://www.ncsc.gov.uk/cyberaware/home' target="_blank" class="text-blue-500 hover:underline">National Cyber Security Centre</a>
                            &emsp;Advice on how to stay secure online</p>

                            <p><a href='https://ico.org.uk/for-the-public/online/spam-emails/' target="_blank" class="text-blue-500 hover:underline">Information Commissioner's Office</a>
                            &emsp;Advice for the public regarding spam emails</p>

                            <p><a href='https://www.ageuk.org.uk/information-advice/work-learning/technology-internet/internet-security/' target="_blank" class="text-blue-500 hover:underline">Age UK</a>
                            &emsp;Online safety advice targeted towards older Internet users</p>

                            <p><a href='https://www.mencap.org.uk/easyread/internet-online-safety' target="_blank" class="text-blue-500 hover:underline">Mencap</a>
                            &emsp;'Easy read' online safety tips targeting users with learning disabilities</p>

                            <h2><br></br>These videos explain basic online safety principles.</h2>

                            <p><a href='https://www.youtube.com/watch?v=NJxJYBAjkJU' target="_blank" class="text-blue-500 hover:underline">Email Security</a>
                            &emsp;Nixu Corporation (2 minutes)</p>

                            <p><a href='https://www.youtube.com/watch?v=o0btqyGWIQw' target="_blank" class="text-blue-500 hover:underline">Spot Phishing Emails</a>
                            &emsp;IT Governance LTD (2 minutes)</p>

                            <h2><br></br>These interactive educational resource may help improve your Internet safety skills.</h2>

                            <p><a href='https://www.egress.com/blog/phishing/spot-the-phish' target="_blank" class="text-blue-500 hover:underline">Spot the Phish</a>
                            &emsp;Egress (interactive quiz)</p>

                            <p><a href='https://beinternetawesome.withgoogle.com/en_uk/interland/landing/reality-river' target="_blank" class="text-blue-500 hover:underline">Interland - Reality River</a>
                            &emsp;Google (gamified quiz for detecting spam)</p>

                            <h2><br></br>If you believe you have received or been victim to a spam email, you can report the incident.</h2>

                            <p><a href='https://www.actionfraud.police.uk/' target="_blank" class="text-blue-500 hover:underline">Action Fraud</a>
                            &emsp;UK national cybercrime reporting centre</p>

                            <p><a href='0808 808 1111' target="_blank" class="text-blue-500 hover:underline">0808 808 1111</a>
                            &emsp;Mencap‘s Learning Disability Helpline</p>

                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='account_container'>
                    <div className='account_left'>Click on the button to the right to view the browsing history of User A. User A will be able to see that you looked.</div>
                    <div className='account_right'><button onClick={switchHistoryVisibility}>View Browsing History</button></div>
                  </div>

                  {historyVisible && (
                    <div className='browsing_history_background' id='browsingBackground'>
                      <div className='browsing_popup' id='browsingPopup'>
                        <div className='bottom_scrollbar'>
                          <div className='browsing_history_content'>
                            <div className='browsing_header_container'>

                              <div className='popup_subtitle'>Browsing History</div>
                              <div className='okay_browsing_top' >
                                <button className='popup_button' onClick={switchHistoryVisibility}>Okay</button>
                              </div>

                            </div>

                              {browsingData.map((item) => (
                                <div className='browsing_entry_container'>
                                  <div className='url_container'>{redactURL(item.url)}</div>
                                  <div className='url_time_container'>{simplifyTime(item.time)}</div>
                                </div>
                              ))}

                          </div>
                        </div>
                      </div>
                    </div>
                  )}
          
                  <div className='account_container'>
                    <div className='account_left'>Click on the button to the right to view your account settings. You can also request to modify the settings.</div>
                    <div className='account_right'><button onClick={switchSettingsVisibility}>Settings</button></div>

                    {settingsVisible && (
                      <div className='settings_background' id='settingsBackground'>
                        <div className='settings_popup' id='settingsPopup'>
                          <div className='bottom_scrollbar'>
                            <div className='settings_content'>
                              <div className='settings_header_container'>

                                <div className='popup_subtitle'>Settings</div>
                                <div className='okay_settings_top' >
                                  <button className='popup_button' onClick={switchSettingsVisibility}>Okay</button>
                                </div>

                              </div>

                                {settingsData.map((item) => (
                                  <div className='settings_entry_container'>
                                    <div className='context_container'>{displayContext(item.context)}</div>
                                    <div className='chosen_options_container'>
                                      <div className='chosen_options_subcontainer'>
                                        <div className='chosen_options_left'>{displayResponse(item.opt1)}</div>
                                        <div className='chosen_options_right'>{OPTIONS_MAP.get(1)}</div>
                                      </div>
                                      <div className='chosen_options_subcontainer'>
                                        <div className='chosen_options_left'>{displayResponse(item.opt2)}</div>
                                        <div className='chosen_options_right'>{OPTIONS_MAP.get(2)}</div>
                                      </div>
                                      <div className='chosen_options_subcontainer'>
                                        <div className='chosen_options_left'>{displayResponse(item.opt3)}</div>
                                        <div className='chosen_options_right'>{OPTIONS_MAP.get(3)}</div>
                                      </div>
                                      <div className='chosen_options_subcontainer'>
                                        <div className='chosen_options_left'>{displayResponse(item.opt4)}</div>
                                        <div className='chosen_options_right'>{OPTIONS_MAP.get(4)}</div>
                                      </div>
                                      <div className='chosen_options_subcontainer'>
                                        <div className='chosen_options_left'>{displayResponse(item.opt5)}</div>
                                        <div className='chosen_options_right'>{OPTIONS_MAP.get(5)}</div>
                                      </div>
                                      <p>Intervention will be activated when User A clicks any link contained in an email. You will be able to see the time of request and the link clicked on if User A chooses to notify you of their action.</p>
                                    </div>
                                    <div className='request_update_container'>
                                      <button className='update_settings_button' onClick={() => updateRequest(item.context)}>Request Update</button>
                                    </div>
                                  </div>
                                ))}

                                <div className='settings_entry_container'>
                                  <div className='context_container'>Trusted Contacts</div>
                                  <div className='trusted_items_container'>
                                  {trustedData.map((item) => (
                                    <p>{item.address}</p>
                                  ))}
                                  </div>
                                  <div className='request_update_container'>
                                    <button className='update_settings_button' onClick={() => updateRequest('T')}>Request Update</button>
                                  </div>
                                </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
