import React from 'react';
import { Promotion } from './types';
import { PROMOTIONS } from './constants';
import { motion } from 'framer-motion';

const Promotions = () => {
  const activePromotions = PROMOTIONS.filter(p => p.active).sort((a, b) => a.order - b.order);

  if (activePromotions.length === 0) return null;

  return (
    <div className="p-4 overflow-x-auto scrollbar-hide flex gap-4">
      {activePromotions.map((promo) => (
        <motion.a
          key={promo._id}
          href={promo.notificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[280px] h-[140px] rounded-2xl overflow-hidden shadow-md relative block"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <img 
            src={promo.imageUrl} 
            alt={promo.label} 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <p className="text-white text-xs font-bold uppercase tracking-wide">{promo.label}</p>
          </div>
        </motion.a>
      ))}
    </div>
  );
};

export default Promotions;
