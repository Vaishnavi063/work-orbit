import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateContractStatus, 
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
import { AlertCircle, CheckCircle2 } from 'lucide-react';
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
  
  // Permission validation
  const hasPermissionToUpdate = React.useMemo(() => {
    if (!contract || !currentUser) return false;
    
    const userRole = currentUser.role as UserRoles;
    const userId = currentUser.id;
    
    // Check if user is the client or freelancer associated with this contract
    const isContractParticipant = 
      (userRole === 'ROLE_CLIENT' && contract.clientId === userId) || 
      (userRole === 'ROLE_FREELANCER' && contract.freelancerId === userId);
    
    // Additional business rules could be added here
    // For example, maybe only clients can mark contracts as completed
    
    return isContractParticipant;
  }, [contract, currentUser]);
  
  // Error message for permission validation
  const permissionErrorMessage = React.useMemo(() => {
    if (!contract || !currentUser) return "Unable to validate permissions";
    
    const userRole = currentUser.role as UserRoles;
    
    if (userRole === 'ROLE_CLIENT' && contract.clientId !== currentUser.id) {
      return "You don't have permission to update this contract as you are not the client associated with it";
    }
    
    if (userRole === 'ROLE_FREELANCER' && contract.freelancerId !== currentUser.id) {
      return "You don't have permission to update this contract as you are not the freelancer associated with it";
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
    
    const result = await dispatch(updateContractStatus({
      contractId: contract.contractId,
      data: { contractStatus: selectedStatus as ContractStatus },
      authToken
    }));
    
    // Check if the update was successful
    if (!error.updateStatus && result.meta.requestStatus === 'fulfilled') {
      setShowSuccessMessage(true);
      
      // Close the modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
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