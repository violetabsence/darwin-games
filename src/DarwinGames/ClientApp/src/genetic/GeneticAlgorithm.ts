import { Settings, FlatSettings, SimpleSettings, Seed, EventHandler } from "./definitions";
import { IChromosome } from "./IChromosome";
import { IIndividual } from "./IIndividual";
import { getOrAwait, getOrAwaitAll } from "./utils";

// TODO: Configurable strategies, learning continuation.
// TODO: Extract to package with tests.

export class GeneticAlgorithm<
    TGene,
    TFitness,
    TPhenotype,
    TGenotype,
    TChromosome extends IChromosome<TGene> = IChromosome<TGene>,
    TIndividual extends IIndividual<TGene, TFitness, TChromosome> = IIndividual<TGene, TFitness, TChromosome>> {
    public static create<
        TGene,
        TFitness,
        TPhenotype,
        TGenotype,
        TChromosome extends IChromosome<TGene> = IChromosome<TGene>,
        TIndividual extends IIndividual<TGene, TFitness, TChromosome> = IIndividual<TGene, TFitness, TChromosome>>(
        settings: Settings<TGene, TFitness, TPhenotype, TGenotype, TChromosome, TIndividual>) {
        return new GeneticAlgorithm<TGene, TFitness, TPhenotype, TGenotype, TChromosome, TIndividual>(settings);
    }

    public static createFlat<
        TGene,
        TFitness,
        TGenotype,
        TChromosome extends IChromosome<TGene> = IChromosome<TGene>,
        TIndividual extends IIndividual<TGene, TFitness, TChromosome> = IIndividual<TGene, TFitness, TChromosome>>(
        settings: FlatSettings<TGene, TFitness, TGenotype, TChromosome, TIndividual>) {
        return GeneticAlgorithm.create<TGene, TFitness, TGenotype, TGenotype, TChromosome, TIndividual>({
            encode: (p) => p,
            decode: (p) => p,
            ...settings,
        });
    }

    public static createSimple<
        TGene,
        TFitness,
        TChromosome extends IChromosome<TGene> = IChromosome<TGene>,
        TIndividual extends IIndividual<TGene, TFitness, TChromosome> = IIndividual<TGene, TFitness, TChromosome>>(
        settings: SimpleSettings<TGene, TFitness, TChromosome, TIndividual>) {
        return GeneticAlgorithm.createFlat<TGene, TFitness, TChromosome, TChromosome, TIndividual>({
            problem: () => (undefined as unknown as TChromosome),
            solution: (c) => c,
            ...settings,
        });
    }

    private readonly _f: Settings<TGene, TFitness, TPhenotype, TGenotype, TChromosome, TIndividual>;

    public get settings() {
        return this._f;
    }

    private constructor(settings: Settings<TGene, TFitness, TPhenotype, TGenotype, TChromosome, TIndividual>) {
        this._f = Object.freeze(settings);
    }

    public async evolve(
        seed: Seed<TGene, TChromosome>,
        eventCallback?: EventHandler<TGene, TFitness, TPhenotype, TGenotype, TChromosome, TIndividual>)
        : Promise<TChromosome> {
        let population = await this.initializePopulation(seed);
        eventCallback?.call(this, { kind: "population-initialized", population });

        let generation = 0;
        while (true) {
            eventCallback?.call(this, { kind: "generation-cycle-started", population, generation });

            const [sorted, phenotypes] = await this.calculateFitnesses(population, generation);
            population = sorted;
            eventCallback?.call(this, { kind: "fitness-calculated", population, phenotypes, generation });

            population = await this.evolveGeneration(population, generation);
            eventCallback?.call(this, { kind: "survivors-selected", population, phenotypes, generation });

            const terminate = await getOrAwait(this._f.termination(population, generation));
            if (terminate) {
                const winner = population.filter((i) => i.age > 0).sort(this._f.optimization)[0];
                const winnerIndex = population.findIndex((i) => i === winner);
                const phenotype = phenotypes[winnerIndex];

                eventCallback?.call(this, { kind: "termination-reached", phenotype, winner, generation });

                return winner.chromosome;
            }

            population.forEach((i) => i.age < 0 ? 0 : i.age);
            generation++;
        }
    }

    private async initializePopulation(seed: Seed<TGene, TChromosome>): Promise<TIndividual[]> {
        const chromosomes = typeof seed === "function"
            ? await getOrAwait(seed())
            : seed;
        return await getOrAwaitAll(chromosomes, (c) => this.settings.individual(c, 0, 0));
    }

    private async calculateFitnesses(population: TIndividual[], generation: number)
        : Promise<[TIndividual[], TPhenotype[]]> {
        const problems = await getOrAwaitAll(population, (_) => this._f.problem(generation));
        const genotypes = await getOrAwaitAll(problems, (p) => this._f.encode(p));
        const solutions = await getOrAwaitAll(genotypes, (g, i) => this._f.solution(population[i].chromosome, g));
        const phenotypes = await getOrAwaitAll(solutions, (s) => this._f.decode(s));
        const fitnesses = await getOrAwaitAll(phenotypes, (p) => this._f.fitness(p));
        population.forEach((ind, i) => ind.fitness = fitnesses[i]);

        const records = population.map((i, index) => ({
            index,
            individual: i,
            phenotype: phenotypes[index],
        }));

        records.sort((a, b) => this._f.optimization(a.individual, b.individual));
        return [records.map((r) => r.individual), records.map((r) => r.phenotype)];
    }

    private async evolveGeneration(population: TIndividual[], generation: number): Promise<TIndividual[]> {
        population.forEach((i) => i.age = i.age + 1);

        const mating = await getOrAwait(this._f.mating(population, generation, this._f.optimization));
        const chromosomes = (await getOrAwaitAll(
            mating,
            (mg) => this._f.crossover(mg, generation, this._f.optimization))).flat();
        await getOrAwaitAll(chromosomes, (c) => this._f.mutation(c, generation));

        const offsprings = await getOrAwaitAll(chromosomes, (c, i) => this._f.individual(c, 0, generation, mating[i]));
        const all = population.concat(offsprings);
        return await getOrAwait(this._f.selection(all, generation, this._f.optimization));
    }
}

export default GeneticAlgorithm;
