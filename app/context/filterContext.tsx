import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Filters {
    location: string;
    gender: string | null;
    ageRange: [number, number];
    distance: number;
}

interface FilterContextProps {
    filters: Filters;
    setFilters: (filters: Filters) => void;
    resetFilters: () => void;
}

const defaultFilters: Filters = {
    location: '',
    gender: '',
    ageRange: [18, 30],
    distance: 50,
};

const FilterContext = createContext<FilterContextProps | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
    const [filters, setFilters] = useState<Filters>(defaultFilters);

    const resetFilters = () => setFilters(defaultFilters);

    return (
        <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
};
