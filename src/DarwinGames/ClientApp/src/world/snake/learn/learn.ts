import { PerceptronNetworkChromosome as PNC } from "../../../chromosome/PerceptronNetworkChromosome";
import { GeneticAlgorithm, IIndividual } from "../../../genetic";
import { EventHandler } from "../../../genetic/definitions";
import { tournament } from "../../../genetic/helpers/selection";
import { randomSlices } from "../../../genetic/operators/crossover";
import { individual } from "../../../genetic/operators/individual";
import { simpleMating } from "../../../genetic/operators/mating";
import { randomNumeric } from "../../../genetic/operators/mutation/random";
import { maxFitnessWin } from "../../../genetic/operators/optimize";
import { problemPerGeneration } from "../../../genetic/operators/problem";
import { simpleSelection } from "../../../genetic/operators/selection";
import { simpleTerminationCriteria } from "../../../genetic/operators/termination";
import { getOrAwait } from "../../../genetic/utils";
import { Field, ISnakeGame } from "../game";
import { Direction } from "../game/Direction";
import { Point } from "../game/Point";
import { SnakeGame } from "../game/SnakeGame";
import { SnakeLearnSettings } from "./SnakeLearnSettings";

export type Phenotype = {
    initialState: Field,
    game: ISnakeGame,
    moves: Direction[],
    lose: boolean,
};

export type Individual = IIndividual<number, number, PNC>;

export const learn = async (
    settings: SnakeLearnSettings,
    eventHandler: EventHandler<number, number, Phenotype, Phenotype, PNC, Individual>) : Promise<void> => {
    const { maxGenerationCount, populationSize, maxAge, puzzleWidth: w, puzzleHeight: h } = settings;
    const tileCount = w * h;

    const inputNeurons = 4;
    const hiddenLayersNeurons = [20, 14];
    const outputNeurons = 4;

    const maxMoveCount = tileCount * 30;
    const solutionFitnessNotRaisedThreshold = tileCount * 5;

    const randomPerPopulationCount = 1;
    const parentToOffspringRate = 0.5;
    const targetFitness = tileCount;

    const chromosomeFactory = (count: number) =>
        () => new Array(count).fill(undefined).map(() => new PNC(inputNeurons, ...hiddenLayersNeurons, outputNeurons));

    const individualFactory = individual<number, number, PNC, Individual>(0);

    const randomIndividualFactory = (generation: number) => {
        const chromosome = chromosomeFactory(1)()[0];
        return individualFactory(chromosome, -1, generation);
    };

    const puzzleStateFactory = problemPerGeneration(() => {
        return new SnakeGame({ mode: "new", size: { w, h } });
    });

    const puzzleFactory = async (generation: number) => {
        const game = await getOrAwait(puzzleStateFactory(generation));
        return new SnakeGame({ mode: "load", field: game.field });
    };

    const fitness = (problem: Phenotype): number => {
        let fitness = problem.game.snake.segments.length;
        const moveFitness = 1 - (problem.moves.length / maxMoveCount);
        fitness += moveFitness;

        if (problem.lose) {
            fitness -= tileCount / 2;
        }

        return fitness;
    };

    const translateInput = (input: ISnakeGame): number[] => {
        const getDistance = (from: Point, to: Point) => ([
            from.y >= to.y ? 0 : (to.y - from.y) / input.field.size.h,
            from.x >= to.x ? 0 : (to.x - from.x) / input.field.size.w,
            from.y <= to.y ? 0 : (from.y - to.y) / input.field.size.h,
            from.x <= to.x ? 0 : (from.x - to.x) / input.field.size.w,
        ]);

        const distanceToFood = getDistance(input.snake, input.field.food);
        return [...distanceToFood];
    };

    const translateOutput = (output: number[]): Direction => {
        const sorted = output.slice().sort((a, b) => b - a);
        const best = output.indexOf(sorted[0]);
        switch (best) {
            default:
            case 0: return Direction.Top;
            case 1: return Direction.Right;
            case 2: return Direction.Bottom;
            case 3: return Direction.Left;
        }
    };

    const solution = (network: PNC, problem: Phenotype) => {
        let currentFitness = fitness(problem);
        let fitnessNotRaisedTimes = 0;

        while (!problem.lose
            && problem.moves.length < maxMoveCount
            && fitnessNotRaisedTimes < solutionFitnessNotRaisedThreshold) {
            const input = translateInput(problem.game);
            const output = network.activate(input);
            const fromDirection = translateOutput(output);
            problem.moves.push(fromDirection);

            problem.game.setDirection(fromDirection);
            problem.game.move();
            problem.lose = problem.game.state === "lose";

            const newFitness = fitness(problem);
            fitnessNotRaisedTimes = currentFitness > newFitness ? fitnessNotRaisedTimes + 1 : 0;
            currentFitness = newFitness;
        }

        return problem;
    };

    const ga = GeneticAlgorithm.createFlat<number, number, Phenotype, PNC>({
        individual: individualFactory,
        problem: async (generation: number): Promise<Phenotype> => {
            const game = await puzzleFactory(generation);
            return {
                initialState: { ...game.field },
                game,
                moves: [],
                lose: false,
            };
        },
        solution,
        fitness,
        mating: simpleMating(Math.floor(populationSize / 2), 2, false, tournament(3)),
        crossover: randomSlices(2),
        mutation: randomNumeric(1, 0.05),
        selection: simpleSelection(
            populationSize,
            maxAge,
            parentToOffspringRate,
            true,
            true,
            randomPerPopulationCount,
            randomIndividualFactory,
            tournament(3)),
        termination: simpleTerminationCriteria(maxGenerationCount, (f) => f >= targetFitness),
        optimization: maxFitnessWin(),
    });

    await ga.evolve(chromosomeFactory(populationSize), (e) => eventHandler.call(ga, e));
};
