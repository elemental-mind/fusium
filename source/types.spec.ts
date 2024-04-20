//TypeScript type support checks. This file should not give Typescript errors.

import { Trait, CoTraits, FusionOf } from "./fusium.js";

class Parameterless extends Trait
{
    public paraless = 0;
}

class OptionalParameter extends Trait
{
    public optional = true;

    constructor(optionalParameter?: {
        argument: number;
    })
    {
        super();
    }
}

class RequiredParameter extends Trait
{
    public required = "yes";

    constructor(requiredParameter: {
        argument: string;
    })
    {
        super();
    }
}

class MultipleParameters extends Trait
{
    public start: number;
    public end: number;

    constructor(multiParameter: {
        start: number,
        end: number;
    })
    {
        super();
        this.start = multiParameter.start;
        this.end = multiParameter.end;
    }
}

class CheckFused extends FusionOf(Parameterless, OptionalParameter, RequiredParameter, MultipleParameters)
{
    constructor()
    {
        super([, { argument: "yes" }, { start: 100, end: 200 }]);
    }

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