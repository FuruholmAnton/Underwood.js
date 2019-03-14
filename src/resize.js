
class Resize {
    functions = [];

    constructor() {
        window.addEventListener('resize', (e) => {
            for (let i = 0; i < this.functions.length; i++) {
                const func = this.functions[i];
                if (typeof func == 'function') {
                    func(e);
                } else {
                    console.warn('Incorrect function', func);
                }
            }
        }, false);
    }

    add(func) {
        this.functions.push(func);
    }

    remove(func) {
        this.functions.splice(this.functions.indexOf(func));
    }
}
export default new Resize;
