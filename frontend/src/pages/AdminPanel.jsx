import React from 'react';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Admin Dashboard</h1>
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700 p-4 rounded text-center">
              <div className="text-3xl font-bold">1,402</div>
              <div className="text-gray-400 text-sm">Total Players</div>
            </div>
            <div className="bg-slate-700 p-4 rounded text-center">
              <div className="text-3xl font-bold text-green-400">Active</div>
              <div className="text-gray-400 text-sm">Server Status</div>
            </div>
            <div className="bg-slate-700 p-4 rounded text-center">
              <div className="text-3xl font-bold text-blue-400">2</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-red-900/20 border border-red-900 rounded">
            <h3 className="font-bold text-red-400">Restricted Actions</h3>
            <p className="text-sm text-gray-400 mt-2">
                Only accounts with role: <code>'admin'</code> can view this page. Regular users are redirected to the draft simulator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;