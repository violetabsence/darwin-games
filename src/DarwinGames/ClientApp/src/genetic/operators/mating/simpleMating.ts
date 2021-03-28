import { Mating, SelectionHelper } from "../../definitions";
import { IChromosome } from "../../IChromosome";
import { IIndividual } from "../../IIndividual";
import { getOrAwait } from "../../utils";

export function simpleMating<
    TGene,
    TFitness,
    TChromosome extends IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome>>(
    groupCount: number,
    parentCount: number,
    polygamy: boolean,
    select: SelectionHelper<TGene, TFitness, TChromosome, TIndividual>)
    : Mating<TGene, TFitness, TChromosome, TIndividual> {
    return async (individuals, generation, optimize) => {
        let candidates = individuals.slice();
        const groups: TIndividual[][] = [];

        for (let i = 0; i < groupCount; i++) {
            const group = await getOrAwait(select(parentCount, individuals.slice(), generation, optimize));
            if (!polygamy) {
                candidates = candidates.filter((c) => group.indexOf(c) === -1);
            }

            groups.push(group);
        }

        return groups;
    };
}
