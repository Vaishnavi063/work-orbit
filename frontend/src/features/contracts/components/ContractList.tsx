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
import { ContractChatButton } from "@/features/chat/components/ContractChatButton";
import type { AppDispatch } from "@/store";
import useAuth from "@/hooks/use-auth";

const ContractList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const contracts = useSelector(selectContracts);
  const loading = useSelector(selectContractsLoading);
  const error = useSelector(selectContractsError);

  const { authToken, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (authToken) {
      dispatch(fetchContracts(authToken));
    }
  }, [dispatch, authToken]);

  const filteredContracts = contracts.filter((contract) => {
    if (activeTab === "all") return true;
    if (activeTab === "in-progress")
      return contract.contractStatus === ContractStatus.IN_PROGRESS;
    if (activeTab === "completed")
      return contract.contractStatus === ContractStatus.COMPLETED;
    return true;
  });

  const sortedContracts = [...filteredContracts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const getOtherParty = (contract: Contract) => {
    if (currentUser?.role === "ROLE_CLIENT") {
      return contract.freelancerName;
    } else {
      return contract.clientName;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy, h:mm a");
  };

  const renderStatusBadge = (status: ContractStatus) => {
    if (status === ContractStatus.IN_PROGRESS) {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
          In Progress
        </Badge>
      );
    } else if (status === ContractStatus.COMPLETED) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
          Completed
        </Badge>
      );
    }
    return null;
  };

  if (loading.contracts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">
              Loading Contracts
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (error.contracts) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading contracts
              </h3>
              <div className="mt-2 text-sm">{error.contracts}</div>
              <div className="mt-4">
                <button
                  type="button"
                  className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200"
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
      <h1 className="text-2xl font-bold text-gray-800">My Contracts</h1>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {sortedContracts.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-gray-700 font-semibold py-3 px-4 border-r border-gray-200">
                      Project Name
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-3 px-4 border-r border-gray-200">
                      Other Party
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-3 px-4 border-r border-gray-200">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-3 px-4 border-r border-gray-200">
                      Last Updated
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold py-3 px-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContracts.map((contract) => {
                    const otherPartyName = getOtherParty(contract);
                    return (
                      <TableRow
                        key={contract.contractId}
                        className="hover:bg-blue-50 border-b border-gray-100 transition-colors"
                      >
                        <TableCell className="py-3 px-4 border-r border-gray-100">
                          <Link
                            to={`/dashboard/contracts/${contract.contractId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {contract.projectName}
                          </Link>
                        </TableCell>
                        <TableCell className="py-3 px-4 border-r border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {getInitials(otherPartyName)}
                            </div>
                            <span className="text-gray-600">
                              {otherPartyName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 border-r border-gray-100">
                          {renderStatusBadge(contract.contractStatus)}
                        </TableCell>
                        <TableCell className="text-gray-600 py-3 px-4 border-r border-gray-100">
                          {formatDate(contract.updatedAt)}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <ContractChatButton
                            contractId={contract.contractId}
                            variant="ghost"
                            size="sm"
                            showLabel={false}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
              No contracts found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractList;
