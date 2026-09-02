import React, { useState, useEffect } from 'react';
import { UserProfile, ExerciseId, WorkoutSession } from './types';
import { FitronDB, subscribeToStore } from './lib/db';
import { AuthPage } from './components/auth/AuthPage';
import { AppShell } from './components/layout/AppShell';
import { BackgroundBackdrop } from './components/common/BackgroundBackdrop';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { GameModePage } from './components/game/GameModePage';
import { FitnessModePage } from './components/fitness/FitnessModePage';
import { ChallengesPage } from './components/challenges/ChallengesPage';
import { SocialPage } from './components/social/SocialPage';
import { ProgressPage } from './components/progress/ProgressPage';
import { FitronAIPage } from './components/ai/FitronAIPage';
import { StorePage } from './components/store/StorePage';
import { ProfilePage } from './components/profile/ProfilePage';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { MotionStudio } from './components/motion/MotionStudio';

export function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(FitronDB.getUserProfile());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeMotionExercise, setActiveMotionExercise] = useState<ExerciseId | null>(null);

  // Subscribe to persistent store state changes
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setUserProfile(FitronDB.getUserProfile());
    });
    return () => unsubscribe();
  }, []);

  const handleProfileUpdated = () => {
    setUserProfile(FitronDB.getUserProfile());
  };

  const handleLogout = () => {
    FitronDB.logout();
    setUserProfile(null);
  };

  const handleStartMotionWorkout = (exerciseId: ExerciseId = 'standard_pushups') => {
    setActiveMotionExercise(exerciseId);
  };

  const handleWorkoutSaved = (session: WorkoutSession) => {
    setActiveMotionExercise(null);
    handleProfileUpdated();
  };

  // If user is not authenticated, render Auth screen
  if (!userProfile) {
    return <AuthPage onAuthenticated={(profile) => setUserProfile(profile)} />;
  }

  return (
    <div className="min-h-screen text-white relative font-sans">
      {/* Dynamic Background Atmosphere */}
      <BackgroundBackdrop themeId={userProfile.equipped_background || 'midnight'} />

      {/* Main Application Shell */}
      <AppShell
        userProfile={userProfile}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onStartMotionWorkout={handleStartMotionWorkout}
        onLogout={handleLogout}
      >
        {activeTab === 'dashboard' && (
          <DashboardPage
            userProfile={userProfile}
            onNavigate={(tab) => setActiveTab(tab)}
            onStartMotionWorkout={handleStartMotionWorkout}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'game' && (
          <GameModePage
            userProfile={userProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'fitness' && (
          <FitnessModePage
            userProfile={userProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesPage
            userProfile={userProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'social' && (
          <SocialPage
            userProfile={userProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressPage userProfile={userProfile} />
        )}

        {activeTab === 'ai' && (
          <FitronAIPage userProfile={userProfile} />
        )}

        {activeTab === 'store' && (
          <StorePage
            userProfile={userProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            userProfile={userProfile}
            onProfileUpdated={handleProfileUpdated}
            onNavigateToStore={() => setActiveTab('store')}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsPage
            userProfile={userProfile}
            onNotificationsUpdated={handleProfileUpdated}
          />
        )}
      </AppShell>

      {/* Direct FITRON Motion Studio Modal Overlay */}
      {activeMotionExercise && (
        <MotionStudio
          userProfile={userProfile}
          initialExerciseId={activeMotionExercise}
          onWorkoutSaved={handleWorkoutSaved}
          onClose={() => setActiveMotionExercise(null)}
        />
      )}
    </div>
  );
}

export default App;
