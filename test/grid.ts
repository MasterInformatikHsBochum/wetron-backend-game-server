import { Grid } from './../src/grid';
import { expect } from 'chai';
import 'mocha';

const width: number = 100;
const height: number = 100;
const grid = new Grid(width, height);

describe('Grid', () => {
    it('.width should equal given width to constructor', () => {
        expect(grid.width).to.equal(width);
    });

    it('.height should equal given height to constructor', () => {
        expect(grid.height).to.equal(height);
    });

    it('.isCoordinateEmpty(0, 0) should return true', () => {
        expect(grid.isCoordinateEmpty(0, 0)).to.equal(true);
    });

    it('.isCoordinateEmpty(-1, -1) should return false', () => {
        expect(grid.isCoordinateEmpty(-1, -1)).to.equal(false);
    });

    it('.pushPlayerToCoordinates(1, 10, 10) should return true', () => {
        expect(grid.pushPlayerToCoordinates(1, 10, 10)).to.equal(true);
    });

    it('.pushPlayerToCoordinates(2, 10, 10) should return false', () => {
        expect(grid.pushPlayerToCoordinates(2, 10, 10)).to.equal(false);
    });
});
