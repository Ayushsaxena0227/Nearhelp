import React, { useEffect, useState } from "react";
import { getApplicationsForOwner } from "../../api/application";
import ApplicationsList from "../../components/ApplicationList";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getApplicationsForOwner();
    console.log(data);
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Skeleton Loader
  const SkeletonCard = () => (
    <div className="bg-white shadow rounded-xl p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="h-5 w-32 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="flex space-x-3 mt-4">
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Applications on My Posts</h1>
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <ApplicationsList applications={applications} onStatusChange={load} />
      )}
    </div>
  );
}
