import React from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import FreelancerProfile from "./freelancer-profile";
import type { RootState } from "@/store";

const FreelancerProfileRoutePage: React.FC = () => {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const { authToken } = useSelector((state: RootState) => state.auth);

  if (!freelancerId || !authToken) {
    return <div>Invalid freelancer or not authenticated.</div>;
  }

  return <FreelancerProfile freelancerId={freelancerId} authToken={authToken} />;
};

export default FreelancerProfileRoutePage; 