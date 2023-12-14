export type FusedClass<Classes extends any[]> =
    Classes extends ([infer CurrentClass extends new (argsObject?: any) => any, ...infer FollowingClasses]) ? (InstanceType<CurrentClass> & FusedClass<FollowingClasses>) : unknown;

type FusedConstructorParameterSet<Classes extends (abstract new (arg?: any) => any)[]> =
    Classes extends ([infer CurrentClass extends new (arg?: any) => any, ...infer FollowingClasses extends (abstract new (arg?: any) => any)[]]) ? [...ConstructorParameters<CurrentClass>, ...FusedConstructorParameterSet<FollowingClasses>] : [];

type WithoutOptionals<Tuple extends any[]> =
    [Tuple] extends [[infer CurrentTupleMember, ...infer FollowingTupleMembers]] ? Extract<CurrentTupleMember, undefined> extends never ? [CurrentTupleMember, ...WithoutOptionals<FollowingTupleMembers>] : [...WithoutOptionals<FollowingTupleMembers>] : [];

type OptionalIfAllTupleMembersOptional<Tuple extends any[]> =
    WithoutOptionals<Tuple> extends [] ? Tuple | undefined : Tuple;

export type FusedConstructor<Classes extends (abstract new (arg?: any) => any)[]> = new (args: OptionalIfAllTupleMembersOptional<FusedConstructorParameterSet<Classes>>) => FusedClass<Classes>;
