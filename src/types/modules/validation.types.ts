export type TValidationTemplate<A extends Array<any> = Array<any>> = {
  isSuccess?: (data: unknown, ...args: A) => data is unknown;
  isError?: (data: unknown, ...args: A) => data is unknown;
  onSuccess?: (props: { validData: any }, ...args: A) => void;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  onError?: (props: { validError: any | null; data: unknown }, ...args: A) => void;
};
export type TValidationBase<A extends Array<any>> = Record<PropertyKey, TValidationTemplate<A>>;
