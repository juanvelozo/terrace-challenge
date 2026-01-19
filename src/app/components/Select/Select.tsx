"use client";
import React from 'react';
import { Select, SelectItem } from "@heroui/react";

interface SelectComponentProps<T extends object> {
    data: T[];
    keyProperty: keyof T;
    primaryTextKey: keyof T;
    secondaryTextKey?: keyof T;
    label?: string;
    placeholder?: string;
    className?: string;
    onSelectionChange?: (key: string | number) => void;
}

/**
 * Componente Select genérico y type-safe con autocomplete
 * Memoizado para evitar re-renders innecesarios
 */
function SelectComponentInner<T extends object>(props: SelectComponentProps<T>) {
    const {
        data,
        keyProperty,
        primaryTextKey,
        secondaryTextKey,
        label = "Seleccionar",
        placeholder = "Selecciona una opción",
        className = "max-w-xs",
        onSelectionChange,
    } = props;
    return (
        <Select
            className={className}
            items={data}
            label={label}
            labelPlacement="outside"
            placeholder={placeholder}
            onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                if (key && onSelectionChange) {
                    onSelectionChange(key as string | number);
                }
            }}
        >
            {(item) => {
                // Obtener valores usando las claves especificadas
                const keyValue = item[keyProperty];
                const primaryText = item[primaryTextKey];
                const secondaryText = secondaryTextKey ? item[secondaryTextKey] : null;

                return (
                    <SelectItem
                        key={String(keyValue)}
                        textValue={String(primaryText)}

                    >
                        <div className="flex gap-2 items-center">
                            <div className="flex flex-col p-4">
                                <span className="text-small">{String(primaryText)}</span>
                                {secondaryText && (
                                    <span className="text-tiny text-default-400">
                                        {String(secondaryText)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </SelectItem>
                );
            }}
        </Select>
    );
}

export const SelectComponent = SelectComponentInner as <T extends object>(props: SelectComponentProps<T>) => React.ReactElement;