'use client';

import { useState } from 'react';
import { X, CreditCard, Check, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/api/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { user, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar si el usuario está autenticado
    if (!user) {
      alert('Debes iniciar sesión para poder adquirir el plan Premium. Por favor, inicia sesión primero.');
      onClose();
      return;
    }

    if (!supabase) {
      alert('El servicio de autenticación no está disponible. Por favor verifica la configuración.');
      return;
    }

    setLoading(true);

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Actualizar el plan del usuario a premium
      const { error } = await supabase
        .from('users')
        .update({
          subscription_plan_id: 2, // ID del plan premium
          is_premium: true,
          subscription_status: 'active',
          subscription_date: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccess(true);
      await refreshUserData();

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error al actualizar el plan:', error);
      alert('Hubo un error al procesar tu suscripción. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a Premium!</h2>
          <p className="text-gray-400">Tu suscripción ha sido activada exitosamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upgrade a Premium</h2>
              <p className="text-sm text-gray-400">$9.99/mes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">Incluye:</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Asistente AI ilimitado</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Extensiones premium</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Plantillas profesionales</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Soporte prioritario</span>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Número de tarjeta</label>
            <div className="relative">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                maxLength={19}
                className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                required
              />
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre en la tarjeta</label>
            <input
              type="text"
              placeholder="Juan Pérez"
              value={formData.cardName}
              onChange={e => setFormData({ ...formData, cardName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de venc.</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                maxLength={5}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={e => setFormData({ ...formData, cvv: e.target.value })}
                maxLength={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Confirmar pago'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Esta es una simulación. No se procesarán pagos reales.
          </p>
        </form>
      </div>
    </div>
  );
}
