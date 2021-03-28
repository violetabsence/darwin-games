import { getRandomInt } from "../../../utils";
import { Mutation } from "../../definitions";
import { IChromosome } from "../../IChromosome";

export function swap<TGene, TChromosome extends IChromosome<TGene>>(): Mutation<TGene, TChromosome> {
    return (chromosome) => {
        const genes = chromosome.genes.slice();
        if (genes.length < 2) {
            return;
        }

        const maxIndex = genes.length - 1;
        const i1 = getRandomInt(0, maxIndex);
        let i2 = getRandomInt(0, maxIndex);
        if (i2 === i1) {
            i2++;
            if (i2 >= genes.length) {
                i2 = 0;
            }
        }

        const gene = genes[i1];
        genes[i1] = genes[i2];
        genes[i2] = gene;

        chromosome.genes = genes;
    };
}
