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
        <h1 className="text-3xl font-semibold text-gray-800 text-center">Simple Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 border-b-4 border-blue-500 hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{item.name}</h2>
            <p className="text-3xl font-bold text-blue-600 mb-2">
            </p>
            <p className={`text-sm font-medium`}>
              url: {item.url}
              time: {item.time}
            </p>
          </div>
        ))}
      </div>

      <footer className="mt-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Simple Dashboard. All rights reserved.</p>
        <p>Data fetched from Node.js backend.</p>
      </footer>
    </div>
  );
}

export default App;
