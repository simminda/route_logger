import { useState, useEffect } from "react";

const SearchResults = ({ searchQuery }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]); // Reset results if query is empty
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL;

    async function fetchSearchResults() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/trip-history/?search=${searchQuery}`, {
          method: "GET",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data); // Set the search results
        } else {
          console.error("Failed to fetch search results.");
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <div className="search-results">
      {loading ? (
        <p>Loading search results...</p>
      ) : (
        searchResults.length > 0 ? (
          <div>
            <h2>Search Results</h2>
            <ul>
              {searchResults.map((trip, index) => (
                <li key={index}>
                  <h3>{trip.pickup_location} → {trip.dropoff_location}</h3>
                  <p>Started: {new Date(trip.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No results found for "{searchQuery}".</p>
        )
      )}
    </div>
  );
};

export default SearchResults;
