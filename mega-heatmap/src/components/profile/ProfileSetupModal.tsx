'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAddress } from 'viem';
import { X, Loader2, Link2, ArrowLeft } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'details' | 'sign' | 'add-wallet';

interface ProfileSetupModalProps {
  open: boolean;
  onClose: () => void;
  /** false = mandatory sign-up flow (no X, can't dismiss) */
  allowDismiss?: boolean;
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

// ─── ProfileSetupModal ────────────────────────────────────────────────────────

export function ProfileSetupModal({
  open,
  onClose,
  allowDismiss = false,
  profileId: initialProfileId,
  onProfileCreated,
}: ProfileSetupModalProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [step, setStep] = useState<Step>('details');
  const [profileId, setProfileId] = useState<string | null>(initialProfileId);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [twitter, setTwitter] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');

  // Signing state
  const [signingState, setSigningState] = useState<'idle' | 'signing' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // For add-wallet step: track the address that was linked
  const linkedAddressRef = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      const isAddWallet = !!initialProfileId;
      setStep(isAddWallet ? 'add-wallet' : 'details');
      setProfileId(initialProfileId);
      setDisplayName('');
      setTwitter('');
      setDisplayNameError('');
      setSigningState('idle');
      setErrorMessage(null);
      linkedAddressRef.current = address?.toLowerCase() ?? null;
    }
  }, [open, initialProfileId, address]);

  useEffect(() => {
    if (initialProfileId) setProfileId(initialProfileId);
  }, [initialProfileId]);

  // Suppress Escape key on mandatory modal
  useEffect(() => {
    if (!open || allowDismiss) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.stopImmediatePropagation();
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [open, allowDismiss]);

  const handleContinue = () => {
    if (!displayName.trim()) {
      setDisplayNameError('Display name is required');
      return;
    }
    setDisplayNameError('');
    setStep('sign');
  };

  const handleCreateProfile = useCallback(async () => {
    if (!address) return;
    setSigningState('signing');
    setErrorMessage(null);

    const newProfileId = profileId ?? crypto.randomUUID();
    let checksumAddress: string;
    try { checksumAddress = getAddress(address); } catch { checksumAddress = address; }

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
          displayName: displayName.trim(),
          twitter: twitter.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      setProfileId(newProfileId);
      onProfileCreated(newProfileId);
      setSigningState('idle');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create profile';
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setSigningState('idle');
      } else {
        setErrorMessage(msg);
        setSigningState('error');
      }
    }
  }, [address, profileId, displayName, twitter, signMessageAsync, onProfileCreated, onClose]);

  const handleAddWallet = useCallback(async () => {
    if (!address || !profileId) return;
    setSigningState('signing');
    setErrorMessage(null);

    let checksumAddress: string;
    try { checksumAddress = getAddress(address); } catch { checksumAddress = address; }

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

      setSigningState('idle');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to link wallet';
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        setSigningState('idle');
      } else {
        setErrorMessage(msg);
        setSigningState('error');
      }
    }
  }, [address, profileId, signMessageAsync, onClose]);

  if (!open) return null;

  const isBusy = signingState === 'signing' || signingState === 'submitting';

  const isAddressChanged =
    step === 'add-wallet' &&
    address &&
    linkedAddressRef.current !== null &&
    address.toLowerCase() !== linkedAddressRef.current;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — blocks interaction, never closes if mandatory */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: 'rgba(10, 9, 9, 0.85)', backdropFilter: 'blur(6px)' }}
            onClick={allowDismiss ? onClose : undefined}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="card w-full max-w-md pointer-events-auto relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button — only shown when dismissible */}
              {allowDismiss && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-md transition-colors hover:bg-[rgba(174,164,191,0.08)] z-10"
                  style={{ color: 'var(--color-dim)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <AnimatePresence mode="wait">
                {step === 'details' && (
                  <StepDetails
                    key="details"
                    displayName={displayName}
                    twitter={twitter}
                    displayNameError={displayNameError}
                    onDisplayNameChange={v => { setDisplayName(v); if (v.trim()) setDisplayNameError(''); }}
                    onTwitterChange={setTwitter}
                    onContinue={handleContinue}
                    address={address}
                  />
                )}

                {step === 'sign' && (
                  <StepSign
                    key="sign"
                    address={address}
                    displayName={displayName}
                    isBusy={isBusy}
                    signingState={signingState}
                    errorMessage={errorMessage}
                    onBack={() => setStep('details')}
                    onSign={handleCreateProfile}
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

// ─── Step 1: Details ──────────────────────────────────────────────────────────

function StepDetails({
  displayName,
  twitter,
  displayNameError,
  onDisplayNameChange,
  onTwitterChange,
  onContinue,
  address,
}: {
  displayName: string;
  twitter: string;
  displayNameError: string;
  onDisplayNameChange: (v: string) => void;
  onTwitterChange: (v: string) => void;
  onContinue: () => void;
  address?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.18 }}
      className="p-6"
    >
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Create your profile
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-dim)' }}>
          Set up your identity for the Bunny Intel leaderboard.
        </p>
      </div>

      {address && (
        <div
          className="px-3 py-2 rounded-md mb-5 font-mono text-xs"
          style={{ backgroundColor: 'rgba(174, 164, 191, 0.06)', border: '1px solid rgba(174, 164, 191, 0.1)', color: 'var(--color-muted)' }}
        >
          {address.slice(0, 10)}...{address.slice(-8)}
        </div>
      )}

      <div className="space-y-4">
        {/* Display name */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
            Display name <span style={{ color: 'var(--color-accent)' }}>*</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => onDisplayNameChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onContinue(); }}
            placeholder="Your name on the leaderboard"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'rgba(174, 164, 191, 0.06)',
              border: displayNameError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(174, 164, 191, 0.15)',
              color: 'var(--color-text)',
            }}
            autoFocus
          />
          {displayNameError && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{displayNameError}</p>
          )}
        </div>

        {/* Twitter */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-muted)' }}>
            Twitter / X{' '}
            <span className="font-normal" style={{ color: 'var(--color-dim)' }}>optional</span>
          </label>
          <input
            type="text"
            value={twitter}
            onChange={e => onTwitterChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onContinue(); }}
            placeholder="@yourhandle"
            className="w-full px-3 py-2.5 rounded-md text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'rgba(174, 164, 191, 0.06)',
              border: '1px solid rgba(174, 164, 191, 0.15)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full mt-6 py-2.5 rounded-md font-medium text-sm transition-all"
        style={{
          backgroundColor: 'rgba(132, 226, 150, 0.15)',
          border: '1px solid rgba(132, 226, 150, 0.3)',
          color: 'var(--color-accent)',
        }}
      >
        Continue
      </button>
    </motion.div>
  );
}

