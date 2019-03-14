
import resize from './resize';
import { bind, trigger } from './utils';

export default class View {
    defaultUI = {};
    ui = {};
    defaultEvents = {};
    events = {};
    eventsMap = new Map;
    _isDestroyed = false;

    constructor(props) {
        if (props && props.el) {
            this.el = props.el;
        }
    }

    render() {
        if (typeof this.el == 'string') {
            this.el = this.getElementBySelector(this.el);
        }

        // Set UI
        this.initUI();


        // Can the function on the main view
        if (typeof this.init === 'function') this.init();

        // Add Event listeners
        this.initEvents();

        // Add resize listener
        resize.add(this.onResize.bind(this));
    }

    initUI() {
        this.uiSelectors = Object.assign(this.defaultUI, this.ui);
        this._ui = Object.assign({}, this.ui);

        this.bindUIElements();
    }

    bindUIElements() {
        this.ui = {};
        // Transform ui to elements
        for (const key in this.uiSelectors) {
            if (this.uiSelectors.hasOwnProperty(key)) {
                const selector = this.uiSelectors[key];
                this.ui[key] = this.getElementBySelector(selector);
            }
        }
    }

    /**
     * Adds event listeners to the view
     */
    initEvents() {
        this.eventsSelectors = Object.assign(this.defaultEvents, this.events);
        this._events = Object.assign({}, this.events);

        this.bindEvents();
    }
    bindEvents() {
        // Reset events
        this.unbindEvents();

        // Bind events
        for (const key in this.eventsSelectors) {
            if (this.eventsSelectors.hasOwnProperty(key)) {
                const functionName = this.eventsSelectors[key];
                let [event, ui] = key.split(' ');
                // Allowing clearer syntax
                event = event.replace(/:/gi, '');

                // Get the function and bind it to the view
                const func = this[functionName] ? this[functionName].bind(this) : false;
                if (!func) continue;

                const target = (() => {
                    if (!ui) {
                        return this.el;
                    } else {
                        return this.ui[ui.replace('@ui.', '')];
                    }
                })();

                if (target) {
                    const add = (el) => {
                        el.addEventListener(event, func, false);
                        const list = this.eventsMap.has(el) ? this.eventsMap.get(el) : [];
                        list.push({ event, func });
                        this.eventsMap.set(el, list);
                    };
                    if (Array.isArray(target)) {
                        target.forEach((el) => {
                            add(el);
                        });
                    } else {
                        add(target);
                    }
                }
            }
        }
    }
    unbindEvents() {
        this.eventsMap.forEach((list, el) => {
            list.forEach(({ event, func }) => {
                el.removeEventListener(event, func);
            });
        });
    }

    getElementBySelector(selector) {
        if (typeof this.el == 'undefined') return console.warn(`can't set find ${selector} on undefined`, this);
        if (selector instanceof HTMLElement) return selector; // Allow the use of DOM elements in the ui object
        const base = this.el instanceof HTMLElement ? this.el : document.documentElement;

        if (selector.endsWith('[0]') || selector.startsWith('#')) {
            return base.querySelector(selector.replace('[0]', ''));
        } else {
            let nl = base.querySelectorAll(selector);
            let l = nl.length;
            let arr = new Array(l);
            while (l--) { arr[l] = nl[l]; };
            return arr;
        }
    }

    trigger(event) {
        event = event.replace(/:/gi, '');
        trigger(this.el, event);
    }

    bind(...props) {
        bind(this, ...props);
    }

    /**
     * To be overwritten by child view
     */
    onResize() {}

    destroy() {
        if (typeof this.beforeDestroy === 'function') this.beforeDestroy();

        this.unbindEvents();

        this.el.remove();
        this._isDestroyed = true;
    }
}
