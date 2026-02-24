'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAddress } from 'viem';
import { X, Check, Loader2, Link2, Wallet } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'create' | 'success' | 'add-wallet';

interface ProfileSetupModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string | null;
  onProfileCreated: (profileId: string) => void;
}

// ─── Message Builder ──────────────────────────────────────────────────────────

function buildSignMessage(checksumAddress: string, profileId: string): string {
  return [
    'Bunny Intel — Link Wallet',
    '',
    'Linking this wallet to your Bunny Intel profile.',
    '',
    `Address: ${checksumAddress}`,
    `Profile: ${profileId}`,
    `Timestamp: ${new Date().toISOString()}`,
  ].join('\n');
}

// ─── Modal Component ──────────────────────────────────────────────────────────

export function ProfileSetupModal({
  open,
  onClose,
  profileId: initialProfileId,
  onProfileCreated,
}: ProfileSetupModalProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [step, setStep] = useState<Step>('create');
  const [profileId, setProfileId] = useState<string | null>(initialProfileId);
  const [signingState, setSigningState] = useState<'idle' | 'signing' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track the address that was just linked (to detect "different wallet" in step 3)
  const linkedAddressRef = useRef<string | null>(null);

  // Reset step when modal opens
  useEffect(() => {
    if (open) {
      setStep(initialProfileId ? 'add-wallet' : 'create');
      setProfileId(initialProfileId);
      setSigningState('idle');
      setErrorMessage(null);
      linkedAddressRef.current = address?.toLowerCase() ?? null;
    }
  }, [open, initialProfileId, address]);

  // Update profileId from prop changes
  useEffect(() => {
    if (initialProfileId) setProfileId(initialProfileId);
  }, [initialProfileId]);

  const handleCreateProfile = useCallback(async () => {
    if (!address) return;
    setSigningState('signing');
    setErrorMessage(null);

    const newProfileId = crypto.randomUUID();
    let checksumAddress: string;
    try {
      checksumAddress = getAddress(address);
    } catch {
      checksumAddress = address;
    }

    const message = buildSignMessage(checksumAddress, newProfileId);

    try {
      const signature = await signMessageAsync({ message });

      setSigningState('submitting');

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: newProfileId,
          address,
          signature,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      setProfileId(newProfileId);
      onProfileCreated(newProfileId);
      setStep('success');
      setSigningState('idle');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create profile';
      // User rejected the signature prompt — treat silently
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setSigningState('idle');
      } else {
        setErrorMessage(msg);
        setSigningState('error');
      }
    }
  }, [address, signMessageAsync, onProfileCreated]);

  const handleAddWallet = useCallback(async () => {
    if (!address || !profileId) return;
    setSigningState('signing');
    setErrorMessage(null);

    let checksumAddress: string;
    try {
      checksumAddress = getAddress(address);
    } catch {
      checksumAddress = address;
    }

    const message = buildSignMessage(checksumAddress, profileId);

    try {
      const signature = await signMessageAsync({ message });

      setSigningState('submitting');

      const response = await fetch('/api/profile/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, address, signature, message }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      setStep('success');
      setSigningState('idle');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to link wallet';
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setSigningState('idle');
      } else {
        setErrorMessage(msg);
        setSigningState('error');
      }
    }
  }, [address, profileId, signMessageAsync]);

  if (!open) return null;

  const isAddressChanged =
    step === 'add-wallet' &&
    address &&
    linkedAddressRef.current !== null &&
    address.toLowerCase() !== linkedAddressRef.current;

  const isBusy = signingState === 'signing' || signingState === 'submitting';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(10, 9, 9, 0.8)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="card w-full max-w-md pointer-events-auto relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-md transition-colors hover:bg-[rgba(174,164,191,0.08)]"
                style={{ color: 'var(--color-dim)' }}
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {step === 'create' && (
                  <StepCreate
                    key="create"
                    address={address}
                    isBusy={isBusy}
                    signingState={signingState}
                    errorMessage={errorMessage}
                    onSign={handleCreateProfile}
                  />
                )}
                {step === 'success' && (
                  <StepSuccess
                    key="success"
                    onDone={onClose}
                    onAddWallet={() => {
                      linkedAddressRef.current = address?.toLowerCase() ?? null;
                      setStep('add-wallet');
                      setSigningState('idle');
                      setErrorMessage(null);
                    }}
                  />
                )}
                {step === 'add-wallet' && (
                  <StepAddWallet
                    key="add-wallet"
                    address={address}
                    isBusy={isBusy}
                    signingState={signingState}
                    errorMessage={errorMessage}
                    isAddressChanged={!!isAddressChanged}
                    onSign={handleAddWallet}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Step Subcomponents ───────────────────────────────────────────────────────

function StepCreate({
  address,
  isBusy,
  signingState,
  errorMessage,
  onSign,
}: {
  address?: string;
  isBusy: boolean;
  signingState: string;
  errorMessage: string | null;
  onSign: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(132, 226, 150, 0.1)', border: '1px solid rgba(132, 226, 150, 0.2)' }}
        >
          <Wallet className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
            Create your profile
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-dim)' }}>
            One profile, multiple wallets, combined score
          </p>
        </div>
      </div>

      {address && (
        <div
          className="px-3 py-2 rounded-md mb-4 font-mono text-xs"
          style={{ backgroundColor: 'rgba(174, 164, 191, 0.06)', border: '1px solid rgba(174, 164, 191, 0.1)', color: 'var(--color-muted)' }}
        >
          {address.slice(0, 8)}...{address.slice(-6)}
        </div>
      )}

      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Link all your wallets under one identity. Your combined score across all linked addresses will appear on the leaderboard.
      </p>

      {errorMessage && (
        <div
          className="px-3 py-2 rounded-md mb-4 text-xs"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}
        >
          {errorMessage}
        </div>
      )}

      <button
        onClick={onSign}
        disabled={isBusy || !address}
        className="w-full py-2.5 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2"
        style={{
          backgroundColor: isBusy ? 'rgba(132, 226, 150, 0.12)' : 'rgba(132, 226, 150, 0.15)',
          border: '1px solid rgba(132, 226, 150, 0.3)',
          color: 'var(--color-accent)',
          opacity: isBusy ? 0.7 : 1,
        }}
      >
        {signingState === 'signing' && <Loader2 className="w-4 h-4 animate-spin" />}
        {signingState === 'submitting' && <Loader2 className="w-4 h-4 animate-spin" />}
        {signingState === 'signing' ? 'Sign in wallet...' :
         signingState === 'submitting' ? 'Creating profile...' :
         'Sign & Create Profile'}
      </button>
    </motion.div>
  );
}

