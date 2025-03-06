

export type AnyObject<T extends object | (new () => object) = object> = T extends new (...args: any[]) => any ? InstanceType<T> : T;