import { Trait } from "../fusium.js";

export const inspector = { testCache: [] as any[] };

export class Parameterless extends Trait
{
    public paraless = 0;

    constructor()
    {
        inspector.testCache.push([...arguments]);
        super();
    }
}

export class OptionalParameter extends Trait
{
    public optional = 0;

    constructor(optionalParameter?: {
        optional: number;
    })
    {
        inspector.testCache.push([...arguments]);
        super();
        if(optionalParameter)
            this.optional = optionalParameter.optional;
    }
}

export class RequiredParameter extends Trait
{
    public required = "yes";

    constructor(requiredParameter: {
        required: string;
    })
    {
        inspector.testCache.push([...arguments]);
        super();
        this.required = requiredParameter.required;
    }
}

export class MultipleParameters extends Trait
{
    public start: number;
    public end: number;

    constructor(multiParameter: {
        start: number,
        end: number;
    })
    {
        inspector.testCache.push([...arguments]);
        super();
        this.start = multiParameter.start;
        this.end = multiParameter.end;
    }
}