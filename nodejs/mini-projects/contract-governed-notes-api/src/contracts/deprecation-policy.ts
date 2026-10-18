export type DeprecationPolicy = {
  operationId: string;
  deprecation: string;
  sunset: string;
  link: string;
};

export const deprecatedDemoPolicy: DeprecationPolicy = {
  operationId: "getDeprecatedDemo",
  deprecation: "true",
  sunset: "Fri, 01 Jan 2027 00:00:00 GMT",
  link: "</v1/version>; rel=\"successor-version\""
};