// ─── Step 2: Sign ─────────────────────────────────────────────────────────────

function StepSign({
  address,
  displayName,
  isBusy,
  signingState,
  errorMessage,
  onBack,
  onSign,
}: {
  address?: string;
  displayName: string;
  isBusy: boolean;
  signingState: string;
  errorMessage: string | null;
  onBack: () => void;
  onSign: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.18 }}
      className="p-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs mb-5 transition-colors"
        style={{ color: 'var(--color-dim)' }}
        disabled={isBusy}
      >
        <ArrowLeft className="w-3 h-3" />
        Back
      </button>

      <div className="mb-5">
        <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          Sign to confirm
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-dim)' }}>
          Your wallet will sign a message — no gas, no transaction.
        </p>
      </div>

      {/* Signing summary card */}
      <div
        className="rounded-md p-4 mb-5 space-y-2.5 text-sm"
        style={{ backgroundColor: 'rgba(174, 164, 191, 0.04)', border: '1px solid rgba(174, 164, 191, 0.1)' }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: 'var(--color-dim)' }}>Action</span>
          <span style={{ color: 'var(--color-muted)' }}>Linking wallet to Bunny Intel profile</span>
        </div>
        {address && (
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--color-dim)' }}>Wallet</span>
            <span className="font-mono text-xs" style={{ color: 'var(--color-muted)' }}>
              {address.slice(0, 8)}...{address.slice(-6)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span style={{ color: 'var(--color-dim)' }}>Name</span>
          <span className="font-medium" style={{ color: 'var(--color-text)' }}>{displayName}</span>
        </div>
      </div>

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
        disabled={isBusy}
        className="w-full py-2.5 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2"
        style={{
          backgroundColor: isBusy ? 'rgba(132, 226, 150, 0.08)' : 'rgba(132, 226, 150, 0.15)',
          border: '1px solid rgba(132, 226, 150, 0.3)',
          color: 'var(--color-accent)',
          opacity: isBusy ? 0.7 : 1,
        }}
      >
        {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
        {signingState === 'signing' ? 'Waiting for signature...' :
         signingState === 'submitting' ? 'Creating profile...' :
         'Sign & Create Profile'}
      </button>
    </motion.div>
  );
}

// ─── Add Wallet Step (separate, dismissible) ──────────────────────────────────

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
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.18 }}
      className="p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'rgba(132, 226, 150, 0.1)', border: '1px solid rgba(132, 226, 150, 0.2)' }}
        >
          <Link2 className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Add another wallet</h2>
          <p className="text-xs" style={{ color: 'var(--color-dim)' }}>Switch to a different wallet, then sign</p>
        </div>
      </div>

      <div
        className="px-4 py-3 rounded-md mb-4 text-sm"
        style={{ backgroundColor: 'rgba(174, 164, 191, 0.04)', border: '1px solid rgba(174, 164, 191, 0.1)', color: 'var(--color-muted)' }}
      >
        1. Open your wallet and switch to a different account<br />
        2. Click <strong style={{ color: 'var(--color-text)' }}>Sign to link</strong> below
      </div>

      {address && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs" style={{ color: 'var(--color-dim)' }}>Active wallet</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: isAddressChanged ? 'var(--color-accent)' : 'var(--color-muted)' }}>
              {address.slice(0, 8)}...{address.slice(-6)}
            </span>
            {isAddressChanged && (
              <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(132,226,150,0.12)', color: 'var(--color-accent)' }}>
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
        <div className="px-3 py-2 rounded-md mb-4 text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--color-error)' }}>
          {errorMessage}
        </div>
      )}

      {isAddressChanged && (
        <button
          onClick={onSign}
          disabled={isBusy}
          className="w-full py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            backgroundColor: 'rgba(132, 226, 150, 0.15)',
            border: '1px solid rgba(132, 226, 150, 0.3)',
            color: 'var(--color-accent)',
            opacity: isBusy ? 0.7 : 1,
          }}
        >
          {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
          {signingState === 'signing' ? 'Sign in wallet...' :
           signingState === 'submitting' ? 'Linking...' :
           'Sign to link'}
        </button>
      )}
    </motion.div>
  );
}

