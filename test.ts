import { FusionTests, InstanceOfTests, InstantiationTests } from "./source/fusium.spec.ts";

const fusionTests = new FusionTests();

fusionTests.FusionOfTraitsAndCotraitsIsPossible();
fusionTests.FusionOfFusedObjectsIsPossible();
fusionTests.OverwritingOfTraitMembersIsPossible();
fusionTests.FusionOfDeeplyDerivedTraitsIsPossible();

const instantiationTests = new InstantiationTests();

instantiationTests.ConstructorsAreCalledInOrder();
instantiationTests.ConstructorParametersArePassedCorrectly();
instantiationTests.ConstructorParametersAreOptionalWhenAllTraitsHaveOptionalParameters();
instantiationTests.ConstructorParametersAreRequiredWhenAtLeastOneTraitHasRequiredParameters();

const instanceOfTests = new InstanceOfTests();

instanceOfTests.Traits()
instanceOfTests.DerivativeOfTrait()
instanceOfTests.DeepDerivativeOfTrait();

instanceOfTests.SimpleFusionOf();
instanceOfTests.NestedFusionOf();

instanceOfTests.DerivativeOfFusion();
instanceOfTests.DeepDerivativeOfFusion();

console.log("All tests passed");