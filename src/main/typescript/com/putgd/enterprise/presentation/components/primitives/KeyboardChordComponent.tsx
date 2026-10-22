export interface KeyboardChordComponentProperties {
  readonly keyboardKeyLabels: readonly string[];
}

export function KeyboardChordComponent(keyboardChordComponentProperties: KeyboardChordComponentProperties) {
  return (
    <>
      {keyboardChordComponentProperties.keyboardKeyLabels.map((keyboardKeyLabel, keyboardKeyIndex) => (
        <kbd key={keyboardKeyIndex}>{keyboardKeyLabel}</kbd>
      ))}
    </>
  );
}
