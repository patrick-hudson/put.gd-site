import { EnterpriseBean } from "../../framework/ioc/EnterpriseBean";
import type { RepeatedCharacterSequenceGenerator } from "../../interfaces/generators/RepeatedCharacterSequenceGenerator";

@EnterpriseBean("com.putgd.enterprise.impl.generators.SingleCharacterRepeatingSequenceGeneratorImpl")
export class SingleCharacterRepeatingSequenceGeneratorImpl implements RepeatedCharacterSequenceGenerator {
  public constructor(private readonly characterToRepeat: string) {}

  public generateRepeatedCharacterSequence(sequenceLength: number): string {
    return this.characterToRepeat.repeat(sequenceLength);
  }
}
