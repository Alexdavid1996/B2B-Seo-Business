import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopUpCard from "./top-up-card";
import WithdrawalCard from "./withdrawal-card";
import TransactionHistory from "./transaction-history";
import { WalletData, TransactionData } from "../../types";

interface WalletContentProps {
  wallet: WalletData | undefined;
  transactions: TransactionData[];
}

export default function WalletContent({ wallet, transactions }: WalletContentProps) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your balance, top up funds, and withdraw earnings.</p>
      </div>

      {/* Wallet Tabs */}
      <div className="w-full max-w-4xl mb-6 sm:mb-8">
        <Tabs defaultValue="top-up" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="top-up" className="text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
              <span className="hidden sm:inline">Top Up</span>
              <span className="sm:hidden">Top Up</span>
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2">
              <span className="hidden sm:inline">Withdraw</span>
              <span className="sm:hidden">Withdraw</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="top-up" className="mt-4 sm:mt-6">
            <TopUpCard wallet={wallet} transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="withdraw" className="mt-4 sm:mt-6">
            <WithdrawalCard wallet={wallet} transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Transaction History */}
      <div className="w-full max-w-6xl">
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}