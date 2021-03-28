import { getRandomArbitrary } from "../../../utils/random";
import { SelectionHelper } from "../../definitions/helpers";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";

export function rank<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>()
    : SelectionHelper<TGene, TFitness, TChromosome, TIndividual> {
    return (count, individuals, _, optimize) => {
        if (individuals.length < count) {
            return [];
        }

        const candidates = individuals.slice();
        candidates.sort(optimize);

        const group: TIndividual[] = [];
        while (count-- > 0) {
            const ranks = candidates.map((_, i) => candidates.length - i);

            const sum = ranks.map((r) => r).reduce((acc, cur) => acc + cur);
            const val = getRandomArbitrary(0, sum + sum / (ranks.length * 10));
            let i: number;
            let acc = 0;
            for (i = 0; i < ranks.length; i++) {
                acc += ranks[i];
                if (acc >= val) break;
            }

            group.push(candidates[i]);
            candidates.splice(i, 1);
        }

        return group;
    };
}
