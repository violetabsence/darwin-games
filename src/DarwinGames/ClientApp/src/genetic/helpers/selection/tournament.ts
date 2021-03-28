import { SelectionHelper } from "../../definitions/helpers";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";
import { getRandomUniqueIntegers } from "../../utils";

export function tournament<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(roundParticipants: number)
    : SelectionHelper<TGene, TFitness, TChromosome, TIndividual> {
    return (count, individuals, _, optimize) => {
        if (individuals.length < count) {
            return [];
        }

        const candidates = individuals.slice();
        const group: TIndividual[] = [];
        while (count-- > 0) {
            const indexes = getRandomUniqueIntegers(roundParticipants, 0, candidates.length - 1);
            const participants = indexes.map((i) => candidates[i]);
            participants.sort(optimize);

            const winner = participants[0];
            group.push(winner);

            const index = candidates.indexOf(winner);
            candidates.splice(index, 1);
        }

        return group;
    };
}
