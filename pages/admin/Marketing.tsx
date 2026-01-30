
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Campaign } from '../../types';

export const Marketing: React.FC = () => {
  const { campaigns, addCampaign } = useData();
  const [activeTab, setActiveTab] = useState<'Campaigns' | 'Templates' | 'Subscribers'>('Campaigns');
  
  // New Campaign Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({ name: '', type: 'Email', audience: 'Leads' });

  const handleCreate = () => {
      if(!newCampaign.name) return;
      addCampaign({
          id: `CMP-${Date.now()}`,
          name: newCampaign.name!,
          type: newCampaign.type as any,
          audience: newCampaign.audience as any,
          status: 'Scheduled',
          metrics: { sent: 0, opened: 0, clicked: 0 }
      });
      setIsModalOpen(false);
      setNewCampaign({ name: '', type: 'Email', audience: 'Leads' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="p-6 md:p-8 bg-white dark:bg-[#1A2633] border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Marketing Hub</h1>
                <p className="text-slate-500 mt-1">Manage Email & WhatsApp campaigns to boost engagement.</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95 transition-all">
                <span className="material-symbols-outlined">add</span> Create Campaign
            </button>
        </div>
        
        <div className="flex items-center gap-1 mt-6 border-b border-slate-100 dark:border-slate-800">
            {['Campaigns', 'Templates', 'Subscribers'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {activeTab === 'Campaigns' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {campaigns.map(camp => (
                    <div key={camp.id} className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${camp.type === 'WhatsApp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{camp.type}</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{camp.name}</h3>
                                <p className="text-xs text-slate-500">Target: {camp.audience}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${camp.status === 'Sent' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-700'}`}>{camp.status}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-center">
                                <p className="text-xl font-black text-slate-900 dark:text-white">{camp.metrics.sent}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Sent</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-slate-900 dark:text-white">{camp.metrics.opened}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Opened</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-slate-900 dark:text-white">{camp.metrics.clicked}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Clicked</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'Templates' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="bg-white dark:bg-[#1A2633] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                        <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-slate-300">image</span>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-slate-900 dark:text-white">Holiday Promo Template {i}</h4>
                            <p className="text-xs text-slate-500 mt-1">Last edited 2 days ago</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-[#1A2633] p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Create Campaign</h3>
                  <div className="space-y-4">
                      <input placeholder="Campaign Name" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} />
                      <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl" value={newCampaign.type} onChange={e => setNewCampaign({...newCampaign, type: e.target.value as any})}>
                          <option>Email</option>
                          <option>WhatsApp</option>
                      </select>
                      <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl" value={newCampaign.audience} onChange={e => setNewCampaign({...newCampaign, audience: e.target.value as any})}>
                          <option>Leads</option>
                          <option>Customers</option>
                          <option>Agents</option>
                      </select>
                      <button onClick={handleCreate} className="w-full bg-primary text-white py-3 rounded-xl font-bold">Create Draft</button>
                      <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-500 py-2">Cancel</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
