import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCrisisResources } from '../../services/safety';
import { AlertTriangle, Phone, MessageSquare, X } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  contact: string;
  url: string;
  description: string;
}

interface CrisisResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CrisisResourceModal: React.FC<CrisisResourceModalProps> = ({ isOpen, onClose }) => {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    if (isOpen) {
      getCrisisResources().then(res => setResources(res.data));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-slate-900 border border-red-500/50 rounded-lg p-6 max-w-lg w-full shadow-2xl shadow-red-500/20 relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6 text-red-500">
              <AlertTriangle size={32} />
              <h2 className="text-2xl font-bold">Crisis Resources</h2>
            </div>
            
            <p className="text-slate-300 mb-6">
              You are not alone. If you are going through a difficult time, please reach out to these free, confidential resources.
            </p>

            <div className="space-y-4">
              {resources.map(resource => (
                <div key={resource.id} className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-red-500/30 transition-colors">
                  <h3 className="font-bold text-white text-lg mb-1">{resource.name}</h3>
                  <p className="text-slate-400 text-sm mb-3">{resource.description}</p>
                  <div className="flex gap-3">
                    <a 
                      href={`tel:${resource.contact.replace(/\D/g,'')}`}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                    >
                      <Phone size={16} />
                      {resource.contact}
                    </a>
                    <a 
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                    >
                      <MessageSquare size={16} />
                      Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CrisisResourceModal;
