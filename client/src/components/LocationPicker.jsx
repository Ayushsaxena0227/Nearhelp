import React, { useState, useEffect } from "react";
import { MapPin, Navigation, X } from "lucide-react";

const LocationPicker = ({ onLocationSelect, initialLocation = null }) => {
  const [location, setLocation] = useState(initialLocation);
  const [locationName, setLocationName] = useState(
    initialLocation?.locationName || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCurrentLocation = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get location name
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
          );
          const data = await response.json();

          const locationData = {
            latitude,
            longitude,
            locationName:
              data.results[0]?.formatted ||
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          };

          setLocation(locationData);
          setLocationName(locationData.locationName);
          onLocationSelect(locationData);
        } catch (error) {
          // Fallback if reverse geocoding fails
          const locationData = {
            latitude,
            longitude,
            locationName: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          };

          setLocation(locationData);
          setLocationName(locationData.locationName);
          onLocationSelect(locationData);
        }

        setLoading(false);
      },
      (error) => {
        setError("Unable to retrieve your location");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationName("");
    onLocationSelect(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Location (Optional but recommended)
      </label>

      {location ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">{locationName}</span>
          </div>
          <button
            type="button"
            onClick={clearLocation}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <Navigation className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
          <span>
            {loading ? "Getting location..." : "Use current location"}
          </span>
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <input
          type="text"
          placeholder="Or enter location manually (e.g., Connaught Place, Delhi)"
          value={locationName}
          onChange={(e) => {
            setLocationName(e.target.value);
            // You can add geocoding here to convert address to coordinates
            if (e.target.value && location) {
              onLocationSelect({
                ...location,
                locationName: e.target.value,
              });
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default LocationPicker;
