import React, { useEffect, useState } from 'react';

// Main App component for dashboard
function App() {
  const [dashboardData, setDashboardData] = useState([]); // State to store fetched data
  const [loading, setLoading] = useState(true);         // State for loading indicator
  const [error, setError] = useState(null);             // State for error messages

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data from our Node.js backend API
        // Make sure the backend server is running on port 5000
        const response = await fetch('http://localhost:5000/api/dashboard-data');

        // Check if the HTTP response was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); // Parse the JSON response
        console.log('Fetched data:', result.data); // Log the fetched data for debugging
        setDashboardData(result.data); // Update the state with the fetched data
      } catch (e) {
        console.error("Error fetching dashboard data:", e); // Log any errors
        setError(e.message); // Set error state
      } finally {
        setLoading(false); // Set loading to false once fetching is complete (or errors)
      }
    };

    fetchData(); // Call the async function to fetch data
  }, []); // Empty dependency array means this effect runs once after the initial render

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
      <div className="min-h-screen flex items-center justify-center bg-red-100 font-inter">
        <p className="text-xl text-red-700">Error: {error}. Please ensure the Node.js backend is running.</p>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <header className="bg-white shadow rounded-lg p-4 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 text-center">User A Dashboard</h1>
      </header>


      <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Browsing History</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        {dashboardData.length > 0 ? (
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
              {dashboardData.map((item) => (
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

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Emma Pollard. All rights reserved.</p>
        </footer>
      </div>
  );
}

export default App;
