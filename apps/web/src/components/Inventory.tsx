import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sword, Key, FlaskConical, Gem, Box, ShoppingBag, Coins } from 'lucide-react';
import { useGame } from '../context/GameContext';
import gameService from '../services/game.service';
import { showStatIncreaseToast } from './ToastProvider';
import toast from 'react-hot-toast';

export const Inventory: React.FC = () => {
  const { inventory, player, buyItem } = useGame();
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [loadingShop, setLoadingShop] = useState(false);

  useEffect(() => {
    if (activeTab === 'shop') {
      loadShopItems();
    }
  }, [activeTab]);

  const loadShopItems = async () => {
    setLoadingShop(true);
    try {
      const items = await gameService.getShopItems();
      setShopItems(items);
    } catch (error) {
      console.error('Failed to load shop items:', error);
    } finally {
      setLoadingShop(false);
    }
  };

  const handleBuy = async (item: any) => {
    if (player && player.gold < item.cost) {
      toast.error('Not enough gold!');
      return;
    }

    const success = await buyItem(item.id, 1);
    if (success) {
      toast.success(`Purchased ${item.name}!`);
      // Play sound or animation here
    }
  };

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
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`text-xl sm:text-2xl font-bold tracking-widest transition-colors ${
              activeTab === 'inventory' ? 'text-white' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            INVENTORY
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`text-xl sm:text-2xl font-bold tracking-widest transition-colors ${
              activeTab === 'shop' ? 'text-white' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            SHOP
          </button>
        </div>
        <div className="flex gap-2 items-center text-sm text-yellow-500 font-mono bg-yellow-500/10 px-3 py-1 rounded border border-yellow-500/30">
          <Coins size={16} />
          <span>{player.gold.toLocaleString()} G</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' ? (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-4 md:grid-cols-5 gap-3"
            >
              {inventory.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <Box size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Inventory is empty</p>
                  <button 
                    onClick={() => setActiveTab('shop')}
                    className="mt-4 text-system-blue hover:underline"
                  >
                    Visit the Shop
                  </button>
                </div>
              ) : (
                inventory.map((item, index) => {
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
                          <div className="absolute bottom-1 right-1 text-[10px] font-mono text-gray-400">x{item.quantity}</div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-black border border-system-blue p-3 rounded z-20 hidden group-hover:block pointer-events-none shadow-xl">
                            <div className={`text-xs font-bold mb-1 ${getRarityColor(item.rarity).split(' ')[0]}`}>{item.name}</div>
                            <div className="text-[10px] text-gray-400 mb-2">{item.type}</div>
                            <div className="text-[10px] text-gray-300">{item.description}</div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {loadingShop ? (
                <div className="col-span-full text-center py-12 text-system-blue animate-pulse">
                  LOADING SHOP ITEMS...
                </div>
              ) : (
                shopItems.map((item) => {
                  const Icon = getIcon(item.type);
                  const canAfford = player.gold >= item.cost;

                  return (
                    <div 
                      key={item.id}
                      className={`bg-black/40 border rounded-lg p-4 flex flex-col gap-3 group transition-all ${
                        canAfford ? 'border-gray-700 hover:border-system-blue/50' : 'border-red-900/30 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded bg-white/5 ${getRarityColor(item.rarity).split(' ')[0]}`}>
                          <Icon size={24} />
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-500 font-mono font-bold flex items-center justify-end gap-1">
                            {item.cost.toLocaleString()} <Coins size={12} />
                          </div>
                          <div className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded border ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-white">{item.name}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      </div>

                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`mt-auto w-full py-2 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                          canAfford 
                            ? 'bg-system-blue text-black hover:bg-white' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag size={16} />
                        {canAfford ? 'PURCHASE' : 'NOT ENOUGH GOLD'}
                      </button>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
