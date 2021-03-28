import { Architect, Network, Neuron } from "synaptic";

import { IChromosome } from "../genetic/IChromosome";

export class PerceptronNetworkChromosome implements IChromosome<number> {
    private readonly _network: Network;

    public get genes(): number[] {
        const neurons = this.getNeurons();
        return neurons.map((n) => n.bias);
    }

    public set genes(value: number[]) {
        const neurons = this.getNeurons();
        if (value.length !== neurons.length) throw new Error("Genes count mismatch.");

        neurons.forEach((n, i) => n.bias = value[i]);
    }

    public constructor(...numberOfNeurons: number[]) {
        this._network = new Architect.Perceptron(...numberOfNeurons);
    }

    public clone(): PerceptronNetworkChromosome {
        const clone = new PerceptronNetworkChromosome(
            this._network.layers.input.neurons().length,
            ...this._network.layers.hidden.map((l) => l.neurons().length),
            this._network.layers.output.neurons().length);

        clone.genes = this.genes;
        return clone;
    }

    public activate(input: number[]): number[] {
        return this._network.activate(input);
    }

    private getNeurons(): Neuron[] {
        return this._network.layers.hidden.map((l) => l.neurons()).flat();
    }
}
