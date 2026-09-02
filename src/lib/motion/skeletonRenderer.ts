import { LandmarkPoint } from '../../types';

// MediaPipe Pose Landmark index constants
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export const POSE_CONNECTIONS = [
  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  // Left Arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  // Right Arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  // Left Leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_HEEL],
  [POSE_LANDMARKS.LEFT_HEEL, POSE_LANDMARKS.LEFT_FOOT_INDEX],
  // Right Leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_HEEL],
  [POSE_LANDMARKS.RIGHT_HEEL, POSE_LANDMARKS.RIGHT_FOOT_INDEX],
];

export function renderSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  width: number,
  height: number,
  highlightJoints: number[] = [],
  formQuality: 'good' | 'warning' | 'neutral' = 'good'
) {
  if (!landmarks || landmarks.length === 0) return;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Connection line colors based on form quality
  let strokeColor = 'rgba(197, 31, 74, 0.7)'; // Default Crimson
  let glowColor = 'rgba(232, 90, 122, 0.8)';
  if (formQuality === 'warning') {
    strokeColor = 'rgba(255, 170, 0, 0.7)';
    glowColor = 'rgba(255, 200, 50, 0.8)';
  } else if (formQuality === 'good') {
    strokeColor = 'rgba(232, 90, 122, 0.85)';
    glowColor = 'rgba(255, 46, 99, 0.9)';
  }

  // Draw connections
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.strokeStyle = strokeColor;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 8;

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (
      start && 
      end && 
      (start.visibility === undefined || start.visibility > 0.4) &&
      (end.visibility === undefined || end.visibility > 0.4)
    ) {
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
  }

  // Draw landmark points
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm || (lm.visibility !== undefined && lm.visibility < 0.4)) continue;

    const x = lm.x * width;
    const y = lm.y * height;
    const isHighlighted = highlightJoints.includes(i);

    ctx.beginPath();
    ctx.arc(x, y, isHighlighted ? 6 : 3.5, 0, 2 * Math.PI);

    if (isHighlighted) {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FF2E63';
      ctx.shadowBlur = 14;
      ctx.fill();

      // Outer ring for highlighted joints
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, 2 * Math.PI);
      ctx.strokeStyle = '#E85A7A';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#C51F4A';
      ctx.shadowColor = '#8F1637';
      ctx.shadowBlur = 4;
      ctx.fill();
    }
  }

  ctx.restore();
}
