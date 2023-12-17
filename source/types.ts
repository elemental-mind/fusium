export type FusedClass<Classes extends any[]> =
    Classes extends ([infer CurrentClass extends new (argsObject?: any) => any, ...infer FollowingClasses]) ? (InstanceType<CurrentClass> & FusedClass<FollowingClasses>) : unknown;

type FusedConstructorParameterSet<Classes extends (abstract new (arg?: any) => any)[]> =
    Classes extends ([infer CurrentClass extends new (arg?: any) => any, ...infer FollowingClasses extends (abstract new (arg?: any) => any)[]]) ? [...ConstructorParameters<CurrentClass>, ...FusedConstructorParameterSet<FollowingClasses>] : [];

type WithoutOptionals<Tuple extends any[]> =
    [Tuple] extends [[infer CurrentTupleMember, ...infer FollowingTupleMembers]] ? Extract<CurrentTupleMember, undefined> extends never ? [CurrentTupleMember, ...WithoutOptionals<FollowingTupleMembers>] : [...WithoutOptionals<FollowingTupleMembers>] : [];

type ConstructorParamsOptional<Tuple extends any[]> =
    WithoutOptionals<Tuple> extends [] ? true : false;

export type FusedConstructor<Classes extends (abstract new (arg?: any) => any)[]> = 
    ConstructorParamsOptional<Classes> extends true ?
    new (args?: FusedConstructorParameterSet<Classes>) => FusedClass<Classes>:
    new (args: FusedConstructorParameterSet<Classes>) => FusedClass<Classes>;
