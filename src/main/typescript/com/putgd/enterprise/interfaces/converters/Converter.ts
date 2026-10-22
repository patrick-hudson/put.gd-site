export interface Converter<TConverterSource, TConverterTarget> {
  convert(converterSource: TConverterSource): TConverterTarget;
}
