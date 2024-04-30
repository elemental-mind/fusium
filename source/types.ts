export type Constructor = abstract new (...args: any) => any;

//@ts-ignore
export type FusedConstructor<Classes extends Constructor[]> = new (...args: Optionalized<FusedConstructorParameterSet<Classes>>) => FusedClass<Classes>;

export type FusedClass<Classes extends any[]> =
    Classes extends ([infer CurrentClass extends Constructor, ...infer FollowingClasses]) ? (InstanceType<CurrentClass> & FusedClass<FollowingClasses>) : unknown;

type FusedConstructorParameterSet<Classes extends Constructor[]> =
    Classes extends (
        [
            infer CurrentClass extends Constructor,
            ...infer FollowingClasses extends Constructor[]
        ]
    ) ?
    [
        AllTupleMembersIncludeType<ConstructorParameters<CurrentClass>, undefined> extends true ? ConstructorParameters<CurrentClass> | undefined : ConstructorParameters<CurrentClass>,
        //@ts-ignore
        ...Optionalized<FusedConstructorParameterSet<FollowingClasses>>
    ] :
    [];

type Optionalized<T extends any[]> = 
    AllTupleMembersIncludeType<T, undefined> extends true ? 
        MakeAllOptional<T>:
        T; 

type MakeAllOptional<T extends any[]> =
    {
        [K in keyof T]+?: T[K]
    }

//This is matching in additive types of tuple members: [(string & number), number] extends number in all members
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
