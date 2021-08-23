import m from 'mithril';
import tagl from 'tagl-mithril';

const {h1, div} = tagl(m);

const N = 30;

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
});

const init = (N) => range(N * N).map(createField);

const game = {
    field: init(N),
};

m.mount(document.body, {
    view: (vnode) =>
        div.container(
            div.field(
                {
                    style: `
                        --width: min(100vh,100vw);
                        --height: min(100vh,100vw);
                        --col:${N};
                        --row:${N};
                        --gap:2px;
                    `,
                },
                game.field.map((field) =>
                    div.box({
                        stsyle: `--col:${N};--row:${N};--gap:2vh;`,
                    })
                )
            )
        ),
});
