import { FilesetResolver, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { LandmarkPoint } from '../../types';

export class PoseTrackingEngine {
  private poseLandmarker: PoseLandmarker | null = null;
  private isModelLoading = false;
  private isRunning = false;
  private videoElement: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private onResultsCallback: ((landmarks: LandmarkPoint[]) => void) | null = null;
  private stream: MediaStream | null = null;

  async initModel(): Promise<boolean> {
    if (this.poseLandmarker) return true;
    if (this.isModelLoading) return false;

    this.isModelLoading = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.55,
        minPosePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });

      this.isModelLoading = false;
      return true;
    } catch (err) {
      console.warn('GPU PoseLandmarker init error, falling back to CPU:', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        this.isModelLoading = false;
        return true;
      } catch (fallbackErr) {
        console.error('Fatal pose model load failure:', fallbackErr);
        this.isModelLoading = false;
        return false;
      }
    }
  }

  async startCamera(
    video: HTMLVideoElement,
    onResults: (landmarks: LandmarkPoint[]) => void,
    deviceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    this.videoElement = video;
    this.onResultsCallback = onResults;

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
                        : { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      // Ensure model is ready
      await this.initModel();

      this.isRunning = true;
      this.processVideoLoop();
      return { success: true };
    } catch (err: any) {
      console.error('Camera stream error:', err);
      return { success: false, error: err.message || 'Camera permission denied or camera unavailable' };
    }
  }

  private processVideoLoop = () => {
    if (!this.isRunning || !this.videoElement) return;

    if (this.poseLandmarker && this.videoElement.readyState >= 2) {
      const startTimeMs = performance.now();
      try {
        const result: PoseLandmarkerResult = this.poseLandmarker.detectForVideo(
          this.videoElement,
          startTimeMs
        );

        if (result.landmarks && result.landmarks.length > 0 && result.landmarks[0]) {
          const landmarks: LandmarkPoint[] = result.landmarks[0].map(l => ({
            x: l.x,
            y: l.y,
            z: l.z,
            visibility: l.visibility,
          }));
          this.onResultsCallback?.(landmarks);
        } else {
          this.onResultsCallback?.([]);
        }
      } catch (e) {
        console.warn('Frame detection tick error:', e);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.processVideoLoop);
  };

  stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
}
