import { FusionTests } from "./source/fusium.spec.ts";

const testClass = new FusionTests();

testClass.ConstructorsAreCalledInOrder();

testClass.FusionOfTraitsAndCoTraitsIsPossible();

testClass.FusionOfFusedObjectsIsPossible()

console.log("All tests passed");