const worker = require('worker');
const Algebrite = require('algebrite');

worker.dedicated({
    do_calc(alg) {
        var out = Algebrite.run(alg).toString();
        Algebrite.clearall();
        return out;
    },

    do_multi_calc(alg) {
        let res = "";
        alg.forEach(item => res = Algebrite.run(item).toString());
        Algebrite.clearall();
        return res;
    }
});