import assert from "assert";

import { FusionOf, Trait } from "./fusium.ts";
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

    FusionOfDeeplyDerivedTraitsIsPossible()
    {
        class A extends Trait 
        {
            a() { }
        }

        class B extends A
        {
            b() { }
        }

        class Combined extends FusionOf(A, B, TraitC)
        {

        }
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
        const instance = new CombinedClass([42], ["test"], [100, 200]);

        assert.deepStrictEqual(instantiationInspector.testCache, [
            [42],
            ["test"],
            [100, 200]
        ]);
    }

    ConstructorParametersAreRequiredWhenAtLeastOneTraitHasRequiredParameters()
    {
        instantiationInspector.testCache = [];

        const CombinedClass = FusionOf(OptionalParameter, Parameterless, RequiredParameter);

        const instance = new CombinedClass([], [], ["test"]);

        assert.deepStrictEqual(instantiationInspector.testCache, [
            [],
            [],
            ["test"]
        ]);
    }

    ConstructorParametersAreOptionalWhenAllTraitsHaveOptionalParameters()
    {
        instantiationInspector.testCache = [];

        const CombinedClass = FusionOf(Parameterless, OptionalParameter);
        const instance = new CombinedClass();

        assert.deepStrictEqual(instantiationInspector.testCache, [
            [],
            []
        ]);
    }
}

export class InstanceOfTests
{
    Traits()
    {
        const traitInstance = new TraitA();

        assert(traitInstance instanceof TraitA);
        assert(!(traitInstance instanceof TraitB));
    }

    DerivativeOfTrait()
    {
        class DerivedFromTraitA extends TraitA
        {
            additionalMethod() { }
        }

        const derivedInstance = new DerivedFromTraitA();

        assert(derivedInstance instanceof DerivedFromTraitA);
        assert(derivedInstance instanceof TraitA);
    }

    DeepDerivativeOfTrait()
    {
        class DerivedFromTraitA extends TraitA
        {
            additionalMethod() { }
        }

        class MoreDeeplyDerived extends DerivedFromTraitA
        {
            evenMoreAdditionalMethod() { }
        }

        const moreDeeplyDerivedInstance = new MoreDeeplyDerived();

        assert(moreDeeplyDerivedInstance instanceof MoreDeeplyDerived);
        assert(moreDeeplyDerivedInstance instanceof DerivedFromTraitA);
        assert(moreDeeplyDerivedInstance instanceof TraitA);
    }

    SimpleFusionOf()
    {
        const CombinedClass = FusionOf(TraitA, TraitB);

        const instance = new CombinedClass();

        assert(instance instanceof CombinedClass);
        assert(instance instanceof TraitA);
        assert(instance instanceof TraitB);
    }

    NestedFusionOf()
    {
        const FirstLevelFusion = FusionOf(TraitA, TraitB);
        const NestedCombinedClass = FusionOf(FirstLevelFusion, TraitC);
        const instance = new NestedCombinedClass();

        assert(instance instanceof NestedCombinedClass);
        assert(instance instanceof FirstLevelFusion);
        assert(instance instanceof TraitA);
        assert(instance instanceof TraitB);
        assert(instance instanceof TraitC);
    }

    DerivativeOfFusion()
    {
        const FirstLevelFusion = FusionOf(TraitA, TraitB);

        class Test extends FirstLevelFusion
        {
            testFunction()
            {

            }
        }

        const instance = new Test();

        assert(instance instanceof Test);
        assert(instance instanceof FirstLevelFusion);
        assert(instance instanceof TraitA);
        assert(instance instanceof TraitB);
    }

    DeepDerivativeOfFusion()
    {
        const FirstLevelFusion = FusionOf(TraitA, TraitB);

        class Test extends FirstLevelFusion { }
        class NestedTest extends Test { };

        const instance = new NestedTest();

        assert(instance instanceof NestedTest);
        assert(instance instanceof Test);
        assert(instance instanceof FirstLevelFusion);
        assert(instance instanceof TraitA);
        assert(instance instanceof TraitB);
    }
}