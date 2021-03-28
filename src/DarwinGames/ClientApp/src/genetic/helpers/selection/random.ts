import { getRandomInt } from "../../../utils";
import { SelectionHelper } from "../../definitions/helpers";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";

export function random<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>()
    : SelectionHelper<TGene, TFitness, TChromosome, TIndividual> {
    return (count, individuals) => {
        if (individuals.length < count) {
            return [];
        }

        const candidates = individuals.slice();
        const group: TIndividual[] = [];
        while (count-- > 0) {
            const index = getRandomInt(0, candidates.length);
            group.push(candidates[index]);
            candidates.splice(index, 1);
        }

        return group;
    };
}
