'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ProfileSetupModal, useProfileModal } from './ProfileSetupModal';

/**
 * ProfileGate — sits inside Providers, above every page.
 * Triggers the mandatory sign-up modal on any page except "/" whenever
 * a wallet is connected but has no associated profile.
 *
 * Also listens for the "open-add-wallet-modal" custom event so any component
 * can trigger the add-wallet flow without prop-drilling.
 */
export function ProfileGate() {
  const pathname = usePathname();
  const profileModal = useProfileModal();

  // Listen for the add-wallet trigger from any child component
  useEffect(() => {
    const handler = () => profileModal.setOpen(true);
    window.addEventListener('open-add-wallet-modal', handler);
    return () => window.removeEventListener('open-add-wallet-modal', handler);
  }, [profileModal]);

  // Don't block the landing page
  if (pathname === '/') return null;

  return (
    <ProfileSetupModal
      open={profileModal.open}
      onClose={() => profileModal.setOpen(false)}
      allowDismiss={!!profileModal.profileId}
      profileId={profileModal.profileId}
      onProfileCreated={profileModal.onProfileCreated}
    />
  );
}

/** Call this from any component to open the add-wallet flow */
export function openAddWalletModal() {
  window.dispatchEvent(new Event('open-add-wallet-modal'));
}
