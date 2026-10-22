import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { MotionPreferenceDetectionService } from "../../interfaces/services/MotionPreferenceDetectionService";

@EnterpriseBean("com.putgd.enterprise.impl.services.MatchMediaMotionPreferenceDetectionServiceImpl")
export class MatchMediaMotionPreferenceDetectionServiceImpl implements MotionPreferenceDetectionService {
  public constructor(private readonly reducedMotionMediaQuery: string) {}

  public isReducedMotionPreferredByUser(): boolean {
    return window.matchMedia(this.reducedMotionMediaQuery).matches;
  }
}
