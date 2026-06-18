import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function FeatureCard({ icon, title, description, path, index }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(path)}
      className="bg-white rounded-2xl p-6 border border-gray-100 cursor-pointer shadow-sm hover:shadow-lg hover:border-[#0099FF]/30 transition-all duration-300"
    >
      <div className="w-12 h-12 bg-[#0099FF]/10 rounded-xl flex items-center justify-center mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </motion.div>
  );
}
