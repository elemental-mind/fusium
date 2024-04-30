import type { Constructor, FusedClass, FusedConstructor } from "./types.js";

const fusionFrames: [number, Constructor[], any[], Constructor][] = [];
//For gzip/bzip compression purposes we use array notation.
let [currentPointer, currentChain, currentArgs, currentProtoCarrier]: [number, Constructor[] | null, any[] | null, Constructor | null] = [0, null, null, null];

class BaseComposable
{
    static [Symbol.hasInstance] = instanceOfCheck;
};

export const Trait = new Proxy(BaseComposable, {
    construct(target, args, newTarget)
    {
        if (currentChain === null)
            //This case is just a normal instantiation of the Trait (or a subclass of it) directly, without being part of a Fusion.
            return Reflect.construct(target, args, newTarget);
        else
        {
            //When we arrive here, though, we are in the process of the instantiation of a Fusion.
            //We need to check, if we arrived at the end of the current trait chain
            while (currentPointer === currentChain.length)
            {
                //If we arrived at the end of the current trait chain, we need to see, whether it was just a nested trait chain, because if so, we need to continue with the original trait chain.
                if (fusionFrames.length > 0)
                {
                    //We are done with calling all constructors of a Fusion. We pop the stack and check again (through going back through the while) whether the popped stack frame is also done.
                    [currentPointer, currentChain, currentArgs, currentProtoCarrier] = fusionFrames.pop()!;
                }
                else
                {
                    //We have arrived here, because we have arrived at the end of the trait chain and no nested trait chains are left. We hence need to create our instance.
                    const instance = Object.create(currentProtoCarrier!.prototype);
                    [currentPointer, currentChain, currentArgs, currentProtoCarrier] = [0, null, null, null];
                    return instance;
                }
            }

            return Reflect.construct(currentChain![currentPointer++], currentArgs!.shift() ?? [], currentProtoCarrier!);
        }
    }
});

export function CoTraits<T extends Constructor[]>(...classes: T): new () => FusedClass<T>
{
    return Trait as unknown as new () => FusedClass<T>;
}

export function FusionOf<T extends Constructor[]>(...classes: T): FusedConstructor<T>
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
    //to run each classes' constructor function.
    const FusedInterceptor = new Proxy(
        Fused,
        {
            construct(target: any, args: any[], newTarget: any)
            {
                //We check whether we are in a nested Fusion constrcutor call
                if (currentChain !== null)
                    //We feed the buffer as we have a nested Fusion constructor call
                    fusionFrames.push([currentPointer, currentChain, currentArgs!, currentProtoCarrier!]);

                //We setup the module variables to represent the current construction process. 
                [currentPointer, currentChain, currentArgs, currentProtoCarrier] = [0, classes, args ?? [], newTarget as unknown as new (arg?: any) => any];

                return Reflect.construct(currentChain![currentPointer++], currentArgs!.shift() ?? [], currentProtoCarrier!);
            }
        }) as unknown as FusedConstructor<T>;

    Fused.fusion.add(Fused);
    Fused.fusion.add(FusedInterceptor);

    return FusedInterceptor;
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