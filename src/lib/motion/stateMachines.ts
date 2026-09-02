import { LandmarkPoint, ExerciseId } from '../../types';
import { calculateAngle, calculateDistance, AngleFilter } from './poseMath';
import { POSE_LANDMARKS } from './skeletonRenderer';

export interface DetectionResult {
  repCountDelta: number;
  stateText: string;
  formFeedback: string;
  currentAngle: number;
  highlightJoints: number[];
  formQuality: 'good' | 'warning' | 'neutral';
  progressPercent: number; // 0 to 100 towards rep completion
}

export interface ExerciseDetector {
  process(landmarks: LandmarkPoint[]): DetectionResult;
  reset(): void;
  getHighlightedJoints(): number[];
}

// ----------------------------------------------------
// 1. PUSH-UP STATE MACHINE (Wall, Incline, Knee, Standard)
// ----------------------------------------------------
export class PushUpDetector implements ExerciseDetector {
  private state: 'READY' | 'DOWN' | 'UP' = 'READY';
  private leftElbowFilter = new AngleFilter(0.35);
  private rightElbowFilter = new AngleFilter(0.35);
  private lastRepTimestamp = 0;
  private downThreshold: number;
  private upThreshold: number;
  private variant: ExerciseId;

  constructor(variant: ExerciseId = 'standard_pushups') {
    this.variant = variant;
    // Set appropriate thresholds based on variant
    if (variant === 'wall_pushups') {
      this.downThreshold = 105;
      this.upThreshold = 150;
    } else if (variant === 'incline_pushups') {
      this.downThreshold = 100;
      this.upThreshold = 155;
    } else if (variant === 'knee_pushups') {
      this.downThreshold = 95;
      this.upThreshold = 155;
    } else {
      // Standard Push-Ups
      this.downThreshold = 90;
      this.upThreshold = 160;
    }
  }

  getHighlightedJoints(): number[] {
    return [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_WRIST,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.RIGHT_HIP
    ];
  }

  reset() {
    this.state = 'READY';
    this.leftElbowFilter.reset();
    this.rightElbowFilter.reset();
    this.lastRepTimestamp = 0;
  }

  process(landmarks: LandmarkPoint[]): DetectionResult {
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const leftElbow = landmarks[POSE_LANDMARKS.LEFT_ELBOW];
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];

    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const rightElbow = landmarks[POSE_LANDMARKS.RIGHT_ELBOW];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

    // Visibility gate check
    const leftArmVisible = (leftShoulder?.visibility ?? 1) > 0.5 &&
                           (leftElbow?.visibility ?? 1) > 0.5 &&
                           (leftWrist?.visibility ?? 1) > 0.5;

    const rightArmVisible = (rightShoulder?.visibility ?? 1) > 0.5 &&
                            (rightElbow?.visibility ?? 1) > 0.5 &&
                            (rightWrist?.visibility ?? 1) > 0.5;

    if (!leftArmVisible && !rightArmVisible) {
      return {
        repCountDelta: 0,
        stateText: 'Position camera to view arms & torso',
        formFeedback: 'Align yourself in frame',
        currentAngle: 180,
        highlightJoints: this.getHighlightedJoints(),
        formQuality: 'neutral',
        progressPercent: 0,
      };
    }

    // Measure active elbow angles
    let activeAngle = 180;
    if (leftArmVisible && rightArmVisible) {
      const leftAngle = this.leftElbowFilter.filter(calculateAngle(leftShoulder, leftElbow, leftWrist));
      const rightAngle = this.rightElbowFilter.filter(calculateAngle(rightShoulder, rightElbow, rightWrist));
      activeAngle = Math.round((leftAngle + rightAngle) / 2);
    } else if (leftArmVisible) {
      activeAngle = this.leftElbowFilter.filter(calculateAngle(leftShoulder, leftElbow, leftWrist));
    } else {
      activeAngle = this.rightElbowFilter.filter(calculateAngle(rightShoulder, rightElbow, rightWrist));
    }

