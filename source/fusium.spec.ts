import assert from "assert";

import { FusionOf } from "./fusium.ts";
import { inspector as inheritanceInspector, FusedAB, TraitA, TraitB, TraitC } from "./test-helpers/inheritance.ts";
import { MultipleParameters, OptionalParameter, Parameterless, RequiredParameter, inspector as instantiationInspector } from "./test-helpers/instantiation.ts";


export class FusionTests
{
    FusionOfTraitsAndCotraitsIsPossible()
    {
        const CombinedClass = FusionOf(TraitA, TraitB, TraitC);
        const instance = new CombinedClass();

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
        inheritanceInspector.testCache = [];
        const CombinedClass = FusionOf(FusedAB, TraitC);
        new CombinedClass();

        assert.deepEqual(inheritanceInspector.testCache, ["AB", "A", "B"]);
    }
}

export class InstantiationTests
{
    ConstructorsAreCalledInOrder()
    {
        const CombinedClass = FusionOf(TraitA, TraitB, TraitC);

        inheritanceInspector.testCache = [];
        const instance = new CombinedClass();
        
        assert.deepEqual(inheritanceInspector.testCache, ["A", "B", "C"]);
    }

    ConstructorParametersArePassedCorrectly()
    {
        instantiationInspector.testCache = [];

        const CombinedClass = FusionOf(OptionalParameter, RequiredParameter, MultipleParameters);
        const instance = new CombinedClass([
            { optional: 42 },
            { required: "test" },
            { start: 1, end: 10 }
        ]);

        assert.deepStrictEqual(instantiationInspector.testCache, [
            [{ optional: 42 }],
            [{ required: "test" }],
            [{ start: 1, end: 10 }]
        ]);
    }

    ConstructorParametersAreRequiredWhenAtLeastOneTraitHasRequiredParameters()
    {
        instantiationInspector.testCache = [];

        const CombinedClass = FusionOf(OptionalParameter, Parameterless, RequiredParameter);

        const instance = new CombinedClass([
            { optional: 123 },
            { required: "delivered" }
        ]);

        assert.deepStrictEqual(instantiationInspector.testCache, [
            [{ optional: 123 }],
            [],
            [{ required: "delivered" }]
        ]);
    }

    ConstructorParametersAreOptionalWhenAllTraitsHaveOptionalParameters()
    {
        instantiationInspector.testCache = [];

        const CombinedClass = FusionOf(Parameterless, OptionalParameter);
        const instance = new CombinedClass();

        assert.deepStrictEqual(instantiationInspector.testCache, [
            [],
            //undefined is expected here as we are dealing with an optional value. If the constructor's length property is greater 0 it will get a value supplied.
            [undefined]
        ]);
    }
}