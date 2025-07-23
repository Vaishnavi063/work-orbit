import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  fetchContractById,
  selectCurrentContract,
  selectContractsLoading,
  selectContractsError,
} from "@/store/slices/contracts-slice";
import { ContractStatus } from "@/features/contracts/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import ContractStatusTimeline from "./ContractStatusTimeline";
import ContractStatusUpdateForm from "./ContractStatusUpdateForm";
import type { AppDispatch, RootState } from "@/store";

/**
 * Component for displaying detailed information about a contract
 */
const ContractDetails: React.FC = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const contract = useSelector(selectCurrentContract);
  const loading = useSelector(selectContractsLoading);
  const error = useSelector(selectContractsError);
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  
  // State for status update modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  
  // Check if user is authenticated
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuth);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (authToken && contractId) {
      dispatch(fetchContractById({ contractId: parseInt(contractId), authToken }));
    }
  }, [dispatch, contractId, authToken]);

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

  if (loading.contractDetails) {
    return <div className="p-4">Loading contract details...</div>;
  }

  if (error.contractDetails) {
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
              <h3 className="text-sm font-medium">Error loading contract details</h3>
              <div className="mt-2 text-sm">{error.contractDetails}</div>
              <div className="mt-4">
                <div className="flex space-x-3">
                  <Link to="/contracts">
                    <button
                      type="button"
                      className="rounded-md bg-white px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
                    >
                      Back to contracts
                    </button>
                  </Link>
                  <button
                    type="button"
                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                    onClick={() => {
                      if (authToken && contractId) {
                        dispatch(fetchContractById({ contractId: parseInt(contractId), authToken }));
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
      </div>
    );
  }

  if (!contract) {
    return <div className="p-4">Contract not found</div>;
  }
  
  return (
    <div className="contract-details space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contract Details</h1>
        <Link to="/dashboard/contracts">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Contracts
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project: {contract.projectName}</span>
            {renderStatusBadge(contract.contractStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Client</h3>
              <p>{contract.clientName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Freelancer</h3>
              <p>{contract.freelancerName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bid Amount</h3>
              <p>Rs.{contract.bidAmount ? contract.bidAmount.toFixed(2) : '0.00'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p>{contract.contractStatus === ContractStatus.IN_PROGRESS ? "In Progress" : "Completed"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created</h3>
              <p>{formatDate(contract.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p>{formatDate(contract.updatedAt)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contract Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500">Project ID</h4>
                <p>{contract.projectId}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500">Contract ID</h4>
                <p>{contract.contractId}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-500">Bid ID</h4>
                <p>{contract.bidId}</p>
              </div>
            </div>
          </div>

          <Separator />
          
          {/* Status History Timeline */}
          <ContractStatusTimeline
            createdAt={contract.createdAt}
            updatedAt={contract.updatedAt}
            currentStatus={contract.contractStatus}
          />
          
          {/* Update Status Button - Only show if user is authenticated */}
          {isAuthenticated && currentUser && (
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => setIsUpdateModalOpen(true)}
                variant="outline"
              >
                Update Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Contract Status Update Modal */}
      <ContractStatusUpdateForm
        contract={contract}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />
    </div>
  );
};

export default ContractDetails;