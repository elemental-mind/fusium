This serves as an explanation for the concept behind fusium.ts. 
As it is highly critical code, it has not been optimized for readability, but rather for minimizing variable allocations and function calls.

When we have a Fusion, we need to instantiate it - and this process is a little tricky, because we guarantee that each constructor function of
all the traits (and their subclasses) will be called in the order that they are declared in the Fusion.

But before we dive into understanding a Fusion's construction process, let's first understand the construction process of a normal class hierarchy: 

Imagine we have Foo, Bar and Baz where 


Baz extends Bar
Bar extends Foo
Foo extends Object (all base classes do)

If we do `const baz = new Baz()` then what happens behind the scenes could be translated to the following:
```
    const baz = Reflect.construct(Baz, [], Baz);
```
Baz's constructor which might begin like this...
```
    constructor()
    {
        super();
        //Constructor Logic
    }
```
...could also be translated into something like this:
```
    constructor()
    {
        this = Reflect.construct(Bar, [], <magical reference to the original class being constructed, Baz in this case>)
        //Constructor Logic
    }
```
The same applies to Bar's constructor and as Foo is deriving from object, its constructor could be rewritten as:
```
    constructor()
    {
        this = Object.create(<magical reference to the original class being constructed, Baz in this case>.prototype);
        //Constructor logic
    }
```

The takeaway from these modifications would result a rough call hierarchy like the following:
```
const baz = new Baz() +----------------+
       ^                               |
       |                      is internally translated to
 assign object to                      |
       |                               v
       |                     Reflect.construct(Baz, [], Baz)
Apply Baz's construct                  |
   logic to object                     |
       ^                               |
       |                               v
       |                     Reflect.construct(Bar, [], Baz) 
Apply Bar's construct                  |
   logic to object                     |
       ^                               |
       |                               v
       |                     Reflect.construct(Foo, [], Baz) 
Apply Foo's construct                  |
   logic to object                     |
       ^                               | 
       |                               v 
       +---------------------+ Object.create(Baz.prototype)
```
What's important to take away here is:
1. We transport Baz all the way down to the last object in the inheritance chain and create an object with its prototype. This object is our instance.
2. All the constructor logic is then applied in "reverse" to this created instance (it becomes `this` in the respective constructors)

Armed with this knowledge we can now look at the things that need to happen in a Fusion's instantiation process.

Imagine we have the Traits A, B, C, D, E, F. One thing that all Traits have in common is their base class `Trait`.
A Fusion is noted as Square brackets []. 
[A B] would therefore be the Fusion of A & B.

If we simply took the Fusion like this, this would break, only running A's constructor logic:

```
const fusion = new FusionOf(A, B) +----+
       ^                               |
       |                      would be internally translated to
 assign object to                      |
       |                               v
       |                     Reflect.construct(A, [], FusionOf(A,B))
Apply A's construct                    |
   logic to object                     |    ==> Here is where things go wrong! We would need to continue with Reflect.construct(B, ...)
       ^                               |
       |                               v
       |                     Reflect.construct(Trait, [], FusionOf(A,B)) 
Apply Trait's construct                |
   logic to object                     |   
       ^                               |
       +---------------------+ Object.create(FusionOf(A,B).prototype)
```
As you can see, there's no constrcutor Logic of B to be seen.

Luckily we have two things we can exploit
1. In proxies we have a `construct` trap
2. Our `Trait` class is only a placeholder, it's constrcutor logic can be omitted.

Let's combine the two and create a Proxy that dynamically routes to the next chain element:

```
const fusion = new FusionOf(A, B) +----+
       ^                               |
       |                      would be internally translated to
 assign object to                      |
       |                               v
       |                     Reflect.construct(A, [], FusionOf(A,B))
Apply A's construct                    |
   logic to object                     |   
       ^                               |
       |                               v
       |                     Reflect.construct(Trait, [], FusionOf(A,B)) 
   Omit Trait's                        |
   constructor                         |   
       ^                               v
       |                        Trait's proxy's construct tap calls
       |                     Reflect.construct(B, [], FusionOf(A,B))
Apply B's construct                    |
   logic to object                     |   
       ^                               |
       |                               v
       |                     Reflect.construct(Trait, [], FusionOf(A,B)) 
   Omit Trait's                        |
   constructor                         |   
       ^                               |
       +---------------------+ Object.create(FusionOf(A,B).prototype)
```

With this approach, we can chain as many elements together, as long as they derive from Trait (and thus hit our "dynamic constructor router" in it's proxie's construct trap).

Now the only thing that we need to do, is to let the Trait's construct trap know, where it should route to next. And that's where to module's global state variables come in. Luckily constructors are synchronous, so we can actually use module variables, as one constrcutor call to a Fusion won't be interruptible by a second unrelated call.

We now use the constructor logic of the Fusion to actually prepare the module variables when it's called. We store the fusion's Trait chain, a chain pointer as well as the Fusion's reference for the use by the Trait's proxy.

A special case happens when we have nested Fusions. When we have a Fusion within a Fusion we need to chain the embedded Fusion's chain into our original Fusion's chain. For this purpose we also keep track of so called "fusion Frames". 
If we have a normal singular Fusion, we could just simply assume that we need to instantiate the instance and return it at the end of a Fusion's chain. With nested Fusions however, when we reach the end of a chain, we need to check if we need to continue the parent's Fusion chain. We do that, by checking whether there are any Fusion Frames present and pop these into our "registers" if so and continue from there on.