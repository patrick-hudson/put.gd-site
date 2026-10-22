import { useEnterpriseBean } from "../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { AssetPathResolver } from "../../../interfaces/resolvers/AssetPathResolver";

export interface BrandMarkComponentProperties {
  readonly brandLogoSizeInPixels: number;
  readonly brandMarkAccessibleLabel?: string;
}

export function BrandMarkComponent(brandMarkComponentProperties: BrandMarkComponentProperties) {
  const assetPathResolver = useEnterpriseBean<AssetPathResolver>("assetPathResolver");
  return (
    <a className="brand" href="/" aria-label={brandMarkComponentProperties.brandMarkAccessibleLabel}>
      <img
        src={assetPathResolver.resolveAssetPath("logo.svg")}
        alt=""
        width={brandMarkComponentProperties.brandLogoSizeInPixels}
        height={brandMarkComponentProperties.brandLogoSizeInPixels}
      />
      <span>put.gd</span>
    </a>
  );
}
