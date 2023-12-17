//TypeScript type support checks. This file should not give Typescript errors.

import { Trait, CoTraits, FusionOf } from "./fusium.js";

class Parameterless extends Trait
{
    public paraless = 0;
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

class CheckFused extends FusionOf(Parameterless, OptionalParameter, RequiredParameter)
{
    constructor()
    {
        super([,{argument: "yes"}]);
    }

    checkIfMembersOnType()
    {
        this.optional = true;
        this.paraless = 100;
        this.required = "checked";
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