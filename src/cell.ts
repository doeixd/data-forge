import { Result } from "surrealdb.js";
import { AnyObject } from "./types";

export interface Cell <Output> {
  readonly name: string;
  readonly primitiveType: string;
  readonly typescriptType: Output;
  readonly version: number;
  readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
}


export function cell<T extends AnyObject<object>>(arg: Cell<T>): Cell<T> {
  return arg
}


const string = cell({
  
})