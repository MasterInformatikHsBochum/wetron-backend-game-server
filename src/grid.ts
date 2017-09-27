export class Grid {
    private _width: number;
    private _height: number;
    private _grid;

    constructor (width: number, height: number) {
        this._width = width;
        this._height = height;
        this._grid = new Array(this._width);

        for (let i = 0; i < this._grid.length; i++) {
            this._grid[i] = new Array(this._height).fill(0);
        }
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    public isCoordinateEmpty(x: number, y: number): boolean {
        if (this._grid[x][y] > 0) {
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
