export type ConstructorArgumentDefinition =
  | { readonly constructorArgumentKind: "BEAN_REFERENCE"; readonly referencedBeanIdentifier: string }
  | { readonly constructorArgumentKind: "STRING_LITERAL_VALUE"; readonly literalValue: string }
  | { readonly constructorArgumentKind: "NUMERIC_LITERAL_VALUE"; readonly literalValue: number }
  | { readonly constructorArgumentKind: "BEAN_REFERENCE_LIST"; readonly referencedBeanIdentifiers: readonly string[] }
  | { readonly constructorArgumentKind: "STRING_LITERAL_VALUE_LIST"; readonly literalValues: readonly string[] };
