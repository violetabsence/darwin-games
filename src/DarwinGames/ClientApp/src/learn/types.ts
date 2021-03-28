export type CommonSettings = {
    maxGenerationCount: number,
    skipGenerationCount: number,
    populationSize: number,
    maxAge: number,
}

export type GenerationInfo = {
    index: number,
    bestFitness: number,
    worstFitness: number,
    final: boolean,
    propagation: {
        parents: number,
        offsprings: number,
        new: number,
    },
};

export type IndividualInfo = {
    age: number,
    fitness: number,
};

export type SolutionInfo<TData> = IndividualInfo & {
    data: TData,
};

export type UpdateEventProgressValue = number | "indeterminate";
export type UpdateEvent<TGeneration, TSolution> =
    { kind: "add-generation", index: number, generation: TGeneration, solutions: TSolution[] } |
    { kind: "set-winner", index: number, generation: TGeneration, winner: TSolution } |
    { kind: "progress", progress: UpdateEventProgressValue };
