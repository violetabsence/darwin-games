import { A15PuzzleTile } from "./A15PuzzleTile";

// TODO: Ensure solution working as expected.

// Solution taken from SO answer: https://stackoverflow.com/a/34570524
export function validate15Puzzle(tiles: readonly A15PuzzleTile[], width: number): boolean {
    let parity = 0;
    let row = 0; // the current row we are on
    let blankRow = 0; // the row with the blank tile

    for (let i = 0; i < tiles.length; i++) {
        if (i % width === 0) { // advance to next row
            row++;
        }
        if (tiles[i] === 0) { // the blank tile
            blankRow = row; // save the row on which encountered
            continue;
        }

        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] > tiles[j] && tiles[j] !== 0) {
                parity++;
            }
        }
    }

    if (width % 2 === 0) { // even grid
        if (blankRow % 2 === 0) { // blank on odd row; counting from bottom
            return parity % 2 === 0;
        } else { // blank on even row; counting from bottom
            return parity % 2 !== 0;
        }
    } else { // odd grid
        return parity % 2 === 0;
    }
}
