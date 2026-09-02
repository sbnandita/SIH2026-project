import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile, ExerciseId, WorkoutSession } from '../../types';
import { EXERCISE_LIBRARY } from '../../lib/constants';
import { FitronDB } from '../../lib/db';
import { PoseTrackingEngine } from '../../lib/motion/poseDetector';
import { createExerciseDetector, DetectionResult } from '../../lib/motion/stateMachines';
import { renderSkeleton } from '../../lib/motion/skeletonRenderer';
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Flame, 
  Coins, 
  Zap, 
  Edit3, 
  AlertCircle,
  EyeOff,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MotionStudioProps {
  userProfile: UserProfile;
  initialExerciseId?: ExerciseId;
  targetRepsOverride?: number;
  targetDurationOverride?: number;
  isGameModeLevel?: boolean;
  gameLevelId?: number;
  onWorkoutSaved?: (session: WorkoutSession) => void;
  onClose?: () => void;
}

export const MotionStudio: React.FC<MotionStudioProps> = ({
  userProfile,
  initialExerciseId = 'standard_pushups',
  targetRepsOverride,
  targetDurationOverride,
  isGameModeLevel = false,
  gameLevelId,
  onWorkoutSaved,
  onClose,
}) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<ExerciseId>(initialExerciseId);
  const exercise = EXERCISE_LIBRARY[selectedExerciseId];

  const targetReps = targetRepsOverride ?? exercise.defaultReps;
  const isTimeBased = exercise.isTimeBased || Boolean(targetDurationOverride);
  const targetDuration = targetDurationOverride ?? (isTimeBased ? exercise.defaultReps : 0);

  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(true);

  // Active workout metrics
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [totalSets, setTotalSets] = useState<number>(exercise.defaultSets || 3);
  const [currentReps, setCurrentReps] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);

  // Motion Detection State
  const [detectionState, setDetectionState] = useState<DetectionResult>({
    repCountDelta: 0,
    stateText: 'Position yourself in front of camera',
    formFeedback: 'Awaiting movement...',
    currentAngle: 180,
    highlightJoints: [],
    formQuality: 'good',
    progressPercent: 0,
  });

  // Manual Logging Inputs
  const [manualSetsInput, setManualSetsInput] = useState<number>(exercise.defaultSets || 3);
  const [manualRepsInput, setManualRepsInput] = useState<number>(targetReps);
  const [manualDurationInput, setManualDurationInput] = useState<number>(targetDuration || 60);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseEngineRef = useRef<PoseTrackingEngine | null>(null);
  const detectorRef = useRef(createExerciseDetector(selectedExerciseId));

  // Audio tone feedback for rep counts
  const playBeep = useCallback((freq = 520, duration = 120) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration / 1000);
    } catch {
      // Audio not supported or blocked
    }
  }, []);

  // Update detector when exercise changes
  useEffect(() => {
    detectorRef.current = createExerciseDetector(selectedExerciseId);
    detectorRef.current.reset();
  }, [selectedExerciseId]);

  // Workout Duration Timer
  useEffect(() => {
    let interval: any = null;
    if (sessionState === 'running' && !isResting) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, isResting]);

  // Rest Timer
  useEffect(() => {
    let interval: any = null;
    if (isResting && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft(prev => {
          if (prev <= 1) {
            setIsResting(false);
            playBeep(880, 250);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restSecondsLeft, playBeep]);

  // Handle Camera Start
  const handleStartCameraWorkout = async () => {
    setCameraError(null);
    setSessionState('running');
    setIsCalibrating(true);

    if (!poseEngineRef.current) {
      poseEngineRef.current = new PoseTrackingEngine();
    }

    if (videoRef.current) {
      const result = await poseEngineRef.current.startCamera(
        videoRef.current,
        (landmarks) => {
          if (!canvasRef.current || sessionState === 'paused' || isResting) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          if (landmarks.length > 0) {
            setIsCalibrating(false);
            const res = detectorRef.current.process(landmarks);
            setDetectionState(res);

            // Handle Rep Count Increment
            if (res.repCountDelta > 0) {
              if (isTimeBased) {
                // In plank hold, increment duration
                setCurrentReps(prev => {
                  const updated = prev + 1;
                  if (updated >= targetDuration) {
                    handleSetComplete(updated);
                  }
                  return updated;
                });
              } else {
                playBeep(650, 150);
                setCurrentReps(prev => {
                  const updated = prev + res.repCountDelta;
                  if (updated >= targetReps) {
                    handleSetComplete(updated);
                  }
                  return updated;
                });
              }
            }

            renderSkeleton(
              ctx,
              landmarks,
              canvas.width,
              canvas.height,
              res.highlightJoints,
              res.formQuality
            );
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      );

      if (!result.success) {
        setCameraError(result.error || 'Failed to access camera.');
        setMode('manual');
      }
    }
  };

  // Complete a Set
  const handleSetComplete = (repsInSet: number) => {
    playBeep(920, 300);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });

    if (currentSet < totalSets && !isGameModeLevel) {
      // Start rest period
      setIsResting(true);
      setRestSecondsLeft(exercise.defaultRestSeconds);
      setCurrentSet(prev => prev + 1);
      setCurrentReps(0);
      detectorRef.current.reset();
    } else {
      // Finished all sets!
      setSessionState('completed');
      poseEngineRef.current?.stop();
    }
  };

  const handlePauseWorkout = () => {
    setSessionState('paused');
  };

  const handleResumeWorkout = () => {
    setSessionState('running');
  };

  const handleEndWorkoutEarly = () => {
    poseEngineRef.current?.stop();
    setSessionState('completed');
  };

  // Save Workout to DB
  const handleSaveWorkout = () => {
    const isCamera = mode === 'camera';
    const finalSets = isCamera ? currentSet : manualSetsInput;
    const finalReps = isCamera ? currentReps * currentSet : manualRepsInput * manualSetsInput;
    const finalDuration = isCamera ? Math.max(10, elapsedSeconds) : manualDurationInput;

    const earnedXP = Math.round(
      isGameModeLevel ? 50 : Math.max(20, finalReps * exercise.xpPerRep + (isCamera ? 15 : 0))
    );
    const earnedCoins = isGameModeLevel ? 15 : (isCamera && finalReps >= 15 ? 10 : 5);

    const session = FitronDB.saveWorkoutSession({
      title: `${exercise.name} ${isCamera ? '(Motion Tracked)' : '(Manual)'}`,
      exercise_name: exercise.name,
      duration_seconds: finalDuration,
      total_sets: finalSets,
      total_reps: finalReps,
      source: isCamera ? 'camera' : 'manual',
      xp_earned: earnedXP,
      coins_earned: earnedCoins,
    });

    if (isGameModeLevel && gameLevelId) {
      FitronDB.completeGameLevel(gameLevelId, 3, 100);
    }

    confetti({ particleCount: 80, spread: 100, origin: { y: 0.4 } });
    onWorkoutSaved?.(session);
    onClose?.();
  };

  const handleDiscardWorkout = () => {
    poseEngineRef.current?.stop();
    onClose?.();
  };

  // Clean up camera when unmounted
  useEffect(() => {
    return () => {
      poseEngineRef.current?.stop();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl fitron-card border border-border-subtle bg-bg-card overflow-hidden my-auto shadow-2xl flex flex-col max-h-[96vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-secondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-crimson-dark/40 border border-crimson/40 flex items-center justify-center text-crimson-pastel">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{exercise.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  mode === 'camera' ? 'bg-crimson/30 text-crimson-pastel border border-crimson/50' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {mode === 'camera' ? '📷 Camera Motion' : '✍️ Manual Logging'}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Target: {targetReps} {isTimeBased ? 'Seconds' : 'Reps'} • {totalSets} Sets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sessionState === 'idle' && (
              <button
                onClick={() => setMode(m => m === 'camera' ? 'manual' : 'camera')}
                className="text-xs px-3 py-1.5 rounded-xl border border-border-subtle text-text-secondary hover:text-white bg-bg-primary transition"
              >
                Switch to {mode === 'camera' ? '✍️ Manual' : '📷 Camera'}
              </button>
            )}
            <button
              onClick={handleDiscardWorkout}
              className="p-2 rounded-xl text-text-secondary hover:text-white hover:bg-bg-elevated transition"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKOUT NOT STARTED YET (IDLE STATE) */}
        {sessionState === 'idle' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1">
            <div className="w-20 h-20 rounded-3xl bg-crimson-dark/30 border border-crimson/50 flex items-center justify-center text-crimson-pastel shadow-crimson-md animate-pulse-glow">
              {mode === 'camera' ? <Camera className="w-10 h-10" /> : <Edit3 className="w-10 h-10" />}
            </div>

            <div className="max-w-md">
              <h3 className="text-2xl font-bold text-white">
                {mode === 'camera' ? 'Ready to Track Movement?' : 'Manual Workout Mode'}
              </h3>
              <p className="text-text-secondary text-sm mt-2">
                {mode === 'camera'
                  ? 'FITRON Motion uses on-device computer vision to count reps and check your form in real-time. Camera permission will be requested next.'
                  : 'Log your sets and reps manually if you prefer exercising without camera tracking.'}
              </p>
            </div>

            {/* Exercise Form Tips */}
            <div className="w-full max-w-lg p-4 rounded-2xl bg-bg-secondary border border-border-subtle text-left">
              <div className="text-xs font-semibold text-crimson-pastel uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Key Form Cues
              </div>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {exercise.cues.map((cue, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-crimson" />
                    {cue}
                  </li>
                ))}
              </ul>
            </div>

            {mode === 'manual' && (
              <div className="w-full max-w-lg grid grid-cols-3 gap-3 p-4 rounded-2xl bg-bg-secondary border border-border-subtle">
                <div>
                  <label className="text-xs text-text-muted block mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={manualSetsInput}
                    onChange={(e) => setManualSetsInput(parseInt(e.target.value) || 1)}
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl p-2 text-center font-bold text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Reps/Set</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={manualRepsInput}
                    onChange={(e) => setManualRepsInput(parseInt(e.target.value) || 1)}
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl p-2 text-center font-bold text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-text-muted block mb-1">Duration (s)</label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={manualDurationInput}
                    onChange={(e) => setManualDurationInput(parseInt(e.target.value) || 30)}
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl p-2 text-center font-bold text-white text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-2">
              {mode === 'camera' ? (
                <button
                  onClick={handleStartCameraWorkout}
                  className="btn-crimson flex-1 py-4 text-base font-bold flex items-center justify-center gap-2 shadow-crimson-md"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera Workout
                </button>
              ) : (
                <button
                  onClick={handleSaveWorkout}
                  className="btn-crimson flex-1 py-4 text-base font-bold flex items-center justify-center gap-2 shadow-crimson-md"
                >
                  <CheckCircle className="w-5 h-5" />
                  Log & Save Workout
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE CAMERA WORKOUT VIEW */}
        {(sessionState === 'running' || sessionState === 'paused') && mode === 'camera' && (
          <div className="relative flex-1 bg-black flex flex-col md:flex-row overflow-hidden min-h-[420px]">
            {/* Live Video & Canvas Container */}
            <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-contain max-h-[60vh] md:max-h-full -scale-x-100"
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none -scale-x-100"
              />

              {/* Top HUD Overlay */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-border-subtle flex items-center gap-2 text-white text-xs">
                  <Clock className="w-4 h-4 text-crimson-pastel" />
                  <span className="font-mono font-bold">
                    {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-border-subtle flex items-center gap-2 text-white text-xs">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Set {currentSet} of {totalSets}</span>
                </div>
              </div>

              {/* Rest Mode Overlay */}
              {isResting && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-20">
                  <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    Rest & Recovery
                  </div>
                  <div className="text-6xl font-black text-white font-mono mb-2">
                    {restSecondsLeft}s
                  </div>
                  <p className="text-text-secondary text-sm max-w-sm mb-6">
                    Breathe deeply. Next set starts automatically when timer ends.
                  </p>
                  <button
                    onClick={() => {
                      setIsResting(false);
                      setRestSecondsLeft(0);
                    }}
                    className="btn-crimson px-6 py-2.5 text-xs font-semibold"
                  >
                    Skip Rest Period
                  </button>
                </div>
              )}

              {/* Real-time State & Form Feedback Banner */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center pointer-events-none z-10">
                <div className={`px-5 py-2.5 rounded-2xl backdrop-blur-lg border text-center transition-all ${
                  detectionState.formQuality === 'good'
                    ? 'bg-black/80 border-crimson/60 text-white shadow-crimson-sm'
                    : 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-crimson-pastel">
                    {detectionState.stateText}
                  </div>
                  <div className="text-sm font-semibold mt-0.5 text-white">
                    {detectionState.formFeedback}
                  </div>
                </div>
              </div>
            </div>

            {/* Side Metric Panel */}
            <div className="w-full md:w-80 bg-bg-card p-6 border-t md:border-t-0 md:border-l border-border-subtle flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Big Rep Counter */}
                <div className="p-6 rounded-2xl bg-bg-secondary border border-border-subtle text-center relative overflow-hidden">
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {isTimeBased ? 'Seconds Held' : 'Reps Counted'}
                  </div>
                  <div className="text-6xl font-black text-white font-heading mt-2">
                    {currentReps}
                    <span className="text-2xl text-text-muted font-normal">/{targetReps}</span>
                  </div>

                  {/* Rep Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-bg-primary mt-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-crimson to-crimson-pastel transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentReps / targetReps) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Real-time Joint Angle Gauge */}
                <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle">
                  <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                    <span>Joint Angle & Form</span>
                    <span className="font-mono text-white font-bold">{detectionState.currentAngle}°</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-bg-primary overflow-hidden">
                    <div
                      className="h-full bg-crimson transition-all duration-150"
                      style={{ width: `${detectionState.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Estimated Live XP */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-secondary border border-border-subtle text-xs">
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-crimson-pastel" /> Estimated XP
                  </span>
                  <span className="font-bold text-white font-heading text-sm">
                    +{Math.max(20, currentReps * exercise.xpPerRep + 15)} XP
                  </span>
                </div>
              </div>

              {/* Workout Controls */}
              <div className="space-y-3 pt-4 border-t border-border-subtle">
                <div className="grid grid-cols-2 gap-2">
                  {sessionState === 'running' ? (
                    <button
                      onClick={handlePauseWorkout}
                      className="btn-secondary py-3 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-4 h-4" /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeWorkout}
                      className="btn-crimson py-3 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4" /> Resume
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentReps(r => r + 1)}
                    className="btn-secondary py-3 text-xs font-semibold text-text-secondary hover:text-white"
                  >
                    +1 Manual Rep
                  </button>
                </div>

                <button
                  onClick={handleEndWorkoutEarly}
                  className="w-full py-3 rounded-xl bg-crimson-dark/40 hover:bg-crimson-dark text-white border border-crimson/50 font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle className="w-4 h-4" /> Finish & Review Workout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKOUT COMPLETED REVIEW MODAL */}
        {sessionState === 'completed' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1">
            <div className="w-20 h-20 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-white font-heading">
                WORKOUT COMPLETE!
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                Outstanding effort! Review your session summary below.
              </p>
            </div>

            {/* Summary Stat Grid */}
            <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle">
                <div className="text-xs text-text-muted">Total Reps</div>
                <div className="text-2xl font-bold text-white mt-1 font-heading">
                  {mode === 'camera' ? currentReps * currentSet : manualRepsInput * manualSetsInput}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle">
                <div className="text-xs text-text-muted">Duration</div>
                <div className="text-2xl font-bold text-white mt-1 font-heading">
                  {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle">
                <div className="text-xs text-text-muted">XP Earned</div>
                <div className="text-2xl font-bold text-crimson-pastel mt-1 font-heading">
                  +{isGameModeLevel ? 50 : Math.max(20, (currentReps || manualRepsInput) * exercise.xpPerRep + 15)}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-bg-secondary border border-border-subtle">
                <div className="text-xs text-text-muted">Coins Earned</div>
                <div className="text-2xl font-bold text-amber-400 mt-1 font-heading">
                  +{isGameModeLevel ? 15 : 10}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
              <button
                onClick={handleSaveWorkout}
                className="btn-crimson flex-1 py-4 text-base font-bold flex items-center justify-center gap-2 shadow-crimson-md"
              >
                <CheckCircle className="w-5 h-5" />
                Save Workout
              </button>
              <button
                onClick={handleDiscardWorkout}
                className="btn-secondary flex-1 py-4 text-base font-semibold text-text-secondary hover:text-white"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
