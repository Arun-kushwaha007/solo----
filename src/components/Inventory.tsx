import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sword, Key, FlaskConical, Gem, Box } from 'lucide-react';
import { useGame } from '../context/GameContext';

export const Inventory: React.FC = () => {
  const { inventory, player } = useGame();

  const getIcon = (type: string) => {
    switch (type) {
      case 'WEAPON': return Sword;
      case 'ARMOR': return Shield;
      case 'CONSUMABLE': return FlaskConical;
      case 'KEY': return Key;
      case 'MATERIAL': return Gem;
      default: return Box;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY": return "text-yellow-400 border-yellow-400/50 shadow-yellow-400/20";
      case "EPIC": return "text-purple-400 border-purple-400/50 shadow-purple-400/20";
      case "RARE": return "text-blue-400 border-blue-400/50 shadow-blue-400/20";
      case "UNCOMMON": return "text-green-400 border-green-400/50 shadow-green-400/20";
      default: return "text-gray-400 border-gray-600/50";
    }
  };

  if (!player) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 font-mono">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-system-blue/30 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-widest">INVENTORY</h2>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>GOLD: {player.gold.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto pr-2">
        {inventory.map((item, index) => {
          const Icon = item ? getIcon(item.type) : Box;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={`aspect-square bg-black/40 border rounded flex items-center justify-center relative group cursor-pointer hover:bg-white/5 transition-colors ${
                item ? getRarityColor(item.rarity) : "border-gray-800"
              }`}
            >
              {item && (
                <>
                  <Icon size={24} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-black border border-system-blue p-2 rounded z-20 hidden group-hover:block pointer-events-none">
                    <div className={`text-xs font-bold mb-1 ${getRarityColor(item.rarity).split(' ')[0]}`}>{item.name}</div>
                    <div className="text-[10px] text-gray-400">{item.type}</div>
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
