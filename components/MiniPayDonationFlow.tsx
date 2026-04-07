'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseUnits, formatUnits } from 'viem';
import { celo } from 'viem/chains';

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

interface MiniPayDonationFlowProps {
  onClose: () => void;
  onSuccess: (txHash: string, amount: string) => void;
}

// GoodCollective pool address for Pesia's Kitchen EAT Initiative
const GOODCOLLECTIVE_POOL_ADDRESS = '0xbd64264aBe852413d30dBf8A3765d7B6DDB04713';

// cUSD token address on Celo
const CUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a';

// Preset donation amounts in USD
const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function MiniPayDonationFlow({ onClose, onSuccess }: MiniPayDonationFlowProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success' | 'error'>('select');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const { data: balance } = useBalance({
    address: address,
    token: CUSD_ADDRESS,
    chainId: celo.id,
  });

  const { writeContract, data: txHash, error: txError, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Watch for transaction status changes
  useEffect(() => {
    if (isConfirmed && step === 'processing' && txHash) {
      setStep('success');
      onSuccess(txHash, getDonationAmount().toString());
    }
  }, [isConfirmed, txHash, step]);

  useEffect(() => {
    if (txError && step === 'processing') {
      setErrorMessage(txError.message || 'Transaction failed');
      setStep('error');
    }
  }, [txError, step]);

  // Get the donation amount (either preset or custom)
  const getDonationAmount = () => {
    if (isCustom && customAmount) {
      return parseFloat(customAmount);
    }
    return selectedAmount || 0;
  };

  // Handle donation submission
  const handleDonate = async () => {
    try {
      const amount = getDonationAmount();

      if (amount <= 0) {
        setErrorMessage('Please enter a valid donation amount');
        return;
      }

      if (!address) {
        setErrorMessage('Please connect your MiniPay wallet first');
        return;
      }

      // Check if user has enough balance
      const balanceValue = balance ? parseFloat(formatUnits(balance.value, balance.decimals)) : 0;
      if (amount > balanceValue) {
        setErrorMessage(`Insufficient cUSD balance. You have ${balanceValue.toFixed(2)} cUSD`);
        return;
      }

      setStep('processing');
      setErrorMessage('');

      // Convert amount to wei (cUSD has 18 decimals)
      const amountInWei = parseUnits(amount.toString(), 18);

      // Send cUSD token transfer to GoodCollective pool
      writeContract({
        address: CUSD_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [GOODCOLLECTIVE_POOL_ADDRESS as `0x${string}`, amountInWei],
        chainId: celo.id,
      });

    } catch (error: any) {
      console.error('Donation error:', error);
      setErrorMessage(error.message || 'Transaction failed. Please try again.');
      setStep('error');
    }
  };

  // Render different steps
  if (step === 'processing') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 border-4 border-[#F4cf6A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Donation</h3>
        <p className="text-gray-600">Please confirm the transaction in MiniPay...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-4">Your donation of ${getDonationAmount()} cUSD was successful</p>
        <p className="text-sm text-gray-500 mb-6">
          Transaction: {txHash?.slice(0, 10)}...{txHash?.slice(-8)}
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-[#F4cf6A] text-black font-semibold rounded-xl hover:bg-[#F4cf6A]/90 transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Transaction Failed</h3>
        <p className="text-red-600 text-sm mb-6">{errorMessage}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setStep('select')}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#F4cf6A] text-black font-semibold rounded-xl hover:bg-[#F4cf6A]/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Main selection screen
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Donation</h3>
        <p className="text-gray-600">Support EAT Initiative via MiniPay</p>
        {balance && (
          <p className="text-sm text-gray-500 mt-2">
            Available: {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(2)} cUSD
          </p>
        )}
      </div>

      {/* Wallet Connection */}
      {!isConnected && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-3">
              🔐 Connect your wallet to make a donation
            </p>
            <button
              onClick={() => open()}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#F4cf6A] to-[#FFD700] text-black font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Connect MiniPay Wallet
            </button>
          </div>
        </div>
      )}

      {/* Preset Amounts - Only show when wallet is connected */}
      {isConnected && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select amount (cUSD)
            </label>
            <div className="grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedAmount(amount);
                setIsCustom(false);
                setCustomAmount('');
              }}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                selectedAmount === amount && !isCustom
                  ? 'bg-[#F4cf6A] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ${amount}
            </motion.button>
          ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter custom amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustom(true);
                  setSelectedAmount(null);
                }}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#F4cf6A] focus:outline-none"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">🔒 Secure & Direct:</span> Your donation goes directly to the GoodCollective pool on Celo blockchain.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDonate}
              disabled={!isConnected || getDonationAmount() <= 0}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-[#F4cf6A] to-[#FFD700] text-black font-semibold rounded-xl shadow-lg transition-all ${
                !isConnected || getDonationAmount() <= 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:shadow-xl'
              }`}
            >
              Donate ${getDonationAmount().toFixed(2)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
