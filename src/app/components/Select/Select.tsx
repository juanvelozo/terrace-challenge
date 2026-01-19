"use client";
import { Select, SelectItem } from "@heroui/react";

/**
 * Componente Select genérico y type-safe con autocomplete
 */
export function SelectComponent<T extends object>(props: {
    data: T[];
    keyProperty: keyof T;
    primaryTextKey: keyof T;
    secondaryTextKey?: keyof T;
    label?: string;
    placeholder?: string;
    className?: string;
    onSelectionChange?: (key: string | number) => void;
}) {
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