import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ReadOnlyRepository } from "../../../../interfaces/repositories/ReadOnlyRepository";
import type { ProductDetailEntry } from "../../../../model/ProductDetailEntry";

export function DetailsSectionComponent() {
  const productDetailEntryRepository = useEnterpriseBean<ReadOnlyRepository<ProductDetailEntry>>("productDetailEntryRepository");
  return (
    <section className="details" aria-labelledby="details-title">
      <h2 id="details-title">Details</h2>
      <dl>
        {productDetailEntryRepository.findAll().map((productDetailEntry) => (
          <div key={productDetailEntry.productDetailTerm}>
            <dt>{productDetailEntry.productDetailTerm}</dt>
            <dd>{productDetailEntry.productDetailDefinition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
