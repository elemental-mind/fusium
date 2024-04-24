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

//We need an additional check for empty parameter arrays
type AllOptional<T extends any[][]> = {
    [K in keyof T]: 
        T[K] extends [] ?
            true:
            AllTupleMembersIncludeType<T[K], undefined>
};

//This is matching in addiditive types of tuple members: [(string & number), number] extends number in all members
type AllTupleMembersExtendType<Tuple extends any[], ExtendedType> =
    Tuple extends [infer First, ...infer Rest] ?
    First extends ExtendedType ?
        AllTupleMembersExtendType<Rest, ExtendedType>
        : false
    : true;

//This is matching in intersection types of tuple members: [(string | number | undefined), undefined] includes undefined in all members
type AllTupleMembersIncludeType<Tuple extends any[], IncludedType> =
    Tuple extends [infer First, ...infer Rest] ?
    IncludedType extends First ?
        AllTupleMembersIncludeType<Rest, IncludedType>
        : false
    : true;

export type FusedConstructor<Classes extends (abstract new (arg?: any) => any)[]> =
    AllConstructorParamsOptional<Classes> extends true ?
    new (args?: FusedConstructorParameterSet<Classes>) => FusedClass<Classes> :
    new (args: FusedConstructorParameterSet<Classes>) => FusedClass<Classes>;