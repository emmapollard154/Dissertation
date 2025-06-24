import React, { useEffect, useState } from 'react';
import { act } from 'react';
import './App.css'

// Main App component for dashboard
function App() {
  const [browsingData, setBrowsingData] = useState([]);   // State to store fetched browsing history data
  const [actionData, setActionData] = useState([]);   // State to store fetched action data
  const [loading, setLoading] = useState(true);         // State for loading indicator
  const [error, setError] = useState(null);             // State for error messages

  let UNRESOLVED = [];

  function processAction(unresolved) {
    console.log("process_actions.js: unresolved: ", unresolved);
    document.getElementById('unresolved_actions').innerHTML = UNRESOLVED
    if (unresolved.length > 0) {
      document.getElementById('unresolved_number').innerHTML = unresolved.length + " unresolved actions";
    } else {
      document.getElementById('unresolved_number').innerHTML = "No unresolved actions";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <p className="text-xl text-gray-700">Loading dashboard data...</p>
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

    <div className="dashboard_title">
      <header className="bg-white shadow rounded-lg p-4 mb-6">
        <h1>User B Dashboard</h1>
      </header>

      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Unresolved Actions</h2>
      <p id="unresolved_number"></p>
      <p id="unresolved_actions"></p>

      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Browsing History</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {browsingData.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  URL
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {browsingData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border border-gray-200">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {item.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border border-gray-200">
                    {item.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-center text-gray-500">Browsing history is empty.</p>
        )}
      </div>




<h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Actions</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {actionData.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  Action ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  Context
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  User A Choice
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  Resolved
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-200"
                >
                  Response Outcome
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actionData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border border-gray-200">
                    {item.actionID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border border-gray-200">
                    {item.context}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border border-gray-200">
                    {item.userAChoice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 border border-gray-200">
                    {item.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border border-gray-200">
                    {item.resolved}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 border border-gray-200">
                    {item.responseOutcome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-center text-gray-500">Action history is empty.</p>
        )}
        <script src="../process_actions.js"></script>
      </div>

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Emma Pollard. All rights reserved.</p>
        </footer>
      </div>

  );
}

export default App;
