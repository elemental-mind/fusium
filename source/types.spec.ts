//TypeScript type support checks. This file should not give Typescript errors.

import { Trait, CoTraits, FusionOf } from "./fusium.js";

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
    public required = "yes";

    constructor(
        argument: string
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

class CheckFused extends FusionOf(RequiredParameter, MultipleParameters, OptionalParameter, Parameterless)
{
    constructor()
    {
        super(["yes"], [100, 200]);
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