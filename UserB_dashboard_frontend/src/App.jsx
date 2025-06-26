import React, { useEffect, useState } from 'react';
import { act } from 'react';
import './App.css'

// Main App component for dashboard
function App() {
  const [browsingData, setBrowsingData] = useState([]);   // State to store fetched browsing history data
  const [actionData, setActionData] = useState([]);   // State to store fetched action data
  const [unresolvedData, setUnresolvedData] = useState([]); 
  const [loading, setLoading] = useState(true);         // State for loading indicator
  const [error, setError] = useState(null);             // State for error messages

  let UNRESOLVED = [];
  const noUnresolved = "No unresolved actions";

  function processAction(unresolved) {
    console.log("process_actions.js: unresolved: ", unresolved);
    setUnresolvedData(unresolved);
    if (unresolved.length > 0) {
      document.getElementById('unresolved_number_statement').innerHTML = unresolved.length + " unresolved action(s)";
    } else {
      document.getElementById('unresolved_number_statement').innerHTML = noUnresolved;
    }
  };

  function processActionID(data) {
    const action_ids = data.map(row => [row.actionID, row.resolved]);
    for (let i=0; i < action_ids.length; i++) {
      if (action_ids[i][1] === "N" && !UNRESOLVED.includes(action_ids[i][0])) { // collect unresolved actions
        console.log("action ", action_ids[i][0], "is unresolved");
        UNRESOLVED.push(action_ids[i][0]);
      } else {
        console.log("action ", action_ids[i][0], "is resolved");
      }
    }
    processAction(UNRESOLVED);
  }


// Function to attach event listeners to the menu popup buttons
function attachButtonListeners() {
    // if (!responseTable) return;
    console.log("attachButtonListeners loaded")

    const yesBtn = document.getElementById('btn_yes');
    const noBtn = document.getElementById('btn_no');

    if (yesBtn) {
        yesBtn.addEventListener('click', function(event) {
            // event.preventDefault();
            console.log("Yes button clicked.");
            // const actionID = // GET ACTION ID
            // if (actionID) {
            //     console.log("Action ID: ", actionID);
            //     sendActionID(actionID);
            // } else {
            //     console.warn("No action ID found")
            // }
        });
    } else {
        console.warn("btn_yes not found.");
    }

    if (noBtn) {
        noBtn.addEventListener('click', function(event) {
            // event.preventDefault();
            console.log("No button clicked.");
            // const actionID = // GET ACTION ID
            // if (actionID) {
            //     console.log("Action ID: ", actionID);
            //     sendActionID(actionID);
            // } else {
            //     console.warn("No action ID found")
            // }
        });
    } else {
        console.warn("btn_no not found.");
    }
}


  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchBrowserData = async () => {
      try {
        // Fetch data from our Node.js backend API
        // Make sure the backend server is running on port 5000
        const response = await fetch('http://localhost:5000/api/dashboard-data/browsingHistory');

        // Check if the HTTP response was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); // Parse the JSON response
        console.log('Fetched browser data:', result.data); // Log the fetched data for debugging
        setBrowsingData(result.data); // Update the state with the fetched data
      } catch (e) {
        console.error("Error fetching dashboard data:", e); // Log any errors
        setError(e.message); // Set error state
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (or errors)
      }
    };

    const fetchActionData = async () => {
      try {
        // Fetch data from our Node.js backend API
        // Make sure the backend server is running on port 5000
        const response = await fetch('http://localhost:5000/api/dashboard-data/action');

        // Check if the HTTP response was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); // Parse the JSON response
        console.log('Fetched action data:', result.data); // Log the fetched data for debugging
        setActionData(result.data); // Update the state with the fetched data
        processActionID(result.data);
      } catch (e) {
        console.error("Error fetching dashboard data:", e); // Log any errors
        setError(e.message); // Set error state
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (or errors)
      }
    };

    fetchBrowserData(); //  fetch data
    fetchActionData();
  }, []); // effect runs once after the initial render

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
                        <td className="entry_format"><button id="btn_no" onClick={attachButtonListeners}>BUTTON NO</button></td>
                        <td className="entry_format"><button id="btn_yes" onClick={attachButtonListeners}>BUTTON YES</button></td>
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
                  {/* TO DO: MESSAGES */}
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
