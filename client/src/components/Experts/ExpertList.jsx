import React from "react";
import ExpertCard from "./ExpertCard";

const ExpertList = ({ experts, onFollow, onMessage }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {experts.map((expert, index) => (
        <ExpertCard
          key={expert.id || expert.user_id || expert.expert_id || `expert-${index}`}
          expert={expert}
          onFollow={onFollow}
          onMessage={onMessage}
        />
      ))}
    </div>
  );
};

export default ExpertList;
