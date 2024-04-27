import type { FusedClass, FusedConstructor } from "./types.js";

//For gzip/bzip compression purposes we use array notation.
let [currentPointer, currentChain, currentArgs, currentProtoCarrier]: [number, (new (arg?: any) => any)[] | null, any[] | null, (new (arg?: any) => any) | null] = [0, null, null, null];

class BaseComposable
{
    static [Symbol.hasInstance] = instanceOfCheck;
};

export const Trait = new Proxy(BaseComposable, {
    construct(target, args, newTarget)
    {
        if (currentChain && currentPointer < currentChain.length)
            return Reflect.construct(currentChain[currentPointer], currentChain[currentPointer++].length ? [currentArgs!.pop()] : [], currentProtoCarrier!);
        else
            return Object.create(newTarget.prototype);
    }
});

export function CoTraits<T extends (new (arg?: any) => any)[]>(...classes: T): new () => FusedClass<T>
{
    return Trait as unknown as new () => FusedClass<T>;
}

export function FusionOf<T extends (new (arg?: any) => any)[]>(...classes: T): FusedConstructor<T>
{
    //For debugging it's nice to have a named function to decern different Fusions. Hence this extra step, that could be skipped for efficiency.
    const funcNamer = new Function(`return function FusionOf_${classes.map(clss => clss.name).join("_")}(){};`);

    //We use this as our almost meaningless constructor function carrier down the constructor chain to carry the prototype for us.
    const Fused = funcNamer() as unknown as Function & {
        prototype: any,
        fusion: Set<any>;
    };

    //We go down the prototype chain of each supplied class and consolidate all functions/members of all the supplied classes into one single prototype and attach it to Joined. It will become the prototype of our constructed instances.
    Fused.prototype = classes.reduceRight((previous, current) => flattenPrototypeChain(current.prototype, previous), Object.create(Trait.prototype));
    Object.defineProperty(Fused.prototype, "constructor", { enumerable: false, value: Fused });

    //We follow the whole prototype chain of each object
    Fused.fusion = classes.reduceRight((previous, current) => extractPrototypeChainMembers(current, previous), new Set());
    Object.defineProperty(Fused, Symbol.hasInstance, { value: instanceOfCheck });

    //Despite a consolidated prototype chain, we want all the constructors of the composing classes to be called in order. Hence we intercept the construction of the fused class with a proxy
    //to run each classes constrcutor function.
    const ShadowedFusion = new Proxy(
        Fused,
        {
            construct(target: any, args: any[], newTarget: any)
            {
                //We backup any old values as we might have nested constructor calls
                //For gzip/bzip compression purposes we use array notation throught this function
                const [oldPointer, oldChain, oldArgs, oldProtoCarrier] = [currentPointer, currentChain, currentArgs, currentProtoCarrier];

                //We setup the module variables to represent the current construction process. 
                //We reverse the args to be able to "pop" them - instead of unshifting (which is less efficient).
                [currentPointer, currentChain, currentArgs, currentProtoCarrier] = [0, classes, args[0]?.reverse() ?? [], newTarget as unknown as new (arg?: any) => any];

                //We construct the first class in the chain. 
                //As the args array only contains parameters for classes with constructor args, we check if we need to supply any. If the constructor is parameterless (constructor.length === 0) we only supply an empty array.
                //As arguments are evaled left to right, we increment the pointer in the last position that we need it, to keep it at the current value throughout this construct call.
                //For gzip/bzip compression purposes we keep the call string the same as within the composable proxy handler down below. Hence the use of "currentPointer" instead of "0";
                const instance = Reflect.construct(currentChain[currentPointer], currentChain[currentPointer++].length ? [currentArgs!.pop()] : [], currentProtoCarrier);

                //We restore the state before this potentially nested constructor call
                [currentPointer, currentChain, currentArgs, currentProtoCarrier] = [oldPointer, oldChain, oldArgs, oldProtoCarrier];

                return instance;
            }
        }) as unknown as FusedConstructor<T>;

    Fused.fusion.add(Fused);
    Fused.fusion.add(ShadowedFusion);

    return ShadowedFusion;
}

function flattenPrototypeChain(prototype: any, chainAccumulator: any)
{
    if (prototype.constructor === BaseComposable) return chainAccumulator;

    const parentPrototype = Object.getPrototypeOf(prototype);
    if (parentPrototype === Object.prototype) throw new Error(`Fusium Error: Class ${prototype.constructor.name} does not derive from \`Trait\` or \`CoTraits(...)\`.`);

    flattenPrototypeChain(parentPrototype, chainAccumulator);

    Object.defineProperties(chainAccumulator, Object.getOwnPropertyDescriptors(prototype));

    return chainAccumulator;
}

function extractPrototypeChainMembers(clss: any, memberSet: Set<any>)
{
    if (clss !== Trait)
    {
        if (Object.hasOwn(clss, "fusion"))
        {
            for (const member of clss.fusion)
                memberSet.add(member);
        }
        else
        {
            memberSet.add(clss);
            extractPrototypeChainMembers(Object.getPrototypeOf(clss), memberSet);
        }
    }

    return memberSet;
}

function instanceOfCheck(this: Function & { fusion?: Set<any>; }, instance: any): boolean
{
    //We need to descend the prototype chain of the instance until we either hit
    //- null
    //- The desired constructor in the prototype chain
    //- A fusion => In that case, we can simply see if the desired constructor is in the fusion set
    const instancePrototype = Object.getPrototypeOf(instance);

    if (instancePrototype === null)
        return false;

    //Prototype is fusion
    if (Object.hasOwn(instancePrototype.constructor, "fusion"))
        //Check if "this" is part of the Fusion
        return instancePrototype.constructor.fusion.has(this);
    //Prototype is a normal class prototype, hence we imitate the normal instanceof behaviour
    else
        if (instancePrototype === this.prototype)
            return true;
        else
            //We descend further down the prototype chain of the instance
            return instanceOfCheck.call(this, instancePrototype);
}