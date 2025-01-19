import React from 'react';
import { Text } from 'react-native';
import { getDisplayAge } from '@/utils/dateUtils';

type AgeDisplayProps = {
    age: number | null;
    birthDate: string | null;
    style?: any;
};

export const AgeDisplay = ({ age, birthDate, style }: AgeDisplayProps) => {
    const displayAge = getDisplayAge(age, birthDate);

    return (
        <Text style={style}>
            {displayAge !== null ? `${displayAge} years old` : 'Age not available'}
        </Text>
    );
};
