
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf$1 = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf$1(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf$1(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active$1 = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active$1 += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active$1 -= deleted;
            if (!active$1)
                clear_rules();
        }
    }
    function clear_rules() {
        raf$1(() => {
            if (active$1)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let mainOverlayData = writable({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        w: 250,
        h: 300,
        offsetX: 10,
        offsetY: 0,
        cursorOffsetX: 0,
        cursorOffsetY: 0,
        visible: false,
        dragLocked: false,
        initialDrag: true,
        overlayLocked: false,
        isOpening: false,
        dataMode: "none",
    });
    const setX = (val) => {
        let currentVal = get_store_value(mainOverlayData);
        // do not update if drag locked is on
        if (currentVal.dragLocked)
            return;
        currentVal.x = val;
        mainOverlayData.set(Object.assign({}, currentVal));
    };
    const setY = (val) => {
        let currentVal = get_store_value(mainOverlayData);
        // do not update if drag locked is on
        if (currentVal.dragLocked)
            return;
        currentVal.y = val;
        mainOverlayData.set(Object.assign({}, currentVal));
    };
    const setSelectedElmnt = (elmntNum, overrideNum) => {
        setTimeout(() => {
            let currentVal = get_store_value(mainOverlayData);
            if (elmntNum !== undefined)
                currentVal.elementNumber = elmntNum;
            if (overrideNum !== undefined)
                currentVal.overrideNumber = overrideNum;
            mainOverlayData.set(Object.assign({}, currentVal));
        }, 0);
    };

    const HTMltagInfo = {
        "A": { "name": "Anchor", "iconURI": "./assets/icons/link.svg" },
        "BODY": { "name": "Document body", "iconURI": "./assets/icons/browser.svg" },
        "BUTTON": { "name": "Button", "iconURI": "./assets/icons/play-circle.svg" },
        "CANVAS": { "name": "Canvas", "iconURI": "./assets/icons/canvas.svg" },
        "DIV": { "name": "Division", "iconURI": "./assets/icons/grid.svg" },
        "H1": { "name": "Heading 1", "iconURI": "./assets/icons/heading.svg" },
        "H2": { "name": "Heading 2", "iconURI": "./assets/icons/heading.svg" },
        "H3": { "name": "Heading 3", "iconURI": "./assets/icons/heading.svg" },
        "H4": { "name": "Heading 4", "iconURI": "./assets/icons/heading.svg" },
        "H5": { "name": "Heading 5", "iconURI": "./assets/icons/heading.svg" },
        "H6": { "name": "Heading 6", "iconURI": "./assets/icons/heading.svg" },
        "HR": { "name": "Horizontal line", "iconURI": "./assets/icons/minus.svg" },
        "INPUT": { "name": "Input", "iconURI": "./assets/icons/globe.svg" },
        "LABEL": { "name": "Label", "iconURI": "./assets/icons/pricetags.svg" },
        "OL": { "name": "Organized list", "iconURI": "./assets/icons/list.svg" },
        "UL": { "name": "Unorganized list", "iconURI": "./assets/icons/menu.svg" },
        "PROGRESS": { "name": "Progress", "iconURI": "./assets/icons/clock.svg" },
        "P": { "name": "Paragraph", "iconURI": "./assets/icons/paragraph.svg" },
        "SECTION": { "name": "Section", "iconURI": "./assets/icons/layout.svg" },
        "SPAN": { "name": "Span", "iconURI": "./assets/icons/flash.svg" },
        "TEXTAREA": { "name": "Textarea", "iconURI": "./assets/icons/edit-2.svg" },
    };
    let collection = writable([]);
    let selectedComponent = writable(-1);
    let selectedOverride = writable(-1);
    let focusedComponent = writable(-1); // this is for detecting delete
    let focusedOverride = writable(-1); // this is for detecting delete
    let layerDeleteLock = writable(false); // this is for locking the delete function. If this is true, you can't delete
    let layerBlurLock = writable(false); // this is for locking the blur function. If this is true, you can't blur
    // functions for controlling the collection list
    const addComponent = (type, defaultStyle = {}, showOutline = false) => {
        let currCollection = get_store_value(collection);
        // check if type aready exist in currCollection
        for (let i = 0; i < currCollection.length; i++) {
            if (currCollection[i].type === type) {
                // type already exist. Add new blank override to that type instead
                addOverride(i);
                return;
            }
        }
        // create a new element interfact instance with type *type*, and then set the new value to collection
        currCollection = [...currCollection, {
                type: type,
                showing: false,
                style: defaultStyle,
                styleOverrides: [],
                showOutline: showOutline
            }];
        collection.set(currCollection);
    };
    const addOverride = (elmntIndex) => {
        let currCollection = get_store_value(collection);
        // find a non-duplicate name
        let i = 0;
        while (true) {
            let nameDup = false;
            for (let j = 0; j < currCollection[elmntIndex].styleOverrides.length; j++) {
                if (currCollection[elmntIndex].styleOverrides[j].name === `Override ${i}`) {
                    // set nameDup to true and break loop
                    nameDup = true;
                    break;
                }
            }
            // if there is no dup, break out loop
            if (!nameDup)
                break;
            i++; // else increment i and check again
        }
        // create a new override and add it to styleOverrides
        const cs = currCollection[elmntIndex].style;
        currCollection[elmntIndex].styleOverrides = [...currCollection[elmntIndex].styleOverrides, {
                name: `Override ${i}`,
                // style: Object.assign({}, currCollection[elmntIndex].style)
                style: structuredClone(cs)
            }];
        // show overrides first
        currCollection[elmntIndex].showing = true;
        currCollection = [...currCollection];
        collection.set(currCollection);
    };

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/components/ctrlMenuItems/StyleEditors/Advanced/Overlay.svelte generated by Svelte v3.48.0 */
    const file$D = "src/components/ctrlMenuItems/StyleEditors/Advanced/Overlay.svelte";

    function create_fragment$D(ctx) {
    	let section3;
    	let main;
    	let div9;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let div1;
    	let div1_style_value;
    	let t1;
    	let div2;
    	let div2_style_value;
    	let t2;
    	let div3;
    	let div3_style_value;
    	let t3;
    	let div4;
    	let div4_style_value;
    	let t4;
    	let div5;
    	let div5_style_value;
    	let t5;
    	let div6;
    	let div6_style_value;
    	let t6;
    	let div7;
    	let div7_style_value;
    	let t7;
    	let div8;
    	let div8_style_value;
    	let t8;
    	let div14;
    	let div13;
    	let div10;
    	let t9;
    	let div11;
    	let t10;
    	let div12;
    	let div14_style_value;
    	let t11;
    	let section0;
    	let p;
    	let t12;
    	let p_style_value;
    	let t13;
    	let section1;
    	let switch_instance0;
    	let t14;
    	let section2;
    	let switch_instance1;
    	let main_style_value;
    	let section3_class_value;
    	let section3_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	var switch_value = content1;

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance0 = new switch_value(switch_props());
    	}

    	var switch_value_1 = content2;

    	function switch_props_1(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value_1) {
    		switch_instance1 = new switch_value_1(switch_props_1());
    	}

    	const block = {
    		c: function create() {
    			section3 = element("section");
    			main = element("main");
    			div9 = element("div");
    			div0 = element("div");
    			t0 = text(">\n\n            \n            ");
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div6 = element("div");
    			t6 = space();
    			div7 = element("div");
    			t7 = space();
    			div8 = element("div");
    			t8 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div10 = element("div");
    			t9 = space();
    			div11 = element("div");
    			t10 = space();
    			div12 = element("div");
    			t11 = space();
    			section0 = element("section");
    			p = element("p");
    			t12 = text("Done");
    			t13 = space();
    			section1 = element("section");
    			if (switch_instance0) create_component(switch_instance0.$$.fragment);
    			t14 = space();
    			section2 = element("section");
    			if (switch_instance1) create_component(switch_instance1.$$.fragment);
    			attr_dev(div0, "id", "center");
    			attr_dev(div0, "style", div0_style_value = `transform: scale(${/*w*/ ctx[2] - 14}%, ${/*h*/ ctx[1] - 14}%)`);
    			attr_dev(div0, "class", "svelte-xyovuf");
    			add_location(div0, file$D, 357, 12, 17473);
    			attr_dev(div1, "id", "west");
    			attr_dev(div1, "style", div1_style_value = `transform: scaleY(${/*h*/ ctx[1] - 14}%) translate3d(-${/*w*/ ctx[2] / 2 - 8}px, 0px, 0px)`);
    			attr_dev(div1, "class", "svelte-xyovuf");
    			add_location(div1, file$D, 360, 12, 17598);
    			attr_dev(div2, "id", "east");
    			attr_dev(div2, "style", div2_style_value = `transform: scaleY(${/*h*/ ctx[1] - 14}%) translate3d(${/*w*/ ctx[2] / 2 - 8}px, 0px, 0px)`);
    			attr_dev(div2, "class", "svelte-xyovuf");
    			add_location(div2, file$D, 361, 12, 17707);
    			attr_dev(div3, "id", "north");
    			attr_dev(div3, "style", div3_style_value = `transform: scaleX(${/*w*/ ctx[2] - 14}%) translate3d(0px, -${/*h*/ ctx[1] / 2 - 13}px, 0px)`);
    			attr_dev(div3, "class", "svelte-xyovuf");
    			add_location(div3, file$D, 362, 12, 17815);
    			attr_dev(div4, "id", "south");
    			attr_dev(div4, "style", div4_style_value = `transform: scaleX(${/*w*/ ctx[2] - 14}%) translate3d(0px, ${/*h*/ ctx[1] / 2 - 13}px, 0px)`);
    			attr_dev(div4, "class", "svelte-xyovuf");
    			add_location(div4, file$D, 363, 12, 17926);
    			attr_dev(div5, "id", "nw");
    			attr_dev(div5, "style", div5_style_value = `transform: translate3d(-${/*w*/ ctx[2] / 2 - 8}px, -${/*h*/ ctx[1] / 2 - 13}px, 0px)`);
    			attr_dev(div5, "class", "svelte-xyovuf");
    			add_location(div5, file$D, 365, 12, 18041);
    			attr_dev(div6, "id", "ne");
    			attr_dev(div6, "style", div6_style_value = `transform: translate3d(${/*w*/ ctx[2] / 2 - 8}px, -${/*h*/ ctx[1] / 2 - 13}px, 0px)`);
    			attr_dev(div6, "class", "svelte-xyovuf");
    			add_location(div6, file$D, 366, 12, 18138);
    			attr_dev(div7, "id", "sw");
    			attr_dev(div7, "style", div7_style_value = `transform: translate3d(-${/*w*/ ctx[2] / 2 - 8}px, ${/*h*/ ctx[1] / 2 - 13}px, 0px)`);
    			attr_dev(div7, "class", "svelte-xyovuf");
    			add_location(div7, file$D, 367, 12, 18234);
    			attr_dev(div8, "id", "se");
    			attr_dev(div8, "style", div8_style_value = `transform: translate3d(${/*w*/ ctx[2] / 2 - 8}px, ${/*h*/ ctx[1] / 2 - 13}px, 0px)`);
    			attr_dev(div8, "class", "svelte-xyovuf");
    			add_location(div8, file$D, 368, 12, 18330);
    			attr_dev(div9, "id", "background");
    			attr_dev(div9, "class", "svelte-xyovuf");
    			add_location(div9, file$D, 356, 8, 17439);
    			attr_dev(div10, "class", "svelte-xyovuf");
    			add_location(div10, file$D, 375, 16, 18724);
    			attr_dev(div11, "class", "svelte-xyovuf");
    			add_location(div11, file$D, 376, 16, 18752);
    			attr_dev(div12, "class", "svelte-xyovuf");
    			add_location(div12, file$D, 377, 16, 18780);
    			attr_dev(div13, "id", "handle-bar");
    			attr_dev(div13, "class", "svelte-xyovuf");
    			add_location(div13, file$D, 374, 12, 18660);
    			attr_dev(div14, "id", "drag-handle");
    			attr_dev(div14, "style", div14_style_value = `transform: translate3d(0px, -${/*h*/ ctx[1] / 2 - 17}px, 0px)`);
    			attr_dev(div14, "class", "svelte-xyovuf");
    			add_location(div14, file$D, 372, 8, 18466);
    			attr_dev(p, "style", p_style_value = `transform: translate3d(${/*w*/ ctx[2] / 2 - 28}px, -${/*h*/ ctx[1] / 2 - 10}px, 0px)`);
    			attr_dev(p, "class", "svelte-xyovuf");
    			add_location(p, file$D, 382, 12, 18886);
    			attr_dev(section0, "id", "snapped-title-container");
    			attr_dev(section0, "class", "svelte-xyovuf");
    			add_location(section0, file$D, 381, 8, 18835);
    			attr_dev(section1, "class", "contentContainer svelte-xyovuf");
    			set_style(section1, "pointer-events", "all");
    			set_style(section1, "opacity", "1");
    			add_location(section1, file$D, 387, 8, 19217);
    			attr_dev(section2, "class", "contentContainer svelte-xyovuf");
    			set_style(section2, "pointer-events", "none");
    			set_style(section2, "opacity", "0");
    			add_location(section2, file$D, 390, 8, 19397);

    			attr_dev(main, "style", main_style_value = `
            transform: scale(${/*$mainOverlayData*/ ctx[0].visible ? 100 : 80}%);
        `);

    			attr_dev(main, "class", "svelte-xyovuf");
    			add_location(main, file$D, 351, 4, 17195);
    			attr_dev(section3, "id", "overlayContainer");

    			attr_dev(section3, "class", section3_class_value = "" + (null_to_empty(`${visible$2
			? `${/*$mainOverlayData*/ ctx[0].dragLocked ? "" : ""}`
			: "hidden"}`) + " svelte-xyovuf"));

    			attr_dev(section3, "style", section3_style_value = `transform: translate3d(${/*x*/ ctx[4] - /*$mainOverlayData*/ ctx[0].w / 2}px,${/*y*/ ctx[3] - /*$mainOverlayData*/ ctx[0].h / 2}px,0px); width: ${/*$mainOverlayData*/ ctx[0].w}px; height: ${/*$mainOverlayData*/ ctx[0].h}px`);
    			add_location(section3, file$D, 350, 0, 16890);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section3, anchor);
    			append_dev(section3, main);
    			append_dev(main, div9);
    			append_dev(div9, div0);
    			append_dev(div9, t0);
    			append_dev(div9, div1);
    			append_dev(div9, t1);
    			append_dev(div9, div2);
    			append_dev(div9, t2);
    			append_dev(div9, div3);
    			append_dev(div9, t3);
    			append_dev(div9, div4);
    			append_dev(div9, t4);
    			append_dev(div9, div5);
    			append_dev(div9, t5);
    			append_dev(div9, div6);
    			append_dev(div9, t6);
    			append_dev(div9, div7);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(main, t8);
    			append_dev(main, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div10);
    			append_dev(div13, t9);
    			append_dev(div13, div11);
    			append_dev(div13, t10);
    			append_dev(div13, div12);
    			/*div13_binding*/ ctx[12](div13);
    			/*div14_binding*/ ctx[13](div14);
    			append_dev(main, t11);
    			append_dev(main, section0);
    			append_dev(section0, p);
    			append_dev(p, t12);
    			append_dev(main, t13);
    			append_dev(main, section1);

    			if (switch_instance0) {
    				mount_component(switch_instance0, section1, null);
    			}

    			/*section1_binding*/ ctx[14](section1);
    			append_dev(main, t14);
    			append_dev(main, section2);

    			if (switch_instance1) {
    				mount_component(switch_instance1, section2, null);
    			}

    			/*section2_binding*/ ctx[15](section2);
    			/*main_binding*/ ctx[16](main);
    			/*section3_binding*/ ctx[17](section3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div14, "mousedown", /*startDragWindow*/ ctx[5], false, false, false),
    					listen_dev(p, "click", closeOverlay, false, false, false),
    					listen_dev(main, "mousedown", /*lockOverlay*/ ctx[6], false, false, false),
    					listen_dev(main, "mouseup", /*unlockOverlay*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*w, h*/ 6 && div0_style_value !== (div0_style_value = `transform: scale(${/*w*/ ctx[2] - 14}%, ${/*h*/ ctx[1] - 14}%)`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (!current || dirty & /*h, w*/ 6 && div1_style_value !== (div1_style_value = `transform: scaleY(${/*h*/ ctx[1] - 14}%) translate3d(-${/*w*/ ctx[2] / 2 - 8}px, 0px, 0px)`)) {
    				attr_dev(div1, "style", div1_style_value);
    			}

    			if (!current || dirty & /*h, w*/ 6 && div2_style_value !== (div2_style_value = `transform: scaleY(${/*h*/ ctx[1] - 14}%) translate3d(${/*w*/ ctx[2] / 2 - 8}px, 0px, 0px)`)) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (!current || dirty & /*w, h*/ 6 && div3_style_value !== (div3_style_value = `transform: scaleX(${/*w*/ ctx[2] - 14}%) translate3d(0px, -${/*h*/ ctx[1] / 2 - 13}px, 0px)`)) {
    				attr_dev(div3, "style", div3_style_value);
    			}

    			if (!current || dirty & /*w, h*/ 6 && div4_style_value !== (div4_style_value = `transform: scaleX(${/*w*/ ctx[2] - 14}%) translate3d(0px, ${/*h*/ ctx[1] / 2 - 13}px, 0px)`)) {
    				attr_dev(div4, "style", div4_style_value);
    			}

    			if (!current || dirty & /*w, h*/ 6 && div5_style_value !== (div5_style_value = `transform: translate3d(-${/*w*/ ctx[2] / 2 - 8}px, -${/*h*/ ctx[1] / 2 - 13}px, 0px)`)) {
    				attr_dev(div5, "style", div5_style_value);
    			}

    			if (!current || dirty & /*w, h*/ 6 && div6_style_value !== (div6_style_value = `transform: translate3d(${/*w*/ ctx[2] / 2 - 8}px, -${/*h*/ ctx[1] / 2 - 13}px, 0px)`)) {
    				attr_dev(div6, "style", div6_style_value);
    			}

    			if (!current || dirty & /*w, h*/ 6 && div7_style_value !== (div7_style_value = `transform: translate3d(-${/*w*/ ctx[2] / 2 - 8}px, ${/*h*/ ctx[1] / 2 - 13}px, 0px)`)) {
    				attr_dev(div7, "style", div7_style_value);
    			}

    			if (!current || dirty & /*w, h*/ 6 && div8_style_value !== (div8_style_value = `transform: translate3d(${/*w*/ ctx[2] / 2 - 8}px, ${/*h*/ ctx[1] / 2 - 13}px, 0px)`)) {
    				attr_dev(div8, "style", div8_style_value);
    			}

    			if (!current || dirty & /*h*/ 2 && div14_style_value !== (div14_style_value = `transform: translate3d(0px, -${/*h*/ ctx[1] / 2 - 17}px, 0px)`)) {
    				attr_dev(div14, "style", div14_style_value);
    			}

    			if (!current || dirty & /*w, h*/ 6 && p_style_value !== (p_style_value = `transform: translate3d(${/*w*/ ctx[2] / 2 - 28}px, -${/*h*/ ctx[1] / 2 - 10}px, 0px)`)) {
    				attr_dev(p, "style", p_style_value);
    			}

    			if (switch_value !== (switch_value = content1)) {
    				if (switch_instance0) {
    					group_outros();
    					const old_component = switch_instance0;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance0 = new switch_value(switch_props());
    					create_component(switch_instance0.$$.fragment);
    					transition_in(switch_instance0.$$.fragment, 1);
    					mount_component(switch_instance0, section1, null);
    				} else {
    					switch_instance0 = null;
    				}
    			}

    			if (switch_value_1 !== (switch_value_1 = content2)) {
    				if (switch_instance1) {
    					group_outros();
    					const old_component = switch_instance1;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value_1) {
    					switch_instance1 = new switch_value_1(switch_props_1());
    					create_component(switch_instance1.$$.fragment);
    					transition_in(switch_instance1.$$.fragment, 1);
    					mount_component(switch_instance1, section2, null);
    				} else {
    					switch_instance1 = null;
    				}
    			}

    			if (!current || dirty & /*$mainOverlayData*/ 1 && main_style_value !== (main_style_value = `
            transform: scale(${/*$mainOverlayData*/ ctx[0].visible ? 100 : 80}%);
        `)) {
    				attr_dev(main, "style", main_style_value);
    			}

    			if (!current || dirty & /*visible, $mainOverlayData*/ 1 && section3_class_value !== (section3_class_value = "" + (null_to_empty(`${visible$2
			? `${/*$mainOverlayData*/ ctx[0].dragLocked ? "" : ""}`
			: "hidden"}`) + " svelte-xyovuf"))) {
    				attr_dev(section3, "class", section3_class_value);
    			}

    			if (!current || dirty & /*x, $mainOverlayData, y*/ 25 && section3_style_value !== (section3_style_value = `transform: translate3d(${/*x*/ ctx[4] - /*$mainOverlayData*/ ctx[0].w / 2}px,${/*y*/ ctx[3] - /*$mainOverlayData*/ ctx[0].h / 2}px,0px); width: ${/*$mainOverlayData*/ ctx[0].w}px; height: ${/*$mainOverlayData*/ ctx[0].h}px`)) {
    				attr_dev(section3, "style", section3_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance0) transition_in(switch_instance0.$$.fragment, local);
    			if (switch_instance1) transition_in(switch_instance1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance0) transition_out(switch_instance0.$$.fragment, local);
    			if (switch_instance1) transition_out(switch_instance1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section3);
    			/*div13_binding*/ ctx[12](null);
    			/*div14_binding*/ ctx[13](null);
    			if (switch_instance0) destroy_component(switch_instance0);
    			/*section1_binding*/ ctx[14](null);
    			if (switch_instance1) destroy_component(switch_instance1);
    			/*section2_binding*/ ctx[15](null);
    			/*main_binding*/ ctx[16](null);
    			/*section3_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$D.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const xTween = tweened(get_store_value(mainOverlayData).x, { easing: identity });
    const yTween = tweened(get_store_value(mainOverlayData).y, { easing: identity });
    const wTween = tweened(get_store_value(mainOverlayData).w, { easing: identity });
    const hTween = tweened(get_store_value(mainOverlayData).h, { easing: identity });

    // the drag handle elements and tracker
    let dragHandleBar, dragArea, overlayScaler, overlayContainer;

    let dragThreshold = 100; // px
    let initCurX, initCurY;
    let initOverlayX, initOverlayY;
    let overlayPickupSize = 105; // in %
    let offsetCurX = 0, offsetCurY = 0; // how much offset the current cursor has to the edges of the overlay bounding box

    // visiblilty and position updating
    let visible$2 = false;

    // current content inside of the overlay. Idk what the type of this is so I'll let it auto-intfer
    let content1 = null, content1container;

    let content2 = null, content2container;

    let updateFrameSize = () => {
    	
    }; // this is a pointer to the content resize function, so that whenever we want to update the size of the overlay based on current conditions, we can do it here.

    function openOverlayFrame(trackingTarget, updateSizeFunc, trackContinuously = true, content) {
    	// set update frame size function
    	updateFrameSize = updateSizeFunc;

    	// set the content of the overlay to match
    	updateContent(content);

    	// update overlay size based on content
    	mainOverlayData.update(overlayDat => {
    		overlayDat.overlayLocked = true; // lock overlay so it doesn't click off when activating
    		overlayDat.isOpening = true;
    		overlayDat.elementNumber = get_store_value(selectedComponent); // update the current element number
    		overlayDat.overrideNumber = get_store_value(selectedOverride); // update the current override number
    		return overlayDat;
    	});

    	// reset the opening latch so we can still close the overlay
    	setTimeout(
    		() => {
    			mainOverlayData.update(overlayDat => {
    				overlayDat.isOpening = false;
    				return overlayDat;
    			});
    		},
    		2
    	); // this is not a really great practice, but it works for now.

    	setTimeout(
    		() => {
    			trackOverlay(trackingTarget, false);

    			mainOverlayData.update(overlayDat => {
    				overlayDat.visible = true; // show overlay
    				return overlayDat;
    			});
    		},
    		14
    	); // 14ms update window for the width to change properly and shit

    	// clear last tracking
    	cancelAnimationFrame(get_store_value(mainOverlayData).positionTrackingID);

    	mainOverlayData.update(overlayDat => {
    		overlayDat.positionTrackingID = undefined;
    		return overlayDat;
    	}); // We're setting trackingID to undefined so we can clear it.

    	// update the position of the overlay and show it
    	trackOverlay(trackingTarget, trackContinuously);

    	// attach listners to close the overlay
    	document.addEventListener("mouseup", unlockOverlay); // the purpose of this is to ensure that the user can close the overlay after the initial button down. This might appear kind of useless but DO NOT REMOVE THIS!

    	document.addEventListener("mousedown", closeOverlayWithMouse);
    	document.addEventListener("keydown", closeOverlayWithKey);
    }

    function closeOverlay() {
    	setTimeout(
    		() => {
    			if (get_store_value(mainOverlayData).isOpening) {
    				// when this execisOpeningmeans that the reopening latch is opened and we shouldn't close the overlay. We will reset the latch and then close it on the next call.
    				mainOverlayData.update(overlayDat => {
    					overlayDat.isOpening = false;
    					return overlayDat;
    				});

    				return;
    			}

    			overlayScaler.style.transitionDuration = "300ms";

    			mainOverlayData.update(overlayDat => {
    				overlayDat.visible = false; // hide the overlay
    				overlayDat.dragLocked = false; // undo drag lock
    				overlayDat.overlayLocked = false; // undo overlay lock
    				overlayDat.initialDrag = true; // reset initial drag to initial state
    				return overlayDat;
    			});

    			// cancel position tracking
    			cancelAnimationFrame(get_store_value(mainOverlayData).positionTrackingID);

    			// clear tracking animation
    			mainOverlayData.update(overlayDat => {
    				overlayDat.positionTrackingID = undefined;
    				return overlayDat;
    			});

    			// reset content
    			content1 = null;

    			content2 = null;
    			currentContent = null;

    			// remove all event listeners
    			document.removeEventListener("mouseup", unlockOverlay);

    			document.removeEventListener("mousedown", closeOverlayWithMouse);
    			document.removeEventListener("keydown", closeOverlayWithKey);
    		},
    		1
    	);
    }

    function keepOpenOverlay() {
    	mainOverlayData.update(overlayDat => {
    		overlayDat.overlayLocked = true;
    		return overlayDat;
    	}); // lock overlay so it doesn't click off when clicking on the picker

    	if (get_store_value(mainOverlayData).visible) mainOverlayData.update(overlayDat => {
    		overlayDat.visible = true;
    		return overlayDat;
    	});
    }

    // ======================== NON EXPORTABLES ========================
    // close the overlay with a click
    const closeOverlayWithMouse = e => {
    	if (!get_store_value(mainOverlayData).overlayLocked && !get_store_value(mainOverlayData).dragLocked) {
    		// if not locked, remove picker overlay
    		closeOverlay();
    	}
    };

    // close the overlay with a key press
    const closeOverlayWithKey = e => {
    	if (!get_store_value(mainOverlayData).dragLocked && !!e["key"] && e["key"] === "Escape") closeOverlay();
    };

    // unlock the overlay with a mouse up
    const unlockOverlay = () => {
    	mainOverlayData.update(overlayDat => {
    		overlayDat.overlayLocked = false;
    		return overlayDat;
    	});
    };

    /**
     * This function starts tracking the overlay to some given target (positionally).
     *
     * @param {boolean} trackContinuously - whether or not to continously track the overlay
     * @param {HTMLElement} target - the target that the overlay should track to
     */
    const trackOverlay = (target, trackContinuously = true) => {
    	if (!target) return; // no target
    	const targetBB = target.getBoundingClientRect(); // get target position

    	// set the X and Y position of the overlay and animate them. The min and max is for clamping the window position to be within the bounds of the window
    	setX(Math.round(Math.min(window.innerWidth - get_store_value(mainOverlayData).w / 2 - 6, Math.max(get_store_value(mainOverlayData).w / 2 + 6, targetBB.x - get_store_value(mainOverlayData).w / 2 - 20))));

    	setY(Math.round(Math.min(window.innerHeight - get_store_value(mainOverlayData).h / 2 - 6, Math.max(get_store_value(mainOverlayData).h / 2 + 6, targetBB.y + 20))));
    	xTween.set(get_store_value(mainOverlayData).x, { duration: !visible$2 ? 0.001 : 200 });
    	wTween.set(get_store_value(mainOverlayData).w, { duration: !visible$2 ? 0.001 : 200 });
    	yTween.set(get_store_value(mainOverlayData).y, { duration: !visible$2 ? 0.001 : 200 });
    	hTween.set(get_store_value(mainOverlayData).h, { duration: !visible$2 ? 0.001 : 200 });

    	// set the tweens to the destination if it's accurate enough
    	if (Math.round(get_store_value(xTween)) === get_store_value(mainOverlayData).x) xTween.set(get_store_value(mainOverlayData).x, { duration: 0.001 });

    	if (Math.round(get_store_value(yTween)) === get_store_value(mainOverlayData).y) yTween.set(get_store_value(mainOverlayData).y, { duration: 0.001 });
    	if (Math.round(get_store_value(wTween)) === get_store_value(mainOverlayData).w) wTween.set(get_store_value(mainOverlayData).w, { duration: 0.001 });
    	if (Math.round(get_store_value(hTween)) === get_store_value(mainOverlayData).h) hTween.set(get_store_value(mainOverlayData).h, { duration: 0.001 });

    	if (trackContinuously) {
    		// continuously update the trackingID
    		mainOverlayData.update(overlayDat => {
    			// get new animation frame
    			overlayDat.positionTrackingID = requestAnimationFrame(() => trackOverlay(target, trackContinuously));

    			return overlayDat;
    		});
    	}
    };

    let useContent1 = true;
    let currentContent;

    /**
     * This function updates the content inside of the overlay.
     *
     * @param newContent - The new content that is to be updated
     */
    const updateContent = newContent => {
    	// The way we're going to accomplish this is to constantly switch between content1 and content2. If useContent1 is active, we'll update to content1. If not, we'll update to content 2. The opacity and pointer events also switches around.
    	if (!!newContent && newContent != currentContent) {
    		// set the new content size
    		setTimeout(
    			() => {
    				updateFrameSize(true);
    			},
    			0
    		);

    		// set content
    		if (useContent1) {
    			if (!visible$2) content2 = null;
    			content1 = null;

    			setTimeout(
    				() => {
    					content1 = newContent;
    				},
    				0
    			);
    		} else {
    			if (!visible$2) content1 = null;
    			content2 = null;

    			setTimeout(
    				() => {
    					content2 = newContent;
    				},
    				0
    			);
    		}

    		// reverse pointer events
    		content1container.style.pointerEvents = useContent1 ? "all" : "none";

    		content2container.style.pointerEvents = useContent1 ? "none" : "all";

    		// set opacities
    		if (!visible$2) {
    			content1container.style.transitionDelay = "0ms";
    			content2container.style.transitionDelay = "0ms";
    		} else {
    			content1container.style.transitionDelay = useContent1 ? "200ms" : "0ms";
    			content2container.style.transitionDelay = useContent1 ? "0ms" : "200ms";
    		}

    		content1container.style.opacity = useContent1 ? "1" : "0";
    		content2container.style.opacity = useContent1 ? "0" : "1";

    		// inverse useContent1 and update current content
    		currentContent = newContent;

    		useContent1 = !useContent1;
    	}
    };

    function instance$D($$self, $$props, $$invalidate) {
    	let x;
    	let y;
    	let w;
    	let h;
    	let $mainOverlayData;
    	let $hTween;
    	let $wTween;
    	let $yTween;
    	let $xTween;
    	validate_store(mainOverlayData, 'mainOverlayData');
    	component_subscribe($$self, mainOverlayData, $$value => $$invalidate(0, $mainOverlayData = $$value));
    	validate_store(hTween, 'hTween');
    	component_subscribe($$self, hTween, $$value => $$invalidate(8, $hTween = $$value));
    	validate_store(wTween, 'wTween');
    	component_subscribe($$self, wTween, $$value => $$invalidate(9, $wTween = $$value));
    	validate_store(yTween, 'yTween');
    	component_subscribe($$self, yTween, $$value => $$invalidate(10, $yTween = $$value));
    	validate_store(xTween, 'xTween');
    	component_subscribe($$self, xTween, $$value => $$invalidate(11, $xTween = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Overlay', slots, []);

    	const startDragWindow = e => {
    		// give the handle a low transition duration
    		dragHandleBar.style.transitionDuration = "0ms";

    		// track initial cursor positions
    		initCurX = e.clientX;

    		initCurY = e.clientY;

    		// track initial overlay positions
    		initOverlayX = $mainOverlayData.x;

    		initOverlayY = $mainOverlayData.y;

    		// calculate offset
    		offsetCurX = initCurX - overlayContainer.getBoundingClientRect().x;

    		offsetCurY = initCurY - overlayContainer.getBoundingClientRect().y;

    		// reset all cursor offsets
    		set_store_value(mainOverlayData, $mainOverlayData.cursorOffsetX = 0, $mainOverlayData);

    		set_store_value(mainOverlayData, $mainOverlayData.cursorOffsetY = 0, $mainOverlayData);

    		// scale up window if dragged when snapped
    		if ($mainOverlayData.dragLocked) overlayScaler.style.transform = `scale(${overlayPickupSize}%) translate3d(0px, 0px, 0px)`;

    		// add event listeners
    		window.addEventListener("mousemove", dragWindow);

    		window.addEventListener("mouseup", endDragWindow);
    	};

    	const dragWindow = e => {
    		e.preventDefault(); // prevent dragging on texts

    		// track mouse position and move handle with it
    		let deltaX = e.clientX - initCurX;

    		let deltaY = e.clientY - initCurY;
    		const largestDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));

    		// move the handle to show it being unsnapped
    		if (!$mainOverlayData.dragLocked) {
    			// dragHandleBar.style.transform = `translate3d(${deltaX/3}px, ${deltaY/3}px, 0px)`;
    			overlayScaler.style.transform = `scale(${100 + largestDelta * (overlayPickupSize - 100) / dragThreshold}%) translate3d(${deltaX / 2.5}px, ${deltaY / 2.5}px, 0px)`;
    		}

    		if (largestDelta > dragThreshold || $mainOverlayData.dragLocked) {
    			// when this if statement executes, the window has either been snapped off or is dragged normally
    			if (!$mainOverlayData.dragLocked) {
    				overlayScaler.style.transitionDuration = `${800}ms`;
    				overlayScaler.style.transform = `scale(${overlayPickupSize}%) translate3d(0px, 0px, 0px)`;
    				dragHandleBar.style.transitionDuration = `${800}ms`;
    				dragHandleBar.style.transform = `translate3d(0px, 0px, 0px)`;

    				// when it snaps off, retrack the initial pos X and Y of cursor and overlay
    				initOverlayX = e.clientX - offsetCurX + $mainOverlayData.w / 2;

    				initOverlayY = e.clientY - offsetCurY + $mainOverlayData.h / 2;
    				initCurX = e.clientX;
    				initCurY = e.clientY;
    			}

    			// snap the window x and y to cursor position
    			set_store_value(mainOverlayData, $mainOverlayData.dragLocked = true, $mainOverlayData);

    			// update frame size to the correct size;
    			updateFrameSize(true);

    			// prevent user dragging overlay out of window
    			// I have no idea why this abomination works but it's not broken so i'm not gonna fix it
    			if (e.clientX - offsetCurX > 10 && e.clientX - offsetCurX + $mainOverlayData.w < window.innerWidth - 10) {
    				// X axis
    				set_store_value(
    					mainOverlayData,
    					$mainOverlayData.x = initOverlayX + deltaX + ($mainOverlayData.initialDrag
    					? $mainOverlayData.cursorOffsetX
    					: 0),
    					$mainOverlayData
    				);
    			} else {
    				if (e.clientX - offsetCurX <= 10) {
    					set_store_value(mainOverlayData, $mainOverlayData.x = 10 + $mainOverlayData.w / 2, $mainOverlayData);
    				} else {
    					set_store_value(mainOverlayData, $mainOverlayData.x = window.innerWidth - $mainOverlayData.w / 2 - 10, $mainOverlayData);
    				}
    			}

    			if (e.clientY - offsetCurY > 12 && e.clientY - offsetCurY + $mainOverlayData.h < window.innerHeight - 12) {
    				// Y axis
    				set_store_value(
    					mainOverlayData,
    					$mainOverlayData.y = initOverlayY + deltaY + ($mainOverlayData.initialDrag
    					? $mainOverlayData.cursorOffsetY
    					: 0),
    					$mainOverlayData
    				);
    			} else {
    				if (e.clientY - offsetCurY <= 12) {
    					set_store_value(mainOverlayData, $mainOverlayData.y = 12 + $mainOverlayData.h / 2, $mainOverlayData);
    				} else {
    					set_store_value(mainOverlayData, $mainOverlayData.y = window.innerHeight - $mainOverlayData.h / 2 - 12, $mainOverlayData);
    				}
    			}
    		} else {
    			overlayScaler.style.transitionDuration = "0ms";
    		}
    	};

    	const endDragWindow = () => {
    		overlayScaler.style.transitionDuration = "300ms";
    		overlayScaler.style.transform = `scale(100%)`;
    		dragHandleBar.style.transitionDuration = "300ms";
    		dragHandleBar.style.transform = `translate3d(0px, 0px, 0px)`;

    		// update the initialDrag latch
    		if (!!$mainOverlayData.dragLocked) {
    			set_store_value(mainOverlayData, $mainOverlayData.initialDrag = false, $mainOverlayData);
    		}

    		window.removeEventListener("mousemove", dragWindow);
    		window.removeEventListener("mouseup", endDragWindow);
    	};

    	const lockOverlay = () => {
    		set_store_value(mainOverlayData, $mainOverlayData.overlayLocked = true, $mainOverlayData);
    	};

    	const unlockOverlay = () => {
    		setTimeout(
    			() => {
    				set_store_value(mainOverlayData, $mainOverlayData.overlayLocked = false, $mainOverlayData);
    			},
    			0
    		);
    	};

    	// detect when window changes width, and adjust the position of color picker as needed
    	window.addEventListener("resize", e => {
    		if (!$mainOverlayData.dragLocked) return; // only activate when dragLocked

    		if ($mainOverlayData.x - $mainOverlayData.w / 2 <= 10) {
    			set_store_value(mainOverlayData, $mainOverlayData.x = 10 + $mainOverlayData.w / 2, $mainOverlayData);
    		} else if ($mainOverlayData.x + $mainOverlayData.w / 2 > window.innerWidth - 10) {
    			set_store_value(mainOverlayData, $mainOverlayData.x = window.innerWidth - $mainOverlayData.w / 2 - 10, $mainOverlayData);
    		}

    		if ($mainOverlayData.y - $mainOverlayData.h / 2 <= 10) {
    			set_store_value(mainOverlayData, $mainOverlayData.y = 10 + $mainOverlayData.h / 2, $mainOverlayData);
    		} else if ($mainOverlayData.y + $mainOverlayData.h / 2 > window.innerHeight - 10) {
    			set_store_value(mainOverlayData, $mainOverlayData.y = window.innerHeight - 10 - $mainOverlayData.h / 2, $mainOverlayData);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	function div13_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dragHandleBar = $$value;
    		});
    	}

    	function div14_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dragArea = $$value;
    		});
    	}

    	function section1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			content1container = $$value;
    		});
    	}

    	function section2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			content2container = $$value;
    		});
    	}

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			overlayScaler = $$value;
    		});
    	}

    	function section3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			overlayContainer = $$value;
    		});
    	}

    	$$self.$capture_state = () => ({
    		selectedComponent,
    		selectedOverride,
    		get: get_store_value,
    		setX,
    		setY,
    		xTween,
    		yTween,
    		wTween,
    		hTween,
    		dragHandleBar,
    		dragArea,
    		overlayScaler,
    		overlayContainer,
    		dragThreshold,
    		initCurX,
    		initCurY,
    		initOverlayX,
    		initOverlayY,
    		overlayPickupSize,
    		offsetCurX,
    		offsetCurY,
    		visible: visible$2,
    		content1,
    		content1container,
    		content2,
    		content2container,
    		updateFrameSize,
    		openOverlayFrame,
    		closeOverlay,
    		keepOpenOverlay,
    		closeOverlayWithMouse,
    		closeOverlayWithKey,
    		unlockOverlay,
    		trackOverlay,
    		useContent1,
    		currentContent,
    		updateContent,
    		tweened,
    		linear: identity,
    		mainOverlayData,
    		startDragWindow,
    		dragWindow,
    		endDragWindow,
    		lockOverlay,
    		unlockOverlay,
    		h,
    		w,
    		y,
    		x,
    		$mainOverlayData,
    		$hTween,
    		$wTween,
    		$yTween,
    		$xTween
    	});

    	$$self.$inject_state = $$props => {
    		if ('h' in $$props) $$invalidate(1, h = $$props.h);
    		if ('w' in $$props) $$invalidate(2, w = $$props.w);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$xTween*/ 2048) {
    			$$invalidate(4, x = $xTween);
    		}

    		if ($$self.$$.dirty & /*$yTween*/ 1024) {
    			$$invalidate(3, y = $yTween);
    		}

    		if ($$self.$$.dirty & /*$wTween*/ 512) {
    			$$invalidate(2, w = $wTween);
    		}

    		if ($$self.$$.dirty & /*$hTween*/ 256) {
    			$$invalidate(1, h = $hTween);
    		}

    		if ($$self.$$.dirty & /*$mainOverlayData*/ 1) {
    			// update overlay position, size, and visibility
    			if (!!$mainOverlayData) {
    				visible$2 = $mainOverlayData.visible;

    				// this is to prevent the overlay from getting scrolled out of view. We only activate this when we're not dragging on the picker
    				if (!$mainOverlayData.dragLocked) {
    					if ($mainOverlayData.y - $mainOverlayData.h / 2 <= 10) {
    						set_store_value(mainOverlayData, $mainOverlayData.y = 10 + $mainOverlayData.h / 2, $mainOverlayData);
    					} else if ($mainOverlayData.y + $mainOverlayData.h / 2 > window.innerHeight - 10) {
    						set_store_value(mainOverlayData, $mainOverlayData.y = window.innerHeight - 10 - $mainOverlayData.h / 2, $mainOverlayData);
    					}
    				}
    			}
    		}
    	};

    	return [
    		$mainOverlayData,
    		h,
    		w,
    		y,
    		x,
    		startDragWindow,
    		lockOverlay,
    		unlockOverlay,
    		$hTween,
    		$wTween,
    		$yTween,
    		$xTween,
    		div13_binding,
    		div14_binding,
    		section1_binding,
    		section2_binding,
    		main_binding,
    		section3_binding
    	];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$D, create_fragment$D, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$D.name
    		});
    	}
    }

    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/ctrlMenuItems/CollectionViewer/Element.svelte generated by Svelte v3.48.0 */
    const file$C = "src/components/ctrlMenuItems/CollectionViewer/Element.svelte";

    function create_fragment$C(ctx) {
    	let main;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let img0_class_value;
    	let img0_title_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let p;
    	let t2_value = HTMltagInfo[/*tagType*/ ctx[0]].name + "";
    	let t2;
    	let t3;
    	let div1;
    	let img2;
    	let img2_src_value;
    	let main_class_value;
    	let main_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			img2 = element("img");
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/icons/arrow-ios-forward.svg")) attr_dev(img0, "src", img0_src_value);

    			attr_dev(img0, "class", img0_class_value = "" + (null_to_empty(/*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "showArrow"
    			: "") + " svelte-7bkx8y"));

    			attr_dev(img0, "alt", "");

    			attr_dev(img0, "title", img0_title_value = /*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "collapse"
    			: "expand");

    			add_location(img0, file$C, 85, 8, 4975);
    			attr_dev(div0, "class", "svelte-7bkx8y");
    			add_location(div0, file$C, 84, 4, 4939);
    			attr_dev(img1, "rel", "preload");
    			if (!src_url_equal(img1.src, img1_src_value = /*iconURI*/ ctx[4])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			set_style(img1, "transition", "none");
    			attr_dev(img1, "class", "svelte-7bkx8y");
    			add_location(img1, file$C, 89, 4, 5203);
    			attr_dev(p, "class", "svelte-7bkx8y");
    			add_location(p, file$C, 90, 4, 5272);
    			attr_dev(img2, "rel", "preload");
    			if (!src_url_equal(img2.src, img2_src_value = "./assets/icons/plus.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-7bkx8y");
    			add_location(img2, file$C, 93, 8, 5416);
    			set_style(div1, "margin-right", "4px");
    			attr_dev(div1, "title", "Add Override");
    			attr_dev(div1, "class", "svelte-7bkx8y");
    			add_location(div1, file$C, 92, 4, 5312);

    			attr_dev(main, "class", main_class_value = "" + (null_to_empty(`layer ${/*$selectedComponent*/ ctx[6] === /*elmntIndex*/ ctx[1]
			? "selected"
			: ""}
            ${/*$focusedComponent*/ ctx[8] !== /*elmntIndex*/ ctx[1] && /*$selectedComponent*/ ctx[6] === /*elmntIndex*/ ctx[1] || /*$selectedOverride*/ ctx[7] !== -1 && /*$selectedComponent*/ ctx[6] === /*elmntIndex*/ ctx[1]
			? "blurred"
			: ""}`) + " svelte-7bkx8y"));

    			set_style(main, "min-height", /*height*/ ctx[2] + "px");
    			set_style(main, "margin-bottom", "10px");
    			set_style(main, "min-width", /*width*/ ctx[3] + "px");
    			add_location(main, file$C, 77, 0, 4492);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, img0);
    			append_dev(main, t0);
    			append_dev(main, img1);
    			append_dev(main, t1);
    			append_dev(main, p);
    			append_dev(p, t2);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			append_dev(div1, img2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*toggleShow*/ ctx[9], false, false, false),
    					listen_dev(div1, "click", /*click_handler*/ ctx[13], false, false, false),
    					listen_dev(main, "mousedown", /*focusComponent*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$collection, elmntIndex*/ 34 && img0_class_value !== (img0_class_value = "" + (null_to_empty(/*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "showArrow"
    			: "") + " svelte-7bkx8y"))) {
    				attr_dev(img0, "class", img0_class_value);
    			}

    			if (dirty & /*$collection, elmntIndex*/ 34 && img0_title_value !== (img0_title_value = /*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].showing
    			? "collapse"
    			: "expand")) {
    				attr_dev(img0, "title", img0_title_value);
    			}

    			if (dirty & /*iconURI*/ 16 && !src_url_equal(img1.src, img1_src_value = /*iconURI*/ ctx[4])) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*tagType*/ 1 && t2_value !== (t2_value = HTMltagInfo[/*tagType*/ ctx[0]].name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*$selectedComponent, elmntIndex, $focusedComponent, $selectedOverride*/ 450 && main_class_value !== (main_class_value = "" + (null_to_empty(`layer ${/*$selectedComponent*/ ctx[6] === /*elmntIndex*/ ctx[1]
			? "selected"
			: ""}
            ${/*$focusedComponent*/ ctx[8] !== /*elmntIndex*/ ctx[1] && /*$selectedComponent*/ ctx[6] === /*elmntIndex*/ ctx[1] || /*$selectedOverride*/ ctx[7] !== -1 && /*$selectedComponent*/ ctx[6] === /*elmntIndex*/ ctx[1]
			? "blurred"
			: ""}`) + " svelte-7bkx8y"))) {
    				attr_dev(main, "class", main_class_value);
    			}

    			if (dirty & /*height*/ 4) {
    				set_style(main, "min-height", /*height*/ ctx[2] + "px");
    			}

    			if (dirty & /*width*/ 8) {
    				set_style(main, "min-width", /*width*/ ctx[3] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (!main_intro) {
    				add_render_callback(() => {
    					main_intro = create_in_transition(main, fly, { x: 100, duration: 300 });
    					main_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$C.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$C($$self, $$props, $$invalidate) {
    	let $collection;
    	let $selectedComponent;
    	let $selectedOverride;
    	let $focusedOverride;
    	let $focusedComponent;
    	let $layerDeleteLock;
    	let $layerBlurLock;
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(5, $collection = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(6, $selectedComponent = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(7, $selectedOverride = $$value));
    	validate_store(focusedOverride, 'focusedOverride');
    	component_subscribe($$self, focusedOverride, $$value => $$invalidate(11, $focusedOverride = $$value));
    	validate_store(focusedComponent, 'focusedComponent');
    	component_subscribe($$self, focusedComponent, $$value => $$invalidate(8, $focusedComponent = $$value));
    	validate_store(layerDeleteLock, 'layerDeleteLock');
    	component_subscribe($$self, layerDeleteLock, $$value => $$invalidate(12, $layerDeleteLock = $$value));
    	validate_store(layerBlurLock, 'layerBlurLock');
    	component_subscribe($$self, layerBlurLock, $$value => $$invalidate(14, $layerBlurLock = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Element', slots, []);
    	const disp = createEventDispatcher();
    	let { tagType } = $$props;
    	let { elmntIndex } = $$props;
    	let { height } = $$props;
    	let { width } = $$props;
    	let { iconURI } = $$props;

    	const toggleShow = () => {
    		set_store_value(collection, $collection[elmntIndex].showing = !$collection[elmntIndex].showing, $collection);
    		disp("updateElList");
    	};

    	const focusComponent = () => {
    		// turn on blur lock
    		set_store_value(layerBlurLock, $layerBlurLock = true, $layerBlurLock);

    		set_store_value(selectedComponent, $selectedComponent = elmntIndex, $selectedComponent);
    		set_store_value(focusedComponent, $focusedComponent = elmntIndex, $focusedComponent);
    		set_store_value(selectedOverride, $selectedOverride = -1, $selectedOverride);
    		set_store_value(focusedOverride, $focusedOverride = -1, $focusedOverride);

    		// update the elemnt number for color picker
    		setSelectedElmnt($selectedComponent, $selectedOverride);
    	};

    	const writable_props = ['tagType', 'elmntIndex', 'height', 'width', 'iconURI'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Element> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		addOverride(elmntIndex);
    	};

    	$$self.$$set = $$props => {
    		if ('tagType' in $$props) $$invalidate(0, tagType = $$props.tagType);
    		if ('elmntIndex' in $$props) $$invalidate(1, elmntIndex = $$props.elmntIndex);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('iconURI' in $$props) $$invalidate(4, iconURI = $$props.iconURI);
    	};

    	$$self.$capture_state = () => ({
    		addOverride,
    		collection,
    		focusedComponent,
    		HTMltagInfo,
    		selectedComponent,
    		selectedOverride,
    		focusedOverride,
    		layerDeleteLock,
    		layerBlurLock,
    		setSelectedElmnt,
    		createEventDispatcher,
    		fly,
    		disp,
    		tagType,
    		elmntIndex,
    		height,
    		width,
    		iconURI,
    		toggleShow,
    		focusComponent,
    		$collection,
    		$selectedComponent,
    		$selectedOverride,
    		$focusedOverride,
    		$focusedComponent,
    		$layerDeleteLock,
    		$layerBlurLock
    	});

    	$$self.$inject_state = $$props => {
    		if ('tagType' in $$props) $$invalidate(0, tagType = $$props.tagType);
    		if ('elmntIndex' in $$props) $$invalidate(1, elmntIndex = $$props.elmntIndex);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('iconURI' in $$props) $$invalidate(4, iconURI = $$props.iconURI);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$focusedComponent, $focusedOverride, $layerDeleteLock, $selectedOverride, $selectedComponent, $collection*/ 6624) {
    			// event handler for key delete to delete element
    			if (($focusedComponent !== -1 || $focusedOverride !== -1) && !$layerDeleteLock) {
    				setTimeout(
    					() => {
    						document.onkeydown = e => {
    							// if delete is pressed, delete this element or override
    							if (e.key == "Backspace") {
    								// first detect if any override is selected. If it is, delete the override instead of the element
    								if ($selectedOverride === -1) {
    									// the case of if override is not selected
    									// check what the number of elements after removal is. If it's 0, reset all selected and focused comp index
    									let selectedComponentSnapshot = $selectedComponent;

    									if ($collection.length === 1) {
    										// reset selection index
    										set_store_value(selectedComponent, $selectedComponent = -1, $selectedComponent);

    										set_store_value(focusedComponent, $focusedComponent = -1, $focusedComponent);
    									} else {
    										set_store_value(
    											selectedComponent,
    											$selectedComponent = $collection.length - 2 < $selectedComponent
    											? $collection.length - 1
    											: $selectedComponent,
    											$selectedComponent
    										); // update snapshot

    										// if not empty, set it to be the next one
    										set_store_value(
    											selectedComponent,
    											$selectedComponent = $collection.length - 2 < $selectedComponent
    											? $collection.length - 2
    											: $selectedComponent,
    											$selectedComponent
    										);

    										set_store_value(
    											focusedComponent,
    											$focusedComponent = $collection.length - 2 < $selectedComponent
    											? $collection.length - 2
    											: $selectedComponent,
    											$focusedComponent
    										);
    									}

    									// self destruct
    									set_store_value(
    										collection,
    										$collection = [
    											...$collection.slice(0, selectedComponentSnapshot),
    											...$collection.slice(selectedComponentSnapshot + 1, $collection.length)
    										],
    										$collection
    									);
    								} else {
    									// if override IS selected
    									let styleOverrides = $collection[$selectedComponent].styleOverrides; // create override instance for quick access

    									let styleOverrideSnapshot = $selectedOverride;

    									// update style overrides
    									styleOverrides = $collection[$selectedComponent].styleOverrides;

    									// check what the number of elements after removal is. If it's 0, shift the focus to elmnt, and cancel the selectedOverride
    									if (styleOverrides.length === 1) {
    										// reset selection index (I don't know why the fuck it would be 1 when it's empty, but if it's 0 the thing won't work. Words cannot describe my fucking confusion)
    										set_store_value(selectedOverride, $selectedOverride = -1, $selectedOverride);

    										set_store_value(focusedOverride, $focusedOverride = -1, $focusedOverride);
    										set_store_value(focusedComponent, $focusedComponent = $selectedComponent, $focusedComponent);
    									} else {
    										// if not empty, set it to be the next one
    										styleOverrideSnapshot = styleOverrides.length - 2 < $selectedOverride
    										? styleOverrides.length - 1
    										: $selectedOverride; // update snapshot

    										set_store_value(
    											selectedOverride,
    											$selectedOverride = styleOverrides.length - 2 < $selectedOverride
    											? styleOverrides.length - 2
    											: $selectedOverride,
    											$selectedOverride
    										);

    										set_store_value(
    											focusedOverride,
    											$focusedOverride = styleOverrides.length - 2 < $selectedOverride
    											? styleOverrides.length - 2
    											: $selectedOverride,
    											$focusedOverride
    										);
    									}

    									// remove override
    									set_store_value(
    										collection,
    										$collection[$selectedComponent].styleOverrides = [
    											...styleOverrides.slice(0, styleOverrideSnapshot),
    											...styleOverrides.slice(styleOverrideSnapshot + 1, styleOverrides.length)
    										],
    										$collection
    									);

    									set_store_value(collection, $collection = [...$collection], $collection);
    								}
    							}
    						};
    					},
    					0
    				);
    			} else {
    				document.onkeydown = undefined;
    			}
    		}
    	};

    	return [
    		tagType,
    		elmntIndex,
    		height,
    		width,
    		iconURI,
    		$collection,
    		$selectedComponent,
    		$selectedOverride,
    		$focusedComponent,
    		toggleShow,
    		focusComponent,
    		$focusedOverride,
    		$layerDeleteLock,
    		click_handler
    	];
    }

    class Element extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$C, create_fragment$C, safe_not_equal, {
    			tagType: 0,
    			elmntIndex: 1,
    			height: 2,
    			width: 3,
    			iconURI: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Element",
    			options,
    			id: create_fragment$C.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tagType*/ ctx[0] === undefined && !('tagType' in props)) {
    			console.warn("<Element> was created without expected prop 'tagType'");
    		}

    		if (/*elmntIndex*/ ctx[1] === undefined && !('elmntIndex' in props)) {
    			console.warn("<Element> was created without expected prop 'elmntIndex'");
    		}

    		if (/*height*/ ctx[2] === undefined && !('height' in props)) {
    			console.warn("<Element> was created without expected prop 'height'");
    		}

    		if (/*width*/ ctx[3] === undefined && !('width' in props)) {
    			console.warn("<Element> was created without expected prop 'width'");
    		}

    		if (/*iconURI*/ ctx[4] === undefined && !('iconURI' in props)) {
    			console.warn("<Element> was created without expected prop 'iconURI'");
    		}
    	}

    	get tagType() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tagType(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elmntIndex() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elmntIndex(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconURI() {
    		throw new Error("<Element>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconURI(value) {
    		throw new Error("<Element>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Direction$1;
    (function (Direction) {
        Direction[Direction["Vertical"] = 0] = "Vertical";
        Direction[Direction["Horizontal"] = 1] = "Horizontal";
    })(Direction$1 || (Direction$1 = {}));
    var EventType$1;
    (function (EventType) {
        EventType[EventType["Programatic"] = 0] = "Programatic";
        EventType[EventType["UserDrag"] = 1] = "UserDrag";
        EventType[EventType["UserCopy"] = 2] = "UserCopy";
    })(EventType$1 || (EventType$1 = {}));

    /* src/components/ctrlMenuItems/CollectionViewer/Override.svelte generated by Svelte v3.48.0 */
    const file$B = "src/components/ctrlMenuItems/CollectionViewer/Override.svelte";

    function create_fragment$B(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;

    	let t1_value = (!!/*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].styleOverrides[/*overrideIndex*/ ctx[2]]
    	? /*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].styleOverrides[/*overrideIndex*/ ctx[2]].name
    	: "") + "";

    	let t1;
    	let p_class_value;
    	let p_style_value;
    	let main_class_value;
    	let main_intro;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/copy.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-7qbc8k");
    			add_location(img, file$B, 57, 4, 2182);
    			attr_dev(p, "contenteditable", /*editable*/ ctx[3]);
    			attr_dev(p, "class", p_class_value = "" + (null_to_empty(`${/*editable*/ ctx[3] ? "editable" : ""}`) + " svelte-7qbc8k"));
    			attr_dev(p, "style", p_style_value = `cursor: ${/*editable*/ ctx[3] ? "text" : "normal"}`);
    			add_location(p, file$B, 59, 4, 2230);

    			attr_dev(main, "class", main_class_value = "" + (null_to_empty(`
    layer ${/*$selectedOverride*/ ctx[6] === /*overrideIndex*/ ctx[2] && /*$selectedComponent*/ ctx[7] === /*elmntIndex*/ ctx[1]
			? "selected"
			: ""} ${/*$focusedOverride*/ ctx[8] !== /*overrideIndex*/ ctx[2] && /*$selectedOverride*/ ctx[6] === /*overrideIndex*/ ctx[2] && /*$selectedComponent*/ ctx[7] === /*elmntIndex*/ ctx[1]
			? "blurred"
			: ""}`) + " svelte-7qbc8k"));

    			set_style(main, "min-height", /*height*/ ctx[0] + "px");
    			add_location(main, file$B, 53, 0, 1773);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t0);
    			append_dev(main, p);
    			append_dev(p, t1);
    			/*p_binding*/ ctx[13](p);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p, "blur", /*blur_handler*/ ctx[14], false, false, false),
    					listen_dev(p, "keypress", /*preventNewline*/ ctx[11], false, false, false),
    					listen_dev(p, "blur", /*changeName*/ ctx[12], false, false, false),
    					listen_dev(main, "mousedown", /*focusOverride*/ ctx[9], false, false, false),
    					listen_dev(main, "dblclick", /*setEditableTrue*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$collection, elmntIndex, overrideIndex*/ 38 && t1_value !== (t1_value = (!!/*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].styleOverrides[/*overrideIndex*/ ctx[2]]
    			? /*$collection*/ ctx[5][/*elmntIndex*/ ctx[1]].styleOverrides[/*overrideIndex*/ ctx[2]].name
    			: "") + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*editable*/ 8) {
    				attr_dev(p, "contenteditable", /*editable*/ ctx[3]);
    			}

    			if (dirty & /*editable*/ 8 && p_class_value !== (p_class_value = "" + (null_to_empty(`${/*editable*/ ctx[3] ? "editable" : ""}`) + " svelte-7qbc8k"))) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (dirty & /*editable*/ 8 && p_style_value !== (p_style_value = `cursor: ${/*editable*/ ctx[3] ? "text" : "normal"}`)) {
    				attr_dev(p, "style", p_style_value);
    			}

    			if (dirty & /*$selectedOverride, overrideIndex, $selectedComponent, elmntIndex, $focusedOverride*/ 454 && main_class_value !== (main_class_value = "" + (null_to_empty(`
    layer ${/*$selectedOverride*/ ctx[6] === /*overrideIndex*/ ctx[2] && /*$selectedComponent*/ ctx[7] === /*elmntIndex*/ ctx[1]
			? "selected"
			: ""} ${/*$focusedOverride*/ ctx[8] !== /*overrideIndex*/ ctx[2] && /*$selectedOverride*/ ctx[6] === /*overrideIndex*/ ctx[2] && /*$selectedComponent*/ ctx[7] === /*elmntIndex*/ ctx[1]
			? "blurred"
			: ""}`) + " svelte-7qbc8k"))) {
    				attr_dev(main, "class", main_class_value);
    			}

    			if (dirty & /*height*/ 1) {
    				set_style(main, "min-height", /*height*/ ctx[0] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (!main_intro) {
    				add_render_callback(() => {
    					main_intro = create_in_transition(main, fly, { y: -10, duration: 300 });
    					main_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*p_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$B.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$B($$self, $$props, $$invalidate) {
    	let $layerDeleteLock;
    	let $collection;
    	let $selectedOverride;
    	let $selectedComponent;
    	let $focusedOverride;
    	let $focusedComponent;
    	let $layerBlurLock;
    	validate_store(layerDeleteLock, 'layerDeleteLock');
    	component_subscribe($$self, layerDeleteLock, $$value => $$invalidate(15, $layerDeleteLock = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(5, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(6, $selectedOverride = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(7, $selectedComponent = $$value));
    	validate_store(focusedOverride, 'focusedOverride');
    	component_subscribe($$self, focusedOverride, $$value => $$invalidate(8, $focusedOverride = $$value));
    	validate_store(focusedComponent, 'focusedComponent');
    	component_subscribe($$self, focusedComponent, $$value => $$invalidate(16, $focusedComponent = $$value));
    	validate_store(layerBlurLock, 'layerBlurLock');
    	component_subscribe($$self, layerBlurLock, $$value => $$invalidate(17, $layerBlurLock = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Override', slots, []);
    	const disp = createEventDispatcher();
    	let { height } = $$props;
    	let { elmntIndex } = $$props;
    	let { overrideIndex } = $$props;
    	let editable = false;
    	let nameField;

    	const focusOverride = () => {
    		// turn on blur lock
    		set_store_value(layerBlurLock, $layerBlurLock = true, $layerBlurLock);

    		// switch focus to override index, and selected override to a non -1 value
    		set_store_value(selectedComponent, $selectedComponent = elmntIndex, $selectedComponent);

    		set_store_value(selectedOverride, $selectedOverride = overrideIndex, $selectedOverride);
    		set_store_value(focusedComponent, $focusedComponent = -1, $focusedComponent);
    		set_store_value(focusedOverride, $focusedOverride = overrideIndex, $focusedOverride);

    		// update the elemnt number for color picker
    		setSelectedElmnt($selectedComponent, $selectedOverride);
    	};

    	const setEditableTrue = () => {
    		$$invalidate(3, editable = true);

    		if (!!nameField) {
    			// set focus to it
    			setTimeout(
    				() => {
    					nameField.focus();
    				},
    				0
    			);
    		}

    		// select all in the input text
    		window.setTimeout(
    			function () {
    				let range = document.createRange();
    				range.selectNodeContents(nameField);
    				let sel = window.getSelection();
    				sel.removeAllRanges();
    				sel.addRange(range);
    			},
    			0
    		);
    	};

    	const preventNewline = e => {
    		if (e.key === "Enter" || e.key === "Escape") {
    			e.preventDefault();
    			nameField.blur();
    			return;
    		}
    	};

    	const changeName = () => {
    		const name = nameField.innerHTML;
    		set_store_value(collection, $collection[elmntIndex].styleOverrides[overrideIndex].name = name, $collection); // change value in the store
    		set_store_value(collection, $collection = [...$collection], $collection);
    	};

    	const writable_props = ['height', 'elmntIndex', 'overrideIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Override> was created with unknown prop '${key}'`);
    	});

    	function p_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			nameField = $$value;
    			$$invalidate(4, nameField);
    		});
    	}

    	const blur_handler = () => {
    		$$invalidate(3, editable = false);
    		$$invalidate(4, nameField.scrollLeft = 0, nameField);
    	};

    	$$self.$$set = $$props => {
    		if ('height' in $$props) $$invalidate(0, height = $$props.height);
    		if ('elmntIndex' in $$props) $$invalidate(1, elmntIndex = $$props.elmntIndex);
    		if ('overrideIndex' in $$props) $$invalidate(2, overrideIndex = $$props.overrideIndex);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		collection,
    		focusedComponent,
    		selectedComponent,
    		selectedOverride,
    		focusedOverride,
    		layerDeleteLock,
    		layerBlurLock,
    		createEventDispatcher,
    		setSelectedElmnt,
    		disp,
    		height,
    		elmntIndex,
    		overrideIndex,
    		editable,
    		nameField,
    		focusOverride,
    		setEditableTrue,
    		preventNewline,
    		changeName,
    		$layerDeleteLock,
    		$collection,
    		$selectedOverride,
    		$selectedComponent,
    		$focusedOverride,
    		$focusedComponent,
    		$layerBlurLock
    	});

    	$$self.$inject_state = $$props => {
    		if ('height' in $$props) $$invalidate(0, height = $$props.height);
    		if ('elmntIndex' in $$props) $$invalidate(1, elmntIndex = $$props.elmntIndex);
    		if ('overrideIndex' in $$props) $$invalidate(2, overrideIndex = $$props.overrideIndex);
    		if ('editable' in $$props) $$invalidate(3, editable = $$props.editable);
    		if ('nameField' in $$props) $$invalidate(4, nameField = $$props.nameField);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*editable*/ 8) {
    			set_store_value(layerDeleteLock, $layerDeleteLock = editable, $layerDeleteLock); // lock delete
    		}
    	};

    	return [
    		height,
    		elmntIndex,
    		overrideIndex,
    		editable,
    		nameField,
    		$collection,
    		$selectedOverride,
    		$selectedComponent,
    		$focusedOverride,
    		focusOverride,
    		setEditableTrue,
    		preventNewline,
    		changeName,
    		p_binding,
    		blur_handler
    	];
    }

    class Override extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$B, create_fragment$B, safe_not_equal, {
    			height: 0,
    			elmntIndex: 1,
    			overrideIndex: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Override",
    			options,
    			id: create_fragment$B.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*height*/ ctx[0] === undefined && !('height' in props)) {
    			console.warn("<Override> was created without expected prop 'height'");
    		}

    		if (/*elmntIndex*/ ctx[1] === undefined && !('elmntIndex' in props)) {
    			console.warn("<Override> was created without expected prop 'elmntIndex'");
    		}

    		if (/*overrideIndex*/ ctx[2] === undefined && !('overrideIndex' in props)) {
    			console.warn("<Override> was created without expected prop 'overrideIndex'");
    		}
    	}

    	get height() {
    		throw new Error("<Override>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Override>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elmntIndex() {
    		throw new Error("<Override>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elmntIndex(value) {
    		throw new Error("<Override>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get overrideIndex() {
    		throw new Error("<Override>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set overrideIndex(value) {
    		throw new Error("<Override>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * A writable store that holds data for the main color picker.
     */
    let mainColorPickerData = writable({
        showInlineHSL: false,
        colorRefName: undefined,
        colorName: "Colors",
    });
    /**
     * Sets the color reference name in the main picker data store.
     * @param {string} ref - The color reference name to set.
     */
    const setColorPickerRef = (ref) => {
        let currentVal = get_store_value(mainColorPickerData);
        currentVal.colorRefName = ref;
        mainColorPickerData.set(currentVal);
    };
    /**
     * Clears the color reference name in the main picker data store and sets an optional color name.
     * @param {string} [colorName="Colors"] - The color name to set.
     */
    const clearColorPickerRef = (colorName = "Colors") => {
        let currentVal = get_store_value(mainColorPickerData);
        currentVal.colorRefName = undefined;
        currentVal.colorName = colorName;
        mainColorPickerData.set(currentVal);
    };

    /* src/components/ctrlMenuItems/DragDropList/ComponentList.svelte generated by Svelte v3.48.0 */
    const file$A = "src/components/ctrlMenuItems/DragDropList/ComponentList.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[38] = list[i];
    	child_ctx[39] = list;
    	child_ctx[40] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[41] = list[i];
    	child_ctx[43] = i;
    	return child_ctx;
    }

    // (441:12) {#if !!$collection[i].styleOverrides && $collection[i].showing}
    function create_if_block$b(ctx) {
    	let section;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value_1 = /*$collection*/ ctx[8][/*i*/ ctx[40]].styleOverrides;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*j*/ ctx[43];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section, "class", "overrideContainer");
    			add_location(section, file$A, 441, 16, 19537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$collection, layerHeight*/ 272) {
    				each_value_1 = /*$collection*/ ctx[8][/*i*/ ctx[40]].styleOverrides;
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, section, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(441:12) {#if !!$collection[i].styleOverrides && $collection[i].showing}",
    		ctx
    	});

    	return block;
    }

    // (443:20) {#each $collection[i].styleOverrides as override, j (j)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let override;
    	let current;

    	override = new Override({
    			props: {
    				name: /*override*/ ctx[41].name,
    				height: /*layerHeight*/ ctx[4],
    				elmntIndex: /*i*/ ctx[40],
    				overrideIndex: /*j*/ ctx[43]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(override.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(override, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const override_changes = {};
    			if (dirty[0] & /*$collection*/ 256) override_changes.name = /*override*/ ctx[41].name;
    			if (dirty[0] & /*layerHeight*/ 16) override_changes.height = /*layerHeight*/ ctx[4];
    			if (dirty[0] & /*$collection*/ 256) override_changes.elmntIndex = /*i*/ ctx[40];
    			if (dirty[0] & /*$collection*/ 256) override_changes.overrideIndex = /*j*/ ctx[43];
    			override.$set(override_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(override.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(override.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(override, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(443:20) {#each $collection[i].styleOverrides as override, j (j)}",
    		ctx
    	});

    	return block;
    }

    // (428:1) {#each $collection as _, i (_.type)}
    function create_each_block$5(key_1, ctx) {
    	let div;
    	let element_1;
    	let t0;
    	let t1;
    	let div_data_dnd_dragging_value;
    	let div_class_value;
    	let div_id_value;
    	let i = /*i*/ ctx[40];
    	let current;
    	let mounted;
    	let dispose;

    	element_1 = new Element({
    			props: {
    				tagType: /*_*/ ctx[38].type,
    				elmntIndex: /*i*/ ctx[40],
    				height: /*layerHeight*/ ctx[4],
    				width: /*containerWidth*/ ctx[5] - 20,
    				iconURI: HTMltagInfo[/*_*/ ctx[38].type].iconURI
    			},
    			$$inline: true
    		});

    	element_1.$on("updateElList", /*updateElList*/ ctx[11]);
    	let if_block = !!/*$collection*/ ctx[8][/*i*/ ctx[40]].styleOverrides && /*$collection*/ ctx[8][/*i*/ ctx[40]].showing && create_if_block$b(ctx);
    	const assign_div = () => /*div_binding*/ ctx[20](div, i);
    	const unassign_div = () => /*div_binding*/ ctx[20](null, i);

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[21](/*i*/ ctx[40], ...args);
    	}

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[22](/*i*/ ctx[40], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(element_1.$$.fragment);
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			attr_dev(div, "data-dnd-item", "");

    			attr_dev(div, "data-dnd-dragging", div_data_dnd_dragging_value = active?.sourceIndex === /*i*/ ctx[40] && active?.sourceZone.id === /*id*/ ctx[1] || /*$dragging*/ ctx[7] === null
    			? true
    			: undefined);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*itemClass*/ ctx[2]) + " svelte-1uyewk"));
    			attr_dev(div, "id", div_id_value = `ce812145-67d2-440c-8fdd-510b909e7d8d-${/*i*/ ctx[40]}`);
    			attr_dev(div, "style", /*itemStyle*/ ctx[6]);
    			add_location(div, file$A, 428, 2, 18888);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(element_1, div, null);
    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);
    			assign_div();
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(div, "touchstart", touchstart_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const element_1_changes = {};
    			if (dirty[0] & /*$collection*/ 256) element_1_changes.tagType = /*_*/ ctx[38].type;
    			if (dirty[0] & /*$collection*/ 256) element_1_changes.elmntIndex = /*i*/ ctx[40];
    			if (dirty[0] & /*layerHeight*/ 16) element_1_changes.height = /*layerHeight*/ ctx[4];
    			if (dirty[0] & /*containerWidth*/ 32) element_1_changes.width = /*containerWidth*/ ctx[5] - 20;
    			if (dirty[0] & /*$collection*/ 256) element_1_changes.iconURI = HTMltagInfo[/*_*/ ctx[38].type].iconURI;
    			element_1.$set(element_1_changes);

    			if (!!/*$collection*/ ctx[8][/*i*/ ctx[40]].styleOverrides && /*$collection*/ ctx[8][/*i*/ ctx[40]].showing) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*$collection*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty[0] & /*$collection, id, $dragging*/ 386 && div_data_dnd_dragging_value !== (div_data_dnd_dragging_value = active?.sourceIndex === /*i*/ ctx[40] && active?.sourceZone.id === /*id*/ ctx[1] || /*$dragging*/ ctx[7] === null
    			? true
    			: undefined)) {
    				attr_dev(div, "data-dnd-dragging", div_data_dnd_dragging_value);
    			}

    			if (!current || dirty[0] & /*itemClass*/ 4 && div_class_value !== (div_class_value = "" + (null_to_empty(/*itemClass*/ ctx[2]) + " svelte-1uyewk"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*$collection*/ 256 && div_id_value !== (div_id_value = `ce812145-67d2-440c-8fdd-510b909e7d8d-${/*i*/ ctx[40]}`)) {
    				attr_dev(div, "id", div_id_value);
    			}

    			if (!current || dirty[0] & /*itemStyle*/ 64) {
    				attr_dev(div, "style", /*itemStyle*/ ctx[6]);
    			}

    			if (i !== /*i*/ ctx[40]) {
    				unassign_div();
    				i = /*i*/ ctx[40];
    				assign_div();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(element_1.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(element_1.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(element_1);
    			if (if_block) if_block.d();
    			unassign_div();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(428:1) {#each $collection as _, i (_.type)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$A(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*$collection*/ ctx[8];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*_*/ ctx[38].type;
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "data-dnd-zone", "");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`${/*zoneClass*/ ctx[3]} ${/*dropzone*/ ctx[0].containerClass}`) + " svelte-1uyewk"));
    			add_location(div, file$A, 426, 0, 18726);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			/*div_binding_1*/ ctx[23](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "mousedown", /*deselElement*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*$collection, id, $dragging, itemClass, itemStyle, dropzone, onMouseDown, onTouchDown, layerHeight, containerWidth, updateElList*/ 4087) {
    				each_value = /*$collection*/ ctx[8];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
    				check_outros();
    			}

    			if (!current || dirty[0] & /*zoneClass, dropzone*/ 9 && div_class_value !== (div_class_value = "" + (null_to_empty(`${/*zoneClass*/ ctx[3]} ${/*dropzone*/ ctx[0].containerClass}`) + " svelte-1uyewk"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div_binding_1*/ ctx[23](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$A.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ZONE_ATTR = 'data-dnd-zone';
    const ZONE_SELECTOR = `[${ZONE_ATTR}]`;
    const HANDLE_SELECTOR = '[data-dnd-handle]';
    const DRAG_TOLERANCE = 5; //px
    const dropzones = new Array();
    let click = undefined;
    let active = undefined;
    let raf; // animation frame
    const dragging = writable(undefined);

    function findDropZone(x, y) {
    	const el = document.elementFromPoint(x, y)?.closest(ZONE_SELECTOR); // this code uses the document element from point, which means that it will work even with different heights on elements, and we can vary the element height as we need.
    	return el ? dropzones.find(dz => dz.el === el) : undefined;
    } // const els = document.elementsFromPoint(x, y);
    // const el = els.find(e => e.getAttribute('data-dnd-zone') !== null);

    function instance$A($$self, $$props, $$invalidate) {
    	let itemStyle;
    	let $focusedOverride;
    	let $focusedComponent;
    	let $selectedOverride;
    	let $selectedComponent;
    	let $dragging;
    	let $collection;
    	validate_store(focusedOverride, 'focusedOverride');
    	component_subscribe($$self, focusedOverride, $$value => $$invalidate(25, $focusedOverride = $$value));
    	validate_store(focusedComponent, 'focusedComponent');
    	component_subscribe($$self, focusedComponent, $$value => $$invalidate(26, $focusedComponent = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(27, $selectedOverride = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(28, $selectedComponent = $$value));
    	validate_store(dragging, 'dragging');
    	component_subscribe($$self, dragging, $$value => $$invalidate(7, $dragging = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(8, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ComponentList', slots, []);
    	let { id } = $$props;
    	let { itemCount } = $$props;
    	let { itemSize } = $$props;
    	let { type } = $$props;
    	let { priority = 1 } = $$props;
    	let { itemClass = '' } = $$props;
    	let { zoneClass = '' } = $$props;
    	let { keyFn = i => i } = $$props;
    	let { useHandle = false } = $$props;
    	const dropzone = new type(id, priority, itemCount, itemSize);
    	let { layerHeight = 0 } = $$props;
    	let { containerWidth = 0 } = $$props;
    	const dispatch = createEventDispatcher();
    	let items = new Array(itemCount);

    	onMount(() => {
    		dropzone.styleContainerBaseStyle();
    		dropzones.push(dropzone);
    		dropzones.sort((a, b) => b.priority - a.priority);

    		return () => {
    			dropzones.splice(dropzones.findIndex(dz => dz === dropzone), 1);
    		};
    	});

    	// return el !== undefined ? dropzones.find(dz => dz.el === el) : undefined;
    	function onMouseDown(e, index) {
    		if (e.button !== 0 || useHandle && e.target.closest(HANDLE_SELECTOR) === null) {
    			return;
    		}

    		document.addEventListener('mousemove', onMouseDrag);
    		document.addEventListener('mouseup', onMouseDragEnd);
    		onDown({ pageX: e.pageX, pageY: e.pageY }, index);
    	}

    	function onTouchDown(e, index) {
    		if (useHandle && e.target.closest(HANDLE_SELECTOR) === null) {
    			return;
    		}

    		document.addEventListener('touchmove', onTouchDrag);
    		document.addEventListener('touchend', onTouchDragEnd);

    		onDown(
    			{
    				pageX: e.touches[0].pageX,
    				pageY: e.touches[0].pageY
    			},
    			index
    		);
    	}

    	function onDown({ pageX, pageY }, index) {
    		const el = dropzone.items[index];

    		// set dropzone's current dragging element
    		$$invalidate(0, dropzone.currentDragEl = el, dropzone);

    		const br = el.getBoundingClientRect();

    		click = {
    			el,
    			initPageX: pageX,
    			initPageY: pageY,
    			sourceIndex: index,
    			dragLeft: pageX - br.left,
    			dragTop: pageY - br.top,
    			sourceZone: dropzone
    		};
    	}

    	function onMouseDrag(e) {
    		e.preventDefault();
    		onDrag(e);
    	}

    	function onTouchDrag(e) {
    		onDrag({
    			pageX: e.touches[0].pageX,
    			pageY: e.touches[0].pageY
    		});
    	}

    	function onDrag({ pageX, pageY }) {
    		if (active === undefined && (Math.abs(pageX - click.initPageX) > DRAG_TOLERANCE || Math.abs(pageY - click.initPageY) > DRAG_TOLERANCE)) {
    			if (active) {
    				finalizeDrag();
    			}

    			const placeholder = document.createElement('div');
    			placeholder.style.cssText = dropzone.placeholderStyleStr();
    			placeholder.setAttribute('data-dnd-placeholder', '');
    			dropzone.el.appendChild(placeholder);

    			active = {
    				type: EventType$1.User,
    				el: click.el,
    				placeholder,
    				resetZones: new Set([dropzone]),
    				sourceIndex: click.sourceIndex,
    				hoverIndex: undefined,
    				sourceZone: click.sourceZone,
    				destZone: dropzone,
    				dragLeft: click.dragLeft,
    				dragTop: click.dragTop,
    				onMoveResolve: undefined
    			};

    			set_store_value(dragging, $dragging = active, $dragging); // reactive value
    			click = undefined;
    			document.body.style.cursor = 'grabbing';
    		}

    		if (active) {
    			if (raf) cancelAnimationFrame(raf);

    			raf = requestAnimationFrame(() => {
    				raf = undefined;
    				const drag = active;
    				const { el, sourceZone, sourceIndex, dragLeft, dragTop } = drag;
    				const tx = pageX - dragLeft;
    				const ty = pageY - dragTop;
    				let dest = findDropZone(pageX, pageY);

    				if (dest === sourceZone) {
    					// same zone reorder
    					// style the dragging element
    					const enteredZone = dest !== drag.destZone;

    					// first render into this dropzone lets tidy up the last dropzone
    					if (enteredZone) {
    						if (drag.destZone !== undefined) {
    							drag.destZone.styleDestReset();
    						}
    					}

    					const hoverIndex = dest.pointIndex(pageX, pageY);

    					if (hoverIndex !== drag.hoverIndex || enteredZone) {
    						dest.styleSourceMove(hoverIndex, sourceIndex, drag.hoverIndex !== undefined);
    						active = { ...active, hoverIndex, destZone: dest };
    						set_store_value(dragging, $dragging = active, $dragging);
    					}

    					el.style.cssText = `position: fixed;
                            top: 0;
                            left: 0;
                            z-index:1000;
                            pointer-events:none;
                            cursor:grabbing;
                            transition:height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000); position:fixed; transform:translate(${tx}px,${ty}px)`;
    				} else {
    					// new zone
    					const enteredZone = dest !== drag.destZone;

    					// first render into this dropzone (or out of if dest = undefined)
    					// lets tidy up the last dropzone
    					if (enteredZone) {
    						// source zone needs to render collapsing the missing item
    						if (drag.destZone === sourceZone) {
    							drag.destZone.styleSourceMissing(sourceIndex);
    						} else if (drag.destZone !== undefined) {
    							drag.destZone.styleDestReset(); // other zones can just render back to normal
    						}
    					}

    					if (dest !== undefined) {
    						// style the dragging element - it keeps its source dimensions as its not inside a drop zone
    						// lets increase this containers size on first render to hold the new
    						// item where hovering over it
    						if (enteredZone) {
    							// market this zone as needing style reseting a zone might be dragged
    							// over without, a drop, making it neither src or dest zone we still
    							// want to tidy up the styles we leave behind on dragend tho
    							drag.resetZones.add(dest);
    						}

    						// and adjust the styles of the items and update dragging
    						const hoverIndex = dest.pointIndex(pageX, pageY);

    						if (hoverIndex !== drag.hoverIndex || enteredZone) {
    							dest.styleDestMove(hoverIndex);
    							active = { ...active, hoverIndex, destZone: dest };
    							set_store_value(dragging, $dragging = active, $dragging);
    						}

    						el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; pointer-events: none; cursor:grabbing; position:fixed; transition: height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000); transform:translate(${tx}px,${ty}px); transition:height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;
    					} else {
    						// style the dragging element - it keeps its source dimensions as its not inside a drop zone
    						// first render out of a dropzone, update dragging
    						if (enteredZone) {
    							active = {
    								...active,
    								hoverIndex: -1,
    								destZone: undefined
    							};

    							set_store_value(dragging, $dragging = active, $dragging);
    						}

    						el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; pointer-events:none; cursor:grabbing; position:fixed; transform:translate(${tx}px,${ty}px); transition:height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;
    					}
    				}
    			});
    		}
    	}

    	function onMouseDragEnd(e) {
    		document.removeEventListener('mousemove', onMouseDrag);
    		document.removeEventListener('mouseup', onMouseDragEnd);

    		if (!active) {
    			return;
    		}

    		onDragEnd();
    	}

    	function onTouchDragEnd(e) {
    		document.removeEventListener('touchmove', onTouchDrag);
    		document.removeEventListener('touchend', onTouchDragEnd);

    		if (!active) {
    			return;
    		}

    		onDragEnd();
    	}

    	function onDragEnd() {
    		if (raf) {
    			cancelAnimationFrame(raf);
    		}

    		const { el, destZone, sourceZone, sourceIndex } = active;
    		const hoverIndex = active.hoverIndex ?? sourceIndex;
    		document.body.style.cursor = '';
    		el.addEventListener('transitionend', finalizeDrag);
    		let tx, ty, forceFinal = false;

    		if (destZone === sourceZone) {
    			let widthLastOffset = 0;
    			let heightLastOffset = 0;
    			const { count, direction } = sourceZone;

    			if (hoverIndex === count) {
    				if (direction === Direction$1.Vertical) {
    					heightLastOffset = -1;
    				} else if (direction === Direction$1.Horizontal) {
    					widthLastOffset = -1;
    				}
    			}

    			tx = sourceZone.dragXOffset(hoverIndex + widthLastOffset);
    			ty = sourceZone.dragYOffset(hoverIndex + heightLastOffset);
    			sourceZone.itemHeight();
    			sourceZone.itemWidth();

    			// detect when a transitionEnd event wont fire as the transition is already in the
    			// finishing position
    			forceFinal = el.style.transform === `translate(${tx}px, ${ty}px)` || el.style.transform === '';
    		} else if (destZone !== undefined) {
    			tx = destZone.dragXOffset(hoverIndex, destZone.count + 1);
    			ty = destZone.dragYOffset(hoverIndex, destZone.count + 1);
    			destZone.itemHeight();
    			destZone.itemWidth();
    		} else {
    			tx = sourceZone.dragXOffset(sourceIndex);
    			ty = sourceZone.dragYOffset(sourceIndex);
    			sourceZone.itemHeight();
    			sourceZone.itemWidth();
    			sourceZone.styleSourceMove(sourceIndex, sourceIndex, true);
    		}

    		el.style.cssText = `position: fixed; top: 0; left: 0; z-index:1000; position:fixed; transform:translate(${tx}px,${ty}px); transition:transform 300ms cubic-bezier(0.2,0,0,1), height 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000), width 300ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;

    		// if a force was detected as needed, fire it off here
    		if (forceFinal) {
    			finalizeDrag();
    		}
    	}

    	function finalizeDrag(ev) {
    		const { el, destZone, sourceZone, sourceIndex, resetZones, placeholder } = active;
    		const hoverIndex = active.hoverIndex ?? sourceIndex; // if no drag action took place hover may be undef

    		// we will reassign focus and select element index here. If hoverIndex is -1, we don't need to change anything
    		if (hoverIndex !== -1) {
    			set_store_value(selectedComponent, $selectedComponent = hoverIndex, $selectedComponent);
    			set_store_value(focusedComponent, $focusedComponent = hoverIndex, $focusedComponent);
    		}

    		if (ev && ev.target !== el) {
    			return;
    		}

    		if (raf) cancelAnimationFrame(raf);
    		raf = undefined;

    		const from = {
    			dropZoneID: sourceZone.id,
    			index: sourceIndex
    		};

    		const to = destZone
    		? destZone === sourceZone && hoverIndex === sourceIndex
    			? from
    			: {
    					dropZoneID: destZone.id,
    					index: hoverIndex
    				}
    		: undefined;

    		dispatch('drop', { from, to });

    		if (placeholder) {
    			sourceZone.el.removeChild(placeholder);
    		}

    		resetZones.forEach(zone => zone.styleRemove());
    		el.removeEventListener('transitionend', finalizeDrag);
    		active.onMoveResolve?.();
    		active = undefined;
    		set_store_value(dragging, $dragging = undefined, $dragging);
    	}

    	async function move(srcIndex, destIndex, destZone, transitionDur = 500) {
    		return new Promise((resolve, reject) => {
    				if (active !== undefined) {
    					resolve();
    					return;
    				}

    				const el = dropzone.items[srcIndex];

    				if (!el) {
    					resolve();
    					return;
    				}

    				// initial style for begining of element transition
    				{
    					const tx = dropzone.dragXOffset(srcIndex);
    					const ty = dropzone.dragYOffset(srcIndex);
    					const height = dropzone.itemHeight();
    					const width = dropzone.itemWidth();
    					el.style.cssText = `z-index:1000; height:${height}px; width:${width}px; position:fixed; transform:translate(${tx}px,${ty}px)`;
    				}

    				// style the containers
    				dropzone.styleSourceMove(srcIndex, srcIndex, false);

    				if (destZone !== dropzone) {
    					setTimeout(
    						() => {
    							active?.type === EventType$1.Programatic && dropzone.styleSourceMissing(srcIndex);
    						},
    						transitionDur * 0.4
    					);

    					destZone.styleDestMove(destIndex);
    				} else {
    					setTimeout(
    						() => {
    							active?.type === EventType$1.Programatic && dropzone.styleSourceMove(destIndex, srcIndex, true);
    						},
    						transitionDur * 0.25
    					);
    				}

    				active = {
    					type: EventType$1.Programatic,
    					el,
    					placeholder: undefined,
    					resetZones: new Set([dropzone, destZone]),
    					sourceIndex: srcIndex,
    					hoverIndex: destIndex,
    					sourceZone: dropzone,
    					destZone,
    					dragLeft: 0,
    					dragTop: 0,
    					onMoveResolve: resolve
    				};

    				set_store_value(dragging, $dragging = active, $dragging);

    				// style the moving element, to its final position/transition
    				{
    					const tx = destZone.dragXOffset(destIndex, destZone.count + 1);
    					const ty = destZone.dragYOffset(destIndex, destZone.count + 1);
    					const height = destZone.itemHeight();
    					const width = destZone.itemWidth();
    					el.addEventListener('transitionend', finalizeDrag);

    					el.style.cssText = `
                    z-index: 1000; 
                    position: fixed; 
                    top:0; left: 0;
                    height: ${height}px; 
                    width: ${width}px; 
                    transform: translate(${tx}px,${ty}px); 
                    transition:
                        transform ${transitionDur}ms cubic-bezier(0.215, 0.610, 0.355, 1.000), 
                        height ${transitionDur}ms cubic-bezier(0.215, 0.610, 0.355, 1.000), 
                        width ${transitionDur}ms cubic-bezier(0.215, 0.610, 0.355, 1.000);`;
    				}
    			});
    	}

    	const updateElList = () => {
    		// I don't know why the fuck this works but it somehow does
    		try {
    			onDrag({ pageX: 0, pageY: 0 });
    			onDragEnd();
    		} catch(error) {
    			
    		} // do nothing, the comp just haven't loaded fully yet
    	};

    	const deselElement = e => {
    		if (e.target === e.currentTarget) {
    			// detect only parent clicks
    			set_store_value(selectedComponent, $selectedComponent = set_store_value(selectedOverride, $selectedOverride = set_store_value(focusedComponent, $focusedComponent = set_store_value(focusedOverride, $focusedOverride = -1, $focusedOverride), $focusedComponent), $selectedOverride), $selectedComponent);

    			// clear color ref because it may cause UX issues
    			clearColorPickerRef();
    		}
    	};

    	const writable_props = [
    		'id',
    		'itemCount',
    		'itemSize',
    		'type',
    		'priority',
    		'itemClass',
    		'zoneClass',
    		'keyFn',
    		'useHandle',
    		'layerHeight',
    		'containerWidth'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ComponentList> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value, i) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dropzone.items[i] = $$value;
    			((($$invalidate(0, dropzone), $$invalidate(1, id)), $$invalidate(13, itemCount)), $$invalidate(14, itemSize));
    		});
    	}

    	const mousedown_handler = (i, e) => onMouseDown(e, i);
    	const touchstart_handler = (i, e) => onTouchDown(e, i);

    	function div_binding_1($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dropzone.el = $$value;
    			((($$invalidate(0, dropzone), $$invalidate(1, id)), $$invalidate(13, itemCount)), $$invalidate(14, itemSize));
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('itemCount' in $$props) $$invalidate(13, itemCount = $$props.itemCount);
    		if ('itemSize' in $$props) $$invalidate(14, itemSize = $$props.itemSize);
    		if ('type' in $$props) $$invalidate(15, type = $$props.type);
    		if ('priority' in $$props) $$invalidate(16, priority = $$props.priority);
    		if ('itemClass' in $$props) $$invalidate(2, itemClass = $$props.itemClass);
    		if ('zoneClass' in $$props) $$invalidate(3, zoneClass = $$props.zoneClass);
    		if ('keyFn' in $$props) $$invalidate(17, keyFn = $$props.keyFn);
    		if ('useHandle' in $$props) $$invalidate(18, useHandle = $$props.useHandle);
    		if ('layerHeight' in $$props) $$invalidate(4, layerHeight = $$props.layerHeight);
    		if ('containerWidth' in $$props) $$invalidate(5, containerWidth = $$props.containerWidth);
    	};

    	$$self.$capture_state = () => ({
    		ZONE_ATTR,
    		ZONE_SELECTOR,
    		HANDLE_SELECTOR,
    		DRAG_TOLERANCE,
    		dropzones,
    		click,
    		active,
    		raf,
    		dragging,
    		onMount,
    		createEventDispatcher,
    		Direction: Direction$1,
    		EventType: EventType$1,
    		writable,
    		Element,
    		Override,
    		collection,
    		focusedComponent,
    		HTMltagInfo,
    		selectedComponent,
    		selectedOverride,
    		focusedOverride,
    		clearColorPickerRef,
    		id,
    		itemCount,
    		itemSize,
    		type,
    		priority,
    		itemClass,
    		zoneClass,
    		keyFn,
    		useHandle,
    		dropzone,
    		layerHeight,
    		containerWidth,
    		dispatch,
    		items,
    		findDropZone,
    		onMouseDown,
    		onTouchDown,
    		onDown,
    		onMouseDrag,
    		onTouchDrag,
    		onDrag,
    		onMouseDragEnd,
    		onTouchDragEnd,
    		onDragEnd,
    		finalizeDrag,
    		move,
    		updateElList,
    		deselElement,
    		itemStyle,
    		$focusedOverride,
    		$focusedComponent,
    		$selectedOverride,
    		$selectedComponent,
    		$dragging,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('itemCount' in $$props) $$invalidate(13, itemCount = $$props.itemCount);
    		if ('itemSize' in $$props) $$invalidate(14, itemSize = $$props.itemSize);
    		if ('type' in $$props) $$invalidate(15, type = $$props.type);
    		if ('priority' in $$props) $$invalidate(16, priority = $$props.priority);
    		if ('itemClass' in $$props) $$invalidate(2, itemClass = $$props.itemClass);
    		if ('zoneClass' in $$props) $$invalidate(3, zoneClass = $$props.zoneClass);
    		if ('keyFn' in $$props) $$invalidate(17, keyFn = $$props.keyFn);
    		if ('useHandle' in $$props) $$invalidate(18, useHandle = $$props.useHandle);
    		if ('layerHeight' in $$props) $$invalidate(4, layerHeight = $$props.layerHeight);
    		if ('containerWidth' in $$props) $$invalidate(5, containerWidth = $$props.containerWidth);
    		if ('items' in $$props) items = $$props.items;
    		if ('itemStyle' in $$props) $$invalidate(6, itemStyle = $$props.itemStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*id*/ 2) {
    			$$invalidate(0, dropzone.id = id, dropzone);
    		}

    		if ($$self.$$.dirty[0] & /*itemCount, dropzone, itemSize*/ 24577) {
    			if (itemCount != dropzone.count || itemSize !== dropzone.itemSize) {
    				$$invalidate(0, dropzone.count = itemCount, dropzone);
    				$$invalidate(0, dropzone.itemSize = itemSize, dropzone);
    				items = new Array(itemCount);

    				if (dropzone.el) {
    					dropzone.styleContainerBaseStyle();
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*dropzone, itemSize*/ 16385) {
    			$$invalidate(6, itemStyle = `${dropzone.direction === Direction$1.Vertical
			? 'height'
			: 'width'}: ${itemSize}px;`);
    		}
    	};

    	return [
    		dropzone,
    		id,
    		itemClass,
    		zoneClass,
    		layerHeight,
    		containerWidth,
    		itemStyle,
    		$dragging,
    		$collection,
    		onMouseDown,
    		onTouchDown,
    		updateElList,
    		deselElement,
    		itemCount,
    		itemSize,
    		type,
    		priority,
    		keyFn,
    		useHandle,
    		move,
    		div_binding,
    		mousedown_handler,
    		touchstart_handler,
    		div_binding_1
    	];
    }

    class ComponentList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$A,
    			create_fragment$A,
    			not_equal,
    			{
    				id: 1,
    				itemCount: 13,
    				itemSize: 14,
    				type: 15,
    				priority: 16,
    				itemClass: 2,
    				zoneClass: 3,
    				keyFn: 17,
    				useHandle: 18,
    				dropzone: 0,
    				layerHeight: 4,
    				containerWidth: 5,
    				move: 19
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ComponentList",
    			options,
    			id: create_fragment$A.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !('id' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'id'");
    		}

    		if (/*itemCount*/ ctx[13] === undefined && !('itemCount' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'itemCount'");
    		}

    		if (/*itemSize*/ ctx[14] === undefined && !('itemSize' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'itemSize'");
    		}

    		if (/*type*/ ctx[15] === undefined && !('type' in props)) {
    			console.warn("<ComponentList> was created without expected prop 'type'");
    		}
    	}

    	get id() {
    		return this.$$.ctx[1];
    	}

    	set id(id) {
    		this.$$set({ id });
    		flush();
    	}

    	get itemCount() {
    		return this.$$.ctx[13];
    	}

    	set itemCount(itemCount) {
    		this.$$set({ itemCount });
    		flush();
    	}

    	get itemSize() {
    		return this.$$.ctx[14];
    	}

    	set itemSize(itemSize) {
    		this.$$set({ itemSize });
    		flush();
    	}

    	get type() {
    		return this.$$.ctx[15];
    	}

    	set type(type) {
    		this.$$set({ type });
    		flush();
    	}

    	get priority() {
    		return this.$$.ctx[16];
    	}

    	set priority(priority) {
    		this.$$set({ priority });
    		flush();
    	}

    	get itemClass() {
    		return this.$$.ctx[2];
    	}

    	set itemClass(itemClass) {
    		this.$$set({ itemClass });
    		flush();
    	}

    	get zoneClass() {
    		return this.$$.ctx[3];
    	}

    	set zoneClass(zoneClass) {
    		this.$$set({ zoneClass });
    		flush();
    	}

    	get keyFn() {
    		return this.$$.ctx[17];
    	}

    	set keyFn(keyFn) {
    		this.$$set({ keyFn });
    		flush();
    	}

    	get useHandle() {
    		return this.$$.ctx[18];
    	}

    	set useHandle(useHandle) {
    		this.$$set({ useHandle });
    		flush();
    	}

    	get dropzone() {
    		return this.$$.ctx[0];
    	}

    	set dropzone(value) {
    		throw new Error("<ComponentList>: Cannot set read-only property 'dropzone'");
    	}

    	get layerHeight() {
    		return this.$$.ctx[4];
    	}

    	set layerHeight(layerHeight) {
    		this.$$set({ layerHeight });
    		flush();
    	}

    	get containerWidth() {
    		return this.$$.ctx[5];
    	}

    	set containerWidth(containerWidth) {
    		this.$$set({ containerWidth });
    		flush();
    	}

    	get move() {
    		return this.$$.ctx[19];
    	}

    	set move(value) {
    		throw new Error("<ComponentList>: Cannot set read-only property 'move'");
    	}
    }

    var Direction;
    (function (Direction) {
        Direction[Direction["Vertical"] = 0] = "Vertical";
        Direction[Direction["Horizontal"] = 1] = "Horizontal";
    })(Direction || (Direction = {}));
    var EventType;
    (function (EventType) {
        EventType[EventType["Programatic"] = 0] = "Programatic";
        EventType[EventType["User"] = 1] = "User";
    })(EventType || (EventType = {}));

    class VerticalDropZone {
        direction = Direction.Vertical;
        id;
        priority;
        itemSize;
        currentDragEl;
        count;
        el;
        items;
        containerClass;
        constructor(id, count, priority, itemSize) {
            this.id = id;
            this.priority = priority;
            this.count = count;
            this.itemSize = itemSize;
            this.items = new Array(count);
            this.el = undefined;
            this.containerClass = 'vertical';
        }
        pointIndex(x, y) {
            const { el, count, items, currentDragEl } = this;
            const b = el.getBoundingClientRect();
            const top = b.top - el.scrollTop + window.scrollY;
            // const rawOver = Math.floor((y - top) / 20);

            let rawOver = 0; // here we will calculate the drop index
            // let sumHeight = currentDragEl.getBoundingClientRect().height/2;
            let sumHeight = 22.5;
            let i = 0;
            // keep adding to rawOver until the sumHeight is above relative y position 
            for(i = 0; i < items.length; i++){
                if(items[i] === null || items[i].id === currentDragEl.id){
                    // if ID matches, skip self and add one to check thresh to check 1 further
                    continue;
                }

                if(sumHeight < currentDragEl.getBoundingClientRect().y - top){
                    rawOver++;
                    sumHeight += items[i].getBoundingClientRect().height;
                }
            }
            
            return Math.min(Math.max(rawOver, 0), count);
        }
        placeholderStyleStr() {
            return `height: ${500}px; width: 100%`;
        }
        dragXOffset(index) {
            const b = this.el.getBoundingClientRect();
            return b.left;
        }
        dragYOffset(index) {
            const { items, currentDragEl } = this;
            const b = this.el.getBoundingClientRect();
            // calculate height for all elements above it
            let sumHeight = 0;
            let checkThresh = index;
            for(let i = 0; i < checkThresh; i++){
                if(items[i].id === currentDragEl.id){
                    // if ID matches, skip self and add one to check thresh to check 1 further
                    checkThresh++;
                    continue;
                }
                sumHeight += items[i].getBoundingClientRect().height;
            }
            return sumHeight + b.top;
        }
        itemHeight() {
            return this.itemSize;
        }
        itemWidth() {
            return this.el.clientWidth;
        }
        styleSourceMove(hover, source, transition) {
            const { items, currentDragEl } = this;
            for (let i = 0; i < items.length; ++i) {
                // move element to base
                const base = (hover > source && (i < source || (i > source && i <= hover))) ||
                    (hover < source && i < hover) ||
                    (hover == source && i < source);
                // move element down
                const raise = (hover > source && i > hover) ||
                    (hover < source && ((i >= hover && i < source) || i > source)) ||
                    (hover == source && i > source);
                const item = items[i];
                if (base) {
                    item &&
                        // (item.style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${itemSize}px;`); SIG CHANGE
                        (item.style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                }
                else if (raise) {
                    if (transition) {
                        item &&
                            (item.style.cssText = `transform: translateY(${currentDragEl.getBoundingClientRect().height}px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                    }
                    else {
                        // prevent the transition jump on first render
                        item &&
                            // (item.style.cssText = `transform: translateY(${itemSize}px); height: ${itemSize}px;`);
                            (item.style.cssText = `transform: translateY(${currentDragEl.getBoundingClientRect().height}px); height: ${item.getBoundingClientRect().height}px;`);
                    }
                }
            }
        }
        styleSourceMissing(index) {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                item &&
                    i !== index &&
                    (items[i].style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${items[i].getBoundingClientRect().height}px;`);
            }
        }
        styleDestMove(index) {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                if (i < index) {
                    item &&
                        (item.style.cssText = `transform: translateY(0px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                }
                else {
                    item &&
                        (item.style.cssText = `transform: translateY(${item.getBoundingClientRect().height}px); transition: transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
                }
            }
        }
        styleDestReset() {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                item &&
                    (items[i].style.cssText = `transform:translateY(0px); transition:transform 300ms cubic-bezier(0.2, 0, 0, 1); height: ${item.getBoundingClientRect().height}px;`);
            }
        }
        styleRemove() {
            this.styleContainerBaseStyle();
        }
        styleContainerBaseStyle() {
            const { items } = this;
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                // item && (item.style.cssText = `height: ${itemSize}px;`); SIG CHANGE
                item && (item.style.cssText = "");
            }
        }
    }

    function reorder(list, startIndex, endIndex) {
        const result = list.slice();
        const [removed] = result.splice(startIndex, 1);
        if (endIndex > result.length) {
            result.push(removed);
        }
        else {
            result.splice(endIndex, 0, removed);
        }
        return result;
    }

    /* node_modules/svelte-dnd-list/DragDropList.svelte generated by Svelte v3.48.0 */
    new Array();

    /* src/components/ctrlMenuItems/CollectionViewer.svelte generated by Svelte v3.48.0 */
    const file$z = "src/components/ctrlMenuItems/CollectionViewer.svelte";

    function create_fragment$z(ctx) {
    	let main;
    	let componentlist;
    	let current;
    	let mounted;
    	let dispose;

    	componentlist = new ComponentList({
    			props: {
    				id: "componentList",
    				type: VerticalDropZone,
    				itemSize: 45,
    				itemCount: /*$collection*/ ctx[1].length,
    				layerHeight,
    				containerWidth: /*containerWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	componentlist.$on("drop", /*onDrop*/ ctx[2]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(componentlist.$$.fragment);
    			attr_dev(main, "class", "svelte-qhh4tf");
    			add_location(main, file$z, 20, 0, 788);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(componentlist, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(main, "mousedown", /*deselElement*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const componentlist_changes = {};
    			if (dirty & /*$collection*/ 2) componentlist_changes.itemCount = /*$collection*/ ctx[1].length;
    			if (dirty & /*containerWidth*/ 1) componentlist_changes.containerWidth = /*containerWidth*/ ctx[0];
    			componentlist.$set(componentlist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(componentlist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(componentlist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(componentlist);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$z.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const layerHeight = 35; // px

    function instance$z($$self, $$props, $$invalidate) {
    	let $focusedOverride;
    	let $focusedComponent;
    	let $selectedOverride;
    	let $selectedComponent;
    	let $collection;
    	validate_store(focusedOverride, 'focusedOverride');
    	component_subscribe($$self, focusedOverride, $$value => $$invalidate(4, $focusedOverride = $$value));
    	validate_store(focusedComponent, 'focusedComponent');
    	component_subscribe($$self, focusedComponent, $$value => $$invalidate(5, $focusedComponent = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(6, $selectedOverride = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(7, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(1, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CollectionViewer', slots, []);
    	let { containerWidth } = $$props;

    	function onDrop({ detail: { from, to } }) {
    		if (!to || from === to) {
    			return;
    		}

    		set_store_value(collection, $collection = reorder($collection, from.index, to.index), $collection);
    	}

    	const deselElement = e => {
    		if (e.target === e.currentTarget) {
    			// detect only parent clicks
    			set_store_value(selectedComponent, $selectedComponent = set_store_value(selectedOverride, $selectedOverride = set_store_value(focusedComponent, $focusedComponent = set_store_value(focusedOverride, $focusedOverride = -1, $focusedOverride), $focusedComponent), $selectedOverride), $selectedComponent);
    		}
    	};

    	const writable_props = ['containerWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CollectionViewer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		focusedComponent,
    		focusedOverride,
    		ComponentList,
    		VerticalDropZone,
    		reorder,
    		containerWidth,
    		onDrop,
    		deselElement,
    		layerHeight,
    		$focusedOverride,
    		$focusedComponent,
    		$selectedOverride,
    		$selectedComponent,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [containerWidth, $collection, onDrop, deselElement];
    }

    class CollectionViewer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$z, create_fragment$z, safe_not_equal, { containerWidth: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CollectionViewer",
    			options,
    			id: create_fragment$z.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*containerWidth*/ ctx[0] === undefined && !('containerWidth' in props)) {
    			console.warn("<CollectionViewer> was created without expected prop 'containerWidth'");
    		}
    	}

    	get containerWidth() {
    		throw new Error("<CollectionViewer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerWidth(value) {
    		throw new Error("<CollectionViewer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let currentView = writable("edit");

    /* src/components/ctrlMenuItems/StyleEditors/Basics/Title.svelte generated by Svelte v3.48.0 */

    const file$y = "src/components/ctrlMenuItems/StyleEditors/Basics/Title.svelte";

    function create_fragment$y(ctx) {
    	let main;
    	let h1;
    	let t;
    	let h1_class_value;
    	let h1_style_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t = text(/*name*/ ctx[0]);
    			attr_dev(h1, "class", h1_class_value = "" + (null_to_empty(`${/*sub*/ ctx[1] ? "sub" : ""}`) + " svelte-49n2dp"));

    			attr_dev(h1, "style", h1_style_value = `
        text-align: ${/*align*/ ctx[2]}
        ${!!/*textClrOverride*/ ctx[3]
			? `;
        color:${/*textClrOverride*/ ctx[3]}`
			: ""};
        ${!/*hasMargin*/ ctx[4] ? "margin: 0" : ""};
    `);

    			add_location(h1, file$y, 9, 4, 241);
    			set_style(main, "transform", "translate(0px, " + /*yOffset*/ ctx[5] + "px)");
    			attr_dev(main, "class", "svelte-49n2dp");
    			add_location(main, file$y, 8, 0, 183);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t, /*name*/ ctx[0]);

    			if (dirty & /*sub*/ 2 && h1_class_value !== (h1_class_value = "" + (null_to_empty(`${/*sub*/ ctx[1] ? "sub" : ""}`) + " svelte-49n2dp"))) {
    				attr_dev(h1, "class", h1_class_value);
    			}

    			if (dirty & /*align, textClrOverride, hasMargin*/ 28 && h1_style_value !== (h1_style_value = `
        text-align: ${/*align*/ ctx[2]}
        ${!!/*textClrOverride*/ ctx[3]
			? `;
        color:${/*textClrOverride*/ ctx[3]}`
			: ""};
        ${!/*hasMargin*/ ctx[4] ? "margin: 0" : ""};
    `)) {
    				attr_dev(h1, "style", h1_style_value);
    			}

    			if (dirty & /*yOffset*/ 32) {
    				set_style(main, "transform", "translate(0px, " + /*yOffset*/ ctx[5] + "px)");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$y.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$y($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, []);
    	let { name } = $$props;
    	let { sub = false } = $$props;
    	let { align = "left" } = $$props;
    	let { textClrOverride = "" } = $$props;
    	let { hasMargin = true } = $$props;
    	let { yOffset = 0 } = $$props;
    	const writable_props = ['name', 'sub', 'align', 'textClrOverride', 'hasMargin', 'yOffset'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(1, sub = $$props.sub);
    		if ('align' in $$props) $$invalidate(2, align = $$props.align);
    		if ('textClrOverride' in $$props) $$invalidate(3, textClrOverride = $$props.textClrOverride);
    		if ('hasMargin' in $$props) $$invalidate(4, hasMargin = $$props.hasMargin);
    		if ('yOffset' in $$props) $$invalidate(5, yOffset = $$props.yOffset);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		sub,
    		align,
    		textClrOverride,
    		hasMargin,
    		yOffset
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(1, sub = $$props.sub);
    		if ('align' in $$props) $$invalidate(2, align = $$props.align);
    		if ('textClrOverride' in $$props) $$invalidate(3, textClrOverride = $$props.textClrOverride);
    		if ('hasMargin' in $$props) $$invalidate(4, hasMargin = $$props.hasMargin);
    		if ('yOffset' in $$props) $$invalidate(5, yOffset = $$props.yOffset);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, sub, align, textClrOverride, hasMargin, yOffset];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$y, create_fragment$y, safe_not_equal, {
    			name: 0,
    			sub: 1,
    			align: 2,
    			textClrOverride: 3,
    			hasMargin: 4,
    			yOffset: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$y.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<Title> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClrOverride() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClrOverride(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yOffset() {
    		throw new Error("<Title>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yOffset(value) {
    		throw new Error("<Title>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte generated by Svelte v3.48.0 */
    const file$x = "src/components/ctrlMenuItems/StyleEditors/Basics/MultiToggle.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (75:8) {#each elements as ele, i}
    function create_each_block$4(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_class_value;
    	let t;
    	let div_title_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[12](/*i*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (!src_url_equal(img.src, img_src_value = /*ele*/ ctx[16].iconDir)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*ele*/ ctx[16].alt);
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*selection*/ ctx[0] === /*i*/ ctx[18] ? "selected" : "") + " svelte-1hdyf9b"));
    			set_style(img, "height", /*iconSize*/ ctx[7] + "px");
    			add_location(img, file$x, 77, 16, 2343);
    			attr_dev(div, "class", "toggle-element svelte-1hdyf9b");
    			attr_dev(div, "title", div_title_value = /*ele*/ ctx[16].alt);
    			set_style(div, "width", /*width*/ ctx[4] / /*elements*/ ctx[1].length + "px");
    			add_location(div, file$x, 76, 12, 2208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*elements*/ 2 && !src_url_equal(img.src, img_src_value = /*ele*/ ctx[16].iconDir)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*elements*/ 2 && img_alt_value !== (img_alt_value = /*ele*/ ctx[16].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*selection*/ 1 && img_class_value !== (img_class_value = "" + (null_to_empty(/*selection*/ ctx[0] === /*i*/ ctx[18] ? "selected" : "") + " svelte-1hdyf9b"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*iconSize*/ 128) {
    				set_style(img, "height", /*iconSize*/ ctx[7] + "px");
    			}

    			if (dirty & /*elements*/ 2 && div_title_value !== (div_title_value = /*ele*/ ctx[16].alt)) {
    				attr_dev(div, "title", div_title_value);
    			}

    			if (dirty & /*width, elements*/ 18) {
    				set_style(div, "width", /*width*/ ctx[4] / /*elements*/ ctx[1].length + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(75:8) {#each elements as ele, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$x(ctx) {
    	let main;
    	let title;
    	let t0;
    	let section;
    	let t1;
    	let div;
    	let current;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[2],
    				sub: /*sub*/ ctx[3]
    			},
    			$$inline: true
    		});

    	let each_value = /*elements*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t0 = space();
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div = element("div");
    			attr_dev(div, "class", "selector no-anim svelte-1hdyf9b");
    			set_style(div, "width", /*width*/ ctx[4] / /*elements*/ ctx[1].length + "px");
    			set_style(div, "transform", "translateX(" + /*selectorX*/ ctx[10] + "px)");
    			add_location(div, file$x, 83, 8, 2554);
    			attr_dev(section, "class", "container svelte-1hdyf9b");
    			set_style(section, "width", /*width*/ ctx[4] + "px");
    			set_style(section, "height", /*height*/ ctx[5] + "px");
    			set_style(section, "border-radius", /*radius*/ ctx[6] + "px");
    			add_location(section, file$x, 73, 4, 1971);
    			attr_dev(main, "class", "svelte-1hdyf9b");
    			add_location(main, file$x, 70, 0, 1920);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t0);
    			append_dev(main, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			append_dev(section, t1);
    			append_dev(section, div);
    			/*div_binding*/ ctx[13](div);
    			/*section_binding*/ ctx[14](section);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 4) title_changes.name = /*name*/ ctx[2];
    			if (dirty & /*sub*/ 8) title_changes.sub = /*sub*/ ctx[3];
    			title.$set(title_changes);

    			if (dirty & /*elements, width, updateValue, selection, iconSize*/ 2195) {
    				each_value = /*elements*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*width, elements*/ 18) {
    				set_style(div, "width", /*width*/ ctx[4] / /*elements*/ ctx[1].length + "px");
    			}

    			if (!current || dirty & /*selectorX*/ 1024) {
    				set_style(div, "transform", "translateX(" + /*selectorX*/ ctx[10] + "px)");
    			}

    			if (!current || dirty & /*width*/ 16) {
    				set_style(section, "width", /*width*/ ctx[4] + "px");
    			}

    			if (!current || dirty & /*height*/ 32) {
    				set_style(section, "height", /*height*/ ctx[5] + "px");
    			}

    			if (!current || dirty & /*radius*/ 64) {
    				set_style(section, "border-radius", /*radius*/ ctx[6] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			destroy_each(each_blocks, detaching);
    			/*div_binding*/ ctx[13](null);
    			/*section_binding*/ ctx[14](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$x.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const textAlignment = [
    	{
    		iconDir: "./assets/icons/align-left.svg",
    		val: "left",
    		alt: "Align Left"
    	},
    	{
    		iconDir: "./assets/icons/align-center.svg",
    		val: "center",
    		alt: "Align Center"
    	},
    	{
    		iconDir: "./assets/icons/align-right.svg",
    		val: "right",
    		alt: "Align Right"
    	},
    	{
    		iconDir: "./assets/icons/align-justify.svg",
    		val: "justify",
    		alt: "Justify Content"
    	}
    ];

    const textCasing = [
    	{
    		iconDir: "./assets/icons/lower-case.svg",
    		val: "lower",
    		alt: "All Lowercase"
    	},
    	{
    		iconDir: "./assets/icons/mix-case.svg",
    		val: "mix",
    		alt: "Mixed Case"
    	},
    	{
    		iconDir: "./assets/icons/upper-case.svg",
    		val: "upper",
    		alt: "All Uppercase"
    	}
    ];

    function instance$x($$self, $$props, $$invalidate) {
    	let selectorX;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MultiToggle', slots, []);
    	const disp = createEventDispatcher();
    	let { elements } = $$props;
    	let { selection } = $$props;
    	let { name = "" } = $$props;
    	let { sub = false } = $$props;
    	let { width = 100 } = $$props;
    	let { height = 32 } = $$props;
    	let { radius = 8 } = $$props;
    	let { iconSize = 20 } = $$props;
    	selection = Math.min(elements.length - 1, Math.max(0, selection));
    	let container;
    	let selector;

    	const updateValue = newSelection => {
    		// $store = storeVal;
    		$$invalidate(0, selection = newSelection);

    		disp("valueChange", {
    			index: selection,
    			value: elements[selection].val
    		});
    	};

    	const writable_props = [
    		'elements',
    		'selection',
    		'name',
    		'sub',
    		'width',
    		'height',
    		'radius',
    		'iconSize'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MultiToggle> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => updateValue(i);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			selector = $$value;
    			$$invalidate(8, selector);
    		});
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(9, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('elements' in $$props) $$invalidate(1, elements = $$props.elements);
    		if ('selection' in $$props) $$invalidate(0, selection = $$props.selection);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(3, sub = $$props.sub);
    		if ('width' in $$props) $$invalidate(4, width = $$props.width);
    		if ('height' in $$props) $$invalidate(5, height = $$props.height);
    		if ('radius' in $$props) $$invalidate(6, radius = $$props.radius);
    		if ('iconSize' in $$props) $$invalidate(7, iconSize = $$props.iconSize);
    	};

    	$$self.$capture_state = () => ({
    		textAlignment,
    		textCasing,
    		createEventDispatcher,
    		Title,
    		disp,
    		elements,
    		selection,
    		name,
    		sub,
    		width,
    		height,
    		radius,
    		iconSize,
    		container,
    		selector,
    		updateValue,
    		selectorX
    	});

    	$$self.$inject_state = $$props => {
    		if ('elements' in $$props) $$invalidate(1, elements = $$props.elements);
    		if ('selection' in $$props) $$invalidate(0, selection = $$props.selection);
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(3, sub = $$props.sub);
    		if ('width' in $$props) $$invalidate(4, width = $$props.width);
    		if ('height' in $$props) $$invalidate(5, height = $$props.height);
    		if ('radius' in $$props) $$invalidate(6, radius = $$props.radius);
    		if ('iconSize' in $$props) $$invalidate(7, iconSize = $$props.iconSize);
    		if ('container' in $$props) $$invalidate(9, container = $$props.container);
    		if ('selector' in $$props) $$invalidate(8, selector = $$props.selector);
    		if ('selectorX' in $$props) $$invalidate(10, selectorX = $$props.selectorX);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width, elements, selection*/ 19) {
    			$$invalidate(10, selectorX = width / elements.length * selection);
    		}

    		if ($$self.$$.dirty & /*selector*/ 256) {
    			// remove selector animation blocker once it's loaded
    			if (!!selector) {
    				setTimeout(
    					() => {
    						selector.classList.remove("no-anim");
    					},
    					0
    				);
    			}
    		}
    	};

    	return [
    		selection,
    		elements,
    		name,
    		sub,
    		width,
    		height,
    		radius,
    		iconSize,
    		selector,
    		container,
    		selectorX,
    		updateValue,
    		click_handler,
    		div_binding,
    		section_binding
    	];
    }

    class MultiToggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$x, create_fragment$x, safe_not_equal, {
    			elements: 1,
    			selection: 0,
    			name: 2,
    			sub: 3,
    			width: 4,
    			height: 5,
    			radius: 6,
    			iconSize: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiToggle",
    			options,
    			id: create_fragment$x.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*elements*/ ctx[1] === undefined && !('elements' in props)) {
    			console.warn("<MultiToggle> was created without expected prop 'elements'");
    		}

    		if (/*selection*/ ctx[0] === undefined && !('selection' in props)) {
    			console.warn("<MultiToggle> was created without expected prop 'selection'");
    		}
    	}

    	get elements() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elements(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selection() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selection(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconSize() {
    		throw new Error("<MultiToggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconSize(value) {
    		throw new Error("<MultiToggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/ViewSwitcher.svelte generated by Svelte v3.48.0 */
    const file$w = "src/components/ctrlMenuItems/ViewSwitcher.svelte";

    function create_fragment$w(ctx) {
    	let main;
    	let a;
    	let img;
    	let img_src_value;
    	let t;
    	let multitoggle;
    	let current;

    	multitoggle = new MultiToggle({
    			props: {
    				elements: /*viewToggleElements*/ ctx[0],
    				selection: 0
    			},
    			$$inline: true
    		});

    	multitoggle.$on("valueChange", /*updateView*/ ctx[1]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			a = element("a");
    			img = element("img");
    			t = space();
    			create_component(multitoggle.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "./assets/svgs/emblem_flat.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-190cbok");
    			add_location(img, file$w, 25, 33, 658);
    			attr_dev(a, "href", "https://google.com");
    			attr_dev(a, "class", "svelte-190cbok");
    			add_location(a, file$w, 25, 4, 629);
    			attr_dev(main, "class", "svelte-190cbok");
    			add_location(main, file$w, 24, 0, 618);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, a);
    			append_dev(a, img);
    			append_dev(main, t);
    			mount_component(multitoggle, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(multitoggle.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(multitoggle.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(multitoggle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$w.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$w($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ViewSwitcher', slots, []);
    	const componentUUID = crypto.randomUUID();

    	const viewToggleElements = [
    		{
    			iconDir: "./assets/icons/cube.svg",
    			val: "edit",
    			alt: "Edit"
    		},
    		{
    			iconDir: "./assets/icons/pantone.svg",
    			val: "palette",
    			alt: "Palette"
    		}
    	];

    	// updating the view based on the index
    	const updateView = e => {
    		const value = e.detail.value;

    		// assign value
    		currentView.set(value);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ViewSwitcher> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		currentView,
    		MultiToggle,
    		componentUUID,
    		viewToggleElements,
    		updateView
    	});

    	return [viewToggleElements, updateView];
    }

    class ViewSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ViewSwitcher",
    			options,
    			id: create_fragment$w.name
    		});
    	}
    }

    /* src/components/ctrlMenus/LeftMenu.svelte generated by Svelte v3.48.0 */
    const file$v = "src/components/ctrlMenus/LeftMenu.svelte";

    function create_fragment$v(ctx) {
    	let main;
    	let viewswitcher;
    	let t0;
    	let collectionviewer;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let current;
    	viewswitcher = new ViewSwitcher({ $$inline: true });

    	collectionviewer = new CollectionViewer({
    			props: { containerWidth: /*currentWidth*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(viewswitcher.$$.fragment);
    			t0 = space();
    			create_component(collectionviewer.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			attr_dev(div0, "id", "drag-space");
    			attr_dev(div0, "class", "svelte-tzbdm9");
    			add_location(div0, file$v, 34, 4, 1175);
    			attr_dev(div1, "id", "bottom-gradient");
    			add_location(div1, file$v, 36, 4, 1230);
    			set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			set_style(main, "position", "absolute");
    			attr_dev(main, "class", "svelte-tzbdm9");
    			add_location(main, file$v, 27, 0, 969);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(viewswitcher, main, null);
    			append_dev(main, t0);
    			mount_component(collectionviewer, main, null);
    			append_dev(main, t1);
    			append_dev(main, div0);
    			/*div0_binding*/ ctx[2](div0);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const collectionviewer_changes = {};
    			if (dirty & /*currentWidth*/ 2) collectionviewer_changes.containerWidth = /*currentWidth*/ ctx[1];
    			collectionviewer.$set(collectionviewer_changes);

    			if (!current || dirty & /*currentWidth*/ 2) {
    				set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(viewswitcher.$$.fragment, local);
    			transition_in(collectionviewer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(viewswitcher.$$.fragment, local);
    			transition_out(collectionviewer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(viewswitcher);
    			destroy_component(collectionviewer);
    			/*div0_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$v.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$v($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LeftMenu', slots, []);
    	const disp = createEventDispatcher();
    	let dragSpace;
    	let currentWidth = 260;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LeftMenu> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dragSpace = $$value;
    			($$invalidate(0, dragSpace), $$invalidate(1, currentWidth));
    		});
    	}

    	$$self.$capture_state = () => ({
    		CollectionViewer,
    		ViewSwitcher,
    		createEventDispatcher,
    		disp,
    		dragSpace,
    		currentWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('dragSpace' in $$props) $$invalidate(0, dragSpace = $$props.dragSpace);
    		if ('currentWidth' in $$props) $$invalidate(1, currentWidth = $$props.currentWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*dragSpace, currentWidth*/ 3) {
    			if (!!dragSpace) {
    				// as soon as dragSpace is initialized, add the drag event listener for resize
    				$$invalidate(
    					0,
    					dragSpace.onmousedown = () => {
    						document.onmousemove = e => {
    							e.preventDefault();
    							document.body.style.cursor = "col-resize"; // set consistent cursor

    							if (e.clientX < 350 && e.clientX > 200) {
    								$$invalidate(1, currentWidth = e.clientX);
    								disp("widthChange", { width: currentWidth });
    							}
    						};
    					},
    					dragSpace
    				);

    				document.onmouseup = () => {
    					document.body.style.cursor = "default"; // reset cursor
    					document.onmousemove = undefined;
    				};
    			}
    		}
    	};

    	return [dragSpace, currentWidth, div0_binding];
    }

    class LeftMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeftMenu",
    			options,
    			id: create_fragment$v.name
    		});
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/Slider.svelte generated by Svelte v3.48.0 */
    const file$u = "src/components/ctrlMenuItems/StyleEditors/Basics/Slider.svelte";

    function create_fragment$u(ctx) {
    	let main;
    	let title;
    	let t0;
    	let section1;
    	let section0;
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t1;
    	let div2;
    	let div2_style_value;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[1],
    				sub: /*sub*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t0 = space();
    			section1 = element("section");
    			section0 = element("section");
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			div2 = element("div");
    			attr_dev(div0, "id", "slider-foreground");

    			attr_dev(div0, "style", div0_style_value = `transform: scaleX(${/*v*/ ctx[0] / /*max*/ ctx[3] * 100}%); ${/*colorRef*/ ctx[5] !== undefined
			? `background-color: hsl(${/*colorRef*/ ctx[5].h}deg, ${/*colorRef*/ ctx[5].s}%, ${/*colorRef*/ ctx[5].l}%)`
			: ""}`);

    			attr_dev(div0, "class", "svelte-15u8u0a");
    			add_location(div0, file$u, 76, 16, 2674);
    			attr_dev(div1, "id", "slider-background");
    			attr_dev(div1, "class", "svelte-15u8u0a");
    			add_location(div1, file$u, 75, 12, 2600);
    			attr_dev(div2, "id", "slider-knob");
    			attr_dev(div2, "style", div2_style_value = `transform: translate3d(${/*knobDist*/ ctx[7] - 6}px, 0px, 0px);`);
    			attr_dev(div2, "class", "svelte-15u8u0a");
    			add_location(div2, file$u, 78, 16, 2895);
    			attr_dev(section0, "id", "slider-container");
    			attr_dev(section0, "class", "svelte-15u8u0a");
    			add_location(section0, file$u, 74, 8, 2531);
    			attr_dev(section1, "id", "control");
    			attr_dev(section1, "class", "svelte-15u8u0a");
    			add_location(section1, file$u, 73, 4, 2500);
    			attr_dev(main, "style", main_style_value = `${/*hasMargin*/ ctx[4] ? "margin-right:15px" : ""};`);
    			attr_dev(main, "class", "svelte-15u8u0a");
    			add_location(main, file$u, 70, 0, 2402);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t0);
    			append_dev(main, section1);
    			append_dev(section1, section0);
    			append_dev(section0, div1);
    			append_dev(div1, div0);
    			/*div1_binding*/ ctx[12](div1);
    			append_dev(section0, t1);
    			append_dev(section0, div2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "mousedown", /*startDrag*/ ctx[8], false, false, false),
    					listen_dev(section0, "mousedown", /*startDrag*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 2) title_changes.name = /*name*/ ctx[1];
    			if (dirty & /*sub*/ 4) title_changes.sub = /*sub*/ ctx[2];
    			title.$set(title_changes);

    			if (!current || dirty & /*v, max, colorRef*/ 41 && div0_style_value !== (div0_style_value = `transform: scaleX(${/*v*/ ctx[0] / /*max*/ ctx[3] * 100}%); ${/*colorRef*/ ctx[5] !== undefined
			? `background-color: hsl(${/*colorRef*/ ctx[5].h}deg, ${/*colorRef*/ ctx[5].s}%, ${/*colorRef*/ ctx[5].l}%)`
			: ""}`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (!current || dirty & /*knobDist*/ 128 && div2_style_value !== (div2_style_value = `transform: translate3d(${/*knobDist*/ ctx[7] - 6}px, 0px, 0px);`)) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (!current || dirty & /*hasMargin*/ 16 && main_style_value !== (main_style_value = `${/*hasMargin*/ ctx[4] ? "margin-right:15px" : ""};`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			/*div1_binding*/ ctx[12](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$u.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$u($$self, $$props, $$invalidate) {
    	let knobDist;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	const disp = createEventDispatcher();
    	let { name } = $$props;
    	let { sub = false } = $$props;
    	let { min } = $$props;
    	let { max } = $$props;
    	let { v } = $$props;
    	let { psuedoV = v } = $$props;
    	let { hasMargin } = $$props;
    	let { colorRef = undefined } = $$props;
    	let initialCursorY = 0;
    	let { currentParentWidth = 360 } = $$props;
    	let sliderBackground;

    	// I don't know why I need this currentParentWidth * 0 but the slider wont fucking work without it.
    	const startDrag = e => {
    		// record initial cursorY
    		initialCursorY = e.clientY;

    		// update value first
    		if (!sliderBackground) return; // do not track if it's not initialized fully

    		const sliderBCR = sliderBackground.getBoundingClientRect();
    		$$invalidate(0, v = (e.clientX - sliderBCR.x) / sliderBCR.width * (max - min) + min);

    		// check v range
    		if (v < min) $$invalidate(0, v = min);

    		if (v > max) $$invalidate(0, v = max);

    		// dispatch an update value
    		disp("updateValue", { v: Math.round(v) });

    		// reset psuedoV
    		$$invalidate(9, psuedoV = v);

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackDrag);

    		document.addEventListener('mouseup', endDrag);
    	};

    	const trackDrag = e => {
    		e.preventDefault();
    		const sliderBCR = sliderBackground.getBoundingClientRect();

    		// calcuate V
    		let tV = (e.clientX - sliderBCR.x) / sliderBCR.width * (max - min) + min;

    		// calculate deltaV based off of mouse Y deviation
    		let invYFacStrength = 10; // smaller = stronger

    		let yFacThreshold = 2;

    		let yFac = 1 / (Math.abs(e.clientY - initialCursorY) / invYFacStrength < yFacThreshold
    		? 1
    		: Math.abs(e.clientY - initialCursorY) / invYFacStrength);

    		let dV = (tV - psuedoV) * yFac;

    		// assign dV
    		$$invalidate(0, v += dV);

    		// check v range
    		if (v < min) $$invalidate(0, v = min);

    		if (v > max) $$invalidate(0, v = max);

    		// dispatch an update value
    		disp("updateValue", { v: Math.round(v) });

    		// assign psuedoV
    		$$invalidate(9, psuedoV = tV);
    	};

    	const endDrag = () => {
    		document.body.style.cursor = "normal";
    		document.removeEventListener('mousemove', trackDrag);
    		document.removeEventListener('mouseup', endDrag);
    	};

    	const writable_props = [
    		'name',
    		'sub',
    		'min',
    		'max',
    		'v',
    		'psuedoV',
    		'hasMargin',
    		'colorRef',
    		'currentParentWidth'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			sliderBackground = $$value;
    			$$invalidate(6, sliderBackground);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(2, sub = $$props.sub);
    		if ('min' in $$props) $$invalidate(10, min = $$props.min);
    		if ('max' in $$props) $$invalidate(3, max = $$props.max);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('psuedoV' in $$props) $$invalidate(9, psuedoV = $$props.psuedoV);
    		if ('hasMargin' in $$props) $$invalidate(4, hasMargin = $$props.hasMargin);
    		if ('colorRef' in $$props) $$invalidate(5, colorRef = $$props.colorRef);
    		if ('currentParentWidth' in $$props) $$invalidate(11, currentParentWidth = $$props.currentParentWidth);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Title,
    		disp,
    		name,
    		sub,
    		min,
    		max,
    		v,
    		psuedoV,
    		hasMargin,
    		colorRef,
    		initialCursorY,
    		currentParentWidth,
    		sliderBackground,
    		startDrag,
    		trackDrag,
    		endDrag,
    		knobDist
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(2, sub = $$props.sub);
    		if ('min' in $$props) $$invalidate(10, min = $$props.min);
    		if ('max' in $$props) $$invalidate(3, max = $$props.max);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('psuedoV' in $$props) $$invalidate(9, psuedoV = $$props.psuedoV);
    		if ('hasMargin' in $$props) $$invalidate(4, hasMargin = $$props.hasMargin);
    		if ('colorRef' in $$props) $$invalidate(5, colorRef = $$props.colorRef);
    		if ('initialCursorY' in $$props) initialCursorY = $$props.initialCursorY;
    		if ('currentParentWidth' in $$props) $$invalidate(11, currentParentWidth = $$props.currentParentWidth);
    		if ('sliderBackground' in $$props) $$invalidate(6, sliderBackground = $$props.sliderBackground);
    		if ('knobDist' in $$props) $$invalidate(7, knobDist = $$props.knobDist);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*v, max, sliderBackground, currentParentWidth*/ 2121) {
    			$$invalidate(7, knobDist = (v > max ? max : v) / max * (!!sliderBackground
    			? sliderBackground.getBoundingClientRect().width - 12
    			: 0) + 6 + currentParentWidth * 0); // currentParentWidth for updating when parent changes size
    		}
    	};

    	return [
    		v,
    		name,
    		sub,
    		max,
    		hasMargin,
    		colorRef,
    		sliderBackground,
    		knobDist,
    		startDrag,
    		psuedoV,
    		min,
    		currentParentWidth,
    		div1_binding
    	];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$u, create_fragment$u, safe_not_equal, {
    			name: 1,
    			sub: 2,
    			min: 10,
    			max: 3,
    			v: 0,
    			psuedoV: 9,
    			hasMargin: 4,
    			colorRef: 5,
    			currentParentWidth: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$u.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<Slider> was created without expected prop 'name'");
    		}

    		if (/*min*/ ctx[10] === undefined && !('min' in props)) {
    			console.warn("<Slider> was created without expected prop 'min'");
    		}

    		if (/*max*/ ctx[3] === undefined && !('max' in props)) {
    			console.warn("<Slider> was created without expected prop 'max'");
    		}

    		if (/*v*/ ctx[0] === undefined && !('v' in props)) {
    			console.warn("<Slider> was created without expected prop 'v'");
    		}

    		if (/*hasMargin*/ ctx[4] === undefined && !('hasMargin' in props)) {
    			console.warn("<Slider> was created without expected prop 'hasMargin'");
    		}
    	}

    	get name() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get min() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get psuedoV() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set psuedoV(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorRef() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorRef(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentParentWidth() {
    		throw new Error("<Slider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParentWidth(value) {
    		throw new Error("<Slider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/UnitInput.svelte generated by Svelte v3.48.0 */
    const file$t = "src/components/ctrlMenuItems/StyleEditors/Basics/UnitInput.svelte";

    // (118:8) {#if currentUnit !== "fit-content"}
    function create_if_block_9(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "svelte-hwskva");
    			add_location(input, file$t, 118, 12, 4383);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[22](input);
    			set_input_value(input, /*v*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[23]),
    					listen_dev(input, "keydown", /*keyPress*/ ctx[17], false, false, false),
    					listen_dev(input, "blur", /*preventNullV*/ ctx[16], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[24], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*v*/ 1 && input.value !== /*v*/ ctx[0]) {
    				set_input_value(input, /*v*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[22](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(118:8) {#if currentUnit !== \\\"fit-content\\\"}",
    		ctx
    	});

    	return block;
    }

    // (132:12) {#if currentUnit !== "px"}
    function create_if_block_8(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "px";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 132, 55, 5077);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 132, 16, 5038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[25], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(132:12) {#if currentUnit !== \\\"px\\\"}",
    		ctx
    	});

    	return block;
    }

    // (137:12) {#if currentUnit !== "pt"}
    function create_if_block_7(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "pt";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 137, 55, 5243);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 137, 16, 5204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_1*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(137:12) {#if currentUnit !== \\\"pt\\\"}",
    		ctx
    	});

    	return block;
    }

    // (142:12) {#if currentUnit !== "pc"}
    function create_if_block_6(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "pc";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 142, 55, 5409);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 142, 16, 5370);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_2*/ ctx[27], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(142:12) {#if currentUnit !== \\\"pc\\\"}",
    		ctx
    	});

    	return block;
    }

    // (147:12) {#if currentUnit !== "em"}
    function create_if_block_5(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "em";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 147, 55, 5575);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 147, 16, 5536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_3*/ ctx[28], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(147:12) {#if currentUnit !== \\\"em\\\"}",
    		ctx
    	});

    	return block;
    }

    // (152:12) {#if currentUnit !== "rem"}
    function create_if_block_4(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "rem";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 152, 56, 5743);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 152, 16, 5703);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_4*/ ctx[29], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(152:12) {#if currentUnit !== \\\"rem\\\"}",
    		ctx
    	});

    	return block;
    }

    // (157:12) {#if currentUnit !== "vw"}
    function create_if_block_3(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "vw";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 157, 55, 5910);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 157, 16, 5871);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_5*/ ctx[30], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(157:12) {#if currentUnit !== \\\"vw\\\"}",
    		ctx
    	});

    	return block;
    }

    // (162:12) {#if currentUnit !== "vh"}
    function create_if_block_2$2(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "vh";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 162, 55, 6076);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 162, 16, 6037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_6*/ ctx[31], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(162:12) {#if currentUnit !== \\\"vh\\\"}",
    		ctx
    	});

    	return block;
    }

    // (168:12) {#if currentUnit !== "%" && usePercent}
    function create_if_block_1$6(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "%";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 168, 54, 6349);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 168, 16, 6311);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_7*/ ctx[32], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(168:12) {#if currentUnit !== \\\"%\\\" && usePercent}",
    		ctx
    	});

    	return block;
    }

    // (173:12) {#if currentUnit !== "fit-content" && useFC}
    function create_if_block$a(ctx) {
    	let div;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Fit Content";
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 173, 64, 6541);
    			attr_dev(div, "class", "svelte-hwskva");
    			add_location(div, file$t, 173, 16, 6493);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler_8*/ ctx[33], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(173:12) {#if currentUnit !== \\\"fit-content\\\" && useFC}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$t(ctx) {
    	let main;
    	let title;
    	let t0;
    	let section1;
    	let t1;
    	let div;
    	let p;
    	let t2;
    	let div_style_value;
    	let div_class_value;
    	let t3;
    	let section0;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let section0_class_value;
    	let section1_class_value;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[2],
    				sub: /*sub*/ ctx[8],
    				align: /*alignTitle*/ ctx[9],
    				textClrOverride: /*textClrOverride*/ ctx[10]
    			},
    			$$inline: true
    		});

    	let if_block0 = /*currentUnit*/ ctx[1] !== "fit-content" && create_if_block_9(ctx);
    	let if_block1 = /*currentUnit*/ ctx[1] !== "px" && create_if_block_8(ctx);
    	let if_block2 = /*currentUnit*/ ctx[1] !== "pt" && create_if_block_7(ctx);
    	let if_block3 = /*currentUnit*/ ctx[1] !== "pc" && create_if_block_6(ctx);
    	let if_block4 = /*currentUnit*/ ctx[1] !== "em" && create_if_block_5(ctx);
    	let if_block5 = /*currentUnit*/ ctx[1] !== "rem" && create_if_block_4(ctx);
    	let if_block6 = /*currentUnit*/ ctx[1] !== "vw" && create_if_block_3(ctx);
    	let if_block7 = /*currentUnit*/ ctx[1] !== "vh" && create_if_block_2$2(ctx);
    	let if_block8 = /*currentUnit*/ ctx[1] !== "%" && /*usePercent*/ ctx[7] && create_if_block_1$6(ctx);
    	let if_block9 = /*currentUnit*/ ctx[1] !== "fit-content" && /*useFC*/ ctx[6] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t0 = space();
    			section1 = element("section");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div = element("div");
    			p = element("p");
    			t2 = text(/*currentUnit*/ ctx[1]);
    			t3 = space();
    			section0 = element("section");
    			if (if_block1) if_block1.c();
    			t4 = space();
    			if (if_block2) if_block2.c();
    			t5 = space();
    			if (if_block3) if_block3.c();
    			t6 = space();
    			if (if_block4) if_block4.c();
    			t7 = space();
    			if (if_block5) if_block5.c();
    			t8 = space();
    			if (if_block6) if_block6.c();
    			t9 = space();
    			if (if_block7) if_block7.c();
    			t10 = space();
    			if (if_block8) if_block8.c();
    			t11 = space();
    			if (if_block9) if_block9.c();
    			attr_dev(p, "class", "svelte-hwskva");
    			add_location(p, file$t, 125, 12, 4787);
    			attr_dev(div, "id", "unit-display");

    			attr_dev(div, "style", div_style_value = `${/*currentUnit*/ ctx[1] === "fit-content"
			? "width:100%; border-radius:4px"
			: ""}`);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`${/*unitSelOpen*/ ctx[11] ? "selected" : ""}`) + " svelte-hwskva"));
    			add_location(div, file$t, 122, 8, 4581);
    			attr_dev(section0, "id", "unit-sel-container");
    			attr_dev(section0, "class", section0_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[14]} ${!/*unitSelOpen*/ ctx[11] ? "hidden" : ""}`) + " svelte-hwskva"));
    			add_location(section0, file$t, 130, 8, 4862);
    			attr_dev(section1, "class", section1_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[14]} ${/*unitSelOpen*/ ctx[11] ? "sel-opened" : ""}`) + " svelte-hwskva"));
    			add_location(section1, file$t, 114, 4, 4188);

    			attr_dev(main, "style", main_style_value = `${/*hasMargin*/ ctx[3] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[4] !== ""
			? `max-width:${/*maxWidth*/ ctx[4]}`
			: ""}; ${/*minWidth*/ ctx[5] !== ""
			? `min-width:${/*minWidth*/ ctx[5]}`
			: ""}`);

    			attr_dev(main, "class", "svelte-hwskva");
    			add_location(main, file$t, 111, 0, 3937);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t0);
    			append_dev(main, section1);
    			if (if_block0) if_block0.m(section1, null);
    			append_dev(section1, t1);
    			append_dev(section1, div);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(section1, t3);
    			append_dev(section1, section0);
    			if (if_block1) if_block1.m(section0, null);
    			append_dev(section0, t4);
    			if (if_block2) if_block2.m(section0, null);
    			append_dev(section0, t5);
    			if (if_block3) if_block3.m(section0, null);
    			append_dev(section0, t6);
    			if (if_block4) if_block4.m(section0, null);
    			append_dev(section0, t7);
    			if (if_block5) if_block5.m(section0, null);
    			append_dev(section0, t8);
    			if (if_block6) if_block6.m(section0, null);
    			append_dev(section0, t9);
    			if (if_block7) if_block7.m(section0, null);
    			append_dev(section0, t10);
    			if (if_block8) if_block8.m(section0, null);
    			append_dev(section0, t11);
    			if (if_block9) if_block9.m(section0, null);
    			/*section0_binding*/ ctx[34](section0);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*openUnitSel*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const title_changes = {};
    			if (dirty[0] & /*name*/ 4) title_changes.name = /*name*/ ctx[2];
    			if (dirty[0] & /*sub*/ 256) title_changes.sub = /*sub*/ ctx[8];
    			if (dirty[0] & /*alignTitle*/ 512) title_changes.align = /*alignTitle*/ ctx[9];
    			if (dirty[0] & /*textClrOverride*/ 1024) title_changes.textClrOverride = /*textClrOverride*/ ctx[10];
    			title.$set(title_changes);

    			if (/*currentUnit*/ ctx[1] !== "fit-content") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_9(ctx);
    					if_block0.c();
    					if_block0.m(section1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty[0] & /*currentUnit*/ 2) set_data_dev(t2, /*currentUnit*/ ctx[1]);

    			if (!current || dirty[0] & /*currentUnit*/ 2 && div_style_value !== (div_style_value = `${/*currentUnit*/ ctx[1] === "fit-content"
			? "width:100%; border-radius:4px"
			: ""}`)) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (!current || dirty[0] & /*unitSelOpen*/ 2048 && div_class_value !== (div_class_value = "" + (null_to_empty(`${/*unitSelOpen*/ ctx[11] ? "selected" : ""}`) + " svelte-hwskva"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (/*currentUnit*/ ctx[1] !== "px") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_8(ctx);
    					if_block1.c();
    					if_block1.m(section0, t4);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "pt") {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_7(ctx);
    					if_block2.c();
    					if_block2.m(section0, t5);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "pc") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_6(ctx);
    					if_block3.c();
    					if_block3.m(section0, t6);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "em") {
    				if (if_block4) {
    					if_block4.p(ctx, dirty);
    				} else {
    					if_block4 = create_if_block_5(ctx);
    					if_block4.c();
    					if_block4.m(section0, t7);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "rem") {
    				if (if_block5) {
    					if_block5.p(ctx, dirty);
    				} else {
    					if_block5 = create_if_block_4(ctx);
    					if_block5.c();
    					if_block5.m(section0, t8);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "vw") {
    				if (if_block6) {
    					if_block6.p(ctx, dirty);
    				} else {
    					if_block6 = create_if_block_3(ctx);
    					if_block6.c();
    					if_block6.m(section0, t9);
    				}
    			} else if (if_block6) {
    				if_block6.d(1);
    				if_block6 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "vh") {
    				if (if_block7) {
    					if_block7.p(ctx, dirty);
    				} else {
    					if_block7 = create_if_block_2$2(ctx);
    					if_block7.c();
    					if_block7.m(section0, t10);
    				}
    			} else if (if_block7) {
    				if_block7.d(1);
    				if_block7 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "%" && /*usePercent*/ ctx[7]) {
    				if (if_block8) {
    					if_block8.p(ctx, dirty);
    				} else {
    					if_block8 = create_if_block_1$6(ctx);
    					if_block8.c();
    					if_block8.m(section0, t11);
    				}
    			} else if (if_block8) {
    				if_block8.d(1);
    				if_block8 = null;
    			}

    			if (/*currentUnit*/ ctx[1] !== "fit-content" && /*useFC*/ ctx[6]) {
    				if (if_block9) {
    					if_block9.p(ctx, dirty);
    				} else {
    					if_block9 = create_if_block$a(ctx);
    					if_block9.c();
    					if_block9.m(section0, null);
    				}
    			} else if (if_block9) {
    				if_block9.d(1);
    				if_block9 = null;
    			}

    			if (!current || dirty[0] & /*openDirection, unitSelOpen*/ 18432 && section0_class_value !== (section0_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[14]} ${!/*unitSelOpen*/ ctx[11] ? "hidden" : ""}`) + " svelte-hwskva"))) {
    				attr_dev(section0, "class", section0_class_value);
    			}

    			if (!current || dirty[0] & /*openDirection, unitSelOpen*/ 18432 && section1_class_value !== (section1_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[14]} ${/*unitSelOpen*/ ctx[11] ? "sel-opened" : ""}`) + " svelte-hwskva"))) {
    				attr_dev(section1, "class", section1_class_value);
    			}

    			if (!current || dirty[0] & /*hasMargin, maxWidth, minWidth*/ 56 && main_style_value !== (main_style_value = `${/*hasMargin*/ ctx[3] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[4] !== ""
			? `max-width:${/*maxWidth*/ ctx[4]}`
			: ""}; ${/*minWidth*/ ctx[5] !== ""
			? `min-width:${/*minWidth*/ ctx[5]}`
			: ""}`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			if (if_block6) if_block6.d();
    			if (if_block7) if_block7.d();
    			if (if_block8) if_block8.d();
    			if (if_block9) if_block9.d();
    			/*section0_binding*/ ctx[34](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$t.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$t($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('UnitInput', slots, []);
    	const disp = createEventDispatcher();
    	let { name } = $$props;
    	let { v } = $$props;
    	let { hasMargin } = $$props;
    	let { currentUnit = "px" } = $$props;
    	let { maxWidth = "" } = $$props;
    	let { minWidth = "" } = $$props;
    	let { useFC = true } = $$props;
    	let { usePercent = false } = $$props;
    	let { sub = false } = $$props;
    	let { maxVal = 5000 } = $$props;
    	let { minVal = 0 } = $$props;
    	let { align = "left" } = $$props;
    	let { alignTitle = align } = $$props;
    	let { textClrOverride = undefined } = $$props;
    	let unitSelOpen = false;
    	let valueInputField;
    	let dropDownElement;
    	let openDirection = "open-top";
    	let trackingDir = false;

    	const preventNullV = () => {
    		if (v === undefined || v.length === 0 || v === "-") $$invalidate(0, v = 0);
    		if (v > maxVal) $$invalidate(0, v = maxVal);
    		if (v < minVal) $$invalidate(0, v = minVal);
    		disp("updateValue", { v, u: currentUnit });
    		disp("blurred");
    	};

    	const keyPress = e => {
    		if (e.key === "Enter" || e.key === "Escape" || e.key === "Escape") {
    			e.preventDefault();
    			valueInputField.blur();
    		} else // check when the user use the arrow key
    		if (e.key === "ArrowUp" && v + 1 <= maxVal) {
    			e.preventDefault();
    			$$invalidate(0, v++, v);
    		} else if (e.key === "ArrowDown" && v - 1 >= minVal) {
    			e.preventDefault();
    			$$invalidate(0, v--, v);
    		}

    		if (v !== undefined && String(v).length > 0 && !isNaN(Number(v))) {
    			disp("updateValue", { v, u: currentUnit });
    		}
    	};

    	const openUnitSel = () => {
    		updateSelectionDirection();
    		$$invalidate(11, unitSelOpen = true);

    		// for closing
    		document.addEventListener("mouseup", closeUnitSel);

    		// add resize listener for window
    		trackingDir = true;

    		requestAnimationFrame(updateSelectionDirection);
    	};

    	const updateSelectionDirection = () => {
    		// iterCt prevents stack overflowing
    		if (!dropDownElement) return; // keep checking until dropDownElement exists

    		const bbRect = dropDownElement.getBoundingClientRect();
    		const margin = 10;

    		if (openDirection == "open-bottom") $$invalidate(14, openDirection = bbRect.y + bbRect.height + margin > window.innerHeight
    		? "open-top"
    		: "open-bottom"); else $$invalidate(14, openDirection = bbRect.y + 25 + bbRect.height * 2 + margin > window.innerHeight
    		? "open-top"
    		: "open-bottom");

    		if (trackingDir) requestAnimationFrame(updateSelectionDirection);
    	};

    	const closeUnitSel = () => {
    		setTimeout(
    			() => {
    				$$invalidate(11, unitSelOpen = false);

    				// cancel direction tracking
    				trackingDir = false;

    				// remove listener
    				document.removeEventListener("mouseup", closeUnitSel);

    				window.removeEventListener("resize", updateSelectionDirection);
    			},
    			0
    		);
    	};

    	const writable_props = [
    		'name',
    		'v',
    		'hasMargin',
    		'currentUnit',
    		'maxWidth',
    		'minWidth',
    		'useFC',
    		'usePercent',
    		'sub',
    		'maxVal',
    		'minVal',
    		'align',
    		'alignTitle',
    		'textClrOverride'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UnitInput> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			valueInputField = $$value;
    			$$invalidate(12, valueInputField);
    		});
    	}

    	function input_input_handler() {
    		v = this.value;
    		((($$invalidate(0, v), $$invalidate(1, currentUnit)), $$invalidate(19, maxVal)), $$invalidate(20, minVal));
    	}

    	const focus_handler = () => disp("focused");
    	const click_handler = () => $$invalidate(1, currentUnit = "px");
    	const click_handler_1 = () => $$invalidate(1, currentUnit = "pt");
    	const click_handler_2 = () => $$invalidate(1, currentUnit = "pc");
    	const click_handler_3 = () => $$invalidate(1, currentUnit = "em");
    	const click_handler_4 = () => $$invalidate(1, currentUnit = "rem");
    	const click_handler_5 = () => $$invalidate(1, currentUnit = "vw");
    	const click_handler_6 = () => $$invalidate(1, currentUnit = "vh");
    	const click_handler_7 = () => $$invalidate(1, currentUnit = "%");
    	const click_handler_8 = () => $$invalidate(1, currentUnit = "fit-content");

    	function section0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dropDownElement = $$value;
    			$$invalidate(13, dropDownElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(3, hasMargin = $$props.hasMargin);
    		if ('currentUnit' in $$props) $$invalidate(1, currentUnit = $$props.currentUnit);
    		if ('maxWidth' in $$props) $$invalidate(4, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(5, minWidth = $$props.minWidth);
    		if ('useFC' in $$props) $$invalidate(6, useFC = $$props.useFC);
    		if ('usePercent' in $$props) $$invalidate(7, usePercent = $$props.usePercent);
    		if ('sub' in $$props) $$invalidate(8, sub = $$props.sub);
    		if ('maxVal' in $$props) $$invalidate(19, maxVal = $$props.maxVal);
    		if ('minVal' in $$props) $$invalidate(20, minVal = $$props.minVal);
    		if ('align' in $$props) $$invalidate(21, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(9, alignTitle = $$props.alignTitle);
    		if ('textClrOverride' in $$props) $$invalidate(10, textClrOverride = $$props.textClrOverride);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Title,
    		disp,
    		name,
    		v,
    		hasMargin,
    		currentUnit,
    		maxWidth,
    		minWidth,
    		useFC,
    		usePercent,
    		sub,
    		maxVal,
    		minVal,
    		align,
    		alignTitle,
    		textClrOverride,
    		unitSelOpen,
    		valueInputField,
    		dropDownElement,
    		openDirection,
    		trackingDir,
    		preventNullV,
    		keyPress,
    		openUnitSel,
    		updateSelectionDirection,
    		closeUnitSel
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(3, hasMargin = $$props.hasMargin);
    		if ('currentUnit' in $$props) $$invalidate(1, currentUnit = $$props.currentUnit);
    		if ('maxWidth' in $$props) $$invalidate(4, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(5, minWidth = $$props.minWidth);
    		if ('useFC' in $$props) $$invalidate(6, useFC = $$props.useFC);
    		if ('usePercent' in $$props) $$invalidate(7, usePercent = $$props.usePercent);
    		if ('sub' in $$props) $$invalidate(8, sub = $$props.sub);
    		if ('maxVal' in $$props) $$invalidate(19, maxVal = $$props.maxVal);
    		if ('minVal' in $$props) $$invalidate(20, minVal = $$props.minVal);
    		if ('align' in $$props) $$invalidate(21, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(9, alignTitle = $$props.alignTitle);
    		if ('textClrOverride' in $$props) $$invalidate(10, textClrOverride = $$props.textClrOverride);
    		if ('unitSelOpen' in $$props) $$invalidate(11, unitSelOpen = $$props.unitSelOpen);
    		if ('valueInputField' in $$props) $$invalidate(12, valueInputField = $$props.valueInputField);
    		if ('dropDownElement' in $$props) $$invalidate(13, dropDownElement = $$props.dropDownElement);
    		if ('openDirection' in $$props) $$invalidate(14, openDirection = $$props.openDirection);
    		if ('trackingDir' in $$props) trackingDir = $$props.trackingDir;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*v, currentUnit, maxVal, minVal*/ 1572867) {
    			// dispatch value changes if v changes
    			if (v !== undefined && v.length > 0 && v !== "-" || currentUnit !== null) {
    				// update when V is not null or empty or illegal strings, or when current unit has changed
    				// check if V is value. Sometimes this function can run when V is not valid as the user is changing the unit. So we need to check again
    				if (v !== undefined && v.length > 0 && v !== "-") {
    					// clean up every character of v except the first character
    					for (let i = v.length - 1; i > -1; i--) {
    						// check if regex matches. If not, remove character
    						if (i === 0 && !(/^\d+$/).test(v[i]) && v[i] !== "-" || i !== 0 && !(/^\d+$/).test(v[i])) $$invalidate(0, v = v.substring(0, i) + v.substring(i + 1, v.length)); //remove the letter if it's not a number
    					}

    					if (!isNaN(Number(v))) {
    						$$invalidate(0, v = Math.max(Math.min(v, maxVal), minVal));
    					} else {
    						$$invalidate(0, v = 0);
    					}
    				}

    				disp("updateValue", { v, u: currentUnit });
    			}
    		}
    	};

    	return [
    		v,
    		currentUnit,
    		name,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		useFC,
    		usePercent,
    		sub,
    		alignTitle,
    		textClrOverride,
    		unitSelOpen,
    		valueInputField,
    		dropDownElement,
    		openDirection,
    		disp,
    		preventNullV,
    		keyPress,
    		openUnitSel,
    		maxVal,
    		minVal,
    		align,
    		input_binding,
    		input_input_handler,
    		focus_handler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		section0_binding
    	];
    }

    class UnitInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$t,
    			create_fragment$t,
    			safe_not_equal,
    			{
    				name: 2,
    				v: 0,
    				hasMargin: 3,
    				currentUnit: 1,
    				maxWidth: 4,
    				minWidth: 5,
    				useFC: 6,
    				usePercent: 7,
    				sub: 8,
    				maxVal: 19,
    				minVal: 20,
    				align: 21,
    				alignTitle: 9,
    				textClrOverride: 10
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UnitInput",
    			options,
    			id: create_fragment$t.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !('name' in props)) {
    			console.warn("<UnitInput> was created without expected prop 'name'");
    		}

    		if (/*v*/ ctx[0] === undefined && !('v' in props)) {
    			console.warn("<UnitInput> was created without expected prop 'v'");
    		}

    		if (/*hasMargin*/ ctx[3] === undefined && !('hasMargin' in props)) {
    			console.warn("<UnitInput> was created without expected prop 'hasMargin'");
    		}
    	}

    	get name() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentUnit() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentUnit(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useFC() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useFC(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get usePercent() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set usePercent(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxVal() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxVal(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minVal() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minVal(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignTitle() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignTitle(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClrOverride() {
    		throw new Error("<UnitInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClrOverride(value) {
    		throw new Error("<UnitInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/ValueInput.svelte generated by Svelte v3.48.0 */
    const file$s = "src/components/ctrlMenuItems/StyleEditors/Basics/ValueInput.svelte";

    function create_fragment$s(ctx) {
    	let main;
    	let title;
    	let t;
    	let input;
    	let input_style_value;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[1],
    				sub: /*sub*/ ctx[5],
    				align: /*alignTitle*/ ctx[7],
    				textClrOverride: /*textClrOverride*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t = space();
    			input = element("input");
    			attr_dev(input, "style", input_style_value = `text-align: ${/*align*/ ctx[6]}`);
    			attr_dev(input, "class", "svelte-9i6ua1");
    			add_location(input, file$s, 73, 4, 2312);

    			attr_dev(main, "style", main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`);

    			attr_dev(main, "class", "svelte-9i6ua1");
    			add_location(main, file$s, 70, 0, 2061);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t);
    			append_dev(main, input);
    			/*input_binding*/ ctx[16](input);
    			set_input_value(input, /*v*/ ctx[0]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[17]),
    					listen_dev(input, "keydown", /*keyPress*/ ctx[12], false, false, false),
    					listen_dev(input, "blur", /*preventNullV*/ ctx[11], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 2) title_changes.name = /*name*/ ctx[1];
    			if (dirty & /*sub*/ 32) title_changes.sub = /*sub*/ ctx[5];
    			if (dirty & /*alignTitle*/ 128) title_changes.align = /*alignTitle*/ ctx[7];
    			if (dirty & /*textClrOverride*/ 256) title_changes.textClrOverride = /*textClrOverride*/ ctx[8];
    			title.$set(title_changes);

    			if (!current || dirty & /*align*/ 64 && input_style_value !== (input_style_value = `text-align: ${/*align*/ ctx[6]}`)) {
    				attr_dev(input, "style", input_style_value);
    			}

    			if (dirty & /*v*/ 1 && input.value !== /*v*/ ctx[0]) {
    				set_input_value(input, /*v*/ ctx[0]);
    			}

    			if (!current || dirty & /*hasMargin, maxWidth, minWidth*/ 28 && main_style_value !== (main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			/*input_binding*/ ctx[16](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$s.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$s($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ValueInput', slots, []);
    	let { name } = $$props;
    	let { v } = $$props;
    	let { hasMargin } = $$props;
    	let { maxWidth = "" } = $$props;
    	let { minWidth = "" } = $$props;
    	let { sub } = $$props;
    	let { maxVal = 5000 } = $$props;
    	let { minVal = 0 } = $$props;
    	let { align = "left" } = $$props;
    	let { alignTitle = align } = $$props;
    	let { textClrOverride = "" } = $$props;
    	const disp = createEventDispatcher();
    	let valueInputField;
    	let dispatchLocked = true;

    	const preventNullV = () => {
    		if (v === undefined || v.length === 0 || v === "-") $$invalidate(0, v = 0);
    		if (v > maxVal) $$invalidate(0, v = maxVal);
    		if (v < minVal) $$invalidate(0, v = minVal);
    		$$invalidate(15, dispatchLocked = true);
    		disp("updateValue", { v });
    		disp("blurred");
    	};

    	const keyPress = e => {
    		$$invalidate(15, dispatchLocked = false);

    		if (e.key === "Enter" || e.key === "Escape" || e.key === "Escape") {
    			e.preventDefault();
    			valueInputField.blur();
    		} else // check when the user use the arrow key
    		if (e.key === "ArrowUp" && v + 1 <= maxVal) {
    			e.preventDefault();
    			$$invalidate(0, v++, v);
    		} else if (e.key === "ArrowDown" && v - 1 >= minVal) {
    			e.preventDefault();
    			$$invalidate(0, v--, v);
    		}

    		if (v !== undefined && String(v).length > 0 && !isNaN(Number(v))) {
    			disp("updateValue", { v });
    		}
    	};

    	const writable_props = [
    		'name',
    		'v',
    		'hasMargin',
    		'maxWidth',
    		'minWidth',
    		'sub',
    		'maxVal',
    		'minVal',
    		'align',
    		'alignTitle',
    		'textClrOverride'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ValueInput> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			valueInputField = $$value;
    			$$invalidate(9, valueInputField);
    		});
    	}

    	function input_input_handler() {
    		v = this.value;
    		((($$invalidate(0, v), $$invalidate(15, dispatchLocked)), $$invalidate(13, maxVal)), $$invalidate(14, minVal));
    	}

    	const focus_handler = () => disp("focused");

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(5, sub = $$props.sub);
    		if ('maxVal' in $$props) $$invalidate(13, maxVal = $$props.maxVal);
    		if ('minVal' in $$props) $$invalidate(14, minVal = $$props.minVal);
    		if ('align' in $$props) $$invalidate(6, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(7, alignTitle = $$props.alignTitle);
    		if ('textClrOverride' in $$props) $$invalidate(8, textClrOverride = $$props.textClrOverride);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		v,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		sub,
    		maxVal,
    		minVal,
    		align,
    		alignTitle,
    		textClrOverride,
    		createEventDispatcher,
    		Title,
    		disp,
    		valueInputField,
    		dispatchLocked,
    		preventNullV,
    		keyPress
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(5, sub = $$props.sub);
    		if ('maxVal' in $$props) $$invalidate(13, maxVal = $$props.maxVal);
    		if ('minVal' in $$props) $$invalidate(14, minVal = $$props.minVal);
    		if ('align' in $$props) $$invalidate(6, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(7, alignTitle = $$props.alignTitle);
    		if ('textClrOverride' in $$props) $$invalidate(8, textClrOverride = $$props.textClrOverride);
    		if ('valueInputField' in $$props) $$invalidate(9, valueInputField = $$props.valueInputField);
    		if ('dispatchLocked' in $$props) $$invalidate(15, dispatchLocked = $$props.dispatchLocked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*v, dispatchLocked, maxVal, minVal*/ 57345) {
    			// dispatch value changes if v changes
    			if (v !== undefined && v.length > 0 && v !== "-" && !dispatchLocked) {
    				// do not send null
    				// clean up every character of v except the first character. Make sure this only runs when V is not undefined        
    				for (let i = v.length - 1; i > -1; i--) {
    					// check if regex matches. If not, remove character
    					if (i === 0 && !(/^\d+$/).test(v[i]) && v[i] !== "-" || i !== 0 && !(/^\d+$/).test(v[i])) $$invalidate(0, v = v.substring(0, i) + v.substring(i + 1, v.length)); //remove the letter if it's not a number
    				}

    				if (!isNaN(Number(v))) {
    					$$invalidate(0, v = Math.max(Math.min(v, maxVal), minVal));
    				} else {
    					$$invalidate(0, v = 0);
    				}

    				disp("updateValue", { v });
    			}
    		}
    	};

    	return [
    		v,
    		name,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		sub,
    		align,
    		alignTitle,
    		textClrOverride,
    		valueInputField,
    		disp,
    		preventNullV,
    		keyPress,
    		maxVal,
    		minVal,
    		dispatchLocked,
    		input_binding,
    		input_input_handler,
    		focus_handler
    	];
    }

    class ValueInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$s, create_fragment$s, safe_not_equal, {
    			name: 1,
    			v: 0,
    			hasMargin: 2,
    			maxWidth: 3,
    			minWidth: 4,
    			sub: 5,
    			maxVal: 13,
    			minVal: 14,
    			align: 6,
    			alignTitle: 7,
    			textClrOverride: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ValueInput",
    			options,
    			id: create_fragment$s.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<ValueInput> was created without expected prop 'name'");
    		}

    		if (/*v*/ ctx[0] === undefined && !('v' in props)) {
    			console.warn("<ValueInput> was created without expected prop 'v'");
    		}

    		if (/*hasMargin*/ ctx[2] === undefined && !('hasMargin' in props)) {
    			console.warn("<ValueInput> was created without expected prop 'hasMargin'");
    		}

    		if (/*sub*/ ctx[5] === undefined && !('sub' in props)) {
    			console.warn("<ValueInput> was created without expected prop 'sub'");
    		}
    	}

    	get name() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxVal() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxVal(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minVal() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minVal(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignTitle() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignTitle(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClrOverride() {
    		throw new Error("<ValueInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClrOverride(value) {
    		throw new Error("<ValueInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/BoundingBoxEditor.svelte generated by Svelte v3.48.0 */
    const file$r = "src/components/ctrlMenuItems/StyleEditors/BoundingBoxEditor.svelte";

    function create_fragment$r(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let section0;
    	let slider0;
    	let t2;
    	let unitinput0;
    	let t3;
    	let unitinput1;
    	let t4;
    	let section1;
    	let slider1;
    	let t5;
    	let unitinput2;
    	let t6;
    	let unitinput3;
    	let t7;
    	let unitinput4;
    	let t8;
    	let unitinput5;
    	let t9;
    	let section2;
    	let slider2;
    	let t10;
    	let unitinput6;
    	let t11;
    	let unitinput7;
    	let t12;
    	let unitinput8;
    	let t13;
    	let unitinput9;
    	let current;

    	slider0 = new Slider({
    			props: {
    				name: "Size",
    				min: 0,
    				max: 500,
    				v: /*cSAvg*/ ctx[13],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	slider0.$on("updateValue", /*updateSizeAll*/ ctx[26]);

    	unitinput0 = new UnitInput({
    			props: {
    				name: "Width",
    				usePercent: true,
    				v: /*cW*/ ctx[1],
    				currentUnit: /*cWu*/ ctx[11],
    				hasMargin: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput0.$on("updateValue", /*updateWidth*/ ctx[24]);

    	unitinput1 = new UnitInput({
    			props: {
    				name: "Height",
    				usePercent: true,
    				v: /*cH*/ ctx[2],
    				currentUnit: /*cHu*/ ctx[12],
    				hasMargin: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput1.$on("updateValue", /*updateHeight*/ ctx[25]);

    	slider1 = new Slider({
    			props: {
    				name: "Margin",
    				min: 0,
    				max: 200,
    				v: /*cMAvg*/ ctx[18],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	slider1.$on("updateValue", /*updateMarginAll*/ ctx[28]);

    	unitinput2 = new UnitInput({
    			props: {
    				name: "Top",
    				v: /*cMT*/ ctx[3],
    				currentUnit: /*cMTu*/ ctx[14],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput2.$on("updateValue", /*updateValue_handler*/ ctx[35]);

    	unitinput3 = new UnitInput({
    			props: {
    				name: "Right",
    				v: /*cMR*/ ctx[4],
    				currentUnit: /*cMRu*/ ctx[15],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput3.$on("updateValue", /*updateValue_handler_1*/ ctx[36]);

    	unitinput4 = new UnitInput({
    			props: {
    				name: "Bottom",
    				v: /*cMB*/ ctx[5],
    				currentUnit: /*cMBu*/ ctx[16],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput4.$on("updateValue", /*updateValue_handler_2*/ ctx[37]);

    	unitinput5 = new UnitInput({
    			props: {
    				name: "Left",
    				v: /*cML*/ ctx[6],
    				currentUnit: /*cMLu*/ ctx[17],
    				hasMargin: false,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput5.$on("updateValue", /*updateValue_handler_3*/ ctx[38]);

    	slider2 = new Slider({
    			props: {
    				name: "Padding",
    				min: 0,
    				max: 100,
    				v: /*cPAvg*/ ctx[23],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	slider2.$on("updateValue", /*updatePaddingAll*/ ctx[30]);

    	unitinput6 = new UnitInput({
    			props: {
    				name: "Top",
    				v: /*cPT*/ ctx[7],
    				currentUnit: /*cPTu*/ ctx[19],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput6.$on("updateValue", /*updateValue_handler_4*/ ctx[39]);

    	unitinput7 = new UnitInput({
    			props: {
    				name: "Right",
    				v: /*cPR*/ ctx[8],
    				currentUnit: /*cPRu*/ ctx[20],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput7.$on("updateValue", /*updateValue_handler_5*/ ctx[40]);

    	unitinput8 = new UnitInput({
    			props: {
    				name: "Bottom",
    				v: /*cPB*/ ctx[9],
    				currentUnit: /*cPBu*/ ctx[21],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput8.$on("updateValue", /*updateValue_handler_6*/ ctx[41]);

    	unitinput9 = new UnitInput({
    			props: {
    				name: "Left",
    				v: /*cPL*/ ctx[10],
    				currentUnit: /*cPLu*/ ctx[22],
    				hasMargin: false,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput9.$on("updateValue", /*updateValue_handler_7*/ ctx[42]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Bounding Box";
    			t1 = space();
    			section0 = element("section");
    			create_component(slider0.$$.fragment);
    			t2 = space();
    			create_component(unitinput0.$$.fragment);
    			t3 = space();
    			create_component(unitinput1.$$.fragment);
    			t4 = space();
    			section1 = element("section");
    			create_component(slider1.$$.fragment);
    			t5 = space();
    			create_component(unitinput2.$$.fragment);
    			t6 = space();
    			create_component(unitinput3.$$.fragment);
    			t7 = space();
    			create_component(unitinput4.$$.fragment);
    			t8 = space();
    			create_component(unitinput5.$$.fragment);
    			t9 = space();
    			section2 = element("section");
    			create_component(slider2.$$.fragment);
    			t10 = space();
    			create_component(unitinput6.$$.fragment);
    			t11 = space();
    			create_component(unitinput7.$$.fragment);
    			t12 = space();
    			create_component(unitinput8.$$.fragment);
    			t13 = space();
    			create_component(unitinput9.$$.fragment);
    			attr_dev(h1, "class", "svelte-616oii");
    			add_location(h1, file$r, 173, 4, 8341);
    			attr_dev(section0, "class", "svelte-616oii");
    			add_location(section0, file$r, 176, 4, 8396);
    			attr_dev(section1, "class", "svelte-616oii");
    			add_location(section1, file$r, 183, 4, 8863);
    			attr_dev(section2, "class", "svelte-616oii");
    			add_location(section2, file$r, 192, 4, 9749);
    			attr_dev(main, "class", "svelte-616oii");
    			add_location(main, file$r, 171, 0, 8297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, section0);
    			mount_component(slider0, section0, null);
    			append_dev(section0, t2);
    			mount_component(unitinput0, section0, null);
    			append_dev(section0, t3);
    			mount_component(unitinput1, section0, null);
    			append_dev(main, t4);
    			append_dev(main, section1);
    			mount_component(slider1, section1, null);
    			append_dev(section1, t5);
    			mount_component(unitinput2, section1, null);
    			append_dev(section1, t6);
    			mount_component(unitinput3, section1, null);
    			append_dev(section1, t7);
    			mount_component(unitinput4, section1, null);
    			append_dev(section1, t8);
    			mount_component(unitinput5, section1, null);
    			append_dev(main, t9);
    			append_dev(main, section2);
    			mount_component(slider2, section2, null);
    			append_dev(section2, t10);
    			mount_component(unitinput6, section2, null);
    			append_dev(section2, t11);
    			mount_component(unitinput7, section2, null);
    			append_dev(section2, t12);
    			mount_component(unitinput8, section2, null);
    			append_dev(section2, t13);
    			mount_component(unitinput9, section2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};
    			if (dirty[0] & /*cSAvg*/ 8192) slider0_changes.v = /*cSAvg*/ ctx[13];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider0_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			slider0.$set(slider0_changes);
    			const unitinput0_changes = {};
    			if (dirty[0] & /*cW*/ 2) unitinput0_changes.v = /*cW*/ ctx[1];
    			if (dirty[0] & /*cWu*/ 2048) unitinput0_changes.currentUnit = /*cWu*/ ctx[11];
    			unitinput0.$set(unitinput0_changes);
    			const unitinput1_changes = {};
    			if (dirty[0] & /*cH*/ 4) unitinput1_changes.v = /*cH*/ ctx[2];
    			if (dirty[0] & /*cHu*/ 4096) unitinput1_changes.currentUnit = /*cHu*/ ctx[12];
    			unitinput1.$set(unitinput1_changes);
    			const slider1_changes = {};
    			if (dirty[0] & /*cMAvg*/ 262144) slider1_changes.v = /*cMAvg*/ ctx[18];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider1_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			slider1.$set(slider1_changes);
    			const unitinput2_changes = {};
    			if (dirty[0] & /*cMT*/ 8) unitinput2_changes.v = /*cMT*/ ctx[3];
    			if (dirty[0] & /*cMTu*/ 16384) unitinput2_changes.currentUnit = /*cMTu*/ ctx[14];
    			unitinput2.$set(unitinput2_changes);
    			const unitinput3_changes = {};
    			if (dirty[0] & /*cMR*/ 16) unitinput3_changes.v = /*cMR*/ ctx[4];
    			if (dirty[0] & /*cMRu*/ 32768) unitinput3_changes.currentUnit = /*cMRu*/ ctx[15];
    			unitinput3.$set(unitinput3_changes);
    			const unitinput4_changes = {};
    			if (dirty[0] & /*cMB*/ 32) unitinput4_changes.v = /*cMB*/ ctx[5];
    			if (dirty[0] & /*cMBu*/ 65536) unitinput4_changes.currentUnit = /*cMBu*/ ctx[16];
    			unitinput4.$set(unitinput4_changes);
    			const unitinput5_changes = {};
    			if (dirty[0] & /*cML*/ 64) unitinput5_changes.v = /*cML*/ ctx[6];
    			if (dirty[0] & /*cMLu*/ 131072) unitinput5_changes.currentUnit = /*cMLu*/ ctx[17];
    			unitinput5.$set(unitinput5_changes);
    			const slider2_changes = {};
    			if (dirty[0] & /*cPAvg*/ 8388608) slider2_changes.v = /*cPAvg*/ ctx[23];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider2_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			slider2.$set(slider2_changes);
    			const unitinput6_changes = {};
    			if (dirty[0] & /*cPT*/ 128) unitinput6_changes.v = /*cPT*/ ctx[7];
    			if (dirty[0] & /*cPTu*/ 524288) unitinput6_changes.currentUnit = /*cPTu*/ ctx[19];
    			unitinput6.$set(unitinput6_changes);
    			const unitinput7_changes = {};
    			if (dirty[0] & /*cPR*/ 256) unitinput7_changes.v = /*cPR*/ ctx[8];
    			if (dirty[0] & /*cPRu*/ 1048576) unitinput7_changes.currentUnit = /*cPRu*/ ctx[20];
    			unitinput7.$set(unitinput7_changes);
    			const unitinput8_changes = {};
    			if (dirty[0] & /*cPB*/ 512) unitinput8_changes.v = /*cPB*/ ctx[9];
    			if (dirty[0] & /*cPBu*/ 2097152) unitinput8_changes.currentUnit = /*cPBu*/ ctx[21];
    			unitinput8.$set(unitinput8_changes);
    			const unitinput9_changes = {};
    			if (dirty[0] & /*cPL*/ 1024) unitinput9_changes.v = /*cPL*/ ctx[10];
    			if (dirty[0] & /*cPLu*/ 4194304) unitinput9_changes.currentUnit = /*cPLu*/ ctx[22];
    			unitinput9.$set(unitinput9_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(unitinput0.$$.fragment, local);
    			transition_in(unitinput1.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(unitinput2.$$.fragment, local);
    			transition_in(unitinput3.$$.fragment, local);
    			transition_in(unitinput4.$$.fragment, local);
    			transition_in(unitinput5.$$.fragment, local);
    			transition_in(slider2.$$.fragment, local);
    			transition_in(unitinput6.$$.fragment, local);
    			transition_in(unitinput7.$$.fragment, local);
    			transition_in(unitinput8.$$.fragment, local);
    			transition_in(unitinput9.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(unitinput0.$$.fragment, local);
    			transition_out(unitinput1.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(unitinput2.$$.fragment, local);
    			transition_out(unitinput3.$$.fragment, local);
    			transition_out(unitinput4.$$.fragment, local);
    			transition_out(unitinput5.$$.fragment, local);
    			transition_out(slider2.$$.fragment, local);
    			transition_out(unitinput6.$$.fragment, local);
    			transition_out(unitinput7.$$.fragment, local);
    			transition_out(unitinput8.$$.fragment, local);
    			transition_out(unitinput9.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(slider0);
    			destroy_component(unitinput0);
    			destroy_component(unitinput1);
    			destroy_component(slider1);
    			destroy_component(unitinput2);
    			destroy_component(unitinput3);
    			destroy_component(unitinput4);
    			destroy_component(unitinput5);
    			destroy_component(slider2);
    			destroy_component(unitinput6);
    			destroy_component(unitinput7);
    			destroy_component(unitinput8);
    			destroy_component(unitinput9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$r.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$r($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let $selectedComponent;
    	let $collection;
    	let $selectedOverride;
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(32, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(33, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(34, $selectedOverride = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BoundingBoxEditor', slots, []);
    	let { currentParentWidth = 360 } = $$props;
    	let cW = 100;
    	let cWu = "px";
    	let cH = 100;
    	let cHu = "px";
    	let cSAvg = 100;
    	let cSAvgu = "px";
    	let cMT = 0;
    	let cMTu = "px";
    	let cMR = 0;
    	let cMRu = "px";
    	let cMB = 0;
    	let cMBu = "px";
    	let cML = 0;
    	let cMLu = "px";
    	let cMAvg = 0;
    	let cPT = 0;
    	let cPTu = "px";
    	let cPR = 0;
    	let cPRu = "px";
    	let cPB = 0;
    	let cPBu = "px";
    	let cPL = 0;
    	let cPLu = "px";
    	let cPAvg = 0;

    	const updateWidth = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["width"] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		}
    	};

    	const updateHeight = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["height"] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		}
    	};

    	const updateSizeAll = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v = evt.detail.v, $collection);

    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"].v = evt.detail.v, $collection);
    		} else {
    			if (!!$collection[$selectedComponent].style["width"]) set_store_value(collection, $collection[$selectedComponent].style["width"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].style["height"]) set_store_value(collection, $collection[$selectedComponent].style["height"].v = evt.detail.v, $collection);
    		}
    	};

    	const updateMargin = (evt, direction) => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`margin${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`margin${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		}
    	};

    	const updateMarginAll = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginTop"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginTop"].v = evt.detail.v, $collection);

    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginRight"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginRight"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginBottom"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginBottom"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginLeft"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginLeft"].v = evt.detail.v, $collection);
    		} else {
    			if (!!$collection[$selectedComponent].style["marginTop"]) set_store_value(collection, $collection[$selectedComponent].style["marginTop"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].style["marginRight"]) set_store_value(collection, $collection[$selectedComponent].style["marginRight"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].style["marginBottom"]) set_store_value(collection, $collection[$selectedComponent].style["marginBottom"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].style["marginLeft"]) set_store_value(collection, $collection[$selectedComponent].style["marginLeft"].v = evt.detail.v, $collection);
    		}
    	};

    	const updatePadding = (evt, direction) => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`padding${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`padding${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		}
    	};

    	const updatePaddingAll = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingTop"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingTop"].v = evt.detail.v, $collection);

    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingRight"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingRight"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingBottom"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingBottom"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingLeft"]) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["paddingLeft"].v = evt.detail.v, $collection);
    		} else {
    			if (!!$collection[$selectedComponent].style["paddingTop"]) set_store_value(collection, $collection[$selectedComponent].style["paddingTop"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].style["paddingRight"]) set_store_value(collection, $collection[$selectedComponent].style["paddingRight"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].style["paddingBottom"]) set_store_value(collection, $collection[$selectedComponent].style["paddingBottom"].v = evt.detail.v, $collection);
    			if (!!$collection[$selectedComponent].style["paddingLeft"]) set_store_value(collection, $collection[$selectedComponent].style["paddingLeft"].v = evt.detail.v, $collection);
    		}
    	};

    	const writable_props = ['currentParentWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BoundingBoxEditor> was created with unknown prop '${key}'`);
    	});

    	const updateValue_handler = evt => updateMargin(evt, "Top");
    	const updateValue_handler_1 = evt => updateMargin(evt, "Right");
    	const updateValue_handler_2 = evt => updateMargin(evt, "Bottom");
    	const updateValue_handler_3 = evt => updateMargin(evt, "Left");
    	const updateValue_handler_4 = evt => updatePadding(evt, "Top");
    	const updateValue_handler_5 = evt => updatePadding(evt, "Right");
    	const updateValue_handler_6 = evt => updatePadding(evt, "Bottom");
    	const updateValue_handler_7 = evt => updatePadding(evt, "Left");

    	$$self.$$set = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		Slider,
    		UnitInput,
    		currentParentWidth,
    		cW,
    		cWu,
    		cH,
    		cHu,
    		cSAvg,
    		cSAvgu,
    		cMT,
    		cMTu,
    		cMR,
    		cMRu,
    		cMB,
    		cMBu,
    		cML,
    		cMLu,
    		cMAvg,
    		cPT,
    		cPTu,
    		cPR,
    		cPRu,
    		cPB,
    		cPBu,
    		cPL,
    		cPLu,
    		cPAvg,
    		updateWidth,
    		updateHeight,
    		updateSizeAll,
    		updateMargin,
    		updateMarginAll,
    		updatePadding,
    		updatePaddingAll,
    		currentStyle,
    		$selectedComponent,
    		$collection,
    		$selectedOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    		if ('cW' in $$props) $$invalidate(1, cW = $$props.cW);
    		if ('cWu' in $$props) $$invalidate(11, cWu = $$props.cWu);
    		if ('cH' in $$props) $$invalidate(2, cH = $$props.cH);
    		if ('cHu' in $$props) $$invalidate(12, cHu = $$props.cHu);
    		if ('cSAvg' in $$props) $$invalidate(13, cSAvg = $$props.cSAvg);
    		if ('cSAvgu' in $$props) cSAvgu = $$props.cSAvgu;
    		if ('cMT' in $$props) $$invalidate(3, cMT = $$props.cMT);
    		if ('cMTu' in $$props) $$invalidate(14, cMTu = $$props.cMTu);
    		if ('cMR' in $$props) $$invalidate(4, cMR = $$props.cMR);
    		if ('cMRu' in $$props) $$invalidate(15, cMRu = $$props.cMRu);
    		if ('cMB' in $$props) $$invalidate(5, cMB = $$props.cMB);
    		if ('cMBu' in $$props) $$invalidate(16, cMBu = $$props.cMBu);
    		if ('cML' in $$props) $$invalidate(6, cML = $$props.cML);
    		if ('cMLu' in $$props) $$invalidate(17, cMLu = $$props.cMLu);
    		if ('cMAvg' in $$props) $$invalidate(18, cMAvg = $$props.cMAvg);
    		if ('cPT' in $$props) $$invalidate(7, cPT = $$props.cPT);
    		if ('cPTu' in $$props) $$invalidate(19, cPTu = $$props.cPTu);
    		if ('cPR' in $$props) $$invalidate(8, cPR = $$props.cPR);
    		if ('cPRu' in $$props) $$invalidate(20, cPRu = $$props.cPRu);
    		if ('cPB' in $$props) $$invalidate(9, cPB = $$props.cPB);
    		if ('cPBu' in $$props) $$invalidate(21, cPBu = $$props.cPBu);
    		if ('cPL' in $$props) $$invalidate(10, cPL = $$props.cPL);
    		if ('cPLu' in $$props) $$invalidate(22, cPLu = $$props.cPLu);
    		if ('cPAvg' in $$props) $$invalidate(23, cPAvg = $$props.cPAvg);
    		if ('currentStyle' in $$props) $$invalidate(31, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*$selectedOverride, $collection, $selectedComponent*/ 14) {
    			// reactive
    			$$invalidate(31, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty[0] & /*cW, cH, cMT, cMR, cMB, cML, cPT, cPR, cPB, cPL*/ 2046 | $$self.$$.dirty[1] & /*currentStyle*/ 1) {
    			if (!!currentStyle) {
    				// these variables just make the code look nicer
    				// size
    				if (!currentStyle["width"]) $$invalidate(31, currentStyle["width"] = { v: 100, u: "px" }, currentStyle);

    				$$invalidate(1, cW = currentStyle["width"].v);
    				$$invalidate(11, cWu = currentStyle["width"].u);
    				if (!currentStyle["height"]) $$invalidate(31, currentStyle["height"] = { v: 100, u: "px" }, currentStyle);
    				$$invalidate(2, cH = currentStyle["height"].v);
    				$$invalidate(12, cHu = currentStyle["height"].u);
    				$$invalidate(13, cSAvg = (cW + cH) / 2);

    				// margin
    				if (!currentStyle["marginTop"]) $$invalidate(31, currentStyle["marginTop"] = { v: 0, u: "px" }, currentStyle);

    				$$invalidate(3, cMT = currentStyle["marginTop"].v);
    				$$invalidate(14, cMTu = currentStyle["marginTop"].u);
    				if (!currentStyle["marginRight"]) $$invalidate(31, currentStyle["marginRight"] = { v: 0, u: "px" }, currentStyle);
    				$$invalidate(4, cMR = currentStyle["marginRight"].v);
    				$$invalidate(15, cMRu = currentStyle["marginRight"].u);
    				if (!currentStyle["marginBottom"]) $$invalidate(31, currentStyle["marginBottom"] = { v: 0, u: "px" }, currentStyle);
    				$$invalidate(5, cMB = currentStyle["marginBottom"].v);
    				$$invalidate(16, cMBu = currentStyle["marginBottom"].u);
    				if (!currentStyle["marginLeft"]) $$invalidate(31, currentStyle["marginLeft"] = { v: 0, u: "px" }, currentStyle);
    				$$invalidate(6, cML = currentStyle["marginLeft"].v);
    				$$invalidate(17, cMLu = currentStyle["marginLeft"].u);
    				$$invalidate(18, cMAvg = (cMT + cMR + cMB + cML) / 4);

    				// padding
    				if (!currentStyle["paddingTop"]) $$invalidate(31, currentStyle["paddingTop"] = { v: 0, u: "px" }, currentStyle);

    				$$invalidate(7, cPT = currentStyle["paddingTop"].v);
    				$$invalidate(19, cPTu = currentStyle["paddingTop"].u);
    				if (!currentStyle["paddingRight"]) $$invalidate(31, currentStyle["paddingRight"] = { v: 0, u: "px" }, currentStyle);
    				$$invalidate(8, cPR = currentStyle["paddingRight"].v);
    				$$invalidate(20, cPRu = currentStyle["paddingRight"].u);
    				if (!currentStyle["paddingBottom"]) $$invalidate(31, currentStyle["paddingBottom"] = { v: 0, u: "px" }, currentStyle);
    				$$invalidate(9, cPB = currentStyle["paddingBottom"].v);
    				$$invalidate(21, cPBu = currentStyle["paddingBottom"].u);
    				if (!currentStyle["paddingLeft"]) $$invalidate(31, currentStyle["paddingLeft"] = { v: 0, u: "px" }, currentStyle);
    				$$invalidate(10, cPL = currentStyle["paddingLeft"].v);
    				$$invalidate(22, cPLu = currentStyle["paddingLeft"].u);
    				$$invalidate(23, cPAvg = (cPT + cPR + cPB + cPL) / 4);
    			}
    		}
    	};

    	return [
    		currentParentWidth,
    		cW,
    		cH,
    		cMT,
    		cMR,
    		cMB,
    		cML,
    		cPT,
    		cPR,
    		cPB,
    		cPL,
    		cWu,
    		cHu,
    		cSAvg,
    		cMTu,
    		cMRu,
    		cMBu,
    		cMLu,
    		cMAvg,
    		cPTu,
    		cPRu,
    		cPBu,
    		cPLu,
    		cPAvg,
    		updateWidth,
    		updateHeight,
    		updateSizeAll,
    		updateMargin,
    		updateMarginAll,
    		updatePadding,
    		updatePaddingAll,
    		currentStyle,
    		$selectedComponent,
    		$collection,
    		$selectedOverride,
    		updateValue_handler,
    		updateValue_handler_1,
    		updateValue_handler_2,
    		updateValue_handler_3,
    		updateValue_handler_4,
    		updateValue_handler_5,
    		updateValue_handler_6,
    		updateValue_handler_7
    	];
    }

    class BoundingBoxEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$r, create_fragment$r, safe_not_equal, { currentParentWidth: 0 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BoundingBoxEditor",
    			options,
    			id: create_fragment$r.name
    		});
    	}

    	get currentParentWidth() {
    		throw new Error("<BoundingBoxEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParentWidth(value) {
    		throw new Error("<BoundingBoxEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/ValueStrInput.svelte generated by Svelte v3.48.0 */
    const file$q = "src/components/ctrlMenuItems/StyleEditors/Basics/ValueStrInput.svelte";

    function create_fragment$q(ctx) {
    	let main;
    	let title;
    	let t;
    	let input;
    	let input_style_value;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[1],
    				sub: /*sub*/ ctx[5],
    				align: /*alignTitle*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t = space();
    			input = element("input");
    			attr_dev(input, "style", input_style_value = `text-align: ${/*align*/ ctx[6]}`);
    			attr_dev(input, "placeholder", /*placeHolder*/ ctx[8]);
    			attr_dev(input, "class", "svelte-qtvwjf");
    			add_location(input, file$q, 50, 4, 1533);

    			attr_dev(main, "style", main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`);

    			attr_dev(main, "class", "svelte-qtvwjf");
    			add_location(main, file$q, 47, 0, 1312);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t);
    			append_dev(main, input);
    			/*input_binding*/ ctx[16](input);
    			set_input_value(input, /*v*/ ctx[0]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[17]),
    					listen_dev(input, "keydown", /*checkEnterPress*/ ctx[12], false, false, false),
    					listen_dev(input, "blur", /*preventNullV*/ ctx[11], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 2) title_changes.name = /*name*/ ctx[1];
    			if (dirty & /*sub*/ 32) title_changes.sub = /*sub*/ ctx[5];
    			if (dirty & /*alignTitle*/ 128) title_changes.align = /*alignTitle*/ ctx[7];
    			title.$set(title_changes);

    			if (!current || dirty & /*align*/ 64 && input_style_value !== (input_style_value = `text-align: ${/*align*/ ctx[6]}`)) {
    				attr_dev(input, "style", input_style_value);
    			}

    			if (!current || dirty & /*placeHolder*/ 256) {
    				attr_dev(input, "placeholder", /*placeHolder*/ ctx[8]);
    			}

    			if (dirty & /*v*/ 1 && input.value !== /*v*/ ctx[0]) {
    				set_input_value(input, /*v*/ ctx[0]);
    			}

    			if (!current || dirty & /*hasMargin, maxWidth, minWidth*/ 28 && main_style_value !== (main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			/*input_binding*/ ctx[16](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$q.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$q($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ValueStrInput', slots, []);
    	let { name } = $$props;
    	let { v } = $$props;
    	let { hasMargin } = $$props;
    	let { maxWidth = "" } = $$props;
    	let { minWidth = "" } = $$props;
    	let { sub } = $$props;
    	let { charLim = -1 } = $$props;
    	let { align = "left" } = $$props;
    	let { alignTitle = align } = $$props;
    	let { placeHolder = "" } = $$props;
    	let { allowedCharRegex = /^[a-zA-Z0-9]$/ } = $$props;
    	const disp = createEventDispatcher();
    	let valueInputField;
    	let dispatchLocked = true;

    	const preventNullV = () => {
    		if (!v) $$invalidate(0, v = "");
    		$$invalidate(15, dispatchLocked = true);
    		disp("blurred");
    	};

    	const checkEnterPress = e => {
    		$$invalidate(15, dispatchLocked = false);

    		if (e.key === "Enter" || e.key === "Escape" || e.key === "Escape") {
    			e.preventDefault();
    			valueInputField.blur();
    			return;
    		}
    	};

    	const writable_props = [
    		'name',
    		'v',
    		'hasMargin',
    		'maxWidth',
    		'minWidth',
    		'sub',
    		'charLim',
    		'align',
    		'alignTitle',
    		'placeHolder',
    		'allowedCharRegex'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ValueStrInput> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			valueInputField = $$value;
    			$$invalidate(9, valueInputField);
    		});
    	}

    	function input_input_handler() {
    		v = this.value;
    		((($$invalidate(0, v), $$invalidate(15, dispatchLocked)), $$invalidate(14, allowedCharRegex)), $$invalidate(13, charLim));
    	}

    	const focus_handler = () => disp("focused");

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(5, sub = $$props.sub);
    		if ('charLim' in $$props) $$invalidate(13, charLim = $$props.charLim);
    		if ('align' in $$props) $$invalidate(6, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(7, alignTitle = $$props.alignTitle);
    		if ('placeHolder' in $$props) $$invalidate(8, placeHolder = $$props.placeHolder);
    		if ('allowedCharRegex' in $$props) $$invalidate(14, allowedCharRegex = $$props.allowedCharRegex);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		v,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		sub,
    		charLim,
    		align,
    		alignTitle,
    		placeHolder,
    		allowedCharRegex,
    		createEventDispatcher,
    		Title,
    		disp,
    		valueInputField,
    		dispatchLocked,
    		preventNullV,
    		checkEnterPress
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(5, sub = $$props.sub);
    		if ('charLim' in $$props) $$invalidate(13, charLim = $$props.charLim);
    		if ('align' in $$props) $$invalidate(6, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(7, alignTitle = $$props.alignTitle);
    		if ('placeHolder' in $$props) $$invalidate(8, placeHolder = $$props.placeHolder);
    		if ('allowedCharRegex' in $$props) $$invalidate(14, allowedCharRegex = $$props.allowedCharRegex);
    		if ('valueInputField' in $$props) $$invalidate(9, valueInputField = $$props.valueInputField);
    		if ('dispatchLocked' in $$props) $$invalidate(15, dispatchLocked = $$props.dispatchLocked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*v, dispatchLocked, allowedCharRegex, charLim*/ 57345) {
    			// dispatch value changes if v changes
    			if (v !== null && !dispatchLocked) {
    				// do not send null
    				// clean up V according to regex 
    				for (let i = v.length - 1; i > -1; i--) {
    					// check if regex matches. If not, remove character
    					if (!allowedCharRegex.test(v[i])) $$invalidate(0, v = v.substring(0, i) + v.substring(i + 1, v.length));
    				}

    				// get substring if charLim exists
    				if (charLim !== -1) $$invalidate(0, v = v.substring(0, charLim));

    				disp("updateValue", { v });
    			}
    		}
    	};

    	return [
    		v,
    		name,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		sub,
    		align,
    		alignTitle,
    		placeHolder,
    		valueInputField,
    		disp,
    		preventNullV,
    		checkEnterPress,
    		charLim,
    		allowedCharRegex,
    		dispatchLocked,
    		input_binding,
    		input_input_handler,
    		focus_handler
    	];
    }

    class ValueStrInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$q, create_fragment$q, safe_not_equal, {
    			name: 1,
    			v: 0,
    			hasMargin: 2,
    			maxWidth: 3,
    			minWidth: 4,
    			sub: 5,
    			charLim: 13,
    			align: 6,
    			alignTitle: 7,
    			placeHolder: 8,
    			allowedCharRegex: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ValueStrInput",
    			options,
    			id: create_fragment$q.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<ValueStrInput> was created without expected prop 'name'");
    		}

    		if (/*v*/ ctx[0] === undefined && !('v' in props)) {
    			console.warn("<ValueStrInput> was created without expected prop 'v'");
    		}

    		if (/*hasMargin*/ ctx[2] === undefined && !('hasMargin' in props)) {
    			console.warn("<ValueStrInput> was created without expected prop 'hasMargin'");
    		}

    		if (/*sub*/ ctx[5] === undefined && !('sub' in props)) {
    			console.warn("<ValueStrInput> was created without expected prop 'sub'");
    		}
    	}

    	get name() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charLim() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charLim(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignTitle() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignTitle(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeHolder() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeHolder(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allowedCharRegex() {
    		throw new Error("<ValueStrInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allowedCharRegex(value) {
    		throw new Error("<ValueStrInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and l in the set [0, 1].
     */
    const rgbToHsl = (r, g, b) => {
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0; // achromatic
        }
        else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        // return calculated HSL value
        return [Math.min(Math.floor(h * 360), 360), Math.min(Math.floor(s * 100), 100), Math.min(Math.floor(l * 100), 100)];
    };
    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     */
    const hslToRgb = (h, s, l) => {
        // normalize hsl
        h /= 360, s /= 100, l /= 100;
        let r, g, b;
        if (s == 0) {
            r = g = b = l; // achromatic
        }
        else {
            let hue2rgb = function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.min(Math.floor(r * 256), 255), Math.min(Math.floor(g * 256), 255), Math.min(Math.floor(b * 256), 255)];
    };
    const rgbaToHex = (r, g, b, a) => {
        const colorToHex = (color) => {
            let hexadecimal = color.toString(16);
            return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
        };
        a *= 255 / 100;
        return colorToHex(r) + colorToHex(g) + colorToHex(b) + (Math.round(a) === 255 ? "" : colorToHex(Math.round(a))); // always return an 8 form hex
    };
    const hexToRgba = (hex) => {
        // detect hex type
        if (hex.length === 3) { // 3 form hex: 1 letter per color channel and no alpha channel
            return [parseInt(hex[0], 16) / 15 * 255, parseInt(hex[1], 16) / 15 * 255, parseInt(hex[2], 16) / 15 * 255, 100];
        }
        else if (hex.length === 4) { // 4 form hex: 1 letter per channel
            return [parseInt(hex[0], 16) / 15 * 255, parseInt(hex[1], 16) / 15 * 255, parseInt(hex[2], 16) / 15 * 255, parseInt(hex[3], 16) / 15 * 100];
        }
        else if (hex.length == 6) { // 6 form hex: 2 letters per color channel and no alpha channel
            return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16), 100];
        }
        else if (hex.length == 8) { // 8 form hex: 2 letter per channel
            return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16), Math.round(parseInt(hex.substring(6, 8), 16))];
        }
    };

    /* src/components/ctrlMenuItems/StyleEditors/Advanced/ColorPickerOverlay.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1$1 } = globals;
    const file$p = "src/components/ctrlMenuItems/StyleEditors/Advanced/ColorPickerOverlay.svelte";

    function create_fragment$p(ctx) {
    	let section0;
    	let h6;
    	let t0;
    	let t1;
    	let section1;
    	let valueinput0;
    	let t2;
    	let valueinput1;
    	let t3;
    	let valueinput2;
    	let t4;
    	let valueinput3;
    	let t5;
    	let div0;
    	let div0_title_value;
    	let section1_style_value;
    	let t6;
    	let main;
    	let div4;
    	let div1;
    	let div1_style_value;
    	let t7;
    	let div2;
    	let t8;
    	let div3;
    	let div3_style_value;
    	let t9;
    	let div6;
    	let div5;
    	let div5_style_value;
    	let t10;
    	let div8;
    	let section2;
    	let section2_style_value;
    	let t11;
    	let div7;
    	let div7_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	valueinput0 = new ValueInput({
    			props: {
    				name: /*hslMode*/ ctx[12] ? "Hue" : "Red",
    				v: /*hslMode*/ ctx[12] ? /*hue*/ ctx[8] : /*red*/ ctx[11],
    				hasMargin: true,
    				sub: true,
    				maxVal: /*hslMode*/ ctx[12] ? 360 : 255,
    				align: "center",
    				textClrOverride: /*currentColorModeTextClr*/ ctx[13]
    			},
    			$$inline: true
    		});

    	valueinput0.$on("updateValue", /*updateValue_handler*/ ctx[29]);

    	valueinput1 = new ValueInput({
    			props: {
    				name: /*hslMode*/ ctx[12] ? "Sat" : "Green",
    				v: /*hslMode*/ ctx[12] ? /*sat*/ ctx[7] : /*green*/ ctx[10],
    				hasMargin: true,
    				sub: true,
    				maxVal: /*hslMode*/ ctx[12] ? 100 : 255,
    				align: "center",
    				textClrOverride: /*currentColorModeTextClr*/ ctx[13]
    			},
    			$$inline: true
    		});

    	valueinput1.$on("updateValue", /*updateValue_handler_1*/ ctx[30]);

    	valueinput2 = new ValueInput({
    			props: {
    				name: /*hslMode*/ ctx[12] ? "Lum" : "Blue",
    				v: /*hslMode*/ ctx[12] ? /*lum*/ ctx[6] : /*blue*/ ctx[9],
    				hasMargin: true,
    				sub: true,
    				maxVal: /*hslMode*/ ctx[12] ? 100 : 255,
    				align: "center",
    				textClrOverride: /*currentColorModeTextClr*/ ctx[13]
    			},
    			$$inline: true
    		});

    	valueinput2.$on("updateValue", /*updateValue_handler_2*/ ctx[31]);

    	valueinput3 = new ValueInput({
    			props: {
    				name: "Alpha",
    				v: /*alpha*/ ctx[5],
    				hasMargin: false,
    				sub: true,
    				maxVal: 100,
    				align: "center"
    			},
    			$$inline: true
    		});

    	valueinput3.$on("updateValue", /*updateValue_handler_3*/ ctx[32]);

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			h6 = element("h6");
    			t0 = text(/*name*/ ctx[19]);
    			t1 = space();
    			section1 = element("section");
    			create_component(valueinput0.$$.fragment);
    			t2 = space();
    			create_component(valueinput1.$$.fragment);
    			t3 = space();
    			create_component(valueinput2.$$.fragment);
    			t4 = space();
    			create_component(valueinput3.$$.fragment);
    			t5 = space();
    			div0 = element("div");
    			t6 = space();
    			main = element("main");
    			div4 = element("div");
    			div1 = element("div");
    			t7 = space();
    			div2 = element("div");
    			t8 = space();
    			div3 = element("div");
    			t9 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t10 = space();
    			div8 = element("div");
    			section2 = element("section");
    			t11 = space();
    			div7 = element("div");
    			attr_dev(h6, "class", "svelte-1258gx2");
    			add_location(h6, file$p, 481, 4, 20104);
    			attr_dev(section0, "id", "snapped-title-container");
    			attr_dev(section0, "class", "hidden svelte-1258gx2");
    			attr_dev(section0, "style", `transform: translate3d(0px, -${128 + titleHeight$1}px, 0px)`);
    			add_location(section0, file$p, 478, 0, 19941);
    			attr_dev(div0, "id", "hsl-rgb-switcher");

    			attr_dev(div0, "title", div0_title_value = `Switch to ${!!/*colorRef*/ ctx[0]
			? /*colorRef*/ ctx[0].type === "rgb" ? "HSL" : "RGB"
			: "HSL"} mode`);

    			attr_dev(div0, "class", "svelte-1258gx2");
    			add_location(div0, file$p, 507, 4, 21395);
    			attr_dev(section1, "id", "inline-hsl-container");
    			attr_dev(section1, "class", "hidden svelte-1258gx2");

    			attr_dev(section1, "style", section1_style_value = `transform: translate3d(0px, ${67.5 + (!!/*$mainOverlayData*/ ctx[20].dragLocked
			? titleHeight$1
			: 0) + inlineHSLHeight - targetYOffset$1}px, 0px)`);

    			add_location(section1, file$p, 484, 0, 20132);
    			attr_dev(div1, "class", "grad svelte-1258gx2");
    			attr_dev(div1, "id", "sat-grad");

    			attr_dev(div1, "style", div1_style_value = `
            background-image: linear-gradient(90deg, hsl(0,0%,50%) 0%, hsl(${/*hue*/ ctx[8]}deg,100%,50%) 100%);
        `);

    			add_location(div1, file$p, 515, 8, 21925);
    			attr_dev(div2, "class", "grad svelte-1258gx2");
    			attr_dev(div2, "id", "lum-grad");
    			add_location(div2, file$p, 518, 8, 22094);
    			attr_dev(div3, "class", "knob outlined-knob svelte-1258gx2");

    			attr_dev(div3, "style", div3_style_value = `
            background-color: hsl(${/*hue*/ ctx[8]}deg, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%);
            transform: translate3d(${/*cubeOffsetX*/ ctx[17]}px, ${/*cubeOffsetY*/ ctx[18]}px, 0px)
        `);

    			add_location(div3, file$p, 520, 8, 22146);
    			attr_dev(div4, "id", "color-gradient");
    			attr_dev(div4, "class", "svelte-1258gx2");
    			add_location(div4, file$p, 514, 4, 21841);
    			attr_dev(div5, "class", "knob outlined-knob svelte-1258gx2");

    			attr_dev(div5, "style", div5_style_value = `
            background-color: hsl(${/*hue*/ ctx[8]}deg, 100%, 50%);
            transform: translate3d(${/*hueKnobOffset*/ ctx[15]}px, 0px, 0px)
        `);

    			add_location(div5, file$p, 528, 8, 22511);
    			attr_dev(div6, "class", "color-slider svelte-1258gx2");
    			attr_dev(div6, "id", "hue-slider");
    			add_location(div6, file$p, 527, 4, 22410);
    			attr_dev(section2, "style", section2_style_value = `background: linear-gradient(to right, hsla(${/*hue*/ ctx[8]}, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%, 0%) 0%, hsla(${/*hue*/ ctx[8]}, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%, 100%) 100%); z-index: 0`);
    			attr_dev(section2, "class", "svelte-1258gx2");
    			add_location(section2, file$p, 536, 8, 22869);
    			attr_dev(div7, "class", "knob outlined-knob svelte-1258gx2");

    			attr_dev(div7, "style", div7_style_value = `
            background-color: hsl(${/*hue*/ ctx[8]}deg, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%, ${/*alpha*/ ctx[5]}%);
            transform: translate3d(${/*alphaKnobOffset*/ ctx[16]}px, 0px, 0px)
        `);

    			add_location(div7, file$p, 537, 8, 23039);
    			attr_dev(div8, "class", "color-slider svelte-1258gx2");
    			attr_dev(div8, "id", "alpha-slider");
    			add_location(div8, file$p, 534, 4, 22732);
    			set_style(main, "transform", "translate3d(0px, " + /*$contentYOffset*/ ctx[21] + "px, 0px)");
    			attr_dev(main, "class", "svelte-1258gx2");
    			add_location(main, file$p, 512, 0, 21719);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h6);
    			append_dev(h6, t0);
    			/*section0_binding*/ ctx[28](section0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section1, anchor);
    			mount_component(valueinput0, section1, null);
    			append_dev(section1, t2);
    			mount_component(valueinput1, section1, null);
    			append_dev(section1, t3);
    			mount_component(valueinput2, section1, null);
    			append_dev(section1, t4);
    			mount_component(valueinput3, section1, null);
    			append_dev(section1, t5);
    			append_dev(section1, div0);
    			/*section1_binding*/ ctx[36](section1);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div4);
    			append_dev(div4, div1);
    			append_dev(div4, t7);
    			append_dev(div4, div2);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			/*div3_binding*/ ctx[37](div3);
    			/*div4_binding*/ ctx[38](div4);
    			append_dev(main, t9);
    			append_dev(main, div6);
    			append_dev(div6, div5);
    			/*div5_binding*/ ctx[39](div5);
    			/*div6_binding*/ ctx[40](div6);
    			append_dev(main, t10);
    			append_dev(main, div8);
    			append_dev(div8, section2);
    			append_dev(div8, t11);
    			append_dev(div8, div7);
    			/*div8_binding*/ ctx[41](div8);
    			/*main_binding*/ ctx[42](main);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[33], false, false, false),
    					listen_dev(div0, "mouseenter", /*mouseenter_handler*/ ctx[34], false, false, false),
    					listen_dev(div0, "mouseleave", /*mouseleave_handler*/ ctx[35], false, false, false),
    					listen_dev(div4, "mousedown", /*startCubeDrag*/ ctx[24], false, false, false),
    					listen_dev(div6, "mousedown", /*startHueDrag*/ ctx[22], false, false, false),
    					listen_dev(div8, "mousedown", /*startAlphaDrag*/ ctx[23], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*name*/ 524288) set_data_dev(t0, /*name*/ ctx[19]);
    			const valueinput0_changes = {};
    			if (dirty[0] & /*hslMode*/ 4096) valueinput0_changes.name = /*hslMode*/ ctx[12] ? "Hue" : "Red";
    			if (dirty[0] & /*hslMode, hue, red*/ 6400) valueinput0_changes.v = /*hslMode*/ ctx[12] ? /*hue*/ ctx[8] : /*red*/ ctx[11];
    			if (dirty[0] & /*hslMode*/ 4096) valueinput0_changes.maxVal = /*hslMode*/ ctx[12] ? 360 : 255;
    			if (dirty[0] & /*currentColorModeTextClr*/ 8192) valueinput0_changes.textClrOverride = /*currentColorModeTextClr*/ ctx[13];
    			valueinput0.$set(valueinput0_changes);
    			const valueinput1_changes = {};
    			if (dirty[0] & /*hslMode*/ 4096) valueinput1_changes.name = /*hslMode*/ ctx[12] ? "Sat" : "Green";
    			if (dirty[0] & /*hslMode, sat, green*/ 5248) valueinput1_changes.v = /*hslMode*/ ctx[12] ? /*sat*/ ctx[7] : /*green*/ ctx[10];
    			if (dirty[0] & /*hslMode*/ 4096) valueinput1_changes.maxVal = /*hslMode*/ ctx[12] ? 100 : 255;
    			if (dirty[0] & /*currentColorModeTextClr*/ 8192) valueinput1_changes.textClrOverride = /*currentColorModeTextClr*/ ctx[13];
    			valueinput1.$set(valueinput1_changes);
    			const valueinput2_changes = {};
    			if (dirty[0] & /*hslMode*/ 4096) valueinput2_changes.name = /*hslMode*/ ctx[12] ? "Lum" : "Blue";
    			if (dirty[0] & /*hslMode, lum, blue*/ 4672) valueinput2_changes.v = /*hslMode*/ ctx[12] ? /*lum*/ ctx[6] : /*blue*/ ctx[9];
    			if (dirty[0] & /*hslMode*/ 4096) valueinput2_changes.maxVal = /*hslMode*/ ctx[12] ? 100 : 255;
    			if (dirty[0] & /*currentColorModeTextClr*/ 8192) valueinput2_changes.textClrOverride = /*currentColorModeTextClr*/ ctx[13];
    			valueinput2.$set(valueinput2_changes);
    			const valueinput3_changes = {};
    			if (dirty[0] & /*alpha*/ 32) valueinput3_changes.v = /*alpha*/ ctx[5];
    			valueinput3.$set(valueinput3_changes);

    			if (!current || dirty[0] & /*colorRef*/ 1 && div0_title_value !== (div0_title_value = `Switch to ${!!/*colorRef*/ ctx[0]
			? /*colorRef*/ ctx[0].type === "rgb" ? "HSL" : "RGB"
			: "HSL"} mode`)) {
    				attr_dev(div0, "title", div0_title_value);
    			}

    			if (!current || dirty[0] & /*$mainOverlayData*/ 1048576 && section1_style_value !== (section1_style_value = `transform: translate3d(0px, ${67.5 + (!!/*$mainOverlayData*/ ctx[20].dragLocked
			? titleHeight$1
			: 0) + inlineHSLHeight - targetYOffset$1}px, 0px)`)) {
    				attr_dev(section1, "style", section1_style_value);
    			}

    			if (!current || dirty[0] & /*hue*/ 256 && div1_style_value !== (div1_style_value = `
            background-image: linear-gradient(90deg, hsl(0,0%,50%) 0%, hsl(${/*hue*/ ctx[8]}deg,100%,50%) 100%);
        `)) {
    				attr_dev(div1, "style", div1_style_value);
    			}

    			if (!current || dirty[0] & /*hue, sat, lum, cubeOffsetX, cubeOffsetY*/ 393664 && div3_style_value !== (div3_style_value = `
            background-color: hsl(${/*hue*/ ctx[8]}deg, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%);
            transform: translate3d(${/*cubeOffsetX*/ ctx[17]}px, ${/*cubeOffsetY*/ ctx[18]}px, 0px)
        `)) {
    				attr_dev(div3, "style", div3_style_value);
    			}

    			if (!current || dirty[0] & /*hue, hueKnobOffset*/ 33024 && div5_style_value !== (div5_style_value = `
            background-color: hsl(${/*hue*/ ctx[8]}deg, 100%, 50%);
            transform: translate3d(${/*hueKnobOffset*/ ctx[15]}px, 0px, 0px)
        `)) {
    				attr_dev(div5, "style", div5_style_value);
    			}

    			if (!current || dirty[0] & /*hue, sat, lum*/ 448 && section2_style_value !== (section2_style_value = `background: linear-gradient(to right, hsla(${/*hue*/ ctx[8]}, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%, 0%) 0%, hsla(${/*hue*/ ctx[8]}, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%, 100%) 100%); z-index: 0`)) {
    				attr_dev(section2, "style", section2_style_value);
    			}

    			if (!current || dirty[0] & /*hue, sat, lum, alpha, alphaKnobOffset*/ 66016 && div7_style_value !== (div7_style_value = `
            background-color: hsl(${/*hue*/ ctx[8]}deg, ${/*sat*/ ctx[7]}%, ${/*lum*/ ctx[6]}%, ${/*alpha*/ ctx[5]}%);
            transform: translate3d(${/*alphaKnobOffset*/ ctx[16]}px, 0px, 0px)
        `)) {
    				attr_dev(div7, "style", div7_style_value);
    			}

    			if (!current || dirty[0] & /*$contentYOffset*/ 2097152) {
    				set_style(main, "transform", "translate3d(0px, " + /*$contentYOffset*/ ctx[21] + "px, 0px)");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(valueinput0.$$.fragment, local);
    			transition_in(valueinput1.$$.fragment, local);
    			transition_in(valueinput2.$$.fragment, local);
    			transition_in(valueinput3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(valueinput0.$$.fragment, local);
    			transition_out(valueinput1.$$.fragment, local);
    			transition_out(valueinput2.$$.fragment, local);
    			transition_out(valueinput3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			/*section0_binding*/ ctx[28](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section1);
    			destroy_component(valueinput0);
    			destroy_component(valueinput1);
    			destroy_component(valueinput2);
    			destroy_component(valueinput3);
    			/*section1_binding*/ ctx[36](null);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(main);
    			/*div3_binding*/ ctx[37](null);
    			/*div4_binding*/ ctx[38](null);
    			/*div5_binding*/ ctx[39](null);
    			/*div6_binding*/ ctx[40](null);
    			/*div8_binding*/ ctx[41](null);
    			/*main_binding*/ ctx[42](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$p.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function openColorPicker(
    	propertyRef,
    propertyName,
    trackTarget,
    props = {
    		trackContinuously: true,
    		showInlineHSL: false
    	}
    ) {
    	setColorPickerRef(propertyRef); // set the color reference

    	mainColorPickerData.update(pickerDat => {
    		pickerDat.colorName = propertyName; // update color name
    		pickerDat.showInlineHSL = props.showInlineHSL; // update whether or not to show the inline HSL
    		return pickerDat;
    	});

    	// open the overlay frame
    	openOverlayFrame(trackTarget, updateOverlaySize$1, props.trackContinuously, ColorPickerOverlay_1);
    }

    // ======================== NON EXPORTABLES ========================
    // track if drag is locked or not to update our overlay sizing. We only want to update something when it's necessary
    // also track visible because hiding and showing it is weird
    let dragLocked$1 = get_store_value(mainOverlayData).dragLocked;

    let lastDragLocked$1 = get_store_value(mainOverlayData).dragLocked;
    let visible$1 = get_store_value(mainOverlayData).visible;
    let lastVisible$1 = get_store_value(mainOverlayData).visible;

    // these configure the sizing of the window. Manually configure them for now cuz I can't be bothered to write detection code
    let normalOverlayWidth$1 = 250;

    let normalOverlayHeight$1 = 305;
    let titleHeight$1 = 25;
    let inlineHSLHeight = 57;

    // HTML containers for the content
    let mainContainer$1;

    let mainTitleContainer$1;
    let inlineHSLContainer;
    let targetHeight$1 = normalOverlayHeight$1;
    let targetCursorOffset$1 = 0;
    let globalContentYOffset$1 = 10;
    let targetYOffset$1 = globalContentYOffset$1;
    let contentYOffset$1 = tweened(targetYOffset$1, { duration: 500, easing: quadOut }); // controls how much the content is moved down. Update with height changes

    /**
     * This fucntion handle all size changes for the element. Normally, the overlay size will only update if it's closed. However, this can be changed if forceUpdate is set to true.
     *
     * @param forceUpdate - force the update regardless of overlay visibility
     */
    const updateOverlaySize$1 = (forceUpdate = false) => {
    	setTimeout(
    		() => {
    			// we only want to run when there's a change in drag and last dragged, or when an override is called
    			dragLocked$1 = get_store_value(mainOverlayData).dragLocked;

    			visible$1 = get_store_value(mainOverlayData).visible;

    			// the element checking basically ensures there's something to update
    			if (dragLocked$1 === lastDragLocked$1 && visible$1 === lastVisible$1 && !!mainContainer$1) {
    				if (!forceUpdate) return;
    			}

    			// code starts executing here, if there is a change between dragLocked
    			// If the update isn't an override, really only these code should be executed
    			mainOverlayData.update(overlayDat => {
    				overlayDat.w = normalOverlayWidth$1;
    				return overlayDat;
    			});

    			// these determine how to update the sizing based on the mode
    			if (dragLocked$1) {
    				// how to update the overlay when it's dragged out
    				targetHeight$1 = normalOverlayHeight$1 + titleHeight$1; // we add title height because the title will also pop out

    				targetCursorOffset$1 = titleHeight$1 / 2;

    				// unhide the title
    				if (!!mainTitleContainer$1) mainTitleContainer$1.classList.remove("hidden");

    				targetYOffset$1 = globalContentYOffset$1 + titleHeight$1 / 2;
    			} else {
    				// how to update the overlay when it's not dragged out
    				targetHeight$1 = normalOverlayHeight$1;

    				targetCursorOffset$1 = titleHeight$1 / 2;

    				// hide the title
    				if (!!mainTitleContainer$1) mainTitleContainer$1.classList.add("hidden");

    				targetYOffset$1 = globalContentYOffset$1;
    			}

    			// how to update the overlay regardless of it's dragged out or not
    			if (!!get_store_value(mainColorPickerData).showInlineHSL || !!dragLocked$1) {
    				// show inline HSL, make the height larger
    				targetHeight$1 += inlineHSLHeight;

    				targetYOffset$1 -= inlineHSLHeight / 2;
    				if (!get_store_value(mainColorPickerData).showInlineHSL) targetCursorOffset$1 += inlineHSLHeight / 2;
    				if (!!inlineHSLContainer) inlineHSLContainer.classList.remove("hidden");
    			} else {
    				if (!!inlineHSLContainer) inlineHSLContainer.classList.add("hidden");
    			}

    			// update values
    			mainOverlayData.update(overlayDat => {
    				overlayDat.h = targetHeight$1;
    				overlayDat.cursorOffsetY = targetCursorOffset$1;
    				return overlayDat;
    			});

    			contentYOffset$1.set(targetYOffset$1, {
    				duration: get_store_value(mainOverlayData).visible ? 200 : 1
    			});

    			lastDragLocked$1 = dragLocked$1;
    			lastVisible$1 = visible$1;
    		},
    		0
    	);
    };

    function instance$p($$self, $$props, $$invalidate) {
    	let hue;
    	let sat;
    	let lum;
    	let red;
    	let green;
    	let blue;
    	let alpha;
    	let name;
    	let $mainColorPickerData;
    	let $collection;
    	let $mainOverlayData;
    	let $contentYOffset;
    	validate_store(mainColorPickerData, 'mainColorPickerData');
    	component_subscribe($$self, mainColorPickerData, $$value => $$invalidate(27, $mainColorPickerData = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(45, $collection = $$value));
    	validate_store(mainOverlayData, 'mainOverlayData');
    	component_subscribe($$self, mainOverlayData, $$value => $$invalidate(20, $mainOverlayData = $$value));
    	validate_store(contentYOffset$1, 'contentYOffset');
    	component_subscribe($$self, contentYOffset$1, $$value => $$invalidate(21, $contentYOffset = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorPickerOverlay', slots, []);
    	var _a;
    	let colorRef;
    	let hslMode = true;
    	let currentColorModeTextClr = ""; // for UI purposes only.

    	// This try catch tries to retrieve the specified color reference from $collection.
    	// If such reference exists, then we point our local colorRef to the $collection reference.
    	// If such reference does not exist or no longer exists, we will just duplicate the value we currently have so that the value can persist on and not reset itself.
    	// If there is any error during checking or assigning, we can just reset everything for safety.
    	try {
    		if ($mainColorPickerData.colorRefName && $mainOverlayData.elementNumber !== -1) {
    			if ($mainOverlayData.overrideNumber !== -1) {
    				colorRef = $collection[$mainOverlayData.elementNumber].styleOverrides[$mainOverlayData.overrideNumber].style[$mainColorPickerData.colorRefName]; // there is an overlay, so choose the overlay style
    			} else {
    				colorRef = $collection[$mainOverlayData.elementNumber].style[$mainColorPickerData.colorRefName]; // there is no overlay, so choose the root style
    			}
    		} else {
    			colorRef = Object.assign({}, colorRef); // persistence of color even after reference is cleared
    		}
    	} catch(error) {
    		// if there is an error, just reset the overlay because it's probably due to some bad timing between the layers and the picker
    		set_store_value(mainOverlayData, $mainOverlayData.elementNumber = -1, $mainOverlayData);

    		set_store_value(mainOverlayData, $mainOverlayData.overrideNumber = -1, $mainOverlayData);
    		set_store_value(mainColorPickerData, $mainColorPickerData.colorRefName = undefined, $mainColorPickerData);
    		set_store_value(mainColorPickerData, $mainColorPickerData.colorName = "Colors", $mainColorPickerData);
    	}

    	// hue + alpha slider tracker
    	let hueSlider;

    	let hueKnob;
    	let hueKnobOffset = 0;
    	let alphaSlider;
    	let alphaKnobOffset = 0;
    	let hueCube;
    	let hueCubeKnob;
    	let cubeOffsetX = 0;
    	let cubeOffsetY = 0;
    	let initialCursorX = 0;
    	let initialCursorY = 0;

    	const startHueDrag = e => {
    		// update value first
    		if (!hueSlider) return; // do not track if the slider bg not initialized fully

    		const sliderBCR = hueSlider.getBoundingClientRect(); // BCR = bounding client rect
    		$$invalidate(8, hue = (e.clientX - sliderBCR.x) / sliderBCR.width * 360);

    		// check v range
    		if (hue < 0) $$invalidate(8, hue = 0);

    		if (hue > 360) $$invalidate(8, hue = 360);

    		// round hue
    		$$invalidate(8, hue = Math.round(hue));

    		// dispatch an update value
    		if (!!colorRef) {
    			$$invalidate(0, colorRef.h = hue, colorRef);

    			// convert to rgb and update that too
    			const rgbVals = hslToRgb(hue, sat, lum);

    			$$invalidate(0, colorRef.r = rgbVals[0], colorRef);
    			$$invalidate(0, colorRef.g = rgbVals[1], colorRef);
    			$$invalidate(0, colorRef.b = rgbVals[2], colorRef);

    			// update hex code
    			const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);

    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    		}

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackHueDrag);

    		document.addEventListener('mouseup', endHueDrag);
    	};

    	const trackHueDrag = e => {
    		e.preventDefault();
    		const sliderBCR = hueSlider.getBoundingClientRect(); // BCR = bounding client rect

    		// assign dV
    		$$invalidate(8, hue = (e.clientX - sliderBCR.x) / sliderBCR.width * 360);

    		// check v range
    		if (hue < 0) $$invalidate(8, hue = 0);

    		if (hue > 360) $$invalidate(8, hue = 360);

    		// round hue
    		$$invalidate(8, hue = Math.round(hue));

    		// dispatch an update value
    		if (!!colorRef) {
    			$$invalidate(0, colorRef.h = hue, colorRef);

    			// convert to rgb and update that too
    			const rgbVals = hslToRgb(hue, sat, lum);

    			$$invalidate(0, colorRef.r = rgbVals[0], colorRef);
    			$$invalidate(0, colorRef.g = rgbVals[1], colorRef);
    			$$invalidate(0, colorRef.b = rgbVals[2], colorRef);

    			// update hex code
    			const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);

    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    		}
    	};

    	const endHueDrag = () => {
    		document.body.style.cursor = "normal";
    		document.removeEventListener('mousemove', trackHueDrag);
    		document.removeEventListener('mouseup', endHueDrag);
    	};

    	const startAlphaDrag = e => {
    		// update value first
    		if (!alphaSlider) return; // do not track if the slider bg not initialized fully

    		const sliderBCR = alphaSlider.getBoundingClientRect(); // BCR = bounding client rect
    		$$invalidate(5, alpha = (e.clientX - sliderBCR.x) / sliderBCR.width * 100);

    		// check v range
    		if (alpha < 0) $$invalidate(5, alpha = 0);

    		if (alpha > 100) $$invalidate(5, alpha = 100);

    		// round alpha
    		$$invalidate(5, alpha = Math.round(alpha));

    		// dispatch an update value
    		if (!!colorRef) {
    			$$invalidate(0, colorRef.a = alpha, colorRef);

    			// update hex code
    			const rgbVals = hslToRgb(hue, sat, lum);

    			const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    		}

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackAlphaDrag);

    		document.addEventListener('mouseup', endAlphaDrag);
    	};

    	const trackAlphaDrag = e => {
    		e.preventDefault();
    		const sliderBCR = alphaSlider.getBoundingClientRect(); // BCR = bounding client rect

    		// assign dV
    		$$invalidate(5, alpha = (e.clientX - sliderBCR.x) / sliderBCR.width * 100);

    		// check v range
    		if (alpha < 0) $$invalidate(5, alpha = 0);

    		if (alpha > 100) $$invalidate(5, alpha = 100);

    		// round alpha
    		$$invalidate(5, alpha = Math.round(alpha));

    		// dispatch an update value
    		if (!!colorRef) {
    			$$invalidate(0, colorRef.a = alpha, colorRef);

    			// update hex code
    			const rgbVals = hslToRgb(hue, sat, lum);

    			const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);
    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    		}
    	};

    	const endAlphaDrag = () => {
    		document.body.style.cursor = "normal";
    		document.removeEventListener('mousemove', trackAlphaDrag);
    		document.removeEventListener('mouseup', endAlphaDrag);
    	};

    	// color cube movement
    	const startCubeDrag = e => {
    		// update value first
    		if (!hueCube) return; // do not track if the slider bg not initialized fully

    		// record init X and Y
    		initialCursorX = e.clientX;

    		initialCursorY = e.clientY;
    		const cubeBCR = hueCube.getBoundingClientRect(); // BCR = bounding client rect
    		$$invalidate(7, sat = (e.clientX - cubeBCR.x) / cubeBCR.width * 100);
    		let tempLum = (e.clientY - cubeBCR.y) / cubeBCR.height * 100;

    		// check sat/val range
    		$$invalidate(7, sat = Math.min(Math.max(sat, 0), 100));

    		$$invalidate(6, lum = 100 - Math.min(Math.max(tempLum, 0), 100));

    		// round sat and lum
    		$$invalidate(7, sat = Math.round(sat));

    		$$invalidate(6, lum = Math.round(lum));

    		// dispatch an update value
    		// dispatch an update value
    		if (!!colorRef) {
    			$$invalidate(0, colorRef.s = sat, colorRef);
    			$$invalidate(0, colorRef.l = lum, colorRef);

    			// convert to rgb and update that too
    			const rgbVals = hslToRgb(hue, sat, lum);

    			$$invalidate(0, colorRef.r = rgbVals[0], colorRef);
    			$$invalidate(0, colorRef.g = rgbVals[1], colorRef);
    			$$invalidate(0, colorRef.b = rgbVals[2], colorRef);

    			// update hex code
    			const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);

    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    		}

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackCubeDrag);

    		document.addEventListener('mouseup', endCubeDrag);
    	};

    	const trackCubeDrag = e => {
    		e.preventDefault();
    		const cubeBCR = hueCube.getBoundingClientRect(); // BCR = bounding client rect
    		let currX = e.clientX, currY = e.clientY;
    		let snapThreshold = 5;
    		let xLocked = false;

    		// detect if shift is pressed. If so, move only vertically or horizontally
    		// this code is a fucking disaster
    		if (e.shiftKey) {
    			// calculate X Y deviation
    			let devX = Math.abs(e.clientX - initialCursorX),
    				devY = Math.abs(e.clientY - initialCursorY);

    			// find greatest deviation
    			let largestDev = Math.max(devX, devY);

    			// find which value to lock based on those deviations
    			if (largestDev === devY && devY > snapThreshold) {
    				currX = initialCursorX;
    				xLocked = true;
    			} else if (devX > snapThreshold) {
    				currY = initialCursorY; // lock X
    				xLocked = false;
    			} else if (xLocked) currX = initialCursorX; else currY = initialCursorY; // lock Y
    			// these two cases only execute if no threshold is reached. In this case, follow the last one
    		}

    		$$invalidate(7, sat = (currX - cubeBCR.x) / cubeBCR.width * 100);
    		let tempLum = (currY - cubeBCR.y) / cubeBCR.height * 100;

    		// check sat/val range
    		$$invalidate(7, sat = Math.min(Math.max(sat, 0), 100));

    		$$invalidate(6, lum = 100 - Math.min(Math.max(tempLum, 0), 100));

    		// round sat and lum
    		$$invalidate(7, sat = Math.round(sat));

    		$$invalidate(6, lum = Math.round(lum));

    		// dispatch an update value
    		if (!!colorRef) {
    			$$invalidate(0, colorRef.s = sat, colorRef);
    			$$invalidate(0, colorRef.l = lum, colorRef);

    			// convert to rgb and update that too
    			const rgbVals = hslToRgb(hue, sat, lum);

    			$$invalidate(0, colorRef.r = rgbVals[0], colorRef);
    			$$invalidate(0, colorRef.g = rgbVals[1], colorRef);
    			$$invalidate(0, colorRef.b = rgbVals[2], colorRef);

    			// update hex code
    			const hexCode = rgbaToHex(rgbVals[0], rgbVals[1], rgbVals[2], alpha);

    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    		}
    	};

    	const endCubeDrag = () => {
    		document.body.style.cursor = "normal";
    		document.removeEventListener('mousemove', trackCubeDrag);
    		document.removeEventListener('mouseup', endCubeDrag);
    	};

    	// handles all color changes
    	const updateClr = (e, updateValue) => {
    		let v = e.detail.v;

    		// lowercase the updateValue
    		updateValue = updateValue.toLowerCase();

    		// do a simple range check
    		if (updateValue === "h") {
    			if (v > 360) v = 360; // set min max
    			if (v < 0) v = 0;
    		}

    		if (updateValue === "s" || updateValue === "l") {
    			if (v > 100) v = 100; // set min max
    			if (v < 0) v = 0;
    		}

    		if (updateValue === "r" || updateValue === "g" || updateValue === "b") {
    			if (v > 255) v = 255; // set min max
    			if (v < 0) v = 0;
    		}

    		// determine whether to update H or R
    		if (!!colorRef && colorRef[updateValue] !== undefined && updateValue !== "type") $$invalidate(0, colorRef[updateValue] = v, colorRef); else throw `Value "${updateValue}" does not exist. Check what you're trying to update`;

    		if (updateValue === "h" || updateValue === "s" || updateValue === "l") {
    			// if changes occured to HSL values, update RGB and HEX values
    			const rgbVal = hslToRgb(colorRef.h, colorRef.s, colorRef.l);

    			$$invalidate(0, colorRef.r = rgbVal[0], colorRef);
    			$$invalidate(0, colorRef.g = rgbVal[1], colorRef);
    			$$invalidate(0, colorRef.b = rgbVal[2], colorRef);
    			const hexCode = rgbaToHex(colorRef.r, colorRef.g, colorRef.b, colorRef.a);
    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}

    		if (updateValue === "r" || updateValue === "g" || updateValue === "b") {
    			// if changes occured to RGB values, update HSL and HEX values
    			const hslVal = rgbToHsl(colorRef.r, colorRef.g, colorRef.b);

    			$$invalidate(0, colorRef.h = hslVal[0], colorRef);
    			$$invalidate(0, colorRef.s = hslVal[1], colorRef);
    			$$invalidate(0, colorRef.l = hslVal[2], colorRef);
    			const hexCode = rgbaToHex(colorRef.r, colorRef.g, colorRef.b, colorRef.a);
    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}

    		if (updateValue === "a") {
    			// if changes occured to alpha values, update HEX values
    			const hexCode = rgbaToHex(colorRef.r, colorRef.g, colorRef.b, colorRef.a);

    			$$invalidate(0, colorRef.hex = hexCode, colorRef);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}

    		if (updateValue === "hex" && (colorRef.hex.length === 3 || colorRef.hex.length === 4 || colorRef.hex.length === 6 || colorRef.hex.length === 8)) {
    			// if changes occured to hex values, update HSL, RGB and ALPHA values
    			const rgbaVal = hexToRgba(colorRef.hex);

    			$$invalidate(0, colorRef.r = rgbaVal[0], colorRef);
    			$$invalidate(0, colorRef.g = rgbaVal[1], colorRef);
    			$$invalidate(0, colorRef.b = rgbaVal[2], colorRef);
    			$$invalidate(0, colorRef.a = rgbaVal[3], colorRef);
    			const hslVal = rgbToHsl(rgbaVal[0], rgbaVal[1], rgbaVal[2]);
    			$$invalidate(0, colorRef.h = hslVal[0], colorRef);
    			$$invalidate(0, colorRef.s = hslVal[1], colorRef);
    			$$invalidate(0, colorRef.l = hslVal[2], colorRef);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}
    	};

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorPickerOverlay> was created with unknown prop '${key}'`);
    	});

    	function section0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainTitleContainer$1 = $$value;
    		});
    	}

    	const updateValue_handler = e => updateClr(e, hslMode ? "h" : "r");
    	const updateValue_handler_1 = e => updateClr(e, hslMode ? "s" : "g");
    	const updateValue_handler_2 = e => updateClr(e, hslMode ? "l" : "b");
    	const updateValue_handler_3 = e => updateClr(e, "a");
    	const click_handler = () => $$invalidate(12, hslMode = !hslMode);

    	const mouseenter_handler = () => {
    		$$invalidate(13, currentColorModeTextClr = "hsl(0,0%,80%)");
    	};

    	const mouseleave_handler = () => {
    		$$invalidate(13, currentColorModeTextClr = "");
    	};

    	function section1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inlineHSLContainer = $$value;
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			hueCubeKnob = $$value;
    			$$invalidate(4, hueCubeKnob);
    		});
    	}

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			hueCube = $$value;
    			$$invalidate(3, hueCube);
    		});
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			hueKnob = $$value;
    			$$invalidate(14, hueKnob);
    		});
    	}

    	function div6_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			hueSlider = $$value;
    			$$invalidate(1, hueSlider);
    		});
    	}

    	function div8_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			alphaSlider = $$value;
    			$$invalidate(2, alphaSlider);
    		});
    	}

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainContainer$1 = $$value;
    		});
    	}

    	$$self.$capture_state = () => ({
    		_a,
    		setColorPickerRef,
    		openOverlayFrame,
    		openColorPicker,
    		dragLocked: dragLocked$1,
    		lastDragLocked: lastDragLocked$1,
    		visible: visible$1,
    		lastVisible: lastVisible$1,
    		normalOverlayWidth: normalOverlayWidth$1,
    		normalOverlayHeight: normalOverlayHeight$1,
    		titleHeight: titleHeight$1,
    		inlineHSLHeight,
    		mainContainer: mainContainer$1,
    		mainTitleContainer: mainTitleContainer$1,
    		inlineHSLContainer,
    		targetHeight: targetHeight$1,
    		targetCursorOffset: targetCursorOffset$1,
    		globalContentYOffset: globalContentYOffset$1,
    		targetYOffset: targetYOffset$1,
    		contentYOffset: contentYOffset$1,
    		updateOverlaySize: updateOverlaySize$1,
    		_a,
    		mainColorPickerData,
    		collection,
    		hexToRgba,
    		hslToRgb,
    		rgbaToHex,
    		rgbToHsl,
    		tweened,
    		quadOut,
    		mainOverlayData,
    		ColorPickerOverlay: ColorPickerOverlay_1,
    		ValueInput,
    		get: get_store_value,
    		colorRef,
    		hslMode,
    		currentColorModeTextClr,
    		hueSlider,
    		hueKnob,
    		hueKnobOffset,
    		alphaSlider,
    		alphaKnobOffset,
    		hueCube,
    		hueCubeKnob,
    		cubeOffsetX,
    		cubeOffsetY,
    		initialCursorX,
    		initialCursorY,
    		startHueDrag,
    		trackHueDrag,
    		endHueDrag,
    		startAlphaDrag,
    		trackAlphaDrag,
    		endAlphaDrag,
    		startCubeDrag,
    		trackCubeDrag,
    		endCubeDrag,
    		updateClr,
    		alpha,
    		lum,
    		sat,
    		hue,
    		name,
    		blue,
    		green,
    		red,
    		$mainColorPickerData,
    		$collection,
    		$mainOverlayData,
    		$contentYOffset
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) $$invalidate(26, _a = $$props._a);
    		if ('colorRef' in $$props) $$invalidate(0, colorRef = $$props.colorRef);
    		if ('hslMode' in $$props) $$invalidate(12, hslMode = $$props.hslMode);
    		if ('currentColorModeTextClr' in $$props) $$invalidate(13, currentColorModeTextClr = $$props.currentColorModeTextClr);
    		if ('hueSlider' in $$props) $$invalidate(1, hueSlider = $$props.hueSlider);
    		if ('hueKnob' in $$props) $$invalidate(14, hueKnob = $$props.hueKnob);
    		if ('hueKnobOffset' in $$props) $$invalidate(15, hueKnobOffset = $$props.hueKnobOffset);
    		if ('alphaSlider' in $$props) $$invalidate(2, alphaSlider = $$props.alphaSlider);
    		if ('alphaKnobOffset' in $$props) $$invalidate(16, alphaKnobOffset = $$props.alphaKnobOffset);
    		if ('hueCube' in $$props) $$invalidate(3, hueCube = $$props.hueCube);
    		if ('hueCubeKnob' in $$props) $$invalidate(4, hueCubeKnob = $$props.hueCubeKnob);
    		if ('cubeOffsetX' in $$props) $$invalidate(17, cubeOffsetX = $$props.cubeOffsetX);
    		if ('cubeOffsetY' in $$props) $$invalidate(18, cubeOffsetY = $$props.cubeOffsetY);
    		if ('initialCursorX' in $$props) initialCursorX = $$props.initialCursorX;
    		if ('initialCursorY' in $$props) initialCursorY = $$props.initialCursorY;
    		if ('alpha' in $$props) $$invalidate(5, alpha = $$props.alpha);
    		if ('lum' in $$props) $$invalidate(6, lum = $$props.lum);
    		if ('sat' in $$props) $$invalidate(7, sat = $$props.sat);
    		if ('hue' in $$props) $$invalidate(8, hue = $$props.hue);
    		if ('name' in $$props) $$invalidate(19, name = $$props.name);
    		if ('blue' in $$props) $$invalidate(9, blue = $$props.blue);
    		if ('green' in $$props) $$invalidate(10, green = $$props.green);
    		if ('red' in $$props) $$invalidate(11, red = $$props.red);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*colorRef, hue*/ 257) {
    			$$invalidate(8, hue = !!colorRef
    			? colorRef.h
    			: hue !== null && hue !== void 0 ? hue : 0);
    		}

    		if ($$self.$$.dirty[0] & /*colorRef, sat*/ 129) {
    			$$invalidate(7, sat = !!colorRef
    			? colorRef.s
    			: sat !== null && sat !== void 0 ? sat : 0);
    		}

    		if ($$self.$$.dirty[0] & /*colorRef, lum*/ 65) {
    			$$invalidate(6, lum = !!colorRef
    			? colorRef.l
    			: lum !== null && lum !== void 0 ? lum : 0);
    		}

    		if ($$self.$$.dirty[0] & /*colorRef, red*/ 2049) {
    			$$invalidate(11, red = !!colorRef
    			? colorRef.r
    			: red !== null && red !== void 0 ? red : 0);
    		}

    		if ($$self.$$.dirty[0] & /*colorRef, green*/ 1025) {
    			$$invalidate(10, green = !!colorRef
    			? colorRef.g
    			: green !== null && green !== void 0 ? green : 0);
    		}

    		if ($$self.$$.dirty[0] & /*colorRef, blue*/ 513) {
    			$$invalidate(9, blue = !!colorRef
    			? colorRef.b
    			: blue !== null && blue !== void 0 ? blue : 0);
    		}

    		if ($$self.$$.dirty[0] & /*colorRef, alpha*/ 33) {
    			$$invalidate(5, alpha = !!colorRef
    			? colorRef.a
    			: alpha !== null && alpha !== void 0 ? alpha : 0);
    		}

    		if ($$self.$$.dirty[0] & /*$mainColorPickerData, _a*/ 201326592) {
    			$$invalidate(19, name = $$invalidate(26, _a = $mainColorPickerData.colorName) !== null && _a !== void 0
    			? _a
    			: "Colors");
    		}

    		if ($$self.$$.dirty[0] & /*hueSlider, hue*/ 258) {
    			if (!!hueSlider) {
    				// update the position of the hue knob
    				const sliderLen = 230;

    				const knobWidth = 15;
    				$$invalidate(15, hueKnobOffset = hue / 360 * (sliderLen - knobWidth));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*alphaSlider, alpha*/ 36) {
    			if (!!alphaSlider) {
    				// update the position of the alpha knob
    				const sliderLen = 230;

    				const knobWidth = 15;
    				$$invalidate(16, alphaKnobOffset = alpha / 100 * (sliderLen - knobWidth));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*hueCube, hueCubeKnob, sat, lum*/ 216) {
    			if (!!hueCube) {
    				// update the position of the alpha knob
    				const width = 240;

    				const height = 200;
    				const knobWidth = hueCubeKnob.getBoundingClientRect().width;
    				$$invalidate(17, cubeOffsetX = sat / 100 * (width - knobWidth));
    				$$invalidate(18, cubeOffsetY = (100 - lum) / 100 * (height - knobWidth));
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$mainColorPickerData*/ 134217728) {
    			// special cases that requires force updates
    			if ($mainColorPickerData.showInlineHSL !== undefined) updateOverlaySize$1(true); // when the inlineHSL prop is changed, we want to update.
    		}
    	};

    	return [
    		colorRef,
    		hueSlider,
    		alphaSlider,
    		hueCube,
    		hueCubeKnob,
    		alpha,
    		lum,
    		sat,
    		hue,
    		blue,
    		green,
    		red,
    		hslMode,
    		currentColorModeTextClr,
    		hueKnob,
    		hueKnobOffset,
    		alphaKnobOffset,
    		cubeOffsetX,
    		cubeOffsetY,
    		name,
    		$mainOverlayData,
    		$contentYOffset,
    		startHueDrag,
    		startAlphaDrag,
    		startCubeDrag,
    		updateClr,
    		_a,
    		$mainColorPickerData,
    		section0_binding,
    		updateValue_handler,
    		updateValue_handler_1,
    		updateValue_handler_2,
    		updateValue_handler_3,
    		click_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		section1_binding,
    		div3_binding,
    		div4_binding,
    		div5_binding,
    		div6_binding,
    		div8_binding,
    		main_binding
    	];
    }

    class ColorPickerOverlay_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$p, create_fragment$p, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPickerOverlay_1",
    			options,
    			id: create_fragment$p.name
    		});
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Advanced/ColorPicker.svelte generated by Svelte v3.48.0 */
    const file$o = "src/components/ctrlMenuItems/StyleEditors/Advanced/ColorPicker.svelte";

    function create_fragment$o(ctx) {
    	let main;
    	let section0;
    	let title;
    	let t0;
    	let div1;
    	let div0;
    	let div0_style_value;
    	let t1;
    	let valuestrinput;
    	let t2;
    	let section2;
    	let div2;
    	let div2_title_value;
    	let t3;
    	let section1;
    	let valueinput0;
    	let t4;
    	let valueinput1;
    	let t5;
    	let valueinput2;
    	let t6;
    	let valueinput3;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[1],
    				sub: /*sub*/ ctx[2]
    			},
    			$$inline: true
    		});

    	valuestrinput = new ValueStrInput({
    			props: {
    				name: "Hex",
    				v: /*clr*/ ctx[0].hex,
    				hasMargin: true,
    				sub: true,
    				charLim: 8,
    				align: "center",
    				allowedCharRegex: /^[a-fA-F0-9]$/
    			},
    			$$inline: true
    		});

    	valuestrinput.$on("updateValue", /*updateValue_handler*/ ctx[11]);
    	valuestrinput.$on("focused", /*openOverlay*/ ctx[7]);

    	valueinput0 = new ValueInput({
    			props: {
    				name: /*clr*/ ctx[0].type === "rgb" ? "Red" : "Hue",
    				v: /*clr*/ ctx[0].type === "rgb"
    				? /*clr*/ ctx[0].r
    				: /*clr*/ ctx[0].h,
    				minWidth: "40px",
    				align: "center",
    				maxVal: /*clr*/ ctx[0].type === "rgb" ? 255 : 360,
    				hasMargin: true,
    				sub: true,
    				textClrOverride: /*currentColorModeTextClr*/ ctx[3]
    			},
    			$$inline: true
    		});

    	valueinput0.$on("updateValue", /*updateValue_handler_1*/ ctx[14]);
    	valueinput0.$on("focused", /*openOverlay*/ ctx[7]);

    	valueinput1 = new ValueInput({
    			props: {
    				name: /*clr*/ ctx[0].type === "rgb" ? "Green" : "Sat",
    				v: /*clr*/ ctx[0].type === "rgb"
    				? /*clr*/ ctx[0].g
    				: /*clr*/ ctx[0].s,
    				minWidth: "40px",
    				align: "center",
    				maxVal: /*clr*/ ctx[0].type === "rgb" ? 255 : 100,
    				hasMargin: true,
    				sub: true,
    				textClrOverride: /*currentColorModeTextClr*/ ctx[3]
    			},
    			$$inline: true
    		});

    	valueinput1.$on("updateValue", /*updateValue_handler_2*/ ctx[15]);
    	valueinput1.$on("focused", /*openOverlay*/ ctx[7]);

    	valueinput2 = new ValueInput({
    			props: {
    				name: /*clr*/ ctx[0].type === "rgb" ? "Blue" : "Lum",
    				v: /*clr*/ ctx[0].type === "rgb"
    				? /*clr*/ ctx[0].b
    				: /*clr*/ ctx[0].l,
    				minWidth: "40px",
    				align: "center",
    				maxVal: /*clr*/ ctx[0].type === "rgb" ? 255 : 100,
    				hasMargin: true,
    				sub: true,
    				textClrOverride: /*currentColorModeTextClr*/ ctx[3]
    			},
    			$$inline: true
    		});

    	valueinput2.$on("updateValue", /*updateValue_handler_3*/ ctx[16]);
    	valueinput2.$on("focused", /*openOverlay*/ ctx[7]);

    	valueinput3 = new ValueInput({
    			props: {
    				name: "Alpha",
    				v: /*clr*/ ctx[0].a,
    				minWidth: "40px",
    				align: "center",
    				maxVal: 100,
    				hasMargin: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	valueinput3.$on("updateValue", /*updateValue_handler_4*/ ctx[17]);
    	valueinput3.$on("focused", /*openOverlay*/ ctx[7]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section0 = element("section");
    			create_component(title.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			create_component(valuestrinput.$$.fragment);
    			t2 = space();
    			section2 = element("section");
    			div2 = element("div");
    			t3 = space();
    			section1 = element("section");
    			create_component(valueinput0.$$.fragment);
    			t4 = space();
    			create_component(valueinput1.$$.fragment);
    			t5 = space();
    			create_component(valueinput2.$$.fragment);
    			t6 = space();
    			create_component(valueinput3.$$.fragment);
    			attr_dev(div0, "style", div0_style_value = `background-color: rgba(${/*clr*/ ctx[0].r}, ${/*clr*/ ctx[0].g}, ${/*clr*/ ctx[0].b}, ${/*clr*/ ctx[0].a}%)`);
    			attr_dev(div0, "class", "svelte-1oa13eu");
    			add_location(div0, file$o, 114, 12, 4050);
    			attr_dev(div1, "class", "color-preview svelte-1oa13eu");
    			add_location(div1, file$o, 113, 8, 3979);
    			add_location(section0, file$o, 111, 4, 3922);
    			attr_dev(div2, "id", "hsl-rgb-switcher");
    			attr_dev(div2, "title", div2_title_value = `Switch to ${/*clr*/ ctx[0].type === "rgb" ? "HSL" : "RGB"} mode`);
    			attr_dev(div2, "class", "svelte-1oa13eu");
    			add_location(div2, file$o, 123, 8, 4490);
    			attr_dev(section1, "id", "rgb-hsl-input-field");
    			attr_dev(section1, "class", "svelte-1oa13eu");
    			add_location(section1, file$o, 125, 8, 4767);
    			attr_dev(section2, "id", "rgbhslInput");
    			attr_dev(section2, "class", "svelte-1oa13eu");
    			add_location(section2, file$o, 122, 4, 4455);
    			attr_dev(main, "class", "svelte-1oa13eu");
    			add_location(main, file$o, 109, 0, 3871);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			mount_component(title, section0, null);
    			append_dev(section0, t0);
    			append_dev(section0, div1);
    			append_dev(div1, div0);
    			/*div1_binding*/ ctx[10](div1);
    			append_dev(main, t1);
    			mount_component(valuestrinput, main, null);
    			append_dev(main, t2);
    			append_dev(main, section2);
    			append_dev(section2, div2);
    			append_dev(section2, t3);
    			append_dev(section2, section1);
    			mount_component(valueinput0, section1, null);
    			append_dev(section1, t4);
    			mount_component(valueinput1, section1, null);
    			append_dev(section1, t5);
    			mount_component(valueinput2, section1, null);
    			append_dev(section1, t6);
    			mount_component(valueinput3, section1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "mousedown", /*openOverlay*/ ctx[7], false, false, false),
    					listen_dev(div2, "click", /*switchClrMode*/ ctx[6], false, false, false),
    					listen_dev(div2, "mouseenter", /*mouseenter_handler*/ ctx[12], false, false, false),
    					listen_dev(div2, "mouseleave", /*mouseleave_handler*/ ctx[13], false, false, false),
    					listen_dev(div2, "mousedown", keepOpenOverlay, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 2) title_changes.name = /*name*/ ctx[1];
    			if (dirty & /*sub*/ 4) title_changes.sub = /*sub*/ ctx[2];
    			title.$set(title_changes);

    			if (!current || dirty & /*clr*/ 1 && div0_style_value !== (div0_style_value = `background-color: rgba(${/*clr*/ ctx[0].r}, ${/*clr*/ ctx[0].g}, ${/*clr*/ ctx[0].b}, ${/*clr*/ ctx[0].a}%)`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			const valuestrinput_changes = {};
    			if (dirty & /*clr*/ 1) valuestrinput_changes.v = /*clr*/ ctx[0].hex;
    			valuestrinput.$set(valuestrinput_changes);

    			if (!current || dirty & /*clr*/ 1 && div2_title_value !== (div2_title_value = `Switch to ${/*clr*/ ctx[0].type === "rgb" ? "HSL" : "RGB"} mode`)) {
    				attr_dev(div2, "title", div2_title_value);
    			}

    			const valueinput0_changes = {};
    			if (dirty & /*clr*/ 1) valueinput0_changes.name = /*clr*/ ctx[0].type === "rgb" ? "Red" : "Hue";

    			if (dirty & /*clr*/ 1) valueinput0_changes.v = /*clr*/ ctx[0].type === "rgb"
    			? /*clr*/ ctx[0].r
    			: /*clr*/ ctx[0].h;

    			if (dirty & /*clr*/ 1) valueinput0_changes.maxVal = /*clr*/ ctx[0].type === "rgb" ? 255 : 360;
    			if (dirty & /*currentColorModeTextClr*/ 8) valueinput0_changes.textClrOverride = /*currentColorModeTextClr*/ ctx[3];
    			valueinput0.$set(valueinput0_changes);
    			const valueinput1_changes = {};
    			if (dirty & /*clr*/ 1) valueinput1_changes.name = /*clr*/ ctx[0].type === "rgb" ? "Green" : "Sat";

    			if (dirty & /*clr*/ 1) valueinput1_changes.v = /*clr*/ ctx[0].type === "rgb"
    			? /*clr*/ ctx[0].g
    			: /*clr*/ ctx[0].s;

    			if (dirty & /*clr*/ 1) valueinput1_changes.maxVal = /*clr*/ ctx[0].type === "rgb" ? 255 : 100;
    			if (dirty & /*currentColorModeTextClr*/ 8) valueinput1_changes.textClrOverride = /*currentColorModeTextClr*/ ctx[3];
    			valueinput1.$set(valueinput1_changes);
    			const valueinput2_changes = {};
    			if (dirty & /*clr*/ 1) valueinput2_changes.name = /*clr*/ ctx[0].type === "rgb" ? "Blue" : "Lum";

    			if (dirty & /*clr*/ 1) valueinput2_changes.v = /*clr*/ ctx[0].type === "rgb"
    			? /*clr*/ ctx[0].b
    			: /*clr*/ ctx[0].l;

    			if (dirty & /*clr*/ 1) valueinput2_changes.maxVal = /*clr*/ ctx[0].type === "rgb" ? 255 : 100;
    			if (dirty & /*currentColorModeTextClr*/ 8) valueinput2_changes.textClrOverride = /*currentColorModeTextClr*/ ctx[3];
    			valueinput2.$set(valueinput2_changes);
    			const valueinput3_changes = {};
    			if (dirty & /*clr*/ 1) valueinput3_changes.v = /*clr*/ ctx[0].a;
    			valueinput3.$set(valueinput3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			transition_in(valuestrinput.$$.fragment, local);
    			transition_in(valueinput0.$$.fragment, local);
    			transition_in(valueinput1.$$.fragment, local);
    			transition_in(valueinput2.$$.fragment, local);
    			transition_in(valueinput3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			transition_out(valuestrinput.$$.fragment, local);
    			transition_out(valueinput0.$$.fragment, local);
    			transition_out(valueinput1.$$.fragment, local);
    			transition_out(valueinput2.$$.fragment, local);
    			transition_out(valueinput3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			/*div1_binding*/ ctx[10](null);
    			destroy_component(valuestrinput);
    			destroy_component(valueinput0);
    			destroy_component(valueinput1);
    			destroy_component(valueinput2);
    			destroy_component(valueinput3);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let $mainColorPickerData;
    	let $collection;
    	validate_store(mainColorPickerData, 'mainColorPickerData');
    	component_subscribe($$self, mainColorPickerData, $$value => $$invalidate(18, $mainColorPickerData = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(19, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ColorPicker', slots, []);
    	let { name } = $$props;
    	let { sub = false } = $$props;
    	let { propertyName } = $$props;
    	let { propertyRef } = $$props;
    	let { clr } = $$props;
    	let currentColorModeTextClr = "";
    	let colorPreviewSquare;

    	const updateValue = (e, updateValue) => {
    		let v = e.detail.v;

    		// lowercase the updateValue
    		updateValue = updateValue.toLowerCase();

    		// do a simple range check
    		if (updateValue === "h") {
    			if (v > 360) v = 360; // set min max
    			if (v < 0) v = 0;
    		}

    		if (updateValue === "s" || updateValue === "l") {
    			if (v > 100) v = 100; // set min max
    			if (v < 0) v = 0;
    		}

    		if (updateValue === "r" || updateValue === "g" || updateValue === "b") {
    			if (v > 255) v = 255; // set min max
    			if (v < 0) v = 0;
    		}

    		// determine whether to update H or R
    		if (clr[updateValue] !== undefined && updateValue !== "type") $$invalidate(0, clr[updateValue] = v, clr); else throw `Value "${updateValue}" does not exist. Check what you're trying to update`;

    		if (updateValue === "h" || updateValue === "s" || updateValue === "l") {
    			// if changes occured to HSL values, update RGB and HEX values
    			const rgbVal = hslToRgb(clr.h, clr.s, clr.l);

    			$$invalidate(0, clr.r = rgbVal[0], clr);
    			$$invalidate(0, clr.g = rgbVal[1], clr);
    			$$invalidate(0, clr.b = rgbVal[2], clr);
    			const hexCode = rgbaToHex(clr.r, clr.g, clr.b, clr.a);
    			$$invalidate(0, clr.hex = hexCode, clr);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}

    		if (updateValue === "r" || updateValue === "g" || updateValue === "b") {
    			// if changes occured to RGB values, update HSL and HEX values
    			const hslVal = rgbToHsl(clr.r, clr.g, clr.b);

    			$$invalidate(0, clr.h = hslVal[0], clr);
    			$$invalidate(0, clr.s = hslVal[1], clr);
    			$$invalidate(0, clr.l = hslVal[2], clr);
    			const hexCode = rgbaToHex(clr.r, clr.g, clr.b, clr.a);
    			$$invalidate(0, clr.hex = hexCode, clr);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}

    		if (updateValue === "a") {
    			// if changes occured to alpha values, update HEX values
    			const hexCode = rgbaToHex(clr.r, clr.g, clr.b, clr.a);

    			$$invalidate(0, clr.hex = hexCode, clr);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}

    		if (updateValue === "hex" && (clr.hex.length === 3 || clr.hex.length === 4 || clr.hex.length === 6 || clr.hex.length === 8)) {
    			// if changes occured to hex values, update HSL, RGB and ALPHA values
    			const rgbaVal = hexToRgba(clr.hex);

    			$$invalidate(0, clr.r = rgbaVal[0], clr);
    			$$invalidate(0, clr.g = rgbaVal[1], clr);
    			$$invalidate(0, clr.b = rgbaVal[2], clr);
    			$$invalidate(0, clr.a = rgbaVal[3], clr);
    			const hslVal = rgbToHsl(rgbaVal[0], rgbaVal[1], rgbaVal[2]);
    			$$invalidate(0, clr.h = hslVal[0], clr);
    			$$invalidate(0, clr.s = hslVal[1], clr);
    			$$invalidate(0, clr.l = hslVal[2], clr);
    			collection.set($collection);
    			mainColorPickerData.set($mainColorPickerData);
    			return; // end update
    		}
    	};

    	const switchClrMode = () => {
    		switch (clr.type) {
    			case "rgb":
    				$$invalidate(0, clr.type = "hsl", clr);
    				break;
    			case "hsl":
    				$$invalidate(0, clr.type = "rgb", clr);
    				break;
    		}
    	};

    	// update color ref
    	const openOverlay = () => {
    		openColorPicker(propertyRef, propertyName, colorPreviewSquare);
    	};

    	const writable_props = ['name', 'sub', 'propertyName', 'propertyRef', 'clr'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ColorPicker> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			colorPreviewSquare = $$value;
    			$$invalidate(4, colorPreviewSquare);
    		});
    	}

    	const updateValue_handler = e => updateValue(e, "hex");

    	const mouseenter_handler = () => {
    		$$invalidate(3, currentColorModeTextClr = "hsl(0,0%,80%)");
    	};

    	const mouseleave_handler = () => {
    		$$invalidate(3, currentColorModeTextClr = "");
    	};

    	const updateValue_handler_1 = e => updateValue(e, clr.type === "rgb" ? "r" : "h");
    	const updateValue_handler_2 = e => updateValue(e, clr.type === "rgb" ? "g" : "s");
    	const updateValue_handler_3 = e => updateValue(e, clr.type === "rgb" ? "b" : "l");
    	const updateValue_handler_4 = e => updateValue(e, "a");

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(2, sub = $$props.sub);
    		if ('propertyName' in $$props) $$invalidate(8, propertyName = $$props.propertyName);
    		if ('propertyRef' in $$props) $$invalidate(9, propertyRef = $$props.propertyRef);
    		if ('clr' in $$props) $$invalidate(0, clr = $$props.clr);
    	};

    	$$self.$capture_state = () => ({
    		ValueInput,
    		ValueStrInput,
    		hexToRgba,
    		hslToRgb,
    		rgbaToHex,
    		rgbToHsl,
    		collection,
    		mainColorPickerData,
    		openColorPicker,
    		keepOpenOverlay,
    		name,
    		sub,
    		propertyName,
    		propertyRef,
    		clr,
    		currentColorModeTextClr,
    		Title,
    		colorPreviewSquare,
    		updateValue,
    		switchClrMode,
    		openOverlay,
    		$mainColorPickerData,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(2, sub = $$props.sub);
    		if ('propertyName' in $$props) $$invalidate(8, propertyName = $$props.propertyName);
    		if ('propertyRef' in $$props) $$invalidate(9, propertyRef = $$props.propertyRef);
    		if ('clr' in $$props) $$invalidate(0, clr = $$props.clr);
    		if ('currentColorModeTextClr' in $$props) $$invalidate(3, currentColorModeTextClr = $$props.currentColorModeTextClr);
    		if ('colorPreviewSquare' in $$props) $$invalidate(4, colorPreviewSquare = $$props.colorPreviewSquare);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		clr,
    		name,
    		sub,
    		currentColorModeTextClr,
    		colorPreviewSquare,
    		updateValue,
    		switchClrMode,
    		openOverlay,
    		propertyName,
    		propertyRef,
    		div1_binding,
    		updateValue_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		updateValue_handler_1,
    		updateValue_handler_2,
    		updateValue_handler_3,
    		updateValue_handler_4
    	];
    }

    class ColorPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			name: 1,
    			sub: 2,
    			propertyName: 8,
    			propertyRef: 9,
    			clr: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ColorPicker",
    			options,
    			id: create_fragment$o.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<ColorPicker> was created without expected prop 'name'");
    		}

    		if (/*propertyName*/ ctx[8] === undefined && !('propertyName' in props)) {
    			console.warn("<ColorPicker> was created without expected prop 'propertyName'");
    		}

    		if (/*propertyRef*/ ctx[9] === undefined && !('propertyRef' in props)) {
    			console.warn("<ColorPicker> was created without expected prop 'propertyRef'");
    		}

    		if (/*clr*/ ctx[0] === undefined && !('clr' in props)) {
    			console.warn("<ColorPicker> was created without expected prop 'clr'");
    		}
    	}

    	get name() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get propertyName() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set propertyName(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get propertyRef() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set propertyRef(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clr() {
    		throw new Error("<ColorPicker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clr(value) {
    		throw new Error("<ColorPicker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/Dropdown.svelte generated by Svelte v3.48.0 */
    const file$n = "src/components/ctrlMenuItems/StyleEditors/Basics/Dropdown.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (68:8) {#each possibleValues.filter(cV => cV !== v) as value (value)}
    function create_each_block$3(key_1, ctx) {
    	let div;
    	let p;
    	let t0_value = /*value*/ ctx[20] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*value*/ ctx[20]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(p, "class", "svelte-8jj3eu");
    			add_location(p, file$n, 68, 42, 2580);
    			attr_dev(div, "class", "svelte-8jj3eu");
    			add_location(div, file$n, 68, 12, 2550);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*possibleValues, v*/ 9 && t0_value !== (t0_value = /*value*/ ctx[20] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(68:8) {#each possibleValues.filter(cV => cV !== v) as value (value)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let main;
    	let title;
    	let t0;
    	let div;
    	let p;
    	let t1;
    	let t2;
    	let p_class_value;
    	let p_style_value;
    	let div_class_value;
    	let t3;
    	let section;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let section_class_value;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[1],
    				sub: /*sub*/ ctx[2],
    				align: /*alignTitle*/ ctx[8]
    			},
    			$$inline: true
    		});

    	let each_value = /*possibleValues*/ ctx[3].filter(/*func*/ ctx[13]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*value*/ ctx[20];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t0 = space();
    			div = element("div");
    			p = element("p");
    			t1 = text(/*v*/ ctx[0]);
    			t2 = text(" ");
    			t3 = space();
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", p_class_value = "" + (null_to_empty(`${/*sub*/ ctx[2] ? "sub" : ""}`) + " svelte-8jj3eu"));
    			attr_dev(p, "style", p_style_value = `text-align: ${/*align*/ ctx[7]}`);
    			add_location(p, file$n, 62, 8, 2221);
    			attr_dev(div, "id", "main-box");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[11]} ${/*unitSelOpen*/ ctx[9] ? "sel-opened" : ""}`) + " svelte-8jj3eu"));
    			add_location(div, file$n, 61, 4, 2108);
    			attr_dev(section, "id", "unit-sel-container");
    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[11]} ${!/*unitSelOpen*/ ctx[9] ? "hidden" : ""}`) + " svelte-8jj3eu"));
    			add_location(section, file$n, 66, 4, 2346);

    			attr_dev(main, "style", main_style_value = `${/*hasMargin*/ ctx[4] ? "margin-right:6px;" : ""} ${/*maxWidth*/ ctx[5] !== ""
			? `max-width:${/*maxWidth*/ ctx[5]};`
			: ""} ${/*minWidth*/ ctx[6] !== ""
			? `min-width:${/*minWidth*/ ctx[6]}`
			: ""}`);

    			attr_dev(main, "class", "svelte-8jj3eu");
    			add_location(main, file$n, 58, 0, 1891);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t0);
    			append_dev(main, div);
    			append_dev(div, p);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(main, t3);
    			append_dev(main, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			/*section_binding*/ ctx[15](section);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*openUnitSel*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 2) title_changes.name = /*name*/ ctx[1];
    			if (dirty & /*sub*/ 4) title_changes.sub = /*sub*/ ctx[2];
    			if (dirty & /*alignTitle*/ 256) title_changes.align = /*alignTitle*/ ctx[8];
    			title.$set(title_changes);
    			if (!current || dirty & /*v*/ 1) set_data_dev(t1, /*v*/ ctx[0]);

    			if (!current || dirty & /*sub*/ 4 && p_class_value !== (p_class_value = "" + (null_to_empty(`${/*sub*/ ctx[2] ? "sub" : ""}`) + " svelte-8jj3eu"))) {
    				attr_dev(p, "class", p_class_value);
    			}

    			if (!current || dirty & /*align*/ 128 && p_style_value !== (p_style_value = `text-align: ${/*align*/ ctx[7]}`)) {
    				attr_dev(p, "style", p_style_value);
    			}

    			if (!current || dirty & /*openDirection, unitSelOpen*/ 2560 && div_class_value !== (div_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[11]} ${/*unitSelOpen*/ ctx[9] ? "sel-opened" : ""}`) + " svelte-8jj3eu"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*v, possibleValues*/ 9) {
    				each_value = /*possibleValues*/ ctx[3].filter(/*func*/ ctx[13]);
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section, destroy_block, create_each_block$3, null, get_each_context$3);
    			}

    			if (!current || dirty & /*openDirection, unitSelOpen*/ 2560 && section_class_value !== (section_class_value = "" + (null_to_empty(`${/*openDirection*/ ctx[11]} ${!/*unitSelOpen*/ ctx[9] ? "hidden" : ""}`) + " svelte-8jj3eu"))) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (!current || dirty & /*hasMargin, maxWidth, minWidth*/ 112 && main_style_value !== (main_style_value = `${/*hasMargin*/ ctx[4] ? "margin-right:6px;" : ""} ${/*maxWidth*/ ctx[5] !== ""
			? `max-width:${/*maxWidth*/ ctx[5]};`
			: ""} ${/*minWidth*/ ctx[6] !== ""
			? `min-width:${/*minWidth*/ ctx[6]}`
			: ""}`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*section_binding*/ ctx[15](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown', slots, []);
    	let { name } = $$props;
    	let { sub } = $$props;
    	let { v } = $$props;
    	let { possibleValues } = $$props;
    	let { hasMargin } = $$props;
    	let { maxWidth = "" } = $$props;
    	let { minWidth = "" } = $$props;
    	let { align = "center" } = $$props;
    	let { alignTitle = "left" } = $$props;
    	const disp = createEventDispatcher();
    	let unitSelOpen = false;
    	let dropDownElement;
    	let openDirection = "open-top";
    	let trackingDir = false;

    	const openUnitSel = () => {
    		updateSelectionDirection();
    		$$invalidate(9, unitSelOpen = true);

    		// for closing
    		document.addEventListener("mouseup", closeUnitSel);

    		// add resize listener for window
    		trackingDir = true;

    		requestAnimationFrame(updateSelectionDirection);
    	};

    	const updateSelectionDirection = () => {
    		// iterCt prevents stack overflowing
    		if (!dropDownElement) return; // keep checking until dropDownElement exists

    		const bbRect = dropDownElement.getBoundingClientRect();
    		const margin = 10;

    		if (openDirection == "open-bottom") $$invalidate(11, openDirection = bbRect.y + bbRect.height + margin > window.innerHeight
    		? "open-top"
    		: "open-bottom"); else $$invalidate(11, openDirection = bbRect.y + 25 + bbRect.height * 2 + margin > window.innerHeight
    		? "open-top"
    		: "open-bottom");

    		if (trackingDir) requestAnimationFrame(updateSelectionDirection);
    	};

    	const closeUnitSel = () => {
    		setTimeout(
    			() => {
    				$$invalidate(9, unitSelOpen = false);

    				// cancel direction tracking
    				trackingDir = false;

    				// remove listener
    				document.removeEventListener("mouseup", closeUnitSel);

    				window.removeEventListener("resize", updateSelectionDirection);
    			},
    			0
    		);
    	};

    	const writable_props = [
    		'name',
    		'sub',
    		'v',
    		'possibleValues',
    		'hasMargin',
    		'maxWidth',
    		'minWidth',
    		'align',
    		'alignTitle'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	const func = cV => cV !== v;
    	const click_handler = value => $$invalidate(0, v = value);

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dropDownElement = $$value;
    			$$invalidate(10, dropDownElement);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(2, sub = $$props.sub);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('possibleValues' in $$props) $$invalidate(3, possibleValues = $$props.possibleValues);
    		if ('hasMargin' in $$props) $$invalidate(4, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(5, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(6, minWidth = $$props.minWidth);
    		if ('align' in $$props) $$invalidate(7, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(8, alignTitle = $$props.alignTitle);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		sub,
    		v,
    		possibleValues,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		align,
    		alignTitle,
    		createEventDispatcher,
    		Title,
    		disp,
    		unitSelOpen,
    		dropDownElement,
    		openDirection,
    		trackingDir,
    		openUnitSel,
    		updateSelectionDirection,
    		closeUnitSel
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('sub' in $$props) $$invalidate(2, sub = $$props.sub);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('possibleValues' in $$props) $$invalidate(3, possibleValues = $$props.possibleValues);
    		if ('hasMargin' in $$props) $$invalidate(4, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(5, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(6, minWidth = $$props.minWidth);
    		if ('align' in $$props) $$invalidate(7, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(8, alignTitle = $$props.alignTitle);
    		if ('unitSelOpen' in $$props) $$invalidate(9, unitSelOpen = $$props.unitSelOpen);
    		if ('dropDownElement' in $$props) $$invalidate(10, dropDownElement = $$props.dropDownElement);
    		if ('openDirection' in $$props) $$invalidate(11, openDirection = $$props.openDirection);
    		if ('trackingDir' in $$props) trackingDir = $$props.trackingDir;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*v*/ 1) {
    			// dispatch value changes if v changes
    			if (v !== null) {
    				// do not send null
    				disp("updateValue", { v });
    			}
    		}
    	};

    	return [
    		v,
    		name,
    		sub,
    		possibleValues,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		align,
    		alignTitle,
    		unitSelOpen,
    		dropDownElement,
    		openDirection,
    		openUnitSel,
    		func,
    		click_handler,
    		section_binding
    	];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {
    			name: 1,
    			sub: 2,
    			v: 0,
    			possibleValues: 3,
    			hasMargin: 4,
    			maxWidth: 5,
    			minWidth: 6,
    			align: 7,
    			alignTitle: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$n.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<Dropdown> was created without expected prop 'name'");
    		}

    		if (/*sub*/ ctx[2] === undefined && !('sub' in props)) {
    			console.warn("<Dropdown> was created without expected prop 'sub'");
    		}

    		if (/*v*/ ctx[0] === undefined && !('v' in props)) {
    			console.warn("<Dropdown> was created without expected prop 'v'");
    		}

    		if (/*possibleValues*/ ctx[3] === undefined && !('possibleValues' in props)) {
    			console.warn("<Dropdown> was created without expected prop 'possibleValues'");
    		}

    		if (/*hasMargin*/ ctx[4] === undefined && !('hasMargin' in props)) {
    			console.warn("<Dropdown> was created without expected prop 'hasMargin'");
    		}
    	}

    	get name() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get possibleValues() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set possibleValues(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignTitle() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignTitle(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/BorderEditor.svelte generated by Svelte v3.48.0 */

    const file$m = "src/components/ctrlMenuItems/StyleEditors/BorderEditor.svelte";

    // (173:4) {#if currentStyle.USEBORDER}
    function create_if_block$9(ctx) {
    	let section0;
    	let slider0;
    	let t0;
    	let unitinput0;
    	let t1;
    	let unitinput1;
    	let t2;
    	let unitinput2;
    	let t3;
    	let unitinput3;
    	let t4;
    	let section1;
    	let slider1;
    	let t5;
    	let unitinput4;
    	let t6;
    	let unitinput5;
    	let t7;
    	let unitinput6;
    	let t8;
    	let unitinput7;
    	let t9;
    	let section2;
    	let colorpicker;
    	let t10;
    	let section4;
    	let title;
    	let t11;
    	let section3;
    	let dropdown0;
    	let t12;
    	let dropdown1;
    	let t13;
    	let dropdown2;
    	let t14;
    	let dropdown3;
    	let current;

    	slider0 = new Slider({
    			props: {
    				name: "Width",
    				min: 0,
    				max: 200,
    				v: /*cBWAvg*/ ctx[19],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0],
    				colorRef: /*clr*/ ctx[9]
    			},
    			$$inline: true
    		});

    	slider0.$on("updateValue", /*updateBorderWidthAll*/ ctx[28]);

    	unitinput0 = new UnitInput({
    			props: {
    				name: "Top",
    				v: /*cBWT*/ ctx[1],
    				currentUnit: /*cBWTu*/ ctx[15],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput0.$on("updateValue", /*updateValue_handler*/ ctx[36]);

    	unitinput1 = new UnitInput({
    			props: {
    				name: "Right",
    				v: /*cBWR*/ ctx[2],
    				currentUnit: /*cBWRu*/ ctx[16],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput1.$on("updateValue", /*updateValue_handler_1*/ ctx[37]);

    	unitinput2 = new UnitInput({
    			props: {
    				name: "Bottom",
    				v: /*cBWB*/ ctx[3],
    				currentUnit: /*cBWBu*/ ctx[17],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput2.$on("updateValue", /*updateValue_handler_2*/ ctx[38]);

    	unitinput3 = new UnitInput({
    			props: {
    				name: "Left",
    				v: /*cBWL*/ ctx[4],
    				currentUnit: /*cBWLu*/ ctx[18],
    				hasMargin: false,
    				maxWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput3.$on("updateValue", /*updateValue_handler_3*/ ctx[39]);

    	slider1 = new Slider({
    			props: {
    				name: "Radius",
    				min: 0,
    				max: 200,
    				v: /*cBRAvg*/ ctx[24],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0],
    				colorRef: /*clr*/ ctx[9]
    			},
    			$$inline: true
    		});

    	slider1.$on("updateValue", /*updateBorderRadiusAll*/ ctx[30]);

    	unitinput4 = new UnitInput({
    			props: {
    				name: "Top",
    				v: /*cBRT*/ ctx[5],
    				currentUnit: /*cBRTu*/ ctx[20],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput4.$on("updateValue", /*updateValue_handler_4*/ ctx[40]);

    	unitinput5 = new UnitInput({
    			props: {
    				name: "Right",
    				v: /*cBRR*/ ctx[6],
    				currentUnit: /*cBRRu*/ ctx[21],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput5.$on("updateValue", /*updateValue_handler_5*/ ctx[41]);

    	unitinput6 = new UnitInput({
    			props: {
    				name: "Bottom",
    				v: /*cBRB*/ ctx[7],
    				currentUnit: /*cBRBu*/ ctx[22],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput6.$on("updateValue", /*updateValue_handler_6*/ ctx[42]);

    	unitinput7 = new UnitInput({
    			props: {
    				name: "Left",
    				v: /*cBRL*/ ctx[8],
    				currentUnit: /*cBRLu*/ ctx[23],
    				hasMargin: false,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput7.$on("updateValue", /*updateValue_handler_7*/ ctx[43]);

    	colorpicker = new ColorPicker({
    			props: {
    				name: "Color",
    				propertyName: "Border",
    				propertyRef: "borderColor",
    				clr: /*clr*/ ctx[9]
    			},
    			$$inline: true
    		});

    	title = new Title({ props: { name: "Style" }, $$inline: true });

    	dropdown0 = new Dropdown({
    			props: {
    				name: "Top",
    				sub: true,
    				hasMargin: true,
    				v: /*styleTop*/ ctx[10],
    				possibleValues: /*possibleStyles*/ ctx[25]
    			},
    			$$inline: true
    		});

    	dropdown0.$on("updateValue", /*updateValue_handler_8*/ ctx[44]);

    	dropdown1 = new Dropdown({
    			props: {
    				name: "Right",
    				sub: true,
    				hasMargin: true,
    				v: /*styleRight*/ ctx[11],
    				possibleValues: /*possibleStyles*/ ctx[25]
    			},
    			$$inline: true
    		});

    	dropdown1.$on("updateValue", /*updateValue_handler_9*/ ctx[45]);

    	dropdown2 = new Dropdown({
    			props: {
    				name: "Bottom ",
    				sub: true,
    				hasMargin: true,
    				v: /*styleBottom*/ ctx[12],
    				possibleValues: /*possibleStyles*/ ctx[25]
    			},
    			$$inline: true
    		});

    	dropdown2.$on("updateValue", /*updateValue_handler_10*/ ctx[46]);

    	dropdown3 = new Dropdown({
    			props: {
    				name: "Left",
    				sub: true,
    				hasMargin: false,
    				v: /*styleLeft*/ ctx[13],
    				possibleValues: /*possibleStyles*/ ctx[25]
    			},
    			$$inline: true
    		});

    	dropdown3.$on("updateValue", /*updateValue_handler_11*/ ctx[47]);

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			create_component(slider0.$$.fragment);
    			t0 = space();
    			create_component(unitinput0.$$.fragment);
    			t1 = space();
    			create_component(unitinput1.$$.fragment);
    			t2 = space();
    			create_component(unitinput2.$$.fragment);
    			t3 = space();
    			create_component(unitinput3.$$.fragment);
    			t4 = space();
    			section1 = element("section");
    			create_component(slider1.$$.fragment);
    			t5 = space();
    			create_component(unitinput4.$$.fragment);
    			t6 = space();
    			create_component(unitinput5.$$.fragment);
    			t7 = space();
    			create_component(unitinput6.$$.fragment);
    			t8 = space();
    			create_component(unitinput7.$$.fragment);
    			t9 = space();
    			section2 = element("section");
    			create_component(colorpicker.$$.fragment);
    			t10 = space();
    			section4 = element("section");
    			create_component(title.$$.fragment);
    			t11 = space();
    			section3 = element("section");
    			create_component(dropdown0.$$.fragment);
    			t12 = space();
    			create_component(dropdown1.$$.fragment);
    			t13 = space();
    			create_component(dropdown2.$$.fragment);
    			t14 = space();
    			create_component(dropdown3.$$.fragment);
    			attr_dev(section0, "class", "svelte-ckave6");
    			add_location(section0, file$m, 174, 8, 8521);
    			attr_dev(section1, "class", "svelte-ckave6");
    			add_location(section1, file$m, 183, 8, 9493);
    			attr_dev(section2, "class", "svelte-ckave6");
    			add_location(section2, file$m, 192, 8, 10542);
    			attr_dev(section3, "class", "svelte-ckave6");
    			add_location(section3, file$m, 198, 12, 10789);
    			set_style(section4, "flex-direction", "column");
    			set_style(section4, "margin-bottom", "7px");
    			attr_dev(section4, "class", "svelte-ckave6");
    			add_location(section4, file$m, 196, 8, 10683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			mount_component(slider0, section0, null);
    			append_dev(section0, t0);
    			mount_component(unitinput0, section0, null);
    			append_dev(section0, t1);
    			mount_component(unitinput1, section0, null);
    			append_dev(section0, t2);
    			mount_component(unitinput2, section0, null);
    			append_dev(section0, t3);
    			mount_component(unitinput3, section0, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, section1, anchor);
    			mount_component(slider1, section1, null);
    			append_dev(section1, t5);
    			mount_component(unitinput4, section1, null);
    			append_dev(section1, t6);
    			mount_component(unitinput5, section1, null);
    			append_dev(section1, t7);
    			mount_component(unitinput6, section1, null);
    			append_dev(section1, t8);
    			mount_component(unitinput7, section1, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, section2, anchor);
    			mount_component(colorpicker, section2, null);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, section4, anchor);
    			mount_component(title, section4, null);
    			append_dev(section4, t11);
    			append_dev(section4, section3);
    			mount_component(dropdown0, section3, null);
    			append_dev(section3, t12);
    			mount_component(dropdown1, section3, null);
    			append_dev(section3, t13);
    			mount_component(dropdown2, section3, null);
    			append_dev(section3, t14);
    			mount_component(dropdown3, section3, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};
    			if (dirty[0] & /*cBWAvg*/ 524288) slider0_changes.v = /*cBWAvg*/ ctx[19];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider0_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			if (dirty[0] & /*clr*/ 512) slider0_changes.colorRef = /*clr*/ ctx[9];
    			slider0.$set(slider0_changes);
    			const unitinput0_changes = {};
    			if (dirty[0] & /*cBWT*/ 2) unitinput0_changes.v = /*cBWT*/ ctx[1];
    			if (dirty[0] & /*cBWTu*/ 32768) unitinput0_changes.currentUnit = /*cBWTu*/ ctx[15];
    			unitinput0.$set(unitinput0_changes);
    			const unitinput1_changes = {};
    			if (dirty[0] & /*cBWR*/ 4) unitinput1_changes.v = /*cBWR*/ ctx[2];
    			if (dirty[0] & /*cBWRu*/ 65536) unitinput1_changes.currentUnit = /*cBWRu*/ ctx[16];
    			unitinput1.$set(unitinput1_changes);
    			const unitinput2_changes = {};
    			if (dirty[0] & /*cBWB*/ 8) unitinput2_changes.v = /*cBWB*/ ctx[3];
    			if (dirty[0] & /*cBWBu*/ 131072) unitinput2_changes.currentUnit = /*cBWBu*/ ctx[17];
    			unitinput2.$set(unitinput2_changes);
    			const unitinput3_changes = {};
    			if (dirty[0] & /*cBWL*/ 16) unitinput3_changes.v = /*cBWL*/ ctx[4];
    			if (dirty[0] & /*cBWLu*/ 262144) unitinput3_changes.currentUnit = /*cBWLu*/ ctx[18];
    			unitinput3.$set(unitinput3_changes);
    			const slider1_changes = {};
    			if (dirty[0] & /*cBRAvg*/ 16777216) slider1_changes.v = /*cBRAvg*/ ctx[24];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider1_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			if (dirty[0] & /*clr*/ 512) slider1_changes.colorRef = /*clr*/ ctx[9];
    			slider1.$set(slider1_changes);
    			const unitinput4_changes = {};
    			if (dirty[0] & /*cBRT*/ 32) unitinput4_changes.v = /*cBRT*/ ctx[5];
    			if (dirty[0] & /*cBRTu*/ 1048576) unitinput4_changes.currentUnit = /*cBRTu*/ ctx[20];
    			unitinput4.$set(unitinput4_changes);
    			const unitinput5_changes = {};
    			if (dirty[0] & /*cBRR*/ 64) unitinput5_changes.v = /*cBRR*/ ctx[6];
    			if (dirty[0] & /*cBRRu*/ 2097152) unitinput5_changes.currentUnit = /*cBRRu*/ ctx[21];
    			unitinput5.$set(unitinput5_changes);
    			const unitinput6_changes = {};
    			if (dirty[0] & /*cBRB*/ 128) unitinput6_changes.v = /*cBRB*/ ctx[7];
    			if (dirty[0] & /*cBRBu*/ 4194304) unitinput6_changes.currentUnit = /*cBRBu*/ ctx[22];
    			unitinput6.$set(unitinput6_changes);
    			const unitinput7_changes = {};
    			if (dirty[0] & /*cBRL*/ 256) unitinput7_changes.v = /*cBRL*/ ctx[8];
    			if (dirty[0] & /*cBRLu*/ 8388608) unitinput7_changes.currentUnit = /*cBRLu*/ ctx[23];
    			unitinput7.$set(unitinput7_changes);
    			const colorpicker_changes = {};
    			if (dirty[0] & /*clr*/ 512) colorpicker_changes.clr = /*clr*/ ctx[9];
    			colorpicker.$set(colorpicker_changes);
    			const dropdown0_changes = {};
    			if (dirty[0] & /*styleTop*/ 1024) dropdown0_changes.v = /*styleTop*/ ctx[10];
    			dropdown0.$set(dropdown0_changes);
    			const dropdown1_changes = {};
    			if (dirty[0] & /*styleRight*/ 2048) dropdown1_changes.v = /*styleRight*/ ctx[11];
    			dropdown1.$set(dropdown1_changes);
    			const dropdown2_changes = {};
    			if (dirty[0] & /*styleBottom*/ 4096) dropdown2_changes.v = /*styleBottom*/ ctx[12];
    			dropdown2.$set(dropdown2_changes);
    			const dropdown3_changes = {};
    			if (dirty[0] & /*styleLeft*/ 8192) dropdown3_changes.v = /*styleLeft*/ ctx[13];
    			dropdown3.$set(dropdown3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(unitinput0.$$.fragment, local);
    			transition_in(unitinput1.$$.fragment, local);
    			transition_in(unitinput2.$$.fragment, local);
    			transition_in(unitinput3.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(unitinput4.$$.fragment, local);
    			transition_in(unitinput5.$$.fragment, local);
    			transition_in(unitinput6.$$.fragment, local);
    			transition_in(unitinput7.$$.fragment, local);
    			transition_in(colorpicker.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(dropdown0.$$.fragment, local);
    			transition_in(dropdown1.$$.fragment, local);
    			transition_in(dropdown2.$$.fragment, local);
    			transition_in(dropdown3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(unitinput0.$$.fragment, local);
    			transition_out(unitinput1.$$.fragment, local);
    			transition_out(unitinput2.$$.fragment, local);
    			transition_out(unitinput3.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(unitinput4.$$.fragment, local);
    			transition_out(unitinput5.$$.fragment, local);
    			transition_out(unitinput6.$$.fragment, local);
    			transition_out(unitinput7.$$.fragment, local);
    			transition_out(colorpicker.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(dropdown0.$$.fragment, local);
    			transition_out(dropdown1.$$.fragment, local);
    			transition_out(dropdown2.$$.fragment, local);
    			transition_out(dropdown3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_component(slider0);
    			destroy_component(unitinput0);
    			destroy_component(unitinput1);
    			destroy_component(unitinput2);
    			destroy_component(unitinput3);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(section1);
    			destroy_component(slider1);
    			destroy_component(unitinput4);
    			destroy_component(unitinput5);
    			destroy_component(unitinput6);
    			destroy_component(unitinput7);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(section2);
    			destroy_component(colorpicker);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(section4);
    			destroy_component(title);
    			destroy_component(dropdown0);
    			destroy_component(dropdown1);
    			destroy_component(dropdown2);
    			destroy_component(dropdown3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(173:4) {#if currentStyle.USEBORDER}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let main;
    	let section1;
    	let h1;
    	let t1;
    	let section0;
    	let input;
    	let input_checked_value;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*currentStyle*/ ctx[14].USEBORDER && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section1 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Border";
    			t1 = space();
    			section0 = element("section");
    			input = element("input");
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-ckave6");
    			add_location(h1, file$m, 163, 8, 8089);
    			attr_dev(input, "type", "checkbox");
    			input.checked = input_checked_value = /*currentStyle*/ ctx[14].USEBORDER;
    			attr_dev(input, "class", "svelte-ckave6");
    			add_location(input, file$m, 166, 12, 8157);
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/checkmark.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			set_style(img, "opacity", /*currentStyle*/ ctx[14].USEBORDER ? "1" : "0");
    			attr_dev(img, "class", "svelte-ckave6");
    			add_location(img, file$m, 167, 12, 8253);
    			attr_dev(section0, "id", "check-container");
    			attr_dev(section0, "class", "svelte-ckave6");
    			add_location(section0, file$m, 165, 8, 8114);
    			attr_dev(section1, "id", "title-container");
    			attr_dev(section1, "class", "svelte-ckave6");
    			add_location(section1, file$m, 162, 4, 8050);
    			attr_dev(main, "class", "no-drag svelte-ckave6");
    			add_location(main, file$m, 160, 0, 7990);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section1);
    			append_dev(section1, h1);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, input);
    			append_dev(section0, t2);
    			append_dev(section0, img);
    			append_dev(main, t3);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*toggleUseBorder*/ ctx[26], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*currentStyle*/ 16384 && input_checked_value !== (input_checked_value = /*currentStyle*/ ctx[14].USEBORDER)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (!current || dirty[0] & /*currentStyle*/ 16384) {
    				set_style(img, "opacity", /*currentStyle*/ ctx[14].USEBORDER ? "1" : "0");
    			}

    			if (/*currentStyle*/ ctx[14].USEBORDER) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*currentStyle*/ 16384) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let $mainColorPickerData;
    	let $selectedComponent;
    	let $collection;
    	let $selectedOverride;
    	validate_store(mainColorPickerData, 'mainColorPickerData');
    	component_subscribe($$self, mainColorPickerData, $$value => $$invalidate(32, $mainColorPickerData = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(33, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(34, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(35, $selectedOverride = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BorderEditor', slots, []);
    	let { currentParentWidth = 360 } = $$props;
    	let cBWT = 0;
    	let cBWTu = "px"; // cBW = current border width
    	let cBWR = 0;
    	let cBWRu = "px"; // cBW = current border width
    	let cBWB = 0;
    	let cBWBu = "px"; // cBW = current border width
    	let cBWL = 0;
    	let cBWLu = "px"; // cBW = current border width
    	let cBWAvg = 0;
    	let cBRT = 0;
    	let cBRTu = "px"; // cBR = current border radius
    	let cBRR = 0;
    	let cBRRu = "px"; // cBR = current border radius
    	let cBRB = 0;
    	let cBRBu = "px"; // cBR = current border radius
    	let cBRL = 0;
    	let cBRLu = "px"; // cBR = current border radius
    	let cBRAvg = 0;

    	let clr = {
    		type: "hsl",
    		r: 255,
    		g: 255,
    		b: 255,
    		h: 0,
    		s: 0,
    		l: 100,
    		a: 100,
    		hex: "ffffff"
    	};

    	// this has to be a subset of the borderOutlineStyle type set in $collection
    	const possibleStyles = ["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "hidden"];

    	let styleTop = "solid";
    	let styleRight = "solid";
    	let styleBottom = "solid";
    	let styleLeft = "solid";

    	const toggleUseBorder = () => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBORDER`] = !$collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBORDER`], $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`USEBORDER`] = !$collection[$selectedComponent].style[`USEBORDER`], $collection);
    		}
    	};

    	const updateBorderWidth = (evt, direction) => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`borderWidth${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`borderWidth${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		}
    	};

    	const updateBorderWidthAll = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderWidthTop"].v = evt.detail.v, $collection);

    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderWidthRight"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderWidthBottom"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderWidthLeft"].v = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["borderWidthTop"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderWidthRight"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderWidthBottom"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderWidthLeft"].v = evt.detail.v, $collection);
    		}
    	};

    	const updateBorderRadius = (evt, direction) => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`borderRadius${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`borderRadius${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		}
    	};

    	const updateBorderRadiusAll = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusTop"].v = evt.detail.v, $collection);

    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusRight"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusBottom"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusLeft"].v = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusTop"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusRight"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusBottom"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusLeft"].v = evt.detail.v, $collection);
    		}
    	};

    	const updateStyle = (evt, dir) => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`borderStyle${dir}`] = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`borderStyle${dir}`] = evt.detail.v, $collection);
    		}
    	};

    	const writable_props = ['currentParentWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BorderEditor> was created with unknown prop '${key}'`);
    	});

    	const updateValue_handler = evt => updateBorderWidth(evt, "Top");
    	const updateValue_handler_1 = evt => updateBorderWidth(evt, "Right");
    	const updateValue_handler_2 = evt => updateBorderWidth(evt, "Bottom");
    	const updateValue_handler_3 = evt => updateBorderWidth(evt, "Left");
    	const updateValue_handler_4 = evt => updateBorderRadius(evt, "Top");
    	const updateValue_handler_5 = evt => updateBorderRadius(evt, "Right");
    	const updateValue_handler_6 = evt => updateBorderRadius(evt, "Bottom");
    	const updateValue_handler_7 = evt => updateBorderRadius(evt, "Left");
    	const updateValue_handler_8 = e => updateStyle(e, "Top");
    	const updateValue_handler_9 = e => updateStyle(e, "Right");
    	const updateValue_handler_10 = e => updateStyle(e, "Bottom");
    	const updateValue_handler_11 = e => updateStyle(e, "Left");

    	$$self.$$set = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		Slider,
    		UnitInput,
    		ColorPicker,
    		Dropdown,
    		Title,
    		clearColorPickerRef,
    		mainColorPickerData,
    		currentParentWidth,
    		cBWT,
    		cBWTu,
    		cBWR,
    		cBWRu,
    		cBWB,
    		cBWBu,
    		cBWL,
    		cBWLu,
    		cBWAvg,
    		cBRT,
    		cBRTu,
    		cBRR,
    		cBRRu,
    		cBRB,
    		cBRBu,
    		cBRL,
    		cBRLu,
    		cBRAvg,
    		clr,
    		possibleStyles,
    		styleTop,
    		styleRight,
    		styleBottom,
    		styleLeft,
    		toggleUseBorder,
    		updateBorderWidth,
    		updateBorderWidthAll,
    		updateBorderRadius,
    		updateBorderRadiusAll,
    		updateStyle,
    		currentStyle,
    		$mainColorPickerData,
    		$selectedComponent,
    		$collection,
    		$selectedOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    		if ('cBWT' in $$props) $$invalidate(1, cBWT = $$props.cBWT);
    		if ('cBWTu' in $$props) $$invalidate(15, cBWTu = $$props.cBWTu);
    		if ('cBWR' in $$props) $$invalidate(2, cBWR = $$props.cBWR);
    		if ('cBWRu' in $$props) $$invalidate(16, cBWRu = $$props.cBWRu);
    		if ('cBWB' in $$props) $$invalidate(3, cBWB = $$props.cBWB);
    		if ('cBWBu' in $$props) $$invalidate(17, cBWBu = $$props.cBWBu);
    		if ('cBWL' in $$props) $$invalidate(4, cBWL = $$props.cBWL);
    		if ('cBWLu' in $$props) $$invalidate(18, cBWLu = $$props.cBWLu);
    		if ('cBWAvg' in $$props) $$invalidate(19, cBWAvg = $$props.cBWAvg);
    		if ('cBRT' in $$props) $$invalidate(5, cBRT = $$props.cBRT);
    		if ('cBRTu' in $$props) $$invalidate(20, cBRTu = $$props.cBRTu);
    		if ('cBRR' in $$props) $$invalidate(6, cBRR = $$props.cBRR);
    		if ('cBRRu' in $$props) $$invalidate(21, cBRRu = $$props.cBRRu);
    		if ('cBRB' in $$props) $$invalidate(7, cBRB = $$props.cBRB);
    		if ('cBRBu' in $$props) $$invalidate(22, cBRBu = $$props.cBRBu);
    		if ('cBRL' in $$props) $$invalidate(8, cBRL = $$props.cBRL);
    		if ('cBRLu' in $$props) $$invalidate(23, cBRLu = $$props.cBRLu);
    		if ('cBRAvg' in $$props) $$invalidate(24, cBRAvg = $$props.cBRAvg);
    		if ('clr' in $$props) $$invalidate(9, clr = $$props.clr);
    		if ('styleTop' in $$props) $$invalidate(10, styleTop = $$props.styleTop);
    		if ('styleRight' in $$props) $$invalidate(11, styleRight = $$props.styleRight);
    		if ('styleBottom' in $$props) $$invalidate(12, styleBottom = $$props.styleBottom);
    		if ('styleLeft' in $$props) $$invalidate(13, styleLeft = $$props.styleLeft);
    		if ('currentStyle' in $$props) $$invalidate(14, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[1] & /*$selectedOverride, $collection, $selectedComponent*/ 28) {
    			// reactive
    			$$invalidate(14, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty[0] & /*currentStyle, cBWT, cBWR, cBWB, cBWL, cBRT, cBRR, cBRB, cBRL, clr, styleTop, styleRight, styleBottom, styleLeft*/ 32766) {
    			if (!!currentStyle) {
    				// these variables just make the code look nicer
    				// use border
    				$$invalidate(14, currentStyle["USEBORDER"] = !!currentStyle["USEBORDER"], currentStyle); // boolean initialization weirdness

    				// currentStyle["USEBORDER"] = true; // debugging force open
    				// border width
    				if (!currentStyle["borderWidthTop"]) $$invalidate(14, currentStyle["borderWidthTop"] = { v: 2, u: "px" }, currentStyle);

    				$$invalidate(1, cBWT = currentStyle["borderWidthTop"].v);
    				$$invalidate(15, cBWTu = currentStyle["borderWidthTop"].u);
    				if (!currentStyle["borderWidthRight"]) $$invalidate(14, currentStyle["borderWidthRight"] = { v: 2, u: "px" }, currentStyle);
    				$$invalidate(2, cBWR = currentStyle["borderWidthRight"].v);
    				$$invalidate(16, cBWRu = currentStyle["borderWidthRight"].u);
    				if (!currentStyle["borderWidthBottom"]) $$invalidate(14, currentStyle["borderWidthBottom"] = { v: 2, u: "px" }, currentStyle);
    				$$invalidate(3, cBWB = currentStyle["borderWidthBottom"].v);
    				$$invalidate(17, cBWBu = currentStyle["borderWidthBottom"].u);
    				if (!currentStyle["borderWidthLeft"]) $$invalidate(14, currentStyle["borderWidthLeft"] = { v: 2, u: "px" }, currentStyle);
    				$$invalidate(4, cBWL = currentStyle["borderWidthLeft"].v);
    				$$invalidate(18, cBWLu = currentStyle["borderWidthLeft"].u);
    				$$invalidate(19, cBWAvg = (cBWT + cBWR + cBWB + cBWL) / 4);

    				// border radius
    				if (!currentStyle["borderRadiusTop"]) $$invalidate(14, currentStyle["borderRadiusTop"] = { v: 18, u: "pt" }, currentStyle);

    				$$invalidate(5, cBRT = currentStyle["borderRadiusTop"].v);
    				$$invalidate(20, cBRTu = currentStyle["borderRadiusTop"].u);
    				if (!currentStyle["borderRadiusRight"]) $$invalidate(14, currentStyle["borderRadiusRight"] = { v: 18, u: "pt" }, currentStyle);
    				$$invalidate(6, cBRR = currentStyle["borderRadiusRight"].v);
    				$$invalidate(21, cBRRu = currentStyle["borderRadiusRight"].u);
    				if (!currentStyle["borderRadiusBottom"]) $$invalidate(14, currentStyle["borderRadiusBottom"] = { v: 18, u: "pt" }, currentStyle);
    				$$invalidate(7, cBRB = currentStyle["borderRadiusBottom"].v);
    				$$invalidate(22, cBRBu = currentStyle["borderRadiusBottom"].u);
    				if (!currentStyle["borderRadiusLeft"]) $$invalidate(14, currentStyle["borderRadiusLeft"] = { v: 18, u: "pt" }, currentStyle);
    				$$invalidate(8, cBRL = currentStyle["borderRadiusLeft"].v);
    				$$invalidate(23, cBRLu = currentStyle["borderRadiusLeft"].u);
    				$$invalidate(24, cBRAvg = (cBRT + cBRR + cBRB + cBRL) / 4);

    				// border color
    				if (!currentStyle["borderColor"]) $$invalidate(14, currentStyle["borderColor"] = clr, currentStyle);

    				$$invalidate(9, clr = currentStyle["borderColor"]);

    				// border style
    				if (!currentStyle["borderStyleTop"]) $$invalidate(14, currentStyle["borderStyleTop"] = styleTop, currentStyle);

    				$$invalidate(10, styleTop = currentStyle["borderStyleTop"]);
    				if (!currentStyle["borderStyleRight"]) $$invalidate(14, currentStyle["borderStyleRight"] = styleRight, currentStyle);
    				$$invalidate(11, styleRight = currentStyle["borderStyleRight"]);
    				if (!currentStyle["borderStyleBottom"]) $$invalidate(14, currentStyle["borderStyleBottom"] = styleBottom, currentStyle);
    				$$invalidate(12, styleBottom = currentStyle["borderStyleBottom"]);
    				if (!currentStyle["borderStyleLeft"]) $$invalidate(14, currentStyle["borderStyleLeft"] = styleLeft, currentStyle);
    				$$invalidate(13, styleLeft = currentStyle["borderStyleLeft"]);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*currentStyle*/ 16384 | $$self.$$.dirty[1] & /*$mainColorPickerData*/ 2) {
    			// update color picker based on if the shadow is enabled or not
    			if (!currentStyle.USEBORDER && $mainColorPickerData.colorRefName === "borderColor") {
    				// if the current style doesn't use this editor, clear ref
    				clearColorPickerRef();
    			}
    		}
    	};

    	return [
    		currentParentWidth,
    		cBWT,
    		cBWR,
    		cBWB,
    		cBWL,
    		cBRT,
    		cBRR,
    		cBRB,
    		cBRL,
    		clr,
    		styleTop,
    		styleRight,
    		styleBottom,
    		styleLeft,
    		currentStyle,
    		cBWTu,
    		cBWRu,
    		cBWBu,
    		cBWLu,
    		cBWAvg,
    		cBRTu,
    		cBRRu,
    		cBRBu,
    		cBRLu,
    		cBRAvg,
    		possibleStyles,
    		toggleUseBorder,
    		updateBorderWidth,
    		updateBorderWidthAll,
    		updateBorderRadius,
    		updateBorderRadiusAll,
    		updateStyle,
    		$mainColorPickerData,
    		$selectedComponent,
    		$collection,
    		$selectedOverride,
    		updateValue_handler,
    		updateValue_handler_1,
    		updateValue_handler_2,
    		updateValue_handler_3,
    		updateValue_handler_4,
    		updateValue_handler_5,
    		updateValue_handler_6,
    		updateValue_handler_7,
    		updateValue_handler_8,
    		updateValue_handler_9,
    		updateValue_handler_10,
    		updateValue_handler_11
    	];
    }

    class BorderEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, { currentParentWidth: 0 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BorderEditor",
    			options,
    			id: create_fragment$m.name
    		});
    	}

    	get currentParentWidth() {
    		throw new Error("<BorderEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParentWidth(value) {
    		throw new Error("<BorderEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/OutlineEditor.svelte generated by Svelte v3.48.0 */

    const file$l = "src/components/ctrlMenuItems/StyleEditors/OutlineEditor.svelte";

    // (175:4) {#if currentStyle.USEOUTLINE}
    function create_if_block$8(ctx) {
    	let section0;
    	let slider0;
    	let t0;
    	let unitinput0;
    	let t1;
    	let div0;
    	let t2;
    	let section1;
    	let slider1;
    	let t3;
    	let unitinput1;
    	let t4;
    	let div1;
    	let t5;
    	let t6;
    	let div2;
    	let t7;
    	let section2;
    	let colorpicker;
    	let t8;
    	let section3;
    	let dropdown;
    	let t9;
    	let div3;
    	let current;

    	slider0 = new Slider({
    			props: {
    				name: "Width",
    				min: 0,
    				max: 200,
    				v: /*cOW*/ ctx[8],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0],
    				colorRef: /*clr*/ ctx[5]
    			},
    			$$inline: true
    		});

    	slider0.$on("updateValue", /*updateOutlineWidth*/ ctx[19]);

    	unitinput0 = new UnitInput({
    			props: {
    				name: "",
    				v: /*cOW*/ ctx[8],
    				currentUnit: /*cOWu*/ ctx[9],
    				hasMargin: false,
    				maxWidth: "120px",
    				minWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput0.$on("updateValue", /*updateValue_handler*/ ctx[28]);

    	slider1 = new Slider({
    			props: {
    				name: "Offset",
    				min: 0,
    				max: 100,
    				v: /*cOFF*/ ctx[10],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0],
    				colorRef: /*clr*/ ctx[5]
    			},
    			$$inline: true
    		});

    	slider1.$on("updateValue", /*updateOutlineOffset*/ ctx[20]);

    	unitinput1 = new UnitInput({
    			props: {
    				name: "",
    				v: /*cOFF*/ ctx[10],
    				currentUnit: /*cOFFu*/ ctx[11],
    				hasMargin: false,
    				maxWidth: "120px",
    				minWidth: "70px",
    				useFC: false,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput1.$on("updateValue", /*updateValue_handler_1*/ ctx[29]);
    	let if_block = !/*currentStyle*/ ctx[7].USEBORDER && create_if_block_1$5(ctx);

    	colorpicker = new ColorPicker({
    			props: {
    				name: "Color",
    				propertyName: "Outline",
    				propertyRef: "outlineColor",
    				clr: /*clr*/ ctx[5]
    			},
    			$$inline: true
    		});

    	dropdown = new Dropdown({
    			props: {
    				name: "Style",
    				sub: false,
    				hasMargin: true,
    				v: /*style*/ ctx[6],
    				possibleValues: /*possibleStyles*/ ctx[17]
    			},
    			$$inline: true
    		});

    	dropdown.$on("updateValue", /*updateValue_handler_6*/ ctx[34]);

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			create_component(slider0.$$.fragment);
    			t0 = space();
    			create_component(unitinput0.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			section1 = element("section");
    			create_component(slider1.$$.fragment);
    			t3 = space();
    			create_component(unitinput1.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			if (if_block) if_block.c();
    			t6 = space();
    			div2 = element("div");
    			t7 = space();
    			section2 = element("section");
    			create_component(colorpicker.$$.fragment);
    			t8 = space();
    			section3 = element("section");
    			create_component(dropdown.$$.fragment);
    			t9 = space();
    			div3 = element("div");
    			attr_dev(section0, "class", "svelte-nweiq6");
    			add_location(section0, file$l, 175, 8, 8729);
    			attr_dev(div0, "class", "spcaer");
    			add_location(div0, file$l, 180, 8, 9124);
    			attr_dev(section1, "class", "svelte-nweiq6");
    			add_location(section1, file$l, 182, 8, 9160);
    			attr_dev(div1, "class", "spcaer");
    			add_location(div1, file$l, 187, 8, 9561);
    			attr_dev(div2, "class", "spcaer");
    			add_location(div2, file$l, 200, 8, 10778);
    			attr_dev(section2, "class", "svelte-nweiq6");
    			add_location(section2, file$l, 203, 8, 10844);
    			attr_dev(section3, "class", "svelte-nweiq6");
    			add_location(section3, file$l, 207, 8, 10987);
    			set_style(div3, "height", "7px");
    			add_location(div3, file$l, 211, 8, 11178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			mount_component(slider0, section0, null);
    			append_dev(section0, t0);
    			mount_component(unitinput0, section0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, section1, anchor);
    			mount_component(slider1, section1, null);
    			append_dev(section1, t3);
    			mount_component(unitinput1, section1, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div1, anchor);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div2, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, section2, anchor);
    			mount_component(colorpicker, section2, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, section3, anchor);
    			mount_component(dropdown, section3, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div3, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider0_changes = {};
    			if (dirty[0] & /*cOW*/ 256) slider0_changes.v = /*cOW*/ ctx[8];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider0_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			if (dirty[0] & /*clr*/ 32) slider0_changes.colorRef = /*clr*/ ctx[5];
    			slider0.$set(slider0_changes);
    			const unitinput0_changes = {};
    			if (dirty[0] & /*cOW*/ 256) unitinput0_changes.v = /*cOW*/ ctx[8];
    			if (dirty[0] & /*cOWu*/ 512) unitinput0_changes.currentUnit = /*cOWu*/ ctx[9];
    			unitinput0.$set(unitinput0_changes);
    			const slider1_changes = {};
    			if (dirty[0] & /*cOFF*/ 1024) slider1_changes.v = /*cOFF*/ ctx[10];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider1_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			if (dirty[0] & /*clr*/ 32) slider1_changes.colorRef = /*clr*/ ctx[5];
    			slider1.$set(slider1_changes);
    			const unitinput1_changes = {};
    			if (dirty[0] & /*cOFF*/ 1024) unitinput1_changes.v = /*cOFF*/ ctx[10];
    			if (dirty[0] & /*cOFFu*/ 2048) unitinput1_changes.currentUnit = /*cOFFu*/ ctx[11];
    			unitinput1.$set(unitinput1_changes);

    			if (!/*currentStyle*/ ctx[7].USEBORDER) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*currentStyle*/ 128) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t6.parentNode, t6);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const colorpicker_changes = {};
    			if (dirty[0] & /*clr*/ 32) colorpicker_changes.clr = /*clr*/ ctx[5];
    			colorpicker.$set(colorpicker_changes);
    			const dropdown_changes = {};
    			if (dirty[0] & /*style*/ 64) dropdown_changes.v = /*style*/ ctx[6];
    			dropdown.$set(dropdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider0.$$.fragment, local);
    			transition_in(unitinput0.$$.fragment, local);
    			transition_in(slider1.$$.fragment, local);
    			transition_in(unitinput1.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(colorpicker.$$.fragment, local);
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider0.$$.fragment, local);
    			transition_out(unitinput0.$$.fragment, local);
    			transition_out(slider1.$$.fragment, local);
    			transition_out(unitinput1.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(colorpicker.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_component(slider0);
    			destroy_component(unitinput0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(section1);
    			destroy_component(slider1);
    			destroy_component(unitinput1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(section2);
    			destroy_component(colorpicker);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(section3);
    			destroy_component(dropdown);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(175:4) {#if currentStyle.USEOUTLINE}",
    		ctx
    	});

    	return block;
    }

    // (191:8) {#if !currentStyle.USEBORDER}
    function create_if_block_1$5(ctx) {
    	let section;
    	let slider;
    	let t0;
    	let unitinput0;
    	let t1;
    	let unitinput1;
    	let t2;
    	let unitinput2;
    	let t3;
    	let unitinput3;
    	let current;

    	slider = new Slider({
    			props: {
    				name: "Radius",
    				min: 0,
    				max: 200,
    				v: /*cBRAvg*/ ctx[16],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0],
    				colorRef: /*clr*/ ctx[5]
    			},
    			$$inline: true
    		});

    	slider.$on("updateValue", /*updateBorderRadiusAll*/ ctx[22]);

    	unitinput0 = new UnitInput({
    			props: {
    				name: "Top",
    				v: /*cBRT*/ ctx[1],
    				currentUnit: /*cBRTu*/ ctx[12],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput0.$on("updateValue", /*updateValue_handler_2*/ ctx[30]);

    	unitinput1 = new UnitInput({
    			props: {
    				name: "Right",
    				v: /*cBRR*/ ctx[2],
    				currentUnit: /*cBRRu*/ ctx[13],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput1.$on("updateValue", /*updateValue_handler_3*/ ctx[31]);

    	unitinput2 = new UnitInput({
    			props: {
    				name: "Bottom",
    				v: /*cBRB*/ ctx[3],
    				currentUnit: /*cBRBu*/ ctx[14],
    				hasMargin: true,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput2.$on("updateValue", /*updateValue_handler_4*/ ctx[32]);

    	unitinput3 = new UnitInput({
    			props: {
    				name: "Left",
    				v: /*cBRL*/ ctx[4],
    				currentUnit: /*cBRLu*/ ctx[15],
    				hasMargin: false,
    				maxWidth: "70px",
    				useFC: false,
    				usePercent: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput3.$on("updateValue", /*updateValue_handler_5*/ ctx[33]);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(slider.$$.fragment);
    			t0 = space();
    			create_component(unitinput0.$$.fragment);
    			t1 = space();
    			create_component(unitinput1.$$.fragment);
    			t2 = space();
    			create_component(unitinput2.$$.fragment);
    			t3 = space();
    			create_component(unitinput3.$$.fragment);
    			attr_dev(section, "class", "svelte-nweiq6");
    			add_location(section, file$l, 191, 12, 9721);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(slider, section, null);
    			append_dev(section, t0);
    			mount_component(unitinput0, section, null);
    			append_dev(section, t1);
    			mount_component(unitinput1, section, null);
    			append_dev(section, t2);
    			mount_component(unitinput2, section, null);
    			append_dev(section, t3);
    			mount_component(unitinput3, section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const slider_changes = {};
    			if (dirty[0] & /*cBRAvg*/ 65536) slider_changes.v = /*cBRAvg*/ ctx[16];
    			if (dirty[0] & /*currentParentWidth*/ 1) slider_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			if (dirty[0] & /*clr*/ 32) slider_changes.colorRef = /*clr*/ ctx[5];
    			slider.$set(slider_changes);
    			const unitinput0_changes = {};
    			if (dirty[0] & /*cBRT*/ 2) unitinput0_changes.v = /*cBRT*/ ctx[1];
    			if (dirty[0] & /*cBRTu*/ 4096) unitinput0_changes.currentUnit = /*cBRTu*/ ctx[12];
    			unitinput0.$set(unitinput0_changes);
    			const unitinput1_changes = {};
    			if (dirty[0] & /*cBRR*/ 4) unitinput1_changes.v = /*cBRR*/ ctx[2];
    			if (dirty[0] & /*cBRRu*/ 8192) unitinput1_changes.currentUnit = /*cBRRu*/ ctx[13];
    			unitinput1.$set(unitinput1_changes);
    			const unitinput2_changes = {};
    			if (dirty[0] & /*cBRB*/ 8) unitinput2_changes.v = /*cBRB*/ ctx[3];
    			if (dirty[0] & /*cBRBu*/ 16384) unitinput2_changes.currentUnit = /*cBRBu*/ ctx[14];
    			unitinput2.$set(unitinput2_changes);
    			const unitinput3_changes = {};
    			if (dirty[0] & /*cBRL*/ 16) unitinput3_changes.v = /*cBRL*/ ctx[4];
    			if (dirty[0] & /*cBRLu*/ 32768) unitinput3_changes.currentUnit = /*cBRLu*/ ctx[15];
    			unitinput3.$set(unitinput3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			transition_in(unitinput0.$$.fragment, local);
    			transition_in(unitinput1.$$.fragment, local);
    			transition_in(unitinput2.$$.fragment, local);
    			transition_in(unitinput3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			transition_out(unitinput0.$$.fragment, local);
    			transition_out(unitinput1.$$.fragment, local);
    			transition_out(unitinput2.$$.fragment, local);
    			transition_out(unitinput3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(slider);
    			destroy_component(unitinput0);
    			destroy_component(unitinput1);
    			destroy_component(unitinput2);
    			destroy_component(unitinput3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(191:8) {#if !currentStyle.USEBORDER}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let main;
    	let section1;
    	let h1;
    	let t1;
    	let section0;
    	let input;
    	let input_checked_value;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*currentStyle*/ ctx[7].USEOUTLINE && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section1 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Outline";
    			t1 = space();
    			section0 = element("section");
    			input = element("input");
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-nweiq6");
    			add_location(h1, file$l, 165, 8, 8324);
    			attr_dev(input, "type", "checkbox");
    			input.checked = input_checked_value = /*currentStyle*/ ctx[7].USEOUTLINE;
    			attr_dev(input, "class", "svelte-nweiq6");
    			add_location(input, file$l, 168, 12, 8393);
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/checkmark.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			set_style(img, "opacity", /*currentStyle*/ ctx[7].USEOUTLINE ? "1" : "0");
    			attr_dev(img, "class", "svelte-nweiq6");
    			add_location(img, file$l, 169, 12, 8491);
    			attr_dev(section0, "id", "check-container");
    			attr_dev(section0, "class", "svelte-nweiq6");
    			add_location(section0, file$l, 167, 8, 8350);
    			attr_dev(section1, "id", "title-container");
    			attr_dev(section1, "class", "svelte-nweiq6");
    			add_location(section1, file$l, 164, 4, 8285);
    			attr_dev(main, "class", "no-drag svelte-nweiq6");
    			add_location(main, file$l, 162, 0, 8225);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section1);
    			append_dev(section1, h1);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, input);
    			append_dev(section0, t2);
    			append_dev(section0, img);
    			append_dev(main, t3);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*toggleUseOutline*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*currentStyle*/ 128 && input_checked_value !== (input_checked_value = /*currentStyle*/ ctx[7].USEOUTLINE)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (!current || dirty[0] & /*currentStyle*/ 128) {
    				set_style(img, "opacity", /*currentStyle*/ ctx[7].USEOUTLINE ? "1" : "0");
    			}

    			if (/*currentStyle*/ ctx[7].USEOUTLINE) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*currentStyle*/ 128) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let $mainColorPickerData;
    	let $selectedComponent;
    	let $collection;
    	let $selectedOverride;
    	validate_store(mainColorPickerData, 'mainColorPickerData');
    	component_subscribe($$self, mainColorPickerData, $$value => $$invalidate(24, $mainColorPickerData = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(25, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(26, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(27, $selectedOverride = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OutlineEditor', slots, []);
    	let { currentParentWidth = 360 } = $$props;
    	let cOW = 0;
    	let cOWu = "px"; // cBW = current outline width
    	let cOFF = 0;
    	let cOFFu = "px"; // cBW = current outline width
    	let cBRT = 0;
    	let cBRTu = "px"; // cBR = current outline radius
    	let cBRR = 0;
    	let cBRRu = "px"; // cBR = current outline radius
    	let cBRB = 0;
    	let cBRBu = "px"; // cBR = current outline radius
    	let cBRL = 0;
    	let cBRLu = "px"; // cBR = current outline radius
    	let cBRAvg = 0;

    	let clr = {
    		type: "hsl",
    		r: 58,
    		g: 101,
    		b: 243,
    		h: 226,
    		s: 88,
    		l: 59,
    		a: 100,
    		hex: "3a65f3"
    	};

    	// this has to be a subset of the borderOutlineStyle type set in $collection
    	const possibleStyles = ["dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "hidden"];

    	let style = "solid";

    	const toggleUseOutline = () => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEOUTLINE`] = !$collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEOUTLINE`], $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`USEOUTLINE`] = !$collection[$selectedComponent].style[`USEOUTLINE`], $collection);
    		}
    	};

    	const updateOutlineWidth = evt => {
    		var _a, _b;

    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			let unit = (_a = evt.detail.u) !== null && _a !== void 0
    			? _a
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineWidth"].u;

    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineWidth"] = { v: evt.detail.v, u: unit }, $collection);
    		} else {
    			let unit = (_b = evt.detail.u) !== null && _b !== void 0
    			? _b
    			: $collection[$selectedComponent].style["outlineWidth"].u;

    			set_store_value(collection, $collection[$selectedComponent].style["outlineWidth"] = { v: evt.detail.v, u: unit }, $collection);
    		}

    		updateGeneralAppearance();
    	};

    	const updateOutlineOffset = evt => {
    		var _a, _b;

    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			let unit = (_a = evt.detail.u) !== null && _a !== void 0
    			? _a
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineOffset"].u;

    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineOffset"] = { v: evt.detail.v, u: unit }, $collection);
    		} else {
    			let unit = (_b = evt.detail.u) !== null && _b !== void 0
    			? _b
    			: $collection[$selectedComponent].style["outlineOffset"].u;

    			set_store_value(collection, $collection[$selectedComponent].style["outlineOffset"] = { v: evt.detail.v, u: unit }, $collection);
    		}

    		updateGeneralAppearance();
    	};

    	const updateGeneralAppearance = () => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(
    				collection,
    				$collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"] = {
    					v: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v + 0.01,
    					u: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].u
    				},
    				$collection
    			);

    			setTimeout(
    				() => {
    					set_store_value(
    						collection,
    						$collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"] = {
    							v: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v - 0.01,
    							u: $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].u
    						},
    						$collection
    					);
    				},
    				1
    			);
    		} else {
    			set_store_value(
    				collection,
    				$collection[$selectedComponent].style["width"] = {
    					v: $collection[$selectedComponent].style["width"].v + 0.01,
    					u: $collection[$selectedComponent].style["width"].u
    				},
    				$collection
    			);

    			setTimeout(
    				() => {
    					set_store_value(
    						collection,
    						$collection[$selectedComponent].style["width"] = {
    							v: $collection[$selectedComponent].style["width"].v - 0.01,
    							u: $collection[$selectedComponent].style["width"].u
    						},
    						$collection
    					);
    				},
    				1
    			);
    		}
    	};

    	const updateBorderRadius = (evt, direction) => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`borderRadius${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`borderRadius${direction}`] = { v: evt.detail.v, u: evt.detail.u }, $collection);
    		}
    	};

    	const updateBorderRadiusAll = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusTop"].v = evt.detail.v, $collection);

    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusRight"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusBottom"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["borderRadiusLeft"].v = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusTop"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusRight"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusBottom"].v = evt.detail.v, $collection);
    			set_store_value(collection, $collection[$selectedComponent].style["borderRadiusLeft"].v = evt.detail.v, $collection);
    		}
    	};

    	const updateStyle = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineStyle"] = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["outlineStyle"] = evt.detail.v, $collection);
    		}
    	};

    	const writable_props = ['currentParentWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<OutlineEditor> was created with unknown prop '${key}'`);
    	});

    	const updateValue_handler = evt => updateOutlineWidth(evt);
    	const updateValue_handler_1 = evt => updateOutlineOffset(evt);
    	const updateValue_handler_2 = evt => updateBorderRadius(evt, "Top");
    	const updateValue_handler_3 = evt => updateBorderRadius(evt, "Right");
    	const updateValue_handler_4 = evt => updateBorderRadius(evt, "Bottom");
    	const updateValue_handler_5 = evt => updateBorderRadius(evt, "Left");
    	const updateValue_handler_6 = e => updateStyle(e);

    	$$self.$$set = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		Slider,
    		UnitInput,
    		ColorPicker,
    		Dropdown,
    		clearColorPickerRef,
    		mainColorPickerData,
    		currentParentWidth,
    		cOW,
    		cOWu,
    		cOFF,
    		cOFFu,
    		cBRT,
    		cBRTu,
    		cBRR,
    		cBRRu,
    		cBRB,
    		cBRBu,
    		cBRL,
    		cBRLu,
    		cBRAvg,
    		clr,
    		possibleStyles,
    		style,
    		toggleUseOutline,
    		updateOutlineWidth,
    		updateOutlineOffset,
    		updateGeneralAppearance,
    		updateBorderRadius,
    		updateBorderRadiusAll,
    		updateStyle,
    		currentStyle,
    		$mainColorPickerData,
    		$selectedComponent,
    		$collection,
    		$selectedOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    		if ('cOW' in $$props) $$invalidate(8, cOW = $$props.cOW);
    		if ('cOWu' in $$props) $$invalidate(9, cOWu = $$props.cOWu);
    		if ('cOFF' in $$props) $$invalidate(10, cOFF = $$props.cOFF);
    		if ('cOFFu' in $$props) $$invalidate(11, cOFFu = $$props.cOFFu);
    		if ('cBRT' in $$props) $$invalidate(1, cBRT = $$props.cBRT);
    		if ('cBRTu' in $$props) $$invalidate(12, cBRTu = $$props.cBRTu);
    		if ('cBRR' in $$props) $$invalidate(2, cBRR = $$props.cBRR);
    		if ('cBRRu' in $$props) $$invalidate(13, cBRRu = $$props.cBRRu);
    		if ('cBRB' in $$props) $$invalidate(3, cBRB = $$props.cBRB);
    		if ('cBRBu' in $$props) $$invalidate(14, cBRBu = $$props.cBRBu);
    		if ('cBRL' in $$props) $$invalidate(4, cBRL = $$props.cBRL);
    		if ('cBRLu' in $$props) $$invalidate(15, cBRLu = $$props.cBRLu);
    		if ('cBRAvg' in $$props) $$invalidate(16, cBRAvg = $$props.cBRAvg);
    		if ('clr' in $$props) $$invalidate(5, clr = $$props.clr);
    		if ('style' in $$props) $$invalidate(6, style = $$props.style);
    		if ('currentStyle' in $$props) $$invalidate(7, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$selectedOverride, $collection, $selectedComponent*/ 234881024) {
    			// reactive
    			$$invalidate(7, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty[0] & /*currentStyle, cBRT, cBRR, cBRB, cBRL, clr, style*/ 254) {
    			if (!!currentStyle) {
    				// these variables just make the code look nicer
    				// use outline
    				$$invalidate(7, currentStyle["USEOUTLINE"] = !!currentStyle["USEOUTLINE"], currentStyle); // boolean initialization weirdness

    				// currentStyle["USEOUTLINE"] = true; // debugging force open
    				// outline width
    				if (!currentStyle["outlineWidth"]) $$invalidate(7, currentStyle["outlineWidth"] = { v: 2.5, u: "px" }, currentStyle);

    				$$invalidate(8, cOW = currentStyle["outlineWidth"].v);
    				$$invalidate(9, cOWu = currentStyle["outlineWidth"].u);

    				// border radius (yes border radius also control the outline radius for some reason)
    				if (!currentStyle["borderRadiusTop"]) $$invalidate(7, currentStyle["borderRadiusTop"] = { v: 18, u: "pt" }, currentStyle);

    				$$invalidate(1, cBRT = currentStyle["borderRadiusTop"].v);
    				$$invalidate(12, cBRTu = currentStyle["borderRadiusTop"].u);
    				if (!currentStyle["borderRadiusRight"]) $$invalidate(7, currentStyle["borderRadiusRight"] = { v: 18, u: "pt" }, currentStyle);
    				$$invalidate(2, cBRR = currentStyle["borderRadiusRight"].v);
    				$$invalidate(13, cBRRu = currentStyle["borderRadiusRight"].u);
    				if (!currentStyle["borderRadiusBottom"]) $$invalidate(7, currentStyle["borderRadiusBottom"] = { v: 18, u: "pt" }, currentStyle);
    				$$invalidate(3, cBRB = currentStyle["borderRadiusBottom"].v);
    				$$invalidate(14, cBRBu = currentStyle["borderRadiusBottom"].u);
    				if (!currentStyle["borderRadiusLeft"]) $$invalidate(7, currentStyle["borderRadiusLeft"] = { v: 18, u: "pt" }, currentStyle);
    				$$invalidate(4, cBRL = currentStyle["borderRadiusLeft"].v);
    				$$invalidate(15, cBRLu = currentStyle["borderRadiusLeft"].u);
    				$$invalidate(16, cBRAvg = (cBRT + cBRR + cBRB + cBRL) / 4);

    				// outline offset
    				if (!currentStyle["outlineOffset"]) $$invalidate(7, currentStyle["outlineOffset"] = { v: 2, u: "px" }, currentStyle);

    				$$invalidate(10, cOFF = currentStyle["outlineOffset"].v);
    				$$invalidate(11, cOFFu = currentStyle["outlineOffset"].u);

    				// outline color
    				if (!currentStyle["outlineColor"]) $$invalidate(7, currentStyle["outlineColor"] = clr, currentStyle);

    				$$invalidate(5, clr = currentStyle["outlineColor"]);

    				// outline style
    				if (!currentStyle["outlineStyle"]) $$invalidate(7, currentStyle["outlineStyle"] = style, currentStyle);

    				$$invalidate(6, style = currentStyle["outlineStyle"]);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*currentStyle, $mainColorPickerData*/ 16777344) {
    			// update color picker based on if the shadow is enabled or not
    			if (!currentStyle.USEOUTLINE && $mainColorPickerData.colorRefName === "outlineColor") {
    				// if the current style doesn't use this editor, clear ref
    				clearColorPickerRef();
    			}
    		}
    	};

    	return [
    		currentParentWidth,
    		cBRT,
    		cBRR,
    		cBRB,
    		cBRL,
    		clr,
    		style,
    		currentStyle,
    		cOW,
    		cOWu,
    		cOFF,
    		cOFFu,
    		cBRTu,
    		cBRRu,
    		cBRBu,
    		cBRLu,
    		cBRAvg,
    		possibleStyles,
    		toggleUseOutline,
    		updateOutlineWidth,
    		updateOutlineOffset,
    		updateBorderRadius,
    		updateBorderRadiusAll,
    		updateStyle,
    		$mainColorPickerData,
    		$selectedComponent,
    		$collection,
    		$selectedOverride,
    		updateValue_handler,
    		updateValue_handler_1,
    		updateValue_handler_2,
    		updateValue_handler_3,
    		updateValue_handler_4,
    		updateValue_handler_5,
    		updateValue_handler_6
    	];
    }

    class OutlineEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, { currentParentWidth: 0 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OutlineEditor",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get currentParentWidth() {
    		throw new Error("<OutlineEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParentWidth(value) {
    		throw new Error("<OutlineEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/BackgroundEditor.svelte generated by Svelte v3.48.0 */

    const file$k = "src/components/ctrlMenuItems/StyleEditors/BackgroundEditor.svelte";

    // (44:4) {#if currentStyle.USEBACKGROUND}
    function create_if_block$7(ctx) {
    	let section;
    	let colorpicker;
    	let t;
    	let div;
    	let current;

    	colorpicker = new ColorPicker({
    			props: {
    				name: "Color",
    				propertyName: "Background",
    				propertyRef: "backgroundColor",
    				clr: /*clr*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(colorpicker.$$.fragment);
    			t = space();
    			div = element("div");
    			attr_dev(section, "class", "svelte-ckave6");
    			add_location(section, file$k, 45, 8, 2247);
    			set_style(div, "height", "7px");
    			add_location(div, file$k, 49, 8, 2396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(colorpicker, section, null);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const colorpicker_changes = {};
    			if (dirty & /*clr*/ 1) colorpicker_changes.clr = /*clr*/ ctx[0];
    			colorpicker.$set(colorpicker_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(colorpicker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(colorpicker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(colorpicker);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(44:4) {#if currentStyle.USEBACKGROUND}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let main;
    	let section1;
    	let h1;
    	let t1;
    	let section0;
    	let input;
    	let input_checked_value;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*currentStyle*/ ctx[1].USEBACKGROUND && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section1 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Background";
    			t1 = space();
    			section0 = element("section");
    			input = element("input");
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(h1, "class", "svelte-ckave6");
    			add_location(h1, file$k, 34, 8, 1793);
    			attr_dev(input, "type", "checkbox");
    			input.checked = input_checked_value = /*currentStyle*/ ctx[1].USEBACKGROUND;
    			attr_dev(input, "class", "svelte-ckave6");
    			add_location(input, file$k, 37, 12, 1865);
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/checkmark.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			set_style(img, "opacity", /*currentStyle*/ ctx[1].USEBACKGROUND ? "1" : "0");
    			attr_dev(img, "class", "svelte-ckave6");
    			add_location(img, file$k, 38, 12, 1969);
    			attr_dev(section0, "id", "check-container");
    			attr_dev(section0, "class", "svelte-ckave6");
    			add_location(section0, file$k, 36, 8, 1822);
    			attr_dev(section1, "id", "title-container");
    			attr_dev(section1, "class", "svelte-ckave6");
    			add_location(section1, file$k, 33, 4, 1754);
    			attr_dev(main, "class", "no-drag svelte-ckave6");
    			add_location(main, file$k, 31, 0, 1694);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section1);
    			append_dev(section1, h1);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, input);
    			append_dev(section0, t2);
    			append_dev(section0, img);
    			append_dev(main, t3);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*toggleUseBackground*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*currentStyle*/ 2 && input_checked_value !== (input_checked_value = /*currentStyle*/ ctx[1].USEBACKGROUND)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (!current || dirty & /*currentStyle*/ 2) {
    				set_style(img, "opacity", /*currentStyle*/ ctx[1].USEBACKGROUND ? "1" : "0");
    			}

    			if (/*currentStyle*/ ctx[1].USEBACKGROUND) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*currentStyle*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let $mainColorPickerData;
    	let $selectedComponent;
    	let $collection;
    	let $selectedOverride;
    	validate_store(mainColorPickerData, 'mainColorPickerData');
    	component_subscribe($$self, mainColorPickerData, $$value => $$invalidate(4, $mainColorPickerData = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(5, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(6, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(7, $selectedOverride = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BackgroundEditor', slots, []);
    	let { currentParentWidth = 360 } = $$props;

    	let clr = {
    		type: "hsl",
    		r: 255,
    		g: 255,
    		b: 255,
    		h: 0,
    		s: 0,
    		l: 100,
    		a: 100,
    		hex: "ffffff"
    	};

    	const toggleUseBackground = () => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBACKGROUND`] = !$collection[$selectedComponent].styleOverrides[$selectedOverride].style[`USEBACKGROUND`], $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`USEBACKGROUND`] = !$collection[$selectedComponent].style[`USEBACKGROUND`], $collection);
    		}
    	};

    	const writable_props = ['currentParentWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BackgroundEditor> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(3, currentParentWidth = $$props.currentParentWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		ColorPicker,
    		clearColorPickerRef,
    		mainColorPickerData,
    		currentParentWidth,
    		clr,
    		toggleUseBackground,
    		currentStyle,
    		$mainColorPickerData,
    		$selectedComponent,
    		$collection,
    		$selectedOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(3, currentParentWidth = $$props.currentParentWidth);
    		if ('clr' in $$props) $$invalidate(0, clr = $$props.clr);
    		if ('currentStyle' in $$props) $$invalidate(1, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedOverride, $collection, $selectedComponent*/ 224) {
    			// reactive
    			$$invalidate(1, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty & /*currentStyle, clr*/ 3) {
    			if (!!currentStyle) {
    				// these variables just make the code look nicer
    				// use background
    				$$invalidate(1, currentStyle["USEBACKGROUND"] = !!currentStyle["USEBACKGROUND"], currentStyle); // boolean initialization weirdness

    				// currentStyle["USEBACKGROUND"] = true; // debugging force open
    				// background color
    				if (!currentStyle["backgroundColor"]) $$invalidate(1, currentStyle["backgroundColor"] = clr, currentStyle);

    				$$invalidate(0, clr = currentStyle["backgroundColor"]);
    			}
    		}

    		if ($$self.$$.dirty & /*currentStyle, $mainColorPickerData*/ 18) {
    			// update color picker based on if the shadow is enabled or not
    			if (!currentStyle.USEBACKGROUND && $mainColorPickerData.colorRefName === "backgroundColor") {
    				// if the current style doesn't use this editor, clear ref
    				clearColorPickerRef();
    			}
    		}
    	};

    	return [
    		clr,
    		currentStyle,
    		toggleUseBackground,
    		currentParentWidth,
    		$mainColorPickerData,
    		$selectedComponent,
    		$collection,
    		$selectedOverride
    	];
    }

    class BackgroundEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { currentParentWidth: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackgroundEditor",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get currentParentWidth() {
    		throw new Error("<BackgroundEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParentWidth(value) {
    		throw new Error("<BackgroundEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/AppearanceEditor.svelte generated by Svelte v3.48.0 */
    const file$j = "src/components/ctrlMenuItems/StyleEditors/AppearanceEditor.svelte";

    function create_fragment$j(ctx) {
    	let main;
    	let section0;
    	let h1;
    	let t1;
    	let section1;
    	let slider;
    	let t2;
    	let valueinput;
    	let t3;
    	let div;
    	let t4;
    	let title;
    	let t5;
    	let section2;
    	let dropdown0;
    	let t6;
    	let dropdown1;
    	let current;

    	slider = new Slider({
    			props: {
    				name: "Opacity",
    				min: 0,
    				max: 100,
    				v: /*opacity*/ ctx[1],
    				hasMargin: true,
    				currentParentWidth: /*currentParentWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	slider.$on("updateValue", /*updateOpacity*/ ctx[5]);

    	valueinput = new ValueInput({
    			props: {
    				name: "",
    				v: /*opacity*/ ctx[1],
    				hasMargin: false,
    				maxWidth: "70px",
    				minWidth: "30px",
    				maxVal: 100,
    				minVal: 0,
    				sub: true,
    				align: "center"
    			},
    			$$inline: true
    		});

    	valueinput.$on("updateValue", /*updateOpacity*/ ctx[5]);

    	title = new Title({
    			props: { name: "Overflow" },
    			$$inline: true
    		});

    	dropdown0 = new Dropdown({
    			props: {
    				name: "Horizontal",
    				sub: true,
    				hasMargin: true,
    				v: /*overflowX*/ ctx[2],
    				possibleValues: /*possibleOverflowStyles*/ ctx[4]
    			},
    			$$inline: true
    		});

    	dropdown0.$on("updateValue", /*updateValue_handler*/ ctx[11]);

    	dropdown1 = new Dropdown({
    			props: {
    				name: "Vertical",
    				sub: true,
    				hasMargin: true,
    				v: /*overflowY*/ ctx[3],
    				possibleValues: /*possibleOverflowStyles*/ ctx[4]
    			},
    			$$inline: true
    		});

    	dropdown1.$on("updateValue", /*updateValue_handler_1*/ ctx[12]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section0 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Appearance";
    			t1 = space();
    			section1 = element("section");
    			create_component(slider.$$.fragment);
    			t2 = space();
    			create_component(valueinput.$$.fragment);
    			t3 = space();
    			div = element("div");
    			t4 = space();
    			create_component(title.$$.fragment);
    			t5 = space();
    			section2 = element("section");
    			create_component(dropdown0.$$.fragment);
    			t6 = space();
    			create_component(dropdown1.$$.fragment);
    			attr_dev(h1, "class", "svelte-l6ayzu");
    			add_location(h1, file$j, 51, 8, 2127);
    			attr_dev(section0, "id", "title-container");
    			attr_dev(section0, "class", "svelte-l6ayzu");
    			add_location(section0, file$j, 50, 4, 2088);
    			set_style(section1, "margin-bottom", "0px");
    			attr_dev(section1, "class", "svelte-l6ayzu");
    			add_location(section1, file$j, 55, 4, 2188);
    			attr_dev(div, "class", "spacer svelte-l6ayzu");
    			add_location(div, file$j, 60, 4, 2573);
    			attr_dev(section2, "class", "svelte-l6ayzu");
    			add_location(section2, file$j, 64, 4, 2656);
    			attr_dev(main, "class", "no-drag svelte-l6ayzu");
    			add_location(main, file$j, 48, 0, 2028);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			append_dev(section0, h1);
    			append_dev(main, t1);
    			append_dev(main, section1);
    			mount_component(slider, section1, null);
    			append_dev(section1, t2);
    			mount_component(valueinput, section1, null);
    			append_dev(main, t3);
    			append_dev(main, div);
    			append_dev(main, t4);
    			mount_component(title, main, null);
    			append_dev(main, t5);
    			append_dev(main, section2);
    			mount_component(dropdown0, section2, null);
    			append_dev(section2, t6);
    			mount_component(dropdown1, section2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slider_changes = {};
    			if (dirty & /*opacity*/ 2) slider_changes.v = /*opacity*/ ctx[1];
    			if (dirty & /*currentParentWidth*/ 1) slider_changes.currentParentWidth = /*currentParentWidth*/ ctx[0];
    			slider.$set(slider_changes);
    			const valueinput_changes = {};
    			if (dirty & /*opacity*/ 2) valueinput_changes.v = /*opacity*/ ctx[1];
    			valueinput.$set(valueinput_changes);
    			const dropdown0_changes = {};
    			if (dirty & /*overflowX*/ 4) dropdown0_changes.v = /*overflowX*/ ctx[2];
    			dropdown0.$set(dropdown0_changes);
    			const dropdown1_changes = {};
    			if (dirty & /*overflowY*/ 8) dropdown1_changes.v = /*overflowY*/ ctx[3];
    			dropdown1.$set(dropdown1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slider.$$.fragment, local);
    			transition_in(valueinput.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(dropdown0.$$.fragment, local);
    			transition_in(dropdown1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slider.$$.fragment, local);
    			transition_out(valueinput.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(dropdown0.$$.fragment, local);
    			transition_out(dropdown1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(slider);
    			destroy_component(valueinput);
    			destroy_component(title);
    			destroy_component(dropdown0);
    			destroy_component(dropdown1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let $selectedComponent;
    	let $collection;
    	let $selectedOverride;
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(8, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(9, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(10, $selectedOverride = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AppearanceEditor', slots, []);
    	let { currentParentWidth = 360 } = $$props;
    	const possibleOverflowStyles = ["auto", "hidden", "scroll", "visible"];
    	let opacity = 100;
    	let overflowX = "auto";
    	let overflowY = "auto";

    	const updateOpacity = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["opacity"] = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["opacity"] = evt.detail.v, $collection);
    		}
    	};

    	const updateOverflow = (evt, axis) => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style[`overflow${axis}`] = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style[`overflow${axis}`] = evt.detail.v, $collection);
    		}
    	};

    	const writable_props = ['currentParentWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AppearanceEditor> was created with unknown prop '${key}'`);
    	});

    	const updateValue_handler = e => updateOverflow(e, "X");
    	const updateValue_handler_1 = e => updateOverflow(e, "Y");

    	$$self.$$set = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		Slider,
    		Dropdown,
    		ValueInput,
    		Title,
    		currentParentWidth,
    		possibleOverflowStyles,
    		opacity,
    		overflowX,
    		overflowY,
    		updateOpacity,
    		updateOverflow,
    		currentStyle,
    		$selectedComponent,
    		$collection,
    		$selectedOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    		if ('opacity' in $$props) $$invalidate(1, opacity = $$props.opacity);
    		if ('overflowX' in $$props) $$invalidate(2, overflowX = $$props.overflowX);
    		if ('overflowY' in $$props) $$invalidate(3, overflowY = $$props.overflowY);
    		if ('currentStyle' in $$props) $$invalidate(7, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedOverride, $collection, $selectedComponent*/ 1792) {
    			// reactive
    			$$invalidate(7, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty & /*currentStyle, opacity, overflowX, overflowY*/ 142) {
    			if (!!currentStyle) {
    				// these variables just make the code look nicer
    				// use outline
    				$$invalidate(7, currentStyle["USEOUTLINE"] = !!currentStyle["USEOUTLINE"], currentStyle); // boolean initialization weirdness

    				// currentStyle["USEOUTLINE"] = true; // debugging force open
    				// opacity
    				if (!currentStyle["opacity"]) $$invalidate(7, currentStyle["opacity"] = opacity, currentStyle);

    				$$invalidate(1, opacity = currentStyle["opacity"]);

    				// overflows
    				if (!currentStyle["overflowX"]) $$invalidate(7, currentStyle["overflowX"] = overflowX, currentStyle);

    				$$invalidate(2, overflowX = currentStyle["overflowX"]);
    				if (!currentStyle["overflowY"]) $$invalidate(7, currentStyle["overflowY"] = overflowY, currentStyle);
    				$$invalidate(3, overflowY = currentStyle["overflowY"]);
    			}
    		}
    	};

    	return [
    		currentParentWidth,
    		opacity,
    		overflowX,
    		overflowY,
    		possibleOverflowStyles,
    		updateOpacity,
    		updateOverflow,
    		currentStyle,
    		$selectedComponent,
    		$collection,
    		$selectedOverride,
    		updateValue_handler,
    		updateValue_handler_1
    	];
    }

    class AppearanceEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { currentParentWidth: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppearanceEditor",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get currentParentWidth() {
    		throw new Error("<AppearanceEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParentWidth(value) {
    		throw new Error("<AppearanceEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/ShadowEditor.svelte generated by Svelte v3.48.0 */
    const file$i = "src/components/ctrlMenuItems/StyleEditors/ShadowEditor.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i];
    	child_ctx[37] = i;
    	return child_ctx;
    }

    // (155:4) {#if currentStyle.USESHADOW}
    function create_if_block$6(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$4, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*shadows*/ ctx[0].length === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(155:4) {#if currentStyle.USESHADOW}",
    		ctx
    	});

    	return block;
    }

    // (159:8) {:else}
    function create_else_block$2(ctx) {
    	let section;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let div;
    	let current;
    	let each_value = /*shadows*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*shadow*/ ctx[35];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div = element("div");
    			attr_dev(section, "id", "shadow-container");
    			attr_dev(section, "class", "svelte-j21kf4");
    			add_location(section, file$i, 159, 12, 6774);
    			set_style(div, "height", "5px");
    			attr_dev(div, "class", "svelte-j21kf4");
    			add_location(div, file$i, 233, 8, 11086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			/*section_binding*/ ctx[32](section);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*removeShadow, shadows, demuxID, showEditorIndicator, updateShadowProp, updateDemuxID, colorPreviewSquare, openOverlay*/ 7707) {
    				each_value = /*shadows*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, section, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*section_binding*/ ctx[32](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(159:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (157:8) {#if shadows.length === 0}
    function create_if_block_1$4(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "No shadows currently configured";
    			attr_dev(p, "id", "empty-holder");
    			attr_dev(p, "class", "svelte-j21kf4");
    			add_location(p, file$i, 157, 12, 6689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(157:8) {#if shadows.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (170:24) {:else}
    function create_else_block_1(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let mounted;
    	let dispose;

    	function mousedown_handler_1() {
    		return /*mousedown_handler_1*/ ctx[22](/*i*/ ctx[37]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "style", div0_style_value = `background-color: rgba(${/*shadow*/ ctx[35].base.color.r}, ${/*shadow*/ ctx[35].base.color.g}, ${/*shadow*/ ctx[35].base.color.b}, ${/*shadow*/ ctx[35].base.color.a}%)`);
    			attr_dev(div0, "class", "svelte-j21kf4");
    			add_location(div0, file$i, 171, 32, 7730);
    			attr_dev(div1, "class", "color-preview svelte-j21kf4");
    			add_location(div1, file$i, 170, 28, 7670);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = listen_dev(div0, "mousedown", mousedown_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*shadows*/ 1 && div0_style_value !== (div0_style_value = `background-color: rgba(${/*shadow*/ ctx[35].base.color.r}, ${/*shadow*/ ctx[35].base.color.g}, ${/*shadow*/ ctx[35].base.color.b}, ${/*shadow*/ ctx[35].base.color.a}%)`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(170:24) {:else}",
    		ctx
    	});

    	return block;
    }

    // (166:24) {#if i === demuxID}
    function create_if_block_2$1(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let mounted;
    	let dispose;

    	function mousedown_handler() {
    		return /*mousedown_handler*/ ctx[20](/*i*/ ctx[37]);
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "style", div0_style_value = `background-color: rgba(${/*shadow*/ ctx[35].base.color.r}, ${/*shadow*/ ctx[35].base.color.g}, ${/*shadow*/ ctx[35].base.color.b}, ${/*shadow*/ ctx[35].base.color.a}%)`);
    			attr_dev(div0, "class", "svelte-j21kf4");
    			add_location(div0, file$i, 167, 32, 7397);
    			attr_dev(div1, "class", "color-preview svelte-j21kf4");
    			add_location(div1, file$i, 166, 28, 7306);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div1_binding*/ ctx[21](div1);

    			if (!mounted) {
    				dispose = listen_dev(div0, "mousedown", mousedown_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*shadows*/ 1 && div0_style_value !== (div0_style_value = `background-color: rgba(${/*shadow*/ ctx[35].base.color.r}, ${/*shadow*/ ctx[35].base.color.g}, ${/*shadow*/ ctx[35].base.color.b}, ${/*shadow*/ ctx[35].base.color.a}%)`)) {
    				attr_dev(div0, "style", div0_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[21](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(166:24) {#if i === demuxID}",
    		ctx
    	});

    	return block;
    }

    // (162:16) {#each shadows as shadow, i (shadow)}
    function create_each_block$2(key_1, ctx) {
    	let section;
    	let t0;
    	let unitinput0;
    	let t1;
    	let unitinput1;
    	let t2;
    	let unitinput2;
    	let t3;
    	let unitinput3;
    	let t4;
    	let button;
    	let img;
    	let img_src_value;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*i*/ ctx[37] === /*demuxID*/ ctx[4]) return create_if_block_2$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	function focused_handler() {
    		return /*focused_handler*/ ctx[24](/*i*/ ctx[37]);
    	}

    	unitinput0 = new UnitInput({
    			props: {
    				name: "X",
    				v: /*shadow*/ ctx[35].base.x.v,
    				currentUnit: /*shadow*/ ctx[35].base.x.u,
    				minWidth: "30px",
    				maxWidth: "80px",
    				align: "left",
    				minVal: -100,
    				maxVal: 100,
    				useFC: false,
    				textClrOverride: /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    				? "#fff"
    				: "",
    				hasMargin: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput0.$on("updateValue", /*updateValue_handler*/ ctx[23]);
    	unitinput0.$on("focused", focused_handler);

    	function focused_handler_1() {
    		return /*focused_handler_1*/ ctx[26](/*i*/ ctx[37]);
    	}

    	unitinput1 = new UnitInput({
    			props: {
    				name: "Y",
    				v: /*shadow*/ ctx[35].base.y.v,
    				currentUnit: /*shadow*/ ctx[35].base.y.u,
    				minWidth: "30px",
    				maxWidth: "80px",
    				align: "left",
    				minVal: -100,
    				maxVal: 100,
    				useFC: false,
    				textClrOverride: /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    				? "#fff"
    				: "",
    				hasMargin: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput1.$on("updateValue", /*updateValue_handler_1*/ ctx[25]);
    	unitinput1.$on("focused", focused_handler_1);

    	function focused_handler_2() {
    		return /*focused_handler_2*/ ctx[28](/*i*/ ctx[37]);
    	}

    	unitinput2 = new UnitInput({
    			props: {
    				name: "Blur",
    				v: /*shadow*/ ctx[35].base.radius.v,
    				currentUnit: /*shadow*/ ctx[35].base.radius.u,
    				minWidth: "30px",
    				maxWidth: "80px",
    				align: "left",
    				maxVal: 100,
    				useFC: false,
    				textClrOverride: /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    				? "#fff"
    				: "",
    				hasMargin: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput2.$on("updateValue", /*updateValue_handler_2*/ ctx[27]);
    	unitinput2.$on("focused", focused_handler_2);

    	function focused_handler_3() {
    		return /*focused_handler_3*/ ctx[30](/*i*/ ctx[37]);
    	}

    	unitinput3 = new UnitInput({
    			props: {
    				name: "Grow",
    				v: /*shadow*/ ctx[35].grow.v,
    				currentUnit: /*shadow*/ ctx[35].grow.u,
    				minWidth: "30px",
    				maxWidth: "80px",
    				align: "left",
    				minVal: -100,
    				maxVal: 100,
    				useFC: false,
    				textClrOverride: /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    				? "#fff"
    				: "",
    				hasMargin: true,
    				sub: true
    			},
    			$$inline: true
    		});

    	unitinput3.$on("updateValue", /*updateValue_handler_3*/ ctx[29]);
    	unitinput3.$on("focused", focused_handler_3);

    	function click_handler() {
    		return /*click_handler*/ ctx[31](/*i*/ ctx[37]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			section = element("section");
    			if_block.c();
    			t0 = space();
    			create_component(unitinput0.$$.fragment);
    			t1 = space();
    			create_component(unitinput1.$$.fragment);
    			t2 = space();
    			create_component(unitinput2.$$.fragment);
    			t3 = space();
    			create_component(unitinput3.$$.fragment);
    			t4 = space();
    			button = element("button");
    			img = element("img");
    			t5 = space();
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/trash.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-j21kf4");
    			add_location(img, file$i, 228, 28, 10922);
    			attr_dev(button, "class", "svelte-j21kf4");
    			add_location(button, file$i, 227, 24, 10852);
    			attr_dev(section, "class", "shadow-editor-container svelte-j21kf4");
    			add_location(section, file$i, 163, 20, 7001);
    			this.first = section;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			if_block.m(section, null);
    			append_dev(section, t0);
    			mount_component(unitinput0, section, null);
    			append_dev(section, t1);
    			mount_component(unitinput1, section, null);
    			append_dev(section, t2);
    			mount_component(unitinput2, section, null);
    			append_dev(section, t3);
    			mount_component(unitinput3, section, null);
    			append_dev(section, t4);
    			append_dev(section, button);
    			append_dev(button, img);
    			append_dev(section, t5);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(section, t0);
    				}
    			}

    			const unitinput0_changes = {};
    			if (dirty[0] & /*shadows*/ 1) unitinput0_changes.v = /*shadow*/ ctx[35].base.x.v;
    			if (dirty[0] & /*shadows*/ 1) unitinput0_changes.currentUnit = /*shadow*/ ctx[35].base.x.u;

    			if (dirty[0] & /*shadows, demuxID, showEditorIndicator*/ 19) unitinput0_changes.textClrOverride = /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    			? "#fff"
    			: "";

    			unitinput0.$set(unitinput0_changes);
    			const unitinput1_changes = {};
    			if (dirty[0] & /*shadows*/ 1) unitinput1_changes.v = /*shadow*/ ctx[35].base.y.v;
    			if (dirty[0] & /*shadows*/ 1) unitinput1_changes.currentUnit = /*shadow*/ ctx[35].base.y.u;

    			if (dirty[0] & /*shadows, demuxID, showEditorIndicator*/ 19) unitinput1_changes.textClrOverride = /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    			? "#fff"
    			: "";

    			unitinput1.$set(unitinput1_changes);
    			const unitinput2_changes = {};
    			if (dirty[0] & /*shadows*/ 1) unitinput2_changes.v = /*shadow*/ ctx[35].base.radius.v;
    			if (dirty[0] & /*shadows*/ 1) unitinput2_changes.currentUnit = /*shadow*/ ctx[35].base.radius.u;

    			if (dirty[0] & /*shadows, demuxID, showEditorIndicator*/ 19) unitinput2_changes.textClrOverride = /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    			? "#fff"
    			: "";

    			unitinput2.$set(unitinput2_changes);
    			const unitinput3_changes = {};
    			if (dirty[0] & /*shadows*/ 1) unitinput3_changes.v = /*shadow*/ ctx[35].grow.v;
    			if (dirty[0] & /*shadows*/ 1) unitinput3_changes.currentUnit = /*shadow*/ ctx[35].grow.u;

    			if (dirty[0] & /*shadows, demuxID, showEditorIndicator*/ 19) unitinput3_changes.textClrOverride = /*i*/ ctx[37] === /*demuxID*/ ctx[4] && /*showEditorIndicator*/ ctx[1]
    			? "#fff"
    			: "";

    			unitinput3.$set(unitinput3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(unitinput0.$$.fragment, local);
    			transition_in(unitinput1.$$.fragment, local);
    			transition_in(unitinput2.$$.fragment, local);
    			transition_in(unitinput3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(unitinput0.$$.fragment, local);
    			transition_out(unitinput1.$$.fragment, local);
    			transition_out(unitinput2.$$.fragment, local);
    			transition_out(unitinput3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    			destroy_component(unitinput0);
    			destroy_component(unitinput1);
    			destroy_component(unitinput2);
    			destroy_component(unitinput3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(162:16) {#each shadows as shadow, i (shadow)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let main;
    	let div;
    	let div_class_value;
    	let div_style_value;
    	let t0;
    	let section2;
    	let h1;
    	let t2;
    	let section0;
    	let input;
    	let input_checked_value;
    	let t3;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let section1;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*currentStyle*/ ctx[2].USESHADOW && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t0 = space();
    			section2 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Shadows";
    			t2 = space();
    			section0 = element("section");
    			input = element("input");
    			t3 = space();
    			img0 = element("img");
    			t4 = space();
    			section1 = element("section");
    			img1 = element("img");
    			t5 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "editing-shadow-indicator");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(`${/*showEditorIndicator*/ ctx[1] ? "visible" : "hidden"}`) + " svelte-j21kf4"));
    			attr_dev(div, "style", div_style_value = `transform: translate3d(0px, ${60 * /*demuxID*/ ctx[4] - /*indicatorOffset*/ ctx[6]}px, 0px)`);
    			add_location(div, file$i, 136, 4, 5759);
    			attr_dev(h1, "class", "svelte-j21kf4");
    			add_location(h1, file$i, 141, 8, 6020);
    			attr_dev(input, "type", "checkbox");
    			input.checked = input_checked_value = /*currentStyle*/ ctx[2].USESHADOW;
    			attr_dev(input, "class", "svelte-j21kf4");
    			add_location(input, file$i, 144, 12, 6089);
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/icons/checkmark.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			set_style(img0, "opacity", /*currentStyle*/ ctx[2].USESHADOW ? "1" : "0");
    			attr_dev(img0, "class", "svelte-j21kf4");
    			add_location(img0, file$i, 145, 12, 6185);
    			attr_dev(section0, "id", "check-container");
    			attr_dev(section0, "class", "svelte-j21kf4");
    			add_location(section0, file$i, 143, 8, 6046);
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/icons/plus.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-j21kf4");
    			add_location(img1, file$i, 149, 12, 6411);
    			attr_dev(section1, "id", "add-container");
    			attr_dev(section1, "class", "svelte-j21kf4");
    			add_location(section1, file$i, 148, 8, 6315);
    			attr_dev(section2, "id", "title-container");
    			attr_dev(section2, "class", "svelte-j21kf4");
    			add_location(section2, file$i, 140, 4, 5981);
    			attr_dev(main, "class", "no-drag svelte-j21kf4");
    			add_location(main, file$i, 135, 0, 5732);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(main, t0);
    			append_dev(main, section2);
    			append_dev(section2, h1);
    			append_dev(section2, t2);
    			append_dev(section2, section0);
    			append_dev(section0, input);
    			append_dev(section0, t3);
    			append_dev(section0, img0);
    			append_dev(section2, t4);
    			append_dev(section2, section1);
    			append_dev(section1, img1);
    			append_dev(main, t5);
    			if (if_block) if_block.m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "click", /*toggleUseShadow*/ ctx[7], false, false, false),
    					listen_dev(section1, "click", /*addNewShadow*/ ctx[8], false, false, false),
    					listen_dev(section1, "mousedown", keepOpenOverlay, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*showEditorIndicator*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(`${/*showEditorIndicator*/ ctx[1] ? "visible" : "hidden"}`) + " svelte-j21kf4"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*demuxID*/ 16 && div_style_value !== (div_style_value = `transform: translate3d(0px, ${60 * /*demuxID*/ ctx[4] - /*indicatorOffset*/ ctx[6]}px, 0px)`)) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (!current || dirty[0] & /*currentStyle*/ 4 && input_checked_value !== (input_checked_value = /*currentStyle*/ ctx[2].USESHADOW)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (!current || dirty[0] & /*currentStyle*/ 4) {
    				set_style(img0, "opacity", /*currentStyle*/ ctx[2].USESHADOW ? "1" : "0");
    			}

    			if (/*currentStyle*/ ctx[2].USESHADOW) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*currentStyle*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let $mainColorPickerData;
    	let $mainOverlayData;
    	let $collection;
    	let $selectedOverride;
    	let $selectedComponent;
    	validate_store(mainColorPickerData, 'mainColorPickerData');
    	component_subscribe($$self, mainColorPickerData, $$value => $$invalidate(15, $mainColorPickerData = $$value));
    	validate_store(mainOverlayData, 'mainOverlayData');
    	component_subscribe($$self, mainOverlayData, $$value => $$invalidate(16, $mainOverlayData = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(17, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(18, $selectedOverride = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(19, $selectedComponent = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ShadowEditor', slots, []);
    	let indicatorOffset = 8.5;
    	let colorPreviewSquare;
    	let shadows = [];

    	const toggleUseShadow = () => {
    		$$invalidate(2, currentStyle["USESHADOW"] = !currentStyle["USESHADOW"], currentStyle);
    		collection.set($collection);
    	};

    	const addNewShadow = () => {
    		// turn useShadow on first
    		$$invalidate(2, currentStyle["USESHADOW"] = true, currentStyle);

    		// add a new shadow to shadowList
    		currentStyle["boxShadows"].push({
    			base: {
    				x: { v: 10, u: "px" },
    				y: { v: 10, u: "px" },
    				radius: { v: 30, u: "px" },
    				color: {
    					type: "hsl",
    					r: 0,
    					g: 0,
    					b: 0,
    					h: 0,
    					s: 0,
    					l: 0,
    					a: 50,
    					hex: "00000080"
    				}
    			},
    			grow: { v: 0, u: "px" }
    		});

    		collection.set($collection);
    	};

    	const removeShadow = id => {
    		$$invalidate(2, currentStyle["boxShadows"] = [...shadows.slice(0, id), ...shadows.slice(id + 1)], currentStyle);

    		// update everything
    		collection.set($collection);

    		mainColorPickerData.set($mainColorPickerData);
    		$$invalidate(0, shadows = currentStyle["boxShadows"]);
    		let newID = Math.max(Math.min(demuxID, shadows.length - 1), 0);

    		if (shadows.length === 0) {
    			clearColorPickerRef();
    		} else {
    			updateDemuxID(newID);
    		}
    	};

    	/*
     * Overlay shittery.
     *
     * I reccomend you collapse all of these when
     * developing unless you need to fix a bug in it.
     */
    	const updateOverlayPosition = (animationFrame = false) => {
    		try {
    			const colorPreviewSquareBB = colorPreviewSquare.getBoundingClientRect();
    			setX(colorPreviewSquareBB.x - $mainOverlayData.w / 2 - 20);
    			setY(colorPreviewSquareBB.y + 20);
    			if (animationFrame) set_store_value(mainOverlayData, $mainOverlayData.positionTrackingID = requestAnimationFrame(() => updateOverlayPosition(animationFrame)), $mainOverlayData);
    		} catch(error) {
    			
    		} // if this runs, it means that the square doesn't exist. It doesn't affect anything.
    	};

    	// we have to add element and overlay tracking to make sure that when the element/override switches, we clear the color references along with the multiplex indexes
    	let lastElmntNumber = $mainOverlayData.elementNumber;

    	let lastOverrideNumber = $mainOverlayData.overrideNumber;
    	let demuxID = 0;
    	let showEditorIndicator = false;
    	let currentColor;

    	const updateDemuxID = demuxIndex => {
    		$$invalidate(4, demuxID = demuxIndex);

    		// grab the current color from the demuxID
    		currentColor = shadows[demuxID].base.color;

    		// set mux color to target color. Because this is typescript, we're directly giving the color REFRENCE to the mux. So we don't have to write another funciton for demuxing
    		$$invalidate(2, currentStyle["muxBoxShadClr"] = currentColor, currentStyle);
    	};

    	// color updating. We have to use mutli-plexing for this task as the color picker only works with base level colors.
    	let shadowContainer;

    	const openOverlay = demuxIndex => {
    		// keepOpenOverlay();
    		// update global demux index
    		updateDemuxID(demuxIndex);

    		// open picker (after the update if finished)
    		openColorPicker("muxBoxShadClr", "Shadow", shadowContainer.children[demuxID], {
    			trackContinuously: true,
    			showInlineHSL: true
    		});
    	};

    	const updateShadowProp = (attribute, value, unit, isBaseProp = true) => {
    		if (isBaseProp) $$invalidate(0, shadows[demuxID]["base"][attribute] = { v: value, u: unit }, shadows); else $$invalidate(0, shadows[demuxID][attribute] = { v: value, u: unit }, shadows);
    		collection.set($collection);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ShadowEditor> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = i => {
    		openOverlay(i);
    	};

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			colorPreviewSquare = $$value;
    			$$invalidate(3, colorPreviewSquare);
    		});
    	}

    	const mousedown_handler_1 = i => {
    		openOverlay(i);
    	};

    	const updateValue_handler = e => {
    		updateShadowProp("x", e.detail.v, e.detail.u);
    	};

    	const focused_handler = i => {
    		updateDemuxID(i);
    	};

    	const updateValue_handler_1 = e => {
    		updateShadowProp("y", e.detail.v, e.detail.u);
    	};

    	const focused_handler_1 = i => {
    		updateDemuxID(i);
    	};

    	const updateValue_handler_2 = e => {
    		updateShadowProp("radius", e.detail.v, e.detail.u);
    	};

    	const focused_handler_2 = i => {
    		updateDemuxID(i);
    	};

    	const updateValue_handler_3 = e => {
    		updateShadowProp("grow", e.detail.v, e.detail.u, false);
    	};

    	const focused_handler_3 = i => {
    		updateDemuxID(i);
    	};

    	const click_handler = i => removeShadow(i);

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			shadowContainer = $$value;
    			$$invalidate(5, shadowContainer);
    		});
    	}

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		UnitInput,
    		setX,
    		setY,
    		mainOverlayData,
    		mainColorPickerData,
    		clearColorPickerRef,
    		openColorPicker,
    		keepOpenOverlay,
    		indicatorOffset,
    		colorPreviewSquare,
    		shadows,
    		toggleUseShadow,
    		addNewShadow,
    		removeShadow,
    		updateOverlayPosition,
    		lastElmntNumber,
    		lastOverrideNumber,
    		demuxID,
    		showEditorIndicator,
    		currentColor,
    		updateDemuxID,
    		shadowContainer,
    		openOverlay,
    		updateShadowProp,
    		currentStyle,
    		$mainColorPickerData,
    		$mainOverlayData,
    		$collection,
    		$selectedOverride,
    		$selectedComponent
    	});

    	$$self.$inject_state = $$props => {
    		if ('indicatorOffset' in $$props) $$invalidate(6, indicatorOffset = $$props.indicatorOffset);
    		if ('colorPreviewSquare' in $$props) $$invalidate(3, colorPreviewSquare = $$props.colorPreviewSquare);
    		if ('shadows' in $$props) $$invalidate(0, shadows = $$props.shadows);
    		if ('lastElmntNumber' in $$props) $$invalidate(13, lastElmntNumber = $$props.lastElmntNumber);
    		if ('lastOverrideNumber' in $$props) $$invalidate(14, lastOverrideNumber = $$props.lastOverrideNumber);
    		if ('demuxID' in $$props) $$invalidate(4, demuxID = $$props.demuxID);
    		if ('showEditorIndicator' in $$props) $$invalidate(1, showEditorIndicator = $$props.showEditorIndicator);
    		if ('currentColor' in $$props) currentColor = $$props.currentColor;
    		if ('shadowContainer' in $$props) $$invalidate(5, shadowContainer = $$props.shadowContainer);
    		if ('currentStyle' in $$props) $$invalidate(2, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$selectedOverride, $collection, $selectedComponent*/ 917504) {
    			// reactive
    			$$invalidate(2, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty[0] & /*currentStyle, shadows*/ 5) {
    			// we don't have a color defined here because we're using muxBoxShadClr as a multiplexer
    			if (!!currentStyle) {
    				// these variables just make the code look nicer
    				// use outline
    				$$invalidate(2, currentStyle["USESHADOW"] = !!currentStyle["USESHADOW"], currentStyle); // boolean initialization weirdness

    				// currentStyle["USESHADOW"] = true; // debugging force open
    				// update shadows
    				if (!currentStyle["boxShadows"]) $$invalidate(2, currentStyle["boxShadows"] = shadows, currentStyle);

    				$$invalidate(0, shadows = currentStyle["boxShadows"]);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$mainOverlayData, lastElmntNumber, lastOverrideNumber, $mainColorPickerData*/ 122880) {
    			if ($mainOverlayData.elementNumber !== lastElmntNumber || $mainOverlayData.overrideNumber !== lastOverrideNumber) {
    				// during initialization, the last state trackers may be undefined. In that case, we do not want the code to execute
    				if (lastElmntNumber !== undefined && lastOverrideNumber !== undefined && $mainColorPickerData.colorRefName === "muxBoxShadClr") {
    					clearColorPickerRef();
    					currentColor = undefined;
    				}

    				// updating last state. We always want this to run.
    				$$invalidate(13, lastElmntNumber = $mainOverlayData.elementNumber);

    				$$invalidate(14, lastOverrideNumber = $mainOverlayData.overrideNumber);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*currentStyle, $mainColorPickerData*/ 32772) {
    			// update color picker based on if the shadow is enabled or not
    			if (!currentStyle.USESHADOW && $mainColorPickerData.colorRefName === "muxBoxShadClr") {
    				// if the current style doesn't use shadow, clear ref
    				clearColorPickerRef();
    			}
    		}

    		if ($$self.$$.dirty[0] & /*$mainOverlayData, $mainColorPickerData, shadows, showEditorIndicator*/ 98307) {
    			// if the picker visible and selects the shadow, we should show the indicator. This is true for all cases
    			if ((!!$mainOverlayData.visible || !!$mainOverlayData.dragLocked) && $mainColorPickerData.colorRefName === "muxBoxShadClr" && shadows.length > 0) {
    				if (!showEditorIndicator) $$invalidate(1, showEditorIndicator = true);
    			} else {
    				if (showEditorIndicator) $$invalidate(1, showEditorIndicator = false);
    			}
    		}
    	};

    	return [
    		shadows,
    		showEditorIndicator,
    		currentStyle,
    		colorPreviewSquare,
    		demuxID,
    		shadowContainer,
    		indicatorOffset,
    		toggleUseShadow,
    		addNewShadow,
    		removeShadow,
    		updateDemuxID,
    		openOverlay,
    		updateShadowProp,
    		lastElmntNumber,
    		lastOverrideNumber,
    		$mainColorPickerData,
    		$mainOverlayData,
    		$collection,
    		$selectedOverride,
    		$selectedComponent,
    		mousedown_handler,
    		div1_binding,
    		mousedown_handler_1,
    		updateValue_handler,
    		focused_handler,
    		updateValue_handler_1,
    		focused_handler_1,
    		updateValue_handler_2,
    		focused_handler_2,
    		updateValue_handler_3,
    		focused_handler_3,
    		click_handler,
    		section_binding
    	];
    }

    class ShadowEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShadowEditor",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    async function flipAnimate(transitionElement, action, duration = 1000, customCleanup) {
        /* This function uses the FLIP transition method to transition an element between any state.
         * For now, this function will only transition the position of the element and nothing more.
         * If we need to transition more in the future, we can just add more features in here.
         *
         * In a nutshell, how this works is we take note of the initial state of the transitionElement.
         * We then apply the action to the transitionElement and take note of the state after action.
         * Then, immediately apply a counter transform to the element so that there look like nothing happened.
         * These three steps should happen within 14ms (60fps) or 7ms (120fps)
         *
         * Then, apply a css transition to move the element to the desired position.
         */
        let initialBoundingBox;
        let finalBoundingBox;
        let deltaX;
        let deltaY;
        const getInitalPosition = () => {
            initialBoundingBox = transitionElement.getBoundingClientRect();
        };
        const getFinalPosition = () => {
            action();
            finalBoundingBox = transitionElement.getBoundingClientRect();
        };
        const invert = () => {
            // compute the delta between initial and final state
            deltaX = initialBoundingBox.x - finalBoundingBox.x;
            deltaY = initialBoundingBox.y - finalBoundingBox.y;
            // apply these delta to transitionElement through css transform
            transitionElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };
        const play = () => {
            // add transitions to the element
            transitionElement.style.transitionDuration = `${duration}ms`;
            transitionElement.style.transitionProperty = 'transform';
            // reset position with transform
            transitionElement.style.transform = "translate(0px, 0px)";
            return;
        };
        const cleanup = () => {
            // remove transition properties
            transitionElement.style.removeProperty('transform');
            transitionElement.style.removeProperty('transition-duration');
            transitionElement.style.removeProperty('transition-property');
        };
        // we need to check if the moving element as any transitions attached on right now. If it does, we need to get 
        getInitalPosition();
        cleanup();
        getFinalPosition();
        // print out the final and initial positions
        invert();
        // as of testing, these three steps happen within 5ms, which provide us with a lot of overhead to create smooth animations
        setTimeout(() => {
            play();
        }, 0);
        await new Promise(resolve => setTimeout(resolve, duration));
        // cleanup element after the animation completes
        // cleanup();
        if (!!customCleanup)
            customCleanup();
    }

    /**
     * A writable store that holds data for the main color picker.
     */
    let mainFontPickerData = writable({
        fontRefName: undefined,
        fontName: "Typography",
        searchQuery: "",
    });

    /* src/components/ctrlMenuItems/StyleEditors/Advanced/TypefaceFinder.svelte generated by Svelte v3.48.0 */
    const file$h = "src/components/ctrlMenuItems/StyleEditors/Advanced/TypefaceFinder.svelte";

    function create_fragment$h(ctx) {
    	let main;
    	let title;
    	let t0;
    	let section;
    	let p;
    	let t1_value = /*typeface*/ ctx[0].typeface + "";
    	let t1;
    	let t2;
    	let img;
    	let img_src_value;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[1],
    				sub: /*sub*/ ctx[4],
    				align: /*alignTitle*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t0 = space();
    			section = element("section");
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			img = element("img");
    			attr_dev(p, "class", "preview-text svelte-1ysju5m");
    			attr_dev(p, "contenteditable", true);
    			attr_dev(p, "spellcheck", false);
    			set_style(p, "font-family", /*typeface*/ ctx[0].typeface + ", Inter");
    			add_location(p, file$h, 97, 8, 3600);
    			attr_dev(img, "id", "search-icon");
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/search.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1ysju5m");
    			add_location(img, file$h, 102, 8, 3948);
    			attr_dev(section, "class", "svelte-1ysju5m");
    			add_location(section, file$h, 95, 4, 3458);

    			attr_dev(main, "style", main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; width:${100 + /*widthGrowPerc*/ ctx[6]}%; ${/*minWidth*/ ctx[3] !== ""
			? `min-width:${/*minWidth*/ ctx[3]}`
			: ""}`);

    			attr_dev(main, "class", "svelte-1ysju5m");
    			add_location(main, file$h, 92, 0, 3259);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t0);
    			append_dev(main, section);
    			append_dev(section, p);
    			append_dev(p, t1);
    			/*p_binding*/ ctx[15](p);
    			append_dev(section, t2);
    			append_dev(section, img);
    			/*img_binding*/ ctx[16](img);
    			/*section_binding*/ ctx[17](section);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(p, "keydown", /*checkEnterPress*/ ctx[10], false, false, false),
    					listen_dev(p, "focus", /*focusInput*/ ctx[11], false, false, false),
    					listen_dev(p, "blur", /*unFocusInput*/ ctx[12], false, false, false),
    					listen_dev(p, "mousedown", keepOpenOverlay, false, false, false),
    					listen_dev(p, "input", /*updateSearchQuery*/ ctx[13], false, false, false),
    					listen_dev(section, "mousedown", /*mousedown_handler*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 2) title_changes.name = /*name*/ ctx[1];
    			if (dirty & /*sub*/ 16) title_changes.sub = /*sub*/ ctx[4];
    			if (dirty & /*alignTitle*/ 32) title_changes.align = /*alignTitle*/ ctx[5];
    			title.$set(title_changes);
    			if ((!current || dirty & /*typeface*/ 1) && t1_value !== (t1_value = /*typeface*/ ctx[0].typeface + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*typeface*/ 1) {
    				set_style(p, "font-family", /*typeface*/ ctx[0].typeface + ", Inter");
    			}

    			if (!current || dirty & /*hasMargin, widthGrowPerc, minWidth*/ 76 && main_style_value !== (main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; width:${100 + /*widthGrowPerc*/ ctx[6]}%; ${/*minWidth*/ ctx[3] !== ""
			? `min-width:${/*minWidth*/ ctx[3]}`
			: ""}`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			/*p_binding*/ ctx[15](null);
    			/*img_binding*/ ctx[16](null);
    			/*section_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $mainFontPickerData;
    	validate_store(mainFontPickerData, 'mainFontPickerData');
    	component_subscribe($$self, mainFontPickerData, $$value => $$invalidate(20, $mainFontPickerData = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TypefaceFinder', slots, []);
    	let { name } = $$props;
    	let { typeface } = $$props;
    	let { hasMargin } = $$props;
    	let { minWidth = "" } = $$props;
    	let { sub } = $$props;
    	let { alignTitle = "left" } = $$props;
    	let { widthGrowPerc = 0 } = $$props;
    	const disp = createEventDispatcher();
    	let inputText;
    	let inputTextContainer;
    	let searchIcon;
    	let dispatchLocked = true;
    	let colorPreviewSquare; // the square that previews the text color
    	let initialValue = typeface.typeface; // the input will reset to this value if there is nothing, or if there is an error. This must be recorded every time the input is focused.

    	const preventNullV = () => {
    		if (!typeface) $$invalidate(0, typeface.typeface = initialValue, typeface);
    		$$invalidate(14, dispatchLocked = true);
    		disp("blurred");

    		// hard checking to see if the innerHTML is empty
    		if (inputText.textContent.length === 0) $$invalidate(7, inputText.textContent = initialValue, inputText);
    	};

    	const checkEnterPress = e => {
    		$$invalidate(14, dispatchLocked = false);

    		// Check for enter key. If enter is pressed, then blur the search.
    		if (e.key === "Enter" || e.key === "Escape" || e.key === "Escape") {
    			e.preventDefault();
    			inputText.blur();
    			disp("blurred");
    			return;
    		}
    	};

    	let focused = false;

    	const focusInput = () => {
    		initialValue = inputTextContainer.textContent;

    		flipAnimate(
    			inputText,
    			() => {
    				$$invalidate(7, inputText.style.left = "30px", inputText);
    			},
    			300
    		);

    		$$invalidate(9, searchIcon.style.opacity = "0.5", searchIcon);

    		// select all in the input text if the input is not yet focused
    		if (!focused) window.setTimeout(
    			function () {
    				let range = document.createRange();
    				range.selectNodeContents(inputText);
    				let sel = window.getSelection();
    				sel.removeAllRanges();
    				sel.addRange(range);
    			},
    			0
    		);

    		// dispatch a focsued event
    		disp("focused");
    	};

    	const unFocusInput = () => {
    		preventNullV(); // prevent null value input

    		// clear search query in fontPickDat.
    		set_store_value(mainFontPickerData, $mainFontPickerData.searchQuery = "", $mainFontPickerData);

    		flipAnimate(
    			inputText,
    			() => {
    				inputText.style.removeProperty("left");
    				$$invalidate(7, inputText.scrollLeft = 0, inputText);
    			},
    			300
    		);

    		$$invalidate(9, searchIcon.style.opacity = "0", searchIcon);
    	};

    	// TODO: Implement font injection
    	// setTimeout(() => {
    	//     const style = document.createElement('style');
    	//     style.innerHTML = `
    	//         @font-face {
    	//             font-family: 'MyFont';
    	//             src: url(http://fonts.gstatic.com/s/fraunces/v24/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIc6RujDvTShUtWNg.ttf)
    	//         }
    	//     `;
    	//     inputTextContainer.appendChild(style);
    	//     inputText.style.fontFamily = `'MyFont', Inter`;
    	// }, 1000);
    	function updateSearchQuery() {
    		set_store_value(mainFontPickerData, $mainFontPickerData.searchQuery = inputText.textContent.toLowerCase(), $mainFontPickerData);
    	}

    	const writable_props = [
    		'name',
    		'typeface',
    		'hasMargin',
    		'minWidth',
    		'sub',
    		'alignTitle',
    		'widthGrowPerc'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TypefaceFinder> was created with unknown prop '${key}'`);
    	});

    	function p_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputText = $$value;
    			$$invalidate(7, inputText);
    		});
    	}

    	function img_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			searchIcon = $$value;
    			$$invalidate(9, searchIcon);
    		});
    	}

    	function section_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputTextContainer = $$value;
    			$$invalidate(8, inputTextContainer);
    		});
    	}

    	const mousedown_handler = () => {
    		setTimeout(
    			() => {
    				inputText.focus();
    			},
    			0
    		);
    	};

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('typeface' in $$props) $$invalidate(0, typeface = $$props.typeface);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('minWidth' in $$props) $$invalidate(3, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(4, sub = $$props.sub);
    		if ('alignTitle' in $$props) $$invalidate(5, alignTitle = $$props.alignTitle);
    		if ('widthGrowPerc' in $$props) $$invalidate(6, widthGrowPerc = $$props.widthGrowPerc);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		typeface,
    		hasMargin,
    		minWidth,
    		sub,
    		alignTitle,
    		widthGrowPerc,
    		createEventDispatcher,
    		flipAnimate,
    		mainFontPickerData,
    		Title,
    		keepOpenOverlay,
    		disp,
    		inputText,
    		inputTextContainer,
    		searchIcon,
    		dispatchLocked,
    		colorPreviewSquare,
    		initialValue,
    		preventNullV,
    		checkEnterPress,
    		focused,
    		focusInput,
    		unFocusInput,
    		updateSearchQuery,
    		$mainFontPickerData
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('typeface' in $$props) $$invalidate(0, typeface = $$props.typeface);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('minWidth' in $$props) $$invalidate(3, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(4, sub = $$props.sub);
    		if ('alignTitle' in $$props) $$invalidate(5, alignTitle = $$props.alignTitle);
    		if ('widthGrowPerc' in $$props) $$invalidate(6, widthGrowPerc = $$props.widthGrowPerc);
    		if ('inputText' in $$props) $$invalidate(7, inputText = $$props.inputText);
    		if ('inputTextContainer' in $$props) $$invalidate(8, inputTextContainer = $$props.inputTextContainer);
    		if ('searchIcon' in $$props) $$invalidate(9, searchIcon = $$props.searchIcon);
    		if ('dispatchLocked' in $$props) $$invalidate(14, dispatchLocked = $$props.dispatchLocked);
    		if ('colorPreviewSquare' in $$props) colorPreviewSquare = $$props.colorPreviewSquare;
    		if ('initialValue' in $$props) initialValue = $$props.initialValue;
    		if ('focused' in $$props) focused = $$props.focused;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*typeface, dispatchLocked*/ 16385) {
    			// dispatch value changes if v changes
    			if (typeface !== null && !dispatchLocked) {
    				// do not send null
    				disp("updateValue", { v: typeface });
    			}
    		}
    	};

    	return [
    		typeface,
    		name,
    		hasMargin,
    		minWidth,
    		sub,
    		alignTitle,
    		widthGrowPerc,
    		inputText,
    		inputTextContainer,
    		searchIcon,
    		checkEnterPress,
    		focusInput,
    		unFocusInput,
    		updateSearchQuery,
    		dispatchLocked,
    		p_binding,
    		img_binding,
    		section_binding,
    		mousedown_handler
    	];
    }

    class TypefaceFinder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {
    			name: 1,
    			typeface: 0,
    			hasMargin: 2,
    			minWidth: 3,
    			sub: 4,
    			alignTitle: 5,
    			widthGrowPerc: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TypefaceFinder",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<TypefaceFinder> was created without expected prop 'name'");
    		}

    		if (/*typeface*/ ctx[0] === undefined && !('typeface' in props)) {
    			console.warn("<TypefaceFinder> was created without expected prop 'typeface'");
    		}

    		if (/*hasMargin*/ ctx[2] === undefined && !('hasMargin' in props)) {
    			console.warn("<TypefaceFinder> was created without expected prop 'hasMargin'");
    		}

    		if (/*sub*/ ctx[4] === undefined && !('sub' in props)) {
    			console.warn("<TypefaceFinder> was created without expected prop 'sub'");
    		}
    	}

    	get name() {
    		throw new Error("<TypefaceFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TypefaceFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get typeface() {
    		throw new Error("<TypefaceFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set typeface(value) {
    		throw new Error("<TypefaceFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<TypefaceFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<TypefaceFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<TypefaceFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<TypefaceFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<TypefaceFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<TypefaceFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignTitle() {
    		throw new Error("<TypefaceFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignTitle(value) {
    		throw new Error("<TypefaceFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get widthGrowPerc() {
    		throw new Error("<TypefaceFinder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set widthGrowPerc(value) {
    		throw new Error("<TypefaceFinder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/MultiSelect.svelte generated by Svelte v3.48.0 */
    const file$g = "src/components/ctrlMenuItems/StyleEditors/Basics/MultiSelect.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    // (120:16) {#if showAlt}
    function create_if_block$5(ctx) {
    	let p;
    	let t_value = /*ele*/ ctx[20].alt + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "alt-text svelte-1ovw93x");
    			add_location(p, file$g, 120, 20, 5053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*elements*/ 1 && t_value !== (t_value = /*ele*/ ctx[20].alt + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(120:16) {#if showAlt}",
    		ctx
    	});

    	return block;
    }

    // (93:8) {#each elements as ele, i}
    function create_each_block$1(ctx) {
    	let div2;
    	let div0;
    	let div0_style_value;
    	let t0;
    	let div1;
    	let t1;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t2;
    	let t3;
    	let div2_class_value;
    	let div2_title_value;
    	let div2_style_value;
    	let mounted;
    	let dispose;
    	let if_block = /*showAlt*/ ctx[12] && create_if_block$5(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[17](/*i*/ ctx[22]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			attr_dev(div0, "class", "element-selected-background svelte-1ovw93x");

    			attr_dev(div0, "style", div0_style_value = "" + (/*alignedHorizontally*/ ctx[9] ? "width" : "height") + ": calc(100% + 1px); " + (/*alignedHorizontally*/ ctx[9] ? "height" : "width") + ": 100%; border-radius: " + (// We have to do some ternary and detection here to get the border radiuses correct. These operators just detect if the selection has neighbors, and if it does how it should style the radius.
    			// The top left and bottom left have the same detection code, and the top right and bottom right have the same detection code.
    			/*alignedHorizontally*/ ctx[9]
    			? // if aligned horizontally
    				`${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px`
    			: // if aligned vertically
    				`${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px`));

    			add_location(div0, file$g, 101, 16, 3543);
    			attr_dev(div1, "class", "element-hover-highlights svelte-1ovw93x");
    			set_style(div1, "border-radius", /*radius*/ ctx[7] + "px");
    			add_location(div1, file$g, 114, 16, 4771);
    			if (!src_url_equal(img.src, img_src_value = /*ele*/ ctx[20].iconDir)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*ele*/ ctx[20].alt);
    			set_style(img, "height", /*iconSize*/ ctx[8] + "px");
    			set_style(img, "margin", "0px " + /*iconMargin*/ ctx[11] + "px 0px " + /*iconMargin*/ ctx[11] + "px");
    			attr_dev(img, "class", "svelte-1ovw93x");
    			add_location(img, file$g, 116, 16, 4868);

    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(`toggle-element ${/*selections*/ ctx[1].includes(/*i*/ ctx[22])
			? "selected"
			: ""}`) + " svelte-1ovw93x"));

    			attr_dev(div2, "title", div2_title_value = /*ele*/ ctx[20].alt);

    			attr_dev(div2, "style", div2_style_value = `
                    ${/*alignedHorizontally*/ ctx[9] ? "width" : "height"}: ${(/*alignedHorizontally*/ ctx[9]
			? /*width*/ ctx[5]
			: /*height*/ ctx[6]) / /*elements*/ ctx[0].length}px;
                    justify-content: ${/*alignmentToFlexAlign*/ ctx[15][/*align*/ ctx[13]]};
                `);

    			add_location(div2, file$g, 94, 12, 3092);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div2, t1);
    			append_dev(div2, img);
    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t3);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*alignedHorizontally, selections, radius*/ 642 && div0_style_value !== (div0_style_value = "" + (/*alignedHorizontally*/ ctx[9] ? "width" : "height") + ": calc(100% + 1px); " + (/*alignedHorizontally*/ ctx[9] ? "height" : "width") + ": 100%; border-radius: " + (// We have to do some ternary and detection here to get the border radiuses correct. These operators just detect if the selection has neighbors, and if it does how it should style the radius.
    			// The top left and bottom left have the same detection code, and the top right and bottom right have the same detection code.
    			/*alignedHorizontally*/ ctx[9]
    			? // if aligned horizontally
    				`${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px`
    			: // if aligned vertically
    				`${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] - 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px ${/*selections*/ ctx[1].includes(/*i*/ ctx[22] + 1)
				? 0
				: /*radius*/ ctx[7]}px`))) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty & /*radius*/ 128) {
    				set_style(div1, "border-radius", /*radius*/ ctx[7] + "px");
    			}

    			if (dirty & /*elements*/ 1 && !src_url_equal(img.src, img_src_value = /*ele*/ ctx[20].iconDir)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*elements*/ 1 && img_alt_value !== (img_alt_value = /*ele*/ ctx[20].alt)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*iconSize*/ 256) {
    				set_style(img, "height", /*iconSize*/ ctx[8] + "px");
    			}

    			if (dirty & /*iconMargin*/ 2048) {
    				set_style(img, "margin", "0px " + /*iconMargin*/ ctx[11] + "px 0px " + /*iconMargin*/ ctx[11] + "px");
    			}

    			if (/*showAlt*/ ctx[12]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.m(div2, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*selections*/ 2 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`toggle-element ${/*selections*/ ctx[1].includes(/*i*/ ctx[22])
			? "selected"
			: ""}`) + " svelte-1ovw93x"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*elements*/ 1 && div2_title_value !== (div2_title_value = /*ele*/ ctx[20].alt)) {
    				attr_dev(div2, "title", div2_title_value);
    			}

    			if (dirty & /*alignedHorizontally, width, height, elements, align*/ 8801 && div2_style_value !== (div2_style_value = `
                    ${/*alignedHorizontally*/ ctx[9] ? "width" : "height"}: ${(/*alignedHorizontally*/ ctx[9]
			? /*width*/ ctx[5]
			: /*height*/ ctx[6]) / /*elements*/ ctx[0].length}px;
                    justify-content: ${/*alignmentToFlexAlign*/ ctx[15][/*align*/ ctx[13]]};
                `)) {
    				attr_dev(div2, "style", div2_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(93:8) {#each elements as ele, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let main;
    	let title;
    	let t;
    	let section;
    	let main_style_value;
    	let current;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[2],
    				sub: /*sub*/ ctx[10],
    				align: /*alignTitle*/ ctx[14]
    			},
    			$$inline: true
    		});

    	let each_value = /*elements*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t = space();
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section, "class", "container svelte-1ovw93x");
    			set_style(section, "width", /*width*/ ctx[5] + "px");
    			set_style(section, "height", /*height*/ ctx[6] + "px");
    			set_style(section, "border-radius", /*radius*/ ctx[7] + "px");
    			set_style(section, "flex-direction", /*alignedHorizontally*/ ctx[9] ? "row" : "column");
    			add_location(section, file$g, 91, 4, 2696);

    			attr_dev(main, "style", main_style_value = `${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`);

    			attr_dev(main, "class", "svelte-1ovw93x");
    			add_location(main, file$g, 88, 0, 2519);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t);
    			append_dev(main, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 4) title_changes.name = /*name*/ ctx[2];
    			if (dirty & /*sub*/ 1024) title_changes.sub = /*sub*/ ctx[10];
    			if (dirty & /*alignTitle*/ 16384) title_changes.align = /*alignTitle*/ ctx[14];
    			title.$set(title_changes);

    			if (dirty & /*selections, elements, alignedHorizontally, width, height, alignmentToFlexAlign, align, addOrRemoveElements, showAlt, iconSize, iconMargin, radius*/ 113635) {
    				each_value = /*elements*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*width*/ 32) {
    				set_style(section, "width", /*width*/ ctx[5] + "px");
    			}

    			if (!current || dirty & /*height*/ 64) {
    				set_style(section, "height", /*height*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*radius*/ 128) {
    				set_style(section, "border-radius", /*radius*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*alignedHorizontally*/ 512) {
    				set_style(section, "flex-direction", /*alignedHorizontally*/ ctx[9] ? "row" : "column");
    			}

    			if (!current || dirty & /*maxWidth, minWidth*/ 24 && main_style_value !== (main_style_value = `${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const textDecoration = [
    	{
    		iconDir: "./assets/icons/italicize.svg",
    		val: "italicize",
    		alt: "Italicize"
    	},
    	{
    		iconDir: "./assets/icons/underline.svg",
    		val: "underline",
    		alt: "Underline"
    	},
    	{
    		iconDir: "./assets/icons/strike-through.svg",
    		val: "strike",
    		alt: "Strikethrough"
    	}
    ];

    const typeFilters = [
    	{
    		iconDir: "./assets/icons/sans-serif.svg",
    		val: "sans-serif",
    		alt: "Sans Serif"
    	},
    	{
    		iconDir: "./assets/icons/serif.svg",
    		val: "serif",
    		alt: "Serif"
    	},
    	{
    		iconDir: "./assets/icons/display.svg",
    		val: "display",
    		alt: "Display"
    	},
    	{
    		iconDir: "./assets/icons/handWriting.svg",
    		val: "handwriting",
    		alt: "Script"
    	},
    	{
    		iconDir: "./assets/icons/monospace.svg",
    		val: "monospace",
    		alt: "Monospace"
    	}
    ];

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MultiSelect', slots, []);
    	const disp = createEventDispatcher();
    	let { name = "" } = $$props;
    	let { elements } = $$props;
    	let { selections = [] } = $$props;
    	let { maxWidth = "" } = $$props;
    	let { minWidth = "" } = $$props;
    	let { width = 100 } = $$props;
    	let { height = 32 } = $$props;
    	let { radius = 8 } = $$props;
    	let { iconSize = 20 } = $$props;
    	let { alignedHorizontally = true } = $$props;
    	let { sub } = $$props;
    	let { iconMargin = 10 } = $$props;
    	let { showAlt = false } = $$props;
    	let { align = "center" } = $$props;
    	let { alignTitle = "left" } = $$props;

    	const alignmentToFlexAlign = {
    		"left": "flex-start",
    		"center": "center",
    		"right": "flex-start; flex-direction: row-reverse"
    	};

    	const addOrRemoveElements = index => {
    		// check if the index is in the current selections. If so, remove it. Otherwise, add it.
    		if (selections.includes(index)) {
    			// remove the index from the current selections
    			selections.splice(selections.indexOf(index), 1);
    		} else {
    			// add the index to the current selections
    			selections.push(index);
    		}

    		// update svelte
    		$$invalidate(1, selections);

    		$$invalidate(0, elements);

    		// dispatch callback with new values
    		updateValue(selections);
    	};

    	const updateValue = newSelections => {
    		// $store = storeVal;
    		$$invalidate(1, selections = newSelections);

    		disp("valueChange", {
    			selectionIndicies: selections,
    			values: selections.map(i => elements[i].val)
    		});
    	};

    	const writable_props = [
    		'name',
    		'elements',
    		'selections',
    		'maxWidth',
    		'minWidth',
    		'width',
    		'height',
    		'radius',
    		'iconSize',
    		'alignedHorizontally',
    		'sub',
    		'iconMargin',
    		'showAlt',
    		'align',
    		'alignTitle'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MultiSelect> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => {
    		addOrRemoveElements(i);
    	};

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('elements' in $$props) $$invalidate(0, elements = $$props.elements);
    		if ('selections' in $$props) $$invalidate(1, selections = $$props.selections);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('width' in $$props) $$invalidate(5, width = $$props.width);
    		if ('height' in $$props) $$invalidate(6, height = $$props.height);
    		if ('radius' in $$props) $$invalidate(7, radius = $$props.radius);
    		if ('iconSize' in $$props) $$invalidate(8, iconSize = $$props.iconSize);
    		if ('alignedHorizontally' in $$props) $$invalidate(9, alignedHorizontally = $$props.alignedHorizontally);
    		if ('sub' in $$props) $$invalidate(10, sub = $$props.sub);
    		if ('iconMargin' in $$props) $$invalidate(11, iconMargin = $$props.iconMargin);
    		if ('showAlt' in $$props) $$invalidate(12, showAlt = $$props.showAlt);
    		if ('align' in $$props) $$invalidate(13, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(14, alignTitle = $$props.alignTitle);
    	};

    	$$self.$capture_state = () => ({
    		textDecoration,
    		typeFilters,
    		createEventDispatcher,
    		Title,
    		disp,
    		name,
    		elements,
    		selections,
    		maxWidth,
    		minWidth,
    		width,
    		height,
    		radius,
    		iconSize,
    		alignedHorizontally,
    		sub,
    		iconMargin,
    		showAlt,
    		align,
    		alignTitle,
    		alignmentToFlexAlign,
    		addOrRemoveElements,
    		updateValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('elements' in $$props) $$invalidate(0, elements = $$props.elements);
    		if ('selections' in $$props) $$invalidate(1, selections = $$props.selections);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('width' in $$props) $$invalidate(5, width = $$props.width);
    		if ('height' in $$props) $$invalidate(6, height = $$props.height);
    		if ('radius' in $$props) $$invalidate(7, radius = $$props.radius);
    		if ('iconSize' in $$props) $$invalidate(8, iconSize = $$props.iconSize);
    		if ('alignedHorizontally' in $$props) $$invalidate(9, alignedHorizontally = $$props.alignedHorizontally);
    		if ('sub' in $$props) $$invalidate(10, sub = $$props.sub);
    		if ('iconMargin' in $$props) $$invalidate(11, iconMargin = $$props.iconMargin);
    		if ('showAlt' in $$props) $$invalidate(12, showAlt = $$props.showAlt);
    		if ('align' in $$props) $$invalidate(13, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(14, alignTitle = $$props.alignTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		elements,
    		selections,
    		name,
    		maxWidth,
    		minWidth,
    		width,
    		height,
    		radius,
    		iconSize,
    		alignedHorizontally,
    		sub,
    		iconMargin,
    		showAlt,
    		align,
    		alignTitle,
    		alignmentToFlexAlign,
    		addOrRemoveElements,
    		click_handler
    	];
    }

    class MultiSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			name: 2,
    			elements: 0,
    			selections: 1,
    			maxWidth: 3,
    			minWidth: 4,
    			width: 5,
    			height: 6,
    			radius: 7,
    			iconSize: 8,
    			alignedHorizontally: 9,
    			sub: 10,
    			iconMargin: 11,
    			showAlt: 12,
    			align: 13,
    			alignTitle: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiSelect",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*elements*/ ctx[0] === undefined && !('elements' in props)) {
    			console.warn("<MultiSelect> was created without expected prop 'elements'");
    		}

    		if (/*sub*/ ctx[10] === undefined && !('sub' in props)) {
    			console.warn("<MultiSelect> was created without expected prop 'sub'");
    		}
    	}

    	get name() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elements() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elements(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selections() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selections(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconSize() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconSize(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignedHorizontally() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignedHorizontally(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconMargin() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconMargin(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showAlt() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showAlt(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignTitle() {
    		throw new Error("<MultiSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignTitle(value) {
    		throw new Error("<MultiSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Basics/TextAreaInput.svelte generated by Svelte v3.48.0 */
    const file$f = "src/components/ctrlMenuItems/StyleEditors/Basics/TextAreaInput.svelte";

    function create_fragment$f(ctx) {
    	let main;
    	let title;
    	let t;
    	let textarea;
    	let textarea_style_value;
    	let main_style_value;
    	let current;
    	let mounted;
    	let dispose;

    	title = new Title({
    			props: {
    				name: /*name*/ ctx[1],
    				sub: /*sub*/ ctx[5],
    				align: /*alignTitle*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(title.$$.fragment);
    			t = space();
    			textarea = element("textarea");
    			attr_dev(textarea, "style", textarea_style_value = `text-align: ${/*align*/ ctx[6]}`);
    			attr_dev(textarea, "placeholder", /*placeHolder*/ ctx[8]);
    			attr_dev(textarea, "class", "svelte-1jsbse4");
    			add_location(textarea, file$f, 53, 4, 1526);

    			attr_dev(main, "style", main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`);

    			attr_dev(main, "class", "svelte-1jsbse4");
    			add_location(main, file$f, 50, 0, 1309);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(title, main, null);
    			append_dev(main, t);
    			append_dev(main, textarea);
    			/*textarea_binding*/ ctx[17](textarea);
    			set_input_value(textarea, /*v*/ ctx[0]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[18]),
    					listen_dev(textarea, "keydown", /*checkEscPress*/ ctx[12], false, false, false),
    					listen_dev(textarea, "input", /*autoGrow*/ ctx[13], false, false, false),
    					listen_dev(textarea, "blur", /*preventNullV*/ ctx[11], false, false, false),
    					listen_dev(textarea, "focus", /*focus_handler*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const title_changes = {};
    			if (dirty & /*name*/ 2) title_changes.name = /*name*/ ctx[1];
    			if (dirty & /*sub*/ 32) title_changes.sub = /*sub*/ ctx[5];
    			if (dirty & /*alignTitle*/ 128) title_changes.align = /*alignTitle*/ ctx[7];
    			title.$set(title_changes);

    			if (!current || dirty & /*align*/ 64 && textarea_style_value !== (textarea_style_value = `text-align: ${/*align*/ ctx[6]}`)) {
    				attr_dev(textarea, "style", textarea_style_value);
    			}

    			if (!current || dirty & /*placeHolder*/ 256) {
    				attr_dev(textarea, "placeholder", /*placeHolder*/ ctx[8]);
    			}

    			if (dirty & /*v*/ 1) {
    				set_input_value(textarea, /*v*/ ctx[0]);
    			}

    			if (!current || dirty & /*hasMargin, maxWidth, minWidth*/ 28 && main_style_value !== (main_style_value = `${/*hasMargin*/ ctx[2] ? "margin-right:6px" : ""}; ${/*maxWidth*/ ctx[3] !== ""
			? `max-width:${/*maxWidth*/ ctx[3]}`
			: ""}; ${/*minWidth*/ ctx[4] !== ""
			? `min-width:${/*minWidth*/ ctx[4]}`
			: ""}`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(title);
    			/*textarea_binding*/ ctx[17](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextAreaInput', slots, []);
    	let { name } = $$props;
    	let { v } = $$props;
    	let { hasMargin } = $$props;
    	let { maxWidth = "" } = $$props;
    	let { minWidth = "" } = $$props;
    	let { sub } = $$props;
    	let { charLim = -1 } = $$props;
    	let { align = "left" } = $$props;
    	let { alignTitle = align } = $$props;
    	let { placeHolder = "Text" } = $$props;
    	let { currentParenteWidth = 360 } = $$props;
    	const disp = createEventDispatcher();
    	let valueInputField;
    	let dispatchLocked = true;

    	const preventNullV = () => {
    		if (!v) $$invalidate(0, v = "");
    		$$invalidate(16, dispatchLocked = true);
    		disp("blurred");
    	};

    	const checkEscPress = e => {
    		$$invalidate(16, dispatchLocked = false);

    		if (e.key === "Escape") {
    			e.preventDefault();
    			valueInputField.blur();
    			return;
    		}
    	};

    	const autoGrow = () => {
    		if (!valueInputField) return;
    		$$invalidate(9, valueInputField.style.height = "15px", valueInputField);
    		$$invalidate(9, valueInputField.style.height = valueInputField.scrollHeight - 1 + "px", valueInputField);
    	};

    	const writable_props = [
    		'name',
    		'v',
    		'hasMargin',
    		'maxWidth',
    		'minWidth',
    		'sub',
    		'charLim',
    		'align',
    		'alignTitle',
    		'placeHolder',
    		'currentParenteWidth'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextAreaInput> was created with unknown prop '${key}'`);
    	});

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			valueInputField = $$value;
    			$$invalidate(9, valueInputField);
    		});
    	}

    	function textarea_input_handler() {
    		v = this.value;
    		(($$invalidate(0, v), $$invalidate(16, dispatchLocked)), $$invalidate(14, charLim));
    	}

    	const focus_handler = () => disp("focused");

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(5, sub = $$props.sub);
    		if ('charLim' in $$props) $$invalidate(14, charLim = $$props.charLim);
    		if ('align' in $$props) $$invalidate(6, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(7, alignTitle = $$props.alignTitle);
    		if ('placeHolder' in $$props) $$invalidate(8, placeHolder = $$props.placeHolder);
    		if ('currentParenteWidth' in $$props) $$invalidate(15, currentParenteWidth = $$props.currentParenteWidth);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		v,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		sub,
    		charLim,
    		align,
    		alignTitle,
    		placeHolder,
    		currentParenteWidth,
    		createEventDispatcher,
    		Title,
    		disp,
    		valueInputField,
    		dispatchLocked,
    		preventNullV,
    		checkEscPress,
    		autoGrow
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('v' in $$props) $$invalidate(0, v = $$props.v);
    		if ('hasMargin' in $$props) $$invalidate(2, hasMargin = $$props.hasMargin);
    		if ('maxWidth' in $$props) $$invalidate(3, maxWidth = $$props.maxWidth);
    		if ('minWidth' in $$props) $$invalidate(4, minWidth = $$props.minWidth);
    		if ('sub' in $$props) $$invalidate(5, sub = $$props.sub);
    		if ('charLim' in $$props) $$invalidate(14, charLim = $$props.charLim);
    		if ('align' in $$props) $$invalidate(6, align = $$props.align);
    		if ('alignTitle' in $$props) $$invalidate(7, alignTitle = $$props.alignTitle);
    		if ('placeHolder' in $$props) $$invalidate(8, placeHolder = $$props.placeHolder);
    		if ('currentParenteWidth' in $$props) $$invalidate(15, currentParenteWidth = $$props.currentParenteWidth);
    		if ('valueInputField' in $$props) $$invalidate(9, valueInputField = $$props.valueInputField);
    		if ('dispatchLocked' in $$props) $$invalidate(16, dispatchLocked = $$props.dispatchLocked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentParenteWidth*/ 32768) {
    			if (currentParenteWidth !== undefined) {
    				// update the growth whenever the parent is resized
    				autoGrow();
    			}
    		}

    		if ($$self.$$.dirty & /*v, dispatchLocked, charLim*/ 81921) {
    			// dispatch value changes if v changes
    			if (v !== null && !dispatchLocked) {
    				// do not send null
    				// get substring if charLim exists
    				if (charLim !== -1) $$invalidate(0, v = v.substring(0, charLim));

    				disp("updateValue", { v });
    			}
    		}
    	};

    	return [
    		v,
    		name,
    		hasMargin,
    		maxWidth,
    		minWidth,
    		sub,
    		align,
    		alignTitle,
    		placeHolder,
    		valueInputField,
    		disp,
    		preventNullV,
    		checkEscPress,
    		autoGrow,
    		charLim,
    		currentParenteWidth,
    		dispatchLocked,
    		textarea_binding,
    		textarea_input_handler,
    		focus_handler
    	];
    }

    class TextAreaInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			name: 1,
    			v: 0,
    			hasMargin: 2,
    			maxWidth: 3,
    			minWidth: 4,
    			sub: 5,
    			charLim: 14,
    			align: 6,
    			alignTitle: 7,
    			placeHolder: 8,
    			currentParenteWidth: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextAreaInput",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !('name' in props)) {
    			console.warn("<TextAreaInput> was created without expected prop 'name'");
    		}

    		if (/*v*/ ctx[0] === undefined && !('v' in props)) {
    			console.warn("<TextAreaInput> was created without expected prop 'v'");
    		}

    		if (/*hasMargin*/ ctx[2] === undefined && !('hasMargin' in props)) {
    			console.warn("<TextAreaInput> was created without expected prop 'hasMargin'");
    		}

    		if (/*sub*/ ctx[5] === undefined && !('sub' in props)) {
    			console.warn("<TextAreaInput> was created without expected prop 'sub'");
    		}
    	}

    	get name() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get v() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasMargin() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasMargin(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minWidth() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minWidth(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sub() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sub(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charLim() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charLim(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get align() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set align(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alignTitle() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alignTitle(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeHolder() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeHolder(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentParenteWidth() {
    		throw new Error("<TextAreaInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParenteWidth(value) {
    		throw new Error("<TextAreaInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/Advanced/FontPickerOverlay.svelte generated by Svelte v3.48.0 */

    const { Object: Object_1 } = globals;
    const file$e = "src/components/ctrlMenuItems/StyleEditors/Advanced/FontPickerOverlay.svelte";

    function create_fragment$e(ctx) {
    	let section0;
    	let h6;
    	let t0;
    	let t1;
    	let main;
    	let section4;
    	let section1;
    	let multiselect0;
    	let t2;
    	let section2;
    	let t3;
    	let section3;
    	let multiselect1;
    	let t4;
    	let div0;
    	let t5;
    	let multitoggle0;
    	let t6;
    	let div1;
    	let t7;
    	let multitoggle1;
    	let t8;
    	let div2;
    	let t9;
    	let unitinput0;
    	let t10;
    	let div3;
    	let t11;
    	let unitinput1;
    	let t12;
    	let div4;
    	let t13;
    	let unitinput2;
    	let t14;
    	let p;
    	let t15;
    	let a;
    	let current;

    	multiselect0 = new MultiSelect({
    			props: {
    				elements: typeFilters,
    				alignedHorizontally: false,
    				align: "left",
    				showAlt: true,
    				name: "",
    				sub: true,
    				width: 130,
    				height: 231,
    				radius: 6,
    				iconSize: 24,
    				iconMargin: 12
    			},
    			$$inline: true
    		});

    	multiselect1 = new MultiSelect({
    			props: {
    				elements: textDecoration,
    				selections: /*fontRef*/ ctx[0].textDecorations.map(/*func*/ ctx[9]),
    				name: "",
    				sub: true,
    				width: 140,
    				height: 26,
    				radius: 6,
    				iconSize: 19,
    				iconMargin: 0
    			},
    			$$inline: true
    		});

    	multiselect1.$on("valueChange", /*updateDecoration*/ ctx[5]);

    	multitoggle0 = new MultiToggle({
    			props: {
    				elements: textCasing,
    				selection: casingIndices$1[/*fontRef*/ ctx[0].casing],
    				name: "",
    				sub: true,
    				width: 140,
    				height: 26,
    				radius: 6,
    				iconSize: 19
    			},
    			$$inline: true
    		});

    	multitoggle0.$on("valueChange", /*updateCasing*/ ctx[4]);

    	multitoggle1 = new MultiToggle({
    			props: {
    				elements: textAlignment,
    				selection: alignmentIndices$1[/*fontRef*/ ctx[0].alignment],
    				name: "",
    				sub: true,
    				width: 140,
    				height: 26,
    				radius: 6,
    				iconSize: 19
    			},
    			$$inline: true
    		});

    	multitoggle1.$on("valueChange", /*updateAlignment*/ ctx[3]);

    	unitinput0 = new UnitInput({
    			props: {
    				name: "Size",
    				sub: true,
    				v: 0,
    				hasMargin: false
    			},
    			$$inline: true
    		});

    	unitinput1 = new UnitInput({
    			props: {
    				name: "Tracking",
    				sub: true,
    				v: 0,
    				hasMargin: false
    			},
    			$$inline: true
    		});

    	unitinput2 = new UnitInput({
    			props: {
    				name: "Line Height",
    				sub: true,
    				v: 0,
    				hasMargin: false
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			h6 = element("h6");
    			t0 = text(/*name*/ ctx[1]);
    			t1 = space();
    			main = element("main");
    			section4 = element("section");
    			section1 = element("section");
    			create_component(multiselect0.$$.fragment);
    			t2 = space();
    			section2 = element("section");
    			t3 = space();
    			section3 = element("section");
    			create_component(multiselect1.$$.fragment);
    			t4 = space();
    			div0 = element("div");
    			t5 = space();
    			create_component(multitoggle0.$$.fragment);
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			create_component(multitoggle1.$$.fragment);
    			t8 = space();
    			div2 = element("div");
    			t9 = space();
    			create_component(unitinput0.$$.fragment);
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			create_component(unitinput1.$$.fragment);
    			t12 = space();
    			div4 = element("div");
    			t13 = space();
    			create_component(unitinput2.$$.fragment);
    			t14 = space();
    			p = element("p");
    			t15 = text("Web fonts provided by Google Fonts\n         ⎸ \n        ");
    			a = element("a");
    			a.textContent = "Privacy";
    			attr_dev(h6, "class", "svelte-1rqrrr4");
    			add_location(h6, file$e, 184, 4, 8527);
    			attr_dev(section0, "id", "snapped-title-container");
    			attr_dev(section0, "class", "hidden svelte-1rqrrr4");
    			attr_dev(section0, "style", `transform: translate3d(0px, -${100 + titleHeight}px, 0px)`);
    			add_location(section0, file$e, 181, 0, 8364);
    			set_style(section1, "transform", "translate3d(0px,-5px,0px)");
    			attr_dev(section1, "class", "svelte-1rqrrr4");
    			add_location(section1, file$e, 192, 8, 8814);
    			attr_dev(section2, "id", "font-selection-container");
    			attr_dev(section2, "class", "svelte-1rqrrr4");
    			add_location(section2, file$e, 198, 8, 9146);
    			set_style(div0, "min-height", "2px");
    			add_location(div0, file$e, 209, 12, 9694);
    			set_style(div1, "min-height", "2px");
    			add_location(div1, file$e, 216, 12, 9987);
    			set_style(div2, "min-height", "2px");
    			add_location(div2, file$e, 223, 12, 10307);
    			set_style(div3, "min-height", "2px");
    			add_location(div3, file$e, 227, 12, 10444);
    			set_style(div4, "min-height", "2px");
    			add_location(div4, file$e, 231, 12, 10597);
    			attr_dev(section3, "id", "font-attribute-container");
    			set_style(section3, "transform", "translate3d(0px,-5px,0px)");
    			attr_dev(section3, "class", "svelte-1rqrrr4");
    			add_location(section3, file$e, 203, 8, 9257);
    			attr_dev(section4, "id", "top-selector-container");
    			attr_dev(section4, "class", "svelte-1rqrrr4");
    			add_location(section4, file$e, 190, 4, 8730);
    			attr_dev(a, "href", "https://developers.google.com/fonts/faq/privacy");
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-1rqrrr4");
    			add_location(a, file$e, 251, 8, 11532);
    			attr_dev(p, "id", "copyright-msg");
    			attr_dev(p, "class", "no-drag svelte-1rqrrr4");
    			add_location(p, file$e, 248, 4, 11420);
    			set_style(main, "transform", "translate3d(0px, " + /*$contentYOffset*/ ctx[2] + "px, 0px)");
    			attr_dev(main, "class", "svelte-1rqrrr4");
    			add_location(main, file$e, 188, 0, 8590);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h6);
    			append_dev(h6, t0);
    			/*section0_binding*/ ctx[8](section0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, section4);
    			append_dev(section4, section1);
    			mount_component(multiselect0, section1, null);
    			append_dev(section4, t2);
    			append_dev(section4, section2);
    			append_dev(section4, t3);
    			append_dev(section4, section3);
    			mount_component(multiselect1, section3, null);
    			append_dev(section3, t4);
    			append_dev(section3, div0);
    			append_dev(section3, t5);
    			mount_component(multitoggle0, section3, null);
    			append_dev(section3, t6);
    			append_dev(section3, div1);
    			append_dev(section3, t7);
    			mount_component(multitoggle1, section3, null);
    			append_dev(section3, t8);
    			append_dev(section3, div2);
    			append_dev(section3, t9);
    			mount_component(unitinput0, section3, null);
    			append_dev(section3, t10);
    			append_dev(section3, div3);
    			append_dev(section3, t11);
    			mount_component(unitinput1, section3, null);
    			append_dev(section3, t12);
    			append_dev(section3, div4);
    			append_dev(section3, t13);
    			mount_component(unitinput2, section3, null);
    			append_dev(main, t14);
    			append_dev(main, p);
    			append_dev(p, t15);
    			append_dev(p, a);
    			/*main_binding*/ ctx[10](main);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 2) set_data_dev(t0, /*name*/ ctx[1]);
    			const multiselect1_changes = {};
    			if (dirty & /*fontRef*/ 1) multiselect1_changes.selections = /*fontRef*/ ctx[0].textDecorations.map(/*func*/ ctx[9]);
    			multiselect1.$set(multiselect1_changes);
    			const multitoggle0_changes = {};
    			if (dirty & /*fontRef*/ 1) multitoggle0_changes.selection = casingIndices$1[/*fontRef*/ ctx[0].casing];
    			multitoggle0.$set(multitoggle0_changes);
    			const multitoggle1_changes = {};
    			if (dirty & /*fontRef*/ 1) multitoggle1_changes.selection = alignmentIndices$1[/*fontRef*/ ctx[0].alignment];
    			multitoggle1.$set(multitoggle1_changes);

    			if (!current || dirty & /*$contentYOffset*/ 4) {
    				set_style(main, "transform", "translate3d(0px, " + /*$contentYOffset*/ ctx[2] + "px, 0px)");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(multiselect0.$$.fragment, local);
    			transition_in(multiselect1.$$.fragment, local);
    			transition_in(multitoggle0.$$.fragment, local);
    			transition_in(multitoggle1.$$.fragment, local);
    			transition_in(unitinput0.$$.fragment, local);
    			transition_in(unitinput1.$$.fragment, local);
    			transition_in(unitinput2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(multiselect0.$$.fragment, local);
    			transition_out(multiselect1.$$.fragment, local);
    			transition_out(multitoggle0.$$.fragment, local);
    			transition_out(multitoggle1.$$.fragment, local);
    			transition_out(unitinput0.$$.fragment, local);
    			transition_out(unitinput1.$$.fragment, local);
    			transition_out(unitinput2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			/*section0_binding*/ ctx[8](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(multiselect0);
    			destroy_component(multiselect1);
    			destroy_component(multitoggle0);
    			destroy_component(multitoggle1);
    			destroy_component(unitinput0);
    			destroy_component(unitinput1);
    			destroy_component(unitinput2);
    			/*main_binding*/ ctx[10](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function openFontPicker(propertyRef, propertyName, trackTarget, props = { trackContinuously: true }) {
    	// setColorPickerRef(propertyRef); // set the color reference
    	mainFontPickerData.update(pickerDat => {
    		pickerDat.fontRefName = propertyRef; // update color reference
    		pickerDat.fontName = propertyName; // update color name
    		return pickerDat;
    	});

    	// open the overlay frame
    	openOverlayFrame(trackTarget, updateOverlaySize, props.trackContinuously, FontPickerOverlay_1);
    }

    // ======================== NON EXPORTABLES ========================
    // track if drag is locked or not to update our overlay sizing. We only want to update something when it's necessary
    // also track visible because hiding and showing it is weird
    let dragLocked = get_store_value(mainOverlayData).dragLocked;

    let lastDragLocked = get_store_value(mainOverlayData).dragLocked;
    let visible = get_store_value(mainOverlayData).visible;
    let lastVisible = get_store_value(mainOverlayData).visible;
    let mainContainer;
    let mainTitleContainer;

    // these configure the sizing of the window. Manually configure them for now cuz I can't be bothered to write detection code
    let normalOverlayWidth = 650;

    let normalOverlayHeight = 297;
    let titleHeight = 25;
    let targetHeight = normalOverlayHeight;
    let targetWidth = normalOverlayHeight;
    let targetCursorOffset = 0;
    let globalContentYOffset = 13;
    let targetYOffset = globalContentYOffset;
    let contentYOffset = tweened(targetYOffset, { duration: 500, easing: cubicOut }); // controls how much the content is moved down. Update with height changes

    /**
     * This is an object that maps the alignment values to a certain index.
     * It helps in easily identifying the position of the element on the component UI.
     * Every component might have a different alignmentIndicies object. This one is exclusive to this component.
     */
    const alignmentIndices$1 = {
    	"left": 0,
    	"center": 1,
    	"right": 2,
    	"justify": 3
    };

    const casingIndices$1 = { "lower": 0, "mix": 1, "upper": 2 };

    const decorationIndices$1 = {
    	"italicize": 0,
    	"underline": 1,
    	"strike": 2
    };

    /**
     * This fucntion handle all size changes for the element. Normally, the overlay size will only update if it's closed. However, this can be changed if forceUpdate is set to true.
     *
     * @param forceUpdate - force the update regardless of overlay visibility
     */
    const updateOverlaySize = (forceUpdate = false) => {
    	setTimeout(
    		() => {
    			// we only want to run when there's a change in drag and last dragged, or when an override is called
    			dragLocked = get_store_value(mainOverlayData).dragLocked;

    			visible = get_store_value(mainOverlayData).visible;

    			// the element checking basically ensures there's something to update
    			if (dragLocked === lastDragLocked && visible === lastVisible && !!mainContainer) {
    				if (!forceUpdate) return;
    			}

    			// code starts executing here, if there is a change between dragLocked
    			// If the update isn't an override, really only these code should be executed
    			mainOverlayData.update(overlayDat => {
    				overlayDat.w = normalOverlayWidth;
    				return overlayDat;
    			});

    			// these determine how to update the sizing based on the mode
    			if (!!dragLocked) {
    				// how to update the overlay when it's dragged out
    				targetHeight = normalOverlayHeight + titleHeight;

    				targetCursorOffset = titleHeight / 2;

    				// unhide the title
    				if (!!mainTitleContainer) mainTitleContainer.classList.remove("hidden");

    				targetYOffset = globalContentYOffset + titleHeight / 2;
    			} else {
    				// how to update the overlay when it's not dragged out
    				targetHeight = normalOverlayHeight;

    				targetCursorOffset = titleHeight / 2;

    				// hide the title
    				if (!!mainTitleContainer) mainTitleContainer.classList.add("hidden");

    				targetYOffset = globalContentYOffset;
    			}

    			// update values
    			mainOverlayData.update(overlayDat => {
    				overlayDat.h = targetHeight;
    				overlayDat.cursorOffsetY = targetCursorOffset;
    				return overlayDat;
    			});

    			contentYOffset.set(targetYOffset);
    			lastDragLocked = dragLocked;
    			lastVisible = visible;
    		},
    		0
    	);
    };

    function instance$e($$self, $$props, $$invalidate) {
    	let name;
    	let $collection;
    	let $mainFontPickerData;
    	let $mainOverlayData;
    	let $contentYOffset;
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(11, $collection = $$value));
    	validate_store(mainFontPickerData, 'mainFontPickerData');
    	component_subscribe($$self, mainFontPickerData, $$value => $$invalidate(7, $mainFontPickerData = $$value));
    	validate_store(mainOverlayData, 'mainOverlayData');
    	component_subscribe($$self, mainOverlayData, $$value => $$invalidate(12, $mainOverlayData = $$value));
    	validate_store(contentYOffset, 'contentYOffset');
    	component_subscribe($$self, contentYOffset, $$value => $$invalidate(2, $contentYOffset = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FontPickerOverlay', slots, []);
    	var _a;
    	let fontRef;

    	// This try catch tries to retrieve the specified color reference from $collection.
    	// If such reference exists, then we point our local colorRef to the $collection reference.
    	// If such reference does not exist or no longer exists, we will just duplicate the value we currently have so that the value can persist on and not reset itself.
    	// If there is any error during checking or assigning, we can just reset everything for safety.
    	try {
    		if ($mainFontPickerData.fontRefName && $mainOverlayData.elementNumber !== -1) {
    			if ($mainOverlayData.overrideNumber !== -1) {
    				fontRef = $collection[$mainOverlayData.elementNumber].styleOverrides[$mainOverlayData.overrideNumber].style[$mainFontPickerData.fontRefName]; // there is an overlay, so choose the overlay style
    			} else {
    				fontRef = $collection[$mainOverlayData.elementNumber].style[$mainFontPickerData.fontRefName]; // there is no overlay, so choose the root style
    			}
    		} else {
    			fontRef = Object.assign({}, fontRef); // persistence of color even after reference is cleared
    		}
    	} catch(error) {
    		// if there is an error, just reset the overlay because it's probably due to some bad timing between the layers and the picker
    		set_store_value(mainOverlayData, $mainOverlayData.elementNumber = -1, $mainOverlayData);

    		set_store_value(mainOverlayData, $mainOverlayData.overrideNumber = -1, $mainOverlayData);
    		set_store_value(mainFontPickerData, $mainFontPickerData.fontRefName = undefined, $mainFontPickerData);
    		set_store_value(mainFontPickerData, $mainFontPickerData.fontName = "Typography", $mainFontPickerData);
    	}

    	// ====================== UPDATE FUNCTIONS ======================
    	const updateAlignment = e => {
    		const val = e.detail.value;

    		// set the value of the alignment to the collection value
    		$$invalidate(0, fontRef.alignment = val, fontRef);

    		// update collection so that svelte can update the associated components
    		collection.set($collection);
    	};

    	const updateCasing = e => {
    		const val = e.detail.value;

    		// set the value of the alignment to the collection value
    		$$invalidate(0, fontRef.casing = val, fontRef);

    		// update collection so that svelte can update the associated components
    		collection.set($collection);
    	};

    	const updateDecoration = e => {
    		e.detail.values;

    		// set the value of the decorations accordingly
    		$$invalidate(0, fontRef.textDecorations = e.detail.values, fontRef);

    		// update collection so that svelte can update the associated components
    		collection.set($collection);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FontPickerOverlay> was created with unknown prop '${key}'`);
    	});

    	function section0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainTitleContainer = $$value;
    		});
    	}

    	const func = i => decorationIndices$1[i];

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainContainer = $$value;
    		});
    	}

    	$$self.$capture_state = () => ({
    		_a,
    		openOverlayFrame,
    		mainFontPickerData,
    		openFontPicker,
    		dragLocked,
    		lastDragLocked,
    		visible,
    		lastVisible,
    		mainContainer,
    		mainTitleContainer,
    		normalOverlayWidth,
    		normalOverlayHeight,
    		titleHeight,
    		targetHeight,
    		targetWidth,
    		targetCursorOffset,
    		globalContentYOffset,
    		targetYOffset,
    		contentYOffset,
    		alignmentIndices: alignmentIndices$1,
    		casingIndices: casingIndices$1,
    		decorationIndices: decorationIndices$1,
    		updateOverlaySize,
    		_a,
    		tweened,
    		cubicOut,
    		FontPickerOverlay: FontPickerOverlay_1,
    		collection,
    		mainOverlayData,
    		get: get_store_value,
    		MultiSelect,
    		textDecoration,
    		typeFilters,
    		MultiToggle,
    		textAlignment,
    		textCasing,
    		UnitInput,
    		fontRef,
    		updateAlignment,
    		updateCasing,
    		updateDecoration,
    		name,
    		$collection,
    		$mainFontPickerData,
    		$mainOverlayData,
    		$contentYOffset
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) $$invalidate(6, _a = $$props._a);
    		if ('fontRef' in $$props) $$invalidate(0, fontRef = $$props.fontRef);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$mainFontPickerData, _a*/ 192) {
    			$$invalidate(1, name = $$invalidate(6, _a = $mainFontPickerData.fontName) !== null && _a !== void 0
    			? _a
    			: "Fonts");
    		}
    	};

    	return [
    		fontRef,
    		name,
    		$contentYOffset,
    		updateAlignment,
    		updateCasing,
    		updateDecoration,
    		_a,
    		$mainFontPickerData,
    		section0_binding,
    		func,
    		main_binding
    	];
    }

    class FontPickerOverlay_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FontPickerOverlay_1",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/ctrlMenuItems/StyleEditors/TextEditor.svelte generated by Svelte v3.48.0 */
    const file$d = "src/components/ctrlMenuItems/StyleEditors/TextEditor.svelte";

    function create_fragment$d(ctx) {
    	let main;
    	let section0;
    	let h1;
    	let t1;
    	let textareainput0;
    	let t2;
    	let div0;
    	let t3;
    	let textareainput1;
    	let t4;
    	let div1;
    	let t5;
    	let title;
    	let t6;
    	let section1;
    	let div2;
    	let t7;
    	let div3;
    	let t8;
    	let typefacefinder;
    	let t9;
    	let dropdown;
    	let t10;
    	let div4;
    	let t11;
    	let section2;
    	let unitinput0;
    	let t12;
    	let unitinput1;
    	let t13;
    	let unitinput2;
    	let t14;
    	let div5;
    	let t15;
    	let multitoggle0;
    	let t16;
    	let div6;
    	let t17;
    	let multitoggle1;
    	let t18;
    	let div7;
    	let t19;
    	let multiselect;
    	let t20;
    	let div8;
    	let current;
    	let mounted;
    	let dispose;

    	textareainput0 = new TextAreaInput({
    			props: {
    				name: "Content",
    				placeHolder: "Lorem ipsum dolor sit amet.",
    				v: "",
    				hasMargin: false,
    				sub: false,
    				currentParenteWidth: /*currentParentWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	textareainput1 = new TextAreaInput({
    			props: {
    				name: "Placeholder",
    				placeHolder: "Lorem ipsum dolor sit amet.",
    				v: "",
    				hasMargin: false,
    				sub: false,
    				currentParenteWidth: /*currentParentWidth*/ ctx[0]
    			},
    			$$inline: true
    		});

    	title = new Title({
    			props: { name: "Typography & Appearance" },
    			$$inline: true
    		});

    	typefacefinder = new TypefaceFinder({
    			props: {
    				name: "Typeface",
    				typeface: /*fontRef*/ ctx[2],
    				hasMargin: true,
    				sub: true,
    				minWidth: "",
    				widthGrowPerc: 176
    			},
    			$$inline: true
    		});

    	typefacefinder.$on("focused", /*openFontOverlay*/ ctx[6]);

    	dropdown = new Dropdown({
    			props: {
    				name: "Font",
    				v: "Regular",
    				possibleValues: ["Thin", "Regular", "Bold"],
    				sub: true,
    				hasMargin: false
    			},
    			$$inline: true
    		});

    	unitinput0 = new UnitInput({
    			props: {
    				name: "Size",
    				v: 0,
    				sub: true,
    				hasMargin: true
    			},
    			$$inline: true
    		});

    	unitinput1 = new UnitInput({
    			props: {
    				name: "Tracking",
    				v: 0,
    				sub: true,
    				hasMargin: true
    			},
    			$$inline: true
    		});

    	unitinput2 = new UnitInput({
    			props: {
    				name: "Line Height",
    				v: 0,
    				sub: true,
    				hasMargin: false
    			},
    			$$inline: true
    		});

    	multitoggle0 = new MultiToggle({
    			props: {
    				elements: textAlignment,
    				selection: alignmentIndices[/*fontRef*/ ctx[2].alignment],
    				name: "Alignment",
    				sub: true,
    				width: /*currentParentWidth*/ ctx[0] - 27,
    				height: 25,
    				radius: 4,
    				iconSize: 18
    			},
    			$$inline: true
    		});

    	multitoggle0.$on("valueChange", /*updateAlignment*/ ctx[7]);

    	multitoggle1 = new MultiToggle({
    			props: {
    				elements: textCasing,
    				selection: casingIndices[/*fontRef*/ ctx[2].casing],
    				name: "Text Casing",
    				sub: true,
    				width: /*currentParentWidth*/ ctx[0] - 27,
    				height: 25,
    				radius: 4,
    				iconSize: 18
    			},
    			$$inline: true
    		});

    	multitoggle1.$on("valueChange", /*updateCasing*/ ctx[8]);

    	multiselect = new MultiSelect({
    			props: {
    				elements: textDecoration,
    				selections: /*fontRef*/ ctx[2].textDecorations.map(/*func*/ ctx[16]),
    				name: "Decoration",
    				sub: true,
    				width: /*currentParentWidth*/ ctx[0] - 27,
    				height: 25,
    				radius: 4,
    				iconSize: 18
    			},
    			$$inline: true
    		});

    	multiselect.$on("valueChange", /*updateDecoration*/ ctx[9]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section0 = element("section");
    			h1 = element("h1");
    			h1.textContent = "Text";
    			t1 = space();
    			create_component(textareainput0.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			t3 = space();
    			create_component(textareainput1.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			create_component(title.$$.fragment);
    			t6 = space();
    			section1 = element("section");
    			div2 = element("div");
    			t7 = space();
    			div3 = element("div");
    			t8 = space();
    			create_component(typefacefinder.$$.fragment);
    			t9 = space();
    			create_component(dropdown.$$.fragment);
    			t10 = space();
    			div4 = element("div");
    			t11 = space();
    			section2 = element("section");
    			create_component(unitinput0.$$.fragment);
    			t12 = space();
    			create_component(unitinput1.$$.fragment);
    			t13 = space();
    			create_component(unitinput2.$$.fragment);
    			t14 = space();
    			div5 = element("div");
    			t15 = space();
    			create_component(multitoggle0.$$.fragment);
    			t16 = space();
    			div6 = element("div");
    			t17 = space();
    			create_component(multitoggle1.$$.fragment);
    			t18 = space();
    			div7 = element("div");
    			t19 = space();
    			create_component(multiselect.$$.fragment);
    			t20 = space();
    			div8 = element("div");
    			attr_dev(h1, "class", "svelte-12dzv0y");
    			add_location(h1, file$d, 122, 8, 4081);
    			attr_dev(section0, "id", "title-container");
    			attr_dev(section0, "class", "svelte-12dzv0y");
    			add_location(section0, file$d, 121, 4, 4042);
    			attr_dev(div0, "class", "spacer svelte-12dzv0y");
    			add_location(div0, file$d, 127, 4, 4296);
    			attr_dev(div1, "class", "spacer svelte-12dzv0y");
    			add_location(div1, file$d, 131, 4, 4517);
    			attr_dev(div2, "class", "preview-square svelte-12dzv0y");
    			set_style(div2, "background-color", "hsla(" + /*clr*/ ctx[1].h + "deg, " + /*clr*/ ctx[1].s + "%, " + /*clr*/ ctx[1].l + "%, " + /*clr*/ ctx[1].a + "%)");
    			add_location(div2, file$d, 138, 8, 4713);
    			add_location(div3, file$d, 142, 8, 4946);
    			attr_dev(section1, "class", "svelte-12dzv0y");
    			add_location(section1, file$d, 136, 4, 4665);
    			attr_dev(div4, "class", "spacer svelte-12dzv0y");
    			add_location(div4, file$d, 148, 4, 5301);
    			attr_dev(section2, "class", "svelte-12dzv0y");
    			add_location(section2, file$d, 151, 4, 5365);
    			attr_dev(div5, "class", "spacer svelte-12dzv0y");
    			add_location(div5, file$d, 160, 4, 5780);
    			attr_dev(div6, "class", "spacer svelte-12dzv0y");
    			add_location(div6, file$d, 167, 4, 6082);
    			attr_dev(div7, "class", "spacer svelte-12dzv0y");
    			add_location(div7, file$d, 174, 4, 6371);
    			set_style(div8, "height", "17px");
    			add_location(div8, file$d, 181, 4, 6692);
    			attr_dev(main, "class", "no-drag svelte-12dzv0y");
    			add_location(main, file$d, 119, 0, 3982);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section0);
    			append_dev(section0, h1);
    			append_dev(main, t1);
    			mount_component(textareainput0, main, null);
    			append_dev(main, t2);
    			append_dev(main, div0);
    			append_dev(main, t3);
    			mount_component(textareainput1, main, null);
    			append_dev(main, t4);
    			append_dev(main, div1);
    			append_dev(main, t5);
    			mount_component(title, main, null);
    			append_dev(main, t6);
    			append_dev(main, section1);
    			append_dev(section1, div2);
    			/*div2_binding*/ ctx[14](div2);
    			append_dev(section1, t7);
    			append_dev(section1, div3);
    			/*div3_binding*/ ctx[15](div3);
    			append_dev(section1, t8);
    			mount_component(typefacefinder, section1, null);
    			append_dev(section1, t9);
    			mount_component(dropdown, section1, null);
    			append_dev(main, t10);
    			append_dev(main, div4);
    			append_dev(main, t11);
    			append_dev(main, section2);
    			mount_component(unitinput0, section2, null);
    			append_dev(section2, t12);
    			mount_component(unitinput1, section2, null);
    			append_dev(section2, t13);
    			mount_component(unitinput2, section2, null);
    			append_dev(main, t14);
    			append_dev(main, div5);
    			append_dev(main, t15);
    			mount_component(multitoggle0, main, null);
    			append_dev(main, t16);
    			append_dev(main, div6);
    			append_dev(main, t17);
    			mount_component(multitoggle1, main, null);
    			append_dev(main, t18);
    			append_dev(main, div7);
    			append_dev(main, t19);
    			mount_component(multiselect, main, null);
    			append_dev(main, t20);
    			append_dev(main, div8);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div2, "mousedown", /*openColorOverlay*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const textareainput0_changes = {};
    			if (dirty & /*currentParentWidth*/ 1) textareainput0_changes.currentParenteWidth = /*currentParentWidth*/ ctx[0];
    			textareainput0.$set(textareainput0_changes);
    			const textareainput1_changes = {};
    			if (dirty & /*currentParentWidth*/ 1) textareainput1_changes.currentParenteWidth = /*currentParentWidth*/ ctx[0];
    			textareainput1.$set(textareainput1_changes);

    			if (!current || dirty & /*clr*/ 2) {
    				set_style(div2, "background-color", "hsla(" + /*clr*/ ctx[1].h + "deg, " + /*clr*/ ctx[1].s + "%, " + /*clr*/ ctx[1].l + "%, " + /*clr*/ ctx[1].a + "%)");
    			}

    			const typefacefinder_changes = {};
    			if (dirty & /*fontRef*/ 4) typefacefinder_changes.typeface = /*fontRef*/ ctx[2];
    			typefacefinder.$set(typefacefinder_changes);
    			const multitoggle0_changes = {};
    			if (dirty & /*fontRef*/ 4) multitoggle0_changes.selection = alignmentIndices[/*fontRef*/ ctx[2].alignment];
    			if (dirty & /*currentParentWidth*/ 1) multitoggle0_changes.width = /*currentParentWidth*/ ctx[0] - 27;
    			multitoggle0.$set(multitoggle0_changes);
    			const multitoggle1_changes = {};
    			if (dirty & /*fontRef*/ 4) multitoggle1_changes.selection = casingIndices[/*fontRef*/ ctx[2].casing];
    			if (dirty & /*currentParentWidth*/ 1) multitoggle1_changes.width = /*currentParentWidth*/ ctx[0] - 27;
    			multitoggle1.$set(multitoggle1_changes);
    			const multiselect_changes = {};
    			if (dirty & /*fontRef*/ 4) multiselect_changes.selections = /*fontRef*/ ctx[2].textDecorations.map(/*func*/ ctx[16]);
    			if (dirty & /*currentParentWidth*/ 1) multiselect_changes.width = /*currentParentWidth*/ ctx[0] - 27;
    			multiselect.$set(multiselect_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textareainput0.$$.fragment, local);
    			transition_in(textareainput1.$$.fragment, local);
    			transition_in(title.$$.fragment, local);
    			transition_in(typefacefinder.$$.fragment, local);
    			transition_in(dropdown.$$.fragment, local);
    			transition_in(unitinput0.$$.fragment, local);
    			transition_in(unitinput1.$$.fragment, local);
    			transition_in(unitinput2.$$.fragment, local);
    			transition_in(multitoggle0.$$.fragment, local);
    			transition_in(multitoggle1.$$.fragment, local);
    			transition_in(multiselect.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textareainput0.$$.fragment, local);
    			transition_out(textareainput1.$$.fragment, local);
    			transition_out(title.$$.fragment, local);
    			transition_out(typefacefinder.$$.fragment, local);
    			transition_out(dropdown.$$.fragment, local);
    			transition_out(unitinput0.$$.fragment, local);
    			transition_out(unitinput1.$$.fragment, local);
    			transition_out(unitinput2.$$.fragment, local);
    			transition_out(multitoggle0.$$.fragment, local);
    			transition_out(multitoggle1.$$.fragment, local);
    			transition_out(multiselect.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(textareainput0);
    			destroy_component(textareainput1);
    			destroy_component(title);
    			/*div2_binding*/ ctx[14](null);
    			/*div3_binding*/ ctx[15](null);
    			destroy_component(typefacefinder);
    			destroy_component(dropdown);
    			destroy_component(unitinput0);
    			destroy_component(unitinput1);
    			destroy_component(unitinput2);
    			destroy_component(multitoggle0);
    			destroy_component(multitoggle1);
    			destroy_component(multiselect);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const alignmentIndices = {
    	"left": 0,
    	"center": 1,
    	"right": 2,
    	"justify": 3
    };

    const casingIndices = { "lower": 0, "mix": 1, "upper": 2 };

    const decorationIndices = {
    	"italicize": 0,
    	"underline": 1,
    	"strike": 2
    };

    function instance$d($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let $collection;
    	let $selectedComponent;
    	let $selectedOverride;
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(11, $collection = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(12, $selectedComponent = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(13, $selectedOverride = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextEditor', slots, []);
    	let { currentParentWidth = 360 } = $$props;

    	// document components
    	let colorPreviewSquare;

    	let fontPicker;

    	// these variables just make the code look nicer
    	let clr = {
    		type: "hsl",
    		r: 10,
    		g: 10,
    		b: 10,
    		h: 0,
    		s: 0,
    		l: 4,
    		a: 100,
    		hex: "0a0a0a"
    	}; // default text color

    	let fontRef = {
    		typeface: "system-ui",
    		variation: 400,
    		textDecorations: [],
    		casing: "mix",
    		alignment: "center",
    		size: { v: 14, u: "px" },
    		lineHeight: { v: 100, u: "%" },
    		tracking: { v: 100, u: "%" }
    	};

    	const updateStyle = evt => {
    		if ($selectedOverride !== -1) {
    			// if no override is selected
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["outlineStyle"] = evt.detail.v, $collection);
    		} else {
    			set_store_value(collection, $collection[$selectedComponent].style["outlineStyle"] = evt.detail.v, $collection);
    		}
    	};

    	// open the color picker
    	const openColorOverlay = () => {
    		// open picker
    		openColorPicker("color", "Text Color", colorPreviewSquare, {
    			trackContinuously: true,
    			showInlineHSL: true
    		});
    	};

    	// open the font picker
    	const openFontOverlay = () => {
    		// open picker
    		openFontPicker("typeStyle", "Typography", colorPreviewSquare, { trackContinuously: true });
    	};

    	const updateAlignment = e => {
    		const val = e.detail.value;

    		// set the value of the alignment to the collection value
    		$$invalidate(2, fontRef.alignment = val, fontRef);

    		// update collection so that svelte can update the associated components
    		collection.set($collection);
    	};

    	const updateCasing = e => {
    		const val = e.detail.value;

    		// set the value of the casing to the collection value
    		$$invalidate(2, fontRef.casing = val, fontRef);

    		// update collection so that svelte can update the associated components
    		collection.set($collection);
    	};

    	const updateDecoration = e => {
    		e.detail.values;

    		// set the value of the decorations accordingly
    		$$invalidate(2, fontRef.textDecorations = e.detail.values, fontRef);

    		// update collection so that svelte can update the associated components
    		collection.set($collection);
    	};

    	// DEBUG: bruh
    	onMount(() => {
    		openFontOverlay();
    	});

    	const writable_props = ['currentParentWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextEditor> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			colorPreviewSquare = $$value;
    			$$invalidate(3, colorPreviewSquare);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fontPicker = $$value;
    			$$invalidate(4, fontPicker);
    		});
    	}

    	const func = i => decorationIndices[i];

    	$$self.$$set = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    	};

    	$$self.$capture_state = () => ({
    		alignmentIndices,
    		casingIndices,
    		decorationIndices,
    		collection,
    		selectedComponent,
    		selectedOverride,
    		TypefaceFinder,
    		Dropdown,
    		MultiToggle,
    		textAlignment,
    		textCasing,
    		MultiSelect,
    		textDecoration,
    		TextAreaInput,
    		Title,
    		UnitInput,
    		openColorPicker,
    		openFontPicker,
    		onMount,
    		currentParentWidth,
    		colorPreviewSquare,
    		fontPicker,
    		clr,
    		fontRef,
    		updateStyle,
    		openColorOverlay,
    		openFontOverlay,
    		updateAlignment,
    		updateCasing,
    		updateDecoration,
    		currentStyle,
    		$collection,
    		$selectedComponent,
    		$selectedOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ('currentParentWidth' in $$props) $$invalidate(0, currentParentWidth = $$props.currentParentWidth);
    		if ('colorPreviewSquare' in $$props) $$invalidate(3, colorPreviewSquare = $$props.colorPreviewSquare);
    		if ('fontPicker' in $$props) $$invalidate(4, fontPicker = $$props.fontPicker);
    		if ('clr' in $$props) $$invalidate(1, clr = $$props.clr);
    		if ('fontRef' in $$props) $$invalidate(2, fontRef = $$props.fontRef);
    		if ('currentStyle' in $$props) $$invalidate(10, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedOverride, $collection, $selectedComponent*/ 14336) {
    			// reactive
    			$$invalidate(10, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty & /*currentStyle, clr, fontRef*/ 1030) {
    			if (!!currentStyle) {
    				// Variable update listener. If the current style changes, then update the variables accordingly
    				// text color
    				if (!currentStyle["color"]) $$invalidate(10, currentStyle["color"] = clr, currentStyle);

    				$$invalidate(1, clr = currentStyle["color"]);

    				// typeface
    				if (!currentStyle["typeStyle"]) $$invalidate(10, currentStyle["typeStyle"] = fontRef, currentStyle);

    				$$invalidate(2, fontRef = currentStyle["typeStyle"]);
    			}
    		}
    	};

    	return [
    		currentParentWidth,
    		clr,
    		fontRef,
    		colorPreviewSquare,
    		fontPicker,
    		openColorOverlay,
    		openFontOverlay,
    		updateAlignment,
    		updateCasing,
    		updateDecoration,
    		currentStyle,
    		$collection,
    		$selectedComponent,
    		$selectedOverride,
    		div2_binding,
    		div3_binding,
    		func
    	];
    }

    class TextEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { currentParentWidth: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextEditor",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get currentParentWidth() {
    		throw new Error("<TextEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentParentWidth(value) {
    		throw new Error("<TextEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenus/RightMenu.svelte generated by Svelte v3.48.0 */
    const file$c = "src/components/ctrlMenus/RightMenu.svelte";

    // (41:4) {#if $selectedComponent !== -1 || $selectedOverride !== -1}
    function create_if_block$4(ctx) {
    	let boundingboxeditor;
    	let t0;
    	let texteditor;
    	let t1;
    	let appearanceeditor;
    	let t2;
    	let backgroundeditor;
    	let t3;
    	let bordereditor;
    	let t4;
    	let outlineeditor;
    	let t5;
    	let shadoweditor;
    	let t6;
    	let div;
    	let current;

    	boundingboxeditor = new BoundingBoxEditor({
    			props: {
    				currentParentWidth: /*currentWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	texteditor = new TextEditor({
    			props: {
    				currentParentWidth: /*currentWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	appearanceeditor = new AppearanceEditor({
    			props: {
    				currentParentWidth: /*currentWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	backgroundeditor = new BackgroundEditor({
    			props: {
    				currentParentWidth: /*currentWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	bordereditor = new BorderEditor({
    			props: {
    				currentParentWidth: /*currentWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	outlineeditor = new OutlineEditor({
    			props: {
    				currentParentWidth: /*currentWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	shadoweditor = new ShadowEditor({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(boundingboxeditor.$$.fragment);
    			t0 = space();
    			create_component(texteditor.$$.fragment);
    			t1 = space();
    			create_component(appearanceeditor.$$.fragment);
    			t2 = space();
    			create_component(backgroundeditor.$$.fragment);
    			t3 = space();
    			create_component(bordereditor.$$.fragment);
    			t4 = space();
    			create_component(outlineeditor.$$.fragment);
    			t5 = space();
    			create_component(shadoweditor.$$.fragment);
    			t6 = space();
    			div = element("div");
    			set_style(div, "min-height", "65px");
    			set_style(div, "height", "65px");
    			add_location(div, file$c, 63, 8, 2682);
    		},
    		m: function mount(target, anchor) {
    			mount_component(boundingboxeditor, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(texteditor, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(appearanceeditor, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(backgroundeditor, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(bordereditor, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(outlineeditor, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(shadoweditor, target, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const boundingboxeditor_changes = {};
    			if (dirty & /*currentWidth*/ 2) boundingboxeditor_changes.currentParentWidth = /*currentWidth*/ ctx[1];
    			boundingboxeditor.$set(boundingboxeditor_changes);
    			const texteditor_changes = {};
    			if (dirty & /*currentWidth*/ 2) texteditor_changes.currentParentWidth = /*currentWidth*/ ctx[1];
    			texteditor.$set(texteditor_changes);
    			const appearanceeditor_changes = {};
    			if (dirty & /*currentWidth*/ 2) appearanceeditor_changes.currentParentWidth = /*currentWidth*/ ctx[1];
    			appearanceeditor.$set(appearanceeditor_changes);
    			const backgroundeditor_changes = {};
    			if (dirty & /*currentWidth*/ 2) backgroundeditor_changes.currentParentWidth = /*currentWidth*/ ctx[1];
    			backgroundeditor.$set(backgroundeditor_changes);
    			const bordereditor_changes = {};
    			if (dirty & /*currentWidth*/ 2) bordereditor_changes.currentParentWidth = /*currentWidth*/ ctx[1];
    			bordereditor.$set(bordereditor_changes);
    			const outlineeditor_changes = {};
    			if (dirty & /*currentWidth*/ 2) outlineeditor_changes.currentParentWidth = /*currentWidth*/ ctx[1];
    			outlineeditor.$set(outlineeditor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(boundingboxeditor.$$.fragment, local);
    			transition_in(texteditor.$$.fragment, local);
    			transition_in(appearanceeditor.$$.fragment, local);
    			transition_in(backgroundeditor.$$.fragment, local);
    			transition_in(bordereditor.$$.fragment, local);
    			transition_in(outlineeditor.$$.fragment, local);
    			transition_in(shadoweditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(boundingboxeditor.$$.fragment, local);
    			transition_out(texteditor.$$.fragment, local);
    			transition_out(appearanceeditor.$$.fragment, local);
    			transition_out(backgroundeditor.$$.fragment, local);
    			transition_out(bordereditor.$$.fragment, local);
    			transition_out(outlineeditor.$$.fragment, local);
    			transition_out(shadoweditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(boundingboxeditor, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(texteditor, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(appearanceeditor, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(backgroundeditor, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(bordereditor, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(outlineeditor, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(shadoweditor, detaching);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(41:4) {#if $selectedComponent !== -1 || $selectedOverride !== -1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let main;
    	let div;
    	let div_style_value;
    	let t;
    	let main_resize_listener;
    	let current;
    	let if_block = (/*$selectedComponent*/ ctx[2] !== -1 || /*$selectedOverride*/ ctx[4] !== -1) && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "drag-space");
    			attr_dev(div, "style", div_style_value = `top:0; right:${/*currentWidth*/ ctx[1] - 3}px`);
    			attr_dev(div, "class", "svelte-1bsld4c");
    			add_location(div, file$c, 37, 4, 1784);
    			set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			set_style(main, "max-width", /*currentWidth*/ ctx[1] + "px");
    			set_style(main, "position", "absolute");
    			attr_dev(main, "class", "svelte-1bsld4c");
    			add_render_callback(() => /*main_elementresize_handler*/ ctx[7].call(main));
    			add_location(main, file$c, 35, 0, 1630);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			/*div_binding*/ ctx[6](div);
    			append_dev(main, t);
    			if (if_block) if_block.m(main, null);
    			main_resize_listener = add_resize_listener(main, /*main_elementresize_handler*/ ctx[7].bind(main));
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*currentWidth*/ 2 && div_style_value !== (div_style_value = `top:0; right:${/*currentWidth*/ ctx[1] - 3}px`)) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (/*$selectedComponent*/ ctx[2] !== -1 || /*$selectedOverride*/ ctx[4] !== -1) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$selectedComponent, $selectedOverride*/ 20) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*currentWidth*/ 2) {
    				set_style(main, "width", /*currentWidth*/ ctx[1] + "px");
    			}

    			if (!current || dirty & /*currentWidth*/ 2) {
    				set_style(main, "max-width", /*currentWidth*/ ctx[1] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*div_binding*/ ctx[6](null);
    			if (if_block) if_block.d();
    			main_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let currentComponent;
    	let $selectedComponent;
    	let $collection;
    	let $selectedOverride;
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(2, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(5, $collection = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(4, $selectedOverride = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RightMenu', slots, []);
    	const disp = createEventDispatcher();
    	let dragSpace;
    	let currentWidth = 360;
    	let currentHeight = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RightMenu> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			dragSpace = $$value;
    			($$invalidate(0, dragSpace), $$invalidate(1, currentWidth));
    		});
    	}

    	function main_elementresize_handler() {
    		currentHeight = this.clientHeight;
    		$$invalidate(3, currentHeight);
    	}

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		BoundingBoxEditor,
    		BorderEditor,
    		OutlineEditor,
    		BackgroundEditor,
    		AppearanceEditor,
    		createEventDispatcher,
    		ShadowEditor,
    		TextEditor,
    		disp,
    		dragSpace,
    		currentWidth,
    		currentHeight,
    		currentComponent,
    		$selectedComponent,
    		$collection,
    		$selectedOverride
    	});

    	$$self.$inject_state = $$props => {
    		if ('dragSpace' in $$props) $$invalidate(0, dragSpace = $$props.dragSpace);
    		if ('currentWidth' in $$props) $$invalidate(1, currentWidth = $$props.currentWidth);
    		if ('currentHeight' in $$props) $$invalidate(3, currentHeight = $$props.currentHeight);
    		if ('currentComponent' in $$props) currentComponent = $$props.currentComponent;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$collection, $selectedComponent*/ 36) {
    			currentComponent = $collection[$selectedComponent];
    		}

    		if ($$self.$$.dirty & /*dragSpace, currentWidth*/ 3) {
    			if (!!dragSpace) {
    				// as soon as dragSpace is initialized, add the drag event listener for resize
    				$$invalidate(
    					0,
    					dragSpace.onmousedown = () => {
    						document.onmousemove = e => {
    							e.preventDefault();
    							document.body.style.cursor = "col-resize"; // set consistent cursor

    							if (window.innerWidth - e.clientX < 500 && window.innerWidth - e.clientX > 300) {
    								$$invalidate(1, currentWidth = window.innerWidth - e.clientX);
    								disp("widthChange", { width: currentWidth });
    							}
    						};
    					},
    					dragSpace
    				);

    				document.onmouseup = () => {
    					document.body.style.cursor = "default"; // reset cursor
    					document.onmousemove = undefined;
    				};
    			}
    		}
    	};

    	return [
    		dragSpace,
    		currentWidth,
    		$selectedComponent,
    		currentHeight,
    		$selectedOverride,
    		$collection,
    		div_binding,
    		main_elementresize_handler
    	];
    }

    class RightMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RightMenu",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    let fileStat = writable({
        name: "Untitled",
        saved: false,
        autoSavetoCloud: false,
        alwaysShowSaveStatus: false
    });

    /* src/components/ctrlMenuItems/FileNameEditor.svelte generated by Svelte v3.48.0 */
    const file$b = "src/components/ctrlMenuItems/FileNameEditor.svelte";

    // (34:8) {#if !$fileStat.saved}
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Edited";
    			attr_dev(p, "class", "svelte-z2pmdv");
    			add_location(p, file$b, 34, 12, 1049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:8) {#if !$fileStat.saved}",
    		ctx
    	});

    	return block;
    }

    // (27:4) {#if $fileStat.alwaysShowSaveStatus}
    function create_if_block$3(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (!/*$fileStat*/ ctx[3].saved) return create_if_block_1$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(27:4) {#if $fileStat.alwaysShowSaveStatus}",
    		ctx
    	});

    	return block;
    }

    // (30:8) {:else}
    function create_else_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Saved";
    			attr_dev(p, "class", "svelte-z2pmdv");
    			add_location(p, file$b, 30, 12, 967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(30:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {#if !$fileStat.saved}
    function create_if_block_1$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Edited";
    			attr_dev(p, "class", "svelte-z2pmdv");
    			add_location(p, file$b, 28, 12, 925);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(28:8) {#if !$fileStat.saved}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let main;
    	let span;
    	let t0_value = /*$fileStat*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$fileStat*/ ctx[3].alwaysShowSaveStatus) return create_if_block$3;
    		if (!/*$fileStat*/ ctx[3].saved) return create_if_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "type", "text");
    			attr_dev(span, "contenteditable", "true");
    			attr_dev(span, "placeholder", "Untitled");
    			set_style(span, "max-width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px - " + /*controlSectionWidth*/ ctx[1] + "px)");
    			attr_dev(span, "class", "svelte-z2pmdv");
    			add_location(span, file$b, 24, 4, 586);
    			attr_dev(main, "class", "svelte-z2pmdv");
    			add_location(main, file$b, 23, 0, 575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, span);
    			append_dev(span, t0);
    			/*span_binding*/ ctx[5](span);
    			append_dev(main, t1);
    			if (if_block) if_block.m(main, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "keypress", /*preventNewline*/ ctx[4], false, false, false),
    					listen_dev(span, "paste", paste_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$fileStat*/ 8 && t0_value !== (t0_value = /*$fileStat*/ ctx[3].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*leftMenuWidth, controlSectionWidth*/ 3) {
    				set_style(span, "max-width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px - " + /*controlSectionWidth*/ ctx[1] + "px)");
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*span_binding*/ ctx[5](null);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const paste_handler = e => e.preventDefault();

    function instance$b($$self, $$props, $$invalidate) {
    	let $fileStat;
    	validate_store(fileStat, 'fileStat');
    	component_subscribe($$self, fileStat, $$value => $$invalidate(3, $fileStat = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FileNameEditor', slots, []);
    	let { leftMenuWidth = 260 } = $$props;
    	let { controlSectionWidth = 500 } = $$props;
    	let fileNameField;

    	const preventNewline = e => {
    		if (e.key === "Enter" || e.key === "Escape") {
    			e.preventDefault();
    			fileNameField.blur();
    			return;
    		}

    		if (fileNameField.innerHTML.length > 50) {
    			e.preventDefault();
    			return;
    		}
    	};

    	const writable_props = ['leftMenuWidth', 'controlSectionWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FileNameEditor> was created with unknown prop '${key}'`);
    	});

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			fileNameField = $$value;
    			$$invalidate(2, fileNameField);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('controlSectionWidth' in $$props) $$invalidate(1, controlSectionWidth = $$props.controlSectionWidth);
    	};

    	$$self.$capture_state = () => ({
    		fileStat,
    		leftMenuWidth,
    		controlSectionWidth,
    		fileNameField,
    		preventNewline,
    		$fileStat
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('controlSectionWidth' in $$props) $$invalidate(1, controlSectionWidth = $$props.controlSectionWidth);
    		if ('fileNameField' in $$props) $$invalidate(2, fileNameField = $$props.fileNameField);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*fileNameField*/ 4) {
    			if (!!fileNameField) {
    				// once initialized
    				$$invalidate(
    					2,
    					fileNameField.onblur = () => {
    						$$invalidate(2, fileNameField.scrollLeft = 0, fileNameField);
    					},
    					fileNameField
    				);
    			}
    		}
    	};

    	return [
    		leftMenuWidth,
    		controlSectionWidth,
    		fileNameField,
    		$fileStat,
    		preventNewline,
    		span_binding
    	];
    }

    class FileNameEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { leftMenuWidth: 0, controlSectionWidth: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileNameEditor",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get leftMenuWidth() {
    		throw new Error("<FileNameEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leftMenuWidth(value) {
    		throw new Error("<FileNameEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get controlSectionWidth() {
    		throw new Error("<FileNameEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set controlSectionWidth(value) {
    		throw new Error("<FileNameEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/GeneralAppControl/RegularControl.svelte generated by Svelte v3.48.0 */

    const file$a = "src/components/ctrlMenuItems/GeneralAppControl/RegularControl.svelte";

    function create_fragment$a(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*imageURI*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[1]);
    			attr_dev(img, "class", "svelte-4sjq7j");
    			add_location(img, file$a, 6, 4, 132);
    			attr_dev(main, "title", /*alt*/ ctx[1]);
    			attr_dev(main, "class", "svelte-4sjq7j");
    			add_location(main, file$a, 5, 0, 94);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img);

    			if (!mounted) {
    				dispose = listen_dev(
    					main,
    					"click",
    					function () {
    						if (is_function(/*cta*/ ctx[2])) /*cta*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*imageURI*/ 1 && !src_url_equal(img.src, img_src_value = /*imageURI*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img, "alt", /*alt*/ ctx[1]);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(main, "title", /*alt*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RegularControl', slots, []);
    	let { imageURI } = $$props;
    	let { alt } = $$props;

    	let { cta = () => {
    		
    	} } = $$props;

    	const writable_props = ['imageURI', 'alt', 'cta'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RegularControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('cta' in $$props) $$invalidate(2, cta = $$props.cta);
    	};

    	$$self.$capture_state = () => ({ imageURI, alt, cta });

    	$$self.$inject_state = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('cta' in $$props) $$invalidate(2, cta = $$props.cta);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [imageURI, alt, cta];
    }

    class RegularControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { imageURI: 0, alt: 1, cta: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegularControl",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imageURI*/ ctx[0] === undefined && !('imageURI' in props)) {
    			console.warn("<RegularControl> was created without expected prop 'imageURI'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !('alt' in props)) {
    			console.warn("<RegularControl> was created without expected prop 'alt'");
    		}
    	}

    	get imageURI() {
    		throw new Error("<RegularControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageURI(value) {
    		throw new Error("<RegularControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<RegularControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<RegularControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cta() {
    		throw new Error("<RegularControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cta(value) {
    		throw new Error("<RegularControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let canvasStatus = writable({
        x: 0,
        y: 0,
        zoom: 1,
        darkMode: false
    });

    /* src/components/ctrlMenuItems/GeneralAppControl/ZoomControl.svelte generated by Svelte v3.48.0 */
    const file$9 = "src/components/ctrlMenuItems/GeneralAppControl/ZoomControl.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let p;
    	let t0_value = Math.round(/*$canvasStatus*/ ctx[0].zoom * 100) + "";
    	let t0;
    	let t1;
    	let t2;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text("%");
    			t2 = space();
    			img = element("img");
    			attr_dev(p, "class", "svelte-16es0lw");
    			add_location(p, file$9, 4, 4, 121);
    			attr_dev(img, "class", "more-options svelte-16es0lw");
    			if (!src_url_equal(img.src, img_src_value = "./assets/icons/chevron-down.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$9, 8, 4, 191);
    			attr_dev(main, "title", "Canvas zoom");
    			attr_dev(main, "class", "svelte-16es0lw");
    			add_location(main, file$9, 3, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(main, t2);
    			append_dev(main, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$canvasStatus*/ 1 && t0_value !== (t0_value = Math.round(/*$canvasStatus*/ ctx[0].zoom * 100) + "")) set_data_dev(t0, t0_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $canvasStatus;
    	validate_store(canvasStatus, 'canvasStatus');
    	component_subscribe($$self, canvasStatus, $$value => $$invalidate(0, $canvasStatus = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ZoomControl', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ZoomControl> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ canvasStatus, $canvasStatus });
    	return [$canvasStatus];
    }

    class ZoomControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZoomControl",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/ctrlMenuItems/GeneralAppControl.svelte generated by Svelte v3.48.0 */
    const file$8 = "src/components/ctrlMenuItems/GeneralAppControl.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let t0;
    	let regularcontrol0;
    	let t1;
    	let regularcontrol1;
    	let t2;
    	let regularcontrol2;
    	let t3;
    	let div;
    	let t4;
    	let zoomcontrol;
    	let current;

    	regularcontrol0 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/share.svg",
    				alt: "Export"
    			},
    			$$inline: true
    		});

    	regularcontrol1 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/expand.svg",
    				alt: "Checklist"
    			},
    			$$inline: true
    		});

    	regularcontrol2 = new RegularControl({
    			props: {
    				imageURI: "./assets/icons/sun.svg",
    				alt: "Toggle dark mode"
    			},
    			$$inline: true
    		});

    	zoomcontrol = new ZoomControl({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			t0 = space();
    			create_component(regularcontrol0.$$.fragment);
    			t1 = space();
    			create_component(regularcontrol1.$$.fragment);
    			t2 = space();
    			create_component(regularcontrol2.$$.fragment);
    			t3 = space();
    			div = element("div");
    			t4 = space();
    			create_component(zoomcontrol.$$.fragment);
    			attr_dev(img, "id", "pfp");
    			if (!src_url_equal(img.src, img_src_value = "./assets/pngs/testpfp.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1dayjnz");
    			add_location(img, file$8, 25, 4, 713);
    			set_style(div, "width", "10px");
    			add_location(div, file$8, 37, 4, 1105);
    			attr_dev(main, "class", "svelte-1dayjnz");
    			add_location(main, file$8, 23, 0, 625);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t0);
    			mount_component(regularcontrol0, main, null);
    			append_dev(main, t1);
    			mount_component(regularcontrol1, main, null);
    			append_dev(main, t2);
    			mount_component(regularcontrol2, main, null);
    			append_dev(main, t3);
    			append_dev(main, div);
    			append_dev(main, t4);
    			mount_component(zoomcontrol, main, null);
    			/*main_binding*/ ctx[2](main);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(regularcontrol0.$$.fragment, local);
    			transition_in(regularcontrol1.$$.fragment, local);
    			transition_in(regularcontrol2.$$.fragment, local);
    			transition_in(zoomcontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(regularcontrol0.$$.fragment, local);
    			transition_out(regularcontrol1.$$.fragment, local);
    			transition_out(regularcontrol2.$$.fragment, local);
    			transition_out(zoomcontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(regularcontrol0);
    			destroy_component(regularcontrol1);
    			destroy_component(regularcontrol2);
    			destroy_component(zoomcontrol);
    			/*main_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GeneralAppControl', slots, []);
    	const disp = createEventDispatcher();
    	let { dropdownStatus = { currentID: "", active: false } } = $$props;
    	let mainContainer;

    	const toggleDropdown = () => {
    		disp("toggleDropdown");
    	};

    	const updateCurrentID = evt => {
    		disp("updateCurrentID", evt.detail);
    	};

    	const writable_props = ['dropdownStatus'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GeneralAppControl> was created with unknown prop '${key}'`);
    	});

    	function main_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainContainer = $$value;
    			$$invalidate(0, mainContainer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('dropdownStatus' in $$props) $$invalidate(1, dropdownStatus = $$props.dropdownStatus);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		RegularControl,
    		ZoomControl,
    		disp,
    		dropdownStatus,
    		mainContainer,
    		toggleDropdown,
    		updateCurrentID
    	});

    	$$self.$inject_state = $$props => {
    		if ('dropdownStatus' in $$props) $$invalidate(1, dropdownStatus = $$props.dropdownStatus);
    		if ('mainContainer' in $$props) $$invalidate(0, mainContainer = $$props.mainContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*mainContainer*/ 1) {
    			if (!!mainContainer) {
    				disp("widthChange", {
    					width: mainContainer.getBoundingClientRect().width + 100
    				});
    			}
    		}
    	};

    	return [mainContainer, dropdownStatus, main_binding];
    }

    class GeneralAppControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { dropdownStatus: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GeneralAppControl",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get dropdownStatus() {
    		throw new Error("<GeneralAppControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropdownStatus(value) {
    		throw new Error("<GeneralAppControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/DropdownOptions/RegularOption.svelte generated by Svelte v3.48.0 */

    const file$7 = "src/components/ctrlMenuItems/DropdownOptions/RegularOption.svelte";

    // (7:8) {#if !!options.iconSrc}
    function create_if_block_1$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*options*/ ctx[0].iconSrc)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "15px");
    			attr_dev(img, "height", "15px");
    			attr_dev(img, "class", "svelte-sfxmgm");
    			add_location(img, file$7, 7, 12, 184);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 1 && !src_url_equal(img.src, img_src_value = /*options*/ ctx[0].iconSrc)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(7:8) {#if !!options.iconSrc}",
    		ctx
    	});

    	return block;
    }

    // (16:4) {#if !!options.desc}
    function create_if_block$2(ctx) {
    	let p;
    	let t_value = /*options*/ ctx[0].desc + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "id", "desc");
    			attr_dev(p, "class", "svelte-sfxmgm");
    			add_location(p, file$7, 16, 8, 397);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 1 && t_value !== (t_value = /*options*/ ctx[0].desc + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(16:4) {#if !!options.desc}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let section;
    	let t0;
    	let p;
    	let t1_value = /*options*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let main_title_value;
    	let mounted;
    	let dispose;
    	let if_block0 = !!/*options*/ ctx[0].iconSrc && create_if_block_1$2(ctx);
    	let if_block1 = !!/*options*/ ctx[0].desc && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			p = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(p, "id", "title");
    			attr_dev(p, "class", "svelte-sfxmgm");
    			add_location(p, file$7, 10, 8, 288);
    			attr_dev(section, "class", "svelte-sfxmgm");
    			add_location(section, file$7, 4, 4, 107);
    			attr_dev(main, "title", main_title_value = /*options*/ ctx[0].title);
    			attr_dev(main, "class", "svelte-sfxmgm");
    			add_location(main, file$7, 3, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			if (if_block0) if_block0.m(section, null);
    			append_dev(section, t0);
    			append_dev(section, p);
    			append_dev(p, t1);
    			append_dev(main, t2);
    			if (if_block1) if_block1.m(main, null);

    			if (!mounted) {
    				dispose = listen_dev(
    					main,
    					"mouseup",
    					function () {
    						if (is_function(/*options*/ ctx[0].cta)) /*options*/ ctx[0].cta.apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!!/*options*/ ctx[0].iconSrc) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(section, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*options*/ 1 && t1_value !== (t1_value = /*options*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

    			if (!!/*options*/ ctx[0].desc) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*options*/ 1 && main_title_value !== (main_title_value = /*options*/ ctx[0].title)) {
    				attr_dev(main, "title", main_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RegularOption', slots, []);
    	let { options } = $$props;
    	const writable_props = ['options'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RegularOption> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('options' in $$props) $$invalidate(0, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({ options });

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate(0, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [options];
    }

    class RegularOption extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { options: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegularOption",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*options*/ ctx[0] === undefined && !('options' in props)) {
    			console.warn("<RegularOption> was created without expected prop 'options'");
    		}
    	}

    	get options() {
    		throw new Error("<RegularOption>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<RegularOption>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenuItems/DropdownOptions/Separator.svelte generated by Svelte v3.48.0 */

    const file$6 = "src/components/ctrlMenuItems/DropdownOptions/Separator.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			attr_dev(div, "class", "svelte-1ljldqz");
    			add_location(div, file$6, 3, 4, 40);
    			attr_dev(main, "class", "svelte-1ljldqz");
    			add_location(main, file$6, 2, 0, 29);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Separator', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Separator> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Separator extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Separator",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/ctrlMenuItems/GeneralAppControl/DropdownControl.svelte generated by Svelte v3.48.0 */
    const file$5 = "src/components/ctrlMenuItems/GeneralAppControl/DropdownControl.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (59:42) 
    function create_if_block_1$1(ctx) {
    	let separator;
    	let current;
    	separator = new Separator({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(separator.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(separator, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(separator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(separator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(separator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(59:42) ",
    		ctx
    	});

    	return block;
    }

    // (57:12) {#if item.type === "reg"}
    function create_if_block$1(ctx) {
    	let regularoption;
    	let current;

    	regularoption = new RegularOption({
    			props: { options: /*item*/ ctx[14] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(regularoption.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(regularoption, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const regularoption_changes = {};
    			if (dirty & /*items*/ 32) regularoption_changes.options = /*item*/ ctx[14];
    			regularoption.$set(regularoption_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(regularoption.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(regularoption.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(regularoption, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(57:12) {#if item.type === \\\"reg\\\"}",
    		ctx
    	});

    	return block;
    }

    // (56:8) {#each items as item (item)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*item*/ ctx[14].type === "reg") return 0;
    		if (/*item*/ ctx[14].type === "sep") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(56:8) {#each items as item (item)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let section;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let img1;
    	let img1_src_value;
    	let section_class_value;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*items*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*item*/ ctx[14];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			img0 = element("img");
    			t0 = space();
    			img1 = element("img");
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (!src_url_equal(img0.src, img0_src_value = /*imageURI*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", /*alt*/ ctx[1]);
    			attr_dev(img0, "class", "svelte-313mpm");
    			add_location(img0, file$5, 50, 8, 1725);
    			attr_dev(img1, "class", "more-options svelte-313mpm");
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/icons/chevron-down.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$5, 51, 8, 1764);
    			attr_dev(section, "title", /*alt*/ ctx[1]);

    			attr_dev(section, "class", section_class_value = "" + ((/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? "highlight"
    			: "") + " " + (/*evenSpacing*/ ctx[6] ? "evenly-spaced" : "") + " svelte-313mpm"));

    			add_location(section, file$5, 49, 4, 1508);

    			attr_dev(div, "class", div_class_value = "optionContainer " + (/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? ""
    			: "hidden") + " svelte-313mpm");

    			add_location(div, file$5, 54, 4, 1856);
    			attr_dev(main, "class", "svelte-313mpm");
    			add_location(main, file$5, 48, 0, 1497);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, img0);
    			append_dev(section, t0);
    			append_dev(section, img1);
    			append_dev(main, t1);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(section, "mousedown", /*unlockToggleLock*/ ctx[10], false, false, false),
    					listen_dev(section, "mouseup", /*toggleDropdown*/ ctx[8], false, false, false),
    					listen_dev(section, "mouseenter", /*updateCurrentID*/ ctx[9], false, false, false),
    					listen_dev(div, "mouseup", /*mouseup_handler*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*imageURI*/ 1 && !src_url_equal(img0.src, img0_src_value = /*imageURI*/ ctx[0])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (!current || dirty & /*alt*/ 2) {
    				attr_dev(img0, "alt", /*alt*/ ctx[1]);
    			}

    			if (!current || dirty & /*alt*/ 2) {
    				attr_dev(section, "title", /*alt*/ ctx[1]);
    			}

    			if (!current || dirty & /*active, id, currentID, evenSpacing*/ 92 && section_class_value !== (section_class_value = "" + ((/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? "highlight"
    			: "") + " " + (/*evenSpacing*/ ctx[6] ? "evenly-spaced" : "") + " svelte-313mpm"))) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (dirty & /*items*/ 32) {
    				each_value = /*items*/ ctx[5];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty & /*active, id, currentID*/ 28 && div_class_value !== (div_class_value = "optionContainer " + (/*active*/ ctx[2] && /*id*/ ctx[4] === /*currentID*/ ctx[3]
    			? ""
    			: "hidden") + " svelte-313mpm")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('DropdownControl', slots, []);
    	const disp = createEventDispatcher();
    	let { imageURI } = $$props;
    	let { alt } = $$props;
    	let { active } = $$props;
    	let { currentID } = $$props;
    	let { id } = $$props;
    	let { items } = $$props;
    	let { evenSpacing = false } = $$props;
    	let openLocked = true;

    	const toggleDropdown = () => {
    		if (!openLocked) {
    			disp("toggleDropdown");
    			openLocked = true;
    			if (!active) document.addEventListener("keydown", closeOverlay);
    		}
    	};

    	const updateCurrentID = () => {
    		disp("updateCurrentID", { newID: id });
    	};

    	const unlockToggleLock = () => {
    		setTimeout(
    			() => {
    				openLocked = false;
    			},
    			0
    		);
    	};

    	// this code makes no fucking sense but it works somehow.
    	const closeOverlay = e => {
    		setTimeout(
    			() => {
    				if (!e["key"] && !openLocked || !!e["key"] && e["key"] === "Escape") {
    					// if not locked, remove picker overlay
    					openLocked = true;

    					disp("toggleDropdown");

    					// add event listner to close the overlay
    					document.removeEventListener("mousedown", closeOverlay);

    					document.removeEventListener("mouseup", unlockToggleLock);
    					document.removeEventListener("keydown", closeOverlay);
    				}
    			},
    			0
    		);
    	};

    	const writable_props = ['imageURI', 'alt', 'active', 'currentID', 'id', 'items', 'evenSpacing'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<DropdownControl> was created with unknown prop '${key}'`);
    	});

    	const mouseup_handler = () => disp("forceOpenDropdown");

    	$$self.$$set = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('currentID' in $$props) $$invalidate(3, currentID = $$props.currentID);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('items' in $$props) $$invalidate(5, items = $$props.items);
    		if ('evenSpacing' in $$props) $$invalidate(6, evenSpacing = $$props.evenSpacing);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		RegularOption,
    		Separator,
    		disp,
    		imageURI,
    		alt,
    		active,
    		currentID,
    		id,
    		items,
    		evenSpacing,
    		openLocked,
    		toggleDropdown,
    		updateCurrentID,
    		unlockToggleLock,
    		closeOverlay
    	});

    	$$self.$inject_state = $$props => {
    		if ('imageURI' in $$props) $$invalidate(0, imageURI = $$props.imageURI);
    		if ('alt' in $$props) $$invalidate(1, alt = $$props.alt);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('currentID' in $$props) $$invalidate(3, currentID = $$props.currentID);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('items' in $$props) $$invalidate(5, items = $$props.items);
    		if ('evenSpacing' in $$props) $$invalidate(6, evenSpacing = $$props.evenSpacing);
    		if ('openLocked' in $$props) openLocked = $$props.openLocked;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		imageURI,
    		alt,
    		active,
    		currentID,
    		id,
    		items,
    		evenSpacing,
    		disp,
    		toggleDropdown,
    		updateCurrentID,
    		unlockToggleLock,
    		mouseup_handler
    	];
    }

    class DropdownControl extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			imageURI: 0,
    			alt: 1,
    			active: 2,
    			currentID: 3,
    			id: 4,
    			items: 5,
    			evenSpacing: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DropdownControl",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*imageURI*/ ctx[0] === undefined && !('imageURI' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'imageURI'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !('alt' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'alt'");
    		}

    		if (/*active*/ ctx[2] === undefined && !('active' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'active'");
    		}

    		if (/*currentID*/ ctx[3] === undefined && !('currentID' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'currentID'");
    		}

    		if (/*id*/ ctx[4] === undefined && !('id' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'id'");
    		}

    		if (/*items*/ ctx[5] === undefined && !('items' in props)) {
    			console.warn("<DropdownControl> was created without expected prop 'items'");
    		}
    	}

    	get imageURI() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imageURI(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentID() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentID(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get evenSpacing() {
    		throw new Error("<DropdownControl>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set evenSpacing(value) {
    		throw new Error("<DropdownControl>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ctrlMenus/TopMenu.svelte generated by Svelte v3.48.0 */
    const file$4 = "src/components/ctrlMenus/TopMenu.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let section1;
    	let dropdowncontrol;
    	let t0;
    	let section0;
    	let filenameeditor;
    	let t1;
    	let div;
    	let t2;
    	let generalappcontrol;
    	let current;

    	const dropdowncontrol_spread_levels = [
    		{ imageURI: "./assets/icons/plus.svg" },
    		{ alt: "Add element" },
    		{ id: "addElement" },
    		{ items: addMenuItems },
    		/*dropdownStatus*/ ctx[2],
    		{ evenSpacing: true }
    	];

    	let dropdowncontrol_props = {};

    	for (let i = 0; i < dropdowncontrol_spread_levels.length; i += 1) {
    		dropdowncontrol_props = assign(dropdowncontrol_props, dropdowncontrol_spread_levels[i]);
    	}

    	dropdowncontrol = new DropdownControl({
    			props: dropdowncontrol_props,
    			$$inline: true
    		});

    	dropdowncontrol.$on("toggleDropdown", /*toggleDropdown*/ ctx[4]);
    	dropdowncontrol.$on("forceOpenDropdown", /*forceOpenDropdown*/ ctx[5]);
    	dropdowncontrol.$on("updateCurrentID", /*updateCurrentID*/ ctx[6]);

    	filenameeditor = new FileNameEditor({
    			props: {
    				leftMenuWidth: /*leftMenuWidth*/ ctx[0],
    				controlSectionWidth: /*appControlContWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	generalappcontrol = new GeneralAppControl({
    			props: {
    				dropdownStatus: /*dropdownStatus*/ ctx[2]
    			},
    			$$inline: true
    		});

    	generalappcontrol.$on("widthChange", /*appCtrlContWidthChange*/ ctx[3]);
    	generalappcontrol.$on("toggleDropdown", /*toggleDropdown*/ ctx[4]);
    	generalappcontrol.$on("forceOpenDropdown", /*forceOpenDropdown*/ ctx[5]);
    	generalappcontrol.$on("updateCurrentID", /*updateCurrentID*/ ctx[6]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			section1 = element("section");
    			create_component(dropdowncontrol.$$.fragment);
    			t0 = space();
    			section0 = element("section");
    			create_component(filenameeditor.$$.fragment);
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			create_component(generalappcontrol.$$.fragment);
    			attr_dev(div, "id", "fileNameGrad");
    			attr_dev(div, "class", "svelte-1fcpu39");
    			add_location(div, file$4, 196, 12, 6313);
    			attr_dev(section0, "class", "svelte-1fcpu39");
    			add_location(section0, file$4, 194, 8, 6189);
    			attr_dev(section1, "id", "left-ctrl");
    			attr_dev(section1, "class", "svelte-1fcpu39");
    			add_location(section1, file$4, 191, 4, 5882);
    			set_style(main, "position", "absolute");
    			set_style(main, "width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px)");
    			set_style(main, "position", "absolute");
    			set_style(main, "left", /*leftMenuWidth*/ ctx[0] + "px");
    			attr_dev(main, "class", "svelte-1fcpu39");
    			add_location(main, file$4, 189, 0, 5737);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section1);
    			mount_component(dropdowncontrol, section1, null);
    			append_dev(section1, t0);
    			append_dev(section1, section0);
    			mount_component(filenameeditor, section0, null);
    			append_dev(section0, t1);
    			append_dev(section0, div);
    			append_dev(main, t2);
    			mount_component(generalappcontrol, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dropdowncontrol_changes = (dirty & /*addMenuItems, dropdownStatus*/ 4)
    			? get_spread_update(dropdowncontrol_spread_levels, [
    					dropdowncontrol_spread_levels[0],
    					dropdowncontrol_spread_levels[1],
    					dropdowncontrol_spread_levels[2],
    					dirty & /*addMenuItems*/ 0 && { items: addMenuItems },
    					dirty & /*dropdownStatus*/ 4 && get_spread_object(/*dropdownStatus*/ ctx[2]),
    					dropdowncontrol_spread_levels[5]
    				])
    			: {};

    			dropdowncontrol.$set(dropdowncontrol_changes);
    			const filenameeditor_changes = {};
    			if (dirty & /*leftMenuWidth*/ 1) filenameeditor_changes.leftMenuWidth = /*leftMenuWidth*/ ctx[0];
    			if (dirty & /*appControlContWidth*/ 2) filenameeditor_changes.controlSectionWidth = /*appControlContWidth*/ ctx[1];
    			filenameeditor.$set(filenameeditor_changes);
    			const generalappcontrol_changes = {};
    			if (dirty & /*dropdownStatus*/ 4) generalappcontrol_changes.dropdownStatus = /*dropdownStatus*/ ctx[2];
    			generalappcontrol.$set(generalappcontrol_changes);

    			if (!current || dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "width", "calc(100vw - " + /*leftMenuWidth*/ ctx[0] + "px)");
    			}

    			if (!current || dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "left", /*leftMenuWidth*/ ctx[0] + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdowncontrol.$$.fragment, local);
    			transition_in(filenameeditor.$$.fragment, local);
    			transition_in(generalappcontrol.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdowncontrol.$$.fragment, local);
    			transition_out(filenameeditor.$$.fragment, local);
    			transition_out(generalappcontrol.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(dropdowncontrol);
    			destroy_component(filenameeditor);
    			destroy_component(generalappcontrol);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const defaultDivStyle = {};

    let addMenuItems = [
    	{
    		type: "reg",
    		title: HTMltagInfo["DIV"].name,
    		iconSrc: HTMltagInfo["DIV"].iconURI,
    		desc: "<div>",
    		cta: () => {
    			addComponent("DIV", defaultDivStyle, true);
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["SECTION"].name,
    		iconSrc: HTMltagInfo["SECTION"].iconURI,
    		desc: "<section>",
    		cta: () => {
    			addComponent("SECTION", {}, true);
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["SPAN"].name,
    		iconSrc: HTMltagInfo["SPAN"].iconURI,
    		desc: "<span>",
    		cta: () => {
    			addComponent("SPAN", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["BODY"].name,
    		iconSrc: HTMltagInfo["BODY"].iconURI,
    		desc: "<body>",
    		cta: () => {
    			addComponent("BODY", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["CANVAS"].name,
    		iconSrc: HTMltagInfo["CANVAS"].iconURI,
    		desc: "<canvas>",
    		cta: () => {
    			addComponent("CANVAS", {});
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H1"].name,
    		iconSrc: HTMltagInfo["H1"].iconURI,
    		desc: "<h1>",
    		cta: () => {
    			addComponent("H1", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H2"].name,
    		iconSrc: HTMltagInfo["H2"].iconURI,
    		desc: "<h2>",
    		cta: () => {
    			addComponent("H2", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H3"].name,
    		iconSrc: HTMltagInfo["H3"].iconURI,
    		desc: "<h3>",
    		cta: () => {
    			addComponent("H3", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H4"].name,
    		iconSrc: HTMltagInfo["H4"].iconURI,
    		desc: "<h4>",
    		cta: () => {
    			addComponent("H4", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H5"].name,
    		iconSrc: HTMltagInfo["H5"].iconURI,
    		desc: "<h5>",
    		cta: () => {
    			addComponent("H5", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["H6"].name,
    		iconSrc: HTMltagInfo["H6"].iconURI,
    		desc: "<h6>",
    		cta: () => {
    			addComponent("H6", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["P"].name,
    		iconSrc: HTMltagInfo["P"].iconURI,
    		desc: "<p>",
    		cta: () => {
    			addComponent("P", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["A"].name,
    		iconSrc: HTMltagInfo["A"].iconURI,
    		desc: "<a>",
    		cta: () => {
    			addComponent("A", {});
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["BUTTON"].name,
    		iconSrc: HTMltagInfo["BUTTON"].iconURI,
    		desc: "<button>",
    		cta: () => {
    			addComponent("BUTTON", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["INPUT"].name,
    		iconSrc: HTMltagInfo["INPUT"].iconURI,
    		desc: "<input>",
    		cta: () => {
    			addComponent("INPUT", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["TEXTAREA"].name,
    		iconSrc: HTMltagInfo["TEXTAREA"].iconURI,
    		desc: "<textarea>",
    		cta: () => {
    			addComponent("TEXTAREA", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["LABEL"].name,
    		iconSrc: HTMltagInfo["LABEL"].iconURI,
    		desc: "<label>",
    		cta: () => {
    			addComponent("LABEL", {});
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["OL"].name,
    		iconSrc: HTMltagInfo["OL"].iconURI,
    		desc: "<ol>",
    		cta: () => {
    			addComponent("OL", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["UL"].name,
    		iconSrc: HTMltagInfo["UL"].iconURI,
    		desc: "<ul>",
    		cta: () => {
    			addComponent("UL", {});
    		}
    	},
    	{
    		type: "sep",
    		title: "",
    		cta: () => {
    			
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["HR"].name,
    		iconSrc: HTMltagInfo["HR"].iconURI,
    		desc: "<hr>",
    		cta: () => {
    			addComponent("HR", {});
    		}
    	},
    	{
    		type: "reg",
    		title: HTMltagInfo["PROGRESS"].name,
    		iconSrc: HTMltagInfo["PROGRESS"].iconURI,
    		desc: "<progress>",
    		cta: () => {
    			addComponent("PROGRESS", {});
    		}
    	}
    ];

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TopMenu', slots, []);
    	let { leftMenuWidth } = $$props;
    	let appControlContWidth = 0;

    	const appCtrlContWidthChange = evt => {
    		$$invalidate(1, appControlContWidth = evt.detail.width);
    	};

    	// dropdown control stuff
    	let dropdownStatus = { currentID: "", active: false };

    	const toggleDropdown = () => {
    		$$invalidate(2, dropdownStatus.active = !dropdownStatus.active, dropdownStatus);

    		// reset global mouse down
    		document.onmouseup = undefined;

    		// if active, set global mouseup so that any click outside of the box will togggle again. Give it a bit of delay so it works
    		setTimeout(
    			() => {
    				if (dropdownStatus.active) {
    					document.onmouseup = e => {
    						$$invalidate(2, dropdownStatus.active = false, dropdownStatus);
    					};

    					return;
    				}
    			},
    			0
    		);
    	};

    	const forceOpenDropdown = () => {
    		setTimeout(
    			() => {
    				$$invalidate(2, dropdownStatus.active = true, dropdownStatus);
    			},
    			0
    		);
    	};

    	const updateCurrentID = evt => {
    		$$invalidate(2, dropdownStatus.currentID = evt.detail.newID, dropdownStatus);
    	};

    	const writable_props = ['leftMenuWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TopMenu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    	};

    	$$self.$capture_state = () => ({
    		addComponent,
    		HTMltagInfo,
    		defaultDivStyle,
    		addMenuItems,
    		FileNameEditor,
    		GeneralAppControl,
    		DropdownControl,
    		leftMenuWidth,
    		appControlContWidth,
    		appCtrlContWidthChange,
    		dropdownStatus,
    		toggleDropdown,
    		forceOpenDropdown,
    		updateCurrentID
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('appControlContWidth' in $$props) $$invalidate(1, appControlContWidth = $$props.appControlContWidth);
    		if ('dropdownStatus' in $$props) $$invalidate(2, dropdownStatus = $$props.dropdownStatus);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		leftMenuWidth,
    		appControlContWidth,
    		dropdownStatus,
    		appCtrlContWidthChange,
    		toggleDropdown,
    		forceOpenDropdown,
    		updateCurrentID
    	];
    }

    class TopMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { leftMenuWidth: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TopMenu",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*leftMenuWidth*/ ctx[0] === undefined && !('leftMenuWidth' in props)) {
    			console.warn("<TopMenu> was created without expected prop 'leftMenuWidth'");
    		}
    	}

    	get leftMenuWidth() {
    		throw new Error("<TopMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leftMenuWidth(value) {
    		throw new Error("<TopMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/display/displayControl/ElementResizer.svelte generated by Svelte v3.48.0 */

    const file$3 = "src/components/display/displayControl/ElementResizer.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let t3;
    	let div4;
    	let t4;
    	let div5;
    	let t5;
    	let div6;
    	let t6;
    	let div7;
    	let t7;
    	let div9;
    	let div8;
    	let div9_style_value;
    	let t8;
    	let div11;
    	let div10;
    	let div11_style_value;
    	let t9;
    	let div13;
    	let div12;
    	let div13_style_value;
    	let t10;
    	let div15;
    	let div14;
    	let div15_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			t3 = space();
    			div4 = element("div");
    			t4 = space();
    			div5 = element("div");
    			t5 = space();
    			div6 = element("div");
    			t6 = space();
    			div7 = element("div");
    			t7 = space();
    			div9 = element("div");
    			div8 = element("div");
    			t8 = space();
    			div11 = element("div");
    			div10 = element("div");
    			t9 = space();
    			div13 = element("div");
    			div12 = element("div");
    			t10 = space();
    			div15 = element("div");
    			div14 = element("div");
    			attr_dev(div0, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div0, "id", "corner-tl");
    			add_location(div0, file$3, 298, 4, 12190);
    			attr_dev(div1, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div1, "id", "corner-tm");
    			add_location(div1, file$3, 299, 4, 12306);
    			attr_dev(div2, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div2, "id", "corner-tr");
    			add_location(div2, file$3, 300, 4, 12423);
    			attr_dev(div3, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div3, "id", "corner-ml");
    			add_location(div3, file$3, 301, 4, 12538);
    			attr_dev(div4, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div4, "id", "corner-mr");
    			add_location(div4, file$3, 302, 4, 12655);
    			attr_dev(div5, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div5, "id", "corner-bl");
    			add_location(div5, file$3, 303, 4, 12771);
    			attr_dev(div6, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div6, "id", "corner-bm");
    			add_location(div6, file$3, 304, 4, 12886);
    			attr_dev(div7, "class", "corner-drag svelte-10zeiu5");
    			attr_dev(div7, "id", "corner-br");
    			add_location(div7, file$3, 305, 4, 13002);
    			add_location(div8, file$3, 311, 38, 13394);
    			attr_dev(div9, "class", "vert-margins svelte-10zeiu5");
    			attr_dev(div9, "id", "top");

    			attr_dev(div9, "style", div9_style_value = `
        transform: translate3d(0,calc(${-/*cMT*/ ctx[0]}${/*cMTu*/ ctx[1]} + ${-/*cBT*/ ctx[2]}${/*cBTu*/ ctx[3]}),0); min-width:min(${/*cML*/ ctx[12]}${/*cMLu*/ ctx[13]}, ${/*cMR*/ ctx[4]}${/*cMRu*/ ctx[5]}); opacity:${/*cMT*/ ctx[0] < 1 ? 0 : 0.2}
        `);

    			add_location(div9, file$3, 309, 4, 13163);
    			add_location(div10, file$3, 315, 38, 13667);
    			attr_dev(div11, "class", "hori-margins svelte-10zeiu5");
    			attr_dev(div11, "id", "right");

    			attr_dev(div11, "style", div11_style_value = `
        transform: translate3d(calc(${/*cMR*/ ctx[4]}${/*cMRu*/ ctx[5]} + ${/*cBR*/ ctx[6]}${/*cBRu*/ ctx[7]}),0,0); min-height:min(${/*cMT*/ ctx[0]}${/*cMTu*/ ctx[1]}, ${/*cMB*/ ctx[8]}${/*cMBu*/ ctx[9]}); opacity:${/*cMR*/ ctx[4] < 1 ? 0 : 0.2}
        `);

    			add_location(div11, file$3, 313, 4, 13435);
    			add_location(div12, file$3, 319, 38, 13941);
    			attr_dev(div13, "class", "vert-margins svelte-10zeiu5");
    			attr_dev(div13, "id", "bottom");

    			attr_dev(div13, "style", div13_style_value = `
        transform: translate3d(0,calc(${/*cMB*/ ctx[8]}${/*cMBu*/ ctx[9]} + ${/*cBB*/ ctx[10]}${/*cBBu*/ ctx[11]}),0); min-width:min(${/*cML*/ ctx[12]}${/*cMLu*/ ctx[13]}, ${/*cMR*/ ctx[4]}${/*cMRu*/ ctx[5]}); opacity:${/*cMB*/ ctx[8] < 1 ? 0 : 0.2}
        `);

    			add_location(div13, file$3, 317, 4, 13709);
    			add_location(div14, file$3, 323, 38, 14214);
    			attr_dev(div15, "class", "hori-margins svelte-10zeiu5");
    			attr_dev(div15, "id", "left");

    			attr_dev(div15, "style", div15_style_value = `
        transform: translate3d(calc(${-/*cML*/ ctx[12]}${/*cMLu*/ ctx[13]} + ${-/*cBL*/ ctx[14]}${/*cBLu*/ ctx[15]}),0,0); min-height:min(${/*cMT*/ ctx[0]}${/*cMTu*/ ctx[1]}, ${/*cMB*/ ctx[8]}${/*cMBu*/ ctx[9]}); opacity:${/*cML*/ ctx[12] < 1 ? 0 : 0.2}
        `);

    			add_location(div15, file$3, 321, 4, 13981);
    			attr_dev(main, "class", "svelte-10zeiu5");
    			add_location(main, file$3, 296, 0, 12152);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(main, t2);
    			append_dev(main, div3);
    			append_dev(main, t3);
    			append_dev(main, div4);
    			append_dev(main, t4);
    			append_dev(main, div5);
    			append_dev(main, t5);
    			append_dev(main, div6);
    			append_dev(main, t6);
    			append_dev(main, div7);
    			append_dev(main, t7);
    			append_dev(main, div9);
    			append_dev(div9, div8);
    			append_dev(main, t8);
    			append_dev(main, div11);
    			append_dev(div11, div10);
    			append_dev(main, t9);
    			append_dev(main, div13);
    			append_dev(div13, div12);
    			append_dev(main, t10);
    			append_dev(main, div15);
    			append_dev(div15, div14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "mousedown", /*mousedown_handler*/ ctx[25], false, false, false),
    					listen_dev(div1, "mousedown", /*mousedown_handler_1*/ ctx[26], false, false, false),
    					listen_dev(div2, "mousedown", /*mousedown_handler_2*/ ctx[27], false, false, false),
    					listen_dev(div3, "mousedown", /*mousedown_handler_3*/ ctx[28], false, false, false),
    					listen_dev(div4, "mousedown", /*mousedown_handler_4*/ ctx[29], false, false, false),
    					listen_dev(div5, "mousedown", /*mousedown_handler_5*/ ctx[30], false, false, false),
    					listen_dev(div6, "mousedown", /*mousedown_handler_6*/ ctx[31], false, false, false),
    					listen_dev(div7, "mousedown", /*mousedown_handler_7*/ ctx[32], false, false, false),
    					listen_dev(div9, "mousedown", /*startMTDrag*/ ctx[17], false, false, false),
    					listen_dev(div11, "mousedown", /*startMRDrag*/ ctx[19], false, false, false),
    					listen_dev(div13, "mousedown", /*startMBDrag*/ ctx[18], false, false, false),
    					listen_dev(div15, "mousedown", /*startMLDrag*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cMT, cMTu, cBT, cBTu, cML, cMLu, cMR, cMRu*/ 12351 && div9_style_value !== (div9_style_value = `
        transform: translate3d(0,calc(${-/*cMT*/ ctx[0]}${/*cMTu*/ ctx[1]} + ${-/*cBT*/ ctx[2]}${/*cBTu*/ ctx[3]}),0); min-width:min(${/*cML*/ ctx[12]}${/*cMLu*/ ctx[13]}, ${/*cMR*/ ctx[4]}${/*cMRu*/ ctx[5]}); opacity:${/*cMT*/ ctx[0] < 1 ? 0 : 0.2}
        `)) {
    				attr_dev(div9, "style", div9_style_value);
    			}

    			if (dirty[0] & /*cMR, cMRu, cBR, cBRu, cMT, cMTu, cMB, cMBu*/ 1011 && div11_style_value !== (div11_style_value = `
        transform: translate3d(calc(${/*cMR*/ ctx[4]}${/*cMRu*/ ctx[5]} + ${/*cBR*/ ctx[6]}${/*cBRu*/ ctx[7]}),0,0); min-height:min(${/*cMT*/ ctx[0]}${/*cMTu*/ ctx[1]}, ${/*cMB*/ ctx[8]}${/*cMBu*/ ctx[9]}); opacity:${/*cMR*/ ctx[4] < 1 ? 0 : 0.2}
        `)) {
    				attr_dev(div11, "style", div11_style_value);
    			}

    			if (dirty[0] & /*cMB, cMBu, cBB, cBBu, cML, cMLu, cMR, cMRu*/ 16176 && div13_style_value !== (div13_style_value = `
        transform: translate3d(0,calc(${/*cMB*/ ctx[8]}${/*cMBu*/ ctx[9]} + ${/*cBB*/ ctx[10]}${/*cBBu*/ ctx[11]}),0); min-width:min(${/*cML*/ ctx[12]}${/*cMLu*/ ctx[13]}, ${/*cMR*/ ctx[4]}${/*cMRu*/ ctx[5]}); opacity:${/*cMB*/ ctx[8] < 1 ? 0 : 0.2}
        `)) {
    				attr_dev(div13, "style", div13_style_value);
    			}

    			if (dirty[0] & /*cML, cMLu, cBL, cBLu, cMT, cMTu, cMB, cMBu*/ 62211 && div15_style_value !== (div15_style_value = `
        transform: translate3d(calc(${-/*cML*/ ctx[12]}${/*cMLu*/ ctx[13]} + ${-/*cBL*/ ctx[14]}${/*cBLu*/ ctx[15]}),0,0); min-height:min(${/*cMT*/ ctx[0]}${/*cMTu*/ ctx[1]}, ${/*cMB*/ ctx[8]}${/*cMBu*/ ctx[9]}); opacity:${/*cML*/ ctx[12] < 1 ? 0 : 0.2}
        `)) {
    				attr_dev(div15, "style", div15_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let currentStyle;
    	let currentComponent;
    	let currentOverride;
    	let $selectedOverride;
    	let $selectedComponent;
    	let $collection;
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(22, $selectedOverride = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(23, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(24, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ElementResizer', slots, []);
    	let icx = 0; // initial cursor x
    	let icy = 0; // initial cursor y
    	let iw = 0; // initial target width
    	let ih = 0; // initial target height
    	let dragLocked = true; // prevent dragging on accident
    	const dragThreshold = -1; // disable if -1
    	let rX = false;
    	let rY = false;
    	let cX = true;
    	let cY = true;

    	const startCornerDrag = (e, revX, revY, changeX, changeY) => {
    		// set icx and icy to current mouse position
    		icx = e.clientX;

    		icy = e.clientY;

    		// set iw and ih to current component width / height
    		if ($selectedOverride !== -1) {
    			if (!currentOverride.style["width"]) currentOverride.style["width"] = { v: 100, u: "px" };
    			iw = currentOverride.style["width"].v;
    			if (!currentOverride.style["height"]) currentOverride.style["height"] = { v: 100, u: "px" };
    			ih = currentOverride.style["height"].v;
    		} else {
    			if (!currentComponent.style["width"]) currentComponent.style["width"] = { v: 100, u: "px" };
    			iw = currentComponent.style["width"].v;
    			if (!currentComponent.style["height"]) currentComponent.style["height"] = { v: 100, u: "px" };
    			ih = currentComponent.style["height"].v;
    		}

    		// set reverse
    		rX = revX;

    		rY = revY;

    		// set enable
    		cX = changeX;

    		cY = changeY;

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackCornerDrag);

    		document.addEventListener('mouseup', endDrag);
    	};

    	const trackCornerDrag = e => {
    		e.preventDefault();

    		// check threshold
    		if (dragLocked) {
    			if (Math.abs(e.clientX - icx) > dragThreshold) {
    				// unlock drag
    				dragLocked = false;
    			}

    			return;
    		}

    		// check if there is an override selected
    		let deltaW = e.clientX - icx;

    		let deltaH = e.clientY - icy;

    		// detect if shift is pressed when dragging
    		if (e.shiftKey) {
    			// keep square ratio
    			const minVal = Math.min(deltaW, -deltaH);

    			deltaW = (rX ? 1 : -1) * minVal;
    			deltaH = (rY ? 1 : -1) * minVal;
    		}

    		if ($selectedOverride === -1) {
    			// no override = change component
    			const tempW = $collection[$selectedComponent].style["width"];

    			const tempH = $collection[$selectedComponent].style["height"];

    			// check units too
    			if (cX && tempW.u !== "fit-content") {
    				if (rX) set_store_value(collection, $collection[$selectedComponent].style["width"].v = iw + deltaW < 0 ? 0 : iw + deltaW, $collection); else set_store_value(collection, $collection[$selectedComponent].style["width"].v = iw - deltaW < 0 ? 0 : iw - deltaW, $collection);
    			}

    			if (cY && tempH.u !== "fit-content") {
    				if (rY) set_store_value(collection, $collection[$selectedComponent].style["height"].v = ih + deltaH < 0 ? 0 : ih + deltaH, $collection); else set_store_value(collection, $collection[$selectedComponent].style["height"].v = ih - deltaH < 0 ? 0 : ih - deltaH, $collection);
    			}
    		} else {
    			// else change override
    			const tempW = $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"];

    			const tempH = $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"];

    			// check units too
    			if (cX && tempW.u !== "fit-content") {
    				if (rX) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v = iw + deltaW < 0 ? 0 : iw + deltaW, $collection); else set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["width"].v = iw - deltaW < 0 ? 0 : iw - deltaW, $collection);
    			}

    			if (cY && tempH.u !== "fit-content") {
    				if (rY) set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"].v = ih + deltaH < 0 ? 0 : ih + deltaH, $collection); else set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["height"].v = ih - deltaH < 0 ? 0 : ih - deltaH, $collection);
    			}
    		}
    	};

    	//  margin value; margin unit; border value; border unit
    	let cMT = 0;

    	let cMTu = "";
    	let cBT = 0;
    	let cBTu = ""; // margin + border needs to be considered
    	let cMR = 0;
    	let cMRu = "";
    	let cBR = 0;
    	let cBRu = "";
    	let cMB = 0;
    	let cMBu = "";
    	let cBB = 0;
    	let cBBu = "";
    	let cML = 0;
    	let cMLu = "";
    	let cBL = 0;
    	let cBLu = "";
    	let imt = 0; // initial margin top, right, bottom, left
    	let imr = 0;
    	let imb = 0;
    	let iml = 0;

    	// drag functions
    	const startMTDrag = e => {
    		// set icx/icy to current mouse position
    		icy = e.clientY;

    		// set imt
    		if ($selectedOverride !== -1) {
    			if (!currentOverride.style["marginTop"]) currentOverride.style["marginTop"] = { v: 0, u: "px" };
    			imt = currentOverride.style["marginTop"].v;
    		} else {
    			if (!currentComponent.style["marginTop"]) currentComponent.style["marginTop"] = { v: 0, u: "px" };
    			imt = currentComponent.style["marginTop"].v;
    		}

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackMTDrag);

    		document.addEventListener('mouseup', endDrag);
    	};

    	const trackMTDrag = e => {
    		e.preventDefault();

    		// check threshold
    		if (dragLocked) {
    			if (Math.abs(e.clientY - icy) > dragThreshold) {
    				dragLocked = false; // unlock drag
    			}

    			return;
    		}

    		// check if there is an override selected
    		let deltaY = icy - e.clientY;

    		if ($selectedOverride === -1) {
    			// no override = change component
    			set_store_value(collection, $collection[$selectedComponent].style["marginTop"].v = imt + deltaY < 0 ? 0 : imt + deltaY, $collection);
    		} else {
    			// else change override
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginTop"].v = imt + deltaY < 0 ? 0 : imt + deltaY, $collection);
    		}
    	};

    	const startMBDrag = e => {
    		// set icx/icy to current mouse position
    		icy = e.clientY;

    		// set imt
    		if ($selectedOverride !== -1) {
    			if (!currentOverride.style["marginBottom"]) currentOverride.style["marginBottom"] = { v: 0, u: "px" };
    			imb = currentOverride.style["marginBottom"].v;
    		} else {
    			if (!currentComponent.style["marginBottom"]) currentComponent.style["marginBottom"] = { v: 0, u: "px" };
    			imb = currentComponent.style["marginBottom"].v;
    		}

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackMBDrag);

    		document.addEventListener('mouseup', endDrag);
    	};

    	const trackMBDrag = e => {
    		e.preventDefault();

    		// check threshold
    		if (dragLocked) {
    			if (Math.abs(e.clientY - icy) > dragThreshold) {
    				dragLocked = false; // unlock drag
    			}

    			return;
    		}

    		// check if there is an override selected
    		let deltaY = e.clientY - icy;

    		if ($selectedOverride === -1) {
    			// no override = change component
    			set_store_value(collection, $collection[$selectedComponent].style["marginBottom"].v = imb + deltaY < 0 ? 0 : imb + deltaY, $collection);
    		} else {
    			// else change override
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginBottom"].v = imb + deltaY < 0 ? 0 : imb + deltaY, $collection);
    		}
    	};

    	const startMRDrag = e => {
    		icx = e.clientX;

    		if ($selectedOverride !== -1) {
    			if (!currentOverride.style["marginRight"]) currentOverride.style["marginRight"] = { v: 0, u: "px" };
    			imr = currentOverride.style["marginRight"].v;
    		} else {
    			if (!currentComponent.style["marginRight"]) currentComponent.style["marginRight"] = { v: 0, u: "px" };
    			imr = currentComponent.style["marginRight"].v;
    		}

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackMRDrag);

    		document.addEventListener('mouseup', endDrag);
    	};

    	const trackMRDrag = e => {
    		e.preventDefault();

    		// check threshold
    		if (dragLocked) {
    			if (Math.abs(e.clientX - icx) > dragThreshold) {
    				dragLocked = false; // unlock drag
    			}

    			return;
    		}

    		// check if there is an override selected
    		let deltaX = e.clientX - icx;

    		if ($selectedOverride === -1) {
    			// no override = change component
    			set_store_value(collection, $collection[$selectedComponent].style["marginRight"].v = imr + deltaX < 0 ? 0 : imr + deltaX, $collection);
    		} else {
    			// else change override
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginRight"].v = imr + deltaX < 0 ? 0 : imr + deltaX, $collection);
    		}
    	};

    	const startMLDrag = e => {
    		icx = e.clientX;

    		if ($selectedOverride !== -1) {
    			if (!currentOverride.style["marginLeft"]) currentOverride.style["marginLeft"] = { v: 0, u: "px" };
    			iml = currentOverride.style["marginLeft"].v;
    		} else {
    			if (!currentComponent.style["marginLeft"]) currentComponent.style["marginLeft"] = { v: 0, u: "px" };
    			iml = currentComponent.style["marginLeft"].v;
    		}

    		// start tracking mouse position on move
    		document.addEventListener('mousemove', trackMLDrag);

    		document.addEventListener('mouseup', endDrag);
    	};

    	const trackMLDrag = e => {
    		e.preventDefault();

    		// check threshold
    		if (dragLocked) {
    			if (Math.abs(e.clientX - icx) > dragThreshold) {
    				dragLocked = false; // unlock drag
    			}

    			return;
    		}

    		// check if there is an override selected
    		let deltaX = icx - e.clientX;

    		if ($selectedOverride === -1) {
    			// no override = change component
    			set_store_value(collection, $collection[$selectedComponent].style["marginLeft"].v = iml + deltaX < 0 ? 0 : iml + deltaX, $collection);
    		} else {
    			// else change override
    			set_store_value(collection, $collection[$selectedComponent].styleOverrides[$selectedOverride].style["marginLeft"].v = iml + deltaX < 0 ? 0 : iml + deltaX, $collection);
    		}
    	};

    	const endDrag = () => {
    		document.body.style.cursor = "normal";

    		// reset initial cursor positions
    		icx = 0; // initial cursor x

    		icy = 0; // initial cursor y
    		dragLocked = true; // prevent dragging on accident
    		document.removeEventListener('mousemove', trackMTDrag);
    		document.removeEventListener('mousemove', trackMRDrag);
    		document.removeEventListener('mousemove', trackMBDrag);
    		document.removeEventListener('mousemove', trackMLDrag);
    		document.removeEventListener('mouseup', endDrag);
    		document.removeEventListener('mousemove', trackCornerDrag);
    		document.removeEventListener('mouseup', endDrag);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ElementResizer> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = e => startCornerDrag(e, false, false, true, true);
    	const mousedown_handler_1 = e => startCornerDrag(e, false, false, false, true);
    	const mousedown_handler_2 = e => startCornerDrag(e, true, false, true, true);
    	const mousedown_handler_3 = e => startCornerDrag(e, false, false, true, false);
    	const mousedown_handler_4 = e => startCornerDrag(e, true, false, true, false);
    	const mousedown_handler_5 = e => startCornerDrag(e, false, true, true, true);
    	const mousedown_handler_6 = e => startCornerDrag(e, false, true, false, true);
    	const mousedown_handler_7 = e => startCornerDrag(e, true, true, true, true);

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		icx,
    		icy,
    		iw,
    		ih,
    		dragLocked,
    		dragThreshold,
    		rX,
    		rY,
    		cX,
    		cY,
    		startCornerDrag,
    		trackCornerDrag,
    		cMT,
    		cMTu,
    		cBT,
    		cBTu,
    		cMR,
    		cMRu,
    		cBR,
    		cBRu,
    		cMB,
    		cMBu,
    		cBB,
    		cBBu,
    		cML,
    		cMLu,
    		cBL,
    		cBLu,
    		imt,
    		imr,
    		imb,
    		iml,
    		startMTDrag,
    		trackMTDrag,
    		startMBDrag,
    		trackMBDrag,
    		startMRDrag,
    		trackMRDrag,
    		startMLDrag,
    		trackMLDrag,
    		endDrag,
    		currentComponent,
    		currentOverride,
    		currentStyle,
    		$selectedOverride,
    		$selectedComponent,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('icx' in $$props) icx = $$props.icx;
    		if ('icy' in $$props) icy = $$props.icy;
    		if ('iw' in $$props) iw = $$props.iw;
    		if ('ih' in $$props) ih = $$props.ih;
    		if ('dragLocked' in $$props) dragLocked = $$props.dragLocked;
    		if ('rX' in $$props) rX = $$props.rX;
    		if ('rY' in $$props) rY = $$props.rY;
    		if ('cX' in $$props) cX = $$props.cX;
    		if ('cY' in $$props) cY = $$props.cY;
    		if ('cMT' in $$props) $$invalidate(0, cMT = $$props.cMT);
    		if ('cMTu' in $$props) $$invalidate(1, cMTu = $$props.cMTu);
    		if ('cBT' in $$props) $$invalidate(2, cBT = $$props.cBT);
    		if ('cBTu' in $$props) $$invalidate(3, cBTu = $$props.cBTu);
    		if ('cMR' in $$props) $$invalidate(4, cMR = $$props.cMR);
    		if ('cMRu' in $$props) $$invalidate(5, cMRu = $$props.cMRu);
    		if ('cBR' in $$props) $$invalidate(6, cBR = $$props.cBR);
    		if ('cBRu' in $$props) $$invalidate(7, cBRu = $$props.cBRu);
    		if ('cMB' in $$props) $$invalidate(8, cMB = $$props.cMB);
    		if ('cMBu' in $$props) $$invalidate(9, cMBu = $$props.cMBu);
    		if ('cBB' in $$props) $$invalidate(10, cBB = $$props.cBB);
    		if ('cBBu' in $$props) $$invalidate(11, cBBu = $$props.cBBu);
    		if ('cML' in $$props) $$invalidate(12, cML = $$props.cML);
    		if ('cMLu' in $$props) $$invalidate(13, cMLu = $$props.cMLu);
    		if ('cBL' in $$props) $$invalidate(14, cBL = $$props.cBL);
    		if ('cBLu' in $$props) $$invalidate(15, cBLu = $$props.cBLu);
    		if ('imt' in $$props) imt = $$props.imt;
    		if ('imr' in $$props) imr = $$props.imr;
    		if ('imb' in $$props) imb = $$props.imb;
    		if ('iml' in $$props) iml = $$props.iml;
    		if ('currentComponent' in $$props) currentComponent = $$props.currentComponent;
    		if ('currentOverride' in $$props) currentOverride = $$props.currentOverride;
    		if ('currentStyle' in $$props) $$invalidate(21, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$selectedOverride, $collection, $selectedComponent*/ 29360128) {
    			// reactive
    			$$invalidate(21, currentStyle = $selectedOverride === -1
    			? $collection[$selectedComponent].style
    			: $collection[$selectedComponent].styleOverrides[$selectedOverride].style);
    		}

    		if ($$self.$$.dirty[0] & /*$collection, $selectedComponent*/ 25165824) {
    			currentComponent = $collection[$selectedComponent];
    		}

    		if ($$self.$$.dirty[0] & /*$selectedOverride, $collection, $selectedComponent*/ 29360128) {
    			currentOverride = $selectedOverride !== -1
    			? $collection[$selectedComponent].styleOverrides[$selectedOverride]
    			: undefined;
    		}

    		if ($$self.$$.dirty[0] & /*currentStyle*/ 2097152) {
    			if (!!currentStyle) {
    				$$invalidate(0, cMT = !!currentStyle["marginTop"]
    				? currentStyle["marginTop"].v
    				: 0);

    				$$invalidate(4, cMR = !!currentStyle["marginRight"]
    				? currentStyle["marginRight"].v
    				: 0);

    				$$invalidate(8, cMB = !!currentStyle["marginBottom"]
    				? currentStyle["marginBottom"].v
    				: 0);

    				$$invalidate(12, cML = !!currentStyle["marginLeft"]
    				? currentStyle["marginLeft"].v
    				: 0);

    				$$invalidate(2, cBT = !!currentStyle.borderWidthTop && currentStyle.USEBORDER
    				? currentStyle.borderWidthTop.v
    				: 0);

    				$$invalidate(6, cBR = !!currentStyle.borderWidthRight && currentStyle.USEBORDER
    				? currentStyle.borderWidthRight.v
    				: 0);

    				$$invalidate(10, cBB = !!currentStyle.borderWidthBottom && currentStyle.USEBORDER
    				? currentStyle.borderWidthBottom.v
    				: 0);

    				$$invalidate(14, cBL = !!currentStyle.borderWidthLeft && currentStyle.USEBORDER
    				? currentStyle.borderWidthLeft.v
    				: 0);

    				$$invalidate(1, cMTu = !!currentStyle["marginTop"]
    				? currentStyle["marginTop"].u
    				: "px");

    				$$invalidate(5, cMRu = !!currentStyle["marginRight"]
    				? currentStyle["marginRight"].u
    				: "px");

    				$$invalidate(9, cMBu = !!currentStyle["marginBottom"]
    				? currentStyle["marginBottom"].u
    				: "px");

    				$$invalidate(13, cMLu = !!currentStyle["marginLeft"]
    				? currentStyle["marginLeft"].u
    				: "px");

    				$$invalidate(3, cBTu = !!currentStyle.borderWidthTop
    				? currentStyle.borderWidthTop.u
    				: "px");

    				$$invalidate(7, cBRu = !!currentStyle.borderWidthRight
    				? currentStyle.borderWidthRight.u
    				: "px");

    				$$invalidate(11, cBBu = !!currentStyle.borderWidthBottom
    				? currentStyle.borderWidthBottom.u
    				: "px");

    				$$invalidate(15, cBLu = !!currentStyle.borderWidthLeft
    				? currentStyle.borderWidthLeft.u
    				: "px");
    			}
    		}
    	};

    	return [
    		cMT,
    		cMTu,
    		cBT,
    		cBTu,
    		cMR,
    		cMRu,
    		cBR,
    		cBRu,
    		cMB,
    		cMBu,
    		cBB,
    		cBBu,
    		cML,
    		cMLu,
    		cBL,
    		cBLu,
    		startCornerDrag,
    		startMTDrag,
    		startMBDrag,
    		startMRDrag,
    		startMLDrag,
    		currentStyle,
    		$selectedOverride,
    		$selectedComponent,
    		$collection,
    		mousedown_handler,
    		mousedown_handler_1,
    		mousedown_handler_2,
    		mousedown_handler_3,
    		mousedown_handler_4,
    		mousedown_handler_5,
    		mousedown_handler_6,
    		mousedown_handler_7
    	];
    }

    class ElementResizer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ElementResizer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/display/displayElements/Div.svelte generated by Svelte v3.48.0 */

    const file$2 = "src/components/display/displayElements/Div.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let div;
    	let div_style_value;
    	let main_style_value;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");

    			attr_dev(div, "style", div_style_value = `
            ${//we have do this terribleness if we want to use anything with a united attribute
			""}
            width:${!!/*es*/ ctx[0].width
			? /*es*/ ctx[0].width.v
			: "fit-content"}${!!/*es*/ ctx[0].width ? /*es*/ ctx[0].width.u : ""};
            height:${!!/*es*/ ctx[0].height
			? /*es*/ ctx[0].height.v
			: "fit-content"}${!!/*es*/ ctx[0].height ? /*es*/ ctx[0].height.u : ""};

            margin-top:${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.v
			: 0}${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.u
			: "px"};
            margin-right:${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.v
			: 0}${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.u
			: "px"};
            margin-bottom:${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.v
			: 0}${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.u
			: "px"};
            margin-left:${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.v
			: 0}${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.u
			: "px"};

            padding-top:${!!/*es*/ ctx[0].paddingTop
			? /*es*/ ctx[0].paddingTop.v
			: 0}${!!/*es*/ ctx[0].paddingTop
			? /*es*/ ctx[0].paddingTop.u
			: "px"};
            padding-right:${!!/*es*/ ctx[0].paddingRight
			? /*es*/ ctx[0].paddingRight.v
			: 0}${!!/*es*/ ctx[0].paddingRight
			? /*es*/ ctx[0].paddingRight.u
			: "px"};
            padding-bottom:${!!/*es*/ ctx[0].paddingBottom
			? /*es*/ ctx[0].paddingBottom.v
			: 0}${!!/*es*/ ctx[0].paddingBottom
			? /*es*/ ctx[0].paddingBottom.u
			: "px"};
            padding-left:${!!/*es*/ ctx[0].paddingLeft
			? /*es*/ ctx[0].paddingLeft.v
			: 0}${!!/*es*/ ctx[0].paddingLeft
			? /*es*/ ctx[0].paddingLeft.u
			: "px"};

            opacity:${/*es*/ ctx[0].opacity / 100 ?? 1};
            
            overflow-x:${/*es*/ ctx[0].overflowX ?? "auto"};
            overflow-y:${/*es*/ ctx[0].overflowY ?? "auto"};

            ${// only use border styles if border is enabled
			/*es*/ ctx[0]["USEBORDER"]
			? `
                    border-style: ${/*es*/ ctx[0].borderStyleTop ?? "solid"} ${/*es*/ ctx[0].borderStyleRight ?? "solid"} ${/*es*/ ctx[0].borderStyleBottom ?? "solid"} ${/*es*/ ctx[0].borderStyleLeft ?? "solid"};

                    border-top-width:${!!/*es*/ ctx[0].borderWidthTop
				? /*es*/ ctx[0].borderWidthTop.v
				: 0}${!!/*es*/ ctx[0].borderWidthTop
				? /*es*/ ctx[0].borderWidthTop.u
				: ""};
                    border-right-width:${!!/*es*/ ctx[0].borderWidthRight
				? /*es*/ ctx[0].borderWidthRight.v
				: 0}${!!/*es*/ ctx[0].borderWidthRight
				? /*es*/ ctx[0].borderWidthRight.u
				: ""};
                    border-bottom-width:${!!/*es*/ ctx[0].borderWidthBottom
				? /*es*/ ctx[0].borderWidthBottom.v
				: 0}${!!/*es*/ ctx[0].borderWidthBottom
				? /*es*/ ctx[0].borderWidthBottom.u
				: ""};
                    border-left-width:${!!/*es*/ ctx[0].borderWidthLeft
				? /*es*/ ctx[0].borderWidthLeft.v
				: 0}${!!/*es*/ ctx[0].borderWidthLeft
				? /*es*/ ctx[0].borderWidthLeft.u
				: ""};

                    border-radius:
                        ${!!/*es*/ ctx[0].borderRadiusTop
				? /*es*/ ctx[0].borderRadiusTop.v
				: 0}${!!/*es*/ ctx[0].borderRadiusTop
				? /*es*/ ctx[0].borderRadiusTop.u
				: ""}
                        ${!!/*es*/ ctx[0].borderRadiusRight
				? /*es*/ ctx[0].borderRadiusRight.v
				: 0}${!!/*es*/ ctx[0].borderRadiusRight
				? /*es*/ ctx[0].borderRadiusRight.u
				: ""}
                        ${!!/*es*/ ctx[0].borderRadiusBottom
				? /*es*/ ctx[0].borderRadiusBottom.v
				: 0}${!!/*es*/ ctx[0].borderRadiusBottom
				? /*es*/ ctx[0].borderRadiusBottom.u
				: ""}
                        ${!!/*es*/ ctx[0].borderRadiusLeft
				? /*es*/ ctx[0].borderRadiusLeft.v
				: 0}${!!/*es*/ ctx[0].borderRadiusLeft
				? /*es*/ ctx[0].borderRadiusLeft.u
				: ""};
                    
                    border-color: hsla(${/*es*/ ctx[0].borderColor.h ?? 0}deg, ${/*es*/ ctx[0].borderColor.s ?? 0}%, ${/*es*/ ctx[0].borderColor.l ?? 0}%, ${/*es*/ ctx[0].borderColor.a ?? 0}%);
                `
			: ""}

            ${// only use outline styles if outline is enabled
			/*es*/ ctx[0]["USEOUTLINE"]
			? `
                    ${!/*es*/ ctx[0]["USEBORDER"]
				? `
                        border-radius:
                            ${!!/*es*/ ctx[0].borderRadiusTop
					? /*es*/ ctx[0].borderRadiusTop.v
					: 0}${!!/*es*/ ctx[0].borderRadiusTop
					? /*es*/ ctx[0].borderRadiusTop.u
					: ""}
                            ${!!/*es*/ ctx[0].borderRadiusRight
					? /*es*/ ctx[0].borderRadiusRight.v
					: 0}${!!/*es*/ ctx[0].borderRadiusRight
					? /*es*/ ctx[0].borderRadiusRight.u
					: ""}
                            ${!!/*es*/ ctx[0].borderRadiusBottom
					? /*es*/ ctx[0].borderRadiusBottom.v
					: 0}${!!/*es*/ ctx[0].borderRadiusBottom
					? /*es*/ ctx[0].borderRadiusBottom.u
					: ""}
                            ${!!/*es*/ ctx[0].borderRadiusLeft
					? /*es*/ ctx[0].borderRadiusLeft.v
					: 0}${!!/*es*/ ctx[0].borderRadiusLeft
					? /*es*/ ctx[0].borderRadiusLeft.u
					: ""};
                    `
				: ""}

                    outline-style: ${/*es*/ ctx[0].outlineStyle ?? "solid"};
                    outline-width:${!!/*es*/ ctx[0].outlineWidth
				? /*es*/ ctx[0].outlineWidth.v
				: 0}${!!/*es*/ ctx[0].outlineWidth
				? /*es*/ ctx[0].outlineWidth.u
				: ""};
                    outline-offset:${!!/*es*/ ctx[0].outlineOffset
				? /*es*/ ctx[0].outlineOffset.v
				: 0}${!!/*es*/ ctx[0].outlineOffset
				? /*es*/ ctx[0].outlineOffset.u
				: ""};
                    outline-color: hsla(${/*es*/ ctx[0].outlineColor.h ?? 0}deg, ${/*es*/ ctx[0].outlineColor.s ?? 0}%, ${/*es*/ ctx[0].outlineColor.l ?? 0}%, ${/*es*/ ctx[0].outlineColor.a ?? 0}%);
                `
			: ""}

            ${// only use background styles if background is enabled
			/*es*/ ctx[0]["USEBACKGROUND"]
			? `
                    background-color: hsla(${/*es*/ ctx[0].backgroundColor.h ?? 0}deg, ${/*es*/ ctx[0].backgroundColor.s ?? 0}%, ${/*es*/ ctx[0].backgroundColor.l ?? 0}%, ${/*es*/ ctx[0].backgroundColor.a ?? 0}%);
                `
			: ""}

            ${// only use shadow styles if background is enabled
			/*es*/ ctx[0]["USESHADOW"]
			? `
                    box-shadow: ${/*shadowString*/ ctx[1]};
                `
			: ""}

            transform: translate3d(
            calc(
                ${!!/*es*/ ctx[0].marginLeft
			? -/*es*/ ctx[0].marginLeft.v / 2
			: "0"}${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.u
			: "px"}
                - ${!!/*es*/ ctx[0].marginRight
			? -/*es*/ ctx[0].marginRight.v / 2
			: "0"}${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.u
			: "px"}
                + ${/*es*/ ctx[0].borderWidthLeft
			? -/*es*/ ctx[0].borderWidthLeft.v / 2
			: 0}${/*es*/ ctx[0].borderWidthLeft
			? /*es*/ ctx[0].borderWidthLeft.u
			: "px"}
                - ${/*es*/ ctx[0].borderWidthRight
			? -/*es*/ ctx[0].borderWidthRight.v / 2
			: 0}${/*es*/ ctx[0].borderWidthRight
			? /*es*/ ctx[0].borderWidthRight.u
			: "px"}),
            calc(
                ${!!/*es*/ ctx[0].marginTop
			? -/*es*/ ctx[0].marginTop.v / 2
			: "0"}${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.u
			: "px"}
                - ${!!/*es*/ ctx[0].marginBottom
			? -/*es*/ ctx[0].marginBottom.v / 2
			: "0"}${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.u
			: "px"}
                + ${/*es*/ ctx[0].borderWidthTop
			? -/*es*/ ctx[0].borderWidthTop.v / 2
			: 0}${/*es*/ ctx[0].borderWidthTop
			? /*es*/ ctx[0].borderWidthTop.u
			: "px"}
                - ${/*es*/ ctx[0].borderWidthBottom
			? -/*es*/ ctx[0].borderWidthBottom.v / 2
			: 0}${/*es*/ ctx[0].borderWidthBottom
			? /*es*/ ctx[0].borderWidthBottom.u
			: "px"}),
            0);
        `);

    			add_location(div, file$2, 40, 8, 2202);

    			attr_dev(main, "style", main_style_value = `
    transform: translate3d(calc(
        ${!!/*es*/ ctx[0].marginLeft
			? -/*es*/ ctx[0].marginLeft.v / 2
			: "0"}${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.u
			: "px"}
        + ${!!/*es*/ ctx[0].marginRight
			? -/*es*/ ctx[0].marginRight.v / 2
			: "0"}${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthLeft && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthLeft.v / 2
			: 0}${/*es*/ ctx[0].borderWidthLeft
			? /*es*/ ctx[0].borderWidthLeft.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthRight && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthRight.v / 2
			: 0}${/*es*/ ctx[0].borderWidthRight
			? /*es*/ ctx[0].borderWidthRight.u
			: "px"}
    ), calc(
        ${!!/*es*/ ctx[0].marginTop
			? -/*es*/ ctx[0].marginTop.v / 2
			: "0"}${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.u
			: "px"}
        + ${!!/*es*/ ctx[0].marginBottom
			? -/*es*/ ctx[0].marginBottom.v / 2
			: "0"}${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthTop && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthTop.v / 2
			: 0}${/*es*/ ctx[0].borderWidthTop
			? /*es*/ ctx[0].borderWidthTop.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthBottom && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthBottom.v / 2
			: 0}${/*es*/ ctx[0].borderWidthBottom
			? /*es*/ ctx[0].borderWidthBottom.u
			: "px"}
    ), 0);
`);

    			attr_dev(main, "class", "no-drag svelte-9gy00l");
    			add_location(main, file$2, 24, 0, 1138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*es, shadowString*/ 3 && div_style_value !== (div_style_value = `
            ${//we have do this terribleness if we want to use anything with a united attribute
			""}
            width:${!!/*es*/ ctx[0].width
			? /*es*/ ctx[0].width.v
			: "fit-content"}${!!/*es*/ ctx[0].width ? /*es*/ ctx[0].width.u : ""};
            height:${!!/*es*/ ctx[0].height
			? /*es*/ ctx[0].height.v
			: "fit-content"}${!!/*es*/ ctx[0].height ? /*es*/ ctx[0].height.u : ""};

            margin-top:${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.v
			: 0}${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.u
			: "px"};
            margin-right:${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.v
			: 0}${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.u
			: "px"};
            margin-bottom:${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.v
			: 0}${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.u
			: "px"};
            margin-left:${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.v
			: 0}${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.u
			: "px"};

            padding-top:${!!/*es*/ ctx[0].paddingTop
			? /*es*/ ctx[0].paddingTop.v
			: 0}${!!/*es*/ ctx[0].paddingTop
			? /*es*/ ctx[0].paddingTop.u
			: "px"};
            padding-right:${!!/*es*/ ctx[0].paddingRight
			? /*es*/ ctx[0].paddingRight.v
			: 0}${!!/*es*/ ctx[0].paddingRight
			? /*es*/ ctx[0].paddingRight.u
			: "px"};
            padding-bottom:${!!/*es*/ ctx[0].paddingBottom
			? /*es*/ ctx[0].paddingBottom.v
			: 0}${!!/*es*/ ctx[0].paddingBottom
			? /*es*/ ctx[0].paddingBottom.u
			: "px"};
            padding-left:${!!/*es*/ ctx[0].paddingLeft
			? /*es*/ ctx[0].paddingLeft.v
			: 0}${!!/*es*/ ctx[0].paddingLeft
			? /*es*/ ctx[0].paddingLeft.u
			: "px"};

            opacity:${/*es*/ ctx[0].opacity / 100 ?? 1};
            
            overflow-x:${/*es*/ ctx[0].overflowX ?? "auto"};
            overflow-y:${/*es*/ ctx[0].overflowY ?? "auto"};

            ${// only use border styles if border is enabled
			/*es*/ ctx[0]["USEBORDER"]
			? `
                    border-style: ${/*es*/ ctx[0].borderStyleTop ?? "solid"} ${/*es*/ ctx[0].borderStyleRight ?? "solid"} ${/*es*/ ctx[0].borderStyleBottom ?? "solid"} ${/*es*/ ctx[0].borderStyleLeft ?? "solid"};

                    border-top-width:${!!/*es*/ ctx[0].borderWidthTop
				? /*es*/ ctx[0].borderWidthTop.v
				: 0}${!!/*es*/ ctx[0].borderWidthTop
				? /*es*/ ctx[0].borderWidthTop.u
				: ""};
                    border-right-width:${!!/*es*/ ctx[0].borderWidthRight
				? /*es*/ ctx[0].borderWidthRight.v
				: 0}${!!/*es*/ ctx[0].borderWidthRight
				? /*es*/ ctx[0].borderWidthRight.u
				: ""};
                    border-bottom-width:${!!/*es*/ ctx[0].borderWidthBottom
				? /*es*/ ctx[0].borderWidthBottom.v
				: 0}${!!/*es*/ ctx[0].borderWidthBottom
				? /*es*/ ctx[0].borderWidthBottom.u
				: ""};
                    border-left-width:${!!/*es*/ ctx[0].borderWidthLeft
				? /*es*/ ctx[0].borderWidthLeft.v
				: 0}${!!/*es*/ ctx[0].borderWidthLeft
				? /*es*/ ctx[0].borderWidthLeft.u
				: ""};

                    border-radius:
                        ${!!/*es*/ ctx[0].borderRadiusTop
				? /*es*/ ctx[0].borderRadiusTop.v
				: 0}${!!/*es*/ ctx[0].borderRadiusTop
				? /*es*/ ctx[0].borderRadiusTop.u
				: ""}
                        ${!!/*es*/ ctx[0].borderRadiusRight
				? /*es*/ ctx[0].borderRadiusRight.v
				: 0}${!!/*es*/ ctx[0].borderRadiusRight
				? /*es*/ ctx[0].borderRadiusRight.u
				: ""}
                        ${!!/*es*/ ctx[0].borderRadiusBottom
				? /*es*/ ctx[0].borderRadiusBottom.v
				: 0}${!!/*es*/ ctx[0].borderRadiusBottom
				? /*es*/ ctx[0].borderRadiusBottom.u
				: ""}
                        ${!!/*es*/ ctx[0].borderRadiusLeft
				? /*es*/ ctx[0].borderRadiusLeft.v
				: 0}${!!/*es*/ ctx[0].borderRadiusLeft
				? /*es*/ ctx[0].borderRadiusLeft.u
				: ""};
                    
                    border-color: hsla(${/*es*/ ctx[0].borderColor.h ?? 0}deg, ${/*es*/ ctx[0].borderColor.s ?? 0}%, ${/*es*/ ctx[0].borderColor.l ?? 0}%, ${/*es*/ ctx[0].borderColor.a ?? 0}%);
                `
			: ""}

            ${// only use outline styles if outline is enabled
			/*es*/ ctx[0]["USEOUTLINE"]
			? `
                    ${!/*es*/ ctx[0]["USEBORDER"]
				? `
                        border-radius:
                            ${!!/*es*/ ctx[0].borderRadiusTop
					? /*es*/ ctx[0].borderRadiusTop.v
					: 0}${!!/*es*/ ctx[0].borderRadiusTop
					? /*es*/ ctx[0].borderRadiusTop.u
					: ""}
                            ${!!/*es*/ ctx[0].borderRadiusRight
					? /*es*/ ctx[0].borderRadiusRight.v
					: 0}${!!/*es*/ ctx[0].borderRadiusRight
					? /*es*/ ctx[0].borderRadiusRight.u
					: ""}
                            ${!!/*es*/ ctx[0].borderRadiusBottom
					? /*es*/ ctx[0].borderRadiusBottom.v
					: 0}${!!/*es*/ ctx[0].borderRadiusBottom
					? /*es*/ ctx[0].borderRadiusBottom.u
					: ""}
                            ${!!/*es*/ ctx[0].borderRadiusLeft
					? /*es*/ ctx[0].borderRadiusLeft.v
					: 0}${!!/*es*/ ctx[0].borderRadiusLeft
					? /*es*/ ctx[0].borderRadiusLeft.u
					: ""};
                    `
				: ""}

                    outline-style: ${/*es*/ ctx[0].outlineStyle ?? "solid"};
                    outline-width:${!!/*es*/ ctx[0].outlineWidth
				? /*es*/ ctx[0].outlineWidth.v
				: 0}${!!/*es*/ ctx[0].outlineWidth
				? /*es*/ ctx[0].outlineWidth.u
				: ""};
                    outline-offset:${!!/*es*/ ctx[0].outlineOffset
				? /*es*/ ctx[0].outlineOffset.v
				: 0}${!!/*es*/ ctx[0].outlineOffset
				? /*es*/ ctx[0].outlineOffset.u
				: ""};
                    outline-color: hsla(${/*es*/ ctx[0].outlineColor.h ?? 0}deg, ${/*es*/ ctx[0].outlineColor.s ?? 0}%, ${/*es*/ ctx[0].outlineColor.l ?? 0}%, ${/*es*/ ctx[0].outlineColor.a ?? 0}%);
                `
			: ""}

            ${// only use background styles if background is enabled
			/*es*/ ctx[0]["USEBACKGROUND"]
			? `
                    background-color: hsla(${/*es*/ ctx[0].backgroundColor.h ?? 0}deg, ${/*es*/ ctx[0].backgroundColor.s ?? 0}%, ${/*es*/ ctx[0].backgroundColor.l ?? 0}%, ${/*es*/ ctx[0].backgroundColor.a ?? 0}%);
                `
			: ""}

            ${// only use shadow styles if background is enabled
			/*es*/ ctx[0]["USESHADOW"]
			? `
                    box-shadow: ${/*shadowString*/ ctx[1]};
                `
			: ""}

            transform: translate3d(
            calc(
                ${!!/*es*/ ctx[0].marginLeft
			? -/*es*/ ctx[0].marginLeft.v / 2
			: "0"}${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.u
			: "px"}
                - ${!!/*es*/ ctx[0].marginRight
			? -/*es*/ ctx[0].marginRight.v / 2
			: "0"}${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.u
			: "px"}
                + ${/*es*/ ctx[0].borderWidthLeft
			? -/*es*/ ctx[0].borderWidthLeft.v / 2
			: 0}${/*es*/ ctx[0].borderWidthLeft
			? /*es*/ ctx[0].borderWidthLeft.u
			: "px"}
                - ${/*es*/ ctx[0].borderWidthRight
			? -/*es*/ ctx[0].borderWidthRight.v / 2
			: 0}${/*es*/ ctx[0].borderWidthRight
			? /*es*/ ctx[0].borderWidthRight.u
			: "px"}),
            calc(
                ${!!/*es*/ ctx[0].marginTop
			? -/*es*/ ctx[0].marginTop.v / 2
			: "0"}${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.u
			: "px"}
                - ${!!/*es*/ ctx[0].marginBottom
			? -/*es*/ ctx[0].marginBottom.v / 2
			: "0"}${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.u
			: "px"}
                + ${/*es*/ ctx[0].borderWidthTop
			? -/*es*/ ctx[0].borderWidthTop.v / 2
			: 0}${/*es*/ ctx[0].borderWidthTop
			? /*es*/ ctx[0].borderWidthTop.u
			: "px"}
                - ${/*es*/ ctx[0].borderWidthBottom
			? -/*es*/ ctx[0].borderWidthBottom.v / 2
			: 0}${/*es*/ ctx[0].borderWidthBottom
			? /*es*/ ctx[0].borderWidthBottom.u
			: "px"}),
            0);
        `)) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty & /*es*/ 1 && main_style_value !== (main_style_value = `
    transform: translate3d(calc(
        ${!!/*es*/ ctx[0].marginLeft
			? -/*es*/ ctx[0].marginLeft.v / 2
			: "0"}${!!/*es*/ ctx[0].marginLeft
			? /*es*/ ctx[0].marginLeft.u
			: "px"}
        + ${!!/*es*/ ctx[0].marginRight
			? -/*es*/ ctx[0].marginRight.v / 2
			: "0"}${!!/*es*/ ctx[0].marginRight
			? /*es*/ ctx[0].marginRight.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthLeft && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthLeft.v / 2
			: 0}${/*es*/ ctx[0].borderWidthLeft
			? /*es*/ ctx[0].borderWidthLeft.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthRight && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthRight.v / 2
			: 0}${/*es*/ ctx[0].borderWidthRight
			? /*es*/ ctx[0].borderWidthRight.u
			: "px"}
    ), calc(
        ${!!/*es*/ ctx[0].marginTop
			? -/*es*/ ctx[0].marginTop.v / 2
			: "0"}${!!/*es*/ ctx[0].marginTop
			? /*es*/ ctx[0].marginTop.u
			: "px"}
        + ${!!/*es*/ ctx[0].marginBottom
			? -/*es*/ ctx[0].marginBottom.v / 2
			: "0"}${!!/*es*/ ctx[0].marginBottom
			? /*es*/ ctx[0].marginBottom.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthTop && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthTop.v / 2
			: 0}${/*es*/ ctx[0].borderWidthTop
			? /*es*/ ctx[0].borderWidthTop.u
			: "px"}
        + ${/*es*/ ctx[0].borderWidthBottom && /*es*/ ctx[0].USEBORDER
			? -/*es*/ ctx[0].borderWidthBottom.v / 2
			: 0}${/*es*/ ctx[0].borderWidthBottom
			? /*es*/ ctx[0].borderWidthBottom.u
			: "px"}
    ), 0);
`)) {
    				attr_dev(main, "style", main_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let currentComponent;
    	let currentOverride;
    	let es;
    	let $selectedOverride;
    	let $selectedComponent;
    	let $collection;
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(4, $selectedOverride = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(5, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(6, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Div', slots, []);

    	const generateShadowString = shadow => {
    		return `${shadow.base.x.v}${shadow.base.x.u} ` + `${shadow.base.y.v}${shadow.base.y.u} ` + `${shadow.base.radius.v}${shadow.base.radius.u} ` + `${shadow.grow.v}${shadow.grow.u} ` + `hsla(${shadow.base.color.h}deg, ${shadow.base.color.s}%, ${shadow.base.color.l}%, ${shadow.base.color.a}%)`;
    	};

    	let shadowString = "";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Div> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		generateShadowString,
    		shadowString,
    		es,
    		currentOverride,
    		currentComponent,
    		$selectedOverride,
    		$selectedComponent,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('shadowString' in $$props) $$invalidate(1, shadowString = $$props.shadowString);
    		if ('es' in $$props) $$invalidate(0, es = $$props.es);
    		if ('currentOverride' in $$props) $$invalidate(2, currentOverride = $$props.currentOverride);
    		if ('currentComponent' in $$props) $$invalidate(3, currentComponent = $$props.currentComponent);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$collection, $selectedComponent*/ 96) {
    			$$invalidate(3, currentComponent = $collection[$selectedComponent]);
    		}

    		if ($$self.$$.dirty & /*$selectedOverride, $collection, $selectedComponent*/ 112) {
    			$$invalidate(2, currentOverride = $selectedOverride !== -1
    			? $collection[$selectedComponent].styleOverrides[$selectedOverride]
    			: undefined);
    		}

    		if ($$self.$$.dirty & /*currentComponent, currentOverride, $selectedOverride*/ 28) {
    			$$invalidate(0, es = !!currentComponent || !!currentOverride
    			? $selectedOverride === -1
    				? currentComponent.style
    				: currentOverride.style
    			: undefined);
    		}

    		if ($$self.$$.dirty & /*es, shadowString*/ 3) {
    			if (!!es.boxShadows && es.boxShadows.length > 0) {
    				$$invalidate(1, shadowString = generateShadowString(es.boxShadows[0]));

    				for (let i = 1; i < es.boxShadows.length; i++) {
    					$$invalidate(1, shadowString += ", " + generateShadowString(es.boxShadows[i]));
    				}
    			} else {
    				$$invalidate(1, shadowString = "none");
    			}
    		}
    	};

    	return [
    		es,
    		shadowString,
    		currentOverride,
    		currentComponent,
    		$selectedOverride,
    		$selectedComponent,
    		$collection
    	];
    }

    class Div extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Div",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/display/MainDisplay.svelte generated by Svelte v3.48.0 */
    const file$1 = "src/components/display/MainDisplay.svelte";

    // (20:4) {:else}
    function create_else_block(ctx) {
    	let section;
    	let elementresizer;
    	let t;
    	let section_class_value;
    	let section_style_value;
    	let current;
    	elementresizer = new ElementResizer({ $$inline: true });
    	let if_block = /*currentComponent*/ ctx[2].type === "DIV" && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(elementresizer.$$.fragment);
    			t = space();
    			if (if_block) if_block.c();

    			attr_dev(section, "class", section_class_value = "" + (null_to_empty(`
        ${/*currentComponent*/ ctx[2].showOutline && (// these logic are basically saying what needs to be true for the outline to show
			!/*currentStyle*/ ctx[5].USEBORDER && (!/*currentStyle*/ ctx[5].USEBACKGROUND || !!/*currentStyle*/ ctx[5].USEBACKGROUND && /*currentStyle*/ ctx[5].backgroundColor.a < 10) || /*currentStyle*/ ctx[5].opacity < 10)
			? "outlined"
			: ""}
    `) + " svelte-yif37l")); // all border width needs to be 0
    			// background needs to be disabled OR background enabled with opacity at 0
    			// OR opacity is less than 10, then absolutely show

    			attr_dev(section, "style", section_style_value = `
        width: calc(${/*currentStyle*/ ctx[5].width
			? /*currentStyle*/ ctx[5].width.v
			: 100}${/*currentStyle*/ ctx[5].width
			? /*currentStyle*/ ctx[5].width.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingLeft
			? /*currentStyle*/ ctx[5].paddingLeft.v
			: 100}${/*currentStyle*/ ctx[5].paddingLeft
			? /*currentStyle*/ ctx[5].paddingLeft.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingRight
			? /*currentStyle*/ ctx[5].paddingRight.v
			: 100}${/*currentStyle*/ ctx[5].paddingRight
			? /*currentStyle*/ ctx[5].paddingRight.u
			: "px"});
        height: calc(${/*currentStyle*/ ctx[5].height
			? /*currentStyle*/ ctx[5].height.v
			: 100}${/*currentStyle*/ ctx[5].height
			? /*currentStyle*/ ctx[5].height.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingTop
			? /*currentStyle*/ ctx[5].paddingTop.v
			: 0}${/*currentStyle*/ ctx[5].paddingTop
			? /*currentStyle*/ ctx[5].paddingTop.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingBottom
			? /*currentStyle*/ ctx[5].paddingBottom.v
			: 0}${/*currentStyle*/ ctx[5].paddingBottom
			? /*currentStyle*/ ctx[5].paddingBottom.u
			: "px"});
    `);

    			add_location(section, file$1, 22, 4, 1150);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(elementresizer, section, null);
    			append_dev(section, t);
    			if (if_block) if_block.m(section, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*currentComponent*/ ctx[2].type === "DIV") {
    				if (if_block) {
    					if (dirty & /*currentComponent*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(section, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*currentComponent, currentStyle*/ 36 && section_class_value !== (section_class_value = "" + (null_to_empty(`
        ${/*currentComponent*/ ctx[2].showOutline && (// these logic are basically saying what needs to be true for the outline to show
			!/*currentStyle*/ ctx[5].USEBORDER && (!/*currentStyle*/ ctx[5].USEBACKGROUND || !!/*currentStyle*/ ctx[5].USEBACKGROUND && /*currentStyle*/ ctx[5].backgroundColor.a < 10) || /*currentStyle*/ ctx[5].opacity < 10)
			? "outlined"
			: ""}
    `) + " svelte-yif37l"))) {
    				attr_dev(section, "class", section_class_value); // all border width needs to be 0
    				// background needs to be disabled OR background enabled with opacity at 0
    				// OR opacity is less than 10, then absolutely show
    			}

    			if (!current || dirty & /*currentStyle*/ 32 && section_style_value !== (section_style_value = `
        width: calc(${/*currentStyle*/ ctx[5].width
			? /*currentStyle*/ ctx[5].width.v
			: 100}${/*currentStyle*/ ctx[5].width
			? /*currentStyle*/ ctx[5].width.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingLeft
			? /*currentStyle*/ ctx[5].paddingLeft.v
			: 100}${/*currentStyle*/ ctx[5].paddingLeft
			? /*currentStyle*/ ctx[5].paddingLeft.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingRight
			? /*currentStyle*/ ctx[5].paddingRight.v
			: 100}${/*currentStyle*/ ctx[5].paddingRight
			? /*currentStyle*/ ctx[5].paddingRight.u
			: "px"});
        height: calc(${/*currentStyle*/ ctx[5].height
			? /*currentStyle*/ ctx[5].height.v
			: 100}${/*currentStyle*/ ctx[5].height
			? /*currentStyle*/ ctx[5].height.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingTop
			? /*currentStyle*/ ctx[5].paddingTop.v
			: 0}${/*currentStyle*/ ctx[5].paddingTop
			? /*currentStyle*/ ctx[5].paddingTop.u
			: "px"}
            + ${/*currentStyle*/ ctx[5].paddingBottom
			? /*currentStyle*/ ctx[5].paddingBottom.v
			: 0}${/*currentStyle*/ ctx[5].paddingBottom
			? /*currentStyle*/ ctx[5].paddingBottom.u
			: "px"});
    `)) {
    				attr_dev(section, "style", section_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(elementresizer.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(elementresizer.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(elementresizer);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(20:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#if $selectedComponent === -1 && $selectedOverride === -1}
    function create_if_block(ctx) {
    	let section;
    	let p;
    	let t0;
    	let span;
    	let t2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			p = element("p");
    			t0 = text("Click ");
    			span = element("span");
    			span.textContent = "+";
    			t2 = text(" to add components for customization");
    			attr_dev(span, "class", "svelte-yif37l");
    			add_location(span, file$1, 16, 17, 973);
    			attr_dev(p, "class", "svelte-yif37l");
    			add_location(p, file$1, 16, 8, 964);
    			attr_dev(section, "id", "app-hint-add-elmnt");
    			attr_dev(section, "class", "svelte-yif37l");
    			add_location(section, file$1, 15, 4, 922);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(p, t2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(14:4) {#if $selectedComponent === -1 && $selectedOverride === -1}",
    		ctx
    	});

    	return block;
    }

    // (39:8) {#if currentComponent.type === "DIV"}
    function create_if_block_1(ctx) {
    	let div;
    	let current;
    	div = new Div({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(div.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(div, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(div.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(div.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(div, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(39:8) {#if currentComponent.type === \\\"DIV\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$selectedComponent*/ ctx[4] === -1 && /*$selectedOverride*/ ctx[3] === -1) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			set_style(main, "position", "absolute");
    			set_style(main, "width", "calc(100vw - " + (/*leftMenuWidth*/ ctx[0] + 1) + "px - " + (/*rightMenuWidth*/ ctx[1] - 1) + "px)");
    			set_style(main, "left", /*leftMenuWidth*/ ctx[0] + 1 + "px");
    			set_style(main, "overflow", "visible");
    			attr_dev(main, "class", "svelte-yif37l");
    			add_location(main, file$1, 11, 0, 635);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}

    			if (!current || dirty & /*leftMenuWidth, rightMenuWidth*/ 3) {
    				set_style(main, "width", "calc(100vw - " + (/*leftMenuWidth*/ ctx[0] + 1) + "px - " + (/*rightMenuWidth*/ ctx[1] - 1) + "px)");
    			}

    			if (!current || dirty & /*leftMenuWidth*/ 1) {
    				set_style(main, "left", /*leftMenuWidth*/ ctx[0] + 1 + "px");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let currentComponent;
    	let currentOverride;
    	let currentStyle;
    	let $selectedOverride;
    	let $selectedComponent;
    	let $collection;
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(3, $selectedOverride = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(4, $selectedComponent = $$value));
    	validate_store(collection, 'collection');
    	component_subscribe($$self, collection, $$value => $$invalidate(7, $collection = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MainDisplay', slots, []);
    	let { leftMenuWidth } = $$props;
    	let { rightMenuWidth } = $$props;
    	const writable_props = ['leftMenuWidth', 'rightMenuWidth'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MainDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('rightMenuWidth' in $$props) $$invalidate(1, rightMenuWidth = $$props.rightMenuWidth);
    	};

    	$$self.$capture_state = () => ({
    		collection,
    		selectedComponent,
    		selectedOverride,
    		ElementResizer,
    		Div,
    		leftMenuWidth,
    		rightMenuWidth,
    		currentOverride,
    		currentComponent,
    		currentStyle,
    		$selectedOverride,
    		$selectedComponent,
    		$collection
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('rightMenuWidth' in $$props) $$invalidate(1, rightMenuWidth = $$props.rightMenuWidth);
    		if ('currentOverride' in $$props) $$invalidate(6, currentOverride = $$props.currentOverride);
    		if ('currentComponent' in $$props) $$invalidate(2, currentComponent = $$props.currentComponent);
    		if ('currentStyle' in $$props) $$invalidate(5, currentStyle = $$props.currentStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$collection, $selectedComponent*/ 144) {
    			$$invalidate(2, currentComponent = $collection[$selectedComponent]);
    		}

    		if ($$self.$$.dirty & /*$selectedOverride, $collection, $selectedComponent*/ 152) {
    			$$invalidate(6, currentOverride = $selectedOverride !== -1
    			? $collection[$selectedComponent].styleOverrides[$selectedOverride]
    			: undefined);
    		}

    		if ($$self.$$.dirty & /*currentComponent, currentOverride, $selectedOverride*/ 76) {
    			$$invalidate(5, currentStyle = !!currentComponent || !!currentOverride
    			? $selectedOverride === -1
    				? currentComponent.style
    				: currentOverride.style
    			: undefined);
    		}
    	};

    	return [
    		leftMenuWidth,
    		rightMenuWidth,
    		currentComponent,
    		$selectedOverride,
    		$selectedComponent,
    		currentStyle,
    		currentOverride,
    		$collection
    	];
    }

    class MainDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { leftMenuWidth: 0, rightMenuWidth: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainDisplay",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*leftMenuWidth*/ ctx[0] === undefined && !('leftMenuWidth' in props)) {
    			console.warn("<MainDisplay> was created without expected prop 'leftMenuWidth'");
    		}

    		if (/*rightMenuWidth*/ ctx[1] === undefined && !('rightMenuWidth' in props)) {
    			console.warn("<MainDisplay> was created without expected prop 'rightMenuWidth'");
    		}
    	}

    	get leftMenuWidth() {
    		throw new Error("<MainDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set leftMenuWidth(value) {
    		throw new Error("<MainDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rightMenuWidth() {
    		throw new Error("<MainDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rightMenuWidth(value) {
    		throw new Error("<MainDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.48.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let leftmenu;
    	let t0;
    	let topmenu;
    	let t1;
    	let rightmenu;
    	let t2;
    	let maindisplay;
    	let t3;
    	let overlay;
    	let current;
    	leftmenu = new LeftMenu({ $$inline: true });
    	leftmenu.$on("widthChange", /*leftMenuWidthChange*/ ctx[2]);

    	topmenu = new TopMenu({
    			props: { leftMenuWidth: /*leftMenuWidth*/ ctx[0] },
    			$$inline: true
    		});

    	rightmenu = new RightMenu({ $$inline: true });
    	rightmenu.$on("widthChange", /*rightMenuWidthChange*/ ctx[3]);

    	maindisplay = new MainDisplay({
    			props: {
    				leftMenuWidth: /*leftMenuWidth*/ ctx[0],
    				rightMenuWidth: /*rightMenuWidth*/ ctx[1]
    			},
    			$$inline: true
    		});

    	overlay = new Overlay({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(leftmenu.$$.fragment);
    			t0 = space();
    			create_component(topmenu.$$.fragment);
    			t1 = space();
    			create_component(rightmenu.$$.fragment);
    			t2 = space();
    			create_component(maindisplay.$$.fragment);
    			t3 = space();
    			create_component(overlay.$$.fragment);
    			attr_dev(main, "class", "svelte-16wa4mx");
    			add_location(main, file, 37, 0, 1256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(leftmenu, main, null);
    			append_dev(main, t0);
    			mount_component(topmenu, main, null);
    			append_dev(main, t1);
    			mount_component(rightmenu, main, null);
    			append_dev(main, t2);
    			mount_component(maindisplay, main, null);
    			append_dev(main, t3);
    			mount_component(overlay, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const topmenu_changes = {};
    			if (dirty & /*leftMenuWidth*/ 1) topmenu_changes.leftMenuWidth = /*leftMenuWidth*/ ctx[0];
    			topmenu.$set(topmenu_changes);
    			const maindisplay_changes = {};
    			if (dirty & /*leftMenuWidth*/ 1) maindisplay_changes.leftMenuWidth = /*leftMenuWidth*/ ctx[0];
    			if (dirty & /*rightMenuWidth*/ 2) maindisplay_changes.rightMenuWidth = /*rightMenuWidth*/ ctx[1];
    			maindisplay.$set(maindisplay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leftmenu.$$.fragment, local);
    			transition_in(topmenu.$$.fragment, local);
    			transition_in(rightmenu.$$.fragment, local);
    			transition_in(maindisplay.$$.fragment, local);
    			transition_in(overlay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leftmenu.$$.fragment, local);
    			transition_out(topmenu.$$.fragment, local);
    			transition_out(rightmenu.$$.fragment, local);
    			transition_out(maindisplay.$$.fragment, local);
    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(leftmenu);
    			destroy_component(topmenu);
    			destroy_component(rightmenu);
    			destroy_component(maindisplay);
    			destroy_component(overlay);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $focusedOverride;
    	let $selectedOverride;
    	let $focusedComponent;
    	let $selectedComponent;
    	let $layerBlurLock;
    	validate_store(focusedOverride, 'focusedOverride');
    	component_subscribe($$self, focusedOverride, $$value => $$invalidate(4, $focusedOverride = $$value));
    	validate_store(selectedOverride, 'selectedOverride');
    	component_subscribe($$self, selectedOverride, $$value => $$invalidate(5, $selectedOverride = $$value));
    	validate_store(focusedComponent, 'focusedComponent');
    	component_subscribe($$self, focusedComponent, $$value => $$invalidate(6, $focusedComponent = $$value));
    	validate_store(selectedComponent, 'selectedComponent');
    	component_subscribe($$self, selectedComponent, $$value => $$invalidate(7, $selectedComponent = $$value));
    	validate_store(layerBlurLock, 'layerBlurLock');
    	component_subscribe($$self, layerBlurLock, $$value => $$invalidate(8, $layerBlurLock = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let leftMenuWidth = 260;

    	const leftMenuWidthChange = evt => {
    		$$invalidate(0, leftMenuWidth = evt.detail.width);
    	};

    	let rightMenuWidth = 360;

    	const rightMenuWidthChange = evt => {
    		$$invalidate(1, rightMenuWidth = evt.detail.width);
    	};

    	document.onmousedown = e => {
    		setTimeout(
    			() => {
    				if ($layerBlurLock === true) {
    					// if locked, unlock for next time
    					set_store_value(layerBlurLock, $layerBlurLock = false, $layerBlurLock);

    					return;
    				}

    				set_store_value(focusedComponent, $focusedComponent = -1, $focusedComponent);
    				set_store_value(focusedOverride, $focusedOverride = -1, $focusedOverride);
    			},
    			0
    		);
    	};

    	// DEBUG: 
    	setTimeout(
    		() => {
    			addComponent("DIV", {}, true);

    			// simulate clicking on it
    			set_store_value(selectedComponent, $selectedComponent = 0, $selectedComponent);

    			set_store_value(focusedComponent, $focusedComponent = 0, $focusedComponent);
    			set_store_value(selectedOverride, $selectedOverride = -1, $selectedOverride);
    			set_store_value(focusedOverride, $focusedOverride = -1, $focusedOverride);
    		},
    		50
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Overlay,
    		LeftMenu,
    		RightMenu,
    		TopMenu,
    		MainDisplay,
    		addComponent,
    		focusedComponent,
    		focusedOverride,
    		layerBlurLock,
    		selectedComponent,
    		selectedOverride,
    		leftMenuWidth,
    		leftMenuWidthChange,
    		rightMenuWidth,
    		rightMenuWidthChange,
    		$focusedOverride,
    		$selectedOverride,
    		$focusedComponent,
    		$selectedComponent,
    		$layerBlurLock
    	});

    	$$self.$inject_state = $$props => {
    		if ('leftMenuWidth' in $$props) $$invalidate(0, leftMenuWidth = $$props.leftMenuWidth);
    		if ('rightMenuWidth' in $$props) $$invalidate(1, rightMenuWidth = $$props.rightMenuWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [leftMenuWidth, rightMenuWidth, leftMenuWidthChange, rightMenuWidthChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /**
     * A list of web safe fonts that can be used. Not that web safe fonts only support normal and bold variations
     */
    const webSafeFonts = [
        { family: "Arial",
            category: "sans-serif",
            webSafe: true,
        }, { family: "Verdana",
            category: "sans-serif",
            webSafe: true,
        }, { family: "Tahoma",
            category: "sans-serif",
            webSafe: true,
        }, { family: "Trebuchet MS",
            category: "sans-serif",
            webSafe: true,
        }, { family: "Times New Roman",
            category: "serif",
            webSafe: true,
        }, { family: "Georgia",
            category: "serif",
            webSafe: true,
        }, { family: "Garamond",
            category: "serif",
            webSafe: true,
        }, { family: "Courier New",
            category: "monospace",
            webSafe: true,
        }, { family: "Brush Script MT",
            category: "handwriting",
            webSafe: true,
        }
    ];
    /**
     * @summary
     * This is an asynchronus function that will initialize all the fonts that is available in the the Google Fonts API, and organizes them into an object that can be locally accessed through sessionStorage. Note that this function does not load font files, but rather organizes a list of available font informations as well as its corresponding files. The only reason why we're not keeping the object in memory is because the total list is around 1mb in size, which is pretty large.
     *
     * @usage
     * Run this function in concurrency to the page load. This should only be done only once.
     *
     * @remarks
     * Fun fact: This is the first file in the entire codebase to get a proper documentation... I know, I'm not proud of myself either.
     */
    async function loadFonts(web = true) {
        let typefaceData = [];
        let response;
        return new Promise(async (res, rej) => {
            // time the process time just for debugging purposes
            const startTime = performance.now();
            // add web safe fonts
            for (let i = 0; i < webSafeFonts.length; i++) {
                typefaceData.push(webSafeFonts[i]);
            }
            // if we're not adding web fonts, we can just store everything in session right now
            if (!web) {
                sessionStorage.setItem("typefaces", JSON.stringify(typefaceData));
                const endTime = performance.now();
                res({
                    fontsLoaded: typefaceData.length,
                    timeTook: endTime - startTime
                }); // response end
            }
            // if we still want to get web fonts
            try { // attempt to fetch all raw font data from the Google Fonts API
                response = await fetch("https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDW3JQmec-yJykfP-FcRYpIujOc6jYa4RQ");
                // NOTE: Change the API key into prod when this is done.
                if (!response.ok) { // if there was a problem with the resp, we'll store what we have right now and reject the promise
                    sessionStorage.setItem("typefaces", JSON.stringify(typefaceData)); // store what we have right now
                    return rej(response.status);
                }
            }
            catch (err) {
                // If there's an error, store what we have right now
                sessionStorage.setItem("typefaces", JSON.stringify(typefaceData));
                return rej(err);
            }
            // If there is no error, process the response
            let rawTypefaceData = (await response.json())["items"]; // convert response to json
            // interate through every font and process the variant so that it removes all the italic ones, and at the same time add a new attribute called `canItalisize`
            for (let i = 0; i < rawTypefaceData.length; i++) {
                // add to final data
                typefaceData.push({
                    family: rawTypefaceData[i].family,
                    version: rawTypefaceData[i].version,
                    lastModified: rawTypefaceData[i].lastModified,
                    files: cleanFontFiles(rawTypefaceData[i].files),
                    category: rawTypefaceData[i].category,
                    webSafe: false
                });
            }
            // drop large data from memory
            rawTypefaceData = null;
            // store the processed font data into session storage
            sessionStorage.setItem("typefaces", JSON.stringify(typefaceData));
            // time the process time just for debugging purposes
            const endTime = performance.now();
            // resolve promise
            res({
                fontsLoaded: typefaceData.length,
                timeTook: endTime - startTime
            });
        });
    }
    /**
     * An array that contains two objects that map font weights to their corresponding names, and vice versa.
     * @property {fontAttributes} 0 - An object that maps font weights (in string format) to their corresponding names.
     * @property {fontAttributes} 1 - An object that maps font names to their corresponding weights (in string format).
     */
    const fontNameDictionary = [{
            "100": "thin",
            "200": "extralight",
            "300": "light",
            "400": "regular",
            "500": "medium",
            "600": "semibold",
            "700": "bold",
            "800": "extrabold",
            "900": "black"
        }, {
            "thin": "100",
            "extralight": "200",
            "light": "300",
            "regular": "400",
            "medium": "500",
            "semibold": "600",
            "bold": "700",
            "extrabold": "800",
            "black": "900",
        }];
    /**
     * @summary A dictionary referrer for all your font name needs.
     *
     * @param key
     * The word / value that needs to be converted
     *
     * @param mode
     * @type {"name" | "value" | "auto"}
     * The function will return either a name, value, or either on auto
     */
    function getFontNameValue(key, mode) {
        var _a;
        if (mode === "name") {
            if (!!fontNameDictionary[1][key])
                return key; // do not convert if it's already a name
            let result = fontNameDictionary[0][key];
            return result !== null && result !== void 0 ? result : "–";
        }
        else if (mode === "value") {
            if (!!fontNameDictionary[0][key])
                return key; // do not convert if it's already a value
            let result = fontNameDictionary[1][key];
            return result !== null && result !== void 0 ? result : "–";
        }
        let result = (_a = fontNameDictionary[0][key]) !== null && _a !== void 0 ? _a : fontNameDictionary[1][key];
        return result !== null && result !== void 0 ? result : "–";
    }
    /**
     * Removes italic font files from the provided font attributes object and returns the cleaned font attributes object.
     * @param files - The font attributes object to be cleaned.
     * @returns The cleaned font attributes object.
     */
    function cleanFontFiles(files) {
        let result = {};
        const fileKeys = Object.keys(files);
        // iterate through variants
        for (let i = 0; i < fileKeys.length; i++) {
            // detect if there is "italic" at the end of the key
            const key = fileKeys[i];
            if (key.endsWith("italic")) {
                continue;
            }
            // add to result
            result[getFontNameValue(key.toLowerCase(), "name")] = files[key];
        }
        return result;
    }

    const app = new App({
        target: document.body
    });
    window.onload = () => {
        loadFonts().then(res => console.debug(`Loaded ${res.fontsLoaded} fonts without errors in ${Math.round(res.timeTook)}ms`)).catch(e => console.error("Error occured during font loading: ", e)); // initialize all fonts
    };

    return app;

})();
//# sourceMappingURL=bundle.js.map
