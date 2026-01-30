import React from 'react';
import { SEO } from '../components/ui/SEO';
import { OptimizedImage } from '../components/ui/OptimizedImage';

export const About: React.FC = () => {
    return (
        <>
            <SEO
                title="About Us"
                description="Learn about Shravya Tours - your trusted travel partner since 2015. We craft personalized travel experiences with 24/7 support and best price guarantee."
            />

            <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
                {/* Hero */}
                <div className="relative h-[400px] flex items-center justify-center text-center px-4">
                    <div className="absolute inset-0 bg-slate-900">
                        <OptimizedImage
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARvjLJnqBIV09joV5MO4NCFRzmlZ-bbKPc1eoo9A-7TudM37NfT7pwyGWL8SKJsQz3haG3HdOgcYWr0HVXVNhbu-XiaBbvV4rMCx3NcCaiO_eQ9LFJTA69YLnPbsJXp1whEaBMmP7FgfhDhOwfAv7ROqrGj1TfqED1pPb7-eTzxh__HuN-lLTZS3TO3mcaIG5lzHVZPM1aXZvTKyaczGqk0y5JxmYFFC_g3Cd0BZqrPEKe1q-DM-6kkxWzTfUU1rbC62qVacapPJrT"
                            alt="About Shravya Tours"
                            className="w-full h-full opacity-40"
                        />
                    </div>
                    <div className="relative z-10 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6">We Craft Memories, Not Just Trips.</h1>
                        <p className="text-lg md:text-xl text-slate-200">Shravya Tours is dedicated to making every journey an unforgettable story.</p>
                    </div>
                </div>

                <div className="container mx-auto px-6 -mt-20 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Passionate Experts', icon: 'favorite', text: 'Our team consists of travel enthusiasts who have explored the corners of the globe to bring you the best.' },
                            { title: '24/7 Support', icon: 'support_agent', text: 'We are with you at every step. From the moment you book until you return home safely.' },
                            { title: 'Best Price Guarantee', icon: 'savings', text: 'We partner directly with hotels and operators to ensure you get premium experiences at the best rates.' }
                        ].map((card, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 text-center">
                                <div className="size-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                    <span className="material-symbols-outlined text-4xl">{card.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{card.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{card.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Our Story</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                Founded in 2015, Shravya Tours started with a simple mission: to make travel accessible, personalized, and stress-free. What began as a small family-run agency has grown into a premier travel partner for thousands of explorers.
                            </p>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                We believe that travel is the best education. Whether it's a spiritual journey through the temples of India, a relaxing beach vacation in Bali, or an adventurous trek in the Himalayas, we curate every detail to suit your unique style.
                            </p>
                        </div>
                        <div className="flex-1">
                            <OptimizedImage
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuATmrejY5wv4HJwrrT-XOL_k-4PmnUHmnh4tjjQVt_Jw-Yo2zwDrK0qkbFaSFg2oZ4QPuHofCwI5g76BzH8C2PVia4SwkhV7mSizKnFAVWvJ3o-g1OEwmLpMGLVQxjM3imAoioqwI2CrsaGtpVfFii-U7u-sNV--nk7myLX0TMF7KyKkBsLBWBkFkLJdw0Iuddd42GzNf0skyKiejwy7EFQmDIf8GfhitO7eqMnXD1t5P3BqowcJBiS0Flc1nMXXumi-gqaajd5JSWt"
                                alt="Our Story"
                                className="rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};