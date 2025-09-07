import React from "react";
import { MapPin } from "lucide-react";

const LocationDisplay = ({ location, distance }) => {
  if (!location) return null;

  return (
    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
      <MapPin className="w-3 h-3" />
      <span>{location.locationName}</span>
      {distance !== undefined && (
        <span className="text-blue-600 font-medium">
          • {distance === 0 ? "Very close" : `${distance}km away`}
        </span>
      )}
    </div>
  );
};

export default LocationDisplay;
