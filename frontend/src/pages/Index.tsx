import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceRecognition from '@/components/auth/FaceRecognition';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserInfo from '@/components/dashboard/UserInfo';
import ControlCommand from '@/components/dashboard/ControlCommand';
import LeafletMap from '@/components/dashboard/LeafletMap';
import SensorData from '@/components/dashboard/SensorData';
import SystemAnalysis from '@/components/dashboard/SystemAnalysis';
import ObstacleLog from '@/components/dashboard/ObstacleLog';

const Index: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!authenticated ? (
          <FaceRecognition
            key="auth"
            onAuthenticated={() => setAuthenticated(true)}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col min-h-screen"
          >
            <DashboardHeader />

            <main className="flex-1 p-3 sm:p-4 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 auto-rows-min">
                {/* Row 1: User Info + Sensor Data */}
                <div className="lg:col-span-3">
                  <UserInfo />
                </div>
                <div className="lg:col-span-5">
                  <SensorData />
                </div>
                <div className="lg:col-span-4">
                  <ControlCommand />
                </div>

                {/* Row 2: Map (full width) */}
                <div className="lg:col-span-8">
                  <LeafletMap />
                </div>

                {/* Row 2 side: System + Obstacles */}
                <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
                  <SystemAnalysis />
                  <ObstacleLog />
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
