export interface IChromosome<TGene> {
    genes: readonly TGene[];
    clone(): IChromosome<TGene>;
};
