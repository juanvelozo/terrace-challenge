"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { CircularProgress } from "@heroui/react";

interface RegresiveCountProps {
    onFinish: () => void | Promise<void>;
    duration?: number; // Duración en segundos
    loadingLabel?: string; // Texto a mostrar durante la actualización
}

export interface RegresiveCountRef {
    reset: () => void;
    pause: () => void;
    resume: () => void;
}

export const RegresiveCount = forwardRef<RegresiveCountRef, RegresiveCountProps>(
    ({ onFinish, duration = 3, loadingLabel = "Actualizando..." }, ref) => {
        const [seconds, setSeconds] = useState(duration);
        const [isExecuting, setIsExecuting] = useState(false);
        const [isPaused, setIsPaused] = useState(false);
        const intervalRef = useRef<NodeJS.Timeout | null>(null);
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);

        const startCountdown = useCallback(() => {
            setSeconds(duration);
            setIsExecuting(false);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    if (prev <= 1) {
                        // Detener el interval al llegar a 0
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000); // Actualizar cada segundo
        }, [duration]);

        const reset = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            setIsPaused(false);
            startCountdown();
        };

        const pause = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setIsPaused(true);
        };

        const resume = () => {
            if (!isPaused) return;
            setIsPaused(false);

            // Continuar desde donde quedó
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    if (prev <= 1) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        // Exponer los métodos
        useImperativeHandle(ref, () => ({
            reset,
            pause,
            resume,
        }));

        // Ejecutar onFinish DESPUÉS de mostrar el 100% por 1 segundo
        useEffect(() => {
            if (seconds === 0 && !isExecuting) {
                // Esperar 1 segundo antes de ejecutar onFinish
                timeoutRef.current = setTimeout(() => {
                    setIsExecuting(true);

                    const executeFinish = async () => {
                        try {
                            await onFinish();
                        } catch (error) {
                            console.error('Error en onFinish:', error);
                        } finally {
                            // Reiniciar después de ejecutar
                            startCountdown();
                        }
                    };

                    executeFinish();
                }, 1000); // Esperar 1 segundo mostrando el 100%
            }
        }, [seconds, isExecuting, onFinish, startCountdown]);

        // Iniciar countdown al montar
        useEffect(() => {
            startCountdown();

            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, [startCountdown]);

        // Calcular el porcentaje discreto
        // duration=3: 3s=0%, 2s=33%, 1s=66%, 0s=100%
        const progress = ((duration - seconds) / duration) * 100;
        const displaySeconds = seconds;

        return (
            <div className="flex items-center gap-2">
                <span className='text-sm text-zinc-500 dark:text-zinc-400'>Actualizando en: </span>
                <CircularProgress
                    aria-label="Cuenta regresiva"
                    size="md"
                    value={progress}
                    color="primary"
                    showValueLabel={true}
                    valueLabel={
                        isExecuting ? (
                            <span className="text-xs">{loadingLabel}</span>
                        ) : (
                            <span className="text-sm font-semibold">{displaySeconds}s</span>
                        )
                    }
                    classNames={{
                        value: "text-xs",
                    }}
                />
            </div>
        );
    }
);

RegresiveCount.displayName = "RegresiveCount";
