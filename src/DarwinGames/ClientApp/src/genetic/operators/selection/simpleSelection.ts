import { Selection } from "../../definitions";
import { SelectionHelper } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";
import { Result } from "../../Result";
import { getOrAwait, getOrAwaitAll, validateRange } from "../../utils";

export function simpleSelection<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    survivorCount: number,
    maxAge: number,
    parentToOffspringRate: number,
    preserveBest: boolean,
    preserveWorst: boolean,
    randomCount: number,
    randomIndividual: (generation: number) => Result<TIndividual>,
    select: SelectionHelper<TGene, TFitness, TChromosome, TIndividual>)
    : Selection<TGene, TFitness, TChromosome, TIndividual> {
    validateRange(survivorCount, "survivorCount", 1);
    validateRange(maxAge, "maxAge", 1);
    validateRange(parentToOffspringRate, "parentOffspringRate", 0, 1);

    return async (individuals, generation, optimize) => {
        if (individuals.length <= survivorCount) {
            return individuals;
        }

        let parents = individuals.filter((i) => maxAge === 0 || (i.age > 0 ?? i.age <= maxAge)).sort(optimize);
        const offsprings = individuals.filter((i) => i.age === 0);

        const best = preserveBest ? [parents[0]] : [];
        const worst = preserveWorst ? [parents[parents.length - 1]] : [];
        parents = parents.filter((p) => best.indexOf(p) === -1 && worst.indexOf(p) === -1);

        let parentCount = Math.floor(parents.length * parentToOffspringRate);
        let offspringCount = Math.floor(parents.length * (1 - parentToOffspringRate));
        let restCount = randomCount;
        if (preserveBest) restCount++;
        if (preserveWorst) restCount++;

        const allCount = parentCount + offspringCount + restCount;
        const missingCount = survivorCount - allCount;

        if (missingCount > 0) {
            if (parents.length > parentCount) {
                parentCount += missingCount;
            } else if (offsprings.length > offspringCount) {
                offspringCount += missingCount;
            } else {
                randomCount += missingCount;
            }
        }

        const random = await getOrAwaitAll(new Array(randomCount).fill(undefined), () => randomIndividual(generation));
        const survivedParents = await getOrAwait(select(parentCount, parents, generation, optimize));
        const survivedOffsprings = await getOrAwait(select(offspringCount, offsprings, generation, optimize));

        return [...best, ...survivedParents, ...random, ...survivedOffsprings, ...worst];
    };
}