    // Check hip alignment for back straightness
    let hipAngle = 180;
    if (leftShoulder && leftHip && landmarks[POSE_LANDMARKS.LEFT_KNEE]) {
      hipAngle = calculateAngle(leftShoulder, leftHip, landmarks[POSE_LANDMARKS.LEFT_KNEE]);
    }
    const isBackStraight = hipAngle > 140;

    let repDelta = 0;
    let stateText = 'READY — Straight Plank';
    let feedback = 'Descend by bending elbows';
    let formQuality: 'good' | 'warning' | 'neutral' = 'good';
    let progress = 0;

    if (!isBackStraight && this.variant === 'standard_pushups') {
      feedback = 'Keep your back and hips in a straight line';
      formQuality = 'warning';
    }

    const now = Date.now();

    // Push-Up State Machine logic
    if (this.state === 'READY') {
      if (activeAngle < this.downThreshold + 15) {
        this.state = 'DOWN';
      }
      progress = Math.max(0, Math.min(100, Math.round(((this.upThreshold - activeAngle) / (this.upThreshold - this.downThreshold)) * 100)));
      stateText = 'DESCENDING...';
      feedback = 'Lower chest smoothly';
    } else if (this.state === 'DOWN') {
      progress = 100;
      if (activeAngle <= this.downThreshold) {
        stateText = 'BOTTOM DEPTH REACHED';
        feedback = 'Great depth! Now push up forcefully';
      }

      if (activeAngle >= this.upThreshold - 10) {
        // Returned up
        if (now - this.lastRepTimestamp > 450) {
          this.state = 'READY';
          repDelta = 1;
          this.lastRepTimestamp = now;
          stateText = 'REP COMPLETE!';
          feedback = 'Excellent repetition!';
        } else {
          this.state = 'READY';
        }
      }
    }

    return {
      repCountDelta: repDelta,
      stateText,
      formFeedback: feedback,
      currentAngle: activeAngle,
      highlightJoints: this.getHighlightedJoints(),
      formQuality,
      progressPercent: progress,
    };
  }
}

// ----------------------------------------------------
// 2. SQUAT STATE MACHINE (Assisted, Bodyweight)
// ----------------------------------------------------
export class SquatDetector implements ExerciseDetector {
  private state: 'STANDING' | 'BENDING' | 'BOTTOM' = 'STANDING';
  private leftKneeFilter = new AngleFilter(0.35);
  private rightKneeFilter = new AngleFilter(0.35);
  private lastRepTimestamp = 0;

  getHighlightedJoints(): number[] {
    return [
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ];
  }

  reset() {
    this.state = 'STANDING';
    this.leftKneeFilter.reset();
    this.rightKneeFilter.reset();
    this.lastRepTimestamp = 0;
  }

  process(landmarks: LandmarkPoint[]): DetectionResult {
    const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
    const leftKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];

    const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const rightKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    const leftLegVisible = (leftHip?.visibility ?? 1) > 0.5 && (leftKnee?.visibility ?? 1) > 0.5 && (leftAnkle?.visibility ?? 1) > 0.5;
    const rightLegVisible = (rightHip?.visibility ?? 1) > 0.5 && (rightKnee?.visibility ?? 1) > 0.5 && (rightAnkle?.visibility ?? 1) > 0.5;

    if (!leftLegVisible && !rightLegVisible) {
      return {
        repCountDelta: 0,
        stateText: 'Position camera to view hips & legs',
        formFeedback: 'Step back to show full body',
        currentAngle: 180,
        highlightJoints: this.getHighlightedJoints(),
        formQuality: 'neutral',
        progressPercent: 0,
      };
    }

    let activeKneeAngle = 180;
    if (leftLegVisible && rightLegVisible) {
      const l = this.leftKneeFilter.filter(calculateAngle(leftHip, leftKnee, leftAnkle));
      const r = this.rightKneeFilter.filter(calculateAngle(rightHip, rightKnee, rightAnkle));
      activeKneeAngle = Math.round((l + r) / 2);
    } else if (leftLegVisible) {
      activeKneeAngle = this.leftKneeFilter.filter(calculateAngle(leftHip, leftKnee, leftAnkle));
    } else {
      activeKneeAngle = this.rightKneeFilter.filter(calculateAngle(rightHip, rightKnee, rightAnkle));
    }

