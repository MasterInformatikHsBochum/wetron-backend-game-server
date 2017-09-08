import { Game } from './../src/game';
import { Player } from './../src/player';
import { expect } from 'chai';
import 'mocha';

describe('Hello function', () => {
    it('should return hello world', () => {
        let players: Player[] = new Array();
        players.push(new Player())
        players.push(new Player())

        const game = new Game(1, players);
        expect(game.gameId).to.equal(1);
        expect(game.players).to.equal(players);
    });
});