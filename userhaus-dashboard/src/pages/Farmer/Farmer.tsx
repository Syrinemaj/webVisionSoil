
import { useState } from 'react';
import FarmSelection from '@/components/Farmer/FarmSelection';
import FruitSelection from '@/components/Farmer/FruitSelection';
import FruitDashboard from '@/components/Farmer/FruitDashboard';

import { motion, AnimatePresence } from 'framer-motion';

export type Farm = {
  id: string;
  name: string;
  location: string;
  image: string;
  soilMoisture: number;
  temperature: number;
};

export type Fruit = {
  id: string;
  name: string;
  image: string;
  production: number;
  ripeness: number;
};

const Farmer = () => {
  const [step, setStep] = useState<'farm' | 'fruit' | 'dashboard'>('farm');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);

  // Sample data
  const farms: Farm[] = [
    {
      id: '1',
      name: 'Green Valley Farm',
      location: 'California, USA',
      image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
      soilMoisture: 75,
      temperature: 22,
    },
    {
      id: '2',
      name: 'Sunset Hills',
      location: 'Oregon, USA',
      image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027',
      soilMoisture: 68,
      temperature: 20,
    },
  ];

  const fruits: Fruit[] = [
    {
      id: '1',
      name: 'Tomatoes',
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
      production: 1200,
      ripeness: 85,
    },
    {
      id: '2',
      name: 'Potatoes',
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07',
      production: 3500,
      ripeness: 70,
    },
  ];

  const handleFarmSelect = (farm: Farm) => {
    setSelectedFarm(farm);
    setStep('fruit');
  };

  const handleFruitSelect = (fruit: Fruit) => {
    setSelectedFruit(fruit);
    setStep('dashboard');
  };

  const handleBack = () => {
    if (step === 'dashboard') {
      setStep('fruit');
      setSelectedFruit(null);
    } else if (step === 'fruit') {
      setStep('farm');
      setSelectedFarm(null);
    }
  };

  return (
    
      <div className="min-h-screen bg-gradient-to-br from-soil-100 to-soil-50">
        <AnimatePresence mode="wait">
          {step === 'farm' && (
            <motion.div
              key="farm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FarmSelection farms={farms} onSelect={handleFarmSelect} />
            </motion.div>
          )}
          
          {step === 'fruit' && selectedFarm && (
            <motion.div
              key="fruit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FruitSelection 
                fruits={fruits} 
                onSelect={handleFruitSelect} 
                onBack={handleBack}
                farmName={selectedFarm.name} 
              />
            </motion.div>
          )}
          
          {step === 'dashboard' && selectedFarm && selectedFruit && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FruitDashboard 
                farm={selectedFarm} 
                fruit={selectedFruit} 
                onBack={handleBack} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  
  );
};

export default Farmer;
