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
import {
    A15Puzzle,
    A15PuzzleDirection,
    A15PuzzleGenerator,
    A15PuzzleState,
    A15PuzzleTile,
    I15Puzzle,
    I15PuzzleMatrix,
} from "../game";
import { A15PuzzleLearnSettings } from "./A15PuzzleLearnSettings";

export type Phenotype = {
    initialState: I15PuzzleMatrix,
    puzzle: I15Puzzle,
    moves: A15PuzzleDirection[],
    lose: boolean,
};

export type Individual = IIndividual<number, number, PNC>;

export const learn = async (
    settings: A15PuzzleLearnSettings,
    eventHandler: EventHandler<number, number, Phenotype, Phenotype, PNC, Individual>) : Promise<void> => {
    const { maxGenerationCount, populationSize, maxAge, puzzleWidth, puzzleHeight } = settings;
    const tileCount = puzzleWidth * puzzleHeight;

    const inputNeurons = 12;
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
        return A15PuzzleGenerator.randomize(puzzleWidth, puzzleHeight);
    });

    const puzzleFactory = async (generation: number) => {
        const generationState = await getOrAwait(puzzleStateFactory(generation));
        const state = new A15PuzzleState(generationState.width, generationState.height, generationState.tiles.slice());
        return new A15Puzzle(generationState.width, generationState.height, state);
    };

    const fitness = (problem: Phenotype): number => {
        let fitness = 0;
        problem.puzzle.matrix.tiles.forEach((t, i) => {
            if (t === "empty") {
                if (i === tileCount -1) {
                    fitness += 1;
                }
            } else if (t === i + 1) {
                fitness += 1;
            }
        });

        const moveFitness = 1 - (problem.moves.length / maxMoveCount);
        fitness += moveFitness;

        if (problem.lose) {
            fitness -= tileCount / 2;
        }

        return fitness;
    };

    const translateInput = (input: I15Puzzle): number[] => {
        const availableDirectionsInput = [
            input.validDirections.indexOf(A15PuzzleDirection.Top) !== -1 ? 1 : 0,
            input.validDirections.indexOf(A15PuzzleDirection.Right) !== -1 ? 1 : 0,
            input.validDirections.indexOf(A15PuzzleDirection.Bottom) !== -1 ? 1 : 0,
            input.validDirections.indexOf(A15PuzzleDirection.Left) !== -1 ? 1 : 0,
        ];

        const getDistance = (from: { x: number, y: number }, to: { x: number, y: number }) => ([
            from.y >= to.y ? 0 : (to.y - from.y) / input.matrix.height,
            from.x >= to.x ? 0 : (to.x - from.x) / input.matrix.width,
            from.y <= to.y ? 0 : (from.y - to.y) / input.matrix.height,
            from.x <= to.x ? 0 : (from.x - to.x) / input.matrix.width,
        ]);

        const emptyIndex = input.matrix.getEmptyTileIndex();
        const emptyPos = input.matrix.getIndexPosition(emptyIndex);
        const targetIndex = input.matrix.tiles.findIndex((t, i) => t !== i + 1);
        const targetPos = input.matrix.getIndexPosition(targetIndex);
        const nextIndex = input.matrix.getTileIndex(targetIndex + 1) ?? 0;
        const nextPos = input.matrix.getIndexPosition(nextIndex);

        const distanceToNextTile = getDistance(emptyPos, nextPos);
        const distanceToTarget = getDistance(nextPos, targetPos);

        return [...availableDirectionsInput, ...distanceToNextTile, ...distanceToTarget];
    };

    const translateOutput = (output: number[]): A15PuzzleDirection => {
        const sorted = output.slice().sort((a, b) => b - a);
        const best = output.indexOf(sorted[0]);
        switch (best) {
            default:
            case 0: return A15PuzzleDirection.Top;
            case 1: return A15PuzzleDirection.Right;
            case 2: return A15PuzzleDirection.Bottom;
            case 3: return A15PuzzleDirection.Left;
        }
    };

    const solution = (network: PNC, problem: Phenotype) => {
        let currentFitness = fitness(problem);
        let fitnessNotRaisedTimes = 0;

        while (!problem.lose
            && problem.moves.length < maxMoveCount
            && fitnessNotRaisedTimes < solutionFitnessNotRaisedThreshold) {
            const input = translateInput(problem.puzzle);
            const output = network.activate(input);
            const fromDirection = translateOutput(output);
            problem.moves.push(fromDirection);

            if (problem.puzzle.validDirections.indexOf(fromDirection) !== -1) {
                problem.puzzle.moveToEmpty(fromDirection);
            } else {
                problem.lose = true;
            }

            const newFitness = fitness(problem);
            fitnessNotRaisedTimes = currentFitness > newFitness ? fitnessNotRaisedTimes + 1 : 0;
            currentFitness = newFitness;
        }

        return problem;
    };

    const ga = GeneticAlgorithm.createFlat<number, number, Phenotype, PNC>({
        individual: individualFactory,
        problem: async (generation: number): Promise<Phenotype> => {
            const puzzle = await puzzleFactory(generation);
            const initialState = new A15PuzzleState(
                puzzle.matrix.width,
                puzzle.matrix.height,
                puzzle.matrix.tiles as A15PuzzleTile[]);
            return {
                initialState,
                puzzle,
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
