class ParameterLess {
  constructor() { }
}

class Parametered {
  constructor(param1: string, param2: number) { }
}

class Parametered2
{
    constructor(param3: string, param4: number) {}
}

type GenericConstructor = abstract new (...args: any) => any;
type ParaLessConstructor = abstract new () => any;

type IsClassConstructor<T> =
  T extends GenericConstructor ? true : false;

type IsParameterLess<T extends abstract new (...args: any) => any> =
  T extends ParaLessConstructor ? true : false;

type Result1 = IsClassConstructor<typeof ParameterLess>; 
type Result2 = IsClassConstructor<typeof Parametered>;
type Result3 = IsClassConstructor<string>;
type Result4 = IsParameterLess<typeof ParameterLess>; 
type Result5 = IsParameterLess<typeof Parametered>;

type CombinedParameters<T extends GenericConstructor[]> = {
    [K in keyof T]: ConstructorParameters<T[K]>;
}

type Flattened<T extends any[][]> = T extends [infer A extends any[], ...infer B extends any[][]] ? [...A extends [] ? [undefined] : A, ...Flattened<B>] : [];

type clssArray = [typeof Parametered, typeof ParameterLess, typeof Parametered2];
type combined = CombinedParameters<clssArray>;
type flat = Flattened<CombinedParameters<[typeof Parametered, typeof ParameterLess, typeof Parametered2]>>;
type CombinedConstructor<T extends any[]> = new(...args: Flattened<combined>) => any;