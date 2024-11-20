import React, { useEffect } from 'react';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';

const AirtableImport: React.FC<{ setResearch: React.Dispatch<React.SetStateAction<any[]>> }> = ({ setResearch }) => {
    const authenticatedFetch = useAuthenticatedFetch();

    const importResearch = async () => {
        try {
            const response = await authenticatedFetch('/api/import-research', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch research data');
            }

            const data = await response.json();
            setResearch(data);
        } catch (error) {
            console.error('Error importing research:', error);
        }
    };

    useEffect(() => {
        // importResearch();
    }, []);

    return null; // This component does not render anything
};

export default AirtableImport; 