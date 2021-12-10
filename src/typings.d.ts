type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type TruthyKeys<T> = {
  [key in keyof T]: T[key] extends false | undefined | null ? never : key;
}[keyof T];

export type TrueKeys<T> = TruthyKeys<Pick<T, RequiredKeys<T>>>;
