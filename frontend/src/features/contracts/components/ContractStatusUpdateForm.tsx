import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateContractStatus, 
  fetchContractById, 
  selectContractsLoading, 
  selectContractsError,
  clearContractErrors
} from '@/store/slices/contracts-slice';
import { ContractStatus } from '@/features/contracts/types';
import type { Contract } from '@/features/contracts/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import type { UserRoles } from '@/types';

interface ContractStatusUpdateFormProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationErrors {
  status: string | null;
}

/**
 * Component for updating the status of a contract with permission validation
 */
const ContractStatusUpdateForm: React.FC<ContractStatusUpdateFormProps> = ({ 
  contract, 
  isOpen, 
  onClose 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | ''>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({ status: null });
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  const [clientRating, setClientRating] = useState<number | null>(null);
  const loading = useSelector(selectContractsLoading);
  const error = useSelector(selectContractsError);
  const authToken = useSelector((state: RootState) => state.auth.authToken);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus('');
      setValidationErrors({ status: null });
      setShowSuccessMessage(false);
      setClientRating(null);
      
      // Clear any previous errors
      dispatch(clearContractErrors());
    }
  }, [isOpen, dispatch]);
  
  // Reset success message after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccessMessage) {
      timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessMessage]);
  
  // Permission validation - Only allow clients to update contract status
  const hasPermissionToUpdate = React.useMemo(() => {
    if (!contract || !currentUser) return false;
    
    const userRole = currentUser.role as UserRoles;
    const userId = currentUser.id;
    
    // Only allow the client who owns this contract to update the status
    return userRole === 'ROLE_CLIENT' && contract.clientId === userId;
  }, [contract, currentUser]);
  
  // Error message for permission validation
  const permissionErrorMessage = React.useMemo(() => {
    if (!contract || !currentUser) return "Unable to validate permissions";
    
    const userRole = currentUser.role as UserRoles;
    
    if (userRole !== 'ROLE_CLIENT') {
      return "Only clients can update contract status.";
    }
    
    if (contract.clientId !== currentUser.id) {
      return "You can only update contracts that belong to you.";
    }
    
    return "You don't have permission to update this contract";
  }, [contract, currentUser]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as ContractStatus);
    
    // Clear validation error when user selects a status
    if (validationErrors.status) {
      setValidationErrors({ ...validationErrors, status: null });
    }
  };

  /**
   * Validates the form before submission
   * @returns true if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = { status: null };
    let isValid = true;
    
    // Validate status selection
    if (!selectedStatus) {
      errors.status = "Please select a status";
      isValid = false;
    }
    
    // If the selected status is the same as the current status
    if (contract && selectedStatus === contract.contractStatus) {
      errors.status = "The selected status is the same as the current status";
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!contract || !authToken) return;
    
    // Check permission before submitting
    if (!hasPermissionToUpdate) {
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Send both contractStatus and freelancerRating as a JSON object
      const result = await dispatch(updateContractStatus({
        contractId: contract.contractId,
        data: {
          contractStatus: selectedStatus,
          freelancerRating: clientRating ?? null
        },
        authToken,
        options: { isPlainText: false }
      }) as any);
      
      // Check if the update was successful
      if (result.meta.requestStatus === 'fulfilled') {
        setShowSuccessMessage(true);
        // Close the dialog after a short delay
        setTimeout(() => {
          onClose();
          // Refresh the contract details
          dispatch(fetchContractById({ contractId: contract.contractId, authToken }));
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating contract status:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Contract Status</DialogTitle>
        </DialogHeader>
        
        {/* Success message */}
        {showSuccessMessage && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Contract status updated successfully
            </AlertDescription>
          </Alert>
        )}
        
        {/* Permission validation error */}
        {!hasPermissionToUpdate && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription>
              {permissionErrorMessage}
            </AlertDescription>
          </Alert>
        )}
        
        {/* API error message */}
        {error.updateStatus && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.updateStatus}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Form content */}
        {contract && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <p className="text-sm font-medium mb-2">Current Status:</p>
                <p className="text-sm">
                  {contract.contractStatus === ContractStatus.IN_PROGRESS ? "In Progress" : "Completed"}
                </p>
              </div>
              
              <div className="col-span-4">
                <p className="text-sm font-medium mb-2">New Status:</p>
                <Select 
                  disabled={!hasPermissionToUpdate || loading.updateStatus} 
                  onValueChange={handleStatusChange} 
                  value={selectedStatus}
                >
                  <SelectTrigger className={validationErrors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContractStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={ContractStatus.COMPLETED}>Completed</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Validation error message */}
                {validationErrors.status && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.status}</p>
                )}
              </div>
              {/* Client Rating Input */}
              <div className="col-span-4">
                <label className="text-sm font-medium mb-2 block">Rate the freelancer (1-5)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={clientRating ?? ''}
                    onChange={e => setClientRating(Number(e.target.value))}
                    disabled={!hasPermissionToUpdate || loading.updateStatus}
                    className="w-20 text-center bg-gray-50 border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-200"
                    placeholder="0.0"
                  />
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-500">(Only visible to client, not saved yet)</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading.updateStatus}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={!hasPermissionToUpdate || loading.updateStatus}
          >
            {loading.updateStatus ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractStatusUpdateForm;