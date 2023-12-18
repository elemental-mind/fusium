import type { FusedClass, FusedConstructor } from "./types.js";

//For gzip/bzip compression purposes we use array notation.
let [currentPointer, currentChain, currentArgs, currentProtoCarrier]: [number, (new (arg?: any) => any)[] | null, any[] | null, (new (arg?: any) => any) | null] = [0, null, null, null];

class BaseComposable { };
export const Trait = new Proxy(BaseComposable, {
    construct()
    {
        if (currentChain && currentPointer < currentChain.length)
            return Reflect.construct(currentChain[currentPointer], currentChain[currentPointer++].length ? [currentArgs!.pop()] : [], currentProtoCarrier!);
        else
            return Object.create(currentProtoCarrier?.prototype ?? Object.prototype);
    }
});

export const Composable = Trait;

export function CoTraits<T extends (new(arg?: any) => any)[]>(...classes: T): new () => FusedClass<T>
{
    return Trait as unknown as new () => FusedClass<T>;
}

export function FusionOf<T extends(new(arg?: any) => any)[]>(...classes: T): FusedConstructor<T>
{
    //We use this as our almost meaningless constructor function carrier down the constructor chain to carry the prototype for us.
    function Fused() { };
    //We go down the prototype chain of each supplied class and consolidate all functions/members of all the supplied classes into one single prototype and attach it to Joined. It will become the prototype of our constructed instances.
    Fused.prototype = classes.reduceRight((previous, current) => flattenPrototypeChain(current.prototype, previous), {});;

    return new Proxy(
        Fused,
        {
            construct(target, args, newTarget)
            {
                //We backup any old values as we might have nested constructor calls
                //For gzip/bzip compression purposes we use array notation throught this function
                const [oldPointer, oldChain, oldArgs, oldProtoCarrier] = [currentPointer, currentChain, currentArgs, currentProtoCarrier];

                //We setup the module variables to represent the current construction process. 
                //We reverse the args to be able to "pop" them - instead of unshifting (which is less efficient).
                [currentPointer, currentChain, currentArgs, currentProtoCarrier] = [0, classes, args.reverse(), newTarget as unknown as new (arg?: any) => any];

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
}

function flattenPrototypeChain(prototype: any, chainAccumulator: any)
{
    const parentPrototype = Object.getPrototypeOf(prototype);
    if (prototype.constructor === BaseComposable) return chainAccumulator;
    if (parentPrototype === Object.prototype) throw new Error(`Fusium Error: Class ${prototype.constructor.name} does not derive from \`Trait\` or \`CoTraits(...)\`.`);

    flattenPrototypeChain(parentPrototype, chainAccumulator);

    Object.defineProperties(chainAccumulator, Object.getOwnPropertyDescriptors(prototype));
    delete chainAccumulator.constructor;

    return chainAccumulator;
}