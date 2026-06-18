import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import AnimatedBusRoute from '../../components/AnimatedBusRoute';
import AddBusForm from './bus/AddBusForm';
import AllBuses from './bus/AllBuses';
import DeleteBusForm from './bus/DeleteBusForm';

export default function ManageBuses() {
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      <AnimatedBusRoute />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Buses</h1>
        <p className="text-gray-500">Add, view, and remove buses — changes sync to Route Planner and Track Bus</p>
      </motion.div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <TabBtn active={activeTab === 'add'} onClick={() => setActiveTab('add')} label="Add Bus" />
        <TabBtn active={activeTab === 'list'} onClick={() => setActiveTab('list')} label="All Buses" />
        <TabBtn active={activeTab === 'delete'} onClick={() => setActiveTab('delete')} label="Delete Bus" />
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
        {activeTab === 'add' && <AddBusForm />}
        {activeTab === 'list' && <AllBuses />}
        {activeTab === 'delete' && <DeleteBusForm />}
      </motion.div>
    </div>
  );
}

function TabBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-[#0099FF] text-[#0099FF]' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}