    let repDelta = 0;
    let stateText = 'STANDING';
    let feedback = 'Hips back and bend knees';
    let formQuality: 'good' | 'warning' | 'neutral' = 'good';
    const now = Date.now();

    // Standing > 160°, Squat bottom <= 100°
    const progress = Math.max(0, Math.min(100, Math.round(((165 - activeKneeAngle) / (165 - 95)) * 100)));

    if (this.state === 'STANDING') {
      if (activeKneeAngle < 145) {
        this.state = 'BENDING';
      }
      stateText = 'READY — Standing Tall';
      feedback = 'Drive hips back and lower down';
    } else if (this.state === 'BENDING') {
      stateText = 'SQUATTING DOWN...';
      feedback = 'Keep chest up and knees out';
      if (activeKneeAngle <= 100) {
        this.state = 'BOTTOM';
      } else if (activeKneeAngle > 160) {
        this.state = 'STANDING';
      }
    } else if (this.state === 'BOTTOM') {
      stateText = 'FULL DEPTH!';
      feedback = 'Push through heels to stand up';
      if (activeKneeAngle >= 155) {
        if (now - this.lastRepTimestamp > 500) {
          this.state = 'STANDING';
          repDelta = 1;
          this.lastRepTimestamp = now;
          stateText = 'REP COMPLETE!';
          feedback = 'Strong squat!';
        } else {
          this.state = 'STANDING';
        }
      }
    }

    return {
      repCountDelta: repDelta,
      stateText,
      formFeedback: feedback,
      currentAngle: activeKneeAngle,
      highlightJoints: this.getHighlightedJoints(),
      formQuality,
      progressPercent: progress,
    };
  }
}

// ----------------------------------------------------
// 3. JUMPING JACKS DETECTOR
// ----------------------------------------------------
export class JumpingJackDetector implements ExerciseDetector {
  private state: 'FEET_IN' | 'FEET_OUT' = 'FEET_IN';
  private lastRepTimestamp = 0;

  getHighlightedJoints(): number[] {
    return [
      POSE_LANDMARKS.LEFT_WRIST,
      POSE_LANDMARKS.RIGHT_WRIST,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ];
  }

  reset() {
    this.state = 'FEET_IN';
    this.lastRepTimestamp = 0;
  }

  process(landmarks: LandmarkPoint[]): DetectionResult {
    const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
    const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
    const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder || !leftAnkle || !rightAnkle) {
      return {
        repCountDelta: 0,
        stateText: 'Show full body in camera',
        formFeedback: 'Step back to capture full jumping motion',
        currentAngle: 0,
        highlightJoints: this.getHighlightedJoints(),
        formQuality: 'neutral',
        progressPercent: 0,
      };
    }

    const armsAreHigh = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
    const feetDistance = Math.abs(leftAnkle.x - rightAnkle.x);
    const shoulderDistance = Math.abs(leftShoulder.x - rightShoulder.x);
    const feetAreWide = feetDistance > shoulderDistance * 1.35;

    let repDelta = 0;
    let stateText = 'FEET TOGETHER';
    let feedback = 'Jump feet apart and raise hands overhead';
    const now = Date.now();

    if (this.state === 'FEET_IN') {
      if (armsAreHigh && feetAreWide) {
        this.state = 'FEET_OUT';
        stateText = 'PEAK EXTENSION!';
        feedback = 'Jump back together';
      }
    } else if (this.state === 'FEET_OUT') {
      if (!armsAreHigh && !feetAreWide) {
        if (now - this.lastRepTimestamp > 350) {
          this.state = 'FEET_IN';
          repDelta = 1;
          this.lastRepTimestamp = now;
          stateText = 'REP COMPLETE!';
          feedback = 'Keep rhythm steady!';
        } else {
          this.state = 'FEET_IN';
        }
      }
    }

