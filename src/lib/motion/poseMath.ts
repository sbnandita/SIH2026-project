import { LandmarkPoint } from '../../types';

export function calculateAngle(
  pointA: LandmarkPoint,
  pointB: LandmarkPoint,
  pointC: LandmarkPoint
): number {
  if (!pointA || !pointB || !pointC) return 180;

  const radians = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x) -
                  Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
  
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

export function calculateDistance(pointA: LandmarkPoint, pointB: LandmarkPoint): number {
  if (!pointA || !pointB) return 0;
  return Math.sqrt(
    Math.pow(pointA.x - pointB.x, 2) + 
    Math.pow(pointA.y - pointB.y, 2)
  );
}

// Low-pass exponential smoothing filter for angles to eliminate camera jitter
export class AngleFilter {
  private alpha: number;
  private prevValue: number | null = null;

  constructor(alpha: number = 0.4) {
    this.alpha = alpha;
  }

  filter(value: number): number {
    if (this.prevValue === null) {
      this.prevValue = value;
      return value;
    }
    const smoothed = this.alpha * value + (1 - this.alpha) * this.prevValue;
    this.prevValue = smoothed;
    return Math.round(smoothed);
  }

  reset() {
    this.prevValue = null;
  }
}
