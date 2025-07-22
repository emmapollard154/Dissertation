import { useEffect, useState } from 'react';
import './App.css'
import io from 'socket.io-client';

const A_BACKEND = 5000;
const A_FRONTEND = 5173;
const socket = io(`http://localhost:${A_BACKEND}`);

const OPTIONS_MAP = new Map([
  [1 , 'Continue (no interference).'],
  [2 , 'Record action for User B too see later. Continue with action.'],
  [3 , 'Ask User B to check (accept or reject) this action. Do not continue with action at the moment.'],
  [4 , 'Ask User B to check (accept or reject) this action. Block action if User B rejects request.'],
  [5 , 'Block this action. Prevent action being carried out in the future. User B will not be informed.'],
]);

const CHOICE_MAP = new Map([
  ['0', 'User B checked your browsing history.'],
  ['2', 'You clicked on a link in an email.'],
  ['3', 'You requested you to approve or reject clicking on an email link (one time request).'],
  ['4', 'You requested you to approve or reject clicking on an email link (link will be blocked if rejected).'],
  ['Y', 'Setting configuration updated.'],
]);

// Main App component for dashboard
function App() {
  const [browsingData, setBrowsingData] = useState([]);
  const [actionData, setActionData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [settingsData, setSettingsData] = useState([]);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [togetherVisible, setTogetherVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [educationVisible, setEducationVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
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

  function checkSettings(data) {
    if (!data) {
      console.error('App.jsx (A): error fetching settings data');
    }
    else {
      if (data.length === 0) { // no settings configured
        console.log('App.jsx (A): no setting configurations exist.');
        enableWelcomeVisibility();
      }
      else {
        console.log('App.jsx (A): setting configurations already exist.');
        disableWelcomeVisibility();
        disableUpdateVisibility();
        
        // TO DO: check settings configuration, process settings
      }
    }
  }

  function formatRequest(request) {

    let text = '';
    const context = request.context;

    if (context) {
      const env = context[0];
      const user = context[1];
      if (user === 'A' && env === 'E') {
        text = 'You requested to update email settings';
      }
      if (user === 'B' && env === 'E') {
        text = 'User B requested to update email settings';
      }
      return text;
    }
    else {
      console.error('App.jsx (A): no context found in request.')
    }
  }

  // Format context of settings
  function displayContext(context) {
    if (context === 'E') {
      return 'Email';
    }
  }

  const orderActionData = (data) => {
    return [...data].sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);
      return timeB - timeA; // ascending order
    });
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

  function displayResponse(response) {
    if (response === 'Y') {
      return '✔';
    }
    if (response === 'N') {
      return '✖';
    }
    return '?';
  }

  function updateRequest(context) {
    const user = 'A';
    const status = 'Y';
    if (context) {
      window.postMessage({
        type: 'UPDATE_REQUEST',
        payload: { context , user , status},
      }, `http://localhost:${A_FRONTEND}`);
    }
  }

  function cancelUpdateRequest(context) {
    console.log(context);
    const user = 'A';
    const status = 'N';
    if (context) {
      window.postMessage({
        type: 'UPDATE_REQUEST',
        payload: { context , user , status},
      }, `http://localhost:${A_FRONTEND}`);
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

  const fetchSettingsData = async () => {
    try {
      const response = await fetch(`http://localhost:${A_BACKEND}/api/dashboard-data/settings`);
      if (!response.ok) {
        throw new Error(`App.jsx (A): HTTP error. status: ${response.status}`);
      }
      const result = await response.json();
      checkSettings(result.data);
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

  // Function to get unique ID for email actions
  function settingID() {
      const now = new Date().toISOString(); // timestamp (unique)
      var id = now.replace(/\D/g, ""); // keep only numeric values from timestamp
      return `s${id}`; // e signifies email action
  }

  function updateSettingsData(context) {

    let settingChoices = null;
    let updateSettings = null;

    if (!context) { // initial configuration
      settingChoices = document.getElementById('emailChoice');
      updateSettings = document.getElementById('updateSettings');
    }
    else { // settings update
      settingChoices = document.getElementById('emailChoiceUpdate');
      updateSettings = document.getElementById('resetSettings');
    }

    if (!settingChoices) {
        console.warn('App.jsx (A): cannot find form in welcome popup.');
    }

    if (updateSettings) {

      const choices = settingChoices.elements['email_choices'];
      const chosen = Array(choices.length);

      if (choices) {
        for (let i=0; i < choices.length; i++) {
          if (choices[i].checked) {
            chosen[i] = 'Y';
          }
          else {
            chosen[i] = 'N';
          }
        }

        const id = settingID();
        const time = new Date().toISOString();

        window.postMessage({
          type: 'SET_EMAIL_SETTINGS',
          payload: { chosen , id , time },
        }, `http://localhost:${A_FRONTEND}`);

        if (context) {
          cancelUpdateRequest(context);
        }

        sendToExt('EMAIL_SETTINGS', chosen); // send to extension

      } else {
        console.warn('App.jsx (A): no choices found.');
      }

    } else {
      console.warn('App.jsx (A): "Save" button not found in welcome popup.');
    }

  }

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

  function switchSettingsVisibility() {
    console.log('App.jsx (A): switching visibility of settings information.');
    setSettingsVisible(!settingsVisible);
  };

  function switchHelpVisibility() {
    console.log('App.jsx (A): switching visibility of help information.');
    setHelpVisible(!helpVisible);
  };

  function switchEducationVisibility() {
    console.log('App.jsx (A): switching visibility of educational information.');
    setEducationVisible(!educationVisible);
  };

  function switchHistoryVisibility() {
    console.log('App.jsx (A): switching visibility of browsing history.');
    setHistoryVisible(!historyVisible);
  };

  function switchTogetherVisibility() {
    console.log('App.jsx (A): switching visibility of together page.');
    setTogetherVisible(!togetherVisible);
  };

  function enableWelcomeVisibility() {
    console.log('App.jsx (A): enabling visibility of settings configuration.');
    setWelcomeVisible(true);
  };

  function disableWelcomeVisibility() {
    console.log('App.jsx (A): disabling visibility of settings configuration.');
    setWelcomeVisible(false);
  };

  function enableUpdateVisibility() {
    console.log('App.jsx (A): enabling visibility of update configuration.');
    setUpdateVisible(true);
  };

  function disableUpdateVisibility() {
    console.log('App.jsx (A): disabling visibility of update configuration.');
    setUpdateVisible(false);
  };

  function proceedToUpdate() {
    console.log('App.jsx (A): proceeding to setting update screen.');
    setTogetherVisible(false);
    enableUpdateVisibility(); // switch to update screen
  }

  // Hook to fetch data when the component mounts
  useEffect(() => {

    // Fetch database data
    fetchSettingsData();
    fetchRequestData();
    fetchBrowserData();
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

    socket.on('a_update_request', (data) => {
      console.log('App.jsx (A): settings update request received: ', data);
      fetchRequestData();
      fetchSettingsData();
      fetchActionData();
    });

    socket.on('email_settings', (data) => {
      console.log('App.jsx (A): email settings updated: ', data);
      fetchSettingsData();
      fetchActionData();
    });

    socket.on('b_response', (data) => {
      console.log('App.jsx (A): User B sent a response: ', data);
      fetchActionData();
      sendToExt('NUM_PENDING', null);
      sendToExt('USER_B_RESPONSE', data);
    });

    socket.on('b_message', (data) => {
      console.log('App.jsx (A): User B sent a message: ', data);
      fetchMessageData();
      sendToExt('USER_B_MESSAGE', null);
    });

    socket.on('b_update_request', (data) => {
      console.log('App.jsx (A): settings update request received: ', data);
      fetchRequestData();
      fetchSettingsData();
      fetchActionData();
      if (data.status === 'Y') { // avoid alerting for cancelled request
        sendToExt('NUM_PENDING', null);
      }
    });

    socket.on('b_view', () => {
      console.log('App.jsx (A): browsing history view detected.');
      fetchActionData();
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('message');
      socket.off('a_browser');
      socket.off('a_choice');
      socket.off('a_message');
      socket.off('email_settings');
      socket.off('a_update_request');
      socket.off('b_update_request');
      socket.off('b_message');
      socket.off('b_response');
      socket.off('b_view');
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

        <div className='header_middle'>
          User A
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

                    <p>Help Information</p>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className='general_container'>

        {welcomeVisible && (
          <div className='welcome_background' id='welcomeBackground'>
            <div className='welcome_popup' id='welcomePopup'>
              <div className='bottom_scrollbar'>
                <div className='welcome_content'>

                  <div className='welcome_header_container'>
                    <div className='popup_subtitle'>Welcome</div>
                  </div>

                  <div className='welcome_instruction_container'>
                    <div className='popup_instruction'>Select the options you want to allow (email).</div>
                  </div>

                  <div className='settings_options_container'>
                    <form id="emailChoice">
                      <label className="options_container">
                        {OPTIONS_MAP.get(1)}
                        <input type="checkbox" name="email_choices" value="1" />
                        <span className="checkmark"></span>
                      </label>
                      <label className="options_container">
                        {OPTIONS_MAP.get(2)}
                        <input type="checkbox" name="email_choices" value="2" />
                        <span className="checkmark"></span>
                      </label>
                      <label className="options_container">
                        {OPTIONS_MAP.get(3)}
                        <input type="checkbox" name="email_choices" value="3" />
                        <span className="checkmark"></span>
                      </label>
                      <label className="options_container">
                        {OPTIONS_MAP.get(4)}
                        <input type="checkbox" name="email_choices" value="4" />
                        <span className="checkmark"></span>
                      </label>
                      <label className="options_container">
                        {OPTIONS_MAP.get(5)}
                        <input type="checkbox" name="email_choices" value="5" />
                        <span className="checkmark"></span>
                      </label>
                    </form>
                  </div>

                  <div className='settings_save_container'>
                    <button className="update_settings" id="updateSettings" onClick={() => updateSettingsData(null)}>Save</button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        <div className='top_panel'>
          <div className='top_left_container'>
            <div className='top_container'>
              <div className='top_scrollbar'>
                <h2 className='subtitle'>Status</h2>

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
                            <button onClick={switchTogetherVisibility}>Update Settings</button>
                          </div>

                          {togetherVisible && (
                            <div className='together_background' id='togetherBackground'>
                              <div className='together_popup' id='togetherPopup'>
                                <div className='bottom_scrollbar'>
                                  <div className='together_content'>
                                    <div className='together_header_container'>
                                      <div className='together_subtitle'>Update Settings</div>
                                    </div>

                                    <div className='together_message_container'>
                                      To update settings, confirm both users are present at this screen. Settings should be discussed and updated in person.
                                    </div>

                                    <div className='together_save_container'>
                                      <div className='together_button_container'>
                                        <button onClick={switchTogetherVisibility}>Cancel</button>
                                      </div>
                                      <div className='together_button_container'>
                                        <button onClick={proceedToUpdate}>Confirm</button>
                                      </div>
                                    </div>

                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {updateVisible && (
                            <div className='welcome_background'>
                              <div className='welcome_popup'>
                                <div className='bottom_scrollbar'>
                                  <div className='welcome_content'>

                                    <div className='welcome_header_container'>
                                      <div className='popup_subtitle'>Update Settings</div>
                                      <div className='okay_welcome_top' >
                                        <button className='popup_button' onClick={disableUpdateVisibility}>Cancel</button>
                                      </div>
                                    </div>

                                    <div className='welcome_instruction_container'>
                                      <div className='popup_instruction'>Select the options you want to allow (email).</div>
                                    </div>

                                    <div className='settings_options_container'>
                                      <form id="emailChoiceUpdate">
                                        <label className="options_container">
                                          {OPTIONS_MAP.get(1)}
                                          <input type="checkbox" name="email_choices" value="1" />
                                          <span className="checkmark"></span>
                                        </label>
                                        <label className="options_container">
                                          {OPTIONS_MAP.get(2)}
                                          <input type="checkbox" name="email_choices" value="2" />
                                          <span className="checkmark"></span>
                                        </label>
                                        <label className="options_container">
                                          {OPTIONS_MAP.get(3)}
                                          <input type="checkbox" name="email_choices" value="3" />
                                          <span className="checkmark"></span>
                                        </label>
                                        <label className="options_container">
                                          {OPTIONS_MAP.get(4)}
                                          <input type="checkbox" name="email_choices" value="4" />
                                          <span className="checkmark"></span>
                                        </label>
                                        <label className="options_container">
                                          {OPTIONS_MAP.get(5)}
                                          <input type="checkbox" name="email_choices" value="5" />
                                          <span className="checkmark"></span>
                                        </label>
                                      </form>
                                    </div>

                                    <div className='settings_save_container'>
                                      <button className="update_settings" id="resetSettings" onClick={() => updateSettingsData(item.context)}>Save</button>
                                    </div>

                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className='request_resolve_subcontainer'>
                            {item.context[1] === 'A' && (
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

                                <p>Education Data</p>

                            </div>
                          </div>
                        </div>
                      </div>
                    )}



                  

                  <div className='account_container'>
                    <div className='account_left'>Click on the button to the right to view your browsing history.</div>
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
                                    </div>
                                    <div className='request_update_container'>
                                      <button className='update_settings_button' onClick={() => updateRequest(item.context)}>Request Update</button>
                                    </div>
                                  </div>
                                ))}

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