    return {
      repCountDelta: repDelta,
      stateText,
      formFeedback: feedback,
      currentAngle: Math.round(feetDistance * 100),
      highlightJoints: this.getHighlightedJoints(),
      formQuality: 'good',
      progressPercent: armsAreHigh ? 100 : 0,
    };
  }
}

// ----------------------------------------------------
// 4. SIT-UPS DETECTOR
// ----------------------------------------------------
export class SitUpDetector implements ExerciseDetector {
  private state: 'DOWN' | 'UP' = 'DOWN';
  private torsoFilter = new AngleFilter(0.35);
  private lastRepTimestamp = 0;

  getHighlightedJoints(): number[] {
    return [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
    ];
  }

  reset() {
    this.state = 'DOWN';
    this.torsoFilter.reset();
    this.lastRepTimestamp = 0;
  }

  process(landmarks: LandmarkPoint[]): DetectionResult {
    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER] || landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP] || landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const knee = landmarks[POSE_LANDMARKS.LEFT_KNEE] || landmarks[POSE_LANDMARKS.RIGHT_KNEE];

    if (!shoulder || !hip || !knee) {
      return {
        repCountDelta: 0,
        stateText: 'Position camera at side profile',
        formFeedback: 'Lie on mat in side view',
        currentAngle: 180,
        highlightJoints: this.getHighlightedJoints(),
        formQuality: 'neutral',
        progressPercent: 0,
      };
    }

    const angle = this.torsoFilter.filter(calculateAngle(shoulder, hip, knee));
    let repDelta = 0;
    let stateText = 'LYING FLAT';
    let feedback = 'Engage abs and curl torso upwards';
    const now = Date.now();

    // Down > 130°, Up < 85°
    if (this.state === 'DOWN') {
      if (angle <= 85) {
        this.state = 'UP';
        stateText = 'TOP CONTRACTION!';
        feedback = 'Lower torso down with control';
      }
    } else if (this.state === 'UP') {
      if (angle >= 130) {
        if (now - this.lastRepTimestamp > 500) {
          this.state = 'DOWN';
          repDelta = 1;
          this.lastRepTimestamp = now;
          stateText = 'REP COMPLETE!';
          feedback = 'Great sit-up!';
        } else {
          this.state = 'DOWN';
        }
      }
    }

    return {
      repCountDelta: repDelta,
      stateText,
      formFeedback: feedback,
      currentAngle: angle,
      highlightJoints: this.getHighlightedJoints(),
      formQuality: 'good',
      progressPercent: Math.max(0, Math.min(100, Math.round(((140 - angle) / 60) * 100))),
    };
  }
}

// ----------------------------------------------------
// 5. CALF RAISES DETECTOR
// ----------------------------------------------------
export class CalfRaiseDetector implements ExerciseDetector {
  private state: 'DOWN' | 'UP' = 'DOWN';
  private lastRepTimestamp = 0;

  getHighlightedJoints(): number[] {
    return [
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.LEFT_HEEL,
      POSE_LANDMARKS.LEFT_FOOT_INDEX,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.RIGHT_ANKLE,
      POSE_LANDMARKS.RIGHT_HEEL,
      POSE_LANDMARKS.RIGHT_FOOT_INDEX,
    ];
  }

  reset() {
    this.state = 'DOWN';
    this.lastRepTimestamp = 0;
  }

