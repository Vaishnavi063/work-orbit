import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  fetchContracts,
  selectContracts,
  selectContractsLoading,
  selectContractsError,
} from "@/store/slices/contracts-slice";
import { ContractStatus } from "@/features/contracts/types";
import type { Contract } from "@/features/contracts/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { AppDispatch, RootState } from "@/store";

/**
 * Component for displaying a list of contracts with filtering options
 */
const ContractList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const contracts = useSelector(selectContracts);
  const loading = useSelector(selectContractsLoading);
  const error = useSelector(selectContractsError);
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (authToken) {
      dispatch(fetchContracts(authToken));
    }
  }, [dispatch, authToken]);

  // Filter contracts based on active tab
  const filteredContracts = contracts.filter((contract) => {
    if (activeTab === "all") return true;
    if (activeTab === "in-progress")
      return contract.contractStatus === ContractStatus.IN_PROGRESS;
    if (activeTab === "completed")
      return contract.contractStatus === ContractStatus.COMPLETED;
    return true;
  });

  // Sort contracts by updatedAt date (newest first)
  const sortedContracts = [...filteredContracts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Determine if user is client or freelancer to show correct "Other Party"
  const getOtherParty = (contract: Contract) => {
    if (currentUser?.role === "ROLE_CLIENT") {
      return contract.freelancerName;
    } else {
      return contract.clientName;
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy, h:mm a");
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: ContractStatus) => {
    if (status === ContractStatus.IN_PROGRESS) {
      return <Badge variant="secondary">In Progress</Badge>;
    } else if (status === ContractStatus.COMPLETED) {
      return <Badge variant="default">Completed</Badge>;
    }
    return null;
  };

  if (loading.contracts) {
    return <div className="p-4">Loading contracts...</div>;
  }

  if (error.contracts) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Error loading contracts</h3>
              <div className="mt-2 text-sm">{error.contracts}</div>
              <div className="mt-4">
                <button
                  type="button"
                  className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                  onClick={() => {
                    if (authToken) {
                      dispatch(fetchContracts(authToken));
                    }
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contract-list space-y-4">
      <h1 className="text-2xl font-bold">My Contracts</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {sortedContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Other Party</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContracts.map((contract) => (
                  <TableRow key={contract.contractId}>
                    <TableCell>
                      <Link
                        to={`/contracts/${contract.contractId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contract.projectTitle}
                      </Link>
                    </TableCell>
                    <TableCell>{getOtherParty(contract)}</TableCell>
                    <TableCell>
                      {renderStatusBadge(contract.contractStatus)}
                    </TableCell>
                    <TableCell>{formatDate(contract.updatedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No contracts found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractList;
