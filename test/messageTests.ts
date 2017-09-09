import { Message } from './../src/message';
import { expect } from 'chai';
import 'mocha';

describe('Message', () => {
    it ('should throw on gameId: 0', () => {
        let badFn = function() {new Message(`{"g":0, "e":0, "p":0, "t":"c", "v":{}}`)}
        expect(badFn).to.throw();
    })

    it ('should throw on playerId: 0', () => {
        let badFn = function() {new Message(`{"g":1, "e":0, "p":0, "t":"c", "v":{}}`)}
        expect(badFn).to.throw();
    })
});