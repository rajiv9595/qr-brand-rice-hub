
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [compareIds, setCompareIds] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const toggleCompare = (id) => {
        setCompareIds(prevIds => {
            if (prevIds.includes(id)) {
                return prevIds.filter(i => i !== id);
            } else {
                return prevIds.length < 3 ? [...prevIds, id] : prevIds;
            }
        });
    };

    const clearCompare = () => setCompareIds([]);

    return (
        <AppContext.Provider value={{
            compareIds,
            toggleCompare,
            clearCompare,
            selectedCategory,
            setSelectedCategory
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppStore = () => useContext(AppContext);
