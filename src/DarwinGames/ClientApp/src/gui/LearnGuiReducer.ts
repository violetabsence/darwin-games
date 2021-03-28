import React from "react";

export type GenerationRecord<TGeneration, TSolution> = {
    index: number,
    data: TGeneration,
    solutions: TSolution[],
};

export type LearnGuiState<TGeneration, TSolution> = {
    generationRecords: GenerationRecord<TGeneration, TSolution>[],
    generations: TGeneration[],
    solutions?: TSolution[],
    generationIndex: number,
    solutionIndex: number,
}

export type LearnGuiAction<TGeneration, TSolution> =
    { kind: "clear" } |
    { kind: "set-generation", index: number, generation: TGeneration, solutions: TSolution[] } |
    { kind: "select-generation", index: number } |
    { kind: "select-solution", index: number };

export type LearnGuiReducerType<TGeneration, TSolution> =
    React.Reducer<LearnGuiState<TGeneration, TSolution>, LearnGuiAction<TGeneration, TSolution>>

export function LearnGuiReducer<TGeneration, TSolution>(
    current: LearnGuiState<TGeneration, TSolution>,
    action: LearnGuiAction<TGeneration, TSolution>) {
    switch (action.kind) {
        case "clear":
            return { ...LearnGuiInitialState };
        case "set-generation":
            const record: GenerationRecord<TGeneration, TSolution> = {
                index: action.index,
                data: action.generation,
                solutions: action.solutions,
            };

            const index = current.generationRecords.findIndex((g) => g.index === action.index);
            if (index !== -1) {
                current.generationRecords[index] = record;
            } else {
                current.generationRecords.push(record);
                current.generationRecords.sort((a, b) => a.index - b.index);
            }

            current.generations = current.generationRecords.map((r) => r.data);
            if (current.generationRecords.length === 1) {
                current.solutions = current.generationRecords[0].solutions;
            }
            break;
        case "select-generation": {
            if (current.generationIndex === action.index) {
                return current;
            }

            current.generationIndex = action.index;
            current.solutions = current.generationRecords[current.generationIndex]?.solutions;
            break;
        }
        case "select-solution": {
            if (current.solutionIndex === action.index) {
                return current;
            }

            current.solutionIndex = action.index;
            break;
        }
    }
    return { ...current };
};

export const LearnGuiInitialState: LearnGuiState<any, any> = {
    generationRecords: [],
    generations: [],
    solutions: undefined,
    generationIndex: 0,
    solutionIndex: 0,
};
