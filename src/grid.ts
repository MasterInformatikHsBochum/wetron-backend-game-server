export class Grid {
    private _grid;

    constructor (readonly width: number, readonly height: number) {
        this._grid = new Array(width);

        for (let i = 0; i < this._grid.length; i++) {
            this._grid[i] = new Array(height).fill(0);
        }
    }

    public isCoordinateEmpty(x: number, y: number): boolean {
        if (x < 0) {
            return false;
        } else if (x > this.width - 1) {
            return false;
        } else if (y < 0) {
            return false;
        } else if (y > this.height - 1) {
            return false;
        } else if (this._grid[x][y] > 0) {
            return false;
        } else {
            return true;
        }
    }

    public pushPlayerToCoordinates(player: number, x: number, y: number): boolean {
        if (this.isCoordinateEmpty(x, y)) {
            this._grid[x][y] = player;
            return true;
        } else {
            return false;
        }
    }
}
