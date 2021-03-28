import { getRandomArbitrary } from "../../../utils";
import { SelectionHelper } from "../../definitions/helpers";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";

export function rouletteWheel<
    TGene,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, number, TChromosome>>()
    : SelectionHelper<TGene, number, TChromosome, TIndividual> {
    return (count, individuals) => {
        const hasNegativeFitness = individuals.findIndex((i) => i.fitness < 0) !== -1;
        if (hasNegativeFitness) throw new Error("Mating failed: fitness cannot have negative value.");

        if (individuals.length < count) {
            return [];
        }

        const candidates = individuals.slice();
        const group: TIndividual[] = [];
        while (count-- > 0) {
            const sum = candidates.map((c) => c.fitness).reduce((acc, cur) => acc + cur);
            const val = getRandomArbitrary(0, sum + sum / (candidates.length * 10));
            let i: number;
            let acc = 0;
            for (i = 0; i < candidates.length; i++) {
                acc += candidates[i].fitness;
                if (acc >= val) break;
            }

            group.push(candidates[i]);
            candidates.splice(i, 1);
        }

        return group;
    };
}
