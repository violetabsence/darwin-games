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
import { Field, ISnakeGame, ObjectType } from "../game";
import { Direction } from "../game/Direction";
import { Point } from "../game/Point";
import { SnakeGame } from "../game/SnakeGame";
import { SnakeLearnSettings } from "./SnakeLearnSettings";

export type Phenotype = {
    initialState: Field,
    game: ISnakeGame,
    moves: Direction[],
    emptyMovesCount: number,
    lose: boolean,
};

export type Individual = IIndividual<number, number, PNC>;

const SightDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
type SightDirection = typeof SightDirections[number];

export const learn = async (
    settings: SnakeLearnSettings,
    eventHandler: EventHandler<number, number, Phenotype, Phenotype, PNC, Individual>) : Promise<void> => {
    const { maxGenerationCount, populationSize, maxAge, puzzleWidth: w, puzzleHeight: h } = settings;
    const tileCount = w * h;

    const inputNeurons = 16;
    const hiddenLayersNeurons = [32, 16];
    const outputNeurons = 4;

    const solutionFitnessNotRaisedThreshold = tileCount;

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
        return problem.game.snake.segments.length + 1 / (problem.emptyMovesCount || 1);
    };

    const translateInput = (input: ISnakeGame): number[] => {
        const getShift = (dir: SightDirection): Point => {
            switch (dir) {
                case "N": return { x: 0, y: -1 };
                case "NE": return { x: 1, y: -1 };
                case "E": return { x: 1, y: 0 };
                case "SE": return { x: 1, y: 1 };
                case "S": return { x: 0, y: 1 };
                case "SW": return { x: -1, y: 1 };
                case "W": return { x: -1, y: 0 };
                case "NW": return { x: -1, y: -1 };
            }
        };

        const getDistance = (direction: SightDirection, ...objects: ObjectType[]) => {
            const shift = getShift(direction);
            const cur: Point = { x: input.snake.x, y: input.snake.y };
            let obj: ObjectType = "none";
            let distance = -1;
            while (obj !== "void" && objects.indexOf(obj) === -1) {
                distance++;
                cur.x += shift.x;
                cur.y += shift.y;
                obj = input.getObject(cur);
            }

            return objects.indexOf("void") === -1 && obj === "void" ? -1 : distance;
        };

        const toObstacles = SightDirections.map((d) => getDistance(d, "snake", "void"));
        const toFood = SightDirections.map((d) => getDistance(d, "food"));
        return [...toObstacles, ...toFood];
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

        while (!problem.lose && fitnessNotRaisedTimes < solutionFitnessNotRaisedThreshold) {
            const input = translateInput(problem.game);
            const output = network.activate(input);
            const fromDirection = translateOutput(output);
            problem.moves.push(fromDirection);

            problem.game.setDirection(fromDirection);
            const obj = problem.game.move();
            problem.emptyMovesCount = obj === "food" ? 0 : problem.emptyMovesCount + 1;

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
                emptyMovesCount: 0,
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
