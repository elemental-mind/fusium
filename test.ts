import { FusionTests, InstantiationTests } from "./source/fusium.spec.ts";

const fusionTests = new FusionTests();

fusionTests.FusionOfTraitsAndCotraitsIsPossible();
fusionTests.FusionOfFusedObjectsIsPossible();
fusionTests.OverwritingOfTraitMembersIsPossible();

const instantiationTests = new InstantiationTests();

instantiationTests.ConstructorsAreCalledInOrder();
instantiationTests.ConstructorParametersAreOptionalWhenAllTraitsHaveOptionalParameters();
instantiationTests.ConstructorParametersAreRequiredWhenAtLeastOneTraitHasRequiredParameters();
instantiationTests.ConstructorParametersAreRequiredWhenAtLeastOneTraitHasRequiredParameters();

console.log("All tests passed");