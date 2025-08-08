import React from "react";
import { Routes, Route } from "react-router-dom";
import ContractList from "./components/ContractList";
import ContractDetails from "./components/ContractDetails";

const ContractsFeature: React.FC = () => {
  return (
    <div className="container py-6 space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <Routes>
          <Route path="/" element={<ContractList />} />
          <Route path="/:contractId" element={<ContractDetails />} />
        </Routes>
      </div>
    </div>
  );
};

export default ContractsFeature;
