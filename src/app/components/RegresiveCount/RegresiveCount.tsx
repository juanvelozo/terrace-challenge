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
        const onFinishRef = useRef(onFinish);

        // Mantener la referencia actualizada de onFinish
        useEffect(() => {
            onFinishRef.current = onFinish;
        }, [onFinish]);

        const clearTimers = useCallback(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }, []);

        const startCountdown = useCallback(() => {
            clearTimers();
            setSeconds(duration);
            setIsExecuting(false);
            setIsPaused(false);

            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    const nextValue = prev - 1;
                    if (nextValue <= 0) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        return 0;
                    }
                    return nextValue;
                });
            }, 1000);
        }, [duration, clearTimers]);

        const reset = useCallback(() => {
            startCountdown();
        }, [startCountdown]);

        const pause = useCallback(() => {
            clearTimers();
            setIsPaused(true);
        }, [clearTimers]);

        const resume = useCallback(() => {
            if (!isPaused) return;
            setIsPaused(false);

            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    const nextValue = prev - 1;
                    if (nextValue <= 0) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        return 0;
                    }
                    return nextValue;
                });
            }, 1000);
        }, [isPaused]);

        // Exponer los métodos
        useImperativeHandle(ref, () => ({
            reset,
            pause,
            resume,
        }), [reset, pause, resume]);

        // Ejecutar onFinish DESPUÉS de mostrar el 100% por 1 segundo
        useEffect(() => {
            if (seconds === 0 && !isExecuting && !isPaused) {
                timeoutRef.current = setTimeout(async () => {
                    setIsExecuting(true);
                    try {
                        await onFinishRef.current();
                    } catch (error) {
                        console.error('Error en onFinish:', error);
                    } finally {
                        setIsExecuting(false);
                        startCountdown();
                    }
                }, 1000);
            }

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            };
        }, [seconds, isExecuting, isPaused, startCountdown]);

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
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

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
