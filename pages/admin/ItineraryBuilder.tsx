import React from 'react';
import { ItineraryProvider } from '../../components/itinerary/ItineraryContext';
import { ItineraryWizard } from '../../components/itinerary/ItineraryWizard';

export const ItineraryBuilder: React.FC = () => {
    return (
        <ItineraryProvider>
            <ItineraryWizard />
        </ItineraryProvider>
    );
};