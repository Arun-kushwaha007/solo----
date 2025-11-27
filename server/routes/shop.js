const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Player = require('../models/Player');

// Shop Items Configuration
const SHOP_ITEMS = [
  {
    id: 'hp_potion',
    name: 'HEALTH POTION',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    description: 'Restores 50 HP immediately.',
    cost: 100,
    effects: { hp: 50 }
  },
  {
    id: 'mp_potion',
    name: 'MANA POTION',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    description: 'Restores 50 MP immediately.',
    cost: 100,
    effects: { mp: 50 }
  },
  {
    id: 'random_box',
    name: 'RANDOM BOX',
    type: 'CONSUMABLE',
    rarity: 'RARE',
    description: 'Contains a random reward. Feeling lucky?',
    cost: 1000,
    effects: { open: true }
  },
  {
    id: 'dungeon_key',
    name: 'DUNGEON KEY',
    type: 'KEY',
    rarity: 'EPIC',
    description: 'Unlocks a hidden dungeon instance.',
    cost: 5000,
    effects: { unlock: 'dungeon' }
  },
  {
    id: 'xp_boost',
    name: 'XP BOOSTER (1H)',
    type: 'CONSUMABLE',
    rarity: 'UNCOMMON',
    description: 'Increases XP gain by 50% for 1 hour.',
    cost: 2500,
    effects: { boost: 'xp', duration: 3600 }
  }
];

// @route   GET /api/shop
// @desc    Get all shop items
// @access  Private
router.get('/', protect, async (req, res) => {
  res.json({
    success: true,
    data: SHOP_ITEMS
  });
});

// @route   POST /api/shop/buy
// @desc    Buy an item
// @access  Private
router.post('/buy', protect, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const totalCost = item.cost * quantity;

    const player = await Player.findOne({ userId: req.user._id });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (player.gold < totalCost) {
      return res.status(400).json({ message: 'Not enough gold' });
    }

    // Deduct gold
    player.gold -= totalCost;

    // Add to inventory
    // Check if item already exists (for stackable items)
    const existingItemIndex = player.inventory.findIndex(i => i.itemId === itemId);

    if (existingItemIndex > -1) {
      player.inventory[existingItemIndex].quantity += quantity;
    } else {
      player.inventory.push({
        itemId: item.id,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        description: item.description,
        quantity: quantity,
        effects: item.effects
      });
    }

    await player.save();

    res.json({
      success: true,
      data: {
        player,
        message: `Successfully purchased ${quantity}x ${item.name}`
      }
    });

  } catch (error) {
    console.error('Error buying item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
