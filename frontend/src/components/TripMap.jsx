import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AddStopModal from "./AddStopModal"; // Import the AddStopModal component

// Manual coordinates for known locations
const LOCATION_COORDINATES = {
  "Depot (OR Tambo Airport)": { lat: -26.1367, lng: 28.2411 },
  "Game Rosebank": { lat: -26.1453, lng: 28.041 },
  "Game Eastgate": { lat: -26.1791, lng: 28.117 },
  "Game Jhb City": { lat: -26.2041, lng: 28.04 },
  "Game Cresta": { lat: -26.1348, lng: 27.9655 },
  "Game Festival Mall": { lat: -26.1051, lng: 28.2296 },
  "Game Alberton": { lat: -26.2673, lng: 28.1222 },
  "Game Mall Of Africa": { lat: -25.9981, lng: 28.1077 },
  "Game The Glen": { lat: -26.2679, lng: 28.0496 },
  "Game Fourways": { lat: -26.0071, lng: 28.0124 },
  "Game Boksburg": { lat: -26.214, lng: 28.2594 },
  "Game Key West": { lat: -26.097, lng: 27.7705 },
  "Game Centurion": { lat: -25.8585, lng: 28.1903 },
  "Game Springs": { lat: -26.2485, lng: 28.4404 },
  "Game Menlyn": { lat: -25.7825, lng: 28.2751 },
  "Game Heidelberg": { lat: -26.5011, lng: 28.3585 },
};

