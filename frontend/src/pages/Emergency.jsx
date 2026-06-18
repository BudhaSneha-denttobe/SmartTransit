import { motion } from 'framer-motion';
import AnimatedBusRoute from '../components/AnimatedBusRoute';

export default function Emergency() {
  const contacts = [
    { name: 'Police', number: '100', icon: '👮', color: 'from-blue-500 to-blue-700' },
    { name: 'Fire Department', number: '101', icon: '🚒', color: 'from-red-500 to-red-700' },
    { name: 'Ambulance', number: '108', icon: '🚑', color: 'from-red-500 to-orange-600' },
    { name: 'Women Helpline', number: '1091', icon: '👩', color: 'from-pink-500 to-pink-700' },
    { name: 'Child Helpline', number: '1098', icon: '🧒', color: 'from-green-500 to-green-700' },
    { name: 'Disaster Management', number: '1078', icon: '🆘', color: 'from-yellow-500 to-yellow-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AnimatedBusRoute />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Emergency Services</h1>
        <p className="text-gray-500">Quick access to emergency contacts and services</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {contacts.map((contact, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 text-center group cursor-pointer shadow-sm hover:shadow-lg hover:border-red-300 transition-all"
            onClick={() => window.open(`tel:${contact.number}`)}
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${contact.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
            >
              {contact.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{contact.name}</h3>
            <p className="text-3xl font-bold text-gray-800">{contact.number}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🚑 SOS Emergency</h3>
          <p className="text-gray-500 text-sm mb-4">
            In case of emergency, press the SOS button to send an alert with your location.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-500/30"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    alert(
                      `SOS Alert Sent!\nLocation: ${pos.coords.latitude}, ${pos.coords.longitude}`
                    );
                  },
                  () => {
                    alert('SOS Alert Sent! (Location unavailable)');
                  }
                );
              } else {
                alert('SOS Alert Sent!');
              }
            }}
          >
            🆘 SOS - Emergency Alert
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏥 Nearby Services</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <h4 className="text-gray-800 font-medium">Hospitals</h4>
                  <p className="text-gray-500 text-xs">Search for nearby hospitals on the map</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👮</span>
                <div>
                  <h4 className="text-gray-800 font-medium">Police Stations</h4>
                  <p className="text-gray-500 text-xs">Find nearby police stations quickly</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <h4 className="text-gray-800 font-medium">Transit Helpline</h4>
                  <p className="text-gray-500 text-xs">Call 1800-XXX-XXXX for transit assistance</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
