export type FusedClass<Classes extends any[]> =
    Classes extends ([infer CurrentClass extends new (argsObject?: any) => any, ...infer FollowingClasses]) ? (InstanceType<CurrentClass> & FusedClass<FollowingClasses>) : unknown;

type FusedConstructorParameterSet<Classes extends (abstract new (arg?: any) => any)[]> =
    Classes extends ([infer CurrentClass extends new (arg?: any) => any, ...infer FollowingClasses extends (abstract new (arg?: any) => any)[]]) ? [...ConstructorParameters<CurrentClass>, ...FusedConstructorParameterSet<FollowingClasses>] : [];


type AllConstructorParamsOptional<Classes extends (abstract new (arg?: any) => any)[]> =
    AllTupleMembersExtendType<
        AllOptional<
            ConstructParamsOf<Classes>
        >
    , true
    >;

type ConstructParamsOf<T extends any[]> = {
    [K in keyof T]: ConstructorParameters<T[K]>;
};

type AllOptional <T extends any[][]> = {
    [K in keyof T]: 
        T[K] extends [] ?
            true:
            AllTupleMembersIncludeType<T[K], undefined>
};

type AllTupleMembersExtendType<Tuple extends any[], ConditionType> =
    Tuple extends [infer First, ...infer Rest] ?
    First extends ConditionType ?
        AllTupleMembersExtendType<Rest, ConditionType>
        : false
    : true;

type AllTupleMembersIncludeType<Tuple extends any[], ConditionType> =
    Tuple extends [infer First, ...infer Rest] ?
    ConditionType extends First ?
        AllTupleMembersIncludeType<Rest, ConditionType>
        : false
    : true;

export type FusedConstructor<Classes extends (abstract new (arg?: any) => any)[]> =
    AllConstructorParamsOptional<Classes> extends true ?
    new (args?: FusedConstructorParameterSet<Classes>) => FusedClass<Classes> :
    new (args: FusedConstructorParameterSet<Classes>) => FusedClass<Classes>;