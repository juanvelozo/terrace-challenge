import React from 'react'
import { ResponseTimeProps } from './types';
import { Chip } from "@heroui/chip";

export const ResponseTime: React.FC<ResponseTimeProps> = ({ responseTime }) => {
    return (
        <Chip color="success" variant="solid">
            <span className="text-sm text-white font-medium 700 ">
                Tiempo de respuesta:
            </span>
            <span className="text-lg font-bold text-green-800 ">
                {" " + responseTime}ms
            </span>
        </Chip>

    )
}