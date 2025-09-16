import { useEffect, useState } from "react";

export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.error("Location error:", err);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 }
    );
  };

  useEffect(() => {
    updateLocation();
  }, []);

  return { location, loading, updateLocation, setLocation };
}
