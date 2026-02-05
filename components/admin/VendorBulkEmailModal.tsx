import React, { useState } from 'react';
import { toast } from 'sonner';

interface VendorBulkEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedVendorCount: number;
    onSend: (subject: string, message: string) => void;
}

export const VendorBulkEmailModal: React.FC<VendorBulkEmailModalProps> = ({ isOpen, onClose, selectedVendorCount, onSend }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(subject, message);
        toast.success(`Email queued for ${selectedVendorCount} vendors`);
        setSubject('');
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-[#1A2633] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Broadcast Message</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase mt-1">Recipients: {selectedVendorCount} Vendors</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Subject</label>
                        <input
                            required
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="e.g. Special Rate Request for December"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500">Message</label>
                        <textarea
                            required
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary h-40 resize-none"
                            placeholder="Dear Partner, ..."
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">send</span> Send Broadcast
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
