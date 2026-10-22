export interface Formatter<TFormatterInput> {
  format(formatterInput: TFormatterInput): string;
}
