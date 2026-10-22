import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { BrowserLocationService } from "../../interfaces/services/BrowserLocationService";

@EnterpriseBean("com.putgd.enterprise.impl.services.WindowLocationBrowserLocationServiceImpl")
export class WindowLocationBrowserLocationServiceImpl implements BrowserLocationService {
  public getCurrentLocationHash(): string {
    return window.location.hash;
  }

  public getCurrentLocationPathname(): string {
    return window.location.pathname;
  }
}
