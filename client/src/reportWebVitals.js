import { onCLS, onFID, onLCP, onINP, onTTFB } from "web-vitals";

export function reportWebVitals(onReport) {
  // onReport gets called with a metric object { name, value, rating, delta, id, ... }
  onLCP(onReport);
  onFID(onReport);
  onCLS(onReport);
  onINP(onReport);
  onTTFB(onReport);
}