function StepSuccess({
  onDone,
  onAddWallet,
}: {
  onDone: () => void;
  onAddWallet: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: 'rgba(132, 226, 150, 0.12)', border: '1px solid rgba(132, 226, 150, 0.25)' }}
      >
        <Check className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
      </motion.div>

      <h2 className="text-base font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        Profile created
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
        Your wallet is now linked. Add more wallets to combine your scores on the leaderboard.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onDone}
          className="flex-1 py-2.5 rounded-md text-sm font-medium btn-secondary"
        >
          Done
        </button>
        <button
          onClick={onAddWallet}
          className="flex-1 py-2.5 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'rgba(132, 226, 150, 0.1)',
            border: '1px solid rgba(132, 226, 150, 0.25)',
            color: 'var(--color-accent)',
          }}
        >
          <Link2 className="w-3.5 h-3.5" />
          Add another wallet
        </button>
      </div>
    </motion.div>
  );
}

function StepAddWallet({
  address,
  isBusy,
  signingState,
  errorMessage,
  isAddressChanged,
  onSign,
}: {
  address?: string;
  isBusy: boolean;
  signingState: string;
  errorMessage: string | null;
  isAddressChanged: boolean;
  onSign: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(132, 226, 150, 0.1)', border: '1px solid rgba(132, 226, 150, 0.2)' }}
        >
          <Link2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
            Add another wallet
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-dim)' }}>
            Switch wallets in MetaMask / Rabby, then sign
          </p>
        </div>
      </div>

      <div
        className="px-4 py-3 rounded-md mb-5 text-sm"
        style={{ backgroundColor: 'rgba(174, 164, 191, 0.04)', border: '1px solid rgba(174, 164, 191, 0.1)', color: 'var(--color-muted)' }}
      >
        1. Open your wallet extension and switch to a different account<br />
        2. Come back here and click <strong style={{ color: 'var(--color-text)' }}>Sign to link</strong>
      </div>

      {/* Active wallet display */}
      {address && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs" style={{ color: 'var(--color-dim)' }}>Active wallet</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: isAddressChanged ? 'var(--color-accent)' : 'var(--color-muted)' }}>
              {address.slice(0, 8)}...{address.slice(-6)}
            </span>
            {isAddressChanged && (
              <span
                className="px-1.5 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: 'rgba(132, 226, 150, 0.12)', color: 'var(--color-accent)' }}
              >
                New
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <ConnectButton />
      </div>

      {errorMessage && (
        <div
          className="px-3 py-2 rounded-md mb-4 text-xs"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-error)' }}
        >
          {errorMessage}
        </div>
      )}

      {isAddressChanged && (
        <button
          onClick={onSign}
          disabled={isBusy}
          className="w-full py-2.5 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'rgba(132, 226, 150, 0.15)',
            border: '1px solid rgba(132, 226, 150, 0.3)',
            color: 'var(--color-accent)',
            opacity: isBusy ? 0.7 : 1,
          }}
        >
          {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
          {signingState === 'signing' ? 'Sign in wallet...' :
           signingState === 'submitting' ? 'Linking wallet...' :
           'Sign to link'}
        </button>
      )}
    </motion.div>
  );
}

// ─── useProfileModal Hook ─────────────────────────────────────────────────────

export interface ProfileModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
  profileId: string | null;
  onProfileCreated: (id: string) => void;
}

export function useProfileModal(): ProfileModalState {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const checkedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      checkedRef.current = null;
      return;
    }

    // Don't re-check the same address
    if (checkedRef.current === address.toLowerCase()) return;
    checkedRef.current = address.toLowerCase();

    fetch(`/api/profile?address=${address}`)
      .then(res => {
        if (res.status === 404) {
          setOpen(true);
        } else if (res.ok) {
          return res.json().then(data => setProfileId(data.profile.id));
        }
      })
      .catch(() => {
        // Silently ignore network errors for modal auto-trigger
      });
  }, [address, isConnected]);

  const onProfileCreated = useCallback((id: string) => {
    setProfileId(id);
  }, []);

  return { open, setOpen, profileId, onProfileCreated };
}
