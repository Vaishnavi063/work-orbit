import useGetFreelancerProfile from "../hooks/use-get-freelancer-profile";

interface FreelancerProfileDetailsProps {
  freelancerId: string;
  authToken: string;
}

const FreelancerProfileDetails = ({ freelancerId, authToken }: FreelancerProfileDetailsProps) => {
  const { data, isLoading, error } = useGetFreelancerProfile(freelancerId, authToken);

  if (isLoading) return <div>Loading freelancer details...</div>;
  if (error) return <div>Failed to load freelancer details.</div>;
  if (!data) return null;

  const { rating, skills, pastWorks } = data;

  return (
    <div className="mt-8">
      <div>Rating: {rating}</div>
      <div>
        Skills:
        <ul className="list-disc list-inside ml-4">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
      <div>
        Past Work:
        <ul>
          {pastWorks.map(work => (
            <li key={work.id}>{work.title} - {work.description}</li>
          ))}
        </ul>
      </div>
      {/* Add edit profile button/feature here in the future */}
    </div>
  );
};

export default FreelancerProfileDetails;