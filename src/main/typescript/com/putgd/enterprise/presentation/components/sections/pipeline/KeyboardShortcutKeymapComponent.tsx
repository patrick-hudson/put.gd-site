import type { KeyboardShortcutBinding } from "../../../../model/KeyboardShortcutBinding";
import { KeyboardChordComponent } from "../../primitives/KeyboardChordComponent";

export interface KeyboardShortcutKeymapComponentProperties {
  readonly keyboardShortcutBindings: readonly KeyboardShortcutBinding[];
}

export function KeyboardShortcutKeymapComponent(keyboardShortcutKeymapComponentProperties: KeyboardShortcutKeymapComponentProperties) {
  if (keyboardShortcutKeymapComponentProperties.keyboardShortcutBindings.length === 0) {
    return null;
  }
  return (
    <dl className="keymap">
      {keyboardShortcutKeymapComponentProperties.keyboardShortcutBindings.map((keyboardShortcutBinding) => (
        <div key={keyboardShortcutBinding.boundActionDescription}>
          <dt>
            <KeyboardChordComponent keyboardKeyLabels={keyboardShortcutBinding.keyboardKeyLabels} />
          </dt>
          <dd>{keyboardShortcutBinding.boundActionDescription}</dd>
        </div>
      ))}
    </dl>
  );
}
