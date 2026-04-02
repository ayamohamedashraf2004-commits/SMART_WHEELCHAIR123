import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FaceRecognition from '@/components/auth/FaceRecognition';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserInfo from '@/components/dashboard/UserInfo';
import ControlCommand from '@/components/dashboard/ControlCommand';
import PathPlanning from '@/components/dashboard/PathPlanning';
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
            className="flex flex-col lg:flex-row min-h-screen"
          >
            <DashboardSidebar />

            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
              <DashboardHeader />

              <main className="flex-1 p-3 sm:p-4 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 auto-rows-min">
                  {/* Row 1 */}
                  <div className="md:col-span-1 lg:col-span-3">
                    <UserInfo />
                  </div>
                  <div className="md:col-span-1 lg:col-span-5">
                    <SensorData />
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <PathPlanning />
                  </div>

                  {/* Row 2 */}
                  <div className="md:col-span-1 lg:col-span-3">
                    <ControlCommand />
                  </div>
                  <div className="md:col-span-1 lg:col-span-5">
                    <ObstacleLog />
                  </div>
                  <div className="md:col-span-2 lg:col-span-4">
                    <SystemAnalysis />
                  </div>
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
