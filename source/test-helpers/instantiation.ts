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
    constructor(
        public optional?: number
    )
    {
        inspector.testCache.push([...arguments]);
        super();
    }
}

export class RequiredParameter extends Trait
{
    constructor(
        public required: string
    )
    {
        inspector.testCache.push([...arguments]);
        super();
    }
}

export class MultipleParameters extends Trait
{
    constructor(
        public start: number,
        public end: number
    )
    {
        inspector.testCache.push([...arguments]);
        super();
    }
}