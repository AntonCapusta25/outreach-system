'use client';

import React, { useState } from 'react';
import { Users, Mail, Send, Plus } from 'lucide-react';

export default function Home() {
  const [test, setTest] = useState('Hello World');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Outreach Management System</h1>
              <p className="text-gray-600 mt-1">Test deployment - {test}</p>
            </div>
            <button 
              onClick={() => setTest('Working!')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Test Button
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p>If you see this, the basic setup is working! Now we can add the full component.</p>
        </div>
      </div>
    </div>
  );
}
