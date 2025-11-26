'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Crown } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';

export function PremiumButton() {
  const { user, userPlan } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);

  // Si el usuario no está autenticado, no mostrar el botón
  if (!user) return null;

  // Si el usuario ya tiene premium, mostrar indicador
  if (userPlan?.plan_name === 'premium') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/30">
        <Crown className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-medium text-amber-300">Premium</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowCheckout(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Crown className="w-4 h-4 text-white" />
        <span className="text-xs font-semibold text-white">Upgrade a Premium</span>
      </button>
      
      {showCheckout && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
}
