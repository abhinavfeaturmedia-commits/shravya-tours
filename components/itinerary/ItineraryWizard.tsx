import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useItinerary } from './ItineraryContext';
import { useData } from '../../context/DataContext';
import { StepTripDetails } from './steps/StepTripDetails';
import { StepDayPlanner } from './steps/StepDayPlanner';
import { StepPricing } from './steps/StepPricing';
import { StepReview } from './steps/StepReview';
import { gsap } from 'gsap';
import { Check, Map, Calendar, FileCheck, Calculator } from 'lucide-react';

const WizardContent: React.FC = () => {
    const { step } = useItinerary();
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Animation when step changes
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 10, scale: 0.99 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
            );
        }
    }, [step]);

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col admin-page-bg font-sans">
            {/* Header & Steps */}
            <header className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm z-20 shrink-0">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
                        <div className="text-center md:text-left">
                            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Itinerary Builder</h1>
                            <p className="text-[10px] text-slate-500 font-medium hidden md:block mt-0.5">Create premium travel experiences</p>
                        </div>

                        {/* Progress Steps - 4 Steps */}
                        <div className="flex items-center gap-1 md:gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg scale-90 md:scale-100 origin-center">
                            <StepIndicator
                                number={1}
                                label="Details"
                                current={step}
                                icon={<Map size={12} />}
                            />
                            <div className={`w-2 md:w-4 h-0.5 rounded-full transition-colors duration-500 ${step > 1 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                            <StepIndicator
                                number={2}
                                label="Planner"
                                current={step}
                                icon={<Calendar size={12} />}
                            />
                            <div className={`w-2 md:w-4 h-0.5 rounded-full transition-colors duration-500 ${step > 2 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                            <StepIndicator
                                number={3}
                                label="Pricing"
                                current={step}
                                icon={<Calculator size={12} />}
                            />
                            <div className={`w-2 md:w-4 h-0.5 rounded-full transition-colors duration-500 ${step > 3 ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                            <StepIndicator
                                number={4}
                                label="Review"
                                current={step}
                                icon={<FileCheck size={12} />}
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Step Content */}
            <div ref={containerRef} className="flex-1 overflow-hidden relative bg-slate-100 dark:bg-slate-950">
                <div ref={contentRef} className="h-full w-full">
                    {step === 1 && <StepTripDetails />}
                    {step === 2 && <StepDayPlanner />}
                    {step === 3 && <StepPricing />}
                    {step === 4 && <StepReview />}
                </div>
            </div>
        </div>
    );
};

const StepIndicator: React.FC<{
    number: number;
    label: string;
    current: number;
    icon: React.ReactNode
}> = ({ number, label, current, icon }) => {
    const isActive = current === number;
    const isCompleted = current > number;

    return (
        <div className={`
            flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg transition-all duration-300
            ${isActive
                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                : isCompleted
                    ? 'text-emerald-600'
                    : 'text-slate-400'}
        `}>
            <div className={`
                size-4 md:size-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                ${isActive ? 'bg-indigo-600 text-white' : ''}
                ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                ${!isActive && !isCompleted ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : ''}
            `}>
                {isCompleted ? <Check size={10} strokeWidth={3} /> : icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'block' : 'hidden'} md:block`}>
                {label}
            </span>
        </div>
    );
};

export const ItineraryWizard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { packages } = useData();
    const { loadPackage } = useItinerary();
    const [isLoaded, setIsLoaded] = React.useState(false);

    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId && !isLoaded) {
            const pkgToEdit = packages.find(p => p.id === editId);
            if (pkgToEdit) {
                loadPackage(pkgToEdit);
                // Remove the query param so refreshing doesn't overwrite any new edits
                // Optional: setSearchParams({});  
            }
            setIsLoaded(true);
        }
    }, [searchParams, packages, loadPackage, isLoaded, setSearchParams]);

    return (
        <WizardContent />
    );
};
