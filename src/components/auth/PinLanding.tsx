import React, { useState, useRef, useEffect } from 'react';
import { Lock, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function PinLanding() {
  const { attemptLogin, error } = useAuth();
  const [pin, setPin] = useState(['', '', '', '']);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus primer input al montar
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Efecto shake cuando hay error
  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir digitos
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-avanzar al siguiente input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Si se completaron los 4 digitos, intentar login
    if (value && index === 3) {
      const fullPin = newPin.join('');
      const success = attemptLogin(fullPin);
      if (!success) {
        // Limpiar inputs en error
        setTimeout(() => {
          setPin(['', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace: borrar y retroceder
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d{1,4}$/.test(pastedData)) {
      const newPin = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setPin(newPin);

      if (pastedData.length === 4) {
        const success = attemptLogin(pastedData);
        if (!success) {
          setTimeout(() => {
            setPin(['', '', '', '']);
            inputRefs.current[0]?.focus();
          }, 500);
        }
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen-safe bg-background-primary flex flex-col items-center justify-center px-6">
      {/* Logo/Branding */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
          <Zap size={32} className="text-primary-500" />
        </div>
        <h1 className="text-title font-bold text-foreground">
          Tarifa
        </h1>
        <p className="text-body-sm text-neutral-500 mt-1">
          Precios de electricidad en tiempo real
        </p>
      </div>

      {/* Card de PIN */}
      <div className="card-base p-8 w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="p-3 bg-neutral-100 rounded-full">
            <Lock size={24} className="text-neutral-600" />
          </div>
        </div>

        <h2 className="text-subtitle font-semibold text-center text-foreground mb-2">
          Introduce tu PIN
        </h2>
        <p className="text-body-sm text-neutral-500 text-center mb-6">
          Ingresa el codigo de 4 digitos para acceder
        </p>

        {/* Inputs de PIN */}
        <div
          className={cn(
            "flex justify-center gap-3 mb-6",
            shake && "animate-shake"
          )}
          onPaste={handlePaste}
        >
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "w-14 h-14 text-center text-title font-bold",
                "border-2 rounded-xl bg-background-surface",
                "focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none",
                "transition-all duration-200",
                error
                  ? "border-semantic-danger"
                  : digit
                    ? "border-primary-500"
                    : "border-neutral-200"
              )}
            />
          ))}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-semantic-danger mb-4">
            <AlertCircle size={16} />
            <span className="text-body-sm">{error}</span>
          </div>
        )}

        {/* Texto de ayuda */}
        <p className="text-caption text-neutral-400 text-center">
          Contacta al administrador si olvidaste el PIN
        </p>
      </div>
    </div>
  );
}
