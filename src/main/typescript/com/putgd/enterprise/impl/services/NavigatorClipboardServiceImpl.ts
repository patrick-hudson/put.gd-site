import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ClipboardService } from "../../interfaces/services/ClipboardService";

@EnterpriseBean("com.putgd.enterprise.impl.services.NavigatorClipboardServiceImpl")
export class NavigatorClipboardServiceImpl implements ClipboardService {
  public writeTextToClipboard(textToWrite: string): Promise<void> {
    return navigator.clipboard.writeText(textToWrite);
  }
}
