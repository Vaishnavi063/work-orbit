import WalletSummary from "./components/wallet-summery";
import FrozenAmountsTable from "./components/project-table";
import useGetWalletDetails from "./hooks/use-get-wallet-details";
import { FullscreenLoader } from "@/components/shared/full-screen-loader";
import useGetFrozenAmount from "./hooks/use-get-frozen-amounts";

export const ClientWallet = () => {
  const { walletDetails, refetch, isLoading } = useGetWalletDetails();
  const { frozanAmount } = useGetFrozenAmount();

  if (isLoading) return <FullscreenLoader lable="Details are loading..." />;

  return (
    <div className="space-y-6 p-6">
      <WalletSummary wallet={walletDetails} refetchDetails={refetch} />
      <FrozenAmountsTable frozenAmounts={frozanAmount || []} />
    </div>
  );
};