  process(landmarks: LandmarkPoint[]): DetectionResult {
    const leftAnkle = landmarks[POSE_LANDMARKS.LEFT_ANKLE];
    const leftHeel = landmarks[POSE_LANDMARKS.LEFT_HEEL];
    const rightAnkle = landmarks[POSE_LANDMARKS.RIGHT_ANKLE];
    const rightHeel = landmarks[POSE_LANDMARKS.RIGHT_HEEL];

    if (!leftAnkle && !rightAnkle) {
      return {
        repCountDelta: 0,
        stateText: 'Show ankles and feet in frame',
        formFeedback: 'Position camera to track foot elevation',
        currentAngle: 0,
        highlightJoints: this.getHighlightedJoints(),
        formQuality: 'neutral',
        progressPercent: 0,
      };
    }

    let repDelta = 0;
    let stateText = 'FEET FLAT';
    let feedback = 'Raise heels high on balls of feet';
    const now = Date.now();

    const heelElevated = (leftHeel && leftAnkle && leftHeel.y < leftAnkle.y - 0.02) ||
                         (rightHeel && rightAnkle && rightHeel.y < rightAnkle.y - 0.02);

    if (this.state === 'DOWN') {
      if (heelElevated) {
        this.state = 'UP';
        stateText = 'PEAK CALF CONTRACTION!';
        feedback = 'Hold briefly and lower slowly';
      }
    } else if (this.state === 'UP') {
      if (!heelElevated) {
        if (now - this.lastRepTimestamp > 400) {
          this.state = 'DOWN';
          repDelta = 1;
          this.lastRepTimestamp = now;
          stateText = 'REP COMPLETE!';
          feedback = 'Smooth movement!';
        } else {
          this.state = 'DOWN';
        }
      }
    }

    return {
      repCountDelta: repDelta,
      stateText,
      formFeedback: feedback,
      currentAngle: heelElevated ? 90 : 0,
      highlightJoints: this.getHighlightedJoints(),
      formQuality: 'good',
      progressPercent: heelElevated ? 100 : 0,
    };
  }
}

// ----------------------------------------------------
// 6. PLANK HOLD DETECTOR (Time & Stability Based)
// ----------------------------------------------------
export class PlankDetector implements ExerciseDetector {
  private torsoFilter = new AngleFilter(0.3);

  getHighlightedJoints(): number[] {
    return [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_ANKLE,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ];
  }

  reset() {
    this.torsoFilter.reset();
  }

  process(landmarks: LandmarkPoint[]): DetectionResult {
    const shoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER] || landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
    const hip = landmarks[POSE_LANDMARKS.LEFT_HIP] || landmarks[POSE_LANDMARKS.RIGHT_HIP];
    const ankle = landmarks[POSE_LANDMARKS.LEFT_ANKLE] || landmarks[POSE_LANDMARKS.RIGHT_ANKLE];

    if (!shoulder || !hip || !ankle) {
      return {
        repCountDelta: 0,
        stateText: 'Show full side plank in camera',
        formFeedback: 'Position body horizontally in frame',
        currentAngle: 180,
        highlightJoints: this.getHighlightedJoints(),
        formQuality: 'neutral',
        progressPercent: 0,
      };
    }

    const alignmentAngle = this.torsoFilter.filter(calculateAngle(shoulder, hip, ankle));
    const isGoodPlank = alignmentAngle >= 150 && alignmentAngle <= 190;

    let stateText = 'PLANK HOLD ACTIVE';
    let feedback = 'Hold solid straight line from shoulders to heels';
    let formQuality: 'good' | 'warning' | 'neutral' = 'good';

    if (!isGoodPlank) {
      if (alignmentAngle < 150) {
        stateText = 'HIPS SAGGING OR PIKED';
        feedback = 'Align hips in neutral horizontal plane';
        formQuality = 'warning';
      }
    }

    return {
      repCountDelta: isGoodPlank ? 1 : 0, // In plank, rep delta serves as valid active tick
      stateText,
      formFeedback: feedback,
      currentAngle: alignmentAngle,
      highlightJoints: this.getHighlightedJoints(),
      formQuality,
      progressPercent: isGoodPlank ? 100 : 50,
    };
  }
}

export function createExerciseDetector(exerciseId: ExerciseId): ExerciseDetector {
  switch (exerciseId) {
    case 'wall_pushups':
    case 'incline_pushups':
    case 'knee_pushups':
    case 'standard_pushups':
      return new PushUpDetector(exerciseId);
    case 'assisted_squats':
    case 'bodyweight_squats':
    case 'lunges':
      return new SquatDetector();
    case 'jumping_jacks':
      return new JumpingJackDetector();
    case 'situps':
      return new SitUpDetector();
    case 'calf_raises':
      return new CalfRaiseDetector();
    case 'plank':
      return new PlankDetector();
    default:
      return new PushUpDetector('standard_pushups');
  }
}
