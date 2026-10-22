import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { ReadOnlyRepository } from "../../interfaces/repositories/ReadOnlyRepository";
import type { ProductDetailEntry } from "../../model/ProductDetailEntry";

@EnterpriseBean("com.putgd.enterprise.impl.repositories.HardcodedProductDetailEntryRepositoryImpl")
export class HardcodedProductDetailEntryRepositoryImpl implements ReadOnlyRepository<ProductDetailEntry> {
  public findAll(): readonly ProductDetailEntry[] {
    return [
      { productDetailTerm: "Desktops", productDetailDefinition: "Cinnamon on X11; GNOME 50 and KDE Plasma 6 on Wayland" },
      { productDetailTerm: "Storage", productDetailDefinition: "Any S3-compatible bucket; Proton Drive (experimental)" },
      { productDetailTerm: "Recording formats", productDetailDefinition: "MP4 (H.264, H.265), WebM (VP9), GIF, animated WebP; VA-API and NVENC where available" },
      { productDetailTerm: "Idle footprint", productDetailDefinition: "One resident process; under 40 MiB with helpers started on demand" },
      { productDetailTerm: "Network", productDetailDefinition: "Talks to your storage endpoint and nothing else" },
      { productDetailTerm: "Built with", productDetailDefinition: "C++20 and Qt 6, MIT licensed" },
    ];
  }
}
