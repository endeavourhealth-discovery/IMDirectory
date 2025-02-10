import { translateFromEntityBundle } from "@/helpers/GraphTranslator";

describe("GraphTranslator", () => {
  describe("translateFromEntityBundle", () => {
    it("can translateFromEntityBundle", () => {
      const testBundle = {
        entity: {
          "@id": "http://snomed.info/sct#105590001",
          "http://endhealth.info/im#isA": [
            {
              "@id": "http://www.w3.org/2000/01/rdf-schema#Class",
              name: "Class"
            },
            {
              "@id": "http://www.w3.org/2000/01/rdf-schema#Resource",
              name: "Resource"
            },
            {
              "@id": "http://endhealth.info/im#Concept",
              name: "Ontological Concept"
            },
            {
              "@id": "http://snomed.info/sct#138875005",
              name: "SNOMED CT Concept"
            },
            { "@id": "http://snomed.info/sct#105590001", name: "Substance" },
            {
              "@id": "http://snomed.info/sct#24648004",
              name: "Metabolite AND/OR marker of neoplasm"
            },
            {
              "@id": "http://snomed.info/sct#24772003",
              name: "Sodium citrate and citric acid"
            },
            {
              "@id": "http://snomed.info/sct#24838003",
              name: "Undecylenic acid and zinc undecylenate"
            },
            {
              "@id": "http://snomed.info/sct#28927005",
              name: "Diphenylheptane derivative"
            },
            {
              "@id": "http://snomed.info/sct#39701004",
              name: "Metabolite AND/OR marker of carcinogen"
            },
            {
              "@id": "http://snomed.info/sct#54724002",
              name: "Bile acid AND/OR bile salt"
            },
            {
              "@id": "http://snomed.info/sct#58977006",
              name: "Magnesium salt"
            },
            {
              "@id": "http://snomed.info/sct#61321005",
              name: "Cancer-related substance"
            },
            { "@id": "http://snomed.info/sct#90260006", name: "Allergen" },
            {
              "@id": "http://snomed.info/sct#103112000",
              name: "Lymphocyte antigens CD10+ CD20+"
            },
            {
              "@id": "http://snomed.info/sct#105818001",
              name: "Sulfur AND/OR sulfur compound"
            },
            {
              "@id": "http://snomed.info/sct#105824007",
              name: "Iodine AND/OR iodine compound"
            },
            {
              "@id": "http://snomed.info/sct#105825008",
              name: "Arsenic AND/OR arsenic compound"
            },
            {
              "@id": "http://snomed.info/sct#105830007",
              name: "Aluminum AND/OR aluminum compound"
            },
            {
              "@id": "http://snomed.info/sct#105835002",
              name: "Bismuth AND/OR bismuth compound"
            },
            {
              "@id": "http://snomed.info/sct#105840005",
              name: "Iron AND/OR iron compound"
            },
            {
              "@id": "http://snomed.info/sct#105843007",
              name: "Mercury AND/OR mercury compound"
            },
            {
              "@id": "http://snomed.info/sct#105856000",
              name: "Gold AND/OR gold compound"
            },
            {
              "@id": "http://snomed.info/sct#105860002",
              name: "Molybdenum AND/OR molybdenum compound"
            },
            {
              "@id": "http://snomed.info/sct#105863000",
              name: "Platinum AND/OR platinum compound"
            },
            {
              "@id": "http://snomed.info/sct#105864006",
              name: "Lithium AND/OR lithium compound"
            },
            {
              "@id": "http://snomed.info/sct#105875005",
              name: "Vanadium AND/OR vanadium compound"
            },
            {
              "@id": "http://snomed.info/sct#105879004",
              name: "Gadolinium AND/OR gadolinium compound"
            },
            {
              "@id": "http://snomed.info/sct#105901001",
              name: "Generic drug, hormone, vitamin AND/OR blood product"
            },
            { "@id": "http://snomed.info/sct#260087007", name: "Allergens" },
            {
              "@id": "http://snomed.info/sct#272002005",
              name: "Miscellaneous flaps"
            },
            {
              "@id": "http://snomed.info/sct#272004006",
              name: "Additional miscellaneous flaps"
            },
            {
              "@id": "http://snomed.info/sct#297181003",
              name: "Biologically active substance"
            },
            {
              "@id": "http://snomed.info/sct#301809005",
              name: "Acetic acid or acetic acid derivative"
            },
            {
              "@id": "http://snomed.info/sct#311984009",
              name: "Chemical or external agent"
            },
            {
              "@id": "http://snomed.info/sct#312417001",
              name: "Substance of abuse"
            },
            {
              "@id": "http://snomed.info/sct#360113001",
              name: "Unspecified substance"
            },
            {
              "@id": "http://snomed.info/sct#360250005",
              name: "Analgesic/antipyretic/antirheumatic"
            },
            {
              "@id": "http://snomed.info/sct#361537000",
              name: "Unspecified destructive substance"
            },
            {
              "@id": "http://snomed.info/sct#361582001",
              name: "Unspecified radioactive substance"
            },
            {
              "@id": "http://snomed.info/sct#372645001",
              name: "Volatile liquid anesthetic agent (substance)"
            },
            {
              "@id": "http://snomed.info/sct#372762001",
              name: "Medicinal gold"
            },
            {
              "@id": "http://snomed.info/sct#373208005",
              name: "Phenothiazine AND/OR derivative"
            },
            {
              "@id": "http://snomed.info/sct#373229001",
              name: "Cromoglycate and related antiallergenic (substance)"
            },
            {
              "@id": "http://snomed.info/sct#406455002",
              name: "Allergen class"
            },
            {
              "@id": "http://snomed.info/sct#406463001",
              name: "Drug allergen"
            },
            {
              "@id": "http://snomed.info/sct#406469002",
              name: "Occupational allergen"
            },
            {
              "@id": "http://snomed.info/sct#406473004",
              name: "Contact allergen"
            },
            {
              "@id": "http://snomed.info/sct#406749006",
              name: "Vancomycin and derivative"
            },
            {
              "@id": "http://snomed.info/sct#406754002",
              name: "Alkyl sulfonate antineoplastic (substance)"
            },
            {
              "@id": "http://snomed.info/sct#406763000",
              name: "Bipyridine inotropic"
            },
            {
              "@id": "http://snomed.info/sct#406781002",
              name: "Methylphenidate and derivative"
            },
            {
              "@id": "http://snomed.info/sct#412030005",
              name: "Abacavir or abacavir derivative"
            },
            {
              "@id": "http://snomed.info/sct#412031009",
              name: "Paracetamol or paracetamol derivative"
            },
            {
              "@id": "http://snomed.info/sct#412032002",
              name: "Allopurinol and purine inhibitors"
            },
            {
              "@id": "http://snomed.info/sct#412033007",
              name: "Amantadine and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412034001",
              name: "Amiodarone and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412036004",
              name: "Benzyl alcohol and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412038003",
              name: "Cidofovir and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412040008",
              name: "Efavirenz and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412041007",
              name: "Griseofulvin and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412042000",
              name: "Guaifenesin and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412043005",
              name: "Lactose and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412045003",
              name: "Phenyltriazine derivative anticonvulsant"
            },
            {
              "@id": "http://snomed.info/sct#412048001",
              name: "Pentazocine and derivatives"
            },
            {
              "@id": "http://snomed.info/sct#412054000",
              name: "Zidovudine and derivatives"
            },
            { "@id": "http://snomed.info/sct#412509006", name: "Scarlet red" },
            {
              "@id": "http://snomed.info/sct#413477004",
              name: "Allergen or pseudoallergen"
            },
            {
              "@id": "http://snomed.info/sct#414052000",
              name: "Drug allergen by structure"
            },
            {
              "@id": "http://snomed.info/sct#414053005",
              name: "Drug allergen or pseudoallergen"
            },
            {
              "@id": "http://snomed.info/sct#414057006",
              name: "Drug pseudoallergen"
            },
            {
              "@id": "http://snomed.info/sct#414058001",
              name: "Drug pseudoallergen by function"
            },
            {
              "@id": "http://snomed.info/sct#419501005",
              name: "Macrolide immunosuppressant"
            },
            {
              "@id": "http://snomed.info/sct#420056007",
              name: "Aromatherapy agent"
            },
            {
              "@id": "http://snomed.info/sct#706983000",
              name: "Kynurenate + xanthurenate"
            },
            {
              "@id": "http://snomed.info/sct#706992002",
              name: "Trypsin + trypsinogen"
            },
            {
              "@id": "http://snomed.info/sct#707109007",
              name: "Cholesterol in high density lipoprotein subfraction 1 + 2"
            },
            {
              "@id": "http://snomed.info/sct#707110002",
              name: "Cholesterol in high density lipoprotein subfraction 2 + 3"
            },
            {
              "@id": "http://snomed.info/sct#707111003",
              name: "Cholesterol in high density lipoprotein subfraction 4 + 5"
            },
            {
              "@id": "http://snomed.info/sct#707112005",
              name: "Cholesterol in intermediate density lipoprotein + cholesterol in very low density lipoprotein subfraction 3"
            },
            {
              "@id": "http://snomed.info/sct#707113000",
              name: "Cholesterol in very low density lipoprotein subfraction 1 + 2"
            },
            {
              "@id": "http://snomed.info/sct#707114006",
              name: "Cholesterol in very low density lipoprotein subfraction 1 + 2 + 3"
            },
            {
              "@id": "http://snomed.info/sct#707115007",
              name: "Cholesterol in very low density lipoprotein subfraction 3 + 4"
            },
            {
              "@id": "http://snomed.info/sct#707116008",
              name: "Cholesterol in very low density lipoprotein subfraction 5 + 6"
            },
            {
              "@id": "http://snomed.info/sct#707117004",
              name: "Triglyceride + ester in high density lipoprotein"
            },
            {
              "@id": "http://snomed.info/sct#707118009",
              name: "Triglyceride + ester in intermediate density lipoprotein"
            },
            {
              "@id": "http://snomed.info/sct#707119001",
              name: "Triglyceride + ester in low density lipoprotein"
            },
            {
              "@id": "http://snomed.info/sct#707120007",
              name: "Triglyceride + ester in very low density lipoprotein"
            },
            {
              "@id": "http://snomed.info/sct#707121006",
              name: "Cholesterol in high density lipoprotein + cholesterol in very low density lipoprotein"
            },
            {
              "@id": "http://snomed.info/sct#707572005",
              name: "Immunoglobulin A antibody to Chlamydia trachomatis D + E + F + G + H + I + J + K"
            },
            {
              "@id": "http://snomed.info/sct#707573000",
              name: "Immunoglobulin A antibody to Chlamydia trachomatis D + K"
            },
            {
              "@id": "http://snomed.info/sct#707574006",
              name: "Immunoglobulin A antibody to Chlamydia trachomatis G + F + K"
            },
            {
              "@id": "http://snomed.info/sct#707977009",
              name: "Transcobalamin I + transcobalamin III"
            },
            {
              "@id": "http://snomed.info/sct#707978004",
              name: "Interleukin-1 + interleukin-2"
            },
            {
              "@id": "http://snomed.info/sct#707991003",
              name: "Clostridium botulinum toxin type A + B + E + F + G"
            },
            {
              "@id": "http://snomed.info/sct#707992005",
              name: "Clostridium botulinum toxin type A + B + E"
            },
            {
              "@id": "http://snomed.info/sct#707993000",
              name: "Clostridium difficile toxin A + B"
            },
            {
              "@id": "http://snomed.info/sct#708081009",
              name: "Immunoglobulin A antibody to Bordetella pertussis filamentous hemagglutinin + Bordetella pertussis toxin"
            },
            {
              "@id": "http://snomed.info/sct#708088003",
              name: "Immunoglobulin A antibody to Coxsackievirus + Echovirus"
            },
            {
              "@id": "http://snomed.info/sct#708258000",
              name: "Collagen + procollagen"
            },
            {
              "@id": "http://snomed.info/sct#708259008",
              name: "Methionine + tryptophan"
            },
            {
              "@id": "http://snomed.info/sct#708264007",
              name: "Isoleucine + leucine + valine"
            },
            {
              "@id": "http://snomed.info/sct#708267000",
              name: "Isoleucine + leucine"
            },
            {
              "@id": "http://snomed.info/sct#708272009",
              name: "Glutamine + histidine"
            },
            {
              "@id": "http://snomed.info/sct#708276007",
              name: "Glutamate + glutamine + threonine"
            },
            {
              "@id": "http://snomed.info/sct#708280002",
              name: "Glutamate + glutamine"
            },
            {
              "@id": "http://snomed.info/sct#708284006",
              name: "Epinephrine + norepinephrine"
            },
            {
              "@id": "http://snomed.info/sct#708290005",
              name: "Cystine + homocystine"
            },
            {
              "@id": "http://snomed.info/sct#708296004",
              name: "Cystine + homocysteine"
            },
            {
              "@id": "http://snomed.info/sct#708303001",
              name: "Asparagine + ornithine"
            },
            {
              "@id": "http://snomed.info/sct#708310007",
              name: "Anserine + carnosine + cysteine + histidine + ornithine"
            },
            {
              "@id": "http://snomed.info/sct#708316001",
              name: "Alanine + histidine + leucine + phenylalanine + tyrosine"
            },
            {
              "@id": "http://snomed.info/sct#708348002",
              name: "Alanine + beta alanine + sarcosine"
            },
            {
              "@id": "http://snomed.info/sct#708351009",
              name: "Alanine + ethanolamine"
            },
            {
              "@id": "http://snomed.info/sct#708354001",
              name: "Alloisoleucine + hydroxyproline + isoleucine + leucine"
            },
            {
              "@id": "http://snomed.info/sct#708356004",
              name: "Alloisoleucine + hydroxyproline + isoleucine + leucine + valine"
            },
            {
              "@id": "http://snomed.info/sct#708565007",
              name: "Phenylalanine + tyrosine"
            },
            {
              "@id": "http://snomed.info/sct#708665000",
              name: "Alanine + cystine + histidine + homocysteine + leucine + phenylalanine + tyrosine"
            },
            {
              "@id": "http://snomed.info/sct#708716004",
              name: "Androstenedione + 17-Hydroxyprogesterone"
            },
            {
              "@id": "http://snomed.info/sct#708748000",
              name: "Arginine + argininosuccinate + lysine + serine + taurine"
            },
            {
              "@id": "http://snomed.info/sct#708751007",
              name: "Cysteine + cystine"
            },
            {
              "@id": "http://snomed.info/sct#708771003",
              name: "Immunoglobulin A antibody to Parainfluenza virus 1 + 2 + 3 + 4"
            },
            {
              "@id": "http://snomed.info/sct#708779001",
              name: "Immunoglobulin E antibody to Gadus morhua + Mytilus edulis + Pandalus borealis + Salmo salar + Thunnus albacares"
            },
            {
              "@id": "http://snomed.info/sct#708845005",
              name: "Deoxypyridinoline + pyridinoline"
            },
            {
              "@id": "http://snomed.info/sct#708846006",
              name: "Cyanocobalamin + folic acid"
            },
            {
              "@id": "http://snomed.info/sct#708847002",
              name: "Choriogonadotropin + human chorionic gonadotropin, beta subunit"
            },
            {
              "@id": "http://snomed.info/sct#708848007",
              name: "beta globulin + gamma globulin"
            },
            {
              "@id": "http://snomed.info/sct#708849004",
              name: "beta 2 globulin + gamma globulin"
            },
            {
              "@id": "http://snomed.info/sct#708863005",
              name: "Immunoglobulin A antibody and immunoglobulin E antibody to Toxoplasma gondii"
            },
            {
              "@id": "http://snomed.info/sct#708864004",
              name: "Ascorbate + dehydroascorbate"
            },
            {
              "@id": "http://snomed.info/sct#709030005",
              name: "5-Oxoproline + pipecolate"
            },
            {
              "@id": "http://snomed.info/sct#709050009",
              name: "Aspartate + citrulline + glycine + homocystine + hydroxyproline"
            },
            {
              "@id": "http://snomed.info/sct#709052001",
              name: "3-Hydroxybutyrate + acetoacetate"
            },
            {
              "@id": "http://snomed.info/sct#709057007",
              name: "Butyrylcarnitine + isobutyrylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#709070003",
              name: "Acetoacetate + acetone"
            },
            {
              "@id": "http://snomed.info/sct#709072006",
              name: "beta aminoisobutyrate + proline"
            },
            {
              "@id": "http://snomed.info/sct#709149007",
              name: "Oleoylcarnitine + palmitoylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#709150007",
              name: "Palmitoylcarnitine + stearoylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#709153009",
              name: "Acylcarnitine + free carnitine"
            },
            {
              "@id": "http://snomed.info/sct#709207007",
              name: "Methylmalonylcarnitine + succinylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#709208002",
              name: "3-Hydroxyisovalerylcarnitine + methylmalonylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#709209005",
              name: "Acetylcarnitine + free carnitine + oleoylcarnitine + palmitoylcarnitine + propionylcarnitine + stearoylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#709213003",
              name: "3-Hydroxybutyrylcarnitine + malonylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#709427006",
              name: "Antigen of Cryptosporidium parvum + antigen of Giardia lamblia"
            },
            {
              "@id": "http://snomed.info/sct#709428001",
              name: "Antigen of Cryptosporidium species + antigen of Giardia lamblia"
            },
            {
              "@id": "http://snomed.info/sct#709429009",
              name: "Antigen of Adenovirus + antigen of Rotavirus"
            },
            {
              "@id": "http://snomed.info/sct#709431000",
              name: "Antigen of Herpes simplex virus 1 + 2"
            },
            {
              "@id": "http://snomed.info/sct#709432007",
              name: "Antigen of Human papillomavirus 16 + 18"
            },
            {
              "@id": "http://snomed.info/sct#709433002",
              name: "Antigen of Human papillomavirus 31 + 33"
            },
            {
              "@id": "http://snomed.info/sct#709434008",
              name: "Antigen of Human papillomavirus 31 + 33 + 35"
            },
            {
              "@id": "http://snomed.info/sct#709435009",
              name: "Antigen of Human papillomavirus 6 + 11"
            },
            {
              "@id": "http://snomed.info/sct#709436005",
              name: "Antigen of Influenza virus A + B"
            },
            {
              "@id": "http://snomed.info/sct#709437001",
              name: "Antigen of Influenza virus A + B + C"
            },
            {
              "@id": "http://snomed.info/sct#709438006",
              name: "Antigen of Parainfluenza virus 1 + 2 + 3"
            },
            {
              "@id": "http://snomed.info/sct#709439003",
              name: "Antigen of Enterovirus + antigen of Rhinovirus"
            },
            {
              "@id": "http://snomed.info/sct#709440001",
              name: "Antigen of Campylobacter coli + antigen of Campylobacter jejuni"
            },
            {
              "@id": "http://snomed.info/sct#709441002",
              name: "Antigen of Neisseria meningitidis A + B + C + w135 + Y"
            },
            {
              "@id": "http://snomed.info/sct#709442009",
              name: "Antigen of Escherichia coli K1 + antigen of Neisseria meningitidis A + B + C + w135 + Y"
            },
            {
              "@id": "http://snomed.info/sct#709443004",
              name: "Antigen of Neisseria meningitidis A + C + w135 + Y"
            },
            {
              "@id": "http://snomed.info/sct#709444005",
              name: "Antigen of Neisseria meningitidis A + w135"
            },
            {
              "@id": "http://snomed.info/sct#709445006",
              name: "Antigen of Neisseria meningitidis A + Y"
            },
            {
              "@id": "http://snomed.info/sct#709446007",
              name: "Antigen of Escherichia coli K1 + antigen of Neisseria meningitidis B"
            },
            {
              "@id": "http://snomed.info/sct#709447003",
              name: "Antigen of Neisseria meningitidis C + w135"
            },
            {
              "@id": "http://snomed.info/sct#709448008",
              name: "Antigen of Brugia malayi + antigen of Wuchereria bancrofti"
            },
            {
              "@id": "http://snomed.info/sct#709451001",
              name: "Deoxyhemoglobin + oxyhemoglobin"
            },
            {
              "@id": "http://snomed.info/sct#711264008",
              name: "Beta tocopherol + gamma tocopherol"
            },
            {
              "@id": "http://snomed.info/sct#712587002",
              name: "Calcifediol + ergocalciferol"
            },
            {
              "@id": "http://snomed.info/sct#712588007",
              name: "3-Hydroxybutyrate + gamma aminobutyric acid"
            },
            {
              "@id": "http://snomed.info/sct#712590008",
              name: "Cysteine + homocysteine disulfide"
            },
            {
              "@id": "http://snomed.info/sct#712601006",
              name: "3-Methylcrotonylcarnitine + tiglylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#712632007",
              name: "Antigen of Human immunodeficiency virus 1 + 2 Ab + Human immunodeficiency virus 1 p24"
            },
            {
              "@id": "http://snomed.info/sct#712879005",
              name: "Glutarylcarnitine + 3-Hydroxydecanoylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#713658001",
              name: "3-Hydroxyisovalerylcarnitine + 2-methyl,3-hydroxybutyrylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#713659009",
              name: "3-Hydroxyoctanoylcarnitine + malonylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#716156005",
              name: "Isovalerylcarnitine + methylbutyrylcarnitine"
            },
            {
              "@id": "http://snomed.info/sct#716157001",
              name: "3-Hydroxyhexanoylcarnitine + glutarylcarnitine"
            }
          ],
          "http://www.w3.org/2000/01/rdf-schema#subClassOf": [
            {
              "@id": "http://snomed.info/sct#138875005",
              name: "SNOMED CT Concept"
            }
          ],
          "http://endhealth.info/im#status": [{ "@id": "http://endhealth.info/im#Active", name: "Active" }],
          "http://endhealth.info/im#code": "105590001",
          "http://www.w3.org/2000/01/rdf-schema#comment": "Substance (substance)",
          "http://endhealth.info/im#scheme": [
            {
              "@id": "http://snomed.info/sct#",
              name: "Snomed-CT code scheme and graph"
            }
          ],
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [
            {
              "@id": "http://endhealth.info/im#Concept",
              name: "Ontological Concept"
            }
          ],
          "http://endhealth.info/im#hasTermCode": [
            {
              "http://endhealth.info/im#code": "169710016",
              "http://www.w3.org/2000/01/rdf-schema#label": "Substance"
            },
            {
              "http://endhealth.info/im#code": "291656011",
              "http://www.w3.org/2000/01/rdf-schema#label": "Substances"
            },
            {
              "http://endhealth.info/im#code": "573283013",
              "http://www.w3.org/2000/01/rdf-schema#label": "Substance (substance)"
            }
          ],
          "http://www.w3.org/2000/01/rdf-schema#label": "Substance"
        },
        predicates: {
          "http://endhealth.info/im#code": "code",
          "http://www.w3.org/2000/01/rdf-schema#subClassOf": "subClassOf",
          "http://endhealth.info/im#status": "status",
          "http://www.w3.org/2000/01/rdf-schema#comment": "comment",
          "http://www.w3.org/2000/01/rdf-schema#label": "label",
          "http://endhealth.info/im#hasTermCode": "has term code",
          "http://endhealth.info/im#scheme": "scheme",
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type"
        }
      };
      const testPredicates = [
        "http://www.w3.org/2000/01/rdf-schema#subClassOf",
        "http://endhealth.info/im#code",
        "http://endhealth.info/im#scheme",
        "http://endhealth.info/im#hasTermCode"
      ];
      expect(translateFromEntityBundle(testBundle, testPredicates)).toStrictEqual({
        _children: [],
        children: [
          {
            _children: [],
            children: [],
            iri: "http://snomed.info/sct#138875005",
            name: "SNOMED CT Concept",
            relToParent: "subClassOf"
          },
          {
            _children: [],
            children: [],
            iri: undefined,
            name: "105590001",
            relToParent: "code"
          },
          {
            _children: [],
            children: [],
            iri: "http://snomed.info/sct#",
            name: "Snomed-CT code scheme and graph",
            relToParent: "scheme"
          },
          {
            _children: [],
            children: [
              {
                _children: [],
                children: [],
                iri: undefined,
                name: "Substance",
                relToParent: "Substance"
              },
              {
                _children: [],
                children: [],
                iri: undefined,
                name: "Substances",
                relToParent: "Substances"
              },
              {
                _children: [],
                children: [],
                iri: undefined,
                name: "Substance (substance)",
                relToParent: "Substance (substance)"
              }
            ],
            iri: "",
            name: "middle-node-" + "http://endhealth.info/im#hasTermCode",
            relToParent: "has term code"
          }
        ],
        iri: "http://snomed.info/sct#105590001",
        name: "Substance",
        relToParent: ""
      });
    });
  });
});
