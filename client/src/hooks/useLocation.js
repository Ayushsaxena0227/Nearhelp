import { useState, useEffect } from "react";

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    const handleSuccess = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLoading(false);
    };

    const handleError = (error) => {
      setError(`Error getting location: ${error.message}`);
      setLoading(false);
    };

    // Ask for the user's location
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
  }, []); // This effect runs once when the hook is used

  return { location, error, loading };
}
