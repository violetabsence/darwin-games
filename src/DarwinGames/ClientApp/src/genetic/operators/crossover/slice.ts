import { Crossover, Optimization } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";
import { getRandomUniqueIntegers, validateEquals } from "../../utils";

export function slice<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    slice: (
        geneCount: number,
        generation: number,
        optimize: Optimization<TGene, TFitness, TChromosome, TIndividual>) => number[],
    singleOffspring: boolean = false): Crossover<TGene, TFitness, TChromosome, TIndividual> {
    return (individuals, generation, optimize) => {
        if (individuals.length !== 2) {
            throw new Error("Unable to apply crossover: mates count should be 2.");
        }

        const geneCount = validateEquals(
            individuals.map((i) => i.chromosome.genes.length),
            "Unable to apply crossover: chromosomes must have same count of genes.");
        const cuttingPoints = slice(geneCount, generation, optimize);
        return getOffsprings(individuals, geneCount, cuttingPoints, singleOffspring);
    };
}

export function randomSlices<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    count: number = 1,
    singleOffspring: boolean = false): Crossover<TGene, TFitness, TChromosome, TIndividual> {
    return slice<TGene, TFitness, TChromosome, TIndividual>(
        (geneCount) => getRandomUniqueIntegers(count, 1, geneCount - 1),
        singleOffspring);
}

export function uniform<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    singleOffspring: boolean = false): Crossover<TGene, TFitness, TChromosome, TIndividual> {
    return slice<TGene, TFitness, TChromosome, TIndividual>(
        (geneCount) => getRandomUniqueIntegers(geneCount - 1, 1, geneCount - 1),
        singleOffspring);
}

function getOffsprings<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    mates: TIndividual[],
    geneCount: number,
    cuttingPoints: number[],
    singleOffspring: boolean): TChromosome[] {
    const genesA = new Array<TGene>(geneCount);
    const genesB = new Array<TGene>(geneCount);

    let dominantMate = 0;
    let gene = 0;
    for (let i = 0; i <= cuttingPoints.length; i++) {
        const anotherMate = dominantMate === 0 ? 1 : 0;
        const mateA = mates[dominantMate].chromosome.genes;
        const mateB = mates[anotherMate].chromosome.genes;

        const next = cuttingPoints[i] ?? geneCount;
        while (gene < next) {
            genesA[gene] = mateA[gene];
            genesB[gene] = mateB[gene];
            gene++;
        }

        dominantMate = anotherMate;
    }

    const offspringA = mates[0].chromosome.clone() as TChromosome;
    const offspringB = mates[1].chromosome.clone() as TChromosome;
    offspringA.genes = genesA;
    offspringB.genes = genesB;

    return singleOffspring ? [offspringA] : [offspringA, offspringB];
}
