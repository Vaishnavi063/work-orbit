import { useEffect, useState } from "react";
import apis from "../apis";
import type { ApiError } from "@/types";

interface PastWork {
  id: number;
  title: string;
  link: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

interface FreelancerProfile {
  name: string;
  email: string;
  rating: number;
  skills: string[];
  pastWorks: PastWork[];
}

const useGetFreelancerProfile = (id: string, authToken: string) => {
  const [data, setData] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!id || !authToken) return;
    setIsLoading(true);
    setError(null);
    apis.getFreelancerProfile({ id, authToken })
      .then((res) => {
          // Ensure timeline data is properly handled in response
        const profileData = res.data.data;
        if (profileData && profileData.pastWorks) {
          // Process past work data to ensure timeline fields are properly typed
          profileData.pastWorks = profileData.pastWorks.map((work: any) => ({
            ...work,
            startDate: work.startDate || undefined,
            endDate: work.endDate || undefined
          }));
        }
        setData(profileData);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, authToken]);

  return { data, isLoading, error };
};

export default useGetFreelancerProfile; 