// ─── useProfileModal Hook ─────────────────────────────────────────────────────

export interface ProfileData {
  id: string;
  primaryAddress: string;
  displayName: string | null;
  twitter: string | null;
  createdAt: number;
}

export interface ProfileModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
  profileId: string | null;
  profileData: ProfileData | null;
  onProfileCreated: (id: string) => void;
  refreshProfile: () => void;
}

export function useProfileModal(): ProfileModalState {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const checkedRef = useRef<string | null>(null);

  const fetchProfile = useCallback((addr: string) => {
    fetch(`/api/profile?address=${addr}`)
      .then(res => {
        if (res.status === 404) {
          setOpen(true);
          setProfileData(null);
        } else if (res.ok) {
          return res.json().then(data => {
            setProfileId(data.profile.id);
            setProfileData(data.profile);
          });
        }
      })
      .catch(() => {
        // Silently ignore — don't auto-open modal on network error
      });
  }, []);

  useEffect(() => {
    if (!isConnected || !address) {
      checkedRef.current = null;
      setProfileData(null);
      return;
    }

    if (checkedRef.current === address.toLowerCase()) return;
    checkedRef.current = address.toLowerCase();

    fetchProfile(address);
  }, [address, isConnected, fetchProfile]);

  const onProfileCreated = useCallback((id: string) => {
    setProfileId(id);
    // Re-fetch to populate profileData with display name/twitter
    if (address) fetchProfile(address);
  }, [address, fetchProfile]);

  const refreshProfile = useCallback(() => {
    if (address) {
      checkedRef.current = null;
      fetchProfile(address);
    }
  }, [address, fetchProfile]);

  return { open, setOpen, profileId, profileData, onProfileCreated, refreshProfile };
}
