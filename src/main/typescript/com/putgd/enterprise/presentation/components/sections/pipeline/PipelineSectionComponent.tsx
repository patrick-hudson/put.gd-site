import { useEnterpriseBean } from "../../../../framework/ioc/react/EnterpriseApplicationContextReactBridge";
import type { ReadOnlyRepository } from "../../../../interfaces/repositories/ReadOnlyRepository";
import type { PipelineStop } from "../../../../model/PipelineStop";
import { SectionHeadingHeaderComponent } from "../../primitives/SectionHeadingHeaderComponent";
import { PipelineStopComponent } from "./PipelineStopComponent";

export function PipelineSectionComponent() {
  const pipelineStopRepository = useEnterpriseBean<ReadOnlyRepository<PipelineStop>>("pipelineStopRepository");
  return (
    <section className="pipeline" id="pipeline" aria-labelledby="pipeline-title">
      <SectionHeadingHeaderComponent
        sectionHeadingIdentifier="pipeline-title"
        sectionHeadingText="What happens between the key and the link"
      >
        <p>
          Every source, including a finished recording, goes through the same five stops. The windows below are the
          current nightly build on the lab desktops, not mockups.
        </p>
      </SectionHeadingHeaderComponent>
      <ol className="stops">
        {pipelineStopRepository.findAll().map((pipelineStop) => (
          <PipelineStopComponent key={pipelineStop.pipelineStopHeading} pipelineStop={pipelineStop} />
        ))}
      </ol>
    </section>
  );
}
