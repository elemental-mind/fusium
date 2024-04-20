//Engine Checks

import { CoTraits, FusionOf, Trait } from "./fusium.js";
import assert from "assert";


//#region Test Objects

class UnTraited
{
    public untraited = {};
}

class Parameterless extends Trait
{
    public paraless = 0;
}

class DerivedParameterLess extends Parameterless
{
    public derivedParaless = 0;
}

class OptionalParameter extends Trait
{
    constructor(optionalParameter?: {
        argument: number
    })
    {
        super();
    }

    public optional = true;
}

class DerivedOptional extends OptionalParameter
{
    public derivedOptional = true;
}

class RequiredParameter extends Trait
{
    constructor(requiredParameter: {
        argument: string
    })
    {
        super();
    }

    public required = "yes";
}

class DerivedRequired extends RequiredParameter
{
    public derivedRequired = "derived";
}

class TraitA extends Trait
{
    A(){}
}

class TraitB extends Trait
{
    B(){}
}

class FusedAB extends FusionOf(TraitA, TraitB)
{}

class TraitC extends CoTraits(TraitA, TraitB)
{}

//#endregion


export class RejectionTests
{
    ShouldRejectNonTraitsInFuse()
    {
        assert.throws(() => FusionOf(UnTraited));
    }

    CanAllowNonTraitsInCoTrait()
    {
        assert.doesNotThrow(() => CoTraits(UnTraited));
    }
}

export class InstanceTests
{
    instanceHasAllMembers()
    {

    }

    instanceMembersAreResolvedInCompositionOrder()
    {

    }
}