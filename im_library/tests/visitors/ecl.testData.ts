export default {
  orGroupMinusOrGroup:
    "/* or group minus or group*/ (<<386725007 | Body temperature (observable entity) |   OR <<431314004 | Peripheral oxygen saturation (observable entity) |) MINUS (<<838441000000103 | Target body mass index (observable entity) |  OR <<838451000000100 | Target body mass index  | ) ",
  allergyToPenicillinsOrCephasporinsWithCausativeLactams:
    "/*allergy to penicillins or cephasporins with causative lactams*/	(<<91936005 | Allergy to Penicillin| or <<294532003):  << 246075003 |Causative agent (attribute)| = <<771577000| lactam (substance)|",
  andGroupedWithSubsumptionAttributeValue:
    "/*and grouped with subsumption attribute value*/	<<298705000 |Finding of region of thorax (finding)| and (<<301366005 |Pain of truncal structure (finding)| :{ 363698007 |Finding site (attribute)| =  <<51185008 |Thoracic structure (body structure)| })",
  andNoAttributeGroup:
    "/*and no attribute group*/	(<<298705000 |Finding of region of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ): <<762705008 =  <<51185008 |Thoracic structure (body structure)|",
  andWithRefinementOfSecondConcept:
    "/*and with refinement of second concept*/	<<298705000 |Finding of region of thorax (finding)| and (<<301366005 |Pain of truncal structure (finding)| :{ 363698007 |Finding site (attribute)| = 51185008 |Thoracic structure (body structure)| })",
  andWithSubsumptionPropertyValue:
    "/*and with subsumption property and value*/	<<298705000 |Finding of region of thorax (finding)| and (<<301366005 |Pain of truncal structure (finding)| : { <<762705008 =  <<51185008 |Thoracic structure (body structure)| })",
  bracketedAnd:
    "/*bracketed and*/	(<<298705000 |Finding of region 2of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ):{ <<762705008 =  <<51185008 |Thoracic structure (body structure)| }",
  descendantsAndSelf: "/*Descendants and self*/	<<29857009",
  descendantsNotSelf: "/*Descendants not self*/	<29857009",
  mergedGroupError:
    "/*merged group error*/	<<225399009 |Pain assessment (procedure)| :{ <<260686004 |Method (attribute)| =  <<129265001 |Evaluation - action (qualifier value)| ,<<363702006 |Has focus (attribute)| = <<29857009 |Chest pain (finding)| }",
  minusAConcept:
    "/*minus a concept*/	((<<298705000 |Finding of region of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ): { <<762705008 =  <<51185008 |Thoracic structure (body structure)| })minus <<426396005 |Cardiac chest pain (finding)|",
  minusAWildCardRefined:
    "/*minus a wild card refined*/	((<<298705000 |Finding of region of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)| ): { <<762705008 =  <<51185008 |Thoracic structure (body structure)| })minus (*: { 363698007 |Finding site (attribute)| = 722725008 |Structure of right sternoclavicular joint (body structure)| })",
  oralNsaids: "/*oral nsaids*/<<763158003:<<127489000= <<372665008,<<411116001= 385268001",
  simpleAndDescendants: "/*simple and descendants*/	<298705000 and <301366005 |Pain of truncal structure (finding)|",
  simpleAndShouldBe0: "/*simple and should be 0*/	298705000 and 301366005 |Pain of truncal structure (finding)|",
  singleConcept: "/*Single concept*/	29857009",
  twoAttributeGroups:
    "/*two attribute groups*/	<<225399009 |Pain assessment (procedure)|:{ <<260686004 |Method (attribute)| =  <<129265001 |Evaluation - action (qualifier value)| },{ <<363702006 |Has focus (attribute)| = <<29857009 |Chest pain (finding)| }",
  ungroupedButSeparateGroups:
    "/*ungrouped but seperate groups*/	<<225399009 |Pain assessment (procedure)|:<<260686004 |Method (attribute)| =  <<129265001 |Evaluation - action (qualifier value)| ,<<363702006 |Has focus (attribute)| = <<29857009 |Chest pain (finding)|",
  unionWithRefinement: "/*union with refinements*/	(<<116536008 or <<350312004):<<127489000 = <<372665008, <<411116001 = <<385268001",
  minusWithGroups:
    "(<<763158003 | Medicinal product (product) | : <<127489000 | Has active ingredient (attribute) | = <<372695000 | Diuretic (substance) |    AND 8940601000001102 = 8940901000001109AND 8940001000001105 = 8940201000001104)    MINUS (<<763158003 | Medicinal product (product) | : 8940601000001102 = 8941001000001100)",
  orRefinement:
    "<<763158003 | Medicinal Product| : <<127489000|has active ingredient| = << 698090000 |Apixaban (substance) | OR <<127489000|has active ingredient| =<<442031002 | Rivaroxaban (product) |",
  multipleOrRefinement:
    "<<763158003 | Medicinal Product |: <<127489000|has active ingredient |= <<698090000 | Apixaban (substance) | OR <<127489000|has active ingredient| = <<442031002 | Rivaroxaban (substance)| OR <<127489000|has active ingredient|= << 698871007| Dabigatran (substance)| OR <<127489000|has active ingredient|= << 712778008| Edoxaban (substance)| OR <<127489000|has active ingredient|= << 387260007| Phenindione (substance) | OR <<127489000|has active ingredient|= << 59488002 | Warfarin sodium (substance) | OR <<127489000|has active ingredient|= << 372756006| Warfarin (substance)|",
  refinementConjunctionWithGroup:
    "<< 763158003 | Medicinal product (product) | : << 127489000 | Has active ingredient (attribute) | = << 387207008 | Ibuprofen (substance) | AND ( << 411116001 | Has manufactured dose form (attribute) | = << 763820000 | Gastro-resistant oral suspension (dose form) | OR  << 411116001 | Has manufactured dose form (attribute) | = << 421701006 | Soluble tablet (qualifier value) | )",
  startGroupedConceptWithRefinement:
    "(<< 763158003 | Medicinal product (product) |) : << 127489000 | Has active ingredient (attribute) | = << 387207008 | Ibuprofen (substance) |",
  groupedAnd: "(<<298705000 |Finding of region of thorax (finding)| and <<298705001 ) ",
  groupedConceptsWithSharedRefinement:
    "(<<298705000 |Finding of region of thorax (finding)| and <<301366005 |Pain of truncal structure (finding)|) :{ 363698007 |Finding site (attribute)| =  <<51185008 |Thoracic structure (body structure)| }"
};