// Geocoding function with extensive logging
async function getCoordinates(location) {
  console.log(
    `[COORDINATE RETRIEVAL] Attempting to fetch coordinates for: ${location}`
  );

  // Check manual coordinates first
  const manualCoords = LOCATION_COORDINATES[location];
  if (manualCoords) {
    console.log(
      `[COORDINATE RETRIEVAL] Found manual coordinates for ${location}:`,
      manualCoords
    );
    return manualCoords;
  }

  // Partial matching
  const partialMatch = Object.keys(LOCATION_COORDINATES).find(
    (key) => location.includes(key) || key.includes(location)
  );

  if (partialMatch) {
    console.log(
      `[COORDINATE RETRIEVAL] Partial match found for ${location}: ${partialMatch}`,
      LOCATION_COORDINATES[partialMatch]
    );
    return LOCATION_COORDINATES[partialMatch];
  }

  // Fallback to Nominatim
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}`
    );

    if (!response.ok) {
      console.error(
        `[COORDINATE RETRIEVAL] Error fetching coordinates: ${response.status}`
      );
      return null;
    }

    const data = await response.json();

    if (data.length === 0) {
      console.warn(
        `[COORDINATE RETRIEVAL] No coordinates found for: ${location}`
      );
      return null;
    }

    const coords = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };

    console.log(
      `[COORDINATE RETRIEVAL] Nominatim coordinates for ${location}:`,
      coords
    );
    return coords;
  } catch (error) {
    console.error(`[COORDINATE RETRIEVAL] Error for ${location}:`, error);
    return null;
  }
}

const TripMap = ({ tripId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // Store map instance for reuse
  const [directions, setDirections] = useState([]);
  const [stops, setStops] = useState([]);
  const [showAddStopModal, setShowAddStopModal] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [coordinateDebug, setCoordinateDebug] = useState({
    originalData: null,
    pickup: { location: null, coordinates: null },
    dropoff: { location: null, coordinates: null },
  });

  // Function to add a stop
  const handleAddStop = async (newStop) => {
    try {
      // In a production app, you might save this to your backend
      console.log("[STOPS] Adding new stop:", newStop);

      // Add to local state
      setStops((prevStops) => [...prevStops, newStop]);

      // Redraw the route with the new stop included
      await recalculateRoute();
    } catch (error) {
      console.error("[STOPS] Error adding stop:", error);
      alert("Failed to add stop. See console for details.");
    }
  };

  // Function to recalculate the route with stops
  const recalculateRoute = async () => {
    if (!tripData || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing routes from the map
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng } = tripData;

    // Create a sequence of waypoints including pickup, all stops, and dropoff
    const waypoints = [{ lat: pickup_lat, lng: pickup_lng }];

    // Add all stops as waypoints in between
    stops.forEach((stop) => {
      waypoints.push({ lat: stop.lat, lng: stop.lng });
    });

    // Add dropoff as final waypoint
    waypoints.push({ lat: dropoff_lat, lng: dropoff_lng });

    // Draw routes between each consecutive pair of waypoints
    let allDirections = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      const API_URL = import.meta.env.VITE_API_URL;

      try {
        const routeResponse = await fetch(
          `${API_URL}/api/get-route/?start=${start.lat},${start.lng}&end=${end.lat},${end.lng}`
        );

        const routeData = await routeResponse.json();

        if (routeData.features && routeData.features.length > 0) {
          const route = routeData.features[0];
          const routeCoordinates = route.geometry.coordinates.map((coord) => [
            coord[1], // Convert [lng, lat] -> [lat, lng] for Leaflet
            coord[0],
          ]);

          // Draw polyline for this route segment
          L.polyline(routeCoordinates, {
            color: i % 2 === 0 ? "blue" : "purple",
            weight: 4,
          }).addTo(map);

          // Collect directions for this segment
          if (route.properties && route.properties.segments) {
            const segmentDirections = route.properties.segments[0].steps.map(
              (step) => ({
                instruction: step.instruction,
                distance: step.distance,
                duration: step.duration,
                segment: i + 1,
              })
            );

            allDirections = [...allDirections, ...segmentDirections];
          }
        }
      } catch (error) {
        console.error(`[ROUTE] Error fetching route segment ${i}:`, error);
      }
    }

    // Update directions with all segments
    setDirections(allDirections);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet Map
    const map = L.map(mapRef.current).setView([-26.2041, 28.0473], 10);
    mapInstanceRef.current = map; // Store map instance for later use

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const API_URL = import.meta.env.VITE_API_URL;

    async function fetchTripData() {
      try {
        // Fetch trip details
        const response = await fetch(
          `${API_URL}/api/trips/${tripId}/`
        );
        const data = await response.json();

        // Log original data
        console.log("[TRIP DATA] Original Trip Data:", data);
        setCoordinateDebug((prev) => ({ ...prev, originalData: data }));

        // Destructure coordinates
        let {
          pickup_lat,
          pickup_lng,
          dropoff_lat,
          dropoff_lng,
          pickup_location,
          dropoff_location,
        } = data;

        // Coordinate retrieval for pickup
        if ((!pickup_lat || !pickup_lng) && pickup_location) {
          console.log(
            `[COORDINATE RETRIEVAL] Fetching pickup coordinates for: ${pickup_location}`
          );
          const pickupCoords = await getCoordinates(pickup_location);

          if (pickupCoords) {
            pickup_lat = pickupCoords.lat;
            pickup_lng = pickupCoords.lng;
          }

          // Update debug state
          setCoordinateDebug((prev) => ({
            ...prev,
            pickup: {
              location: pickup_location,
              coordinates: pickupCoords,
            },
          }));
        }

        // Coordinate retrieval for dropoff
        if ((!dropoff_lat || !dropoff_lng) && dropoff_location) {
          console.log(
            `[COORDINATE RETRIEVAL] Fetching dropoff coordinates for: ${dropoff_location}`
          );
          const dropoffCoords = await getCoordinates(dropoff_location);

          if (dropoffCoords) {
            dropoff_lat = dropoffCoords.lat;
            dropoff_lng = dropoffCoords.lng;
          }

          // Update debug state
          setCoordinateDebug((prev) => ({
            ...prev,
            dropoff: {
              location: dropoff_location,
              coordinates: dropoffCoords,
            },
          }));
        }

        // Validate coordinates
        if (!pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
          console.error("[COORDINATE ERROR] Invalid coordinates:", {
            pickup: { lat: pickup_lat, lng: pickup_lng },
            dropoff: { lat: dropoff_lat, lng: dropoff_lng },
          });
          alert("Error: Missing trip coordinates. Check console for details.");
          return;
        }

        // Store trip data with valid coordinates
        const enrichedTripData = {
          ...data,
          pickup_lat,
          pickup_lng,
          dropoff_lat,
          dropoff_lng,
        };
        setTripData(enrichedTripData);

        // Add markers to the map
        L.marker([pickup_lat, pickup_lng], {
          icon: new L.Icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            shadowSize: [41, 41],
          }),
        })
          .addTo(map)
          .bindPopup("Pickup: " + (pickup_location || "Unknown"));

        L.marker([dropoff_lat, dropoff_lng], {
          icon: new L.Icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            shadowSize: [41, 41],
          }),
        })
          .addTo(map)
          .bindPopup("Dropoff: " + (dropoff_location || "Unknown"));

        const API_URL = import.meta.env.VITE_API_URL;

        // Fetch route between pickup and dropoff
        const routeResponse = await fetch(
          `${API_URL}/api/get-route/?start=${pickup_lat},${pickup_lng}&end=${dropoff_lat},${dropoff_lng}`
        );

        const routeData = await routeResponse.json();
        console.log("Route Data:", routeData);

        // Check if route data exists
        if (routeData.features && routeData.features.length > 0) {
          const route = routeData.features[0];
          const routeCoordinates = route.geometry.coordinates.map((coord) => [
            coord[1], // Convert [lng, lat] -> [lat, lng] for Leaflet
            coord[0],
          ]);

          // Draw polyline for the route
          L.polyline(routeCoordinates, { color: "blue", weight: 4 }).addTo(map);

          // Extract step-by-step instructions (if available)
          if (route.properties && route.properties.segments) {
            const steps = route.properties.segments[0].steps.map((step) => ({
              instruction: step.instruction,
              distance: step.distance, // Distance in meters
              duration: step.duration, // Duration in seconds
            }));

            // Update the state with the extracted directions
            setDirections(steps);
          } else {
            console.warn("No step-by-step directions found in the response.");
            setDirections([]);
          }
        } else {
          console.error("No route found in response.");
          setDirections([]);
        }

        map.setView([pickup_lat, pickup_lng], 10);
      } catch (error) {
        console.error("Error fetching trip data:", error);
      }
    }

    fetchTripData();

    return () => map.remove();
  }, [tripId]);

  // Effect to update the map when stops change
  useEffect(() => {
    const drawStopsOnMap = async () => {
      if (!mapInstanceRef.current || !tripData || stops.length === 0) return;

      const map = mapInstanceRef.current;

      // Add markers for each stop
      stops.forEach((stop, index) => {
        // Remove any existing marker with the same ID if it exists
        map.eachLayer((layer) => {
          if (
            layer instanceof L.Marker &&
            layer.options.id === `stop-${index}`
          ) {
            map.removeLayer(layer);
          }
        });
        // Add marker for the stop
        L.marker([stop.lat, stop.lng], {
          id: `stop-${index}`,
          icon: new L.Icon({
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            shadowSize: [41, 41],
          }),
        })
          .addTo(map)
          .bindPopup(`Stop ${index + 1}: ${stop.location}`);
      });

      // Recalculate the route with the stops
      await recalculateRoute();
    };

    drawStopsOnMap();
  }, [stops, tripData]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Trip Route</h2>
        <button
          className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
          onClick={() => setShowAddStopModal(true)}
        >
          Add Stop
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-3/4">
          <div ref={mapRef} style={{ height: "500px", width: "100%" }}></div>
        </div>
        <div className="w-1/4 p-4 bg-gray-100 rounded">

          {stops.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-1">
                Planned Stops ({stops.length})
              </h4>
              <ul className="list-disc pl-4 text-sm">
                {stops.map((stop, index) => (
                  <li key={index} className="mb-1">
                    {stop.location}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h4 className="font-medium text-sm mb-1">Directions</h4>
          <div className="max-h-96 overflow-y-auto">
            <ul className="list-decimal pl-4">
              {directions.length > 0 ? (
                directions.map((step, index) => (
                  <li key={index} className="mb-2 text-sm">
                    {step.segment &&
                      index > 0 &&
                      directions[index - 1].segment !== step.segment && (
                        <div className="font-semibold text-blue-600 my-2">
                          {step.segment === 1
                            ? "To first stop"
                            : step.segment === directions.length
                            ? "To destination"
                            : `To stop ${step.segment}`}
                        </div>
                      )}
                    {step.instruction} ({(step.distance / 1000).toFixed(2)} km,{" "}
                    {Math.ceil(step.duration / 60)} min)
                  </li>
                ))
              ) : (
                <p>No directions available.</p>
              )}
            </ul>
          </div>
        </div>
      </div>

      <AddStopModal
        show={showAddStopModal}
        onClose={() => setShowAddStopModal(false)}
        tripId={tripId}
        onAddStop={handleAddStop}
      />
    </div>
  );
};

export default TripMap;
