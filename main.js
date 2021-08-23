import m from 'mithril';
import tagl, {msline} from 'tagl-mithril';

const {h1, div, button} = tagl(m);
const {trunc, random} = Math;
const {freeze} = Object;

const N = 15;
const K = 10;

const range = (() => {
    const r = [];
    return (N) => {
        for (let i = r.length; i < N; i++) r.push(i);
        return r.slice(0, N);
    };
})();

const createField = () => ({
    value: 0,
    color: {
        r: 0,
        g: 255,
        b: 0,
    },
    flagged: false,
    hidden: true,
});

const init = (N) => range(N * N).map(createField);
const coord = (idx) => ({
    r: trunc(idx / N),
    c: idx % N,
});
const idx = (p) => p.r * N + p.c;
const onBoard = (p) => p.r >= 0 && p.c >= 0 && p.r < N && p.c < N;
const up = (p) => ({r: p.r - 1, c: p.c + 0});
const right = (p) => ({r: p.r + 0, c: p.c + 1});
const left = (p) => ({r: p.r + 0, c: p.c - 1});
const down = (p) => ({r: p.r + 1, c: p.c + 0});
const use = (v, fn) => fn(v);
const all =
    (...f) =>
    (p) =>
        f.reduce((acc, v) => v(acc), p);

const neighbors4 = (p) => [up, right, down, left].map((f) => f(p)).filter(onBoard);

const neighbors = (p) =>
    [up, all(up, right), right, all(down, right), down, all(down, left), left, all(up, left)]
        .map((f) => f(p))
        .filter(onBoard);

const FIELD = freeze({
    FREE: 0,
    MINE: 1,
});

const covered = (idx) => game.field[idx].hidden;

const value = (p) => neighbors(p).map(idx).filter(mine).length;

const mine = (idx) => game.field[idx].value === FIELD.MINE;
const addMine = (idx) => (game.field[idx].value = FIELD.MINE);
const initMines = (K) =>
    range(K).forEach(() => {
        let placed = false;
        do {
            const idx = trunc(random() * N * N);
            if (!mine(idx)) {
                addMine(idx);
                placed = true;
            }
        } while (!placed);
    });

const game = {
    field: init(N),
    death: 0,
    won : false,
};

const contains = (arr, e) => arr.indexOf(e) >= 0;

initMines(K);

const greaterZero = (e) => e > 0;
const isZero = (e) => e === 0;

const flood = (fidx, idxes = []) => {
    if (!contains(idxes, fidx)) {
        idxes.push(fidx);
        neighbors4(coord(fidx))
            .filter(all(value, isZero))
            .forEach((p) => flood(idx(p), idxes));
    }
    return idxes;
};

const not = (e) => !e;

const won = () =>
    range(N * N)
        .filter(all(mine, not))
        .filter(covered).length === 0;

const uncover = (idxes, allNeighbors = true) =>
    idxes.forEach((fidx) => [
        (game.field[fidx].hidden = false),
        allNeighbors ? neighbors4(coord(fidx)).forEach((nidx) => (game.field[idx(nidx)].hidden = false)) : null,
    ]);

const click = (idx) => {
    console.log(idx);
    if (mine(idx)) {
        game.death += 1;
        uncover([idx], false);
    } else if (value(coord(idx)) === 0) {
        uncover(flood(idx));
    } else {
        uncover([idx], false);
    }
    if (won()) {
        game.won = true;
    }
};

m.mount(document.body, {
    view: (vnode) =>
        div.container(
            div.field(
                {
                    style: `
                        --width: min(90vh,90vw);
                        --height: min(90vh,90vw);
                        --col:${N};
                        --row:${N};
                        --gap:2px;
                    `,
                },
                game.field.map((field, fidx) =>
                    div.box[field.hidden ? 'red' : ''](
                        {
                            onmouseup: () => click(fidx),
                            stsyle: `--col:${N};--row:${N};--gap:2vh;`,
                        },
                        covered(fidx)
                            ? ''
                            : !mine(fidx)
                            ? use(neighbors(coord(fidx)).map(idx).filter(mine).length, (mines) =>
                                  mines > 0 ? mines : ''
                              )
                            : '×'
                        //                        field.value === FIELD.MINE ? 1 : ''
                    )
                )
            ),
            button({onclick: () => [(game.field = init(N)),game.won=false, initMines(K)]}, 'New'),
            div('death', game.death,' ',game.won?'won':'')
        ),
});
