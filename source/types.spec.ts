//TypeScript type support checks. This file should not give Typescript errors.

import { Trait, CoTraits, FusionOf } from "./fusium.js";

//Base classes

class Parameterless extends Trait
{
    public paraless = 0;
}

class OptionalParameter extends Trait
{
    public optional = true;

    constructor(
        argument?: number
    )
    {
        super();
    }
}

class RequiredParameter extends Trait
{
    constructor(
        public required: string
    )
    {
        super();
    }
}

class PartiallyRequired extends Trait
{
    constructor(
        public required: string,
        public optional?: number 
    )
    {
        super();
    }
}

class MultipleParameters extends Trait
{
    constructor(
        public start: number,
        public end: number
    )
    {
        super();
    }
}

class TraitA extends Trait
{
    public a: string;
}

class TraitB extends CoTraits(TraitA)
{
    public b: string;
}

class TraitC extends CoTraits(TraitB)
{
    public c: string;

    method()
    {
        this.a = this.b = this.c;
    }
}

class TraitD extends FusionOf(TraitB, TraitA)
{

}

//Test cases

class CheckFused extends FusionOf(RequiredParameter, MultipleParameters, OptionalParameter, Parameterless)
{
    checkIfMembersOnType()
    {
        this.optional = true;
        this.paraless = 100;
        this.required = "checked";
        this.start = 100;
        this.end = 200;
    }
}

class CheckMemberTraitWithCoTraits extends CoTraits(RequiredParameter)
{
    constructor()
    {
        super();
    }

    checkIfMembersOnType()
    {
        this.required = "checked";
    }
}

function checkParameterOptionalisation()
{
    const FusedType = FusionOf(Parameterless, OptionalParameter, RequiredParameter, MultipleParameters);

    const permitsEmptyArrays = new FusedType([], [], ["string"], [100,200]);
    const permitsUndefined = new FusedType(undefined, undefined, ["string"], [100, 200]);

    const OptionalsOnEnd = FusionOf(RequiredParameter, OptionalParameter, Parameterless);

    const permitsOmissionOfParameterArrays = new OptionalsOnEnd(["string"]);

    const OnlyOptionals = FusionOf(OptionalParameter, Parameterless);

    const permitsOmissionOfAllParameters = new OnlyOptionals();

    const WithPartiallyOptional = FusionOf(OptionalParameter, PartiallyRequired);

    const permitsOmissionOfConstrcutorOptionals = new WithPartiallyOptional([], ["test"]);
}