import { CoTraits, FusionOf, Trait } from "../fusium.js";

export const inspector = { testCache: [] as string[] };

export class TraitA extends Trait
{
    constructor()
    {
        inspector.testCache.push("A");
        super();
    }

    A()
    {
        return "A";
    }
}

export class TraitB extends Trait
{
    constructor()
    {
        inspector.testCache.push("B");
        super();
    }

    B()
    {
        return "B";
    }
}

export class TraitC extends CoTraits(TraitA, TraitB)
{
    constructor()
    {
        inspector.testCache.push("C");
        super();
    }

    C()
    {
        return `${this.A()} + ${this.B()} + C`;
    };
}

export class FusedAB extends FusionOf(TraitA, TraitB)
{
    constructor()
    {
        inspector.testCache.push("AB");
        super();
    }

    A()
    {
        return "AB.A";
    }

    AB()
    {
        return "AB";
    }
}