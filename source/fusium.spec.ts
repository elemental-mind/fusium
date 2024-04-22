//Engine Checks

import { CoTraits, FusionOf, Trait } from "./fusium.js";
import assert from "assert";

let testCache: string[];

//#region Test Objects
class TraitA extends Trait
{
    constructor()
    {
        super();
        testCache.push("A");
    }

    A()
    {
        return "A";
    }
}

class TraitB extends Trait
{
    constructor()
    {
        super();
        testCache.push("B");
    }

    B()
    {
        return "B";
    }
}

class TraitC extends CoTraits(TraitA, TraitB)
{
    constructor()
    {
        super();
        testCache.push("C");
    }

    C()
    {
        return `${this.A()} + ${this.B()} + C`;
    };
}

class FusedAB extends FusionOf(TraitA, TraitB)
{
    constructor()
    {
        super([]);
        testCache.push("AB");
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

//#endregion

//#region BaseClassTests

export class FusionTests
{
    ConstructorsAreCalledInOrder()
    {
        const CombinedClass = FusionOf(TraitA, TraitB, TraitC);

        testCache = [];
        const instance = new CombinedClass([]);

        assert.deepEqual(testCache, ["C", "B", "A"]);
    }

    FusionOfTraitsAndCotraitsIsPossible()
    {
        const CombinedClass = FusionOf(TraitA, TraitB, TraitC);
        const instance = new CombinedClass([]);

        assert(instance.A() === "A");
        assert(instance.B() === "B");
        assert(instance.C() === "A + B + C");
    }

    OverwritingOfTraitMembersIsPossible()
    {
        const instance = new FusedAB();
        
        assert(instance.A() === "AB.A");
        assert(instance.AB() === "AB");
    }

    FusionOfFusedObjectsIsPossible()
    {
        testCache = [];
        const CombinedClass = FusionOf(FusedAB, TraitC);
        new CombinedClass([]);

        assert.deepEqual(testCache, ["B", "A", "AB"]);
    }
}