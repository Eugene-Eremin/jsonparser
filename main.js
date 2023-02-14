/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/node-domexception/index.js":
/*!*************************************************!*\
  !*** ./node_modules/node-domexception/index.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

                /*! node-domexception. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

                if (!globalThis.DOMException) {
                    try {
                        const { MessageChannel } = __webpack_require__(/*! worker_threads */ "worker_threads"),
                            port = new MessageChannel().port1,
                            ab = new ArrayBuffer()
                        port.postMessage(ab, [ab, ab])
                    } catch (err) {
                        err.constructor.name === 'DOMException' && (
                            globalThis.DOMException = err.constructor
                        )
                    }
                }

                module.exports = globalThis.DOMException


                /***/
            }),

/***/ "./src/Observer.ts":
/*!*************************!*\
  !*** ./src/Observer.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

                "use strict";

                Object.defineProperty(exports, "__esModule", ({ value: true }));
                exports.Observable = void 0;
                class Observable {
                    constructor(value) {
                        this.value = value;
                        this._observers = [];
                    }
                    subscribe(observer) {
                        this._observers.push(observer);
                    }
                    unsubscribe(observer) {
                        const index = this._observers.indexOf(observer);
                        this._observers.splice(index, 1);
                    }
                    next(value) {
                        this.value = value;
                        for (const observer of this._observers) {
                            observer(value);
                        }
                    }
                }
                exports.Observable = Observable;


                /***/
            }),

/***/ "./src/builder.ts":
/*!************************!*\
  !*** ./src/builder.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

                "use strict";

                Object.defineProperty(exports, "__esModule", ({ value: true }));
                exports.ParserBuilder = void 0;
                const parser_1 = __webpack_require__(/*! ./parser */ "./src/parser.ts");
                const fetcher_1 = __webpack_require__(/*! ./fetcher */ "./src/fetcher.ts");
                const filler_1 = __webpack_require__(/*! ./filler */ "./src/filler.ts");
                const state_1 = __webpack_require__(/*! ./state */ "./src/state.ts");
                class ParserBuilder {
                    setFetcher(fetcherFactory) {
                        this.fetcher = (fetcherFactory || new fetcher_1.JSONFetcherFactory()).getJSONFetcher();
                        return this;
                    }
                    setFiller(filler) {
                        this.filler = filler || new filler_1.FillAlbum(new filler_1.Album());
                        return this;
                    }
                    setStore(store) {
                        this.store = store || new state_1.Store(new state_1.Reducer());
                        return this;
                    }
                    build() {
                        return new parser_1.Parser(this);
                    }
                }
                exports.ParserBuilder = ParserBuilder;


                /***/
            }),

/***/ "./src/fetcher.ts":
/*!************************!*\
  !*** ./src/fetcher.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

                "use strict";

                Object.defineProperty(exports, "__esModule", ({ value: true }));
                exports.JSONFetcherFactory = exports.JSONFetcher = void 0;
                const node_fetch_1 = __webpack_require__(/*! node-fetch */ "./node_modules/node-fetch/src/index.js");
                class JSONFetcher {
                    constructor() {
                        this.apiEntities = ["posts", "todos", "comments", "albums", "photos"];
                    }
                    async fetchJSON() {
                        const randomEntity = this.apiEntities[Math.round(Math.random() * 5)];
                        const randomId = Math.round(Math.random() * 100);
                        return await (0, node_fetch_1.default)(`https://jsonplaceholder.typicode.com/albums/${randomId}`)
                            .then((response) => response.json())
                            .then((json) => JSON.stringify(json));
                    }
                }
                exports.JSONFetcher = JSONFetcher;
                class JSONFetcherFactory {
                    getJSONFetcher() {
                        return new JSONFetcher();
                    }
                }
                exports.JSONFetcherFactory = JSONFetcherFactory;


                /***/
            }),

/***/ "./src/filler.ts":
/*!***********************!*\
  !*** ./src/filler.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {

                "use strict";

                Object.defineProperty(exports, "__esModule", ({ value: true }));
                exports.FillAlbum = exports.Album = void 0;
                class Album {
                }
                exports.Album = Album;
                class FillAlbum {
                    constructor(filler) {
                        this.filler = filler;
                    }
                    fill(key, value) {
                        this.filler[key] = value;
                    }
                }
                exports.FillAlbum = FillAlbum;


                /***/
            }),

/***/ "./src/parser.ts":
/*!***********************!*\
  !*** ./src/parser.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

                "use strict";

                Object.defineProperty(exports, "__esModule", ({ value: true }));
                exports.ParserFacade = exports.Parser = void 0;
                const state_1 = __webpack_require__(/*! ./state */ "./src/state.ts");
                const Observer_1 = __webpack_require__(/*! ./Observer */ "./src/Observer.ts");
                const builder_1 = __webpack_require__(/*! ./builder */ "./src/builder.ts");
                class Parser {
                    constructor(item) {
                        this.store = item.store;
                        this.fetcher = item.fetcher;
                        this.filler = item.filler;
                    }
                }
                exports.Parser = Parser;
                class ParserFacade {
                    constructor(parser) {
                        this.parser = parser;
                    }
                    parseJson() {
                        const observable = new Observer_1.Observable(null);
                        const parsingAction = (0, state_1.createUpdateStateAction)("parsing");
                        this.parser.store.dispatch(parsingAction);
                        this.parser.fetcher.fetchJSON().then(async (json) => {
                            for (const entry of Object.entries(JSON.parse(json))) {
                                this.parser.filler.fill(entry[0], entry[1]);
                            }
                            observable.next(this.parser.filler.filler);
                            const waitingAction = (0, state_1.createUpdateStateAction)("waiting");
                            this.parser.store.dispatch(waitingAction);
                        });
                        return observable;
                    }
                }
                exports.ParserFacade = ParserFacade;
                const obs = new ParserFacade(new builder_1.ParserBuilder().setFetcher().setFiller().setStore()).parseJson();
                console.log(obs, "4");
                obs.subscribe((val) => console.log(val, "5"));


                /***/
            }),

/***/ "./src/state.ts":
/*!**********************!*\
  !*** ./src/state.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {

                "use strict";

                Object.defineProperty(exports, "__esModule", ({ value: true }));
                exports.Store = exports.Reducer = exports.createUpdateStateAction = void 0;
                const createUpdateStateAction = (payload) => {
                    return { name: "UPDATE_STATE", payload };
                };
                exports.createUpdateStateAction = createUpdateStateAction;
                class Reducer {
                    reduce(state, action) {
                        switch (action.name) {
                            case "UPDATE_STATE":
                                return { ...state, status: action.payload };
                            default:
                                return { ...state };
                        }
                    }
                }
                exports.Reducer = Reducer;
                class Store {
                    constructor(reducer) {
                        this.reducer = reducer;
                        this.state = { status: "waiting" };
                    }
                    dispatch(action) {
                        this.state = this.reducer.reduce(this.state, action);
                    }
                }
                exports.Store = Store;


                /***/
            }),

/***/ "./node_modules/web-streams-polyfill/dist/ponyfill.es2018.js":
/*!*******************************************************************!*\
  !*** ./node_modules/web-streams-polyfill/dist/ponyfill.es2018.js ***!
  \*******************************************************************/
/***/ (function (__unused_webpack_module, exports, __webpack_require__) {

                /**
                 * web-streams-polyfill v3.2.1
                 */
                (function (global, factory) {
                    true ? factory(exports) :
                        0;
                }(this, (function (exports) {
                    'use strict';

                    /// <reference lib="es2015.symbol" />
                    const SymbolPolyfill = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ?
                        Symbol :
                        description => `Symbol(${description})`;

                    /// <reference lib="dom" />
                    function noop() {
                        return undefined;
                    }
                    function getGlobals() {
                        if (typeof self !== 'undefined') {
                            return self;
                        }
                        else if (typeof window !== 'undefined') {
                            return window;
                        }
                        else if (typeof __webpack_require__.g !== 'undefined') {
                            return __webpack_require__.g;
                        }
                        return undefined;
                    }
                    const globals = getGlobals();

                    function typeIsObject(x) {
                        return (typeof x === 'object' && x !== null) || typeof x === 'function';
                    }
                    const rethrowAssertionErrorRejection = noop;

                    const originalPromise = Promise;
                    const originalPromiseThen = Promise.prototype.then;
                    const originalPromiseResolve = Promise.resolve.bind(originalPromise);
                    const originalPromiseReject = Promise.reject.bind(originalPromise);
                    function newPromise(executor) {
                        return new originalPromise(executor);
                    }
                    function promiseResolvedWith(value) {
                        return originalPromiseResolve(value);
                    }
                    function promiseRejectedWith(reason) {
                        return originalPromiseReject(reason);
                    }
                    function PerformPromiseThen(promise, onFulfilled, onRejected) {
                        // There doesn't appear to be any way to correctly emulate the behaviour from JavaScript, so this is just an
                        // approximation.
                        return originalPromiseThen.call(promise, onFulfilled, onRejected);
                    }
                    function uponPromise(promise, onFulfilled, onRejected) {
                        PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), undefined, rethrowAssertionErrorRejection);
                    }
                    function uponFulfillment(promise, onFulfilled) {
                        uponPromise(promise, onFulfilled);
                    }
                    function uponRejection(promise, onRejected) {
                        uponPromise(promise, undefined, onRejected);
                    }
                    function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
                        return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
                    }
                    function setPromiseIsHandledToTrue(promise) {
                        PerformPromiseThen(promise, undefined, rethrowAssertionErrorRejection);
                    }
                    const queueMicrotask = (() => {
                        const globalQueueMicrotask = globals && globals.queueMicrotask;
                        if (typeof globalQueueMicrotask === 'function') {
                            return globalQueueMicrotask;
                        }
                        const resolvedPromise = promiseResolvedWith(undefined);
                        return (fn) => PerformPromiseThen(resolvedPromise, fn);
                    })();
                    function reflectCall(F, V, args) {
                        if (typeof F !== 'function') {
                            throw new TypeError('Argument is not a function');
                        }
                        return Function.prototype.apply.call(F, V, args);
                    }
                    function promiseCall(F, V, args) {
                        try {
                            return promiseResolvedWith(reflectCall(F, V, args));
                        }
                        catch (value) {
                            return promiseRejectedWith(value);
                        }
                    }

                    // Original from Chromium
                    // https://chromium.googlesource.com/chromium/src/+/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/core/streams/SimpleQueue.js
                    const QUEUE_MAX_ARRAY_SIZE = 16384;
                    /**
                     * Simple queue structure.
                     *
                     * Avoids scalability issues with using a packed array directly by using
                     * multiple arrays in a linked list and keeping the array size bounded.
                     */
                    class SimpleQueue {
                        constructor() {
                            this._cursor = 0;
                            this._size = 0;
                            // _front and _back are always defined.
                            this._front = {
                                _elements: [],
                                _next: undefined
                            };
                            this._back = this._front;
                            // The cursor is used to avoid calling Array.shift().
                            // It contains the index of the front element of the array inside the
                            // front-most node. It is always in the range [0, QUEUE_MAX_ARRAY_SIZE).
                            this._cursor = 0;
                            // When there is only one node, size === elements.length - cursor.
                            this._size = 0;
                        }
                        get length() {
                            return this._size;
                        }
                        // For exception safety, this method is structured in order:
                        // 1. Read state
                        // 2. Calculate required state mutations
                        // 3. Perform state mutations
                        push(element) {
                            const oldBack = this._back;
                            let newBack = oldBack;
                            if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
                                newBack = {
                                    _elements: [],
                                    _next: undefined
                                };
                            }
                            // push() is the mutation most likely to throw an exception, so it
                            // goes first.
                            oldBack._elements.push(element);
                            if (newBack !== oldBack) {
                                this._back = newBack;
                                oldBack._next = newBack;
                            }
                            ++this._size;
                        }
                        // Like push(), shift() follows the read -> calculate -> mutate pattern for
                        // exception safety.
                        shift() { // must not be called on an empty queue
                            const oldFront = this._front;
                            let newFront = oldFront;
                            const oldCursor = this._cursor;
                            let newCursor = oldCursor + 1;
                            const elements = oldFront._elements;
                            const element = elements[oldCursor];
                            if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
                                newFront = oldFront._next;
                                newCursor = 0;
                            }
                            // No mutations before this point.
                            --this._size;
                            this._cursor = newCursor;
                            if (oldFront !== newFront) {
                                this._front = newFront;
                            }
                            // Permit shifted element to be garbage collected.
                            elements[oldCursor] = undefined;
                            return element;
                        }
                        // The tricky thing about forEach() is that it can be called
                        // re-entrantly. The queue may be mutated inside the callback. It is easy to
                        // see that push() within the callback has no negative effects since the end
                        // of the queue is checked for on every iteration. If shift() is called
                        // repeatedly within the callback then the next iteration may return an
                        // element that has been removed. In this case the callback will be called
                        // with undefined values until we either "catch up" with elements that still
                        // exist or reach the back of the queue.
                        forEach(callback) {
                            let i = this._cursor;
                            let node = this._front;
                            let elements = node._elements;
                            while (i !== elements.length || node._next !== undefined) {
                                if (i === elements.length) {
                                    node = node._next;
                                    elements = node._elements;
                                    i = 0;
                                    if (elements.length === 0) {
                                        break;
                                    }
                                }
                                callback(elements[i]);
                                ++i;
                            }
                        }
                        // Return the element that would be returned if shift() was called now,
                        // without modifying the queue.
                        peek() { // must not be called on an empty queue
                            const front = this._front;
                            const cursor = this._cursor;
                            return front._elements[cursor];
                        }
                    }

                    function ReadableStreamReaderGenericInitialize(reader, stream) {
                        reader._ownerReadableStream = stream;
                        stream._reader = reader;
                        if (stream._state === 'readable') {
                            defaultReaderClosedPromiseInitialize(reader);
                        }
                        else if (stream._state === 'closed') {
                            defaultReaderClosedPromiseInitializeAsResolved(reader);
                        }
                        else {
                            defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
                        }
                    }
                    // A client of ReadableStreamDefaultReader and ReadableStreamBYOBReader may use these functions directly to bypass state
                    // check.
                    function ReadableStreamReaderGenericCancel(reader, reason) {
                        const stream = reader._ownerReadableStream;
                        return ReadableStreamCancel(stream, reason);
                    }
                    function ReadableStreamReaderGenericRelease(reader) {
                        if (reader._ownerReadableStream._state === 'readable') {
                            defaultReaderClosedPromiseReject(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
                        }
                        else {
                            defaultReaderClosedPromiseResetToRejected(reader, new TypeError(`Reader was released and can no longer be used to monitor the stream's closedness`));
                        }
                        reader._ownerReadableStream._reader = undefined;
                        reader._ownerReadableStream = undefined;
                    }
                    // Helper functions for the readers.
                    function readerLockException(name) {
                        return new TypeError('Cannot ' + name + ' a stream using a released reader');
                    }
                    // Helper functions for the ReadableStreamDefaultReader.
                    function defaultReaderClosedPromiseInitialize(reader) {
                        reader._closedPromise = newPromise((resolve, reject) => {
                            reader._closedPromise_resolve = resolve;
                            reader._closedPromise_reject = reject;
                        });
                    }
                    function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
                        defaultReaderClosedPromiseInitialize(reader);
                        defaultReaderClosedPromiseReject(reader, reason);
                    }
                    function defaultReaderClosedPromiseInitializeAsResolved(reader) {
                        defaultReaderClosedPromiseInitialize(reader);
                        defaultReaderClosedPromiseResolve(reader);
                    }
                    function defaultReaderClosedPromiseReject(reader, reason) {
                        if (reader._closedPromise_reject === undefined) {
                            return;
                        }
                        setPromiseIsHandledToTrue(reader._closedPromise);
                        reader._closedPromise_reject(reason);
                        reader._closedPromise_resolve = undefined;
                        reader._closedPromise_reject = undefined;
                    }
                    function defaultReaderClosedPromiseResetToRejected(reader, reason) {
                        defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
                    }
                    function defaultReaderClosedPromiseResolve(reader) {
                        if (reader._closedPromise_resolve === undefined) {
                            return;
                        }
                        reader._closedPromise_resolve(undefined);
                        reader._closedPromise_resolve = undefined;
                        reader._closedPromise_reject = undefined;
                    }

                    const AbortSteps = SymbolPolyfill('[[AbortSteps]]');
                    const ErrorSteps = SymbolPolyfill('[[ErrorSteps]]');
                    const CancelSteps = SymbolPolyfill('[[CancelSteps]]');
                    const PullSteps = SymbolPolyfill('[[PullSteps]]');

                    /// <reference lib="es2015.core" />
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite#Polyfill
                    const NumberIsFinite = Number.isFinite || function (x) {
                        return typeof x === 'number' && isFinite(x);
                    };

                    /// <reference lib="es2015.core" />
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc#Polyfill
                    const MathTrunc = Math.trunc || function (v) {
                        return v < 0 ? Math.ceil(v) : Math.floor(v);
                    };

                    // https://heycam.github.io/webidl/#idl-dictionaries
                    function isDictionary(x) {
                        return typeof x === 'object' || typeof x === 'function';
                    }
                    function assertDictionary(obj, context) {
                        if (obj !== undefined && !isDictionary(obj)) {
                            throw new TypeError(`${context} is not an object.`);
                        }
                    }
                    // https://heycam.github.io/webidl/#idl-callback-functions
                    function assertFunction(x, context) {
                        if (typeof x !== 'function') {
                            throw new TypeError(`${context} is not a function.`);
                        }
                    }
                    // https://heycam.github.io/webidl/#idl-object
                    function isObject(x) {
                        return (typeof x === 'object' && x !== null) || typeof x === 'function';
                    }
                    function assertObject(x, context) {
                        if (!isObject(x)) {
                            throw new TypeError(`${context} is not an object.`);
                        }
                    }
                    function assertRequiredArgument(x, position, context) {
                        if (x === undefined) {
                            throw new TypeError(`Parameter ${position} is required in '${context}'.`);
                        }
                    }
                    function assertRequiredField(x, field, context) {
                        if (x === undefined) {
                            throw new TypeError(`${field} is required in '${context}'.`);
                        }
                    }
                    // https://heycam.github.io/webidl/#idl-unrestricted-double
                    function convertUnrestrictedDouble(value) {
                        return Number(value);
                    }
                    function censorNegativeZero(x) {
                        return x === 0 ? 0 : x;
                    }
                    function integerPart(x) {
                        return censorNegativeZero(MathTrunc(x));
                    }
                    // https://heycam.github.io/webidl/#idl-unsigned-long-long
                    function convertUnsignedLongLongWithEnforceRange(value, context) {
                        const lowerBound = 0;
                        const upperBound = Number.MAX_SAFE_INTEGER;
                        let x = Number(value);
                        x = censorNegativeZero(x);
                        if (!NumberIsFinite(x)) {
                            throw new TypeError(`${context} is not a finite number`);
                        }
                        x = integerPart(x);
                        if (x < lowerBound || x > upperBound) {
                            throw new TypeError(`${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`);
                        }
                        if (!NumberIsFinite(x) || x === 0) {
                            return 0;
                        }
                        // TODO Use BigInt if supported?
                        // let xBigInt = BigInt(integerPart(x));
                        // xBigInt = BigInt.asUintN(64, xBigInt);
                        // return Number(xBigInt);
                        return x;
                    }

                    function assertReadableStream(x, context) {
                        if (!IsReadableStream(x)) {
                            throw new TypeError(`${context} is not a ReadableStream.`);
                        }
                    }

                    // Abstract operations for the ReadableStream.
                    function AcquireReadableStreamDefaultReader(stream) {
                        return new ReadableStreamDefaultReader(stream);
                    }
                    // ReadableStream API exposed for controllers.
                    function ReadableStreamAddReadRequest(stream, readRequest) {
                        stream._reader._readRequests.push(readRequest);
                    }
                    function ReadableStreamFulfillReadRequest(stream, chunk, done) {
                        const reader = stream._reader;
                        const readRequest = reader._readRequests.shift();
                        if (done) {
                            readRequest._closeSteps();
                        }
                        else {
                            readRequest._chunkSteps(chunk);
                        }
                    }
                    function ReadableStreamGetNumReadRequests(stream) {
                        return stream._reader._readRequests.length;
                    }
                    function ReadableStreamHasDefaultReader(stream) {
                        const reader = stream._reader;
                        if (reader === undefined) {
                            return false;
                        }
                        if (!IsReadableStreamDefaultReader(reader)) {
                            return false;
                        }
                        return true;
                    }
                    /**
                     * A default reader vended by a {@link ReadableStream}.
                     *
                     * @public
                     */
                    class ReadableStreamDefaultReader {
                        constructor(stream) {
                            assertRequiredArgument(stream, 1, 'ReadableStreamDefaultReader');
                            assertReadableStream(stream, 'First parameter');
                            if (IsReadableStreamLocked(stream)) {
                                throw new TypeError('This stream has already been locked for exclusive reading by another reader');
                            }
                            ReadableStreamReaderGenericInitialize(this, stream);
                            this._readRequests = new SimpleQueue();
                        }
                        /**
                         * Returns a promise that will be fulfilled when the stream becomes closed,
                         * or rejected if the stream ever errors or the reader's lock is released before the stream finishes closing.
                         */
                        get closed() {
                            if (!IsReadableStreamDefaultReader(this)) {
                                return promiseRejectedWith(defaultReaderBrandCheckException('closed'));
                            }
                            return this._closedPromise;
                        }
                        /**
                         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
                         */
                        cancel(reason = undefined) {
                            if (!IsReadableStreamDefaultReader(this)) {
                                return promiseRejectedWith(defaultReaderBrandCheckException('cancel'));
                            }
                            if (this._ownerReadableStream === undefined) {
                                return promiseRejectedWith(readerLockException('cancel'));
                            }
                            return ReadableStreamReaderGenericCancel(this, reason);
                        }
                        /**
                         * Returns a promise that allows access to the next chunk from the stream's internal queue, if available.
                         *
                         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
                         */
                        read() {
                            if (!IsReadableStreamDefaultReader(this)) {
                                return promiseRejectedWith(defaultReaderBrandCheckException('read'));
                            }
                            if (this._ownerReadableStream === undefined) {
                                return promiseRejectedWith(readerLockException('read from'));
                            }
                            let resolvePromise;
                            let rejectPromise;
                            const promise = newPromise((resolve, reject) => {
                                resolvePromise = resolve;
                                rejectPromise = reject;
                            });
                            const readRequest = {
                                _chunkSteps: chunk => resolvePromise({ value: chunk, done: false }),
                                _closeSteps: () => resolvePromise({ value: undefined, done: true }),
                                _errorSteps: e => rejectPromise(e)
                            };
                            ReadableStreamDefaultReaderRead(this, readRequest);
                            return promise;
                        }
                        /**
                         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
                         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
                         * from now on; otherwise, the reader will appear closed.
                         *
                         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
                         * the reader's {@link ReadableStreamDefaultReader.read | read()} method has not yet been settled. Attempting to
                         * do so will throw a `TypeError` and leave the reader locked to the stream.
                         */
                        releaseLock() {
                            if (!IsReadableStreamDefaultReader(this)) {
                                throw defaultReaderBrandCheckException('releaseLock');
                            }
                            if (this._ownerReadableStream === undefined) {
                                return;
                            }
                            if (this._readRequests.length > 0) {
                                throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
                            }
                            ReadableStreamReaderGenericRelease(this);
                        }
                    }
                    Object.defineProperties(ReadableStreamDefaultReader.prototype, {
                        cancel: { enumerable: true },
                        read: { enumerable: true },
                        releaseLock: { enumerable: true },
                        closed: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(ReadableStreamDefaultReader.prototype, SymbolPolyfill.toStringTag, {
                            value: 'ReadableStreamDefaultReader',
                            configurable: true
                        });
                    }
                    // Abstract operations for the readers.
                    function IsReadableStreamDefaultReader(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_readRequests')) {
                            return false;
                        }
                        return x instanceof ReadableStreamDefaultReader;
                    }
                    function ReadableStreamDefaultReaderRead(reader, readRequest) {
                        const stream = reader._ownerReadableStream;
                        stream._disturbed = true;
                        if (stream._state === 'closed') {
                            readRequest._closeSteps();
                        }
                        else if (stream._state === 'errored') {
                            readRequest._errorSteps(stream._storedError);
                        }
                        else {
                            stream._readableStreamController[PullSteps](readRequest);
                        }
                    }
                    // Helper functions for the ReadableStreamDefaultReader.
                    function defaultReaderBrandCheckException(name) {
                        return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
                    }

                    /// <reference lib="es2018.asynciterable" />
                    /* eslint-disable @typescript-eslint/no-empty-function */
                    const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () { }).prototype);

                    /// <reference lib="es2018.asynciterable" />
                    class ReadableStreamAsyncIteratorImpl {
                        constructor(reader, preventCancel) {
                            this._ongoingPromise = undefined;
                            this._isFinished = false;
                            this._reader = reader;
                            this._preventCancel = preventCancel;
                        }
                        next() {
                            const nextSteps = () => this._nextSteps();
                            this._ongoingPromise = this._ongoingPromise ?
                                transformPromiseWith(this._ongoingPromise, nextSteps, nextSteps) :
                                nextSteps();
                            return this._ongoingPromise;
                        }
                        return(value) {
                            const returnSteps = () => this._returnSteps(value);
                            return this._ongoingPromise ?
                                transformPromiseWith(this._ongoingPromise, returnSteps, returnSteps) :
                                returnSteps();
                        }
                        _nextSteps() {
                            if (this._isFinished) {
                                return Promise.resolve({ value: undefined, done: true });
                            }
                            const reader = this._reader;
                            if (reader._ownerReadableStream === undefined) {
                                return promiseRejectedWith(readerLockException('iterate'));
                            }
                            let resolvePromise;
                            let rejectPromise;
                            const promise = newPromise((resolve, reject) => {
                                resolvePromise = resolve;
                                rejectPromise = reject;
                            });
                            const readRequest = {
                                _chunkSteps: chunk => {
                                    this._ongoingPromise = undefined;
                                    // This needs to be delayed by one microtask, otherwise we stop pulling too early which breaks a test.
                                    // FIXME Is this a bug in the specification, or in the test?
                                    queueMicrotask(() => resolvePromise({ value: chunk, done: false }));
                                },
                                _closeSteps: () => {
                                    this._ongoingPromise = undefined;
                                    this._isFinished = true;
                                    ReadableStreamReaderGenericRelease(reader);
                                    resolvePromise({ value: undefined, done: true });
                                },
                                _errorSteps: reason => {
                                    this._ongoingPromise = undefined;
                                    this._isFinished = true;
                                    ReadableStreamReaderGenericRelease(reader);
                                    rejectPromise(reason);
                                }
                            };
                            ReadableStreamDefaultReaderRead(reader, readRequest);
                            return promise;
                        }
                        _returnSteps(value) {
                            if (this._isFinished) {
                                return Promise.resolve({ value, done: true });
                            }
                            this._isFinished = true;
                            const reader = this._reader;
                            if (reader._ownerReadableStream === undefined) {
                                return promiseRejectedWith(readerLockException('finish iterating'));
                            }
                            if (!this._preventCancel) {
                                const result = ReadableStreamReaderGenericCancel(reader, value);
                                ReadableStreamReaderGenericRelease(reader);
                                return transformPromiseWith(result, () => ({ value, done: true }));
                            }
                            ReadableStreamReaderGenericRelease(reader);
                            return promiseResolvedWith({ value, done: true });
                        }
                    }
                    const ReadableStreamAsyncIteratorPrototype = {
                        next() {
                            if (!IsReadableStreamAsyncIterator(this)) {
                                return promiseRejectedWith(streamAsyncIteratorBrandCheckException('next'));
                            }
                            return this._asyncIteratorImpl.next();
                        },
                        return(value) {
                            if (!IsReadableStreamAsyncIterator(this)) {
                                return promiseRejectedWith(streamAsyncIteratorBrandCheckException('return'));
                            }
                            return this._asyncIteratorImpl.return(value);
                        }
                    };
                    if (AsyncIteratorPrototype !== undefined) {
                        Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
                    }
                    // Abstract operations for the ReadableStream.
                    function AcquireReadableStreamAsyncIterator(stream, preventCancel) {
                        const reader = AcquireReadableStreamDefaultReader(stream);
                        const impl = new ReadableStreamAsyncIteratorImpl(reader, preventCancel);
                        const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
                        iterator._asyncIteratorImpl = impl;
                        return iterator;
                    }
                    function IsReadableStreamAsyncIterator(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_asyncIteratorImpl')) {
                            return false;
                        }
                        try {
                            // noinspection SuspiciousTypeOfGuard
                            return x._asyncIteratorImpl instanceof
                                ReadableStreamAsyncIteratorImpl;
                        }
                        catch (_a) {
                            return false;
                        }
                    }
                    // Helper functions for the ReadableStream.
                    function streamAsyncIteratorBrandCheckException(name) {
                        return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
                    }

                    /// <reference lib="es2015.core" />
                    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN#Polyfill
                    const NumberIsNaN = Number.isNaN || function (x) {
                        // eslint-disable-next-line no-self-compare
                        return x !== x;
                    };

                    function CreateArrayFromList(elements) {
                        // We use arrays to represent lists, so this is basically a no-op.
                        // Do a slice though just in case we happen to depend on the unique-ness.
                        return elements.slice();
                    }
                    function CopyDataBlockBytes(dest, destOffset, src, srcOffset, n) {
                        new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
                    }
                    // Not implemented correctly
                    function TransferArrayBuffer(O) {
                        return O;
                    }
                    // Not implemented correctly
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    function IsDetachedBuffer(O) {
                        return false;
                    }
                    function ArrayBufferSlice(buffer, begin, end) {
                        // ArrayBuffer.prototype.slice is not available on IE10
                        // https://www.caniuse.com/mdn-javascript_builtins_arraybuffer_slice
                        if (buffer.slice) {
                            return buffer.slice(begin, end);
                        }
                        const length = end - begin;
                        const slice = new ArrayBuffer(length);
                        CopyDataBlockBytes(slice, 0, buffer, begin, length);
                        return slice;
                    }

                    function IsNonNegativeNumber(v) {
                        if (typeof v !== 'number') {
                            return false;
                        }
                        if (NumberIsNaN(v)) {
                            return false;
                        }
                        if (v < 0) {
                            return false;
                        }
                        return true;
                    }
                    function CloneAsUint8Array(O) {
                        const buffer = ArrayBufferSlice(O.buffer, O.byteOffset, O.byteOffset + O.byteLength);
                        return new Uint8Array(buffer);
                    }

                    function DequeueValue(container) {
                        const pair = container._queue.shift();
                        container._queueTotalSize -= pair.size;
                        if (container._queueTotalSize < 0) {
                            container._queueTotalSize = 0;
                        }
                        return pair.value;
                    }
                    function EnqueueValueWithSize(container, value, size) {
                        if (!IsNonNegativeNumber(size) || size === Infinity) {
                            throw new RangeError('Size must be a finite, non-NaN, non-negative number.');
                        }
                        container._queue.push({ value, size });
                        container._queueTotalSize += size;
                    }
                    function PeekQueueValue(container) {
                        const pair = container._queue.peek();
                        return pair.value;
                    }
                    function ResetQueue(container) {
                        container._queue = new SimpleQueue();
                        container._queueTotalSize = 0;
                    }

                    /**
                     * A pull-into request in a {@link ReadableByteStreamController}.
                     *
                     * @public
                     */
                    class ReadableStreamBYOBRequest {
                        constructor() {
                            throw new TypeError('Illegal constructor');
                        }
                        /**
                         * Returns the view for writing in to, or `null` if the BYOB request has already been responded to.
                         */
                        get view() {
                            if (!IsReadableStreamBYOBRequest(this)) {
                                throw byobRequestBrandCheckException('view');
                            }
                            return this._view;
                        }
                        respond(bytesWritten) {
                            if (!IsReadableStreamBYOBRequest(this)) {
                                throw byobRequestBrandCheckException('respond');
                            }
                            assertRequiredArgument(bytesWritten, 1, 'respond');
                            bytesWritten = convertUnsignedLongLongWithEnforceRange(bytesWritten, 'First parameter');
                            if (this._associatedReadableByteStreamController === undefined) {
                                throw new TypeError('This BYOB request has been invalidated');
                            }
                            if (IsDetachedBuffer(this._view.buffer));
                            ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
                        }
                        respondWithNewView(view) {
                            if (!IsReadableStreamBYOBRequest(this)) {
                                throw byobRequestBrandCheckException('respondWithNewView');
                            }
                            assertRequiredArgument(view, 1, 'respondWithNewView');
                            if (!ArrayBuffer.isView(view)) {
                                throw new TypeError('You can only respond with array buffer views');
                            }
                            if (this._associatedReadableByteStreamController === undefined) {
                                throw new TypeError('This BYOB request has been invalidated');
                            }
                            if (IsDetachedBuffer(view.buffer));
                            ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
                        }
                    }
                    Object.defineProperties(ReadableStreamBYOBRequest.prototype, {
                        respond: { enumerable: true },
                        respondWithNewView: { enumerable: true },
                        view: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(ReadableStreamBYOBRequest.prototype, SymbolPolyfill.toStringTag, {
                            value: 'ReadableStreamBYOBRequest',
                            configurable: true
                        });
                    }
                    /**
                     * Allows control of a {@link ReadableStream | readable byte stream}'s state and internal queue.
                     *
                     * @public
                     */
                    class ReadableByteStreamController {
                        constructor() {
                            throw new TypeError('Illegal constructor');
                        }
                        /**
                         * Returns the current BYOB pull request, or `null` if there isn't one.
                         */
                        get byobRequest() {
                            if (!IsReadableByteStreamController(this)) {
                                throw byteStreamControllerBrandCheckException('byobRequest');
                            }
                            return ReadableByteStreamControllerGetBYOBRequest(this);
                        }
                        /**
                         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
                         * over-full. An underlying byte source ought to use this information to determine when and how to apply backpressure.
                         */
                        get desiredSize() {
                            if (!IsReadableByteStreamController(this)) {
                                throw byteStreamControllerBrandCheckException('desiredSize');
                            }
                            return ReadableByteStreamControllerGetDesiredSize(this);
                        }
                        /**
                         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
                         * the stream, but once those are read, the stream will become closed.
                         */
                        close() {
                            if (!IsReadableByteStreamController(this)) {
                                throw byteStreamControllerBrandCheckException('close');
                            }
                            if (this._closeRequested) {
                                throw new TypeError('The stream has already been closed; do not close it again!');
                            }
                            const state = this._controlledReadableByteStream._state;
                            if (state !== 'readable') {
                                throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
                            }
                            ReadableByteStreamControllerClose(this);
                        }
                        enqueue(chunk) {
                            if (!IsReadableByteStreamController(this)) {
                                throw byteStreamControllerBrandCheckException('enqueue');
                            }
                            assertRequiredArgument(chunk, 1, 'enqueue');
                            if (!ArrayBuffer.isView(chunk)) {
                                throw new TypeError('chunk must be an array buffer view');
                            }
                            if (chunk.byteLength === 0) {
                                throw new TypeError('chunk must have non-zero byteLength');
                            }
                            if (chunk.buffer.byteLength === 0) {
                                throw new TypeError(`chunk's buffer must have non-zero byteLength`);
                            }
                            if (this._closeRequested) {
                                throw new TypeError('stream is closed or draining');
                            }
                            const state = this._controlledReadableByteStream._state;
                            if (state !== 'readable') {
                                throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
                            }
                            ReadableByteStreamControllerEnqueue(this, chunk);
                        }
                        /**
                         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
                         */
                        error(e = undefined) {
                            if (!IsReadableByteStreamController(this)) {
                                throw byteStreamControllerBrandCheckException('error');
                            }
                            ReadableByteStreamControllerError(this, e);
                        }
                        /** @internal */
                        [CancelSteps](reason) {
                            ReadableByteStreamControllerClearPendingPullIntos(this);
                            ResetQueue(this);
                            const result = this._cancelAlgorithm(reason);
                            ReadableByteStreamControllerClearAlgorithms(this);
                            return result;
                        }
                        /** @internal */
                        [PullSteps](readRequest) {
                            const stream = this._controlledReadableByteStream;
                            if (this._queueTotalSize > 0) {
                                const entry = this._queue.shift();
                                this._queueTotalSize -= entry.byteLength;
                                ReadableByteStreamControllerHandleQueueDrain(this);
                                const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
                                readRequest._chunkSteps(view);
                                return;
                            }
                            const autoAllocateChunkSize = this._autoAllocateChunkSize;
                            if (autoAllocateChunkSize !== undefined) {
                                let buffer;
                                try {
                                    buffer = new ArrayBuffer(autoAllocateChunkSize);
                                }
                                catch (bufferE) {
                                    readRequest._errorSteps(bufferE);
                                    return;
                                }
                                const pullIntoDescriptor = {
                                    buffer,
                                    bufferByteLength: autoAllocateChunkSize,
                                    byteOffset: 0,
                                    byteLength: autoAllocateChunkSize,
                                    bytesFilled: 0,
                                    elementSize: 1,
                                    viewConstructor: Uint8Array,
                                    readerType: 'default'
                                };
                                this._pendingPullIntos.push(pullIntoDescriptor);
                            }
                            ReadableStreamAddReadRequest(stream, readRequest);
                            ReadableByteStreamControllerCallPullIfNeeded(this);
                        }
                    }
                    Object.defineProperties(ReadableByteStreamController.prototype, {
                        close: { enumerable: true },
                        enqueue: { enumerable: true },
                        error: { enumerable: true },
                        byobRequest: { enumerable: true },
                        desiredSize: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(ReadableByteStreamController.prototype, SymbolPolyfill.toStringTag, {
                            value: 'ReadableByteStreamController',
                            configurable: true
                        });
                    }
                    // Abstract operations for the ReadableByteStreamController.
                    function IsReadableByteStreamController(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableByteStream')) {
                            return false;
                        }
                        return x instanceof ReadableByteStreamController;
                    }
                    function IsReadableStreamBYOBRequest(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_associatedReadableByteStreamController')) {
                            return false;
                        }
                        return x instanceof ReadableStreamBYOBRequest;
                    }
                    function ReadableByteStreamControllerCallPullIfNeeded(controller) {
                        const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
                        if (!shouldPull) {
                            return;
                        }
                        if (controller._pulling) {
                            controller._pullAgain = true;
                            return;
                        }
                        controller._pulling = true;
                        // TODO: Test controller argument
                        const pullPromise = controller._pullAlgorithm();
                        uponPromise(pullPromise, () => {
                            controller._pulling = false;
                            if (controller._pullAgain) {
                                controller._pullAgain = false;
                                ReadableByteStreamControllerCallPullIfNeeded(controller);
                            }
                        }, e => {
                            ReadableByteStreamControllerError(controller, e);
                        });
                    }
                    function ReadableByteStreamControllerClearPendingPullIntos(controller) {
                        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
                        controller._pendingPullIntos = new SimpleQueue();
                    }
                    function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
                        let done = false;
                        if (stream._state === 'closed') {
                            done = true;
                        }
                        const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
                        if (pullIntoDescriptor.readerType === 'default') {
                            ReadableStreamFulfillReadRequest(stream, filledView, done);
                        }
                        else {
                            ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
                        }
                    }
                    function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
                        const bytesFilled = pullIntoDescriptor.bytesFilled;
                        const elementSize = pullIntoDescriptor.elementSize;
                        return new pullIntoDescriptor.viewConstructor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
                    }
                    function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
                        controller._queue.push({ buffer, byteOffset, byteLength });
                        controller._queueTotalSize += byteLength;
                    }
                    function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
                        const elementSize = pullIntoDescriptor.elementSize;
                        const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
                        const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
                        const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
                        const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
                        let totalBytesToCopyRemaining = maxBytesToCopy;
                        let ready = false;
                        if (maxAlignedBytes > currentAlignedBytes) {
                            totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
                            ready = true;
                        }
                        const queue = controller._queue;
                        while (totalBytesToCopyRemaining > 0) {
                            const headOfQueue = queue.peek();
                            const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
                            const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
                            CopyDataBlockBytes(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
                            if (headOfQueue.byteLength === bytesToCopy) {
                                queue.shift();
                            }
                            else {
                                headOfQueue.byteOffset += bytesToCopy;
                                headOfQueue.byteLength -= bytesToCopy;
                            }
                            controller._queueTotalSize -= bytesToCopy;
                            ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
                            totalBytesToCopyRemaining -= bytesToCopy;
                        }
                        return ready;
                    }
                    function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
                        pullIntoDescriptor.bytesFilled += size;
                    }
                    function ReadableByteStreamControllerHandleQueueDrain(controller) {
                        if (controller._queueTotalSize === 0 && controller._closeRequested) {
                            ReadableByteStreamControllerClearAlgorithms(controller);
                            ReadableStreamClose(controller._controlledReadableByteStream);
                        }
                        else {
                            ReadableByteStreamControllerCallPullIfNeeded(controller);
                        }
                    }
                    function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
                        if (controller._byobRequest === null) {
                            return;
                        }
                        controller._byobRequest._associatedReadableByteStreamController = undefined;
                        controller._byobRequest._view = null;
                        controller._byobRequest = null;
                    }
                    function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
                        while (controller._pendingPullIntos.length > 0) {
                            if (controller._queueTotalSize === 0) {
                                return;
                            }
                            const pullIntoDescriptor = controller._pendingPullIntos.peek();
                            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
                                ReadableByteStreamControllerShiftPendingPullInto(controller);
                                ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
                            }
                        }
                    }
                    function ReadableByteStreamControllerPullInto(controller, view, readIntoRequest) {
                        const stream = controller._controlledReadableByteStream;
                        let elementSize = 1;
                        if (view.constructor !== DataView) {
                            elementSize = view.constructor.BYTES_PER_ELEMENT;
                        }
                        const ctor = view.constructor;
                        // try {
                        const buffer = TransferArrayBuffer(view.buffer);
                        // } catch (e) {
                        //   readIntoRequest._errorSteps(e);
                        //   return;
                        // }
                        const pullIntoDescriptor = {
                            buffer,
                            bufferByteLength: buffer.byteLength,
                            byteOffset: view.byteOffset,
                            byteLength: view.byteLength,
                            bytesFilled: 0,
                            elementSize,
                            viewConstructor: ctor,
                            readerType: 'byob'
                        };
                        if (controller._pendingPullIntos.length > 0) {
                            controller._pendingPullIntos.push(pullIntoDescriptor);
                            // No ReadableByteStreamControllerCallPullIfNeeded() call since:
                            // - No change happens on desiredSize
                            // - The source has already been notified of that there's at least 1 pending read(view)
                            ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
                            return;
                        }
                        if (stream._state === 'closed') {
                            const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
                            readIntoRequest._closeSteps(emptyView);
                            return;
                        }
                        if (controller._queueTotalSize > 0) {
                            if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
                                const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
                                ReadableByteStreamControllerHandleQueueDrain(controller);
                                readIntoRequest._chunkSteps(filledView);
                                return;
                            }
                            if (controller._closeRequested) {
                                const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
                                ReadableByteStreamControllerError(controller, e);
                                readIntoRequest._errorSteps(e);
                                return;
                            }
                        }
                        controller._pendingPullIntos.push(pullIntoDescriptor);
                        ReadableStreamAddReadIntoRequest(stream, readIntoRequest);
                        ReadableByteStreamControllerCallPullIfNeeded(controller);
                    }
                    function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
                        const stream = controller._controlledReadableByteStream;
                        if (ReadableStreamHasBYOBReader(stream)) {
                            while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
                                const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
                                ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
                            }
                        }
                    }
                    function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
                        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
                        if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
                            return;
                        }
                        ReadableByteStreamControllerShiftPendingPullInto(controller);
                        const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
                        if (remainderSize > 0) {
                            const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
                            const remainder = ArrayBufferSlice(pullIntoDescriptor.buffer, end - remainderSize, end);
                            ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
                        }
                        pullIntoDescriptor.bytesFilled -= remainderSize;
                        ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
                        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
                    }
                    function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
                        const firstDescriptor = controller._pendingPullIntos.peek();
                        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
                        const state = controller._controlledReadableByteStream._state;
                        if (state === 'closed') {
                            ReadableByteStreamControllerRespondInClosedState(controller);
                        }
                        else {
                            ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
                        }
                        ReadableByteStreamControllerCallPullIfNeeded(controller);
                    }
                    function ReadableByteStreamControllerShiftPendingPullInto(controller) {
                        const descriptor = controller._pendingPullIntos.shift();
                        return descriptor;
                    }
                    function ReadableByteStreamControllerShouldCallPull(controller) {
                        const stream = controller._controlledReadableByteStream;
                        if (stream._state !== 'readable') {
                            return false;
                        }
                        if (controller._closeRequested) {
                            return false;
                        }
                        if (!controller._started) {
                            return false;
                        }
                        if (ReadableStreamHasDefaultReader(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
                            return true;
                        }
                        if (ReadableStreamHasBYOBReader(stream) && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
                            return true;
                        }
                        const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
                        if (desiredSize > 0) {
                            return true;
                        }
                        return false;
                    }
                    function ReadableByteStreamControllerClearAlgorithms(controller) {
                        controller._pullAlgorithm = undefined;
                        controller._cancelAlgorithm = undefined;
                    }
                    // A client of ReadableByteStreamController may use these functions directly to bypass state check.
                    function ReadableByteStreamControllerClose(controller) {
                        const stream = controller._controlledReadableByteStream;
                        if (controller._closeRequested || stream._state !== 'readable') {
                            return;
                        }
                        if (controller._queueTotalSize > 0) {
                            controller._closeRequested = true;
                            return;
                        }
                        if (controller._pendingPullIntos.length > 0) {
                            const firstPendingPullInto = controller._pendingPullIntos.peek();
                            if (firstPendingPullInto.bytesFilled > 0) {
                                const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
                                ReadableByteStreamControllerError(controller, e);
                                throw e;
                            }
                        }
                        ReadableByteStreamControllerClearAlgorithms(controller);
                        ReadableStreamClose(stream);
                    }
                    function ReadableByteStreamControllerEnqueue(controller, chunk) {
                        const stream = controller._controlledReadableByteStream;
                        if (controller._closeRequested || stream._state !== 'readable') {
                            return;
                        }
                        const buffer = chunk.buffer;
                        const byteOffset = chunk.byteOffset;
                        const byteLength = chunk.byteLength;
                        const transferredBuffer = TransferArrayBuffer(buffer);
                        if (controller._pendingPullIntos.length > 0) {
                            const firstPendingPullInto = controller._pendingPullIntos.peek();
                            if (IsDetachedBuffer(firstPendingPullInto.buffer));
                            firstPendingPullInto.buffer = TransferArrayBuffer(firstPendingPullInto.buffer);
                        }
                        ReadableByteStreamControllerInvalidateBYOBRequest(controller);
                        if (ReadableStreamHasDefaultReader(stream)) {
                            if (ReadableStreamGetNumReadRequests(stream) === 0) {
                                ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
                            }
                            else {
                                if (controller._pendingPullIntos.length > 0) {
                                    ReadableByteStreamControllerShiftPendingPullInto(controller);
                                }
                                const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
                                ReadableStreamFulfillReadRequest(stream, transferredView, false);
                            }
                        }
                        else if (ReadableStreamHasBYOBReader(stream)) {
                            // TODO: Ideally in this branch detaching should happen only if the buffer is not consumed fully.
                            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
                            ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
                        }
                        else {
                            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
                        }
                        ReadableByteStreamControllerCallPullIfNeeded(controller);
                    }
                    function ReadableByteStreamControllerError(controller, e) {
                        const stream = controller._controlledReadableByteStream;
                        if (stream._state !== 'readable') {
                            return;
                        }
                        ReadableByteStreamControllerClearPendingPullIntos(controller);
                        ResetQueue(controller);
                        ReadableByteStreamControllerClearAlgorithms(controller);
                        ReadableStreamError(stream, e);
                    }
                    function ReadableByteStreamControllerGetBYOBRequest(controller) {
                        if (controller._byobRequest === null && controller._pendingPullIntos.length > 0) {
                            const firstDescriptor = controller._pendingPullIntos.peek();
                            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
                            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
                            SetUpReadableStreamBYOBRequest(byobRequest, controller, view);
                            controller._byobRequest = byobRequest;
                        }
                        return controller._byobRequest;
                    }
                    function ReadableByteStreamControllerGetDesiredSize(controller) {
                        const state = controller._controlledReadableByteStream._state;
                        if (state === 'errored') {
                            return null;
                        }
                        if (state === 'closed') {
                            return 0;
                        }
                        return controller._strategyHWM - controller._queueTotalSize;
                    }
                    function ReadableByteStreamControllerRespond(controller, bytesWritten) {
                        const firstDescriptor = controller._pendingPullIntos.peek();
                        const state = controller._controlledReadableByteStream._state;
                        if (state === 'closed') {
                            if (bytesWritten !== 0) {
                                throw new TypeError('bytesWritten must be 0 when calling respond() on a closed stream');
                            }
                        }
                        else {
                            if (bytesWritten === 0) {
                                throw new TypeError('bytesWritten must be greater than 0 when calling respond() on a readable stream');
                            }
                            if (firstDescriptor.bytesFilled + bytesWritten > firstDescriptor.byteLength) {
                                throw new RangeError('bytesWritten out of range');
                            }
                        }
                        firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
                        ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
                    }
                    function ReadableByteStreamControllerRespondWithNewView(controller, view) {
                        const firstDescriptor = controller._pendingPullIntos.peek();
                        const state = controller._controlledReadableByteStream._state;
                        if (state === 'closed') {
                            if (view.byteLength !== 0) {
                                throw new TypeError('The view\'s length must be 0 when calling respondWithNewView() on a closed stream');
                            }
                        }
                        else {
                            if (view.byteLength === 0) {
                                throw new TypeError('The view\'s length must be greater than 0 when calling respondWithNewView() on a readable stream');
                            }
                        }
                        if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
                            throw new RangeError('The region specified by view does not match byobRequest');
                        }
                        if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
                            throw new RangeError('The buffer of view has different capacity than byobRequest');
                        }
                        if (firstDescriptor.bytesFilled + view.byteLength > firstDescriptor.byteLength) {
                            throw new RangeError('The region specified by view is larger than byobRequest');
                        }
                        const viewByteLength = view.byteLength;
                        firstDescriptor.buffer = TransferArrayBuffer(view.buffer);
                        ReadableByteStreamControllerRespondInternal(controller, viewByteLength);
                    }
                    function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
                        controller._controlledReadableByteStream = stream;
                        controller._pullAgain = false;
                        controller._pulling = false;
                        controller._byobRequest = null;
                        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
                        controller._queue = controller._queueTotalSize = undefined;
                        ResetQueue(controller);
                        controller._closeRequested = false;
                        controller._started = false;
                        controller._strategyHWM = highWaterMark;
                        controller._pullAlgorithm = pullAlgorithm;
                        controller._cancelAlgorithm = cancelAlgorithm;
                        controller._autoAllocateChunkSize = autoAllocateChunkSize;
                        controller._pendingPullIntos = new SimpleQueue();
                        stream._readableStreamController = controller;
                        const startResult = startAlgorithm();
                        uponPromise(promiseResolvedWith(startResult), () => {
                            controller._started = true;
                            ReadableByteStreamControllerCallPullIfNeeded(controller);
                        }, r => {
                            ReadableByteStreamControllerError(controller, r);
                        });
                    }
                    function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
                        const controller = Object.create(ReadableByteStreamController.prototype);
                        let startAlgorithm = () => undefined;
                        let pullAlgorithm = () => promiseResolvedWith(undefined);
                        let cancelAlgorithm = () => promiseResolvedWith(undefined);
                        if (underlyingByteSource.start !== undefined) {
                            startAlgorithm = () => underlyingByteSource.start(controller);
                        }
                        if (underlyingByteSource.pull !== undefined) {
                            pullAlgorithm = () => underlyingByteSource.pull(controller);
                        }
                        if (underlyingByteSource.cancel !== undefined) {
                            cancelAlgorithm = reason => underlyingByteSource.cancel(reason);
                        }
                        const autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
                        if (autoAllocateChunkSize === 0) {
                            throw new TypeError('autoAllocateChunkSize must be greater than 0');
                        }
                        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
                    }
                    function SetUpReadableStreamBYOBRequest(request, controller, view) {
                        request._associatedReadableByteStreamController = controller;
                        request._view = view;
                    }
                    // Helper functions for the ReadableStreamBYOBRequest.
                    function byobRequestBrandCheckException(name) {
                        return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
                    }
                    // Helper functions for the ReadableByteStreamController.
                    function byteStreamControllerBrandCheckException(name) {
                        return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
                    }

                    // Abstract operations for the ReadableStream.
                    function AcquireReadableStreamBYOBReader(stream) {
                        return new ReadableStreamBYOBReader(stream);
                    }
                    // ReadableStream API exposed for controllers.
                    function ReadableStreamAddReadIntoRequest(stream, readIntoRequest) {
                        stream._reader._readIntoRequests.push(readIntoRequest);
                    }
                    function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
                        const reader = stream._reader;
                        const readIntoRequest = reader._readIntoRequests.shift();
                        if (done) {
                            readIntoRequest._closeSteps(chunk);
                        }
                        else {
                            readIntoRequest._chunkSteps(chunk);
                        }
                    }
                    function ReadableStreamGetNumReadIntoRequests(stream) {
                        return stream._reader._readIntoRequests.length;
                    }
                    function ReadableStreamHasBYOBReader(stream) {
                        const reader = stream._reader;
                        if (reader === undefined) {
                            return false;
                        }
                        if (!IsReadableStreamBYOBReader(reader)) {
                            return false;
                        }
                        return true;
                    }
                    /**
                     * A BYOB reader vended by a {@link ReadableStream}.
                     *
                     * @public
                     */
                    class ReadableStreamBYOBReader {
                        constructor(stream) {
                            assertRequiredArgument(stream, 1, 'ReadableStreamBYOBReader');
                            assertReadableStream(stream, 'First parameter');
                            if (IsReadableStreamLocked(stream)) {
                                throw new TypeError('This stream has already been locked for exclusive reading by another reader');
                            }
                            if (!IsReadableByteStreamController(stream._readableStreamController)) {
                                throw new TypeError('Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte ' +
                                    'source');
                            }
                            ReadableStreamReaderGenericInitialize(this, stream);
                            this._readIntoRequests = new SimpleQueue();
                        }
                        /**
                         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
                         * the reader's lock is released before the stream finishes closing.
                         */
                        get closed() {
                            if (!IsReadableStreamBYOBReader(this)) {
                                return promiseRejectedWith(byobReaderBrandCheckException('closed'));
                            }
                            return this._closedPromise;
                        }
                        /**
                         * If the reader is active, behaves the same as {@link ReadableStream.cancel | stream.cancel(reason)}.
                         */
                        cancel(reason = undefined) {
                            if (!IsReadableStreamBYOBReader(this)) {
                                return promiseRejectedWith(byobReaderBrandCheckException('cancel'));
                            }
                            if (this._ownerReadableStream === undefined) {
                                return promiseRejectedWith(readerLockException('cancel'));
                            }
                            return ReadableStreamReaderGenericCancel(this, reason);
                        }
                        /**
                         * Attempts to reads bytes into view, and returns a promise resolved with the result.
                         *
                         * If reading a chunk causes the queue to become empty, more data will be pulled from the underlying source.
                         */
                        read(view) {
                            if (!IsReadableStreamBYOBReader(this)) {
                                return promiseRejectedWith(byobReaderBrandCheckException('read'));
                            }
                            if (!ArrayBuffer.isView(view)) {
                                return promiseRejectedWith(new TypeError('view must be an array buffer view'));
                            }
                            if (view.byteLength === 0) {
                                return promiseRejectedWith(new TypeError('view must have non-zero byteLength'));
                            }
                            if (view.buffer.byteLength === 0) {
                                return promiseRejectedWith(new TypeError(`view's buffer must have non-zero byteLength`));
                            }
                            if (IsDetachedBuffer(view.buffer));
                            if (this._ownerReadableStream === undefined) {
                                return promiseRejectedWith(readerLockException('read from'));
                            }
                            let resolvePromise;
                            let rejectPromise;
                            const promise = newPromise((resolve, reject) => {
                                resolvePromise = resolve;
                                rejectPromise = reject;
                            });
                            const readIntoRequest = {
                                _chunkSteps: chunk => resolvePromise({ value: chunk, done: false }),
                                _closeSteps: chunk => resolvePromise({ value: chunk, done: true }),
                                _errorSteps: e => rejectPromise(e)
                            };
                            ReadableStreamBYOBReaderRead(this, view, readIntoRequest);
                            return promise;
                        }
                        /**
                         * Releases the reader's lock on the corresponding stream. After the lock is released, the reader is no longer active.
                         * If the associated stream is errored when the lock is released, the reader will appear errored in the same way
                         * from now on; otherwise, the reader will appear closed.
                         *
                         * A reader's lock cannot be released while it still has a pending read request, i.e., if a promise returned by
                         * the reader's {@link ReadableStreamBYOBReader.read | read()} method has not yet been settled. Attempting to
                         * do so will throw a `TypeError` and leave the reader locked to the stream.
                         */
                        releaseLock() {
                            if (!IsReadableStreamBYOBReader(this)) {
                                throw byobReaderBrandCheckException('releaseLock');
                            }
                            if (this._ownerReadableStream === undefined) {
                                return;
                            }
                            if (this._readIntoRequests.length > 0) {
                                throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
                            }
                            ReadableStreamReaderGenericRelease(this);
                        }
                    }
                    Object.defineProperties(ReadableStreamBYOBReader.prototype, {
                        cancel: { enumerable: true },
                        read: { enumerable: true },
                        releaseLock: { enumerable: true },
                        closed: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(ReadableStreamBYOBReader.prototype, SymbolPolyfill.toStringTag, {
                            value: 'ReadableStreamBYOBReader',
                            configurable: true
                        });
                    }
                    // Abstract operations for the readers.
                    function IsReadableStreamBYOBReader(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_readIntoRequests')) {
                            return false;
                        }
                        return x instanceof ReadableStreamBYOBReader;
                    }
                    function ReadableStreamBYOBReaderRead(reader, view, readIntoRequest) {
                        const stream = reader._ownerReadableStream;
                        stream._disturbed = true;
                        if (stream._state === 'errored') {
                            readIntoRequest._errorSteps(stream._storedError);
                        }
                        else {
                            ReadableByteStreamControllerPullInto(stream._readableStreamController, view, readIntoRequest);
                        }
                    }
                    // Helper functions for the ReadableStreamBYOBReader.
                    function byobReaderBrandCheckException(name) {
                        return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
                    }

                    function ExtractHighWaterMark(strategy, defaultHWM) {
                        const { highWaterMark } = strategy;
                        if (highWaterMark === undefined) {
                            return defaultHWM;
                        }
                        if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
                            throw new RangeError('Invalid highWaterMark');
                        }
                        return highWaterMark;
                    }
                    function ExtractSizeAlgorithm(strategy) {
                        const { size } = strategy;
                        if (!size) {
                            return () => 1;
                        }
                        return size;
                    }

                    function convertQueuingStrategy(init, context) {
                        assertDictionary(init, context);
                        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
                        const size = init === null || init === void 0 ? void 0 : init.size;
                        return {
                            highWaterMark: highWaterMark === undefined ? undefined : convertUnrestrictedDouble(highWaterMark),
                            size: size === undefined ? undefined : convertQueuingStrategySize(size, `${context} has member 'size' that`)
                        };
                    }
                    function convertQueuingStrategySize(fn, context) {
                        assertFunction(fn, context);
                        return chunk => convertUnrestrictedDouble(fn(chunk));
                    }

                    function convertUnderlyingSink(original, context) {
                        assertDictionary(original, context);
                        const abort = original === null || original === void 0 ? void 0 : original.abort;
                        const close = original === null || original === void 0 ? void 0 : original.close;
                        const start = original === null || original === void 0 ? void 0 : original.start;
                        const type = original === null || original === void 0 ? void 0 : original.type;
                        const write = original === null || original === void 0 ? void 0 : original.write;
                        return {
                            abort: abort === undefined ?
                                undefined :
                                convertUnderlyingSinkAbortCallback(abort, original, `${context} has member 'abort' that`),
                            close: close === undefined ?
                                undefined :
                                convertUnderlyingSinkCloseCallback(close, original, `${context} has member 'close' that`),
                            start: start === undefined ?
                                undefined :
                                convertUnderlyingSinkStartCallback(start, original, `${context} has member 'start' that`),
                            write: write === undefined ?
                                undefined :
                                convertUnderlyingSinkWriteCallback(write, original, `${context} has member 'write' that`),
                            type
                        };
                    }
                    function convertUnderlyingSinkAbortCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (reason) => promiseCall(fn, original, [reason]);
                    }
                    function convertUnderlyingSinkCloseCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return () => promiseCall(fn, original, []);
                    }
                    function convertUnderlyingSinkStartCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (controller) => reflectCall(fn, original, [controller]);
                    }
                    function convertUnderlyingSinkWriteCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
                    }

                    function assertWritableStream(x, context) {
                        if (!IsWritableStream(x)) {
                            throw new TypeError(`${context} is not a WritableStream.`);
                        }
                    }

                    function isAbortSignal(value) {
                        if (typeof value !== 'object' || value === null) {
                            return false;
                        }
                        try {
                            return typeof value.aborted === 'boolean';
                        }
                        catch (_a) {
                            // AbortSignal.prototype.aborted throws if its brand check fails
                            return false;
                        }
                    }
                    const supportsAbortController = typeof AbortController === 'function';
                    /**
                     * Construct a new AbortController, if supported by the platform.
                     *
                     * @internal
                     */
                    function createAbortController() {
                        if (supportsAbortController) {
                            return new AbortController();
                        }
                        return undefined;
                    }

                    /**
                     * A writable stream represents a destination for data, into which you can write.
                     *
                     * @public
                     */
                    class WritableStream {
                        constructor(rawUnderlyingSink = {}, rawStrategy = {}) {
                            if (rawUnderlyingSink === undefined) {
                                rawUnderlyingSink = null;
                            }
                            else {
                                assertObject(rawUnderlyingSink, 'First parameter');
                            }
                            const strategy = convertQueuingStrategy(rawStrategy, 'Second parameter');
                            const underlyingSink = convertUnderlyingSink(rawUnderlyingSink, 'First parameter');
                            InitializeWritableStream(this);
                            const type = underlyingSink.type;
                            if (type !== undefined) {
                                throw new RangeError('Invalid type is specified');
                            }
                            const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
                            const highWaterMark = ExtractHighWaterMark(strategy, 1);
                            SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
                        }
                        /**
                         * Returns whether or not the writable stream is locked to a writer.
                         */
                        get locked() {
                            if (!IsWritableStream(this)) {
                                throw streamBrandCheckException$2('locked');
                            }
                            return IsWritableStreamLocked(this);
                        }
                        /**
                         * Aborts the stream, signaling that the producer can no longer successfully write to the stream and it is to be
                         * immediately moved to an errored state, with any queued-up writes discarded. This will also execute any abort
                         * mechanism of the underlying sink.
                         *
                         * The returned promise will fulfill if the stream shuts down successfully, or reject if the underlying sink signaled
                         * that there was an error doing so. Additionally, it will reject with a `TypeError` (without attempting to cancel
                         * the stream) if the stream is currently locked.
                         */
                        abort(reason = undefined) {
                            if (!IsWritableStream(this)) {
                                return promiseRejectedWith(streamBrandCheckException$2('abort'));
                            }
                            if (IsWritableStreamLocked(this)) {
                                return promiseRejectedWith(new TypeError('Cannot abort a stream that already has a writer'));
                            }
                            return WritableStreamAbort(this, reason);
                        }
                        /**
                         * Closes the stream. The underlying sink will finish processing any previously-written chunks, before invoking its
                         * close behavior. During this time any further attempts to write will fail (without erroring the stream).
                         *
                         * The method returns a promise that will fulfill if all remaining chunks are successfully written and the stream
                         * successfully closes, or rejects if an error is encountered during this process. Additionally, it will reject with
                         * a `TypeError` (without attempting to cancel the stream) if the stream is currently locked.
                         */
                        close() {
                            if (!IsWritableStream(this)) {
                                return promiseRejectedWith(streamBrandCheckException$2('close'));
                            }
                            if (IsWritableStreamLocked(this)) {
                                return promiseRejectedWith(new TypeError('Cannot close a stream that already has a writer'));
                            }
                            if (WritableStreamCloseQueuedOrInFlight(this)) {
                                return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
                            }
                            return WritableStreamClose(this);
                        }
                        /**
                         * Creates a {@link WritableStreamDefaultWriter | writer} and locks the stream to the new writer. While the stream
                         * is locked, no other writer can be acquired until this one is released.
                         *
                         * This functionality is especially useful for creating abstractions that desire the ability to write to a stream
                         * without interruption or interleaving. By getting a writer for the stream, you can ensure nobody else can write at
                         * the same time, which would cause the resulting written data to be unpredictable and probably useless.
                         */
                        getWriter() {
                            if (!IsWritableStream(this)) {
                                throw streamBrandCheckException$2('getWriter');
                            }
                            return AcquireWritableStreamDefaultWriter(this);
                        }
                    }
                    Object.defineProperties(WritableStream.prototype, {
                        abort: { enumerable: true },
                        close: { enumerable: true },
                        getWriter: { enumerable: true },
                        locked: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(WritableStream.prototype, SymbolPolyfill.toStringTag, {
                            value: 'WritableStream',
                            configurable: true
                        });
                    }
                    // Abstract operations for the WritableStream.
                    function AcquireWritableStreamDefaultWriter(stream) {
                        return new WritableStreamDefaultWriter(stream);
                    }
                    // Throws if and only if startAlgorithm throws.
                    function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
                        const stream = Object.create(WritableStream.prototype);
                        InitializeWritableStream(stream);
                        const controller = Object.create(WritableStreamDefaultController.prototype);
                        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
                        return stream;
                    }
                    function InitializeWritableStream(stream) {
                        stream._state = 'writable';
                        // The error that will be reported by new method calls once the state becomes errored. Only set when [[state]] is
                        // 'erroring' or 'errored'. May be set to an undefined value.
                        stream._storedError = undefined;
                        stream._writer = undefined;
                        // Initialize to undefined first because the constructor of the controller checks this
                        // variable to validate the caller.
                        stream._writableStreamController = undefined;
                        // This queue is placed here instead of the writer class in order to allow for passing a writer to the next data
                        // producer without waiting for the queued writes to finish.
                        stream._writeRequests = new SimpleQueue();
                        // Write requests are removed from _writeRequests when write() is called on the underlying sink. This prevents
                        // them from being erroneously rejected on error. If a write() call is in-flight, the request is stored here.
                        stream._inFlightWriteRequest = undefined;
                        // The promise that was returned from writer.close(). Stored here because it may be fulfilled after the writer
                        // has been detached.
                        stream._closeRequest = undefined;
                        // Close request is removed from _closeRequest when close() is called on the underlying sink. This prevents it
                        // from being erroneously rejected on error. If a close() call is in-flight, the request is stored here.
                        stream._inFlightCloseRequest = undefined;
                        // The promise that was returned from writer.abort(). This may also be fulfilled after the writer has detached.
                        stream._pendingAbortRequest = undefined;
                        // The backpressure signal set by the controller.
                        stream._backpressure = false;
                    }
                    function IsWritableStream(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_writableStreamController')) {
                            return false;
                        }
                        return x instanceof WritableStream;
                    }
                    function IsWritableStreamLocked(stream) {
                        if (stream._writer === undefined) {
                            return false;
                        }
                        return true;
                    }
                    function WritableStreamAbort(stream, reason) {
                        var _a;
                        if (stream._state === 'closed' || stream._state === 'errored') {
                            return promiseResolvedWith(undefined);
                        }
                        stream._writableStreamController._abortReason = reason;
                        (_a = stream._writableStreamController._abortController) === null || _a === void 0 ? void 0 : _a.abort();
                        // TypeScript narrows the type of `stream._state` down to 'writable' | 'erroring',
                        // but it doesn't know that signaling abort runs author code that might have changed the state.
                        // Widen the type again by casting to WritableStreamState.
                        const state = stream._state;
                        if (state === 'closed' || state === 'errored') {
                            return promiseResolvedWith(undefined);
                        }
                        if (stream._pendingAbortRequest !== undefined) {
                            return stream._pendingAbortRequest._promise;
                        }
                        let wasAlreadyErroring = false;
                        if (state === 'erroring') {
                            wasAlreadyErroring = true;
                            // reason will not be used, so don't keep a reference to it.
                            reason = undefined;
                        }
                        const promise = newPromise((resolve, reject) => {
                            stream._pendingAbortRequest = {
                                _promise: undefined,
                                _resolve: resolve,
                                _reject: reject,
                                _reason: reason,
                                _wasAlreadyErroring: wasAlreadyErroring
                            };
                        });
                        stream._pendingAbortRequest._promise = promise;
                        if (!wasAlreadyErroring) {
                            WritableStreamStartErroring(stream, reason);
                        }
                        return promise;
                    }
                    function WritableStreamClose(stream) {
                        const state = stream._state;
                        if (state === 'closed' || state === 'errored') {
                            return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
                        }
                        const promise = newPromise((resolve, reject) => {
                            const closeRequest = {
                                _resolve: resolve,
                                _reject: reject
                            };
                            stream._closeRequest = closeRequest;
                        });
                        const writer = stream._writer;
                        if (writer !== undefined && stream._backpressure && state === 'writable') {
                            defaultWriterReadyPromiseResolve(writer);
                        }
                        WritableStreamDefaultControllerClose(stream._writableStreamController);
                        return promise;
                    }
                    // WritableStream API exposed for controllers.
                    function WritableStreamAddWriteRequest(stream) {
                        const promise = newPromise((resolve, reject) => {
                            const writeRequest = {
                                _resolve: resolve,
                                _reject: reject
                            };
                            stream._writeRequests.push(writeRequest);
                        });
                        return promise;
                    }
                    function WritableStreamDealWithRejection(stream, error) {
                        const state = stream._state;
                        if (state === 'writable') {
                            WritableStreamStartErroring(stream, error);
                            return;
                        }
                        WritableStreamFinishErroring(stream);
                    }
                    function WritableStreamStartErroring(stream, reason) {
                        const controller = stream._writableStreamController;
                        stream._state = 'erroring';
                        stream._storedError = reason;
                        const writer = stream._writer;
                        if (writer !== undefined) {
                            WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
                        }
                        if (!WritableStreamHasOperationMarkedInFlight(stream) && controller._started) {
                            WritableStreamFinishErroring(stream);
                        }
                    }
                    function WritableStreamFinishErroring(stream) {
                        stream._state = 'errored';
                        stream._writableStreamController[ErrorSteps]();
                        const storedError = stream._storedError;
                        stream._writeRequests.forEach(writeRequest => {
                            writeRequest._reject(storedError);
                        });
                        stream._writeRequests = new SimpleQueue();
                        if (stream._pendingAbortRequest === undefined) {
                            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
                            return;
                        }
                        const abortRequest = stream._pendingAbortRequest;
                        stream._pendingAbortRequest = undefined;
                        if (abortRequest._wasAlreadyErroring) {
                            abortRequest._reject(storedError);
                            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
                            return;
                        }
                        const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
                        uponPromise(promise, () => {
                            abortRequest._resolve();
                            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
                        }, (reason) => {
                            abortRequest._reject(reason);
                            WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
                        });
                    }
                    function WritableStreamFinishInFlightWrite(stream) {
                        stream._inFlightWriteRequest._resolve(undefined);
                        stream._inFlightWriteRequest = undefined;
                    }
                    function WritableStreamFinishInFlightWriteWithError(stream, error) {
                        stream._inFlightWriteRequest._reject(error);
                        stream._inFlightWriteRequest = undefined;
                        WritableStreamDealWithRejection(stream, error);
                    }
                    function WritableStreamFinishInFlightClose(stream) {
                        stream._inFlightCloseRequest._resolve(undefined);
                        stream._inFlightCloseRequest = undefined;
                        const state = stream._state;
                        if (state === 'erroring') {
                            // The error was too late to do anything, so it is ignored.
                            stream._storedError = undefined;
                            if (stream._pendingAbortRequest !== undefined) {
                                stream._pendingAbortRequest._resolve();
                                stream._pendingAbortRequest = undefined;
                            }
                        }
                        stream._state = 'closed';
                        const writer = stream._writer;
                        if (writer !== undefined) {
                            defaultWriterClosedPromiseResolve(writer);
                        }
                    }
                    function WritableStreamFinishInFlightCloseWithError(stream, error) {
                        stream._inFlightCloseRequest._reject(error);
                        stream._inFlightCloseRequest = undefined;
                        // Never execute sink abort() after sink close().
                        if (stream._pendingAbortRequest !== undefined) {
                            stream._pendingAbortRequest._reject(error);
                            stream._pendingAbortRequest = undefined;
                        }
                        WritableStreamDealWithRejection(stream, error);
                    }
                    // TODO(ricea): Fix alphabetical order.
                    function WritableStreamCloseQueuedOrInFlight(stream) {
                        if (stream._closeRequest === undefined && stream._inFlightCloseRequest === undefined) {
                            return false;
                        }
                        return true;
                    }
                    function WritableStreamHasOperationMarkedInFlight(stream) {
                        if (stream._inFlightWriteRequest === undefined && stream._inFlightCloseRequest === undefined) {
                            return false;
                        }
                        return true;
                    }
                    function WritableStreamMarkCloseRequestInFlight(stream) {
                        stream._inFlightCloseRequest = stream._closeRequest;
                        stream._closeRequest = undefined;
                    }
                    function WritableStreamMarkFirstWriteRequestInFlight(stream) {
                        stream._inFlightWriteRequest = stream._writeRequests.shift();
                    }
                    function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
                        if (stream._closeRequest !== undefined) {
                            stream._closeRequest._reject(stream._storedError);
                            stream._closeRequest = undefined;
                        }
                        const writer = stream._writer;
                        if (writer !== undefined) {
                            defaultWriterClosedPromiseReject(writer, stream._storedError);
                        }
                    }
                    function WritableStreamUpdateBackpressure(stream, backpressure) {
                        const writer = stream._writer;
                        if (writer !== undefined && backpressure !== stream._backpressure) {
                            if (backpressure) {
                                defaultWriterReadyPromiseReset(writer);
                            }
                            else {
                                defaultWriterReadyPromiseResolve(writer);
                            }
                        }
                        stream._backpressure = backpressure;
                    }
                    /**
                     * A default writer vended by a {@link WritableStream}.
                     *
                     * @public
                     */
                    class WritableStreamDefaultWriter {
                        constructor(stream) {
                            assertRequiredArgument(stream, 1, 'WritableStreamDefaultWriter');
                            assertWritableStream(stream, 'First parameter');
                            if (IsWritableStreamLocked(stream)) {
                                throw new TypeError('This stream has already been locked for exclusive writing by another writer');
                            }
                            this._ownerWritableStream = stream;
                            stream._writer = this;
                            const state = stream._state;
                            if (state === 'writable') {
                                if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._backpressure) {
                                    defaultWriterReadyPromiseInitialize(this);
                                }
                                else {
                                    defaultWriterReadyPromiseInitializeAsResolved(this);
                                }
                                defaultWriterClosedPromiseInitialize(this);
                            }
                            else if (state === 'erroring') {
                                defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
                                defaultWriterClosedPromiseInitialize(this);
                            }
                            else if (state === 'closed') {
                                defaultWriterReadyPromiseInitializeAsResolved(this);
                                defaultWriterClosedPromiseInitializeAsResolved(this);
                            }
                            else {
                                const storedError = stream._storedError;
                                defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
                                defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
                            }
                        }
                        /**
                         * Returns a promise that will be fulfilled when the stream becomes closed, or rejected if the stream ever errors or
                         * the writer’s lock is released before the stream finishes closing.
                         */
                        get closed() {
                            if (!IsWritableStreamDefaultWriter(this)) {
                                return promiseRejectedWith(defaultWriterBrandCheckException('closed'));
                            }
                            return this._closedPromise;
                        }
                        /**
                         * Returns the desired size to fill the stream’s internal queue. It can be negative, if the queue is over-full.
                         * A producer can use this information to determine the right amount of data to write.
                         *
                         * It will be `null` if the stream cannot be successfully written to (due to either being errored, or having an abort
                         * queued up). It will return zero if the stream is closed. And the getter will throw an exception if invoked when
                         * the writer’s lock is released.
                         */
                        get desiredSize() {
                            if (!IsWritableStreamDefaultWriter(this)) {
                                throw defaultWriterBrandCheckException('desiredSize');
                            }
                            if (this._ownerWritableStream === undefined) {
                                throw defaultWriterLockException('desiredSize');
                            }
                            return WritableStreamDefaultWriterGetDesiredSize(this);
                        }
                        /**
                         * Returns a promise that will be fulfilled when the desired size to fill the stream’s internal queue transitions
                         * from non-positive to positive, signaling that it is no longer applying backpressure. Once the desired size dips
                         * back to zero or below, the getter will return a new promise that stays pending until the next transition.
                         *
                         * If the stream becomes errored or aborted, or the writer’s lock is released, the returned promise will become
                         * rejected.
                         */
                        get ready() {
                            if (!IsWritableStreamDefaultWriter(this)) {
                                return promiseRejectedWith(defaultWriterBrandCheckException('ready'));
                            }
                            return this._readyPromise;
                        }
                        /**
                         * If the reader is active, behaves the same as {@link WritableStream.abort | stream.abort(reason)}.
                         */
                        abort(reason = undefined) {
                            if (!IsWritableStreamDefaultWriter(this)) {
                                return promiseRejectedWith(defaultWriterBrandCheckException('abort'));
                            }
                            if (this._ownerWritableStream === undefined) {
                                return promiseRejectedWith(defaultWriterLockException('abort'));
                            }
                            return WritableStreamDefaultWriterAbort(this, reason);
                        }
                        /**
                         * If the reader is active, behaves the same as {@link WritableStream.close | stream.close()}.
                         */
                        close() {
                            if (!IsWritableStreamDefaultWriter(this)) {
                                return promiseRejectedWith(defaultWriterBrandCheckException('close'));
                            }
                            const stream = this._ownerWritableStream;
                            if (stream === undefined) {
                                return promiseRejectedWith(defaultWriterLockException('close'));
                            }
                            if (WritableStreamCloseQueuedOrInFlight(stream)) {
                                return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
                            }
                            return WritableStreamDefaultWriterClose(this);
                        }
                        /**
                         * Releases the writer’s lock on the corresponding stream. After the lock is released, the writer is no longer active.
                         * If the associated stream is errored when the lock is released, the writer will appear errored in the same way from
                         * now on; otherwise, the writer will appear closed.
                         *
                         * Note that the lock can still be released even if some ongoing writes have not yet finished (i.e. even if the
                         * promises returned from previous calls to {@link WritableStreamDefaultWriter.write | write()} have not yet settled).
                         * It’s not necessary to hold the lock on the writer for the duration of the write; the lock instead simply prevents
                         * other producers from writing in an interleaved manner.
                         */
                        releaseLock() {
                            if (!IsWritableStreamDefaultWriter(this)) {
                                throw defaultWriterBrandCheckException('releaseLock');
                            }
                            const stream = this._ownerWritableStream;
                            if (stream === undefined) {
                                return;
                            }
                            WritableStreamDefaultWriterRelease(this);
                        }
                        write(chunk = undefined) {
                            if (!IsWritableStreamDefaultWriter(this)) {
                                return promiseRejectedWith(defaultWriterBrandCheckException('write'));
                            }
                            if (this._ownerWritableStream === undefined) {
                                return promiseRejectedWith(defaultWriterLockException('write to'));
                            }
                            return WritableStreamDefaultWriterWrite(this, chunk);
                        }
                    }
                    Object.defineProperties(WritableStreamDefaultWriter.prototype, {
                        abort: { enumerable: true },
                        close: { enumerable: true },
                        releaseLock: { enumerable: true },
                        write: { enumerable: true },
                        closed: { enumerable: true },
                        desiredSize: { enumerable: true },
                        ready: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(WritableStreamDefaultWriter.prototype, SymbolPolyfill.toStringTag, {
                            value: 'WritableStreamDefaultWriter',
                            configurable: true
                        });
                    }
                    // Abstract operations for the WritableStreamDefaultWriter.
                    function IsWritableStreamDefaultWriter(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_ownerWritableStream')) {
                            return false;
                        }
                        return x instanceof WritableStreamDefaultWriter;
                    }
                    // A client of WritableStreamDefaultWriter may use these functions directly to bypass state check.
                    function WritableStreamDefaultWriterAbort(writer, reason) {
                        const stream = writer._ownerWritableStream;
                        return WritableStreamAbort(stream, reason);
                    }
                    function WritableStreamDefaultWriterClose(writer) {
                        const stream = writer._ownerWritableStream;
                        return WritableStreamClose(stream);
                    }
                    function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
                        const stream = writer._ownerWritableStream;
                        const state = stream._state;
                        if (WritableStreamCloseQueuedOrInFlight(stream) || state === 'closed') {
                            return promiseResolvedWith(undefined);
                        }
                        if (state === 'errored') {
                            return promiseRejectedWith(stream._storedError);
                        }
                        return WritableStreamDefaultWriterClose(writer);
                    }
                    function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error) {
                        if (writer._closedPromiseState === 'pending') {
                            defaultWriterClosedPromiseReject(writer, error);
                        }
                        else {
                            defaultWriterClosedPromiseResetToRejected(writer, error);
                        }
                    }
                    function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error) {
                        if (writer._readyPromiseState === 'pending') {
                            defaultWriterReadyPromiseReject(writer, error);
                        }
                        else {
                            defaultWriterReadyPromiseResetToRejected(writer, error);
                        }
                    }
                    function WritableStreamDefaultWriterGetDesiredSize(writer) {
                        const stream = writer._ownerWritableStream;
                        const state = stream._state;
                        if (state === 'errored' || state === 'erroring') {
                            return null;
                        }
                        if (state === 'closed') {
                            return 0;
                        }
                        return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
                    }
                    function WritableStreamDefaultWriterRelease(writer) {
                        const stream = writer._ownerWritableStream;
                        const releasedError = new TypeError(`Writer was released and can no longer be used to monitor the stream's closedness`);
                        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
                        // The state transitions to "errored" before the sink abort() method runs, but the writer.closed promise is not
                        // rejected until afterwards. This means that simply testing state will not work.
                        WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
                        stream._writer = undefined;
                        writer._ownerWritableStream = undefined;
                    }
                    function WritableStreamDefaultWriterWrite(writer, chunk) {
                        const stream = writer._ownerWritableStream;
                        const controller = stream._writableStreamController;
                        const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
                        if (stream !== writer._ownerWritableStream) {
                            return promiseRejectedWith(defaultWriterLockException('write to'));
                        }
                        const state = stream._state;
                        if (state === 'errored') {
                            return promiseRejectedWith(stream._storedError);
                        }
                        if (WritableStreamCloseQueuedOrInFlight(stream) || state === 'closed') {
                            return promiseRejectedWith(new TypeError('The stream is closing or closed and cannot be written to'));
                        }
                        if (state === 'erroring') {
                            return promiseRejectedWith(stream._storedError);
                        }
                        const promise = WritableStreamAddWriteRequest(stream);
                        WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
                        return promise;
                    }
                    const closeSentinel = {};
                    /**
                     * Allows control of a {@link WritableStream | writable stream}'s state and internal queue.
                     *
                     * @public
                     */
                    class WritableStreamDefaultController {
                        constructor() {
                            throw new TypeError('Illegal constructor');
                        }
                        /**
                         * The reason which was passed to `WritableStream.abort(reason)` when the stream was aborted.
                         *
                         * @deprecated
                         *  This property has been removed from the specification, see https://github.com/whatwg/streams/pull/1177.
                         *  Use {@link WritableStreamDefaultController.signal}'s `reason` instead.
                         */
                        get abortReason() {
                            if (!IsWritableStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException$2('abortReason');
                            }
                            return this._abortReason;
                        }
                        /**
                         * An `AbortSignal` that can be used to abort the pending write or close operation when the stream is aborted.
                         */
                        get signal() {
                            if (!IsWritableStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException$2('signal');
                            }
                            if (this._abortController === undefined) {
                                // Older browsers or older Node versions may not support `AbortController` or `AbortSignal`.
                                // We don't want to bundle and ship an `AbortController` polyfill together with our polyfill,
                                // so instead we only implement support for `signal` if we find a global `AbortController` constructor.
                                throw new TypeError('WritableStreamDefaultController.prototype.signal is not supported');
                            }
                            return this._abortController.signal;
                        }
                        /**
                         * Closes the controlled writable stream, making all future interactions with it fail with the given error `e`.
                         *
                         * This method is rarely used, since usually it suffices to return a rejected promise from one of the underlying
                         * sink's methods. However, it can be useful for suddenly shutting down a stream in response to an event outside the
                         * normal lifecycle of interactions with the underlying sink.
                         */
                        error(e = undefined) {
                            if (!IsWritableStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException$2('error');
                            }
                            const state = this._controlledWritableStream._state;
                            if (state !== 'writable') {
                                // The stream is closed, errored or will be soon. The sink can't do anything useful if it gets an error here, so
                                // just treat it as a no-op.
                                return;
                            }
                            WritableStreamDefaultControllerError(this, e);
                        }
                        /** @internal */
                        [AbortSteps](reason) {
                            const result = this._abortAlgorithm(reason);
                            WritableStreamDefaultControllerClearAlgorithms(this);
                            return result;
                        }
                        /** @internal */
                        [ErrorSteps]() {
                            ResetQueue(this);
                        }
                    }
                    Object.defineProperties(WritableStreamDefaultController.prototype, {
                        abortReason: { enumerable: true },
                        signal: { enumerable: true },
                        error: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(WritableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
                            value: 'WritableStreamDefaultController',
                            configurable: true
                        });
                    }
                    // Abstract operations implementing interface required by the WritableStream.
                    function IsWritableStreamDefaultController(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_controlledWritableStream')) {
                            return false;
                        }
                        return x instanceof WritableStreamDefaultController;
                    }
                    function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
                        controller._controlledWritableStream = stream;
                        stream._writableStreamController = controller;
                        // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
                        controller._queue = undefined;
                        controller._queueTotalSize = undefined;
                        ResetQueue(controller);
                        controller._abortReason = undefined;
                        controller._abortController = createAbortController();
                        controller._started = false;
                        controller._strategySizeAlgorithm = sizeAlgorithm;
                        controller._strategyHWM = highWaterMark;
                        controller._writeAlgorithm = writeAlgorithm;
                        controller._closeAlgorithm = closeAlgorithm;
                        controller._abortAlgorithm = abortAlgorithm;
                        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
                        WritableStreamUpdateBackpressure(stream, backpressure);
                        const startResult = startAlgorithm();
                        const startPromise = promiseResolvedWith(startResult);
                        uponPromise(startPromise, () => {
                            controller._started = true;
                            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
                        }, r => {
                            controller._started = true;
                            WritableStreamDealWithRejection(stream, r);
                        });
                    }
                    function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
                        const controller = Object.create(WritableStreamDefaultController.prototype);
                        let startAlgorithm = () => undefined;
                        let writeAlgorithm = () => promiseResolvedWith(undefined);
                        let closeAlgorithm = () => promiseResolvedWith(undefined);
                        let abortAlgorithm = () => promiseResolvedWith(undefined);
                        if (underlyingSink.start !== undefined) {
                            startAlgorithm = () => underlyingSink.start(controller);
                        }
                        if (underlyingSink.write !== undefined) {
                            writeAlgorithm = chunk => underlyingSink.write(chunk, controller);
                        }
                        if (underlyingSink.close !== undefined) {
                            closeAlgorithm = () => underlyingSink.close();
                        }
                        if (underlyingSink.abort !== undefined) {
                            abortAlgorithm = reason => underlyingSink.abort(reason);
                        }
                        SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
                    }
                    // ClearAlgorithms may be called twice. Erroring the same stream in multiple ways will often result in redundant calls.
                    function WritableStreamDefaultControllerClearAlgorithms(controller) {
                        controller._writeAlgorithm = undefined;
                        controller._closeAlgorithm = undefined;
                        controller._abortAlgorithm = undefined;
                        controller._strategySizeAlgorithm = undefined;
                    }
                    function WritableStreamDefaultControllerClose(controller) {
                        EnqueueValueWithSize(controller, closeSentinel, 0);
                        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
                    }
                    function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
                        try {
                            return controller._strategySizeAlgorithm(chunk);
                        }
                        catch (chunkSizeE) {
                            WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
                            return 1;
                        }
                    }
                    function WritableStreamDefaultControllerGetDesiredSize(controller) {
                        return controller._strategyHWM - controller._queueTotalSize;
                    }
                    function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
                        try {
                            EnqueueValueWithSize(controller, chunk, chunkSize);
                        }
                        catch (enqueueE) {
                            WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
                            return;
                        }
                        const stream = controller._controlledWritableStream;
                        if (!WritableStreamCloseQueuedOrInFlight(stream) && stream._state === 'writable') {
                            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
                            WritableStreamUpdateBackpressure(stream, backpressure);
                        }
                        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
                    }
                    // Abstract operations for the WritableStreamDefaultController.
                    function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
                        const stream = controller._controlledWritableStream;
                        if (!controller._started) {
                            return;
                        }
                        if (stream._inFlightWriteRequest !== undefined) {
                            return;
                        }
                        const state = stream._state;
                        if (state === 'erroring') {
                            WritableStreamFinishErroring(stream);
                            return;
                        }
                        if (controller._queue.length === 0) {
                            return;
                        }
                        const value = PeekQueueValue(controller);
                        if (value === closeSentinel) {
                            WritableStreamDefaultControllerProcessClose(controller);
                        }
                        else {
                            WritableStreamDefaultControllerProcessWrite(controller, value);
                        }
                    }
                    function WritableStreamDefaultControllerErrorIfNeeded(controller, error) {
                        if (controller._controlledWritableStream._state === 'writable') {
                            WritableStreamDefaultControllerError(controller, error);
                        }
                    }
                    function WritableStreamDefaultControllerProcessClose(controller) {
                        const stream = controller._controlledWritableStream;
                        WritableStreamMarkCloseRequestInFlight(stream);
                        DequeueValue(controller);
                        const sinkClosePromise = controller._closeAlgorithm();
                        WritableStreamDefaultControllerClearAlgorithms(controller);
                        uponPromise(sinkClosePromise, () => {
                            WritableStreamFinishInFlightClose(stream);
                        }, reason => {
                            WritableStreamFinishInFlightCloseWithError(stream, reason);
                        });
                    }
                    function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
                        const stream = controller._controlledWritableStream;
                        WritableStreamMarkFirstWriteRequestInFlight(stream);
                        const sinkWritePromise = controller._writeAlgorithm(chunk);
                        uponPromise(sinkWritePromise, () => {
                            WritableStreamFinishInFlightWrite(stream);
                            const state = stream._state;
                            DequeueValue(controller);
                            if (!WritableStreamCloseQueuedOrInFlight(stream) && state === 'writable') {
                                const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
                                WritableStreamUpdateBackpressure(stream, backpressure);
                            }
                            WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
                        }, reason => {
                            if (stream._state === 'writable') {
                                WritableStreamDefaultControllerClearAlgorithms(controller);
                            }
                            WritableStreamFinishInFlightWriteWithError(stream, reason);
                        });
                    }
                    function WritableStreamDefaultControllerGetBackpressure(controller) {
                        const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
                        return desiredSize <= 0;
                    }
                    // A client of WritableStreamDefaultController may use these functions directly to bypass state check.
                    function WritableStreamDefaultControllerError(controller, error) {
                        const stream = controller._controlledWritableStream;
                        WritableStreamDefaultControllerClearAlgorithms(controller);
                        WritableStreamStartErroring(stream, error);
                    }
                    // Helper functions for the WritableStream.
                    function streamBrandCheckException$2(name) {
                        return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
                    }
                    // Helper functions for the WritableStreamDefaultController.
                    function defaultControllerBrandCheckException$2(name) {
                        return new TypeError(`WritableStreamDefaultController.prototype.${name} can only be used on a WritableStreamDefaultController`);
                    }
                    // Helper functions for the WritableStreamDefaultWriter.
                    function defaultWriterBrandCheckException(name) {
                        return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
                    }
                    function defaultWriterLockException(name) {
                        return new TypeError('Cannot ' + name + ' a stream using a released writer');
                    }
                    function defaultWriterClosedPromiseInitialize(writer) {
                        writer._closedPromise = newPromise((resolve, reject) => {
                            writer._closedPromise_resolve = resolve;
                            writer._closedPromise_reject = reject;
                            writer._closedPromiseState = 'pending';
                        });
                    }
                    function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
                        defaultWriterClosedPromiseInitialize(writer);
                        defaultWriterClosedPromiseReject(writer, reason);
                    }
                    function defaultWriterClosedPromiseInitializeAsResolved(writer) {
                        defaultWriterClosedPromiseInitialize(writer);
                        defaultWriterClosedPromiseResolve(writer);
                    }
                    function defaultWriterClosedPromiseReject(writer, reason) {
                        if (writer._closedPromise_reject === undefined) {
                            return;
                        }
                        setPromiseIsHandledToTrue(writer._closedPromise);
                        writer._closedPromise_reject(reason);
                        writer._closedPromise_resolve = undefined;
                        writer._closedPromise_reject = undefined;
                        writer._closedPromiseState = 'rejected';
                    }
                    function defaultWriterClosedPromiseResetToRejected(writer, reason) {
                        defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
                    }
                    function defaultWriterClosedPromiseResolve(writer) {
                        if (writer._closedPromise_resolve === undefined) {
                            return;
                        }
                        writer._closedPromise_resolve(undefined);
                        writer._closedPromise_resolve = undefined;
                        writer._closedPromise_reject = undefined;
                        writer._closedPromiseState = 'resolved';
                    }
                    function defaultWriterReadyPromiseInitialize(writer) {
                        writer._readyPromise = newPromise((resolve, reject) => {
                            writer._readyPromise_resolve = resolve;
                            writer._readyPromise_reject = reject;
                        });
                        writer._readyPromiseState = 'pending';
                    }
                    function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
                        defaultWriterReadyPromiseInitialize(writer);
                        defaultWriterReadyPromiseReject(writer, reason);
                    }
                    function defaultWriterReadyPromiseInitializeAsResolved(writer) {
                        defaultWriterReadyPromiseInitialize(writer);
                        defaultWriterReadyPromiseResolve(writer);
                    }
                    function defaultWriterReadyPromiseReject(writer, reason) {
                        if (writer._readyPromise_reject === undefined) {
                            return;
                        }
                        setPromiseIsHandledToTrue(writer._readyPromise);
                        writer._readyPromise_reject(reason);
                        writer._readyPromise_resolve = undefined;
                        writer._readyPromise_reject = undefined;
                        writer._readyPromiseState = 'rejected';
                    }
                    function defaultWriterReadyPromiseReset(writer) {
                        defaultWriterReadyPromiseInitialize(writer);
                    }
                    function defaultWriterReadyPromiseResetToRejected(writer, reason) {
                        defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
                    }
                    function defaultWriterReadyPromiseResolve(writer) {
                        if (writer._readyPromise_resolve === undefined) {
                            return;
                        }
                        writer._readyPromise_resolve(undefined);
                        writer._readyPromise_resolve = undefined;
                        writer._readyPromise_reject = undefined;
                        writer._readyPromiseState = 'fulfilled';
                    }

                    /// <reference lib="dom" />
                    const NativeDOMException = typeof DOMException !== 'undefined' ? DOMException : undefined;

                    /// <reference types="node" />
                    function isDOMExceptionConstructor(ctor) {
                        if (!(typeof ctor === 'function' || typeof ctor === 'object')) {
                            return false;
                        }
                        try {
                            new ctor();
                            return true;
                        }
                        catch (_a) {
                            return false;
                        }
                    }
                    function createDOMExceptionPolyfill() {
                        // eslint-disable-next-line no-shadow
                        const ctor = function DOMException(message, name) {
                            this.message = message || '';
                            this.name = name || 'Error';
                            if (Error.captureStackTrace) {
                                Error.captureStackTrace(this, this.constructor);
                            }
                        };
                        ctor.prototype = Object.create(Error.prototype);
                        Object.defineProperty(ctor.prototype, 'constructor', { value: ctor, writable: true, configurable: true });
                        return ctor;
                    }
                    // eslint-disable-next-line no-redeclare
                    const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();

                    function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
                        const reader = AcquireReadableStreamDefaultReader(source);
                        const writer = AcquireWritableStreamDefaultWriter(dest);
                        source._disturbed = true;
                        let shuttingDown = false;
                        // This is used to keep track of the spec's requirement that we wait for ongoing writes during shutdown.
                        let currentWrite = promiseResolvedWith(undefined);
                        return newPromise((resolve, reject) => {
                            let abortAlgorithm;
                            if (signal !== undefined) {
                                abortAlgorithm = () => {
                                    const error = new DOMException$1('Aborted', 'AbortError');
                                    const actions = [];
                                    if (!preventAbort) {
                                        actions.push(() => {
                                            if (dest._state === 'writable') {
                                                return WritableStreamAbort(dest, error);
                                            }
                                            return promiseResolvedWith(undefined);
                                        });
                                    }
                                    if (!preventCancel) {
                                        actions.push(() => {
                                            if (source._state === 'readable') {
                                                return ReadableStreamCancel(source, error);
                                            }
                                            return promiseResolvedWith(undefined);
                                        });
                                    }
                                    shutdownWithAction(() => Promise.all(actions.map(action => action())), true, error);
                                };
                                if (signal.aborted) {
                                    abortAlgorithm();
                                    return;
                                }
                                signal.addEventListener('abort', abortAlgorithm);
                            }
                            // Using reader and writer, read all chunks from this and write them to dest
                            // - Backpressure must be enforced
                            // - Shutdown must stop all activity
                            function pipeLoop() {
                                return newPromise((resolveLoop, rejectLoop) => {
                                    function next(done) {
                                        if (done) {
                                            resolveLoop();
                                        }
                                        else {
                                            // Use `PerformPromiseThen` instead of `uponPromise` to avoid
                                            // adding unnecessary `.catch(rethrowAssertionErrorRejection)` handlers
                                            PerformPromiseThen(pipeStep(), next, rejectLoop);
                                        }
                                    }
                                    next(false);
                                });
                            }
                            function pipeStep() {
                                if (shuttingDown) {
                                    return promiseResolvedWith(true);
                                }
                                return PerformPromiseThen(writer._readyPromise, () => {
                                    return newPromise((resolveRead, rejectRead) => {
                                        ReadableStreamDefaultReaderRead(reader, {
                                            _chunkSteps: chunk => {
                                                currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, chunk), undefined, noop);
                                                resolveRead(false);
                                            },
                                            _closeSteps: () => resolveRead(true),
                                            _errorSteps: rejectRead
                                        });
                                    });
                                });
                            }
                            // Errors must be propagated forward
                            isOrBecomesErrored(source, reader._closedPromise, storedError => {
                                if (!preventAbort) {
                                    shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
                                }
                                else {
                                    shutdown(true, storedError);
                                }
                            });
                            // Errors must be propagated backward
                            isOrBecomesErrored(dest, writer._closedPromise, storedError => {
                                if (!preventCancel) {
                                    shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
                                }
                                else {
                                    shutdown(true, storedError);
                                }
                            });
                            // Closing must be propagated forward
                            isOrBecomesClosed(source, reader._closedPromise, () => {
                                if (!preventClose) {
                                    shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
                                }
                                else {
                                    shutdown();
                                }
                            });
                            // Closing must be propagated backward
                            if (WritableStreamCloseQueuedOrInFlight(dest) || dest._state === 'closed') {
                                const destClosed = new TypeError('the destination writable stream closed before all data could be piped to it');
                                if (!preventCancel) {
                                    shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
                                }
                                else {
                                    shutdown(true, destClosed);
                                }
                            }
                            setPromiseIsHandledToTrue(pipeLoop());
                            function waitForWritesToFinish() {
                                // Another write may have started while we were waiting on this currentWrite, so we have to be sure to wait
                                // for that too.
                                const oldCurrentWrite = currentWrite;
                                return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : undefined);
                            }
                            function isOrBecomesErrored(stream, promise, action) {
                                if (stream._state === 'errored') {
                                    action(stream._storedError);
                                }
                                else {
                                    uponRejection(promise, action);
                                }
                            }
                            function isOrBecomesClosed(stream, promise, action) {
                                if (stream._state === 'closed') {
                                    action();
                                }
                                else {
                                    uponFulfillment(promise, action);
                                }
                            }
                            function shutdownWithAction(action, originalIsError, originalError) {
                                if (shuttingDown) {
                                    return;
                                }
                                shuttingDown = true;
                                if (dest._state === 'writable' && !WritableStreamCloseQueuedOrInFlight(dest)) {
                                    uponFulfillment(waitForWritesToFinish(), doTheRest);
                                }
                                else {
                                    doTheRest();
                                }
                                function doTheRest() {
                                    uponPromise(action(), () => finalize(originalIsError, originalError), newError => finalize(true, newError));
                                }
                            }
                            function shutdown(isError, error) {
                                if (shuttingDown) {
                                    return;
                                }
                                shuttingDown = true;
                                if (dest._state === 'writable' && !WritableStreamCloseQueuedOrInFlight(dest)) {
                                    uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error));
                                }
                                else {
                                    finalize(isError, error);
                                }
                            }
                            function finalize(isError, error) {
                                WritableStreamDefaultWriterRelease(writer);
                                ReadableStreamReaderGenericRelease(reader);
                                if (signal !== undefined) {
                                    signal.removeEventListener('abort', abortAlgorithm);
                                }
                                if (isError) {
                                    reject(error);
                                }
                                else {
                                    resolve(undefined);
                                }
                            }
                        });
                    }

                    /**
                     * Allows control of a {@link ReadableStream | readable stream}'s state and internal queue.
                     *
                     * @public
                     */
                    class ReadableStreamDefaultController {
                        constructor() {
                            throw new TypeError('Illegal constructor');
                        }
                        /**
                         * Returns the desired size to fill the controlled stream's internal queue. It can be negative, if the queue is
                         * over-full. An underlying source ought to use this information to determine when and how to apply backpressure.
                         */
                        get desiredSize() {
                            if (!IsReadableStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException$1('desiredSize');
                            }
                            return ReadableStreamDefaultControllerGetDesiredSize(this);
                        }
                        /**
                         * Closes the controlled readable stream. Consumers will still be able to read any previously-enqueued chunks from
                         * the stream, but once those are read, the stream will become closed.
                         */
                        close() {
                            if (!IsReadableStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException$1('close');
                            }
                            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
                                throw new TypeError('The stream is not in a state that permits close');
                            }
                            ReadableStreamDefaultControllerClose(this);
                        }
                        enqueue(chunk = undefined) {
                            if (!IsReadableStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException$1('enqueue');
                            }
                            if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(this)) {
                                throw new TypeError('The stream is not in a state that permits enqueue');
                            }
                            return ReadableStreamDefaultControllerEnqueue(this, chunk);
                        }
                        /**
                         * Errors the controlled readable stream, making all future interactions with it fail with the given error `e`.
                         */
                        error(e = undefined) {
                            if (!IsReadableStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException$1('error');
                            }
                            ReadableStreamDefaultControllerError(this, e);
                        }
                        /** @internal */
                        [CancelSteps](reason) {
                            ResetQueue(this);
                            const result = this._cancelAlgorithm(reason);
                            ReadableStreamDefaultControllerClearAlgorithms(this);
                            return result;
                        }
                        /** @internal */
                        [PullSteps](readRequest) {
                            const stream = this._controlledReadableStream;
                            if (this._queue.length > 0) {
                                const chunk = DequeueValue(this);
                                if (this._closeRequested && this._queue.length === 0) {
                                    ReadableStreamDefaultControllerClearAlgorithms(this);
                                    ReadableStreamClose(stream);
                                }
                                else {
                                    ReadableStreamDefaultControllerCallPullIfNeeded(this);
                                }
                                readRequest._chunkSteps(chunk);
                            }
                            else {
                                ReadableStreamAddReadRequest(stream, readRequest);
                                ReadableStreamDefaultControllerCallPullIfNeeded(this);
                            }
                        }
                    }
                    Object.defineProperties(ReadableStreamDefaultController.prototype, {
                        close: { enumerable: true },
                        enqueue: { enumerable: true },
                        error: { enumerable: true },
                        desiredSize: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(ReadableStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
                            value: 'ReadableStreamDefaultController',
                            configurable: true
                        });
                    }
                    // Abstract operations for the ReadableStreamDefaultController.
                    function IsReadableStreamDefaultController(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream')) {
                            return false;
                        }
                        return x instanceof ReadableStreamDefaultController;
                    }
                    function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
                        const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
                        if (!shouldPull) {
                            return;
                        }
                        if (controller._pulling) {
                            controller._pullAgain = true;
                            return;
                        }
                        controller._pulling = true;
                        const pullPromise = controller._pullAlgorithm();
                        uponPromise(pullPromise, () => {
                            controller._pulling = false;
                            if (controller._pullAgain) {
                                controller._pullAgain = false;
                                ReadableStreamDefaultControllerCallPullIfNeeded(controller);
                            }
                        }, e => {
                            ReadableStreamDefaultControllerError(controller, e);
                        });
                    }
                    function ReadableStreamDefaultControllerShouldCallPull(controller) {
                        const stream = controller._controlledReadableStream;
                        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
                            return false;
                        }
                        if (!controller._started) {
                            return false;
                        }
                        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
                            return true;
                        }
                        const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
                        if (desiredSize > 0) {
                            return true;
                        }
                        return false;
                    }
                    function ReadableStreamDefaultControllerClearAlgorithms(controller) {
                        controller._pullAlgorithm = undefined;
                        controller._cancelAlgorithm = undefined;
                        controller._strategySizeAlgorithm = undefined;
                    }
                    // A client of ReadableStreamDefaultController may use these functions directly to bypass state check.
                    function ReadableStreamDefaultControllerClose(controller) {
                        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
                            return;
                        }
                        const stream = controller._controlledReadableStream;
                        controller._closeRequested = true;
                        if (controller._queue.length === 0) {
                            ReadableStreamDefaultControllerClearAlgorithms(controller);
                            ReadableStreamClose(stream);
                        }
                    }
                    function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
                        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(controller)) {
                            return;
                        }
                        const stream = controller._controlledReadableStream;
                        if (IsReadableStreamLocked(stream) && ReadableStreamGetNumReadRequests(stream) > 0) {
                            ReadableStreamFulfillReadRequest(stream, chunk, false);
                        }
                        else {
                            let chunkSize;
                            try {
                                chunkSize = controller._strategySizeAlgorithm(chunk);
                            }
                            catch (chunkSizeE) {
                                ReadableStreamDefaultControllerError(controller, chunkSizeE);
                                throw chunkSizeE;
                            }
                            try {
                                EnqueueValueWithSize(controller, chunk, chunkSize);
                            }
                            catch (enqueueE) {
                                ReadableStreamDefaultControllerError(controller, enqueueE);
                                throw enqueueE;
                            }
                        }
                        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
                    }
                    function ReadableStreamDefaultControllerError(controller, e) {
                        const stream = controller._controlledReadableStream;
                        if (stream._state !== 'readable') {
                            return;
                        }
                        ResetQueue(controller);
                        ReadableStreamDefaultControllerClearAlgorithms(controller);
                        ReadableStreamError(stream, e);
                    }
                    function ReadableStreamDefaultControllerGetDesiredSize(controller) {
                        const state = controller._controlledReadableStream._state;
                        if (state === 'errored') {
                            return null;
                        }
                        if (state === 'closed') {
                            return 0;
                        }
                        return controller._strategyHWM - controller._queueTotalSize;
                    }
                    // This is used in the implementation of TransformStream.
                    function ReadableStreamDefaultControllerHasBackpressure(controller) {
                        if (ReadableStreamDefaultControllerShouldCallPull(controller)) {
                            return false;
                        }
                        return true;
                    }
                    function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
                        const state = controller._controlledReadableStream._state;
                        if (!controller._closeRequested && state === 'readable') {
                            return true;
                        }
                        return false;
                    }
                    function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
                        controller._controlledReadableStream = stream;
                        controller._queue = undefined;
                        controller._queueTotalSize = undefined;
                        ResetQueue(controller);
                        controller._started = false;
                        controller._closeRequested = false;
                        controller._pullAgain = false;
                        controller._pulling = false;
                        controller._strategySizeAlgorithm = sizeAlgorithm;
                        controller._strategyHWM = highWaterMark;
                        controller._pullAlgorithm = pullAlgorithm;
                        controller._cancelAlgorithm = cancelAlgorithm;
                        stream._readableStreamController = controller;
                        const startResult = startAlgorithm();
                        uponPromise(promiseResolvedWith(startResult), () => {
                            controller._started = true;
                            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
                        }, r => {
                            ReadableStreamDefaultControllerError(controller, r);
                        });
                    }
                    function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
                        const controller = Object.create(ReadableStreamDefaultController.prototype);
                        let startAlgorithm = () => undefined;
                        let pullAlgorithm = () => promiseResolvedWith(undefined);
                        let cancelAlgorithm = () => promiseResolvedWith(undefined);
                        if (underlyingSource.start !== undefined) {
                            startAlgorithm = () => underlyingSource.start(controller);
                        }
                        if (underlyingSource.pull !== undefined) {
                            pullAlgorithm = () => underlyingSource.pull(controller);
                        }
                        if (underlyingSource.cancel !== undefined) {
                            cancelAlgorithm = reason => underlyingSource.cancel(reason);
                        }
                        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
                    }
                    // Helper functions for the ReadableStreamDefaultController.
                    function defaultControllerBrandCheckException$1(name) {
                        return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
                    }

                    function ReadableStreamTee(stream, cloneForBranch2) {
                        if (IsReadableByteStreamController(stream._readableStreamController)) {
                            return ReadableByteStreamTee(stream);
                        }
                        return ReadableStreamDefaultTee(stream);
                    }
                    function ReadableStreamDefaultTee(stream, cloneForBranch2) {
                        const reader = AcquireReadableStreamDefaultReader(stream);
                        let reading = false;
                        let readAgain = false;
                        let canceled1 = false;
                        let canceled2 = false;
                        let reason1;
                        let reason2;
                        let branch1;
                        let branch2;
                        let resolveCancelPromise;
                        const cancelPromise = newPromise(resolve => {
                            resolveCancelPromise = resolve;
                        });
                        function pullAlgorithm() {
                            if (reading) {
                                readAgain = true;
                                return promiseResolvedWith(undefined);
                            }
                            reading = true;
                            const readRequest = {
                                _chunkSteps: chunk => {
                                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                                    queueMicrotask(() => {
                                        readAgain = false;
                                        const chunk1 = chunk;
                                        const chunk2 = chunk;
                                        // There is no way to access the cloning code right now in the reference implementation.
                                        // If we add one then we'll need an implementation for serializable objects.
                                        // if (!canceled2 && cloneForBranch2) {
                                        //   chunk2 = StructuredDeserialize(StructuredSerialize(chunk2));
                                        // }
                                        if (!canceled1) {
                                            ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, chunk1);
                                        }
                                        if (!canceled2) {
                                            ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, chunk2);
                                        }
                                        reading = false;
                                        if (readAgain) {
                                            pullAlgorithm();
                                        }
                                    });
                                },
                                _closeSteps: () => {
                                    reading = false;
                                    if (!canceled1) {
                                        ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                                    }
                                    if (!canceled2) {
                                        ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                                    }
                                    if (!canceled1 || !canceled2) {
                                        resolveCancelPromise(undefined);
                                    }
                                },
                                _errorSteps: () => {
                                    reading = false;
                                }
                            };
                            ReadableStreamDefaultReaderRead(reader, readRequest);
                            return promiseResolvedWith(undefined);
                        }
                        function cancel1Algorithm(reason) {
                            canceled1 = true;
                            reason1 = reason;
                            if (canceled2) {
                                const compositeReason = CreateArrayFromList([reason1, reason2]);
                                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                                resolveCancelPromise(cancelResult);
                            }
                            return cancelPromise;
                        }
                        function cancel2Algorithm(reason) {
                            canceled2 = true;
                            reason2 = reason;
                            if (canceled1) {
                                const compositeReason = CreateArrayFromList([reason1, reason2]);
                                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                                resolveCancelPromise(cancelResult);
                            }
                            return cancelPromise;
                        }
                        function startAlgorithm() {
                            // do nothing
                        }
                        branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
                        branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
                        uponRejection(reader._closedPromise, (r) => {
                            ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
                            ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
                            if (!canceled1 || !canceled2) {
                                resolveCancelPromise(undefined);
                            }
                        });
                        return [branch1, branch2];
                    }
                    function ReadableByteStreamTee(stream) {
                        let reader = AcquireReadableStreamDefaultReader(stream);
                        let reading = false;
                        let readAgainForBranch1 = false;
                        let readAgainForBranch2 = false;
                        let canceled1 = false;
                        let canceled2 = false;
                        let reason1;
                        let reason2;
                        let branch1;
                        let branch2;
                        let resolveCancelPromise;
                        const cancelPromise = newPromise(resolve => {
                            resolveCancelPromise = resolve;
                        });
                        function forwardReaderError(thisReader) {
                            uponRejection(thisReader._closedPromise, r => {
                                if (thisReader !== reader) {
                                    return;
                                }
                                ReadableByteStreamControllerError(branch1._readableStreamController, r);
                                ReadableByteStreamControllerError(branch2._readableStreamController, r);
                                if (!canceled1 || !canceled2) {
                                    resolveCancelPromise(undefined);
                                }
                            });
                        }
                        function pullWithDefaultReader() {
                            if (IsReadableStreamBYOBReader(reader)) {
                                ReadableStreamReaderGenericRelease(reader);
                                reader = AcquireReadableStreamDefaultReader(stream);
                                forwardReaderError(reader);
                            }
                            const readRequest = {
                                _chunkSteps: chunk => {
                                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                                    queueMicrotask(() => {
                                        readAgainForBranch1 = false;
                                        readAgainForBranch2 = false;
                                        const chunk1 = chunk;
                                        let chunk2 = chunk;
                                        if (!canceled1 && !canceled2) {
                                            try {
                                                chunk2 = CloneAsUint8Array(chunk);
                                            }
                                            catch (cloneE) {
                                                ReadableByteStreamControllerError(branch1._readableStreamController, cloneE);
                                                ReadableByteStreamControllerError(branch2._readableStreamController, cloneE);
                                                resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                                                return;
                                            }
                                        }
                                        if (!canceled1) {
                                            ReadableByteStreamControllerEnqueue(branch1._readableStreamController, chunk1);
                                        }
                                        if (!canceled2) {
                                            ReadableByteStreamControllerEnqueue(branch2._readableStreamController, chunk2);
                                        }
                                        reading = false;
                                        if (readAgainForBranch1) {
                                            pull1Algorithm();
                                        }
                                        else if (readAgainForBranch2) {
                                            pull2Algorithm();
                                        }
                                    });
                                },
                                _closeSteps: () => {
                                    reading = false;
                                    if (!canceled1) {
                                        ReadableByteStreamControllerClose(branch1._readableStreamController);
                                    }
                                    if (!canceled2) {
                                        ReadableByteStreamControllerClose(branch2._readableStreamController);
                                    }
                                    if (branch1._readableStreamController._pendingPullIntos.length > 0) {
                                        ReadableByteStreamControllerRespond(branch1._readableStreamController, 0);
                                    }
                                    if (branch2._readableStreamController._pendingPullIntos.length > 0) {
                                        ReadableByteStreamControllerRespond(branch2._readableStreamController, 0);
                                    }
                                    if (!canceled1 || !canceled2) {
                                        resolveCancelPromise(undefined);
                                    }
                                },
                                _errorSteps: () => {
                                    reading = false;
                                }
                            };
                            ReadableStreamDefaultReaderRead(reader, readRequest);
                        }
                        function pullWithBYOBReader(view, forBranch2) {
                            if (IsReadableStreamDefaultReader(reader)) {
                                ReadableStreamReaderGenericRelease(reader);
                                reader = AcquireReadableStreamBYOBReader(stream);
                                forwardReaderError(reader);
                            }
                            const byobBranch = forBranch2 ? branch2 : branch1;
                            const otherBranch = forBranch2 ? branch1 : branch2;
                            const readIntoRequest = {
                                _chunkSteps: chunk => {
                                    // This needs to be delayed a microtask because it takes at least a microtask to detect errors (using
                                    // reader._closedPromise below), and we want errors in stream to error both branches immediately. We cannot let
                                    // successful synchronously-available reads get ahead of asynchronously-available errors.
                                    queueMicrotask(() => {
                                        readAgainForBranch1 = false;
                                        readAgainForBranch2 = false;
                                        const byobCanceled = forBranch2 ? canceled2 : canceled1;
                                        const otherCanceled = forBranch2 ? canceled1 : canceled2;
                                        if (!otherCanceled) {
                                            let clonedChunk;
                                            try {
                                                clonedChunk = CloneAsUint8Array(chunk);
                                            }
                                            catch (cloneE) {
                                                ReadableByteStreamControllerError(byobBranch._readableStreamController, cloneE);
                                                ReadableByteStreamControllerError(otherBranch._readableStreamController, cloneE);
                                                resolveCancelPromise(ReadableStreamCancel(stream, cloneE));
                                                return;
                                            }
                                            if (!byobCanceled) {
                                                ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                                            }
                                            ReadableByteStreamControllerEnqueue(otherBranch._readableStreamController, clonedChunk);
                                        }
                                        else if (!byobCanceled) {
                                            ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                                        }
                                        reading = false;
                                        if (readAgainForBranch1) {
                                            pull1Algorithm();
                                        }
                                        else if (readAgainForBranch2) {
                                            pull2Algorithm();
                                        }
                                    });
                                },
                                _closeSteps: chunk => {
                                    reading = false;
                                    const byobCanceled = forBranch2 ? canceled2 : canceled1;
                                    const otherCanceled = forBranch2 ? canceled1 : canceled2;
                                    if (!byobCanceled) {
                                        ReadableByteStreamControllerClose(byobBranch._readableStreamController);
                                    }
                                    if (!otherCanceled) {
                                        ReadableByteStreamControllerClose(otherBranch._readableStreamController);
                                    }
                                    if (chunk !== undefined) {
                                        if (!byobCanceled) {
                                            ReadableByteStreamControllerRespondWithNewView(byobBranch._readableStreamController, chunk);
                                        }
                                        if (!otherCanceled && otherBranch._readableStreamController._pendingPullIntos.length > 0) {
                                            ReadableByteStreamControllerRespond(otherBranch._readableStreamController, 0);
                                        }
                                    }
                                    if (!byobCanceled || !otherCanceled) {
                                        resolveCancelPromise(undefined);
                                    }
                                },
                                _errorSteps: () => {
                                    reading = false;
                                }
                            };
                            ReadableStreamBYOBReaderRead(reader, view, readIntoRequest);
                        }
                        function pull1Algorithm() {
                            if (reading) {
                                readAgainForBranch1 = true;
                                return promiseResolvedWith(undefined);
                            }
                            reading = true;
                            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch1._readableStreamController);
                            if (byobRequest === null) {
                                pullWithDefaultReader();
                            }
                            else {
                                pullWithBYOBReader(byobRequest._view, false);
                            }
                            return promiseResolvedWith(undefined);
                        }
                        function pull2Algorithm() {
                            if (reading) {
                                readAgainForBranch2 = true;
                                return promiseResolvedWith(undefined);
                            }
                            reading = true;
                            const byobRequest = ReadableByteStreamControllerGetBYOBRequest(branch2._readableStreamController);
                            if (byobRequest === null) {
                                pullWithDefaultReader();
                            }
                            else {
                                pullWithBYOBReader(byobRequest._view, true);
                            }
                            return promiseResolvedWith(undefined);
                        }
                        function cancel1Algorithm(reason) {
                            canceled1 = true;
                            reason1 = reason;
                            if (canceled2) {
                                const compositeReason = CreateArrayFromList([reason1, reason2]);
                                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                                resolveCancelPromise(cancelResult);
                            }
                            return cancelPromise;
                        }
                        function cancel2Algorithm(reason) {
                            canceled2 = true;
                            reason2 = reason;
                            if (canceled1) {
                                const compositeReason = CreateArrayFromList([reason1, reason2]);
                                const cancelResult = ReadableStreamCancel(stream, compositeReason);
                                resolveCancelPromise(cancelResult);
                            }
                            return cancelPromise;
                        }
                        function startAlgorithm() {
                            return;
                        }
                        branch1 = CreateReadableByteStream(startAlgorithm, pull1Algorithm, cancel1Algorithm);
                        branch2 = CreateReadableByteStream(startAlgorithm, pull2Algorithm, cancel2Algorithm);
                        forwardReaderError(reader);
                        return [branch1, branch2];
                    }

                    function convertUnderlyingDefaultOrByteSource(source, context) {
                        assertDictionary(source, context);
                        const original = source;
                        const autoAllocateChunkSize = original === null || original === void 0 ? void 0 : original.autoAllocateChunkSize;
                        const cancel = original === null || original === void 0 ? void 0 : original.cancel;
                        const pull = original === null || original === void 0 ? void 0 : original.pull;
                        const start = original === null || original === void 0 ? void 0 : original.start;
                        const type = original === null || original === void 0 ? void 0 : original.type;
                        return {
                            autoAllocateChunkSize: autoAllocateChunkSize === undefined ?
                                undefined :
                                convertUnsignedLongLongWithEnforceRange(autoAllocateChunkSize, `${context} has member 'autoAllocateChunkSize' that`),
                            cancel: cancel === undefined ?
                                undefined :
                                convertUnderlyingSourceCancelCallback(cancel, original, `${context} has member 'cancel' that`),
                            pull: pull === undefined ?
                                undefined :
                                convertUnderlyingSourcePullCallback(pull, original, `${context} has member 'pull' that`),
                            start: start === undefined ?
                                undefined :
                                convertUnderlyingSourceStartCallback(start, original, `${context} has member 'start' that`),
                            type: type === undefined ? undefined : convertReadableStreamType(type, `${context} has member 'type' that`)
                        };
                    }
                    function convertUnderlyingSourceCancelCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (reason) => promiseCall(fn, original, [reason]);
                    }
                    function convertUnderlyingSourcePullCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (controller) => promiseCall(fn, original, [controller]);
                    }
                    function convertUnderlyingSourceStartCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (controller) => reflectCall(fn, original, [controller]);
                    }
                    function convertReadableStreamType(type, context) {
                        type = `${type}`;
                        if (type !== 'bytes') {
                            throw new TypeError(`${context} '${type}' is not a valid enumeration value for ReadableStreamType`);
                        }
                        return type;
                    }

                    function convertReaderOptions(options, context) {
                        assertDictionary(options, context);
                        const mode = options === null || options === void 0 ? void 0 : options.mode;
                        return {
                            mode: mode === undefined ? undefined : convertReadableStreamReaderMode(mode, `${context} has member 'mode' that`)
                        };
                    }
                    function convertReadableStreamReaderMode(mode, context) {
                        mode = `${mode}`;
                        if (mode !== 'byob') {
                            throw new TypeError(`${context} '${mode}' is not a valid enumeration value for ReadableStreamReaderMode`);
                        }
                        return mode;
                    }

                    function convertIteratorOptions(options, context) {
                        assertDictionary(options, context);
                        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
                        return { preventCancel: Boolean(preventCancel) };
                    }

                    function convertPipeOptions(options, context) {
                        assertDictionary(options, context);
                        const preventAbort = options === null || options === void 0 ? void 0 : options.preventAbort;
                        const preventCancel = options === null || options === void 0 ? void 0 : options.preventCancel;
                        const preventClose = options === null || options === void 0 ? void 0 : options.preventClose;
                        const signal = options === null || options === void 0 ? void 0 : options.signal;
                        if (signal !== undefined) {
                            assertAbortSignal(signal, `${context} has member 'signal' that`);
                        }
                        return {
                            preventAbort: Boolean(preventAbort),
                            preventCancel: Boolean(preventCancel),
                            preventClose: Boolean(preventClose),
                            signal
                        };
                    }
                    function assertAbortSignal(signal, context) {
                        if (!isAbortSignal(signal)) {
                            throw new TypeError(`${context} is not an AbortSignal.`);
                        }
                    }

                    function convertReadableWritablePair(pair, context) {
                        assertDictionary(pair, context);
                        const readable = pair === null || pair === void 0 ? void 0 : pair.readable;
                        assertRequiredField(readable, 'readable', 'ReadableWritablePair');
                        assertReadableStream(readable, `${context} has member 'readable' that`);
                        const writable = pair === null || pair === void 0 ? void 0 : pair.writable;
                        assertRequiredField(writable, 'writable', 'ReadableWritablePair');
                        assertWritableStream(writable, `${context} has member 'writable' that`);
                        return { readable, writable };
                    }

                    /**
                     * A readable stream represents a source of data, from which you can read.
                     *
                     * @public
                     */
                    class ReadableStream {
                        constructor(rawUnderlyingSource = {}, rawStrategy = {}) {
                            if (rawUnderlyingSource === undefined) {
                                rawUnderlyingSource = null;
                            }
                            else {
                                assertObject(rawUnderlyingSource, 'First parameter');
                            }
                            const strategy = convertQueuingStrategy(rawStrategy, 'Second parameter');
                            const underlyingSource = convertUnderlyingDefaultOrByteSource(rawUnderlyingSource, 'First parameter');
                            InitializeReadableStream(this);
                            if (underlyingSource.type === 'bytes') {
                                if (strategy.size !== undefined) {
                                    throw new RangeError('The strategy for a byte stream cannot have a size function');
                                }
                                const highWaterMark = ExtractHighWaterMark(strategy, 0);
                                SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
                            }
                            else {
                                const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
                                const highWaterMark = ExtractHighWaterMark(strategy, 1);
                                SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
                            }
                        }
                        /**
                         * Whether or not the readable stream is locked to a {@link ReadableStreamDefaultReader | reader}.
                         */
                        get locked() {
                            if (!IsReadableStream(this)) {
                                throw streamBrandCheckException$1('locked');
                            }
                            return IsReadableStreamLocked(this);
                        }
                        /**
                         * Cancels the stream, signaling a loss of interest in the stream by a consumer.
                         *
                         * The supplied `reason` argument will be given to the underlying source's {@link UnderlyingSource.cancel | cancel()}
                         * method, which might or might not use it.
                         */
                        cancel(reason = undefined) {
                            if (!IsReadableStream(this)) {
                                return promiseRejectedWith(streamBrandCheckException$1('cancel'));
                            }
                            if (IsReadableStreamLocked(this)) {
                                return promiseRejectedWith(new TypeError('Cannot cancel a stream that already has a reader'));
                            }
                            return ReadableStreamCancel(this, reason);
                        }
                        getReader(rawOptions = undefined) {
                            if (!IsReadableStream(this)) {
                                throw streamBrandCheckException$1('getReader');
                            }
                            const options = convertReaderOptions(rawOptions, 'First parameter');
                            if (options.mode === undefined) {
                                return AcquireReadableStreamDefaultReader(this);
                            }
                            return AcquireReadableStreamBYOBReader(this);
                        }
                        pipeThrough(rawTransform, rawOptions = {}) {
                            if (!IsReadableStream(this)) {
                                throw streamBrandCheckException$1('pipeThrough');
                            }
                            assertRequiredArgument(rawTransform, 1, 'pipeThrough');
                            const transform = convertReadableWritablePair(rawTransform, 'First parameter');
                            const options = convertPipeOptions(rawOptions, 'Second parameter');
                            if (IsReadableStreamLocked(this)) {
                                throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream');
                            }
                            if (IsWritableStreamLocked(transform.writable)) {
                                throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream');
                            }
                            const promise = ReadableStreamPipeTo(this, transform.writable, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
                            setPromiseIsHandledToTrue(promise);
                            return transform.readable;
                        }
                        pipeTo(destination, rawOptions = {}) {
                            if (!IsReadableStream(this)) {
                                return promiseRejectedWith(streamBrandCheckException$1('pipeTo'));
                            }
                            if (destination === undefined) {
                                return promiseRejectedWith(`Parameter 1 is required in 'pipeTo'.`);
                            }
                            if (!IsWritableStream(destination)) {
                                return promiseRejectedWith(new TypeError(`ReadableStream.prototype.pipeTo's first argument must be a WritableStream`));
                            }
                            let options;
                            try {
                                options = convertPipeOptions(rawOptions, 'Second parameter');
                            }
                            catch (e) {
                                return promiseRejectedWith(e);
                            }
                            if (IsReadableStreamLocked(this)) {
                                return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream'));
                            }
                            if (IsWritableStreamLocked(destination)) {
                                return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream'));
                            }
                            return ReadableStreamPipeTo(this, destination, options.preventClose, options.preventAbort, options.preventCancel, options.signal);
                        }
                        /**
                         * Tees this readable stream, returning a two-element array containing the two resulting branches as
                         * new {@link ReadableStream} instances.
                         *
                         * Teeing a stream will lock it, preventing any other consumer from acquiring a reader.
                         * To cancel the stream, cancel both of the resulting branches; a composite cancellation reason will then be
                         * propagated to the stream's underlying source.
                         *
                         * Note that the chunks seen in each branch will be the same object. If the chunks are not immutable,
                         * this could allow interference between the two branches.
                         */
                        tee() {
                            if (!IsReadableStream(this)) {
                                throw streamBrandCheckException$1('tee');
                            }
                            const branches = ReadableStreamTee(this);
                            return CreateArrayFromList(branches);
                        }
                        values(rawOptions = undefined) {
                            if (!IsReadableStream(this)) {
                                throw streamBrandCheckException$1('values');
                            }
                            const options = convertIteratorOptions(rawOptions, 'First parameter');
                            return AcquireReadableStreamAsyncIterator(this, options.preventCancel);
                        }
                    }
                    Object.defineProperties(ReadableStream.prototype, {
                        cancel: { enumerable: true },
                        getReader: { enumerable: true },
                        pipeThrough: { enumerable: true },
                        pipeTo: { enumerable: true },
                        tee: { enumerable: true },
                        values: { enumerable: true },
                        locked: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.toStringTag, {
                            value: 'ReadableStream',
                            configurable: true
                        });
                    }
                    if (typeof SymbolPolyfill.asyncIterator === 'symbol') {
                        Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.asyncIterator, {
                            value: ReadableStream.prototype.values,
                            writable: true,
                            configurable: true
                        });
                    }
                    // Abstract operations for the ReadableStream.
                    // Throws if and only if startAlgorithm throws.
                    function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
                        const stream = Object.create(ReadableStream.prototype);
                        InitializeReadableStream(stream);
                        const controller = Object.create(ReadableStreamDefaultController.prototype);
                        SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
                        return stream;
                    }
                    // Throws if and only if startAlgorithm throws.
                    function CreateReadableByteStream(startAlgorithm, pullAlgorithm, cancelAlgorithm) {
                        const stream = Object.create(ReadableStream.prototype);
                        InitializeReadableStream(stream);
                        const controller = Object.create(ReadableByteStreamController.prototype);
                        SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, 0, undefined);
                        return stream;
                    }
                    function InitializeReadableStream(stream) {
                        stream._state = 'readable';
                        stream._reader = undefined;
                        stream._storedError = undefined;
                        stream._disturbed = false;
                    }
                    function IsReadableStream(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_readableStreamController')) {
                            return false;
                        }
                        return x instanceof ReadableStream;
                    }
                    function IsReadableStreamLocked(stream) {
                        if (stream._reader === undefined) {
                            return false;
                        }
                        return true;
                    }
                    // ReadableStream API exposed for controllers.
                    function ReadableStreamCancel(stream, reason) {
                        stream._disturbed = true;
                        if (stream._state === 'closed') {
                            return promiseResolvedWith(undefined);
                        }
                        if (stream._state === 'errored') {
                            return promiseRejectedWith(stream._storedError);
                        }
                        ReadableStreamClose(stream);
                        const reader = stream._reader;
                        if (reader !== undefined && IsReadableStreamBYOBReader(reader)) {
                            reader._readIntoRequests.forEach(readIntoRequest => {
                                readIntoRequest._closeSteps(undefined);
                            });
                            reader._readIntoRequests = new SimpleQueue();
                        }
                        const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
                        return transformPromiseWith(sourceCancelPromise, noop);
                    }
                    function ReadableStreamClose(stream) {
                        stream._state = 'closed';
                        const reader = stream._reader;
                        if (reader === undefined) {
                            return;
                        }
                        defaultReaderClosedPromiseResolve(reader);
                        if (IsReadableStreamDefaultReader(reader)) {
                            reader._readRequests.forEach(readRequest => {
                                readRequest._closeSteps();
                            });
                            reader._readRequests = new SimpleQueue();
                        }
                    }
                    function ReadableStreamError(stream, e) {
                        stream._state = 'errored';
                        stream._storedError = e;
                        const reader = stream._reader;
                        if (reader === undefined) {
                            return;
                        }
                        defaultReaderClosedPromiseReject(reader, e);
                        if (IsReadableStreamDefaultReader(reader)) {
                            reader._readRequests.forEach(readRequest => {
                                readRequest._errorSteps(e);
                            });
                            reader._readRequests = new SimpleQueue();
                        }
                        else {
                            reader._readIntoRequests.forEach(readIntoRequest => {
                                readIntoRequest._errorSteps(e);
                            });
                            reader._readIntoRequests = new SimpleQueue();
                        }
                    }
                    // Helper functions for the ReadableStream.
                    function streamBrandCheckException$1(name) {
                        return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
                    }

                    function convertQueuingStrategyInit(init, context) {
                        assertDictionary(init, context);
                        const highWaterMark = init === null || init === void 0 ? void 0 : init.highWaterMark;
                        assertRequiredField(highWaterMark, 'highWaterMark', 'QueuingStrategyInit');
                        return {
                            highWaterMark: convertUnrestrictedDouble(highWaterMark)
                        };
                    }

                    // The size function must not have a prototype property nor be a constructor
                    const byteLengthSizeFunction = (chunk) => {
                        return chunk.byteLength;
                    };
                    try {
                        Object.defineProperty(byteLengthSizeFunction, 'name', {
                            value: 'size',
                            configurable: true
                        });
                    }
                    catch (_a) {
                        // This property is non-configurable in older browsers, so ignore if this throws.
                        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
                    }
                    /**
                     * A queuing strategy that counts the number of bytes in each chunk.
                     *
                     * @public
                     */
                    class ByteLengthQueuingStrategy {
                        constructor(options) {
                            assertRequiredArgument(options, 1, 'ByteLengthQueuingStrategy');
                            options = convertQueuingStrategyInit(options, 'First parameter');
                            this._byteLengthQueuingStrategyHighWaterMark = options.highWaterMark;
                        }
                        /**
                         * Returns the high water mark provided to the constructor.
                         */
                        get highWaterMark() {
                            if (!IsByteLengthQueuingStrategy(this)) {
                                throw byteLengthBrandCheckException('highWaterMark');
                            }
                            return this._byteLengthQueuingStrategyHighWaterMark;
                        }
                        /**
                         * Measures the size of `chunk` by returning the value of its `byteLength` property.
                         */
                        get size() {
                            if (!IsByteLengthQueuingStrategy(this)) {
                                throw byteLengthBrandCheckException('size');
                            }
                            return byteLengthSizeFunction;
                        }
                    }
                    Object.defineProperties(ByteLengthQueuingStrategy.prototype, {
                        highWaterMark: { enumerable: true },
                        size: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(ByteLengthQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
                            value: 'ByteLengthQueuingStrategy',
                            configurable: true
                        });
                    }
                    // Helper functions for the ByteLengthQueuingStrategy.
                    function byteLengthBrandCheckException(name) {
                        return new TypeError(`ByteLengthQueuingStrategy.prototype.${name} can only be used on a ByteLengthQueuingStrategy`);
                    }
                    function IsByteLengthQueuingStrategy(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_byteLengthQueuingStrategyHighWaterMark')) {
                            return false;
                        }
                        return x instanceof ByteLengthQueuingStrategy;
                    }

                    // The size function must not have a prototype property nor be a constructor
                    const countSizeFunction = () => {
                        return 1;
                    };
                    try {
                        Object.defineProperty(countSizeFunction, 'name', {
                            value: 'size',
                            configurable: true
                        });
                    }
                    catch (_a) {
                        // This property is non-configurable in older browsers, so ignore if this throws.
                        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name#browser_compatibility
                    }
                    /**
                     * A queuing strategy that counts the number of chunks.
                     *
                     * @public
                     */
                    class CountQueuingStrategy {
                        constructor(options) {
                            assertRequiredArgument(options, 1, 'CountQueuingStrategy');
                            options = convertQueuingStrategyInit(options, 'First parameter');
                            this._countQueuingStrategyHighWaterMark = options.highWaterMark;
                        }
                        /**
                         * Returns the high water mark provided to the constructor.
                         */
                        get highWaterMark() {
                            if (!IsCountQueuingStrategy(this)) {
                                throw countBrandCheckException('highWaterMark');
                            }
                            return this._countQueuingStrategyHighWaterMark;
                        }
                        /**
                         * Measures the size of `chunk` by always returning 1.
                         * This ensures that the total queue size is a count of the number of chunks in the queue.
                         */
                        get size() {
                            if (!IsCountQueuingStrategy(this)) {
                                throw countBrandCheckException('size');
                            }
                            return countSizeFunction;
                        }
                    }
                    Object.defineProperties(CountQueuingStrategy.prototype, {
                        highWaterMark: { enumerable: true },
                        size: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(CountQueuingStrategy.prototype, SymbolPolyfill.toStringTag, {
                            value: 'CountQueuingStrategy',
                            configurable: true
                        });
                    }
                    // Helper functions for the CountQueuingStrategy.
                    function countBrandCheckException(name) {
                        return new TypeError(`CountQueuingStrategy.prototype.${name} can only be used on a CountQueuingStrategy`);
                    }
                    function IsCountQueuingStrategy(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_countQueuingStrategyHighWaterMark')) {
                            return false;
                        }
                        return x instanceof CountQueuingStrategy;
                    }

                    function convertTransformer(original, context) {
                        assertDictionary(original, context);
                        const flush = original === null || original === void 0 ? void 0 : original.flush;
                        const readableType = original === null || original === void 0 ? void 0 : original.readableType;
                        const start = original === null || original === void 0 ? void 0 : original.start;
                        const transform = original === null || original === void 0 ? void 0 : original.transform;
                        const writableType = original === null || original === void 0 ? void 0 : original.writableType;
                        return {
                            flush: flush === undefined ?
                                undefined :
                                convertTransformerFlushCallback(flush, original, `${context} has member 'flush' that`),
                            readableType,
                            start: start === undefined ?
                                undefined :
                                convertTransformerStartCallback(start, original, `${context} has member 'start' that`),
                            transform: transform === undefined ?
                                undefined :
                                convertTransformerTransformCallback(transform, original, `${context} has member 'transform' that`),
                            writableType
                        };
                    }
                    function convertTransformerFlushCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (controller) => promiseCall(fn, original, [controller]);
                    }
                    function convertTransformerStartCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (controller) => reflectCall(fn, original, [controller]);
                    }
                    function convertTransformerTransformCallback(fn, original, context) {
                        assertFunction(fn, context);
                        return (chunk, controller) => promiseCall(fn, original, [chunk, controller]);
                    }

                    // Class TransformStream
                    /**
                     * A transform stream consists of a pair of streams: a {@link WritableStream | writable stream},
                     * known as its writable side, and a {@link ReadableStream | readable stream}, known as its readable side.
                     * In a manner specific to the transform stream in question, writes to the writable side result in new data being
                     * made available for reading from the readable side.
                     *
                     * @public
                     */
                    class TransformStream {
                        constructor(rawTransformer = {}, rawWritableStrategy = {}, rawReadableStrategy = {}) {
                            if (rawTransformer === undefined) {
                                rawTransformer = null;
                            }
                            const writableStrategy = convertQueuingStrategy(rawWritableStrategy, 'Second parameter');
                            const readableStrategy = convertQueuingStrategy(rawReadableStrategy, 'Third parameter');
                            const transformer = convertTransformer(rawTransformer, 'First parameter');
                            if (transformer.readableType !== undefined) {
                                throw new RangeError('Invalid readableType specified');
                            }
                            if (transformer.writableType !== undefined) {
                                throw new RangeError('Invalid writableType specified');
                            }
                            const readableHighWaterMark = ExtractHighWaterMark(readableStrategy, 0);
                            const readableSizeAlgorithm = ExtractSizeAlgorithm(readableStrategy);
                            const writableHighWaterMark = ExtractHighWaterMark(writableStrategy, 1);
                            const writableSizeAlgorithm = ExtractSizeAlgorithm(writableStrategy);
                            let startPromise_resolve;
                            const startPromise = newPromise(resolve => {
                                startPromise_resolve = resolve;
                            });
                            InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
                            SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
                            if (transformer.start !== undefined) {
                                startPromise_resolve(transformer.start(this._transformStreamController));
                            }
                            else {
                                startPromise_resolve(undefined);
                            }
                        }
                        /**
                         * The readable side of the transform stream.
                         */
                        get readable() {
                            if (!IsTransformStream(this)) {
                                throw streamBrandCheckException('readable');
                            }
                            return this._readable;
                        }
                        /**
                         * The writable side of the transform stream.
                         */
                        get writable() {
                            if (!IsTransformStream(this)) {
                                throw streamBrandCheckException('writable');
                            }
                            return this._writable;
                        }
                    }
                    Object.defineProperties(TransformStream.prototype, {
                        readable: { enumerable: true },
                        writable: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(TransformStream.prototype, SymbolPolyfill.toStringTag, {
                            value: 'TransformStream',
                            configurable: true
                        });
                    }
                    function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
                        function startAlgorithm() {
                            return startPromise;
                        }
                        function writeAlgorithm(chunk) {
                            return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
                        }
                        function abortAlgorithm(reason) {
                            return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
                        }
                        function closeAlgorithm() {
                            return TransformStreamDefaultSinkCloseAlgorithm(stream);
                        }
                        stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
                        function pullAlgorithm() {
                            return TransformStreamDefaultSourcePullAlgorithm(stream);
                        }
                        function cancelAlgorithm(reason) {
                            TransformStreamErrorWritableAndUnblockWrite(stream, reason);
                            return promiseResolvedWith(undefined);
                        }
                        stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
                        // The [[backpressure]] slot is set to undefined so that it can be initialised by TransformStreamSetBackpressure.
                        stream._backpressure = undefined;
                        stream._backpressureChangePromise = undefined;
                        stream._backpressureChangePromise_resolve = undefined;
                        TransformStreamSetBackpressure(stream, true);
                        stream._transformStreamController = undefined;
                    }
                    function IsTransformStream(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_transformStreamController')) {
                            return false;
                        }
                        return x instanceof TransformStream;
                    }
                    // This is a no-op if both sides are already errored.
                    function TransformStreamError(stream, e) {
                        ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
                        TransformStreamErrorWritableAndUnblockWrite(stream, e);
                    }
                    function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
                        TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
                        WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
                        if (stream._backpressure) {
                            // Pretend that pull() was called to permit any pending write() calls to complete. TransformStreamSetBackpressure()
                            // cannot be called from enqueue() or pull() once the ReadableStream is errored, so this will will be the final time
                            // _backpressure is set.
                            TransformStreamSetBackpressure(stream, false);
                        }
                    }
                    function TransformStreamSetBackpressure(stream, backpressure) {
                        // Passes also when called during construction.
                        if (stream._backpressureChangePromise !== undefined) {
                            stream._backpressureChangePromise_resolve();
                        }
                        stream._backpressureChangePromise = newPromise(resolve => {
                            stream._backpressureChangePromise_resolve = resolve;
                        });
                        stream._backpressure = backpressure;
                    }
                    // Class TransformStreamDefaultController
                    /**
                     * Allows control of the {@link ReadableStream} and {@link WritableStream} of the associated {@link TransformStream}.
                     *
                     * @public
                     */
                    class TransformStreamDefaultController {
                        constructor() {
                            throw new TypeError('Illegal constructor');
                        }
                        /**
                         * Returns the desired size to fill the readable side’s internal queue. It can be negative, if the queue is over-full.
                         */
                        get desiredSize() {
                            if (!IsTransformStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException('desiredSize');
                            }
                            const readableController = this._controlledTransformStream._readable._readableStreamController;
                            return ReadableStreamDefaultControllerGetDesiredSize(readableController);
                        }
                        enqueue(chunk = undefined) {
                            if (!IsTransformStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException('enqueue');
                            }
                            TransformStreamDefaultControllerEnqueue(this, chunk);
                        }
                        /**
                         * Errors both the readable side and the writable side of the controlled transform stream, making all future
                         * interactions with it fail with the given error `e`. Any chunks queued for transformation will be discarded.
                         */
                        error(reason = undefined) {
                            if (!IsTransformStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException('error');
                            }
                            TransformStreamDefaultControllerError(this, reason);
                        }
                        /**
                         * Closes the readable side and errors the writable side of the controlled transform stream. This is useful when the
                         * transformer only needs to consume a portion of the chunks written to the writable side.
                         */
                        terminate() {
                            if (!IsTransformStreamDefaultController(this)) {
                                throw defaultControllerBrandCheckException('terminate');
                            }
                            TransformStreamDefaultControllerTerminate(this);
                        }
                    }
                    Object.defineProperties(TransformStreamDefaultController.prototype, {
                        enqueue: { enumerable: true },
                        error: { enumerable: true },
                        terminate: { enumerable: true },
                        desiredSize: { enumerable: true }
                    });
                    if (typeof SymbolPolyfill.toStringTag === 'symbol') {
                        Object.defineProperty(TransformStreamDefaultController.prototype, SymbolPolyfill.toStringTag, {
                            value: 'TransformStreamDefaultController',
                            configurable: true
                        });
                    }
                    // Transform Stream Default Controller Abstract Operations
                    function IsTransformStreamDefaultController(x) {
                        if (!typeIsObject(x)) {
                            return false;
                        }
                        if (!Object.prototype.hasOwnProperty.call(x, '_controlledTransformStream')) {
                            return false;
                        }
                        return x instanceof TransformStreamDefaultController;
                    }
                    function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
                        controller._controlledTransformStream = stream;
                        stream._transformStreamController = controller;
                        controller._transformAlgorithm = transformAlgorithm;
                        controller._flushAlgorithm = flushAlgorithm;
                    }
                    function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
                        const controller = Object.create(TransformStreamDefaultController.prototype);
                        let transformAlgorithm = (chunk) => {
                            try {
                                TransformStreamDefaultControllerEnqueue(controller, chunk);
                                return promiseResolvedWith(undefined);
                            }
                            catch (transformResultE) {
                                return promiseRejectedWith(transformResultE);
                            }
                        };
                        let flushAlgorithm = () => promiseResolvedWith(undefined);
                        if (transformer.transform !== undefined) {
                            transformAlgorithm = chunk => transformer.transform(chunk, controller);
                        }
                        if (transformer.flush !== undefined) {
                            flushAlgorithm = () => transformer.flush(controller);
                        }
                        SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
                    }
                    function TransformStreamDefaultControllerClearAlgorithms(controller) {
                        controller._transformAlgorithm = undefined;
                        controller._flushAlgorithm = undefined;
                    }
                    function TransformStreamDefaultControllerEnqueue(controller, chunk) {
                        const stream = controller._controlledTransformStream;
                        const readableController = stream._readable._readableStreamController;
                        if (!ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController)) {
                            throw new TypeError('Readable side is not in a state that permits enqueue');
                        }
                        // We throttle transform invocations based on the backpressure of the ReadableStream, but we still
                        // accept TransformStreamDefaultControllerEnqueue() calls.
                        try {
                            ReadableStreamDefaultControllerEnqueue(readableController, chunk);
                        }
                        catch (e) {
                            // This happens when readableStrategy.size() throws.
                            TransformStreamErrorWritableAndUnblockWrite(stream, e);
                            throw stream._readable._storedError;
                        }
                        const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
                        if (backpressure !== stream._backpressure) {
                            TransformStreamSetBackpressure(stream, true);
                        }
                    }
                    function TransformStreamDefaultControllerError(controller, e) {
                        TransformStreamError(controller._controlledTransformStream, e);
                    }
                    function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
                        const transformPromise = controller._transformAlgorithm(chunk);
                        return transformPromiseWith(transformPromise, undefined, r => {
                            TransformStreamError(controller._controlledTransformStream, r);
                            throw r;
                        });
                    }
                    function TransformStreamDefaultControllerTerminate(controller) {
                        const stream = controller._controlledTransformStream;
                        const readableController = stream._readable._readableStreamController;
                        ReadableStreamDefaultControllerClose(readableController);
                        const error = new TypeError('TransformStream terminated');
                        TransformStreamErrorWritableAndUnblockWrite(stream, error);
                    }
                    // TransformStreamDefaultSink Algorithms
                    function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
                        const controller = stream._transformStreamController;
                        if (stream._backpressure) {
                            const backpressureChangePromise = stream._backpressureChangePromise;
                            return transformPromiseWith(backpressureChangePromise, () => {
                                const writable = stream._writable;
                                const state = writable._state;
                                if (state === 'erroring') {
                                    throw writable._storedError;
                                }
                                return TransformStreamDefaultControllerPerformTransform(controller, chunk);
                            });
                        }
                        return TransformStreamDefaultControllerPerformTransform(controller, chunk);
                    }
                    function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
                        // abort() is not called synchronously, so it is possible for abort() to be called when the stream is already
                        // errored.
                        TransformStreamError(stream, reason);
                        return promiseResolvedWith(undefined);
                    }
                    function TransformStreamDefaultSinkCloseAlgorithm(stream) {
                        // stream._readable cannot change after construction, so caching it across a call to user code is safe.
                        const readable = stream._readable;
                        const controller = stream._transformStreamController;
                        const flushPromise = controller._flushAlgorithm();
                        TransformStreamDefaultControllerClearAlgorithms(controller);
                        // Return a promise that is fulfilled with undefined on success.
                        return transformPromiseWith(flushPromise, () => {
                            if (readable._state === 'errored') {
                                throw readable._storedError;
                            }
                            ReadableStreamDefaultControllerClose(readable._readableStreamController);
                        }, r => {
                            TransformStreamError(stream, r);
                            throw readable._storedError;
                        });
                    }
                    // TransformStreamDefaultSource Algorithms
                    function TransformStreamDefaultSourcePullAlgorithm(stream) {
                        // Invariant. Enforced by the promises returned by start() and pull().
                        TransformStreamSetBackpressure(stream, false);
                        // Prevent the next pull() call until there is backpressure.
                        return stream._backpressureChangePromise;
                    }
                    // Helper functions for the TransformStreamDefaultController.
                    function defaultControllerBrandCheckException(name) {
                        return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
                    }
                    // Helper functions for the TransformStream.
                    function streamBrandCheckException(name) {
                        return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
                    }

                    exports.ByteLengthQueuingStrategy = ByteLengthQueuingStrategy;
                    exports.CountQueuingStrategy = CountQueuingStrategy;
                    exports.ReadableByteStreamController = ReadableByteStreamController;
                    exports.ReadableStream = ReadableStream;
                    exports.ReadableStreamBYOBReader = ReadableStreamBYOBReader;
                    exports.ReadableStreamBYOBRequest = ReadableStreamBYOBRequest;
                    exports.ReadableStreamDefaultController = ReadableStreamDefaultController;
                    exports.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
                    exports.TransformStream = TransformStream;
                    exports.TransformStreamDefaultController = TransformStreamDefaultController;
                    exports.WritableStream = WritableStream;
                    exports.WritableStreamDefaultController = WritableStreamDefaultController;
                    exports.WritableStreamDefaultWriter = WritableStreamDefaultWriter;

                    Object.defineProperty(exports, '__esModule', { value: true });

                })));
                //# sourceMappingURL=ponyfill.es2018.js.map


                /***/
            }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("buffer");

                /***/
            }),

/***/ "node:buffer":
/*!******************************!*\
  !*** external "node:buffer" ***!
  \******************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:buffer");

                /***/
            }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:fs");

                /***/
            }),

/***/ "node:http":
/*!****************************!*\
  !*** external "node:http" ***!
  \****************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:http");

                /***/
            }),

/***/ "node:https":
/*!*****************************!*\
  !*** external "node:https" ***!
  \*****************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:https");

                /***/
            }),

/***/ "node:net":
/*!***************************!*\
  !*** external "node:net" ***!
  \***************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:net");

                /***/
            }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:path");

                /***/
            }),

/***/ "node:process":
/*!*******************************!*\
  !*** external "node:process" ***!
  \*******************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:process");

                /***/
            }),

/***/ "node:stream":
/*!******************************!*\
  !*** external "node:stream" ***!
  \******************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:stream");

                /***/
            }),

/***/ "node:stream/web":
/*!**********************************!*\
  !*** external "node:stream/web" ***!
  \**********************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:stream/web");

                /***/
            }),

/***/ "node:url":
/*!***************************!*\
  !*** external "node:url" ***!
  \***************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:url");

                /***/
            }),

/***/ "node:util":
/*!****************************!*\
  !*** external "node:util" ***!
  \****************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:util");

                /***/
            }),

/***/ "node:zlib":
/*!****************************!*\
  !*** external "node:zlib" ***!
  \****************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("node:zlib");

                /***/
            }),

/***/ "worker_threads":
/*!*********************************!*\
  !*** external "worker_threads" ***!
  \*********************************/
/***/ ((module) => {

                "use strict";
                module.exports = require("worker_threads");

                /***/
            }),

/***/ "./node_modules/fetch-blob/streams.cjs":
/*!*********************************************!*\
  !*** ./node_modules/fetch-blob/streams.cjs ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

                /* c8 ignore start */
                // 64 KiB (same size chrome slice theirs blob into Uint8array's)
                const POOL_SIZE = 65536

                if (!globalThis.ReadableStream) {
                    // `node:stream/web` got introduced in v16.5.0 as experimental
                    // and it's preferred over the polyfilled version. So we also
                    // suppress the warning that gets emitted by NodeJS for using it.
                    try {
                        const process = __webpack_require__(/*! node:process */ "node:process")
                        const { emitWarning } = process
                        try {
                            process.emitWarning = () => { }
                            Object.assign(globalThis, __webpack_require__(/*! node:stream/web */ "node:stream/web"))
                            process.emitWarning = emitWarning
                        } catch (error) {
                            process.emitWarning = emitWarning
                            throw error
                        }
                    } catch (error) {
                        // fallback to polyfill implementation
                        Object.assign(globalThis, __webpack_require__(/*! web-streams-polyfill/dist/ponyfill.es2018.js */ "./node_modules/web-streams-polyfill/dist/ponyfill.es2018.js"))
                    }
                }

                try {
                    // Don't use node: prefix for this, require+node: is not supported until node v14.14
                    // Only `import()` can use prefix in 12.20 and later
                    const { Blob } = __webpack_require__(/*! buffer */ "buffer")
                    if (Blob && !Blob.prototype.stream) {
                        Blob.prototype.stream = function name(params) {
                            let position = 0
                            const blob = this

                            return new ReadableStream({
                                type: 'bytes',
                                async pull(ctrl) {
                                    const chunk = blob.slice(position, Math.min(blob.size, position + POOL_SIZE))
                                    const buffer = await chunk.arrayBuffer()
                                    position += buffer.byteLength
                                    ctrl.enqueue(new Uint8Array(buffer))

                                    if (position === blob.size) {
                                        ctrl.close()
                                    }
                                }
                            })
                        }
                    }
                } catch (error) { }
                /* c8 ignore end */


                /***/
            }),

/***/ "./node_modules/data-uri-to-buffer/dist/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/data-uri-to-buffer/dist/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "dataUriToBuffer": () => (/* binding */ dataUriToBuffer),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
                    /* harmony export */
                });
                /**
                 * Returns a `Buffer` instance from the given data URI `uri`.
                 *
                 * @param {String} uri Data URI to turn into a Buffer instance
                 * @returns {Buffer} Buffer instance from Data URI
                 * @api public
                 */
                function dataUriToBuffer(uri) {
                    if (!/^data:/i.test(uri)) {
                        throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
                    }
                    // strip newlines
                    uri = uri.replace(/\r?\n/g, '');
                    // split the URI up into the "metadata" and the "data" portions
                    const firstComma = uri.indexOf(',');
                    if (firstComma === -1 || firstComma <= 4) {
                        throw new TypeError('malformed data: URI');
                    }
                    // remove the "data:" scheme and parse the metadata
                    const meta = uri.substring(5, firstComma).split(';');
                    let charset = '';
                    let base64 = false;
                    const type = meta[0] || 'text/plain';
                    let typeFull = type;
                    for (let i = 1; i < meta.length; i++) {
                        if (meta[i] === 'base64') {
                            base64 = true;
                        }
                        else {
                            typeFull += `;${meta[i]}`;
                            if (meta[i].indexOf('charset=') === 0) {
                                charset = meta[i].substring(8);
                            }
                        }
                    }
                    // defaults to US-ASCII only if type is not provided
                    if (!meta[0] && !charset.length) {
                        typeFull += ';charset=US-ASCII';
                        charset = 'US-ASCII';
                    }
                    // get the encoded data portion and decode URI-encoded chars
                    const encoding = base64 ? 'base64' : 'ascii';
                    const data = unescape(uri.substring(firstComma + 1));
                    const buffer = Buffer.from(data, encoding);
                    // set `.type` and `.typeFull` properties to MIME type
                    buffer.type = type;
                    buffer.typeFull = typeFull;
                    // set the `.charset` property
                    buffer.charset = charset;
                    return buffer;
                }
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (dataUriToBuffer);
                //# sourceMappingURL=index.js.map

                /***/
            }),

/***/ "./node_modules/fetch-blob/file.js":
/*!*****************************************!*\
  !*** ./node_modules/fetch-blob/file.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "File": () => (/* binding */ File),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
                    /* harmony export */
                });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.js */ "./node_modules/fetch-blob/index.js");


                const _File = class File extends _index_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
                    #lastModified = 0
                    #name = ''

                    /**
                     * @param {*[]} fileBits
                     * @param {string} fileName
                     * @param {{lastModified?: number, type?: string}} options
                     */// @ts-ignore
                    constructor(fileBits, fileName, options = {}) {
                        if (arguments.length < 2) {
                            throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`)
                        }
                        super(fileBits, options)

                        if (options === null) options = {}

                        // Simulate WebIDL type casting for NaN value in lastModified option.
                        const lastModified = options.lastModified === undefined ? Date.now() : Number(options.lastModified)
                        if (!Number.isNaN(lastModified)) {
                            this.#lastModified = lastModified
                        }

                        this.#name = String(fileName)
                    }

                    get name() {
                        return this.#name
                    }

                    get lastModified() {
                        return this.#lastModified
                    }

                    get [Symbol.toStringTag]() {
                        return 'File'
                    }

                    static [Symbol.hasInstance](object) {
                        return !!object && object instanceof _index_js__WEBPACK_IMPORTED_MODULE_0__["default"] &&
                            /^(File)$/.test(object[Symbol.toStringTag])
                    }
                }

                /** @type {typeof globalThis.File} */// @ts-ignore
                const File = _File
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (File);


                /***/
            }),

/***/ "./node_modules/fetch-blob/from.js":
/*!*****************************************!*\
  !*** ./node_modules/fetch-blob/from.js ***!
  \*****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Blob": () => (/* reexport safe */ _index_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "File": () => (/* reexport safe */ _file_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   "blobFrom": () => (/* binding */ blobFrom),
/* harmony export */   "blobFromSync": () => (/* binding */ blobFromSync),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "fileFrom": () => (/* binding */ fileFrom),
/* harmony export */   "fileFromSync": () => (/* binding */ fileFromSync)
                    /* harmony export */
                });
/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:fs */ "node:fs");
/* harmony import */ var node_path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:path */ "node:path");
/* harmony import */ var node_domexception__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! node-domexception */ "./node_modules/node-domexception/index.js");
/* harmony import */ var _file_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./file.js */ "./node_modules/fetch-blob/file.js");
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./index.js */ "./node_modules/fetch-blob/index.js");







                const { stat } = node_fs__WEBPACK_IMPORTED_MODULE_0__.promises

                /**
                 * @param {string} path filepath on the disk
                 * @param {string} [type] mimetype to use
                 */
                const blobFromSync = (path, type) => fromBlob((0, node_fs__WEBPACK_IMPORTED_MODULE_0__.statSync)(path), path, type)

                /**
                 * @param {string} path filepath on the disk
                 * @param {string} [type] mimetype to use
                 * @returns {Promise<Blob>}
                 */
                const blobFrom = (path, type) => stat(path).then(stat => fromBlob(stat, path, type))

                /**
                 * @param {string} path filepath on the disk
                 * @param {string} [type] mimetype to use
                 * @returns {Promise<File>}
                 */
                const fileFrom = (path, type) => stat(path).then(stat => fromFile(stat, path, type))

                /**
                 * @param {string} path filepath on the disk
                 * @param {string} [type] mimetype to use
                 */
                const fileFromSync = (path, type) => fromFile((0, node_fs__WEBPACK_IMPORTED_MODULE_0__.statSync)(path), path, type)

                // @ts-ignore
                const fromBlob = (stat, path, type = '') => new _index_js__WEBPACK_IMPORTED_MODULE_4__["default"]([new BlobDataItem({
                    path,
                    size: stat.size,
                    lastModified: stat.mtimeMs,
                    start: 0
                })], { type })

                // @ts-ignore
                const fromFile = (stat, path, type = '') => new _file_js__WEBPACK_IMPORTED_MODULE_3__["default"]([new BlobDataItem({
                    path,
                    size: stat.size,
                    lastModified: stat.mtimeMs,
                    start: 0
                })], (0, node_path__WEBPACK_IMPORTED_MODULE_1__.basename)(path), { type, lastModified: stat.mtimeMs })

                /**
                 * This is a blob backed up by a file on the disk
                 * with minium requirement. Its wrapped around a Blob as a blobPart
                 * so you have no direct access to this.
                 *
                 * @private
                 */
                class BlobDataItem {
                    #path
                    #start

                    constructor(options) {
                        this.#path = options.path
                        this.#start = options.start
                        this.size = options.size
                        this.lastModified = options.lastModified
                    }

                    /**
                     * Slicing arguments is first validated and formatted
                     * to not be out of range by Blob.prototype.slice
                     */
                    slice(start, end) {
                        return new BlobDataItem({
                            path: this.#path,
                            lastModified: this.lastModified,
                            size: end - start,
                            start: this.#start + start
                        })
                    }

                    async * stream() {
                        const { mtimeMs } = await stat(this.#path)
                        if (mtimeMs > this.lastModified) {
                            throw new node_domexception__WEBPACK_IMPORTED_MODULE_2__('The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.', 'NotReadableError')
                        }
                        yield* (0, node_fs__WEBPACK_IMPORTED_MODULE_0__.createReadStream)(this.#path, {
                            start: this.#start,
                            end: this.#start + this.size - 1
                        })
                    }

                    get [Symbol.toStringTag]() {
                        return 'Blob'
                    }
                }

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (blobFromSync);



                /***/
            }),

/***/ "./node_modules/fetch-blob/index.js":
/*!******************************************!*\
  !*** ./node_modules/fetch-blob/index.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Blob": () => (/* binding */ Blob),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
                    /* harmony export */
                });
/* harmony import */ var _streams_cjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./streams.cjs */ "./node_modules/fetch-blob/streams.cjs");
                /*! fetch-blob. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */

                // TODO (jimmywarting): in the feature use conditional loading with top level await (requires 14.x)
                // Node has recently added whatwg stream into core



                // 64 KiB (same size chrome slice theirs blob into Uint8array's)
                const POOL_SIZE = 65536

                /** @param {(Blob | Uint8Array)[]} parts */
                async function* toIterator(parts, clone = true) {
                    for (const part of parts) {
                        if ('stream' in part) {
                            yield* (/** @type {AsyncIterableIterator<Uint8Array>} */ (part.stream()))
                        } else if (ArrayBuffer.isView(part)) {
                            if (clone) {
                                let position = part.byteOffset
                                const end = part.byteOffset + part.byteLength
                                while (position !== end) {
                                    const size = Math.min(end - position, POOL_SIZE)
                                    const chunk = part.buffer.slice(position, position + size)
                                    position += chunk.byteLength
                                    yield new Uint8Array(chunk)
                                }
                            } else {
                                yield part
                            }
                            /* c8 ignore next 10 */
                        } else {
                            // For blobs that have arrayBuffer but no stream method (nodes buffer.Blob)
                            let position = 0, b = (/** @type {Blob} */ (part))
                            while (position !== b.size) {
                                const chunk = b.slice(position, Math.min(b.size, position + POOL_SIZE))
                                const buffer = await chunk.arrayBuffer()
                                position += buffer.byteLength
                                yield new Uint8Array(buffer)
                            }
                        }
                    }
                }

                const _Blob = class Blob {
                    /** @type {Array.<(Blob|Uint8Array)>} */
                    #parts = []
                    #type = ''
                    #size = 0
                    #endings = 'transparent'

                    /**
                     * The Blob() constructor returns a new Blob object. The content
                     * of the blob consists of the concatenation of the values given
                     * in the parameter array.
                     *
                     * @param {*} blobParts
                     * @param {{ type?: string, endings?: string }} [options]
                     */
                    constructor(blobParts = [], options = {}) {
                        if (typeof blobParts !== 'object' || blobParts === null) {
                            throw new TypeError('Failed to construct \'Blob\': The provided value cannot be converted to a sequence.')
                        }

                        if (typeof blobParts[Symbol.iterator] !== 'function') {
                            throw new TypeError('Failed to construct \'Blob\': The object must have a callable @@iterator property.')
                        }

                        if (typeof options !== 'object' && typeof options !== 'function') {
                            throw new TypeError('Failed to construct \'Blob\': parameter 2 cannot convert to dictionary.')
                        }

                        if (options === null) options = {}

                        const encoder = new TextEncoder()
                        for (const element of blobParts) {
                            let part
                            if (ArrayBuffer.isView(element)) {
                                part = new Uint8Array(element.buffer.slice(element.byteOffset, element.byteOffset + element.byteLength))
                            } else if (element instanceof ArrayBuffer) {
                                part = new Uint8Array(element.slice(0))
                            } else if (element instanceof Blob) {
                                part = element
                            } else {
                                part = encoder.encode(`${element}`)
                            }

                            this.#size += ArrayBuffer.isView(part) ? part.byteLength : part.size
                            this.#parts.push(part)
                        }

                        this.#endings = `${options.endings === undefined ? 'transparent' : options.endings}`
                        const type = options.type === undefined ? '' : String(options.type)
                        this.#type = /^[\x20-\x7E]*$/.test(type) ? type : ''
                    }

                    /**
                     * The Blob interface's size property returns the
                     * size of the Blob in bytes.
                     */
                    get size() {
                        return this.#size
                    }

                    /**
                     * The type property of a Blob object returns the MIME type of the file.
                     */
                    get type() {
                        return this.#type
                    }

                    /**
                     * The text() method in the Blob interface returns a Promise
                     * that resolves with a string containing the contents of
                     * the blob, interpreted as UTF-8.
                     *
                     * @return {Promise<string>}
                     */
                    async text() {
                        // More optimized than using this.arrayBuffer()
                        // that requires twice as much ram
                        const decoder = new TextDecoder()
                        let str = ''
                        for await (const part of toIterator(this.#parts, false)) {
                            str += decoder.decode(part, { stream: true })
                        }
                        // Remaining
                        str += decoder.decode()
                        return str
                    }

                    /**
                     * The arrayBuffer() method in the Blob interface returns a
                     * Promise that resolves with the contents of the blob as
                     * binary data contained in an ArrayBuffer.
                     *
                     * @return {Promise<ArrayBuffer>}
                     */
                    async arrayBuffer() {
                        // Easier way... Just a unnecessary overhead
                        // const view = new Uint8Array(this.size);
                        // await this.stream().getReader({mode: 'byob'}).read(view);
                        // return view.buffer;

                        const data = new Uint8Array(this.size)
                        let offset = 0
                        for await (const chunk of toIterator(this.#parts, false)) {
                            data.set(chunk, offset)
                            offset += chunk.length
                        }

                        return data.buffer
                    }

                    stream() {
                        const it = toIterator(this.#parts, true)

                        return new globalThis.ReadableStream({
                            // @ts-ignore
                            type: 'bytes',
                            async pull(ctrl) {
                                const chunk = await it.next()
                                chunk.done ? ctrl.close() : ctrl.enqueue(chunk.value)
                            },

                            async cancel() {
                                await it.return()
                            }
                        })
                    }

                    /**
                     * The Blob interface's slice() method creates and returns a
                     * new Blob object which contains data from a subset of the
                     * blob on which it's called.
                     *
                     * @param {number} [start]
                     * @param {number} [end]
                     * @param {string} [type]
                     */
                    slice(start = 0, end = this.size, type = '') {
                        const { size } = this

                        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size)
                        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size)

                        const span = Math.max(relativeEnd - relativeStart, 0)
                        const parts = this.#parts
                        const blobParts = []
                        let added = 0

                        for (const part of parts) {
                            // don't add the overflow to new blobParts
                            if (added >= span) {
                                break
                            }

                            const size = ArrayBuffer.isView(part) ? part.byteLength : part.size
                            if (relativeStart && size <= relativeStart) {
                                // Skip the beginning and change the relative
                                // start & end position as we skip the unwanted parts
                                relativeStart -= size
                                relativeEnd -= size
                            } else {
                                let chunk
                                if (ArrayBuffer.isView(part)) {
                                    chunk = part.subarray(relativeStart, Math.min(size, relativeEnd))
                                    added += chunk.byteLength
                                } else {
                                    chunk = part.slice(relativeStart, Math.min(size, relativeEnd))
                                    added += chunk.size
                                }
                                relativeEnd -= size
                                blobParts.push(chunk)
                                relativeStart = 0 // All next sequential parts should start at 0
                            }
                        }

                        const blob = new Blob([], { type: String(type).toLowerCase() })
                        blob.#size = span
                        blob.#parts = blobParts

                        return blob
                    }

                    get [Symbol.toStringTag]() {
                        return 'Blob'
                    }

                    static [Symbol.hasInstance](object) {
                        return (
                            object &&
                            typeof object === 'object' &&
                            typeof object.constructor === 'function' &&
                            (
                                typeof object.stream === 'function' ||
                                typeof object.arrayBuffer === 'function'
                            ) &&
                            /^(Blob|File)$/.test(object[Symbol.toStringTag])
                        )
                    }
                }

                Object.defineProperties(_Blob.prototype, {
                    size: { enumerable: true },
                    type: { enumerable: true },
                    slice: { enumerable: true }
                })

                /** @type {typeof globalThis.Blob} */
                const Blob = _Blob
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Blob);


                /***/
            }),

/***/ "./node_modules/formdata-polyfill/esm.min.js":
/*!***************************************************!*\
  !*** ./node_modules/formdata-polyfill/esm.min.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "File": () => (/* binding */ File),
/* harmony export */   "FormData": () => (/* binding */ FormData),
/* harmony export */   "formDataToBlob": () => (/* binding */ formDataToBlob)
                    /* harmony export */
                });
/* harmony import */ var fetch_blob__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fetch-blob */ "./node_modules/fetch-blob/index.js");
/* harmony import */ var fetch_blob_file_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fetch-blob/file.js */ "./node_modules/fetch-blob/file.js");
                /*! formdata-polyfill. MIT License. Jimmy Wärting <https://jimmy.warting.se/opensource> */




                var { toStringTag: t, iterator: i, hasInstance: h } = Symbol,
                    r = Math.random,
                    m = 'append,set,get,getAll,delete,keys,values,entries,forEach,constructor'.split(','),
                    f = (a, b, c) => (a += '', /^(Blob|File)$/.test(b && b[t]) ? [(c = c !== void 0 ? c + '' : b[t] == 'File' ? b.name : 'blob', a), b.name !== c || b[t] == 'blob' ? new fetch_blob_file_js__WEBPACK_IMPORTED_MODULE_1__["default"]([b], c, b) : b] : [a, b + '']),
                    e = (c, f) => (f ? c : c.replace(/\r?\n|\r/g, '\r\n')).replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22'),
                    x = (n, a, e) => { if (a.length < e) { throw new TypeError(`Failed to execute '${n}' on 'FormData': ${e} arguments required, but only ${a.length} present.`) } }

                const File = fetch_blob_file_js__WEBPACK_IMPORTED_MODULE_1__["default"]

                /** @type {typeof globalThis.FormData} */
                const FormData = class FormData {
                    #d = [];
                    constructor(...a) { if (a.length) throw new TypeError(`Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'.`) }
                    get [t]() { return 'FormData' }
                    [i]() { return this.entries() }
                    static [h](o) { return o && typeof o === 'object' && o[t] === 'FormData' && !m.some(m => typeof o[m] != 'function') }
                    append(...a) { x('append', arguments, 2); this.#d.push(f(...a)) }
                    delete(a) { x('delete', arguments, 1); a += ''; this.#d = this.#d.filter(([b]) => b !== a) }
                    get(a) { x('get', arguments, 1); a += ''; for (var b = this.#d, l = b.length, c = 0; c < l; c++)if (b[c][0] === a) return b[c][1]; return null }
                    getAll(a, b) { x('getAll', arguments, 1); b = []; a += ''; this.#d.forEach(c => c[0] === a && b.push(c[1])); return b }
                    has(a) { x('has', arguments, 1); a += ''; return this.#d.some(b => b[0] === a) }
                    forEach(a, b) { x('forEach', arguments, 1); for (var [c, d] of this) a.call(b, d, c, this) }
                    set(...a) { x('set', arguments, 2); var b = [], c = !0; a = f(...a); this.#d.forEach(d => { d[0] === a[0] ? c && (c = !b.push(a)) : b.push(d) }); c && b.push(a); this.#d = b }
                    *entries() { yield* this.#d }
                    *keys() { for (var [a] of this) yield a }
                    *values() { for (var [, a] of this) yield a }
                }

                /** @param {FormData} F */
                function formDataToBlob(F, B = fetch_blob__WEBPACK_IMPORTED_MODULE_0__["default"]) {
                    var b = `${r()}${r()}`.replace(/\./g, '').slice(-28).padStart(32, '-'), c = [], p = `--${b}\r\nContent-Disposition: form-data; name="`
                    F.forEach((v, n) => typeof v == 'string'
                        ? c.push(p + e(n) + `"\r\n\r\n${v.replace(/\r(?!\n)|(?<!\r)\n/g, '\r\n')}\r\n`)
                        : c.push(p + e(n) + `"; filename="${e(v.name, 1)}"\r\nContent-Type: ${v.type || "application/octet-stream"}\r\n\r\n`, v, '\r\n'))
                    c.push(`--${b}--`)
                    return new B(c, { type: "multipart/form-data; boundary=" + b })
                }


                /***/
            }),

/***/ "./node_modules/node-fetch/src/body.js":
/*!*********************************************!*\
  !*** ./node_modules/node-fetch/src/body.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clone": () => (/* binding */ clone),
/* harmony export */   "default": () => (/* binding */ Body),
/* harmony export */   "extractContentType": () => (/* binding */ extractContentType),
/* harmony export */   "getTotalBytes": () => (/* binding */ getTotalBytes),
/* harmony export */   "writeToStream": () => (/* binding */ writeToStream)
                    /* harmony export */
                });
/* harmony import */ var node_stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:stream */ "node:stream");
/* harmony import */ var node_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:util */ "node:util");
/* harmony import */ var node_buffer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! node:buffer */ "node:buffer");
/* harmony import */ var fetch_blob__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! fetch-blob */ "./node_modules/fetch-blob/index.js");
/* harmony import */ var formdata_polyfill_esm_min_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! formdata-polyfill/esm.min.js */ "./node_modules/formdata-polyfill/esm.min.js");
/* harmony import */ var _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./errors/fetch-error.js */ "./node_modules/node-fetch/src/errors/fetch-error.js");
/* harmony import */ var _errors_base_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./errors/base.js */ "./node_modules/node-fetch/src/errors/base.js");
/* harmony import */ var _utils_is_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/is.js */ "./node_modules/node-fetch/src/utils/is.js");

                /**
                 * Body.js
                 *
                 * Body interface provides common methods for Request and Response
                 */












                const pipeline = (0, node_util__WEBPACK_IMPORTED_MODULE_1__.promisify)(node_stream__WEBPACK_IMPORTED_MODULE_0__.pipeline);
                const INTERNALS = Symbol('Body internals');

                /**
                 * Body mixin
                 *
                 * Ref: https://fetch.spec.whatwg.org/#body
                 *
                 * @param   Stream  body  Readable stream
                 * @param   Object  opts  Response options
                 * @return  Void
                 */
                class Body {
                    constructor(body, {
                        size = 0
                    } = {}) {
                        let boundary = null;

                        if (body === null) {
                            // Body is undefined or null
                            body = null;
                        } else if ((0, _utils_is_js__WEBPACK_IMPORTED_MODULE_5__.isURLSearchParameters)(body)) {
                            // Body is a URLSearchParams
                            body = node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.from(body.toString());
                        } else if ((0, _utils_is_js__WEBPACK_IMPORTED_MODULE_5__.isBlob)(body)) {
                            // Body is blob
                        } else if (node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.isBuffer(body)) {
                            // Body is Buffer
                        } else if (node_util__WEBPACK_IMPORTED_MODULE_1__.types.isAnyArrayBuffer(body)) {
                            // Body is ArrayBuffer
                            body = node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.from(body);
                        } else if (ArrayBuffer.isView(body)) {
                            // Body is ArrayBufferView
                            body = node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.from(body.buffer, body.byteOffset, body.byteLength);
                        } else if (body instanceof node_stream__WEBPACK_IMPORTED_MODULE_0__) {
                            // Body is stream
                        } else if (body instanceof formdata_polyfill_esm_min_js__WEBPACK_IMPORTED_MODULE_4__.FormData) {
                            // Body is FormData
                            body = (0, formdata_polyfill_esm_min_js__WEBPACK_IMPORTED_MODULE_4__.formDataToBlob)(body);
                            boundary = body.type.split('=')[1];
                        } else {
                            // None of the above
                            // coerce to string then buffer
                            body = node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.from(String(body));
                        }

                        let stream = body;

                        if (node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.isBuffer(body)) {
                            stream = node_stream__WEBPACK_IMPORTED_MODULE_0__.Readable.from(body);
                        } else if ((0, _utils_is_js__WEBPACK_IMPORTED_MODULE_5__.isBlob)(body)) {
                            stream = node_stream__WEBPACK_IMPORTED_MODULE_0__.Readable.from(body.stream());
                        }

                        this[INTERNALS] = {
                            body,
                            stream,
                            boundary,
                            disturbed: false,
                            error: null
                        };
                        this.size = size;

                        if (body instanceof node_stream__WEBPACK_IMPORTED_MODULE_0__) {
                            body.on('error', error_ => {
                                const error = error_ instanceof _errors_base_js__WEBPACK_IMPORTED_MODULE_6__.FetchBaseError ?
                                    error_ :
                                    new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_7__.FetchError(`Invalid response body while trying to fetch ${this.url}: ${error_.message}`, 'system', error_);
                                this[INTERNALS].error = error;
                            });
                        }
                    }

                    get body() {
                        return this[INTERNALS].stream;
                    }

                    get bodyUsed() {
                        return this[INTERNALS].disturbed;
                    }

                    /**
                     * Decode response as ArrayBuffer
                     *
                     * @return  Promise
                     */
                    async arrayBuffer() {
                        const { buffer, byteOffset, byteLength } = await consumeBody(this);
                        return buffer.slice(byteOffset, byteOffset + byteLength);
                    }

                    async formData() {
                        const ct = this.headers.get('content-type');

                        if (ct.startsWith('application/x-www-form-urlencoded')) {
                            const formData = new formdata_polyfill_esm_min_js__WEBPACK_IMPORTED_MODULE_4__.FormData();
                            const parameters = new URLSearchParams(await this.text());

                            for (const [name, value] of parameters) {
                                formData.append(name, value);
                            }

                            return formData;
                        }

                        const { toFormData } = await __webpack_require__.e(/*! import() */ "node_modules_node-fetch_src_utils_multipart-parser_js").then(__webpack_require__.bind(__webpack_require__, /*! ./utils/multipart-parser.js */ "./node_modules/node-fetch/src/utils/multipart-parser.js"));
                        return toFormData(this.body, ct);
                    }

                    /**
                     * Return raw response as Blob
                     *
                     * @return Promise
                     */
                    async blob() {
                        const ct = (this.headers && this.headers.get('content-type')) || (this[INTERNALS].body && this[INTERNALS].body.type) || '';
                        const buf = await this.arrayBuffer();

                        return new fetch_blob__WEBPACK_IMPORTED_MODULE_3__["default"]([buf], {
                            type: ct
                        });
                    }

                    /**
                     * Decode response as json
                     *
                     * @return  Promise
                     */
                    async json() {
                        const text = await this.text();
                        return JSON.parse(text);
                    }

                    /**
                     * Decode response as text
                     *
                     * @return  Promise
                     */
                    async text() {
                        const buffer = await consumeBody(this);
                        return new TextDecoder().decode(buffer);
                    }

                    /**
                     * Decode response as buffer (non-spec api)
                     *
                     * @return  Promise
                     */
                    buffer() {
                        return consumeBody(this);
                    }
                }

                Body.prototype.buffer = (0, node_util__WEBPACK_IMPORTED_MODULE_1__.deprecate)(Body.prototype.buffer, 'Please use \'response.arrayBuffer()\' instead of \'response.buffer()\'', 'node-fetch#buffer');

                // In browsers, all properties are enumerable.
                Object.defineProperties(Body.prototype, {
                    body: { enumerable: true },
                    bodyUsed: { enumerable: true },
                    arrayBuffer: { enumerable: true },
                    blob: { enumerable: true },
                    json: { enumerable: true },
                    text: { enumerable: true },
                    data: {
                        get: (0, node_util__WEBPACK_IMPORTED_MODULE_1__.deprecate)(() => { },
                            'data doesn\'t exist, use json(), text(), arrayBuffer(), or body instead',
                            'https://github.com/node-fetch/node-fetch/issues/1000 (response)')
                    }
                });

                /**
                 * Consume and convert an entire Body to a Buffer.
                 *
                 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
                 *
                 * @return Promise
                 */
                async function consumeBody(data) {
                    if (data[INTERNALS].disturbed) {
                        throw new TypeError(`body used already for: ${data.url}`);
                    }

                    data[INTERNALS].disturbed = true;

                    if (data[INTERNALS].error) {
                        throw data[INTERNALS].error;
                    }

                    const { body } = data;

                    // Body is null
                    if (body === null) {
                        return node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.alloc(0);
                    }

                    /* c8 ignore next 3 */
                    if (!(body instanceof node_stream__WEBPACK_IMPORTED_MODULE_0__)) {
                        return node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.alloc(0);
                    }

                    // Body is stream
                    // get ready to actually consume the body
                    const accum = [];
                    let accumBytes = 0;

                    try {
                        for await (const chunk of body) {
                            if (data.size > 0 && accumBytes + chunk.length > data.size) {
                                const error = new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_7__.FetchError(`content size at ${data.url} over limit: ${data.size}`, 'max-size');
                                body.destroy(error);
                                throw error;
                            }

                            accumBytes += chunk.length;
                            accum.push(chunk);
                        }
                    } catch (error) {
                        const error_ = error instanceof _errors_base_js__WEBPACK_IMPORTED_MODULE_6__.FetchBaseError ? error : new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_7__.FetchError(`Invalid response body while trying to fetch ${data.url}: ${error.message}`, 'system', error);
                        throw error_;
                    }

                    if (body.readableEnded === true || body._readableState.ended === true) {
                        try {
                            if (accum.every(c => typeof c === 'string')) {
                                return node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.from(accum.join(''));
                            }

                            return node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.concat(accum, accumBytes);
                        } catch (error) {
                            throw new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_7__.FetchError(`Could not create Buffer from response body for ${data.url}: ${error.message}`, 'system', error);
                        }
                    } else {
                        throw new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_7__.FetchError(`Premature close of server response while trying to fetch ${data.url}`);
                    }
                }

                /**
                 * Clone body given Res/Req instance
                 *
                 * @param   Mixed   instance       Response or Request instance
                 * @param   String  highWaterMark  highWaterMark for both PassThrough body streams
                 * @return  Mixed
                 */
                const clone = (instance, highWaterMark) => {
                    let p1;
                    let p2;
                    let { body } = instance[INTERNALS];

                    // Don't allow cloning a used body
                    if (instance.bodyUsed) {
                        throw new Error('cannot clone body after it is used');
                    }

                    // Check that body is a stream and not form-data object
                    // note: we can't clone the form-data object without having it as a dependency
                    if ((body instanceof node_stream__WEBPACK_IMPORTED_MODULE_0__) && (typeof body.getBoundary !== 'function')) {
                        // Tee instance body
                        p1 = new node_stream__WEBPACK_IMPORTED_MODULE_0__.PassThrough({ highWaterMark });
                        p2 = new node_stream__WEBPACK_IMPORTED_MODULE_0__.PassThrough({ highWaterMark });
                        body.pipe(p1);
                        body.pipe(p2);
                        // Set instance body to teed body and return the other teed body
                        instance[INTERNALS].stream = p1;
                        body = p2;
                    }

                    return body;
                };

                const getNonSpecFormDataBoundary = (0, node_util__WEBPACK_IMPORTED_MODULE_1__.deprecate)(
                    body => body.getBoundary(),
                    'form-data doesn\'t follow the spec and requires special treatment. Use alternative package',
                    'https://github.com/node-fetch/node-fetch/issues/1167'
                );

                /**
                 * Performs the operation "extract a `Content-Type` value from |object|" as
                 * specified in the specification:
                 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
                 *
                 * This function assumes that instance.body is present.
                 *
                 * @param {any} body Any options.body input
                 * @returns {string | null}
                 */
                const extractContentType = (body, request) => {
                    // Body is null or undefined
                    if (body === null) {
                        return null;
                    }

                    // Body is string
                    if (typeof body === 'string') {
                        return 'text/plain;charset=UTF-8';
                    }

                    // Body is a URLSearchParams
                    if ((0, _utils_is_js__WEBPACK_IMPORTED_MODULE_5__.isURLSearchParameters)(body)) {
                        return 'application/x-www-form-urlencoded;charset=UTF-8';
                    }

                    // Body is blob
                    if ((0, _utils_is_js__WEBPACK_IMPORTED_MODULE_5__.isBlob)(body)) {
                        return body.type || null;
                    }

                    // Body is a Buffer (Buffer, ArrayBuffer or ArrayBufferView)
                    if (node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.isBuffer(body) || node_util__WEBPACK_IMPORTED_MODULE_1__.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
                        return null;
                    }

                    if (body instanceof formdata_polyfill_esm_min_js__WEBPACK_IMPORTED_MODULE_4__.FormData) {
                        return `multipart/form-data; boundary=${request[INTERNALS].boundary}`;
                    }

                    // Detect form data input from form-data module
                    if (body && typeof body.getBoundary === 'function') {
                        return `multipart/form-data;boundary=${getNonSpecFormDataBoundary(body)}`;
                    }

                    // Body is stream - can't really do much about this
                    if (body instanceof node_stream__WEBPACK_IMPORTED_MODULE_0__) {
                        return null;
                    }

                    // Body constructor defaults other things to string
                    return 'text/plain;charset=UTF-8';
                };

                /**
                 * The Fetch Standard treats this as if "total bytes" is a property on the body.
                 * For us, we have to explicitly get it with a function.
                 *
                 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
                 *
                 * @param {any} obj.body Body object from the Body instance.
                 * @returns {number | null}
                 */
                const getTotalBytes = request => {
                    const { body } = request[INTERNALS];

                    // Body is null or undefined
                    if (body === null) {
                        return 0;
                    }

                    // Body is Blob
                    if ((0, _utils_is_js__WEBPACK_IMPORTED_MODULE_5__.isBlob)(body)) {
                        return body.size;
                    }

                    // Body is Buffer
                    if (node_buffer__WEBPACK_IMPORTED_MODULE_2__.Buffer.isBuffer(body)) {
                        return body.length;
                    }

                    // Detect form data input from form-data module
                    if (body && typeof body.getLengthSync === 'function') {
                        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
                    }

                    // Body is stream
                    return null;
                };

                /**
                 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
                 *
                 * @param {Stream.Writable} dest The stream to write to.
                 * @param obj.body Body object from the Body instance.
                 * @returns {Promise<void>}
                 */
                const writeToStream = async (dest, { body }) => {
                    if (body === null) {
                        // Body is null
                        dest.end();
                    } else {
                        // Body is stream
                        await pipeline(body, dest);
                    }
                };


                /***/
            }),

/***/ "./node_modules/node-fetch/src/errors/abort-error.js":
/*!***********************************************************!*\
  !*** ./node_modules/node-fetch/src/errors/abort-error.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbortError": () => (/* binding */ AbortError)
                    /* harmony export */
                });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/node-fetch/src/errors/base.js");


                /**
                 * AbortError interface for cancelled requests
                 */
                class AbortError extends _base_js__WEBPACK_IMPORTED_MODULE_0__.FetchBaseError {
                    constructor(message, type = 'aborted') {
                        super(message, type);
                    }
                }


                /***/
            }),

/***/ "./node_modules/node-fetch/src/errors/base.js":
/*!****************************************************!*\
  !*** ./node_modules/node-fetch/src/errors/base.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FetchBaseError": () => (/* binding */ FetchBaseError)
                    /* harmony export */
                });
                class FetchBaseError extends Error {
                    constructor(message, type) {
                        super(message);
                        // Hide custom error implementation details from end-users
                        Error.captureStackTrace(this, this.constructor);

                        this.type = type;
                    }

                    get name() {
                        return this.constructor.name;
                    }

                    get [Symbol.toStringTag]() {
                        return this.constructor.name;
                    }
                }


                /***/
            }),

/***/ "./node_modules/node-fetch/src/errors/fetch-error.js":
/*!***********************************************************!*\
  !*** ./node_modules/node-fetch/src/errors/fetch-error.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "FetchError": () => (/* binding */ FetchError)
                    /* harmony export */
                });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/node-fetch/src/errors/base.js");



                /**
                 * @typedef {{ address?: string, code: string, dest?: string, errno: number, info?: object, message: string, path?: string, port?: number, syscall: string}} SystemError
                */

                /**
                 * FetchError interface for operational errors
                 */
                class FetchError extends _base_js__WEBPACK_IMPORTED_MODULE_0__.FetchBaseError {
                    /**
                     * @param  {string} message -      Error message for human
                     * @param  {string} [type] -        Error type for machine
                     * @param  {SystemError} [systemError] - For Node.js system error
                     */
                    constructor(message, type, systemError) {
                        super(message, type);
                        // When err.type is `system`, err.erroredSysCall contains system error and err.code contains system error code
                        if (systemError) {
                            // eslint-disable-next-line no-multi-assign
                            this.code = this.errno = systemError.code;
                            this.erroredSysCall = systemError.syscall;
                        }
                    }
                }


                /***/
            }),

/***/ "./node_modules/node-fetch/src/headers.js":
/*!************************************************!*\
  !*** ./node_modules/node-fetch/src/headers.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Headers),
/* harmony export */   "fromRawHeaders": () => (/* binding */ fromRawHeaders)
                    /* harmony export */
                });
/* harmony import */ var node_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:util */ "node:util");
/* harmony import */ var node_http__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:http */ "node:http");
                /**
                 * Headers.js
                 *
                 * Headers class offers convenient helpers
                 */




                /* c8 ignore next 9 */
                const validateHeaderName = typeof node_http__WEBPACK_IMPORTED_MODULE_1__.validateHeaderName === 'function' ?
                    node_http__WEBPACK_IMPORTED_MODULE_1__.validateHeaderName :
                    name => {
                        if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
                            const error = new TypeError(`Header name must be a valid HTTP token [${name}]`);
                            Object.defineProperty(error, 'code', { value: 'ERR_INVALID_HTTP_TOKEN' });
                            throw error;
                        }
                    };

                /* c8 ignore next 9 */
                const validateHeaderValue = typeof node_http__WEBPACK_IMPORTED_MODULE_1__.validateHeaderValue === 'function' ?
                    node_http__WEBPACK_IMPORTED_MODULE_1__.validateHeaderValue :
                    (name, value) => {
                        if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
                            const error = new TypeError(`Invalid character in header content ["${name}"]`);
                            Object.defineProperty(error, 'code', { value: 'ERR_INVALID_CHAR' });
                            throw error;
                        }
                    };

                /**
                 * @typedef {Headers | Record<string, string> | Iterable<readonly [string, string]> | Iterable<Iterable<string>>} HeadersInit
                 */

                /**
                 * This Fetch API interface allows you to perform various actions on HTTP request and response headers.
                 * These actions include retrieving, setting, adding to, and removing.
                 * A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.
                 * You can add to this using methods like append() (see Examples.)
                 * In all methods of this interface, header names are matched by case-insensitive byte sequence.
                 *
                 */
                class Headers extends URLSearchParams {
                    /**
                     * Headers class
                     *
                     * @constructor
                     * @param {HeadersInit} [init] - Response headers
                     */
                    constructor(init) {
                        // Validate and normalize init object in [name, value(s)][]
                        /** @type {string[][]} */
                        let result = [];
                        if (init instanceof Headers) {
                            const raw = init.raw();
                            for (const [name, values] of Object.entries(raw)) {
                                result.push(...values.map(value => [name, value]));
                            }
                        } else if (init == null) { // eslint-disable-line no-eq-null, eqeqeq
                            // No op
                        } else if (typeof init === 'object' && !node_util__WEBPACK_IMPORTED_MODULE_0__.types.isBoxedPrimitive(init)) {
                            const method = init[Symbol.iterator];
                            // eslint-disable-next-line no-eq-null, eqeqeq
                            if (method == null) {
                                // Record<ByteString, ByteString>
                                result.push(...Object.entries(init));
                            } else {
                                if (typeof method !== 'function') {
                                    throw new TypeError('Header pairs must be iterable');
                                }

                                // Sequence<sequence<ByteString>>
                                // Note: per spec we have to first exhaust the lists then process them
                                result = [...init]
                                    .map(pair => {
                                        if (
                                            typeof pair !== 'object' || node_util__WEBPACK_IMPORTED_MODULE_0__.types.isBoxedPrimitive(pair)
                                        ) {
                                            throw new TypeError('Each header pair must be an iterable object');
                                        }

                                        return [...pair];
                                    }).map(pair => {
                                        if (pair.length !== 2) {
                                            throw new TypeError('Each header pair must be a name/value tuple');
                                        }

                                        return [...pair];
                                    });
                            }
                        } else {
                            throw new TypeError('Failed to construct \'Headers\': The provided value is not of type \'(sequence<sequence<ByteString>> or record<ByteString, ByteString>)');
                        }

                        // Validate and lowercase
                        result =
                            result.length > 0 ?
                                result.map(([name, value]) => {
                                    validateHeaderName(name);
                                    validateHeaderValue(name, String(value));
                                    return [String(name).toLowerCase(), String(value)];
                                }) :
                                undefined;

                        super(result);

                        // Returning a Proxy that will lowercase key names, validate parameters and sort keys
                        // eslint-disable-next-line no-constructor-return
                        return new Proxy(this, {
                            get(target, p, receiver) {
                                switch (p) {
                                    case 'append':
                                    case 'set':
                                        return (name, value) => {
                                            validateHeaderName(name);
                                            validateHeaderValue(name, String(value));
                                            return URLSearchParams.prototype[p].call(
                                                target,
                                                String(name).toLowerCase(),
                                                String(value)
                                            );
                                        };

                                    case 'delete':
                                    case 'has':
                                    case 'getAll':
                                        return name => {
                                            validateHeaderName(name);
                                            return URLSearchParams.prototype[p].call(
                                                target,
                                                String(name).toLowerCase()
                                            );
                                        };

                                    case 'keys':
                                        return () => {
                                            target.sort();
                                            return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                                        };

                                    default:
                                        return Reflect.get(target, p, receiver);
                                }
                            }
                        });
                        /* c8 ignore next */
                    }

                    get [Symbol.toStringTag]() {
                        return this.constructor.name;
                    }

                    toString() {
                        return Object.prototype.toString.call(this);
                    }

                    get(name) {
                        const values = this.getAll(name);
                        if (values.length === 0) {
                            return null;
                        }

                        let value = values.join(', ');
                        if (/^content-encoding$/i.test(name)) {
                            value = value.toLowerCase();
                        }

                        return value;
                    }

                    forEach(callback, thisArg = undefined) {
                        for (const name of this.keys()) {
                            Reflect.apply(callback, thisArg, [this.get(name), name, this]);
                        }
                    }

                    * values() {
                        for (const name of this.keys()) {
                            yield this.get(name);
                        }
                    }

                    /**
                     * @type {() => IterableIterator<[string, string]>}
                     */
                    * entries() {
                        for (const name of this.keys()) {
                            yield [name, this.get(name)];
                        }
                    }

                    [Symbol.iterator]() {
                        return this.entries();
                    }

                    /**
                     * Node-fetch non-spec method
                     * returning all headers and their values as array
                     * @returns {Record<string, string[]>}
                     */
                    raw() {
                        return [...this.keys()].reduce((result, key) => {
                            result[key] = this.getAll(key);
                            return result;
                        }, {});
                    }

                    /**
                     * For better console.log(headers) and also to convert Headers into Node.js Request compatible format
                     */
                    [Symbol.for('nodejs.util.inspect.custom')]() {
                        return [...this.keys()].reduce((result, key) => {
                            const values = this.getAll(key);
                            // Http.request() only supports string as Host header.
                            // This hack makes specifying custom Host header possible.
                            if (key === 'host') {
                                result[key] = values[0];
                            } else {
                                result[key] = values.length > 1 ? values : values[0];
                            }

                            return result;
                        }, {});
                    }
                }

                /**
                 * Re-shaping object for Web IDL tests
                 * Only need to do it for overridden methods
                 */
                Object.defineProperties(
                    Headers.prototype,
                    ['get', 'entries', 'forEach', 'values'].reduce((result, property) => {
                        result[property] = { enumerable: true };
                        return result;
                    }, {})
                );

                /**
                 * Create a Headers object from an http.IncomingMessage.rawHeaders, ignoring those that do
                 * not conform to HTTP grammar productions.
                 * @param {import('http').IncomingMessage['rawHeaders']} headers
                 */
                function fromRawHeaders(headers = []) {
                    return new Headers(
                        headers
                            // Split into pairs
                            .reduce((result, value, index, array) => {
                                if (index % 2 === 0) {
                                    result.push(array.slice(index, index + 2));
                                }

                                return result;
                            }, [])
                            .filter(([name, value]) => {
                                try {
                                    validateHeaderName(name);
                                    validateHeaderValue(name, String(value));
                                    return true;
                                } catch {
                                    return false;
                                }
                            })

                    );
                }


                /***/
            }),

/***/ "./node_modules/node-fetch/src/index.js":
/*!**********************************************!*\
  !*** ./node_modules/node-fetch/src/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbortError": () => (/* reexport safe */ _errors_abort_error_js__WEBPACK_IMPORTED_MODULE_12__.AbortError),
/* harmony export */   "Blob": () => (/* reexport safe */ fetch_blob_from_js__WEBPACK_IMPORTED_MODULE_7__.Blob),
/* harmony export */   "FetchError": () => (/* reexport safe */ _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_11__.FetchError),
/* harmony export */   "File": () => (/* reexport safe */ fetch_blob_from_js__WEBPACK_IMPORTED_MODULE_7__.File),
/* harmony export */   "FormData": () => (/* reexport safe */ formdata_polyfill_esm_min_js__WEBPACK_IMPORTED_MODULE_6__.FormData),
/* harmony export */   "Headers": () => (/* reexport safe */ _headers_js__WEBPACK_IMPORTED_MODULE_8__["default"]),
/* harmony export */   "Request": () => (/* reexport safe */ _request_js__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   "Response": () => (/* reexport safe */ _response_js__WEBPACK_IMPORTED_MODULE_10__["default"]),
/* harmony export */   "blobFrom": () => (/* reexport safe */ fetch_blob_from_js__WEBPACK_IMPORTED_MODULE_7__.blobFrom),
/* harmony export */   "blobFromSync": () => (/* reexport safe */ fetch_blob_from_js__WEBPACK_IMPORTED_MODULE_7__.blobFromSync),
/* harmony export */   "default": () => (/* binding */ fetch),
/* harmony export */   "fileFrom": () => (/* reexport safe */ fetch_blob_from_js__WEBPACK_IMPORTED_MODULE_7__.fileFrom),
/* harmony export */   "fileFromSync": () => (/* reexport safe */ fetch_blob_from_js__WEBPACK_IMPORTED_MODULE_7__.fileFromSync),
/* harmony export */   "isRedirect": () => (/* reexport safe */ _utils_is_redirect_js__WEBPACK_IMPORTED_MODULE_13__.isRedirect)
                    /* harmony export */
                });
/* harmony import */ var node_http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:http */ "node:http");
/* harmony import */ var node_https__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:https */ "node:https");
/* harmony import */ var node_zlib__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! node:zlib */ "node:zlib");
/* harmony import */ var node_stream__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! node:stream */ "node:stream");
/* harmony import */ var node_buffer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! node:buffer */ "node:buffer");
/* harmony import */ var data_uri_to_buffer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! data-uri-to-buffer */ "./node_modules/data-uri-to-buffer/dist/index.js");
/* harmony import */ var _body_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./body.js */ "./node_modules/node-fetch/src/body.js");
/* harmony import */ var _response_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./response.js */ "./node_modules/node-fetch/src/response.js");
/* harmony import */ var _headers_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./headers.js */ "./node_modules/node-fetch/src/headers.js");
/* harmony import */ var _request_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./request.js */ "./node_modules/node-fetch/src/request.js");
/* harmony import */ var _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./errors/fetch-error.js */ "./node_modules/node-fetch/src/errors/fetch-error.js");
/* harmony import */ var _errors_abort_error_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./errors/abort-error.js */ "./node_modules/node-fetch/src/errors/abort-error.js");
/* harmony import */ var _utils_is_redirect_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./utils/is-redirect.js */ "./node_modules/node-fetch/src/utils/is-redirect.js");
/* harmony import */ var formdata_polyfill_esm_min_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! formdata-polyfill/esm.min.js */ "./node_modules/formdata-polyfill/esm.min.js");
/* harmony import */ var _utils_is_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./utils/is.js */ "./node_modules/node-fetch/src/utils/is.js");
/* harmony import */ var _utils_referrer_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./utils/referrer.js */ "./node_modules/node-fetch/src/utils/referrer.js");
/* harmony import */ var fetch_blob_from_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! fetch-blob/from.js */ "./node_modules/fetch-blob/from.js");
                /**
                 * Index.js
                 *
                 * a request API compatible with window.fetch
                 *
                 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
                 */
























                const supportedSchemas = new Set(['data:', 'http:', 'https:']);

                /**
                 * Fetch function
                 *
                 * @param   {string | URL | import('./request').default} url - Absolute url or Request instance
                 * @param   {*} [options_] - Fetch options
                 * @return  {Promise<import('./response').default>}
                 */
                async function fetch(url, options_) {
                    return new Promise((resolve, reject) => {
                        // Build request object
                        const request = new _request_js__WEBPACK_IMPORTED_MODULE_9__["default"](url, options_);
                        const { parsedURL, options } = (0, _request_js__WEBPACK_IMPORTED_MODULE_9__.getNodeRequestOptions)(request);
                        if (!supportedSchemas.has(parsedURL.protocol)) {
                            throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${parsedURL.protocol.replace(/:$/, '')}" is not supported.`);
                        }

                        if (parsedURL.protocol === 'data:') {
                            const data = (0, data_uri_to_buffer__WEBPACK_IMPORTED_MODULE_5__["default"])(request.url);
                            const response = new _response_js__WEBPACK_IMPORTED_MODULE_10__["default"](data, { headers: { 'Content-Type': data.typeFull } });
                            resolve(response);
                            return;
                        }

                        // Wrap http.request into fetch
                        const send = (parsedURL.protocol === 'https:' ? node_https__WEBPACK_IMPORTED_MODULE_1__ : node_http__WEBPACK_IMPORTED_MODULE_0__).request;
                        const { signal } = request;
                        let response = null;

                        const abort = () => {
                            const error = new _errors_abort_error_js__WEBPACK_IMPORTED_MODULE_12__.AbortError('The operation was aborted.');
                            reject(error);
                            if (request.body && request.body instanceof node_stream__WEBPACK_IMPORTED_MODULE_3__.Readable) {
                                request.body.destroy(error);
                            }

                            if (!response || !response.body) {
                                return;
                            }

                            response.body.emit('error', error);
                        };

                        if (signal && signal.aborted) {
                            abort();
                            return;
                        }

                        const abortAndFinalize = () => {
                            abort();
                            finalize();
                        };

                        // Send request
                        const request_ = send(parsedURL.toString(), options);

                        if (signal) {
                            signal.addEventListener('abort', abortAndFinalize);
                        }

                        const finalize = () => {
                            request_.abort();
                            if (signal) {
                                signal.removeEventListener('abort', abortAndFinalize);
                            }
                        };

                        request_.on('error', error => {
                            reject(new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_11__.FetchError(`request to ${request.url} failed, reason: ${error.message}`, 'system', error));
                            finalize();
                        });

                        fixResponseChunkedTransferBadEnding(request_, error => {
                            if (response && response.body) {
                                response.body.destroy(error);
                            }
                        });

                        /* c8 ignore next 18 */
                        if (process.version < 'v14') {
                            // Before Node.js 14, pipeline() does not fully support async iterators and does not always
                            // properly handle when the socket close/end events are out of order.
                            request_.on('socket', s => {
                                let endedWithEventsCount;
                                s.prependListener('end', () => {
                                    endedWithEventsCount = s._eventsCount;
                                });
                                s.prependListener('close', hadError => {
                                    // if end happened before close but the socket didn't emit an error, do it now
                                    if (response && endedWithEventsCount < s._eventsCount && !hadError) {
                                        const error = new Error('Premature close');
                                        error.code = 'ERR_STREAM_PREMATURE_CLOSE';
                                        response.body.emit('error', error);
                                    }
                                });
                            });
                        }

                        request_.on('response', response_ => {
                            request_.setTimeout(0);
                            const headers = (0, _headers_js__WEBPACK_IMPORTED_MODULE_8__.fromRawHeaders)(response_.rawHeaders);

                            // HTTP fetch step 5
                            if ((0, _utils_is_redirect_js__WEBPACK_IMPORTED_MODULE_13__.isRedirect)(response_.statusCode)) {
                                // HTTP fetch step 5.2
                                const location = headers.get('Location');

                                // HTTP fetch step 5.3
                                let locationURL = null;
                                try {
                                    locationURL = location === null ? null : new URL(location, request.url);
                                } catch {
                                    // error here can only be invalid URL in Location: header
                                    // do not throw when options.redirect == manual
                                    // let the user extract the errorneous redirect URL
                                    if (request.redirect !== 'manual') {
                                        reject(new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_11__.FetchError(`uri requested responds with an invalid redirect URL: ${location}`, 'invalid-redirect'));
                                        finalize();
                                        return;
                                    }
                                }

                                // HTTP fetch step 5.5
                                switch (request.redirect) {
                                    case 'error':
                                        reject(new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_11__.FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
                                        finalize();
                                        return;
                                    case 'manual':
                                        // Nothing to do
                                        break;
                                    case 'follow': {
                                        // HTTP-redirect fetch step 2
                                        if (locationURL === null) {
                                            break;
                                        }

                                        // HTTP-redirect fetch step 5
                                        if (request.counter >= request.follow) {
                                            reject(new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_11__.FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
                                            finalize();
                                            return;
                                        }

                                        // HTTP-redirect fetch step 6 (counter increment)
                                        // Create a new Request object.
                                        const requestOptions = {
                                            headers: new _headers_js__WEBPACK_IMPORTED_MODULE_8__["default"](request.headers),
                                            follow: request.follow,
                                            counter: request.counter + 1,
                                            agent: request.agent,
                                            compress: request.compress,
                                            method: request.method,
                                            body: (0, _body_js__WEBPACK_IMPORTED_MODULE_14__.clone)(request),
                                            signal: request.signal,
                                            size: request.size,
                                            referrer: request.referrer,
                                            referrerPolicy: request.referrerPolicy
                                        };

                                        // when forwarding sensitive headers like "Authorization",
                                        // "WWW-Authenticate", and "Cookie" to untrusted targets,
                                        // headers will be ignored when following a redirect to a domain
                                        // that is not a subdomain match or exact match of the initial domain.
                                        // For example, a redirect from "foo.com" to either "foo.com" or "sub.foo.com"
                                        // will forward the sensitive headers, but a redirect to "bar.com" will not.
                                        // headers will also be ignored when following a redirect to a domain using
                                        // a different protocol. For example, a redirect from "https://foo.com" to "http://foo.com"
                                        // will not forward the sensitive headers
                                        if (!(0, _utils_is_js__WEBPACK_IMPORTED_MODULE_15__.isDomainOrSubdomain)(request.url, locationURL) || !(0, _utils_is_js__WEBPACK_IMPORTED_MODULE_15__.isSameProtocol)(request.url, locationURL)) {
                                            for (const name of ['authorization', 'www-authenticate', 'cookie', 'cookie2']) {
                                                requestOptions.headers.delete(name);
                                            }
                                        }

                                        // HTTP-redirect fetch step 9
                                        if (response_.statusCode !== 303 && request.body && options_.body instanceof node_stream__WEBPACK_IMPORTED_MODULE_3__.Readable) {
                                            reject(new _errors_fetch_error_js__WEBPACK_IMPORTED_MODULE_11__.FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
                                            finalize();
                                            return;
                                        }

                                        // HTTP-redirect fetch step 11
                                        if (response_.statusCode === 303 || ((response_.statusCode === 301 || response_.statusCode === 302) && request.method === 'POST')) {
                                            requestOptions.method = 'GET';
                                            requestOptions.body = undefined;
                                            requestOptions.headers.delete('content-length');
                                        }

                                        // HTTP-redirect fetch step 14
                                        const responseReferrerPolicy = (0, _utils_referrer_js__WEBPACK_IMPORTED_MODULE_16__.parseReferrerPolicyFromHeader)(headers);
                                        if (responseReferrerPolicy) {
                                            requestOptions.referrerPolicy = responseReferrerPolicy;
                                        }

                                        // HTTP-redirect fetch step 15
                                        resolve(fetch(new _request_js__WEBPACK_IMPORTED_MODULE_9__["default"](locationURL, requestOptions)));
                                        finalize();
                                        return;
                                    }

                                    default:
                                        return reject(new TypeError(`Redirect option '${request.redirect}' is not a valid value of RequestRedirect`));
                                }
                            }

                            // Prepare response
                            if (signal) {
                                response_.once('end', () => {
                                    signal.removeEventListener('abort', abortAndFinalize);
                                });
                            }

                            let body = (0, node_stream__WEBPACK_IMPORTED_MODULE_3__.pipeline)(response_, new node_stream__WEBPACK_IMPORTED_MODULE_3__.PassThrough(), error => {
                                if (error) {
                                    reject(error);
                                }
                            });
                            // see https://github.com/nodejs/node/pull/29376
                            /* c8 ignore next 3 */
                            if (process.version < 'v12.10') {
                                response_.on('aborted', abortAndFinalize);
                            }

                            const responseOptions = {
                                url: request.url,
                                status: response_.statusCode,
                                statusText: response_.statusMessage,
                                headers,
                                size: request.size,
                                counter: request.counter,
                                highWaterMark: request.highWaterMark
                            };

                            // HTTP-network fetch step 12.1.1.3
                            const codings = headers.get('Content-Encoding');

                            // HTTP-network fetch step 12.1.1.4: handle content codings

                            // in following scenarios we ignore compression support
                            // 1. compression support is disabled
                            // 2. HEAD request
                            // 3. no Content-Encoding header
                            // 4. no content response (204)
                            // 5. content not modified response (304)
                            if (!request.compress || request.method === 'HEAD' || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
                                response = new _response_js__WEBPACK_IMPORTED_MODULE_10__["default"](body, responseOptions);
                                resolve(response);
                                return;
                            }

                            // For Node v6+
                            // Be less strict when decoding compressed responses, since sometimes
                            // servers send slightly invalid responses that are still accepted
                            // by common browsers.
                            // Always using Z_SYNC_FLUSH is what cURL does.
                            const zlibOptions = {
                                flush: node_zlib__WEBPACK_IMPORTED_MODULE_2__.Z_SYNC_FLUSH,
                                finishFlush: node_zlib__WEBPACK_IMPORTED_MODULE_2__.Z_SYNC_FLUSH
                            };

                            // For gzip
                            if (codings === 'gzip' || codings === 'x-gzip') {
                                body = (0, node_stream__WEBPACK_IMPORTED_MODULE_3__.pipeline)(body, node_zlib__WEBPACK_IMPORTED_MODULE_2__.createGunzip(zlibOptions), error => {
                                    if (error) {
                                        reject(error);
                                    }
                                });
                                response = new _response_js__WEBPACK_IMPORTED_MODULE_10__["default"](body, responseOptions);
                                resolve(response);
                                return;
                            }

                            // For deflate
                            if (codings === 'deflate' || codings === 'x-deflate') {
                                // Handle the infamous raw deflate response from old servers
                                // a hack for old IIS and Apache servers
                                const raw = (0, node_stream__WEBPACK_IMPORTED_MODULE_3__.pipeline)(response_, new node_stream__WEBPACK_IMPORTED_MODULE_3__.PassThrough(), error => {
                                    if (error) {
                                        reject(error);
                                    }
                                });
                                raw.once('data', chunk => {
                                    // See http://stackoverflow.com/questions/37519828
                                    if ((chunk[0] & 0x0F) === 0x08) {
                                        body = (0, node_stream__WEBPACK_IMPORTED_MODULE_3__.pipeline)(body, node_zlib__WEBPACK_IMPORTED_MODULE_2__.createInflate(), error => {
                                            if (error) {
                                                reject(error);
                                            }
                                        });
                                    } else {
                                        body = (0, node_stream__WEBPACK_IMPORTED_MODULE_3__.pipeline)(body, node_zlib__WEBPACK_IMPORTED_MODULE_2__.createInflateRaw(), error => {
                                            if (error) {
                                                reject(error);
                                            }
                                        });
                                    }

                                    response = new _response_js__WEBPACK_IMPORTED_MODULE_10__["default"](body, responseOptions);
                                    resolve(response);
                                });
                                raw.once('end', () => {
                                    // Some old IIS servers return zero-length OK deflate responses, so
                                    // 'data' is never emitted. See https://github.com/node-fetch/node-fetch/pull/903
                                    if (!response) {
                                        response = new _response_js__WEBPACK_IMPORTED_MODULE_10__["default"](body, responseOptions);
                                        resolve(response);
                                    }
                                });
                                return;
                            }

                            // For br
                            if (codings === 'br') {
                                body = (0, node_stream__WEBPACK_IMPORTED_MODULE_3__.pipeline)(body, node_zlib__WEBPACK_IMPORTED_MODULE_2__.createBrotliDecompress(), error => {
                                    if (error) {
                                        reject(error);
                                    }
                                });
                                response = new _response_js__WEBPACK_IMPORTED_MODULE_10__["default"](body, responseOptions);
                                resolve(response);
                                return;
                            }

                            // Otherwise, use response as-is
                            response = new _response_js__WEBPACK_IMPORTED_MODULE_10__["default"](body, responseOptions);
                            resolve(response);
                        });

                        // eslint-disable-next-line promise/prefer-await-to-then
                        (0, _body_js__WEBPACK_IMPORTED_MODULE_14__.writeToStream)(request_, request).catch(reject);
                    });
                }

                function fixResponseChunkedTransferBadEnding(request, errorCallback) {
                    const LAST_CHUNK = node_buffer__WEBPACK_IMPORTED_MODULE_4__.Buffer.from('0\r\n\r\n');

                    let isChunkedTransfer = false;
                    let properLastChunkReceived = false;
                    let previousChunk;

                    request.on('response', response => {
                        const { headers } = response;
                        isChunkedTransfer = headers['transfer-encoding'] === 'chunked' && !headers['content-length'];
                    });

                    request.on('socket', socket => {
                        const onSocketClose = () => {
                            if (isChunkedTransfer && !properLastChunkReceived) {
                                const error = new Error('Premature close');
                                error.code = 'ERR_STREAM_PREMATURE_CLOSE';
                                errorCallback(error);
                            }
                        };

                        const onData = buf => {
                            properLastChunkReceived = node_buffer__WEBPACK_IMPORTED_MODULE_4__.Buffer.compare(buf.slice(-5), LAST_CHUNK) === 0;

                            // Sometimes final 0-length chunk and end of message code are in separate packets
                            if (!properLastChunkReceived && previousChunk) {
                                properLastChunkReceived = (
                                    node_buffer__WEBPACK_IMPORTED_MODULE_4__.Buffer.compare(previousChunk.slice(-3), LAST_CHUNK.slice(0, 3)) === 0 &&
                                    node_buffer__WEBPACK_IMPORTED_MODULE_4__.Buffer.compare(buf.slice(-2), LAST_CHUNK.slice(3)) === 0
                                );
                            }

                            previousChunk = buf;
                        };

                        socket.prependListener('close', onSocketClose);
                        socket.on('data', onData);

                        request.on('close', () => {
                            socket.removeListener('close', onSocketClose);
                            socket.removeListener('data', onData);
                        });
                    });
                }


                /***/
            }),

/***/ "./node_modules/node-fetch/src/request.js":
/*!************************************************!*\
  !*** ./node_modules/node-fetch/src/request.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Request),
/* harmony export */   "getNodeRequestOptions": () => (/* binding */ getNodeRequestOptions)
                    /* harmony export */
                });
/* harmony import */ var node_url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:url */ "node:url");
/* harmony import */ var node_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:util */ "node:util");
/* harmony import */ var _headers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./headers.js */ "./node_modules/node-fetch/src/headers.js");
/* harmony import */ var _body_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./body.js */ "./node_modules/node-fetch/src/body.js");
/* harmony import */ var _utils_is_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/is.js */ "./node_modules/node-fetch/src/utils/is.js");
/* harmony import */ var _utils_get_search_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils/get-search.js */ "./node_modules/node-fetch/src/utils/get-search.js");
/* harmony import */ var _utils_referrer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/referrer.js */ "./node_modules/node-fetch/src/utils/referrer.js");
                /**
                 * Request.js
                 *
                 * Request class contains server only options
                 *
                 * All spec algorithm step numbers are based on https://fetch.spec.whatwg.org/commit-snapshots/ae716822cb3a61843226cd090eefc6589446c1d2/.
                 */









                const INTERNALS = Symbol('Request internals');

                /**
                 * Check if `obj` is an instance of Request.
                 *
                 * @param  {*} object
                 * @return {boolean}
                 */
                const isRequest = object => {
                    return (
                        typeof object === 'object' &&
                        typeof object[INTERNALS] === 'object'
                    );
                };

                const doBadDataWarn = (0, node_util__WEBPACK_IMPORTED_MODULE_1__.deprecate)(() => { },
                    '.data is not a valid RequestInit property, use .body instead',
                    'https://github.com/node-fetch/node-fetch/issues/1000 (request)');

                /**
                 * Request class
                 *
                 * Ref: https://fetch.spec.whatwg.org/#request-class
                 *
                 * @param   Mixed   input  Url or Request instance
                 * @param   Object  init   Custom options
                 * @return  Void
                 */
                class Request extends _body_js__WEBPACK_IMPORTED_MODULE_2__["default"] {
                    constructor(input, init = {}) {
                        let parsedURL;

                        // Normalize input and force URL to be encoded as UTF-8 (https://github.com/node-fetch/node-fetch/issues/245)
                        if (isRequest(input)) {
                            parsedURL = new URL(input.url);
                        } else {
                            parsedURL = new URL(input);
                            input = {};
                        }

                        if (parsedURL.username !== '' || parsedURL.password !== '') {
                            throw new TypeError(`${parsedURL} is an url with embedded credentials.`);
                        }

                        let method = init.method || input.method || 'GET';
                        if (/^(delete|get|head|options|post|put)$/i.test(method)) {
                            method = method.toUpperCase();
                        }

                        if (!isRequest(init) && 'data' in init) {
                            doBadDataWarn();
                        }

                        // eslint-disable-next-line no-eq-null, eqeqeq
                        if ((init.body != null || (isRequest(input) && input.body !== null)) &&
                            (method === 'GET' || method === 'HEAD')) {
                            throw new TypeError('Request with GET/HEAD method cannot have body');
                        }

                        const inputBody = init.body ?
                            init.body :
                            (isRequest(input) && input.body !== null ?
                                (0, _body_js__WEBPACK_IMPORTED_MODULE_2__.clone)(input) :
                                null);

                        super(inputBody, {
                            size: init.size || input.size || 0
                        });

                        const headers = new _headers_js__WEBPACK_IMPORTED_MODULE_3__["default"](init.headers || input.headers || {});

                        if (inputBody !== null && !headers.has('Content-Type')) {
                            const contentType = (0, _body_js__WEBPACK_IMPORTED_MODULE_2__.extractContentType)(inputBody, this);
                            if (contentType) {
                                headers.set('Content-Type', contentType);
                            }
                        }

                        let signal = isRequest(input) ?
                            input.signal :
                            null;
                        if ('signal' in init) {
                            signal = init.signal;
                        }

                        // eslint-disable-next-line no-eq-null, eqeqeq
                        if (signal != null && !(0, _utils_is_js__WEBPACK_IMPORTED_MODULE_4__.isAbortSignal)(signal)) {
                            throw new TypeError('Expected signal to be an instanceof AbortSignal or EventTarget');
                        }

                        // §5.4, Request constructor steps, step 15.1
                        // eslint-disable-next-line no-eq-null, eqeqeq
                        let referrer = init.referrer == null ? input.referrer : init.referrer;
                        if (referrer === '') {
                            // §5.4, Request constructor steps, step 15.2
                            referrer = 'no-referrer';
                        } else if (referrer) {
                            // §5.4, Request constructor steps, step 15.3.1, 15.3.2
                            const parsedReferrer = new URL(referrer);
                            // §5.4, Request constructor steps, step 15.3.3, 15.3.4
                            referrer = /^about:(\/\/)?client$/.test(parsedReferrer) ? 'client' : parsedReferrer;
                        } else {
                            referrer = undefined;
                        }

                        this[INTERNALS] = {
                            method,
                            redirect: init.redirect || input.redirect || 'follow',
                            headers,
                            parsedURL,
                            signal,
                            referrer
                        };

                        // Node-fetch-only options
                        this.follow = init.follow === undefined ? (input.follow === undefined ? 20 : input.follow) : init.follow;
                        this.compress = init.compress === undefined ? (input.compress === undefined ? true : input.compress) : init.compress;
                        this.counter = init.counter || input.counter || 0;
                        this.agent = init.agent || input.agent;
                        this.highWaterMark = init.highWaterMark || input.highWaterMark || 16384;
                        this.insecureHTTPParser = init.insecureHTTPParser || input.insecureHTTPParser || false;

                        // §5.4, Request constructor steps, step 16.
                        // Default is empty string per https://fetch.spec.whatwg.org/#concept-request-referrer-policy
                        this.referrerPolicy = init.referrerPolicy || input.referrerPolicy || '';
                    }

                    /** @returns {string} */
                    get method() {
                        return this[INTERNALS].method;
                    }

                    /** @returns {string} */
                    get url() {
                        return (0, node_url__WEBPACK_IMPORTED_MODULE_0__.format)(this[INTERNALS].parsedURL);
                    }

                    /** @returns {Headers} */
                    get headers() {
                        return this[INTERNALS].headers;
                    }

                    get redirect() {
                        return this[INTERNALS].redirect;
                    }

                    /** @returns {AbortSignal} */
                    get signal() {
                        return this[INTERNALS].signal;
                    }

                    // https://fetch.spec.whatwg.org/#dom-request-referrer
                    get referrer() {
                        if (this[INTERNALS].referrer === 'no-referrer') {
                            return '';
                        }

                        if (this[INTERNALS].referrer === 'client') {
                            return 'about:client';
                        }

                        if (this[INTERNALS].referrer) {
                            return this[INTERNALS].referrer.toString();
                        }

                        return undefined;
                    }

                    get referrerPolicy() {
                        return this[INTERNALS].referrerPolicy;
                    }

                    set referrerPolicy(referrerPolicy) {
                        this[INTERNALS].referrerPolicy = (0, _utils_referrer_js__WEBPACK_IMPORTED_MODULE_5__.validateReferrerPolicy)(referrerPolicy);
                    }

                    /**
                     * Clone this request
                     *
                     * @return  Request
                     */
                    clone() {
                        return new Request(this);
                    }

                    get [Symbol.toStringTag]() {
                        return 'Request';
                    }
                }

                Object.defineProperties(Request.prototype, {
                    method: { enumerable: true },
                    url: { enumerable: true },
                    headers: { enumerable: true },
                    redirect: { enumerable: true },
                    clone: { enumerable: true },
                    signal: { enumerable: true },
                    referrer: { enumerable: true },
                    referrerPolicy: { enumerable: true }
                });

                /**
                 * Convert a Request to Node.js http request options.
                 *
                 * @param {Request} request - A Request instance
                 * @return The options object to be passed to http.request
                 */
                const getNodeRequestOptions = request => {
                    const { parsedURL } = request[INTERNALS];
                    const headers = new _headers_js__WEBPACK_IMPORTED_MODULE_3__["default"](request[INTERNALS].headers);

                    // Fetch step 1.3
                    if (!headers.has('Accept')) {
                        headers.set('Accept', '*/*');
                    }

                    // HTTP-network-or-cache fetch steps 2.4-2.7
                    let contentLengthValue = null;
                    if (request.body === null && /^(post|put)$/i.test(request.method)) {
                        contentLengthValue = '0';
                    }

                    if (request.body !== null) {
                        const totalBytes = (0, _body_js__WEBPACK_IMPORTED_MODULE_2__.getTotalBytes)(request);
                        // Set Content-Length if totalBytes is a number (that is not NaN)
                        if (typeof totalBytes === 'number' && !Number.isNaN(totalBytes)) {
                            contentLengthValue = String(totalBytes);
                        }
                    }

                    if (contentLengthValue) {
                        headers.set('Content-Length', contentLengthValue);
                    }

                    // 4.1. Main fetch, step 2.6
                    // > If request's referrer policy is the empty string, then set request's referrer policy to the
                    // > default referrer policy.
                    if (request.referrerPolicy === '') {
                        request.referrerPolicy = _utils_referrer_js__WEBPACK_IMPORTED_MODULE_5__.DEFAULT_REFERRER_POLICY;
                    }

                    // 4.1. Main fetch, step 2.7
                    // > If request's referrer is not "no-referrer", set request's referrer to the result of invoking
                    // > determine request's referrer.
                    if (request.referrer && request.referrer !== 'no-referrer') {
                        request[INTERNALS].referrer = (0, _utils_referrer_js__WEBPACK_IMPORTED_MODULE_5__.determineRequestsReferrer)(request);
                    } else {
                        request[INTERNALS].referrer = 'no-referrer';
                    }

                    // 4.5. HTTP-network-or-cache fetch, step 6.9
                    // > If httpRequest's referrer is a URL, then append `Referer`/httpRequest's referrer, serialized
                    // >  and isomorphic encoded, to httpRequest's header list.
                    if (request[INTERNALS].referrer instanceof URL) {
                        headers.set('Referer', request.referrer);
                    }

                    // HTTP-network-or-cache fetch step 2.11
                    if (!headers.has('User-Agent')) {
                        headers.set('User-Agent', 'node-fetch');
                    }

                    // HTTP-network-or-cache fetch step 2.15
                    if (request.compress && !headers.has('Accept-Encoding')) {
                        headers.set('Accept-Encoding', 'gzip, deflate, br');
                    }

                    let { agent } = request;
                    if (typeof agent === 'function') {
                        agent = agent(parsedURL);
                    }

                    if (!headers.has('Connection') && !agent) {
                        headers.set('Connection', 'close');
                    }

                    // HTTP-network fetch step 4.2
                    // chunked encoding is handled by Node.js

                    const search = (0, _utils_get_search_js__WEBPACK_IMPORTED_MODULE_6__.getSearch)(parsedURL);

                    // Pass the full URL directly to request(), but overwrite the following
                    // options:
                    const options = {
                        // Overwrite search to retain trailing ? (issue #776)
                        path: parsedURL.pathname + search,
                        // The following options are not expressed in the URL
                        method: request.method,
                        headers: headers[Symbol.for('nodejs.util.inspect.custom')](),
                        insecureHTTPParser: request.insecureHTTPParser,
                        agent
                    };

                    return {
                        /** @type {URL} */
                        parsedURL,
                        options
                    };
                };


                /***/
            }),

/***/ "./node_modules/node-fetch/src/response.js":
/*!*************************************************!*\
  !*** ./node_modules/node-fetch/src/response.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Response)
                    /* harmony export */
                });
/* harmony import */ var _headers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./headers.js */ "./node_modules/node-fetch/src/headers.js");
/* harmony import */ var _body_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./body.js */ "./node_modules/node-fetch/src/body.js");
/* harmony import */ var _utils_is_redirect_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils/is-redirect.js */ "./node_modules/node-fetch/src/utils/is-redirect.js");
                /**
                 * Response.js
                 *
                 * Response class provides content decoding
                 */





                const INTERNALS = Symbol('Response internals');

                /**
                 * Response class
                 *
                 * Ref: https://fetch.spec.whatwg.org/#response-class
                 *
                 * @param   Stream  body  Readable stream
                 * @param   Object  opts  Response options
                 * @return  Void
                 */
                class Response extends _body_js__WEBPACK_IMPORTED_MODULE_0__["default"] {
                    constructor(body = null, options = {}) {
                        super(body, options);

                        // eslint-disable-next-line no-eq-null, eqeqeq, no-negated-condition
                        const status = options.status != null ? options.status : 200;

                        const headers = new _headers_js__WEBPACK_IMPORTED_MODULE_1__["default"](options.headers);

                        if (body !== null && !headers.has('Content-Type')) {
                            const contentType = (0, _body_js__WEBPACK_IMPORTED_MODULE_0__.extractContentType)(body, this);
                            if (contentType) {
                                headers.append('Content-Type', contentType);
                            }
                        }

                        this[INTERNALS] = {
                            type: 'default',
                            url: options.url,
                            status,
                            statusText: options.statusText || '',
                            headers,
                            counter: options.counter,
                            highWaterMark: options.highWaterMark
                        };
                    }

                    get type() {
                        return this[INTERNALS].type;
                    }

                    get url() {
                        return this[INTERNALS].url || '';
                    }

                    get status() {
                        return this[INTERNALS].status;
                    }

                    /**
                     * Convenience property representing if the request ended normally
                     */
                    get ok() {
                        return this[INTERNALS].status >= 200 && this[INTERNALS].status < 300;
                    }

                    get redirected() {
                        return this[INTERNALS].counter > 0;
                    }

                    get statusText() {
                        return this[INTERNALS].statusText;
                    }

                    get headers() {
                        return this[INTERNALS].headers;
                    }

                    get highWaterMark() {
                        return this[INTERNALS].highWaterMark;
                    }

                    /**
                     * Clone this response
                     *
                     * @return  Response
                     */
                    clone() {
                        return new Response((0, _body_js__WEBPACK_IMPORTED_MODULE_0__.clone)(this, this.highWaterMark), {
                            type: this.type,
                            url: this.url,
                            status: this.status,
                            statusText: this.statusText,
                            headers: this.headers,
                            ok: this.ok,
                            redirected: this.redirected,
                            size: this.size,
                            highWaterMark: this.highWaterMark
                        });
                    }

                    /**
                     * @param {string} url    The URL that the new response is to originate from.
                     * @param {number} status An optional status code for the response (e.g., 302.)
                     * @returns {Response}    A Response object.
                     */
                    static redirect(url, status = 302) {
                        if (!(0, _utils_is_redirect_js__WEBPACK_IMPORTED_MODULE_2__.isRedirect)(status)) {
                            throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
                        }

                        return new Response(null, {
                            headers: {
                                location: new URL(url).toString()
                            },
                            status
                        });
                    }

                    static error() {
                        const response = new Response(null, { status: 0, statusText: '' });
                        response[INTERNALS].type = 'error';
                        return response;
                    }

                    static json(data = undefined, init = {}) {
                        const body = JSON.stringify(data);

                        if (body === undefined) {
                            throw new TypeError('data is not JSON serializable');
                        }

                        const headers = new _headers_js__WEBPACK_IMPORTED_MODULE_1__["default"](init && init.headers);

                        if (!headers.has('content-type')) {
                            headers.set('content-type', 'application/json');
                        }

                        return new Response(body, {
                            ...init,
                            headers
                        });
                    }

                    get [Symbol.toStringTag]() {
                        return 'Response';
                    }
                }

                Object.defineProperties(Response.prototype, {
                    type: { enumerable: true },
                    url: { enumerable: true },
                    status: { enumerable: true },
                    ok: { enumerable: true },
                    redirected: { enumerable: true },
                    statusText: { enumerable: true },
                    headers: { enumerable: true },
                    clone: { enumerable: true }
                });


                /***/
            }),

/***/ "./node_modules/node-fetch/src/utils/get-search.js":
/*!*********************************************************!*\
  !*** ./node_modules/node-fetch/src/utils/get-search.js ***!
  \*********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "getSearch": () => (/* binding */ getSearch)
                    /* harmony export */
                });
                const getSearch = parsedURL => {
                    if (parsedURL.search) {
                        return parsedURL.search;
                    }

                    const lastOffset = parsedURL.href.length - 1;
                    const hash = parsedURL.hash || (parsedURL.href[lastOffset] === '#' ? '#' : '');
                    return parsedURL.href[lastOffset - hash.length] === '?' ? '?' : '';
                };


                /***/
            }),

/***/ "./node_modules/node-fetch/src/utils/is-redirect.js":
/*!**********************************************************!*\
  !*** ./node_modules/node-fetch/src/utils/is-redirect.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isRedirect": () => (/* binding */ isRedirect)
                    /* harmony export */
                });
                const redirectStatus = new Set([301, 302, 303, 307, 308]);

                /**
                 * Redirect code matching
                 *
                 * @param {number} code - Status code
                 * @return {boolean}
                 */
                const isRedirect = code => {
                    return redirectStatus.has(code);
                };


                /***/
            }),

/***/ "./node_modules/node-fetch/src/utils/is.js":
/*!*************************************************!*\
  !*** ./node_modules/node-fetch/src/utils/is.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isAbortSignal": () => (/* binding */ isAbortSignal),
/* harmony export */   "isBlob": () => (/* binding */ isBlob),
/* harmony export */   "isDomainOrSubdomain": () => (/* binding */ isDomainOrSubdomain),
/* harmony export */   "isSameProtocol": () => (/* binding */ isSameProtocol),
/* harmony export */   "isURLSearchParameters": () => (/* binding */ isURLSearchParameters)
                    /* harmony export */
                });
                /**
                 * Is.js
                 *
                 * Object type checks.
                 */

                const NAME = Symbol.toStringTag;

                /**
                 * Check if `obj` is a URLSearchParams object
                 * ref: https://github.com/node-fetch/node-fetch/issues/296#issuecomment-307598143
                 * @param {*} object - Object to check for
                 * @return {boolean}
                 */
                const isURLSearchParameters = object => {
                    return (
                        typeof object === 'object' &&
                        typeof object.append === 'function' &&
                        typeof object.delete === 'function' &&
                        typeof object.get === 'function' &&
                        typeof object.getAll === 'function' &&
                        typeof object.has === 'function' &&
                        typeof object.set === 'function' &&
                        typeof object.sort === 'function' &&
                        object[NAME] === 'URLSearchParams'
                    );
                };

                /**
                 * Check if `object` is a W3C `Blob` object (which `File` inherits from)
                 * @param {*} object - Object to check for
                 * @return {boolean}
                 */
                const isBlob = object => {
                    return (
                        object &&
                        typeof object === 'object' &&
                        typeof object.arrayBuffer === 'function' &&
                        typeof object.type === 'string' &&
                        typeof object.stream === 'function' &&
                        typeof object.constructor === 'function' &&
                        /^(Blob|File)$/.test(object[NAME])
                    );
                };

                /**
                 * Check if `obj` is an instance of AbortSignal.
                 * @param {*} object - Object to check for
                 * @return {boolean}
                 */
                const isAbortSignal = object => {
                    return (
                        typeof object === 'object' && (
                            object[NAME] === 'AbortSignal' ||
                            object[NAME] === 'EventTarget'
                        )
                    );
                };

                /**
                 * isDomainOrSubdomain reports whether sub is a subdomain (or exact match) of
                 * the parent domain.
                 *
                 * Both domains must already be in canonical form.
                 * @param {string|URL} original
                 * @param {string|URL} destination
                 */
                const isDomainOrSubdomain = (destination, original) => {
                    const orig = new URL(original).hostname;
                    const dest = new URL(destination).hostname;

                    return orig === dest || orig.endsWith(`.${dest}`);
                };

                /**
                 * isSameProtocol reports whether the two provided URLs use the same protocol.
                 *
                 * Both domains must already be in canonical form.
                 * @param {string|URL} original
                 * @param {string|URL} destination
                 */
                const isSameProtocol = (destination, original) => {
                    const orig = new URL(original).protocol;
                    const dest = new URL(destination).protocol;

                    return orig === dest;
                };


                /***/
            }),

/***/ "./node_modules/node-fetch/src/utils/referrer.js":
/*!*******************************************************!*\
  !*** ./node_modules/node-fetch/src/utils/referrer.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

                "use strict";
                __webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DEFAULT_REFERRER_POLICY": () => (/* binding */ DEFAULT_REFERRER_POLICY),
/* harmony export */   "ReferrerPolicy": () => (/* binding */ ReferrerPolicy),
/* harmony export */   "determineRequestsReferrer": () => (/* binding */ determineRequestsReferrer),
/* harmony export */   "isOriginPotentiallyTrustworthy": () => (/* binding */ isOriginPotentiallyTrustworthy),
/* harmony export */   "isUrlPotentiallyTrustworthy": () => (/* binding */ isUrlPotentiallyTrustworthy),
/* harmony export */   "parseReferrerPolicyFromHeader": () => (/* binding */ parseReferrerPolicyFromHeader),
/* harmony export */   "stripURLForUseAsAReferrer": () => (/* binding */ stripURLForUseAsAReferrer),
/* harmony export */   "validateReferrerPolicy": () => (/* binding */ validateReferrerPolicy)
                    /* harmony export */
                });
/* harmony import */ var node_net__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:net */ "node:net");


                /**
                 * @external URL
                 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URL|URL}
                 */

                /**
                 * @module utils/referrer
                 * @private
                 */

                /**
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#strip-url|Referrer Policy §8.4. Strip url for use as a referrer}
                 * @param {string} URL
                 * @param {boolean} [originOnly=false]
                 */
                function stripURLForUseAsAReferrer(url, originOnly = false) {
                    // 1. If url is null, return no referrer.
                    if (url == null) { // eslint-disable-line no-eq-null, eqeqeq
                        return 'no-referrer';
                    }

                    url = new URL(url);

                    // 2. If url's scheme is a local scheme, then return no referrer.
                    if (/^(about|blob|data):$/.test(url.protocol)) {
                        return 'no-referrer';
                    }

                    // 3. Set url's username to the empty string.
                    url.username = '';

                    // 4. Set url's password to null.
                    // Note: `null` appears to be a mistake as this actually results in the password being `"null"`.
                    url.password = '';

                    // 5. Set url's fragment to null.
                    // Note: `null` appears to be a mistake as this actually results in the fragment being `"#null"`.
                    url.hash = '';

                    // 6. If the origin-only flag is true, then:
                    if (originOnly) {
                        // 6.1. Set url's path to null.
                        // Note: `null` appears to be a mistake as this actually results in the path being `"/null"`.
                        url.pathname = '';

                        // 6.2. Set url's query to null.
                        // Note: `null` appears to be a mistake as this actually results in the query being `"?null"`.
                        url.search = '';
                    }

                    // 7. Return url.
                    return url;
                }

                /**
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#enumdef-referrerpolicy|enum ReferrerPolicy}
                 */
                const ReferrerPolicy = new Set([
                    '',
                    'no-referrer',
                    'no-referrer-when-downgrade',
                    'same-origin',
                    'origin',
                    'strict-origin',
                    'origin-when-cross-origin',
                    'strict-origin-when-cross-origin',
                    'unsafe-url'
                ]);

                /**
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#default-referrer-policy|default referrer policy}
                 */
                const DEFAULT_REFERRER_POLICY = 'strict-origin-when-cross-origin';

                /**
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#referrer-policies|Referrer Policy §3. Referrer Policies}
                 * @param {string} referrerPolicy
                 * @returns {string} referrerPolicy
                 */
                function validateReferrerPolicy(referrerPolicy) {
                    if (!ReferrerPolicy.has(referrerPolicy)) {
                        throw new TypeError(`Invalid referrerPolicy: ${referrerPolicy}`);
                    }

                    return referrerPolicy;
                }

                /**
                 * @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-origin-trustworthy|Referrer Policy §3.2. Is origin potentially trustworthy?}
                 * @param {external:URL} url
                 * @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
                 */
                function isOriginPotentiallyTrustworthy(url) {
                    // 1. If origin is an opaque origin, return "Not Trustworthy".
                    // Not applicable

                    // 2. Assert: origin is a tuple origin.
                    // Not for implementations

                    // 3. If origin's scheme is either "https" or "wss", return "Potentially Trustworthy".
                    if (/^(http|ws)s:$/.test(url.protocol)) {
                        return true;
                    }

                    // 4. If origin's host component matches one of the CIDR notations 127.0.0.0/8 or ::1/128 [RFC4632], return "Potentially Trustworthy".
                    const hostIp = url.host.replace(/(^\[)|(]$)/g, '');
                    const hostIPVersion = (0, node_net__WEBPACK_IMPORTED_MODULE_0__.isIP)(hostIp);

                    if (hostIPVersion === 4 && /^127\./.test(hostIp)) {
                        return true;
                    }

                    if (hostIPVersion === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(hostIp)) {
                        return true;
                    }

                    // 5. If origin's host component is "localhost" or falls within ".localhost", and the user agent conforms to the name resolution rules in [let-localhost-be-localhost], return "Potentially Trustworthy".
                    // We are returning FALSE here because we cannot ensure conformance to
                    // let-localhost-be-loalhost (https://tools.ietf.org/html/draft-west-let-localhost-be-localhost)
                    if (url.host === 'localhost' || url.host.endsWith('.localhost')) {
                        return false;
                    }

                    // 6. If origin's scheme component is file, return "Potentially Trustworthy".
                    if (url.protocol === 'file:') {
                        return true;
                    }

                    // 7. If origin's scheme component is one which the user agent considers to be authenticated, return "Potentially Trustworthy".
                    // Not supported

                    // 8. If origin has been configured as a trustworthy origin, return "Potentially Trustworthy".
                    // Not supported

                    // 9. Return "Not Trustworthy".
                    return false;
                }

                /**
                 * @see {@link https://w3c.github.io/webappsec-secure-contexts/#is-url-trustworthy|Referrer Policy §3.3. Is url potentially trustworthy?}
                 * @param {external:URL} url
                 * @returns `true`: "Potentially Trustworthy", `false`: "Not Trustworthy"
                 */
                function isUrlPotentiallyTrustworthy(url) {
                    // 1. If url is "about:blank" or "about:srcdoc", return "Potentially Trustworthy".
                    if (/^about:(blank|srcdoc)$/.test(url)) {
                        return true;
                    }

                    // 2. If url's scheme is "data", return "Potentially Trustworthy".
                    if (url.protocol === 'data:') {
                        return true;
                    }

                    // Note: The origin of blob: and filesystem: URLs is the origin of the context in which they were
                    // created. Therefore, blobs created in a trustworthy origin will themselves be potentially
                    // trustworthy.
                    if (/^(blob|filesystem):$/.test(url.protocol)) {
                        return true;
                    }

                    // 3. Return the result of executing §3.2 Is origin potentially trustworthy? on url's origin.
                    return isOriginPotentiallyTrustworthy(url);
                }

                /**
                 * Modifies the referrerURL to enforce any extra security policy considerations.
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
                 * @callback module:utils/referrer~referrerURLCallback
                 * @param {external:URL} referrerURL
                 * @returns {external:URL} modified referrerURL
                 */

                /**
                 * Modifies the referrerOrigin to enforce any extra security policy considerations.
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}, step 7
                 * @callback module:utils/referrer~referrerOriginCallback
                 * @param {external:URL} referrerOrigin
                 * @returns {external:URL} modified referrerOrigin
                 */

                /**
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#determine-requests-referrer|Referrer Policy §8.3. Determine request's Referrer}
                 * @param {Request} request
                 * @param {object} o
                 * @param {module:utils/referrer~referrerURLCallback} o.referrerURLCallback
                 * @param {module:utils/referrer~referrerOriginCallback} o.referrerOriginCallback
                 * @returns {external:URL} Request's referrer
                 */
                function determineRequestsReferrer(request, { referrerURLCallback, referrerOriginCallback } = {}) {
                    // There are 2 notes in the specification about invalid pre-conditions.  We return null, here, for
                    // these cases:
                    // > Note: If request's referrer is "no-referrer", Fetch will not call into this algorithm.
                    // > Note: If request's referrer policy is the empty string, Fetch will not call into this
                    // > algorithm.
                    if (request.referrer === 'no-referrer' || request.referrerPolicy === '') {
                        return null;
                    }

                    // 1. Let policy be request's associated referrer policy.
                    const policy = request.referrerPolicy;

                    // 2. Let environment be request's client.
                    // not applicable to node.js

                    // 3. Switch on request's referrer:
                    if (request.referrer === 'about:client') {
                        return 'no-referrer';
                    }

                    // "a URL": Let referrerSource be request's referrer.
                    const referrerSource = request.referrer;

                    // 4. Let request's referrerURL be the result of stripping referrerSource for use as a referrer.
                    let referrerURL = stripURLForUseAsAReferrer(referrerSource);

                    // 5. Let referrerOrigin be the result of stripping referrerSource for use as a referrer, with the
                    //    origin-only flag set to true.
                    let referrerOrigin = stripURLForUseAsAReferrer(referrerSource, true);

                    // 6. If the result of serializing referrerURL is a string whose length is greater than 4096, set
                    //    referrerURL to referrerOrigin.
                    if (referrerURL.toString().length > 4096) {
                        referrerURL = referrerOrigin;
                    }

                    // 7. The user agent MAY alter referrerURL or referrerOrigin at this point to enforce arbitrary
                    //    policy considerations in the interests of minimizing data leakage. For example, the user
                    //    agent could strip the URL down to an origin, modify its host, replace it with an empty
                    //    string, etc.
                    if (referrerURLCallback) {
                        referrerURL = referrerURLCallback(referrerURL);
                    }

                    if (referrerOriginCallback) {
                        referrerOrigin = referrerOriginCallback(referrerOrigin);
                    }

                    // 8.Execute the statements corresponding to the value of policy:
                    const currentURL = new URL(request.url);

                    switch (policy) {
                        case 'no-referrer':
                            return 'no-referrer';

                        case 'origin':
                            return referrerOrigin;

                        case 'unsafe-url':
                            return referrerURL;

                        case 'strict-origin':
                            // 1. If referrerURL is a potentially trustworthy URL and request's current URL is not a
                            //    potentially trustworthy URL, then return no referrer.
                            if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
                                return 'no-referrer';
                            }

                            // 2. Return referrerOrigin.
                            return referrerOrigin.toString();

                        case 'strict-origin-when-cross-origin':
                            // 1. If the origin of referrerURL and the origin of request's current URL are the same, then
                            //    return referrerURL.
                            if (referrerURL.origin === currentURL.origin) {
                                return referrerURL;
                            }

                            // 2. If referrerURL is a potentially trustworthy URL and request's current URL is not a
                            //    potentially trustworthy URL, then return no referrer.
                            if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
                                return 'no-referrer';
                            }

                            // 3. Return referrerOrigin.
                            return referrerOrigin;

                        case 'same-origin':
                            // 1. If the origin of referrerURL and the origin of request's current URL are the same, then
                            //    return referrerURL.
                            if (referrerURL.origin === currentURL.origin) {
                                return referrerURL;
                            }

                            // 2. Return no referrer.
                            return 'no-referrer';

                        case 'origin-when-cross-origin':
                            // 1. If the origin of referrerURL and the origin of request's current URL are the same, then
                            //    return referrerURL.
                            if (referrerURL.origin === currentURL.origin) {
                                return referrerURL;
                            }

                            // Return referrerOrigin.
                            return referrerOrigin;

                        case 'no-referrer-when-downgrade':
                            // 1. If referrerURL is a potentially trustworthy URL and request's current URL is not a
                            //    potentially trustworthy URL, then return no referrer.
                            if (isUrlPotentiallyTrustworthy(referrerURL) && !isUrlPotentiallyTrustworthy(currentURL)) {
                                return 'no-referrer';
                            }

                            // 2. Return referrerURL.
                            return referrerURL;

                        default:
                            throw new TypeError(`Invalid referrerPolicy: ${policy}`);
                    }
                }

                /**
                 * @see {@link https://w3c.github.io/webappsec-referrer-policy/#parse-referrer-policy-from-header|Referrer Policy §8.1. Parse a referrer policy from a Referrer-Policy header}
                 * @param {Headers} headers Response headers
                 * @returns {string} policy
                 */
                function parseReferrerPolicyFromHeader(headers) {
                    // 1. Let policy-tokens be the result of extracting header list values given `Referrer-Policy`
                    //    and response’s header list.
                    const policyTokens = (headers.get('referrer-policy') || '').split(/[,\s]+/);

                    // 2. Let policy be the empty string.
                    let policy = '';

                    // 3. For each token in policy-tokens, if token is a referrer policy and token is not the empty
                    //    string, then set policy to token.
                    // Note: This algorithm loops over multiple policy values to allow deployment of new policy
                    // values with fallbacks for older user agents, as described in § 11.1 Unknown Policy Values.
                    for (const token of policyTokens) {
                        if (token && ReferrerPolicy.has(token)) {
                            policy = token;
                        }
                    }

                    // 4. Return policy.
                    return policy;
                }


                /***/
            })

        /******/
    });
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
            /******/
        }
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
            /******/
        };
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
        /******/
    }
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for (var key in definition) {
/******/ 				if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
                    /******/
                }
                /******/
            }
            /******/
        };
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
        /******/
    }, []));
            /******/
        };
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".main.js";
            /******/
        };
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function () {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
                /******/
            } catch (e) {
/******/ 				if (typeof window === 'object') return window;
                /******/
            }
            /******/
        })();
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "jsonparser:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if (inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if (key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for (var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if (s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
                    /******/
                }
                /******/
            }
/******/ 			if (!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
                    /******/
                }
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 				script.src = url;
                /******/
            }
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if (prev) return prev(event);
                /******/
            };
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
            /******/
        };
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
                /******/
            }
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
            /******/
        };
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
        /******/
    })();
/******/
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
            /******/
        };
/******/
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if (installedChunkData !== 0) { // 0 means "already installed".
/******/
/******/ 					// a Promise means "currently loading".
/******/ 					if (installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
                    /******/
                } else {
/******/ 						if (true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if (__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if (installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
                                    /******/
                                }
                                /******/
                            }
                            /******/
                        };
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
                        /******/
                    } else installedChunks[chunkId] = 0;
                    /******/
                }
                /******/
            }
            /******/
        };
/******/
/******/ 		// no prefetching
/******/
/******/ 		// no preloaded
/******/
/******/ 		// no HMR
/******/
/******/ 		// no HMR manifest
/******/
/******/ 		// no on chunks loaded
/******/
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if (chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for (moduleId in moreModules) {
/******/ 					if (__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
                        /******/
                    }
                    /******/
                }
/******/ 				if (runtime) var result = runtime(__webpack_require__);
                /******/
            }
/******/ 			if (parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for (; i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
                    /******/
                }
/******/ 				installedChunks[chunkId] = 0;
                /******/
            }
            /******/
            /******/
        }
/******/
/******/ 		var chunkLoadingGlobal = this["webpackChunkjsonparser"] = this["webpackChunkjsonparser"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
        /******/
    })();
/******/
/************************************************************************/
/******/
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/parser.ts");
    /******/
    /******/
})()
    ;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsU0FBUztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLFNBQVM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxTQUFTO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLFVBQVUsa0JBQWtCLFFBQVE7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUMsT0FBTyxrQkFBa0IsUUFBUTtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxTQUFTO0FBQzVDO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxTQUFTLG1DQUFtQyxZQUFZLEtBQUssV0FBVztBQUMzRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUNBQW1DLFNBQVM7QUFDNUM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9FQUFvRSxNQUFNO0FBQzFFO0FBQ0E7QUFDQTtBQUNBLHVFQUF1RSxNQUFNO0FBQzdFOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MscUJBQXFCO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELG9EQUFvRDtBQUM3RztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLHVEQUF1RCwyQkFBMkI7QUFDbEYsdURBQXVELDBCQUEwQjtBQUNqRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQSx5QkFBeUIsOENBQThDO0FBQ3ZFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLGtCQUFrQjtBQUNwQyxnQkFBZ0Isa0JBQWtCO0FBQ2xDLHVCQUF1QixrQkFBa0I7QUFDekMsa0JBQWtCO0FBQ2xCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUVBQW1FLE1BQU07QUFDekU7O0FBRUE7QUFDQSxnQkFBZ0IsZ0JBQWdCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUZBQXVGLFNBQVM7QUFDaEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUVBQXVFLFNBQVM7QUFDaEY7QUFDQTtBQUNBLHVFQUF1RSxTQUFTO0FBQ2hGO0FBQ0E7QUFDQSx1RUFBdUUsU0FBUztBQUNoRjtBQUNBO0FBQ0EsdUVBQXVFLFNBQVM7QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1DQUFtQyxTQUFTO0FBQzVDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxrQkFBa0I7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQiw0Q0FBNEM7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixrQkFBa0I7QUFDbkMsaUJBQWlCLGtCQUFrQjtBQUNuQyxxQkFBcUIsa0JBQWtCO0FBQ3ZDLGtCQUFrQjtBQUNsQixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUVBQXVFLE9BQU87QUFDOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHFCQUFxQjtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsa0RBQWtEO0FBQzNHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsNENBQTRDO0FBQ3JHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBLHFEQUFxRCxtREFBbUQ7QUFDeEcsNEZBQTRGO0FBQzVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsa0JBQWtCO0FBQ25DLGlCQUFpQixrQkFBa0I7QUFDbkMsdUJBQXVCLGtCQUFrQjtBQUN6QyxpQkFBaUIsa0JBQWtCO0FBQ25DLGtCQUFrQixrQkFBa0I7QUFDcEMsdUJBQXVCLGtCQUFrQjtBQUN6QyxpQkFBaUI7QUFDakIsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLHVDQUF1QztBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsNkNBQTZDO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDLGtCQUFrQixrQkFBa0I7QUFDcEMsaUJBQWlCO0FBQ2pCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELE1BQU07QUFDL0Q7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFLE1BQU07QUFDaEY7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFLE1BQU07QUFDNUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrREFBK0QsaURBQWlEO0FBQ2hIO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QixxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQSw0QkFBNEIsdUNBQXVDO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLGtCQUFrQjtBQUNuQyxtQkFBbUIsa0JBQWtCO0FBQ3JDLGlCQUFpQixrQkFBa0I7QUFDbkMsdUJBQXVCO0FBQ3ZCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFLE1BQU07QUFDaEY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkVBQTJFLE1BQU07QUFDakY7QUFDQTtBQUNBO0FBQ0EsMERBQTBELE1BQU07QUFDaEU7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsbURBQW1ELGFBQWE7O0FBRWhFLENBQUM7QUFDRDs7Ozs7Ozs7Ozs7O0FDcG5JQTs7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHLElBQUk7QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0EsR0FBRyxJQUFJO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBLEVBQUUsSUFBSTtBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsOENBQThDO0FBQ3pEO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRTZCO0FBQ0U7QUFDRjtB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V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7V0FDQTtXQUNBOzs7OztVRXJGQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2pzb25wYXJzZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1kb21leGNlcHRpb24vaW5kZXguanMiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci8uL3NyYy9PYnNlcnZlci50cyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vc3JjL2J1aWxkZXIudHMiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci8uL3NyYy9mZXRjaGVyLnRzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9zcmMvZmlsbGVyLnRzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9zcmMvcGFyc2VyLnRzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9zcmMvc3RhdGUudHMiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci8uL25vZGVfbW9kdWxlcy93ZWItc3RyZWFtcy1wb2x5ZmlsbC9kaXN0L3BvbnlmaWxsLmVzMjAxOC5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJidWZmZXJcIiIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOmJ1ZmZlclwiIiwid2VicGFjazovL2pzb25wYXJzZXIvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6ZnNcIiIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOmh0dHBcIiIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOmh0dHBzXCIiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTpuZXRcIiIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOnBhdGhcIiIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOnByb2Nlc3NcIiIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL2V4dGVybmFsIG5vZGUtY29tbW9uanMgXCJub2RlOnN0cmVhbVwiIiwid2VicGFjazovL2pzb25wYXJzZXIvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6c3RyZWFtL3dlYlwiIiwid2VicGFjazovL2pzb25wYXJzZXIvZXh0ZXJuYWwgbm9kZS1jb21tb25qcyBcIm5vZGU6dXJsXCIiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTp1dGlsXCIiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwibm9kZTp6bGliXCIiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci9leHRlcm5hbCBub2RlLWNvbW1vbmpzIFwid29ya2VyX3RocmVhZHNcIiIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL2ZldGNoLWJsb2Ivc3RyZWFtcy5janMiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci8uL25vZGVfbW9kdWxlcy9kYXRhLXVyaS10by1idWZmZXIvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL2ZldGNoLWJsb2IvZmlsZS5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL2ZldGNoLWJsb2IvZnJvbS5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL2ZldGNoLWJsb2IvaW5kZXguanMiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci8uL25vZGVfbW9kdWxlcy9mb3JtZGF0YS1wb2x5ZmlsbC9lc20ubWluLmpzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1mZXRjaC9zcmMvYm9keS5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL25vZGUtZmV0Y2gvc3JjL2Vycm9ycy9hYm9ydC1lcnJvci5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL25vZGUtZmV0Y2gvc3JjL2Vycm9ycy9iYXNlLmpzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1mZXRjaC9zcmMvZXJyb3JzL2ZldGNoLWVycm9yLmpzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1mZXRjaC9zcmMvaGVhZGVycy5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL25vZGUtZmV0Y2gvc3JjL2luZGV4LmpzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1mZXRjaC9zcmMvcmVxdWVzdC5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL25vZGUtZmV0Y2gvc3JjL3Jlc3BvbnNlLmpzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1mZXRjaC9zcmMvdXRpbHMvZ2V0LXNlYXJjaC5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyLy4vbm9kZV9tb2R1bGVzL25vZGUtZmV0Y2gvc3JjL3V0aWxzL2lzLXJlZGlyZWN0LmpzIiwid2VicGFjazovL2pzb25wYXJzZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1mZXRjaC9zcmMvdXRpbHMvaXMuanMiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci8uL25vZGVfbW9kdWxlcy9ub2RlLWZldGNoL3NyYy91dGlscy9yZWZlcnJlci5qcyIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2pzb25wYXJzZXIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2pzb25wYXJzZXIvd2VicGFjay9ydW50aW1lL2Vuc3VyZSBjaHVuayIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL3dlYnBhY2svcnVudGltZS9nZXQgamF2YXNjcmlwdCBjaHVuayBmaWxlbmFtZSIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2pzb25wYXJzZXIvd2VicGFjay9ydW50aW1lL2xvYWQgc2NyaXB0Iiwid2VicGFjazovL2pzb25wYXJzZXIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9qc29ucGFyc2VyL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2pzb25wYXJzZXIvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vanNvbnBhcnNlci93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2pzb25wYXJzZXIvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2pzb25wYXJzZXIvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISBub2RlLWRvbWV4Y2VwdGlvbi4gTUlUIExpY2Vuc2UuIEppbW15IFfDpHJ0aW5nIDxodHRwczovL2ppbW15LndhcnRpbmcuc2Uvb3BlbnNvdXJjZT4gKi9cblxuaWYgKCFnbG9iYWxUaGlzLkRPTUV4Y2VwdGlvbikge1xuICB0cnkge1xuICAgIGNvbnN0IHsgTWVzc2FnZUNoYW5uZWwgfSA9IHJlcXVpcmUoJ3dvcmtlcl90aHJlYWRzJyksXG4gICAgcG9ydCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLFxuICAgIGFiID0gbmV3IEFycmF5QnVmZmVyKClcbiAgICBwb3J0LnBvc3RNZXNzYWdlKGFiLCBbYWIsIGFiXSlcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXJyLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdET01FeGNlcHRpb24nICYmIChcbiAgICAgIGdsb2JhbFRoaXMuRE9NRXhjZXB0aW9uID0gZXJyLmNvbnN0cnVjdG9yXG4gICAgKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5ET01FeGNlcHRpb25cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuT2JzZXJ2YWJsZSA9IHZvaWQgMDtcclxuY2xhc3MgT2JzZXJ2YWJsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLl9vYnNlcnZlcnMgPSBbXTtcclxuICAgIH1cclxuICAgIHN1YnNjcmliZShvYnNlcnZlcikge1xyXG4gICAgICAgIHRoaXMuX29ic2VydmVycy5wdXNoKG9ic2VydmVyKTtcclxuICAgIH1cclxuICAgIHVuc3Vic2NyaWJlKG9ic2VydmVyKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9vYnNlcnZlcnMuaW5kZXhPZihvYnNlcnZlcik7XHJcbiAgICAgICAgdGhpcy5fb2JzZXJ2ZXJzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICBuZXh0KHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIGZvciAoY29uc3Qgb2JzZXJ2ZXIgb2YgdGhpcy5fb2JzZXJ2ZXJzKSB7XHJcbiAgICAgICAgICAgIG9ic2VydmVyKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5PYnNlcnZhYmxlID0gT2JzZXJ2YWJsZTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5QYXJzZXJCdWlsZGVyID0gdm9pZCAwO1xyXG5jb25zdCBwYXJzZXJfMSA9IHJlcXVpcmUoXCIuL3BhcnNlclwiKTtcclxuY29uc3QgZmV0Y2hlcl8xID0gcmVxdWlyZShcIi4vZmV0Y2hlclwiKTtcclxuY29uc3QgZmlsbGVyXzEgPSByZXF1aXJlKFwiLi9maWxsZXJcIik7XHJcbmNvbnN0IHN0YXRlXzEgPSByZXF1aXJlKFwiLi9zdGF0ZVwiKTtcclxuY2xhc3MgUGFyc2VyQnVpbGRlciB7XHJcbiAgICBzZXRGZXRjaGVyKGZldGNoZXJGYWN0b3J5KSB7XHJcbiAgICAgICAgdGhpcy5mZXRjaGVyID0gKGZldGNoZXJGYWN0b3J5IHx8IG5ldyBmZXRjaGVyXzEuSlNPTkZldGNoZXJGYWN0b3J5KCkpLmdldEpTT05GZXRjaGVyKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXRGaWxsZXIoZmlsbGVyKSB7XHJcbiAgICAgICAgdGhpcy5maWxsZXIgPSBmaWxsZXIgfHwgbmV3IGZpbGxlcl8xLkZpbGxBbGJ1bShuZXcgZmlsbGVyXzEuQWxidW0oKSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzZXRTdG9yZShzdG9yZSkge1xyXG4gICAgICAgIHRoaXMuc3RvcmUgPSBzdG9yZSB8fCBuZXcgc3RhdGVfMS5TdG9yZShuZXcgc3RhdGVfMS5SZWR1Y2VyKCkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgYnVpbGQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBwYXJzZXJfMS5QYXJzZXIodGhpcyk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5QYXJzZXJCdWlsZGVyID0gUGFyc2VyQnVpbGRlcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5KU09ORmV0Y2hlckZhY3RvcnkgPSBleHBvcnRzLkpTT05GZXRjaGVyID0gdm9pZCAwO1xyXG5jb25zdCBub2RlX2ZldGNoXzEgPSByZXF1aXJlKFwibm9kZS1mZXRjaFwiKTtcclxuY2xhc3MgSlNPTkZldGNoZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5hcGlFbnRpdGllcyA9IFtcInBvc3RzXCIsIFwidG9kb3NcIiwgXCJjb21tZW50c1wiLCBcImFsYnVtc1wiLCBcInBob3Rvc1wiXTtcclxuICAgIH1cclxuICAgIGFzeW5jIGZldGNoSlNPTigpIHtcclxuICAgICAgICBjb25zdCByYW5kb21FbnRpdHkgPSB0aGlzLmFwaUVudGl0aWVzW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDUpXTtcclxuICAgICAgICBjb25zdCByYW5kb21JZCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0ICgwLCBub2RlX2ZldGNoXzEuZGVmYXVsdCkoYGh0dHBzOi8vanNvbnBsYWNlaG9sZGVyLnR5cGljb2RlLmNvbS9hbGJ1bXMvJHtyYW5kb21JZH1gKVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcclxuICAgICAgICAgICAgLnRoZW4oKGpzb24pID0+IEpTT04uc3RyaW5naWZ5KGpzb24pKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLkpTT05GZXRjaGVyID0gSlNPTkZldGNoZXI7XHJcbmNsYXNzIEpTT05GZXRjaGVyRmFjdG9yeSB7XHJcbiAgICBnZXRKU09ORmV0Y2hlcigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEpTT05GZXRjaGVyKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5KU09ORmV0Y2hlckZhY3RvcnkgPSBKU09ORmV0Y2hlckZhY3Rvcnk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuRmlsbEFsYnVtID0gZXhwb3J0cy5BbGJ1bSA9IHZvaWQgMDtcclxuY2xhc3MgQWxidW0ge1xyXG59XHJcbmV4cG9ydHMuQWxidW0gPSBBbGJ1bTtcclxuY2xhc3MgRmlsbEFsYnVtIHtcclxuICAgIGNvbnN0cnVjdG9yKGZpbGxlcikge1xyXG4gICAgICAgIHRoaXMuZmlsbGVyID0gZmlsbGVyO1xyXG4gICAgfVxyXG4gICAgZmlsbChrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5maWxsZXJba2V5XSA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuRmlsbEFsYnVtID0gRmlsbEFsYnVtO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlBhcnNlckZhY2FkZSA9IGV4cG9ydHMuUGFyc2VyID0gdm9pZCAwO1xyXG5jb25zdCBzdGF0ZV8xID0gcmVxdWlyZShcIi4vc3RhdGVcIik7XHJcbmNvbnN0IE9ic2VydmVyXzEgPSByZXF1aXJlKFwiLi9PYnNlcnZlclwiKTtcclxuY29uc3QgYnVpbGRlcl8xID0gcmVxdWlyZShcIi4vYnVpbGRlclwiKTtcclxuY2xhc3MgUGFyc2VyIHtcclxuICAgIGNvbnN0cnVjdG9yKGl0ZW0pIHtcclxuICAgICAgICB0aGlzLnN0b3JlID0gaXRlbS5zdG9yZTtcclxuICAgICAgICB0aGlzLmZldGNoZXIgPSBpdGVtLmZldGNoZXI7XHJcbiAgICAgICAgdGhpcy5maWxsZXIgPSBpdGVtLmZpbGxlcjtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlBhcnNlciA9IFBhcnNlcjtcclxuY2xhc3MgUGFyc2VyRmFjYWRlIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcnNlcikge1xyXG4gICAgICAgIHRoaXMucGFyc2VyID0gcGFyc2VyO1xyXG4gICAgfVxyXG4gICAgcGFyc2VKc29uKCkge1xyXG4gICAgICAgIGNvbnN0IG9ic2VydmFibGUgPSBuZXcgT2JzZXJ2ZXJfMS5PYnNlcnZhYmxlKG51bGwpO1xyXG4gICAgICAgIGNvbnN0IHBhcnNpbmdBY3Rpb24gPSAoMCwgc3RhdGVfMS5jcmVhdGVVcGRhdGVTdGF0ZUFjdGlvbikoXCJwYXJzaW5nXCIpO1xyXG4gICAgICAgIHRoaXMucGFyc2VyLnN0b3JlLmRpc3BhdGNoKHBhcnNpbmdBY3Rpb24pO1xyXG4gICAgICAgIHRoaXMucGFyc2VyLmZldGNoZXIuZmV0Y2hKU09OKCkudGhlbihhc3luYyAoanNvbikgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIE9iamVjdC5lbnRyaWVzKEpTT04ucGFyc2UoanNvbikpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlci5maWxsZXIuZmlsbChlbnRyeVswXSwgZW50cnlbMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9ic2VydmFibGUubmV4dCh0aGlzLnBhcnNlci5maWxsZXIuZmlsbGVyKTtcclxuICAgICAgICAgICAgY29uc3Qgd2FpdGluZ0FjdGlvbiA9ICgwLCBzdGF0ZV8xLmNyZWF0ZVVwZGF0ZVN0YXRlQWN0aW9uKShcIndhaXRpbmdcIik7XHJcbiAgICAgICAgICAgIHRoaXMucGFyc2VyLnN0b3JlLmRpc3BhdGNoKHdhaXRpbmdBY3Rpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuUGFyc2VyRmFjYWRlID0gUGFyc2VyRmFjYWRlO1xyXG5jb25zdCBvYnMgPSBuZXcgUGFyc2VyRmFjYWRlKG5ldyBidWlsZGVyXzEuUGFyc2VyQnVpbGRlcigpLnNldEZldGNoZXIoKS5zZXRGaWxsZXIoKS5zZXRTdG9yZSgpKS5wYXJzZUpzb24oKTtcclxuY29uc29sZS5sb2cob2JzLCBcIjRcIik7XHJcbm9icy5zdWJzY3JpYmUoKHZhbCkgPT4gY29uc29sZS5sb2codmFsLCBcIjVcIikpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlN0b3JlID0gZXhwb3J0cy5SZWR1Y2VyID0gZXhwb3J0cy5jcmVhdGVVcGRhdGVTdGF0ZUFjdGlvbiA9IHZvaWQgMDtcclxuY29uc3QgY3JlYXRlVXBkYXRlU3RhdGVBY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xyXG4gICAgcmV0dXJuIHsgbmFtZTogXCJVUERBVEVfU1RBVEVcIiwgcGF5bG9hZCB9O1xyXG59O1xyXG5leHBvcnRzLmNyZWF0ZVVwZGF0ZVN0YXRlQWN0aW9uID0gY3JlYXRlVXBkYXRlU3RhdGVBY3Rpb247XHJcbmNsYXNzIFJlZHVjZXIge1xyXG4gICAgcmVkdWNlKHN0YXRlLCBhY3Rpb24pIHtcclxuICAgICAgICBzd2l0Y2ggKGFjdGlvbi5uYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJVUERBVEVfU1RBVEVcIjpcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBzdGF0dXM6IGFjdGlvbi5wYXlsb2FkIH07XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyAuLi5zdGF0ZSB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnRzLlJlZHVjZXIgPSBSZWR1Y2VyO1xyXG5jbGFzcyBTdG9yZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihyZWR1Y2VyKSB7XHJcbiAgICAgICAgdGhpcy5yZWR1Y2VyID0gcmVkdWNlcjtcclxuICAgICAgICB0aGlzLnN0YXRlID0geyBzdGF0dXM6IFwid2FpdGluZ1wiIH07XHJcbiAgICB9XHJcbiAgICBkaXNwYXRjaChhY3Rpb24pIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gdGhpcy5yZWR1Y2VyLnJlZHVjZSh0aGlzLnN0YXRlLCBhY3Rpb24pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuU3RvcmUgPSBTdG9yZTtcclxuIiwiLyoqXG4gKiB3ZWItc3RyZWFtcy1wb2x5ZmlsbCB2My4yLjFcbiAqL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgICAoZ2xvYmFsID0gdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsVGhpcyA6IGdsb2JhbCB8fCBzZWxmLCBmYWN0b3J5KGdsb2JhbC5XZWJTdHJlYW1zUG9seWZpbGwgPSB7fSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8vIDxyZWZlcmVuY2UgbGliPVwiZXMyMDE1LnN5bWJvbFwiIC8+XG4gICAgY29uc3QgU3ltYm9sUG9seWZpbGwgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09ICdzeW1ib2wnID9cbiAgICAgICAgU3ltYm9sIDpcbiAgICAgICAgZGVzY3JpcHRpb24gPT4gYFN5bWJvbCgke2Rlc2NyaXB0aW9ufSlgO1xuXG4gICAgLy8vIDxyZWZlcmVuY2UgbGliPVwiZG9tXCIgLz5cbiAgICBmdW5jdGlvbiBub29wKCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRHbG9iYWxzKCkge1xuICAgICAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHdpbmRvdztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIGdsb2JhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBjb25zdCBnbG9iYWxzID0gZ2V0R2xvYmFscygpO1xuXG4gICAgZnVuY3Rpb24gdHlwZUlzT2JqZWN0KHgpIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCkgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gICAgfVxuICAgIGNvbnN0IHJldGhyb3dBc3NlcnRpb25FcnJvclJlamVjdGlvbiA9IG5vb3A7XG5cbiAgICBjb25zdCBvcmlnaW5hbFByb21pc2UgPSBQcm9taXNlO1xuICAgIGNvbnN0IG9yaWdpbmFsUHJvbWlzZVRoZW4gPSBQcm9taXNlLnByb3RvdHlwZS50aGVuO1xuICAgIGNvbnN0IG9yaWdpbmFsUHJvbWlzZVJlc29sdmUgPSBQcm9taXNlLnJlc29sdmUuYmluZChvcmlnaW5hbFByb21pc2UpO1xuICAgIGNvbnN0IG9yaWdpbmFsUHJvbWlzZVJlamVjdCA9IFByb21pc2UucmVqZWN0LmJpbmQob3JpZ2luYWxQcm9taXNlKTtcbiAgICBmdW5jdGlvbiBuZXdQcm9taXNlKGV4ZWN1dG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgb3JpZ2luYWxQcm9taXNlKGV4ZWN1dG9yKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcHJvbWlzZVJlc29sdmVkV2l0aCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gb3JpZ2luYWxQcm9taXNlUmVzb2x2ZSh2YWx1ZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb21pc2VSZWplY3RlZFdpdGgocmVhc29uKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbFByb21pc2VSZWplY3QocmVhc29uKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUGVyZm9ybVByb21pc2VUaGVuKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgICAgIC8vIFRoZXJlIGRvZXNuJ3QgYXBwZWFyIHRvIGJlIGFueSB3YXkgdG8gY29ycmVjdGx5IGVtdWxhdGUgdGhlIGJlaGF2aW91ciBmcm9tIEphdmFTY3JpcHQsIHNvIHRoaXMgaXMganVzdCBhblxuICAgICAgICAvLyBhcHByb3hpbWF0aW9uLlxuICAgICAgICByZXR1cm4gb3JpZ2luYWxQcm9taXNlVGhlbi5jYWxsKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdXBvblByb21pc2UocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICAgICAgUGVyZm9ybVByb21pc2VUaGVuKFBlcmZvcm1Qcm9taXNlVGhlbihwcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCksIHVuZGVmaW5lZCwgcmV0aHJvd0Fzc2VydGlvbkVycm9yUmVqZWN0aW9uKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdXBvbkZ1bGZpbGxtZW50KHByb21pc2UsIG9uRnVsZmlsbGVkKSB7XG4gICAgICAgIHVwb25Qcm9taXNlKHByb21pc2UsIG9uRnVsZmlsbGVkKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdXBvblJlamVjdGlvbihwcm9taXNlLCBvblJlamVjdGVkKSB7XG4gICAgICAgIHVwb25Qcm9taXNlKHByb21pc2UsIHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVByb21pc2VXaXRoKHByb21pc2UsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgICByZXR1cm4gUGVyZm9ybVByb21pc2VUaGVuKHByb21pc2UsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNldFByb21pc2VJc0hhbmRsZWRUb1RydWUocHJvbWlzZSkge1xuICAgICAgICBQZXJmb3JtUHJvbWlzZVRoZW4ocHJvbWlzZSwgdW5kZWZpbmVkLCByZXRocm93QXNzZXJ0aW9uRXJyb3JSZWplY3Rpb24pO1xuICAgIH1cbiAgICBjb25zdCBxdWV1ZU1pY3JvdGFzayA9ICgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGdsb2JhbFF1ZXVlTWljcm90YXNrID0gZ2xvYmFscyAmJiBnbG9iYWxzLnF1ZXVlTWljcm90YXNrO1xuICAgICAgICBpZiAodHlwZW9mIGdsb2JhbFF1ZXVlTWljcm90YXNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2xvYmFsUXVldWVNaWNyb3Rhc2s7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQcm9taXNlID0gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICByZXR1cm4gKGZuKSA9PiBQZXJmb3JtUHJvbWlzZVRoZW4ocmVzb2x2ZWRQcm9taXNlLCBmbik7XG4gICAgfSkoKTtcbiAgICBmdW5jdGlvbiByZWZsZWN0Q2FsbChGLCBWLCBhcmdzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgRiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoRiwgViwgYXJncyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb21pc2VDYWxsKEYsIFYsIGFyZ3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZWRXaXRoKHJlZmxlY3RDYWxsKEYsIFYsIGFyZ3MpKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE9yaWdpbmFsIGZyb20gQ2hyb21pdW1cbiAgICAvLyBodHRwczovL2Nocm9taXVtLmdvb2dsZXNvdXJjZS5jb20vY2hyb21pdW0vc3JjLysvMGFlZTQ0MzRhNGRiYTQyYTQyYWJhZWE5YmZiYzBjZDE5NmE2M2JjMS90aGlyZF9wYXJ0eS9ibGluay9yZW5kZXJlci9jb3JlL3N0cmVhbXMvU2ltcGxlUXVldWUuanNcbiAgICBjb25zdCBRVUVVRV9NQVhfQVJSQVlfU0laRSA9IDE2Mzg0O1xuICAgIC8qKlxuICAgICAqIFNpbXBsZSBxdWV1ZSBzdHJ1Y3R1cmUuXG4gICAgICpcbiAgICAgKiBBdm9pZHMgc2NhbGFiaWxpdHkgaXNzdWVzIHdpdGggdXNpbmcgYSBwYWNrZWQgYXJyYXkgZGlyZWN0bHkgYnkgdXNpbmdcbiAgICAgKiBtdWx0aXBsZSBhcnJheXMgaW4gYSBsaW5rZWQgbGlzdCBhbmQga2VlcGluZyB0aGUgYXJyYXkgc2l6ZSBib3VuZGVkLlxuICAgICAqL1xuICAgIGNsYXNzIFNpbXBsZVF1ZXVlIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJzb3IgPSAwO1xuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IDA7XG4gICAgICAgICAgICAvLyBfZnJvbnQgYW5kIF9iYWNrIGFyZSBhbHdheXMgZGVmaW5lZC5cbiAgICAgICAgICAgIHRoaXMuX2Zyb250ID0ge1xuICAgICAgICAgICAgICAgIF9lbGVtZW50czogW10sXG4gICAgICAgICAgICAgICAgX25leHQ6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2JhY2sgPSB0aGlzLl9mcm9udDtcbiAgICAgICAgICAgIC8vIFRoZSBjdXJzb3IgaXMgdXNlZCB0byBhdm9pZCBjYWxsaW5nIEFycmF5LnNoaWZ0KCkuXG4gICAgICAgICAgICAvLyBJdCBjb250YWlucyB0aGUgaW5kZXggb2YgdGhlIGZyb250IGVsZW1lbnQgb2YgdGhlIGFycmF5IGluc2lkZSB0aGVcbiAgICAgICAgICAgIC8vIGZyb250LW1vc3Qgbm9kZS4gSXQgaXMgYWx3YXlzIGluIHRoZSByYW5nZSBbMCwgUVVFVUVfTUFYX0FSUkFZX1NJWkUpLlxuICAgICAgICAgICAgdGhpcy5fY3Vyc29yID0gMDtcbiAgICAgICAgICAgIC8vIFdoZW4gdGhlcmUgaXMgb25seSBvbmUgbm9kZSwgc2l6ZSA9PT0gZWxlbWVudHMubGVuZ3RoIC0gY3Vyc29yLlxuICAgICAgICAgICAgdGhpcy5fc2l6ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9zaXplO1xuICAgICAgICB9XG4gICAgICAgIC8vIEZvciBleGNlcHRpb24gc2FmZXR5LCB0aGlzIG1ldGhvZCBpcyBzdHJ1Y3R1cmVkIGluIG9yZGVyOlxuICAgICAgICAvLyAxLiBSZWFkIHN0YXRlXG4gICAgICAgIC8vIDIuIENhbGN1bGF0ZSByZXF1aXJlZCBzdGF0ZSBtdXRhdGlvbnNcbiAgICAgICAgLy8gMy4gUGVyZm9ybSBzdGF0ZSBtdXRhdGlvbnNcbiAgICAgICAgcHVzaChlbGVtZW50KSB7XG4gICAgICAgICAgICBjb25zdCBvbGRCYWNrID0gdGhpcy5fYmFjaztcbiAgICAgICAgICAgIGxldCBuZXdCYWNrID0gb2xkQmFjaztcbiAgICAgICAgICAgIGlmIChvbGRCYWNrLl9lbGVtZW50cy5sZW5ndGggPT09IFFVRVVFX01BWF9BUlJBWV9TSVpFIC0gMSkge1xuICAgICAgICAgICAgICAgIG5ld0JhY2sgPSB7XG4gICAgICAgICAgICAgICAgICAgIF9lbGVtZW50czogW10sXG4gICAgICAgICAgICAgICAgICAgIF9uZXh0OiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcHVzaCgpIGlzIHRoZSBtdXRhdGlvbiBtb3N0IGxpa2VseSB0byB0aHJvdyBhbiBleGNlcHRpb24sIHNvIGl0XG4gICAgICAgICAgICAvLyBnb2VzIGZpcnN0LlxuICAgICAgICAgICAgb2xkQmFjay5fZWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgIGlmIChuZXdCYWNrICE9PSBvbGRCYWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmFjayA9IG5ld0JhY2s7XG4gICAgICAgICAgICAgICAgb2xkQmFjay5fbmV4dCA9IG5ld0JhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICArK3RoaXMuX3NpemU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTGlrZSBwdXNoKCksIHNoaWZ0KCkgZm9sbG93cyB0aGUgcmVhZCAtPiBjYWxjdWxhdGUgLT4gbXV0YXRlIHBhdHRlcm4gZm9yXG4gICAgICAgIC8vIGV4Y2VwdGlvbiBzYWZldHkuXG4gICAgICAgIHNoaWZ0KCkgeyAvLyBtdXN0IG5vdCBiZSBjYWxsZWQgb24gYW4gZW1wdHkgcXVldWVcbiAgICAgICAgICAgIGNvbnN0IG9sZEZyb250ID0gdGhpcy5fZnJvbnQ7XG4gICAgICAgICAgICBsZXQgbmV3RnJvbnQgPSBvbGRGcm9udDtcbiAgICAgICAgICAgIGNvbnN0IG9sZEN1cnNvciA9IHRoaXMuX2N1cnNvcjtcbiAgICAgICAgICAgIGxldCBuZXdDdXJzb3IgPSBvbGRDdXJzb3IgKyAxO1xuICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBvbGRGcm9udC5fZWxlbWVudHM7XG4gICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudHNbb2xkQ3Vyc29yXTtcbiAgICAgICAgICAgIGlmIChuZXdDdXJzb3IgPT09IFFVRVVFX01BWF9BUlJBWV9TSVpFKSB7XG4gICAgICAgICAgICAgICAgbmV3RnJvbnQgPSBvbGRGcm9udC5fbmV4dDtcbiAgICAgICAgICAgICAgICBuZXdDdXJzb3IgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm8gbXV0YXRpb25zIGJlZm9yZSB0aGlzIHBvaW50LlxuICAgICAgICAgICAgLS10aGlzLl9zaXplO1xuICAgICAgICAgICAgdGhpcy5fY3Vyc29yID0gbmV3Q3Vyc29yO1xuICAgICAgICAgICAgaWYgKG9sZEZyb250ICE9PSBuZXdGcm9udCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Zyb250ID0gbmV3RnJvbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQZXJtaXQgc2hpZnRlZCBlbGVtZW50IHRvIGJlIGdhcmJhZ2UgY29sbGVjdGVkLlxuICAgICAgICAgICAgZWxlbWVudHNbb2xkQ3Vyc29yXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIC8vIFRoZSB0cmlja3kgdGhpbmcgYWJvdXQgZm9yRWFjaCgpIGlzIHRoYXQgaXQgY2FuIGJlIGNhbGxlZFxuICAgICAgICAvLyByZS1lbnRyYW50bHkuIFRoZSBxdWV1ZSBtYXkgYmUgbXV0YXRlZCBpbnNpZGUgdGhlIGNhbGxiYWNrLiBJdCBpcyBlYXN5IHRvXG4gICAgICAgIC8vIHNlZSB0aGF0IHB1c2goKSB3aXRoaW4gdGhlIGNhbGxiYWNrIGhhcyBubyBuZWdhdGl2ZSBlZmZlY3RzIHNpbmNlIHRoZSBlbmRcbiAgICAgICAgLy8gb2YgdGhlIHF1ZXVlIGlzIGNoZWNrZWQgZm9yIG9uIGV2ZXJ5IGl0ZXJhdGlvbi4gSWYgc2hpZnQoKSBpcyBjYWxsZWRcbiAgICAgICAgLy8gcmVwZWF0ZWRseSB3aXRoaW4gdGhlIGNhbGxiYWNrIHRoZW4gdGhlIG5leHQgaXRlcmF0aW9uIG1heSByZXR1cm4gYW5cbiAgICAgICAgLy8gZWxlbWVudCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQuIEluIHRoaXMgY2FzZSB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWRcbiAgICAgICAgLy8gd2l0aCB1bmRlZmluZWQgdmFsdWVzIHVudGlsIHdlIGVpdGhlciBcImNhdGNoIHVwXCIgd2l0aCBlbGVtZW50cyB0aGF0IHN0aWxsXG4gICAgICAgIC8vIGV4aXN0IG9yIHJlYWNoIHRoZSBiYWNrIG9mIHRoZSBxdWV1ZS5cbiAgICAgICAgZm9yRWFjaChjYWxsYmFjaykge1xuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLl9jdXJzb3I7XG4gICAgICAgICAgICBsZXQgbm9kZSA9IHRoaXMuX2Zyb250O1xuICAgICAgICAgICAgbGV0IGVsZW1lbnRzID0gbm9kZS5fZWxlbWVudHM7XG4gICAgICAgICAgICB3aGlsZSAoaSAhPT0gZWxlbWVudHMubGVuZ3RoIHx8IG5vZGUuX25leHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSBlbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUuX25leHQ7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gbm9kZS5fZWxlbWVudHM7XG4gICAgICAgICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlbGVtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJldHVybiB0aGUgZWxlbWVudCB0aGF0IHdvdWxkIGJlIHJldHVybmVkIGlmIHNoaWZ0KCkgd2FzIGNhbGxlZCBub3csXG4gICAgICAgIC8vIHdpdGhvdXQgbW9kaWZ5aW5nIHRoZSBxdWV1ZS5cbiAgICAgICAgcGVlaygpIHsgLy8gbXVzdCBub3QgYmUgY2FsbGVkIG9uIGFuIGVtcHR5IHF1ZXVlXG4gICAgICAgICAgICBjb25zdCBmcm9udCA9IHRoaXMuX2Zyb250O1xuICAgICAgICAgICAgY29uc3QgY3Vyc29yID0gdGhpcy5fY3Vyc29yO1xuICAgICAgICAgICAgcmV0dXJuIGZyb250Ll9lbGVtZW50c1tjdXJzb3JdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1SZWFkZXJHZW5lcmljSW5pdGlhbGl6ZShyZWFkZXIsIHN0cmVhbSkge1xuICAgICAgICByZWFkZXIuX293bmVyUmVhZGFibGVTdHJlYW0gPSBzdHJlYW07XG4gICAgICAgIHN0cmVhbS5fcmVhZGVyID0gcmVhZGVyO1xuICAgICAgICBpZiAoc3RyZWFtLl9zdGF0ZSA9PT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgZGVmYXVsdFJlYWRlckNsb3NlZFByb21pc2VJbml0aWFsaXplKHJlYWRlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3RyZWFtLl9zdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICAgIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZUFzUmVzb2x2ZWQocmVhZGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZUFzUmVqZWN0ZWQocmVhZGVyLCBzdHJlYW0uX3N0b3JlZEVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBBIGNsaWVudCBvZiBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIgYW5kIFJlYWRhYmxlU3RyZWFtQllPQlJlYWRlciBtYXkgdXNlIHRoZXNlIGZ1bmN0aW9ucyBkaXJlY3RseSB0byBieXBhc3Mgc3RhdGVcbiAgICAvLyBjaGVjay5cbiAgICBmdW5jdGlvbiBSZWFkYWJsZVN0cmVhbVJlYWRlckdlbmVyaWNDYW5jZWwocmVhZGVyLCByZWFzb24pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gcmVhZGVyLl9vd25lclJlYWRhYmxlU3RyZWFtO1xuICAgICAgICByZXR1cm4gUmVhZGFibGVTdHJlYW1DYW5jZWwoc3RyZWFtLCByZWFzb24pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZVN0cmVhbVJlYWRlckdlbmVyaWNSZWxlYXNlKHJlYWRlcikge1xuICAgICAgICBpZiAocmVhZGVyLl9vd25lclJlYWRhYmxlU3RyZWFtLl9zdGF0ZSA9PT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgZGVmYXVsdFJlYWRlckNsb3NlZFByb21pc2VSZWplY3QocmVhZGVyLCBuZXcgVHlwZUVycm9yKGBSZWFkZXIgd2FzIHJlbGVhc2VkIGFuZCBjYW4gbm8gbG9uZ2VyIGJlIHVzZWQgdG8gbW9uaXRvciB0aGUgc3RyZWFtJ3MgY2xvc2VkbmVzc2ApKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlUmVzZXRUb1JlamVjdGVkKHJlYWRlciwgbmV3IFR5cGVFcnJvcihgUmVhZGVyIHdhcyByZWxlYXNlZCBhbmQgY2FuIG5vIGxvbmdlciBiZSB1c2VkIHRvIG1vbml0b3IgdGhlIHN0cmVhbSdzIGNsb3NlZG5lc3NgKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVhZGVyLl9vd25lclJlYWRhYmxlU3RyZWFtLl9yZWFkZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJlYWRlci5fb3duZXJSZWFkYWJsZVN0cmVhbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIHJlYWRlcnMuXG4gICAgZnVuY3Rpb24gcmVhZGVyTG9ja0V4Y2VwdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKCdDYW5ub3QgJyArIG5hbWUgKyAnIGEgc3RyZWFtIHVzaW5nIGEgcmVsZWFzZWQgcmVhZGVyJyk7XG4gICAgfVxuICAgIC8vIEhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIuXG4gICAgZnVuY3Rpb24gZGVmYXVsdFJlYWRlckNsb3NlZFByb21pc2VJbml0aWFsaXplKHJlYWRlcikge1xuICAgICAgICByZWFkZXIuX2Nsb3NlZFByb21pc2UgPSBuZXdQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJlYWRlci5fY2xvc2VkUHJvbWlzZV9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHJlYWRlci5fY2xvc2VkUHJvbWlzZV9yZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWZhdWx0UmVhZGVyQ2xvc2VkUHJvbWlzZUluaXRpYWxpemVBc1JlamVjdGVkKHJlYWRlciwgcmVhc29uKSB7XG4gICAgICAgIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZShyZWFkZXIpO1xuICAgICAgICBkZWZhdWx0UmVhZGVyQ2xvc2VkUHJvbWlzZVJlamVjdChyZWFkZXIsIHJlYXNvbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZUFzUmVzb2x2ZWQocmVhZGVyKSB7XG4gICAgICAgIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZShyZWFkZXIpO1xuICAgICAgICBkZWZhdWx0UmVhZGVyQ2xvc2VkUHJvbWlzZVJlc29sdmUocmVhZGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmYXVsdFJlYWRlckNsb3NlZFByb21pc2VSZWplY3QocmVhZGVyLCByZWFzb24pIHtcbiAgICAgICAgaWYgKHJlYWRlci5fY2xvc2VkUHJvbWlzZV9yZWplY3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldFByb21pc2VJc0hhbmRsZWRUb1RydWUocmVhZGVyLl9jbG9zZWRQcm9taXNlKTtcbiAgICAgICAgcmVhZGVyLl9jbG9zZWRQcm9taXNlX3JlamVjdChyZWFzb24pO1xuICAgICAgICByZWFkZXIuX2Nsb3NlZFByb21pc2VfcmVzb2x2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmVhZGVyLl9jbG9zZWRQcm9taXNlX3JlamVjdCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmYXVsdFJlYWRlckNsb3NlZFByb21pc2VSZXNldFRvUmVqZWN0ZWQocmVhZGVyLCByZWFzb24pIHtcbiAgICAgICAgZGVmYXVsdFJlYWRlckNsb3NlZFByb21pc2VJbml0aWFsaXplQXNSZWplY3RlZChyZWFkZXIsIHJlYXNvbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlUmVzb2x2ZShyZWFkZXIpIHtcbiAgICAgICAgaWYgKHJlYWRlci5fY2xvc2VkUHJvbWlzZV9yZXNvbHZlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZWFkZXIuX2Nsb3NlZFByb21pc2VfcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICByZWFkZXIuX2Nsb3NlZFByb21pc2VfcmVzb2x2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmVhZGVyLl9jbG9zZWRQcm9taXNlX3JlamVjdCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBBYm9ydFN0ZXBzID0gU3ltYm9sUG9seWZpbGwoJ1tbQWJvcnRTdGVwc11dJyk7XG4gICAgY29uc3QgRXJyb3JTdGVwcyA9IFN5bWJvbFBvbHlmaWxsKCdbW0Vycm9yU3RlcHNdXScpO1xuICAgIGNvbnN0IENhbmNlbFN0ZXBzID0gU3ltYm9sUG9seWZpbGwoJ1tbQ2FuY2VsU3RlcHNdXScpO1xuICAgIGNvbnN0IFB1bGxTdGVwcyA9IFN5bWJvbFBvbHlmaWxsKCdbW1B1bGxTdGVwc11dJyk7XG5cbiAgICAvLy8gPHJlZmVyZW5jZSBsaWI9XCJlczIwMTUuY29yZVwiIC8+XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvTnVtYmVyL2lzRmluaXRlI1BvbHlmaWxsXG4gICAgY29uc3QgTnVtYmVySXNGaW5pdGUgPSBOdW1iZXIuaXNGaW5pdGUgfHwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh4KTtcbiAgICB9O1xuXG4gICAgLy8vIDxyZWZlcmVuY2UgbGliPVwiZXMyMDE1LmNvcmVcIiAvPlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL01hdGgvdHJ1bmMjUG9seWZpbGxcbiAgICBjb25zdCBNYXRoVHJ1bmMgPSBNYXRoLnRydW5jIHx8IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiB2IDwgMCA/IE1hdGguY2VpbCh2KSA6IE1hdGguZmxvb3Iodik7XG4gICAgfTtcblxuICAgIC8vIGh0dHBzOi8vaGV5Y2FtLmdpdGh1Yi5pby93ZWJpZGwvI2lkbC1kaWN0aW9uYXJpZXNcbiAgICBmdW5jdGlvbiBpc0RpY3Rpb25hcnkoeCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhc3NlcnREaWN0aW9uYXJ5KG9iaiwgY29udGV4dCkge1xuICAgICAgICBpZiAob2JqICE9PSB1bmRlZmluZWQgJiYgIWlzRGljdGlvbmFyeShvYmopKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke2NvbnRleHR9IGlzIG5vdCBhbiBvYmplY3QuYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gaHR0cHM6Ly9oZXljYW0uZ2l0aHViLmlvL3dlYmlkbC8jaWRsLWNhbGxiYWNrLWZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIGFzc2VydEZ1bmN0aW9uKHgsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke2NvbnRleHR9IGlzIG5vdCBhIGZ1bmN0aW9uLmApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGh0dHBzOi8vaGV5Y2FtLmdpdGh1Yi5pby93ZWJpZGwvI2lkbC1vYmplY3RcbiAgICBmdW5jdGlvbiBpc09iamVjdCh4KSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGwpIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhc3NlcnRPYmplY3QoeCwgY29udGV4dCkge1xuICAgICAgICBpZiAoIWlzT2JqZWN0KHgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke2NvbnRleHR9IGlzIG5vdCBhbiBvYmplY3QuYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYXNzZXJ0UmVxdWlyZWRBcmd1bWVudCh4LCBwb3NpdGlvbiwgY29udGV4dCkge1xuICAgICAgICBpZiAoeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBQYXJhbWV0ZXIgJHtwb3NpdGlvbn0gaXMgcmVxdWlyZWQgaW4gJyR7Y29udGV4dH0nLmApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFzc2VydFJlcXVpcmVkRmllbGQoeCwgZmllbGQsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKHggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtmaWVsZH0gaXMgcmVxdWlyZWQgaW4gJyR7Y29udGV4dH0nLmApO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGh0dHBzOi8vaGV5Y2FtLmdpdGh1Yi5pby93ZWJpZGwvI2lkbC11bnJlc3RyaWN0ZWQtZG91YmxlXG4gICAgZnVuY3Rpb24gY29udmVydFVucmVzdHJpY3RlZERvdWJsZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gTnVtYmVyKHZhbHVlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2Vuc29yTmVnYXRpdmVaZXJvKHgpIHtcbiAgICAgICAgcmV0dXJuIHggPT09IDAgPyAwIDogeDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW50ZWdlclBhcnQoeCkge1xuICAgICAgICByZXR1cm4gY2Vuc29yTmVnYXRpdmVaZXJvKE1hdGhUcnVuYyh4KSk7XG4gICAgfVxuICAgIC8vIGh0dHBzOi8vaGV5Y2FtLmdpdGh1Yi5pby93ZWJpZGwvI2lkbC11bnNpZ25lZC1sb25nLWxvbmdcbiAgICBmdW5jdGlvbiBjb252ZXJ0VW5zaWduZWRMb25nTG9uZ1dpdGhFbmZvcmNlUmFuZ2UodmFsdWUsIGNvbnRleHQpIHtcbiAgICAgICAgY29uc3QgbG93ZXJCb3VuZCA9IDA7XG4gICAgICAgIGNvbnN0IHVwcGVyQm91bmQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbiAgICAgICAgbGV0IHggPSBOdW1iZXIodmFsdWUpO1xuICAgICAgICB4ID0gY2Vuc29yTmVnYXRpdmVaZXJvKHgpO1xuICAgICAgICBpZiAoIU51bWJlcklzRmluaXRlKHgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke2NvbnRleHR9IGlzIG5vdCBhIGZpbml0ZSBudW1iZXJgKTtcbiAgICAgICAgfVxuICAgICAgICB4ID0gaW50ZWdlclBhcnQoeCk7XG4gICAgICAgIGlmICh4IDwgbG93ZXJCb3VuZCB8fCB4ID4gdXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtjb250ZXh0fSBpcyBvdXRzaWRlIHRoZSBhY2NlcHRlZCByYW5nZSBvZiAke2xvd2VyQm91bmR9IHRvICR7dXBwZXJCb3VuZH0sIGluY2x1c2l2ZWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghTnVtYmVySXNGaW5pdGUoeCkgfHwgeCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETyBVc2UgQmlnSW50IGlmIHN1cHBvcnRlZD9cbiAgICAgICAgLy8gbGV0IHhCaWdJbnQgPSBCaWdJbnQoaW50ZWdlclBhcnQoeCkpO1xuICAgICAgICAvLyB4QmlnSW50ID0gQmlnSW50LmFzVWludE4oNjQsIHhCaWdJbnQpO1xuICAgICAgICAvLyByZXR1cm4gTnVtYmVyKHhCaWdJbnQpO1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc3NlcnRSZWFkYWJsZVN0cmVhbSh4LCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbSh4KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtjb250ZXh0fSBpcyBub3QgYSBSZWFkYWJsZVN0cmVhbS5gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFic3RyYWN0IG9wZXJhdGlvbnMgZm9yIHRoZSBSZWFkYWJsZVN0cmVhbS5cbiAgICBmdW5jdGlvbiBBY3F1aXJlUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyKHN0cmVhbSkge1xuICAgICAgICByZXR1cm4gbmV3IFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcihzdHJlYW0pO1xuICAgIH1cbiAgICAvLyBSZWFkYWJsZVN0cmVhbSBBUEkgZXhwb3NlZCBmb3IgY29udHJvbGxlcnMuXG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1BZGRSZWFkUmVxdWVzdChzdHJlYW0sIHJlYWRSZXF1ZXN0KSB7XG4gICAgICAgIHN0cmVhbS5fcmVhZGVyLl9yZWFkUmVxdWVzdHMucHVzaChyZWFkUmVxdWVzdCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtRnVsZmlsbFJlYWRSZXF1ZXN0KHN0cmVhbSwgY2h1bmssIGRvbmUpIHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gc3RyZWFtLl9yZWFkZXI7XG4gICAgICAgIGNvbnN0IHJlYWRSZXF1ZXN0ID0gcmVhZGVyLl9yZWFkUmVxdWVzdHMuc2hpZnQoKTtcbiAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgIHJlYWRSZXF1ZXN0Ll9jbG9zZVN0ZXBzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZWFkUmVxdWVzdC5fY2h1bmtTdGVwcyhjaHVuayk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1HZXROdW1SZWFkUmVxdWVzdHMoc3RyZWFtKSB7XG4gICAgICAgIHJldHVybiBzdHJlYW0uX3JlYWRlci5fcmVhZFJlcXVlc3RzLmxlbmd0aDtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1IYXNEZWZhdWx0UmVhZGVyKHN0cmVhbSkge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBzdHJlYW0uX3JlYWRlcjtcbiAgICAgICAgaWYgKHJlYWRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcihyZWFkZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgZGVmYXVsdCByZWFkZXIgdmVuZGVkIGJ5IGEge0BsaW5rIFJlYWRhYmxlU3RyZWFtfS5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGFzcyBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIge1xuICAgICAgICBjb25zdHJ1Y3RvcihzdHJlYW0pIHtcbiAgICAgICAgICAgIGFzc2VydFJlcXVpcmVkQXJndW1lbnQoc3RyZWFtLCAxLCAnUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyJyk7XG4gICAgICAgICAgICBhc3NlcnRSZWFkYWJsZVN0cmVhbShzdHJlYW0sICdGaXJzdCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIGlmIChJc1JlYWRhYmxlU3RyZWFtTG9ja2VkKHN0cmVhbSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGlzIHN0cmVhbSBoYXMgYWxyZWFkeSBiZWVuIGxvY2tlZCBmb3IgZXhjbHVzaXZlIHJlYWRpbmcgYnkgYW5vdGhlciByZWFkZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtUmVhZGVyR2VuZXJpY0luaXRpYWxpemUodGhpcywgc3RyZWFtKTtcbiAgICAgICAgICAgIHRoaXMuX3JlYWRSZXF1ZXN0cyA9IG5ldyBTaW1wbGVRdWV1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgYmUgZnVsZmlsbGVkIHdoZW4gdGhlIHN0cmVhbSBiZWNvbWVzIGNsb3NlZCxcbiAgICAgICAgICogb3IgcmVqZWN0ZWQgaWYgdGhlIHN0cmVhbSBldmVyIGVycm9ycyBvciB0aGUgcmVhZGVyJ3MgbG9jayBpcyByZWxlYXNlZCBiZWZvcmUgdGhlIHN0cmVhbSBmaW5pc2hlcyBjbG9zaW5nLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0IGNsb3NlZCgpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChkZWZhdWx0UmVhZGVyQnJhbmRDaGVja0V4Y2VwdGlvbignY2xvc2VkJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2Nsb3NlZFByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSByZWFkZXIgaXMgYWN0aXZlLCBiZWhhdmVzIHRoZSBzYW1lIGFzIHtAbGluayBSZWFkYWJsZVN0cmVhbS5jYW5jZWwgfCBzdHJlYW0uY2FuY2VsKHJlYXNvbil9LlxuICAgICAgICAgKi9cbiAgICAgICAgY2FuY2VsKHJlYXNvbiA9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKGRlZmF1bHRSZWFkZXJCcmFuZENoZWNrRXhjZXB0aW9uKCdjYW5jZWwnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgocmVhZGVyTG9ja0V4Y2VwdGlvbignY2FuY2VsJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWRhYmxlU3RyZWFtUmVhZGVyR2VuZXJpY0NhbmNlbCh0aGlzLCByZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGFsbG93cyBhY2Nlc3MgdG8gdGhlIG5leHQgY2h1bmsgZnJvbSB0aGUgc3RyZWFtJ3MgaW50ZXJuYWwgcXVldWUsIGlmIGF2YWlsYWJsZS5cbiAgICAgICAgICpcbiAgICAgICAgICogSWYgcmVhZGluZyBhIGNodW5rIGNhdXNlcyB0aGUgcXVldWUgdG8gYmVjb21lIGVtcHR5LCBtb3JlIGRhdGEgd2lsbCBiZSBwdWxsZWQgZnJvbSB0aGUgdW5kZXJseWluZyBzb3VyY2UuXG4gICAgICAgICAqL1xuICAgICAgICByZWFkKCkge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKGRlZmF1bHRSZWFkZXJCcmFuZENoZWNrRXhjZXB0aW9uKCdyZWFkJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX293bmVyUmVhZGFibGVTdHJlYW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKHJlYWRlckxvY2tFeGNlcHRpb24oJ3JlYWQgZnJvbScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCByZXNvbHZlUHJvbWlzZTtcbiAgICAgICAgICAgIGxldCByZWplY3RQcm9taXNlO1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZSA9IG5ld1Byb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgICAgICByZWplY3RQcm9taXNlID0gcmVqZWN0O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCByZWFkUmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICBfY2h1bmtTdGVwczogY2h1bmsgPT4gcmVzb2x2ZVByb21pc2UoeyB2YWx1ZTogY2h1bmssIGRvbmU6IGZhbHNlIH0pLFxuICAgICAgICAgICAgICAgIF9jbG9zZVN0ZXBzOiAoKSA9PiByZXNvbHZlUHJvbWlzZSh7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfSksXG4gICAgICAgICAgICAgICAgX2Vycm9yU3RlcHM6IGUgPT4gcmVqZWN0UHJvbWlzZShlKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlclJlYWQodGhpcywgcmVhZFJlcXVlc3QpO1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbGVhc2VzIHRoZSByZWFkZXIncyBsb2NrIG9uIHRoZSBjb3JyZXNwb25kaW5nIHN0cmVhbS4gQWZ0ZXIgdGhlIGxvY2sgaXMgcmVsZWFzZWQsIHRoZSByZWFkZXIgaXMgbm8gbG9uZ2VyIGFjdGl2ZS5cbiAgICAgICAgICogSWYgdGhlIGFzc29jaWF0ZWQgc3RyZWFtIGlzIGVycm9yZWQgd2hlbiB0aGUgbG9jayBpcyByZWxlYXNlZCwgdGhlIHJlYWRlciB3aWxsIGFwcGVhciBlcnJvcmVkIGluIHRoZSBzYW1lIHdheVxuICAgICAgICAgKiBmcm9tIG5vdyBvbjsgb3RoZXJ3aXNlLCB0aGUgcmVhZGVyIHdpbGwgYXBwZWFyIGNsb3NlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogQSByZWFkZXIncyBsb2NrIGNhbm5vdCBiZSByZWxlYXNlZCB3aGlsZSBpdCBzdGlsbCBoYXMgYSBwZW5kaW5nIHJlYWQgcmVxdWVzdCwgaS5lLiwgaWYgYSBwcm9taXNlIHJldHVybmVkIGJ5XG4gICAgICAgICAqIHRoZSByZWFkZXIncyB7QGxpbmsgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyLnJlYWQgfCByZWFkKCl9IG1ldGhvZCBoYXMgbm90IHlldCBiZWVuIHNldHRsZWQuIEF0dGVtcHRpbmcgdG9cbiAgICAgICAgICogZG8gc28gd2lsbCB0aHJvdyBhIGBUeXBlRXJyb3JgIGFuZCBsZWF2ZSB0aGUgcmVhZGVyIGxvY2tlZCB0byB0aGUgc3RyZWFtLlxuICAgICAgICAgKi9cbiAgICAgICAgcmVsZWFzZUxvY2soKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGVmYXVsdFJlYWRlckJyYW5kQ2hlY2tFeGNlcHRpb24oJ3JlbGVhc2VMb2NrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fb3duZXJSZWFkYWJsZVN0cmVhbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX3JlYWRSZXF1ZXN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVHJpZWQgdG8gcmVsZWFzZSBhIHJlYWRlciBsb2NrIHdoZW4gdGhhdCByZWFkZXIgaGFzIHBlbmRpbmcgcmVhZCgpIGNhbGxzIHVuLXNldHRsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtUmVhZGVyR2VuZXJpY1JlbGVhc2UodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyLnByb3RvdHlwZSwge1xuICAgICAgICBjYW5jZWw6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICByZWFkOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgcmVsZWFzZUxvY2s6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICBjbG9zZWQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9XG4gICAgfSk7XG4gICAgaWYgKHR5cGVvZiBTeW1ib2xQb2x5ZmlsbC50b1N0cmluZ1RhZyA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlci5wcm90b3R5cGUsIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ1JlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcicsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEFic3RyYWN0IG9wZXJhdGlvbnMgZm9yIHRoZSByZWFkZXJzLlxuICAgIGZ1bmN0aW9uIElzUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyKHgpIHtcbiAgICAgICAgaWYgKCF0eXBlSXNPYmplY3QoeCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX3JlYWRSZXF1ZXN0cycpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlclJlYWQocmVhZGVyLCByZWFkUmVxdWVzdCkge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSByZWFkZXIuX293bmVyUmVhZGFibGVTdHJlYW07XG4gICAgICAgIHN0cmVhbS5fZGlzdHVyYmVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHN0cmVhbS5fc3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgICByZWFkUmVxdWVzdC5fY2xvc2VTdGVwcygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0cmVhbS5fc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgICAgcmVhZFJlcXVlc3QuX2Vycm9yU3RlcHMoc3RyZWFtLl9zdG9yZWRFcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdHJlYW0uX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcltQdWxsU3RlcHNdKHJlYWRSZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyLlxuICAgIGZ1bmN0aW9uIGRlZmF1bHRSZWFkZXJCcmFuZENoZWNrRXhjZXB0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlci5wcm90b3R5cGUuJHtuYW1lfSBjYW4gb25seSBiZSB1c2VkIG9uIGEgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyYCk7XG4gICAgfVxuXG4gICAgLy8vIDxyZWZlcmVuY2UgbGliPVwiZXMyMDE4LmFzeW5jaXRlcmFibGVcIiAvPlxuICAgIC8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1lbXB0eS1mdW5jdGlvbiAqL1xuICAgIGNvbnN0IEFzeW5jSXRlcmF0b3JQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoT2JqZWN0LmdldFByb3RvdHlwZU9mKGFzeW5jIGZ1bmN0aW9uKiAoKSB7IH0pLnByb3RvdHlwZSk7XG5cbiAgICAvLy8gPHJlZmVyZW5jZSBsaWI9XCJlczIwMTguYXN5bmNpdGVyYWJsZVwiIC8+XG4gICAgY2xhc3MgUmVhZGFibGVTdHJlYW1Bc3luY0l0ZXJhdG9ySW1wbCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKHJlYWRlciwgcHJldmVudENhbmNlbCkge1xuICAgICAgICAgICAgdGhpcy5fb25nb2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLl9pc0ZpbmlzaGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9yZWFkZXIgPSByZWFkZXI7XG4gICAgICAgICAgICB0aGlzLl9wcmV2ZW50Q2FuY2VsID0gcHJldmVudENhbmNlbDtcbiAgICAgICAgfVxuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgY29uc3QgbmV4dFN0ZXBzID0gKCkgPT4gdGhpcy5fbmV4dFN0ZXBzKCk7XG4gICAgICAgICAgICB0aGlzLl9vbmdvaW5nUHJvbWlzZSA9IHRoaXMuX29uZ29pbmdQcm9taXNlID9cbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1Qcm9taXNlV2l0aCh0aGlzLl9vbmdvaW5nUHJvbWlzZSwgbmV4dFN0ZXBzLCBuZXh0U3RlcHMpIDpcbiAgICAgICAgICAgICAgICBuZXh0U3RlcHMoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vbmdvaW5nUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4odmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHJldHVyblN0ZXBzID0gKCkgPT4gdGhpcy5fcmV0dXJuU3RlcHModmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29uZ29pbmdQcm9taXNlID9cbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1Qcm9taXNlV2l0aCh0aGlzLl9vbmdvaW5nUHJvbWlzZSwgcmV0dXJuU3RlcHMsIHJldHVyblN0ZXBzKSA6XG4gICAgICAgICAgICAgICAgcmV0dXJuU3RlcHMoKTtcbiAgICAgICAgfVxuICAgICAgICBfbmV4dFN0ZXBzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzRmluaXNoZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IHRoaXMuX3JlYWRlcjtcbiAgICAgICAgICAgIGlmIChyZWFkZXIuX293bmVyUmVhZGFibGVTdHJlYW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKHJlYWRlckxvY2tFeGNlcHRpb24oJ2l0ZXJhdGUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVzb2x2ZVByb21pc2U7XG4gICAgICAgICAgICBsZXQgcmVqZWN0UHJvbWlzZTtcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXdQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gICAgICAgICAgICAgICAgcmVqZWN0UHJvbWlzZSA9IHJlamVjdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVhZFJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgX2NodW5rU3RlcHM6IGNodW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25nb2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgbmVlZHMgdG8gYmUgZGVsYXllZCBieSBvbmUgbWljcm90YXNrLCBvdGhlcndpc2Ugd2Ugc3RvcCBwdWxsaW5nIHRvbyBlYXJseSB3aGljaCBicmVha3MgYSB0ZXN0LlxuICAgICAgICAgICAgICAgICAgICAvLyBGSVhNRSBJcyB0aGlzIGEgYnVnIGluIHRoZSBzcGVjaWZpY2F0aW9uLCBvciBpbiB0aGUgdGVzdD9cbiAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4gcmVzb2x2ZVByb21pc2UoeyB2YWx1ZTogY2h1bmssIGRvbmU6IGZhbHNlIH0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9jbG9zZVN0ZXBzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uZ29pbmdQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1SZWFkZXJHZW5lcmljUmVsZWFzZShyZWFkZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSh7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfZXJyb3JTdGVwczogcmVhc29uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25nb2luZ1Byb21pc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzRmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZVN0cmVhbVJlYWRlckdlbmVyaWNSZWxlYXNlKHJlYWRlcik7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdFByb21pc2UocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyUmVhZChyZWFkZXIsIHJlYWRSZXF1ZXN0KTtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIF9yZXR1cm5TdGVwcyh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzRmluaXNoZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHsgdmFsdWUsIGRvbmU6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9pc0ZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IHRoaXMuX3JlYWRlcjtcbiAgICAgICAgICAgIGlmIChyZWFkZXIuX293bmVyUmVhZGFibGVTdHJlYW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKHJlYWRlckxvY2tFeGNlcHRpb24oJ2ZpbmlzaCBpdGVyYXRpbmcnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuX3ByZXZlbnRDYW5jZWwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBSZWFkYWJsZVN0cmVhbVJlYWRlckdlbmVyaWNDYW5jZWwocmVhZGVyLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1SZWFkZXJHZW5lcmljUmVsZWFzZShyZWFkZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1Qcm9taXNlV2l0aChyZXN1bHQsICgpID0+ICh7IHZhbHVlLCBkb25lOiB0cnVlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtUmVhZGVyR2VuZXJpY1JlbGVhc2UocmVhZGVyKTtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZWRXaXRoKHsgdmFsdWUsIGRvbmU6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgUmVhZGFibGVTdHJlYW1Bc3luY0l0ZXJhdG9yUHJvdG90eXBlID0ge1xuICAgICAgICBuZXh0KCkge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKHN0cmVhbUFzeW5jSXRlcmF0b3JCcmFuZENoZWNrRXhjZXB0aW9uKCduZXh0JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FzeW5jSXRlcmF0b3JJbXBsLm5leHQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmV0dXJuKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW1Bc3luY0l0ZXJhdG9yKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoc3RyZWFtQXN5bmNJdGVyYXRvckJyYW5kQ2hlY2tFeGNlcHRpb24oJ3JldHVybicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hc3luY0l0ZXJhdG9ySW1wbC5yZXR1cm4odmFsdWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBpZiAoQXN5bmNJdGVyYXRvclByb3RvdHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihSZWFkYWJsZVN0cmVhbUFzeW5jSXRlcmF0b3JQcm90b3R5cGUsIEFzeW5jSXRlcmF0b3JQcm90b3R5cGUpO1xuICAgIH1cbiAgICAvLyBBYnN0cmFjdCBvcGVyYXRpb25zIGZvciB0aGUgUmVhZGFibGVTdHJlYW0uXG4gICAgZnVuY3Rpb24gQWNxdWlyZVJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvcihzdHJlYW0sIHByZXZlbnRDYW5jZWwpIHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gQWNxdWlyZVJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcihzdHJlYW0pO1xuICAgICAgICBjb25zdCBpbXBsID0gbmV3IFJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvckltcGwocmVhZGVyLCBwcmV2ZW50Q2FuY2VsKTtcbiAgICAgICAgY29uc3QgaXRlcmF0b3IgPSBPYmplY3QuY3JlYXRlKFJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvclByb3RvdHlwZSk7XG4gICAgICAgIGl0ZXJhdG9yLl9hc3luY0l0ZXJhdG9ySW1wbCA9IGltcGw7XG4gICAgICAgIHJldHVybiBpdGVyYXRvcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gSXNSZWFkYWJsZVN0cmVhbUFzeW5jSXRlcmF0b3IoeCkge1xuICAgICAgICBpZiAoIXR5cGVJc09iamVjdCh4KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHgsICdfYXN5bmNJdGVyYXRvckltcGwnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gU3VzcGljaW91c1R5cGVPZkd1YXJkXG4gICAgICAgICAgICByZXR1cm4geC5fYXN5bmNJdGVyYXRvckltcGwgaW5zdGFuY2VvZlxuICAgICAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvckltcGw7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKF9hKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFJlYWRhYmxlU3RyZWFtLlxuICAgIGZ1bmN0aW9uIHN0cmVhbUFzeW5jSXRlcmF0b3JCcmFuZENoZWNrRXhjZXB0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYFJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvci4ke25hbWV9IGNhbiBvbmx5IGJlIHVzZWQgb24gYSBSZWFkYWJsZVN0ZWFtQXN5bmNJdGVyYXRvcmApO1xuICAgIH1cblxuICAgIC8vLyA8cmVmZXJlbmNlIGxpYj1cImVzMjAxNS5jb3JlXCIgLz5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9OdW1iZXIvaXNOYU4jUG9seWZpbGxcbiAgICBjb25zdCBOdW1iZXJJc05hTiA9IE51bWJlci5pc05hTiB8fCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgICAgIHJldHVybiB4ICE9PSB4O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBDcmVhdGVBcnJheUZyb21MaXN0KGVsZW1lbnRzKSB7XG4gICAgICAgIC8vIFdlIHVzZSBhcnJheXMgdG8gcmVwcmVzZW50IGxpc3RzLCBzbyB0aGlzIGlzIGJhc2ljYWxseSBhIG5vLW9wLlxuICAgICAgICAvLyBEbyBhIHNsaWNlIHRob3VnaCBqdXN0IGluIGNhc2Ugd2UgaGFwcGVuIHRvIGRlcGVuZCBvbiB0aGUgdW5pcXVlLW5lc3MuXG4gICAgICAgIHJldHVybiBlbGVtZW50cy5zbGljZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBDb3B5RGF0YUJsb2NrQnl0ZXMoZGVzdCwgZGVzdE9mZnNldCwgc3JjLCBzcmNPZmZzZXQsIG4pIHtcbiAgICAgICAgbmV3IFVpbnQ4QXJyYXkoZGVzdCkuc2V0KG5ldyBVaW50OEFycmF5KHNyYywgc3JjT2Zmc2V0LCBuKSwgZGVzdE9mZnNldCk7XG4gICAgfVxuICAgIC8vIE5vdCBpbXBsZW1lbnRlZCBjb3JyZWN0bHlcbiAgICBmdW5jdGlvbiBUcmFuc2ZlckFycmF5QnVmZmVyKE8pIHtcbiAgICAgICAgcmV0dXJuIE87XG4gICAgfVxuICAgIC8vIE5vdCBpbXBsZW1lbnRlZCBjb3JyZWN0bHlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgZnVuY3Rpb24gSXNEZXRhY2hlZEJ1ZmZlcihPKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gQXJyYXlCdWZmZXJTbGljZShidWZmZXIsIGJlZ2luLCBlbmQpIHtcbiAgICAgICAgLy8gQXJyYXlCdWZmZXIucHJvdG90eXBlLnNsaWNlIGlzIG5vdCBhdmFpbGFibGUgb24gSUUxMFxuICAgICAgICAvLyBodHRwczovL3d3dy5jYW5pdXNlLmNvbS9tZG4tamF2YXNjcmlwdF9idWlsdGluc19hcnJheWJ1ZmZlcl9zbGljZVxuICAgICAgICBpZiAoYnVmZmVyLnNsaWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVmZmVyLnNsaWNlKGJlZ2luLCBlbmQpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGVuZCAtIGJlZ2luO1xuICAgICAgICBjb25zdCBzbGljZSA9IG5ldyBBcnJheUJ1ZmZlcihsZW5ndGgpO1xuICAgICAgICBDb3B5RGF0YUJsb2NrQnl0ZXMoc2xpY2UsIDAsIGJ1ZmZlciwgYmVnaW4sIGxlbmd0aCk7XG4gICAgICAgIHJldHVybiBzbGljZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBJc05vbk5lZ2F0aXZlTnVtYmVyKHYpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChOdW1iZXJJc05hTih2KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBDbG9uZUFzVWludDhBcnJheShPKSB7XG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IEFycmF5QnVmZmVyU2xpY2UoTy5idWZmZXIsIE8uYnl0ZU9mZnNldCwgTy5ieXRlT2Zmc2V0ICsgTy5ieXRlTGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gRGVxdWV1ZVZhbHVlKGNvbnRhaW5lcikge1xuICAgICAgICBjb25zdCBwYWlyID0gY29udGFpbmVyLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgICBjb250YWluZXIuX3F1ZXVlVG90YWxTaXplIC09IHBhaXIuc2l6ZTtcbiAgICAgICAgaWYgKGNvbnRhaW5lci5fcXVldWVUb3RhbFNpemUgPCAwKSB7XG4gICAgICAgICAgICBjb250YWluZXIuX3F1ZXVlVG90YWxTaXplID0gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFpci52YWx1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gRW5xdWV1ZVZhbHVlV2l0aFNpemUoY29udGFpbmVyLCB2YWx1ZSwgc2l6ZSkge1xuICAgICAgICBpZiAoIUlzTm9uTmVnYXRpdmVOdW1iZXIoc2l6ZSkgfHwgc2l6ZSA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdTaXplIG11c3QgYmUgYSBmaW5pdGUsIG5vbi1OYU4sIG5vbi1uZWdhdGl2ZSBudW1iZXIuJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGFpbmVyLl9xdWV1ZS5wdXNoKHsgdmFsdWUsIHNpemUgfSk7XG4gICAgICAgIGNvbnRhaW5lci5fcXVldWVUb3RhbFNpemUgKz0gc2l6ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUGVla1F1ZXVlVmFsdWUoY29udGFpbmVyKSB7XG4gICAgICAgIGNvbnN0IHBhaXIgPSBjb250YWluZXIuX3F1ZXVlLnBlZWsoKTtcbiAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlc2V0UXVldWUoY29udGFpbmVyKSB7XG4gICAgICAgIGNvbnRhaW5lci5fcXVldWUgPSBuZXcgU2ltcGxlUXVldWUoKTtcbiAgICAgICAgY29udGFpbmVyLl9xdWV1ZVRvdGFsU2l6ZSA9IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBwdWxsLWludG8gcmVxdWVzdCBpbiBhIHtAbGluayBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyfS5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGFzcyBSZWFkYWJsZVN0cmVhbUJZT0JSZXF1ZXN0IHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbGxlZ2FsIGNvbnN0cnVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIHZpZXcgZm9yIHdyaXRpbmcgaW4gdG8sIG9yIGBudWxsYCBpZiB0aGUgQllPQiByZXF1ZXN0IGhhcyBhbHJlYWR5IGJlZW4gcmVzcG9uZGVkIHRvLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0IHZpZXcoKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW1CWU9CUmVxdWVzdCh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGJ5b2JSZXF1ZXN0QnJhbmRDaGVja0V4Y2VwdGlvbigndmlldycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3ZpZXc7XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uZChieXRlc1dyaXR0ZW4pIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbUJZT0JSZXF1ZXN0KHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgYnlvYlJlcXVlc3RCcmFuZENoZWNrRXhjZXB0aW9uKCdyZXNwb25kJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhc3NlcnRSZXF1aXJlZEFyZ3VtZW50KGJ5dGVzV3JpdHRlbiwgMSwgJ3Jlc3BvbmQnKTtcbiAgICAgICAgICAgIGJ5dGVzV3JpdHRlbiA9IGNvbnZlcnRVbnNpZ25lZExvbmdMb25nV2l0aEVuZm9yY2VSYW5nZShieXRlc1dyaXR0ZW4sICdGaXJzdCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hc3NvY2lhdGVkUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhpcyBCWU9CIHJlcXVlc3QgaGFzIGJlZW4gaW52YWxpZGF0ZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc0RldGFjaGVkQnVmZmVyKHRoaXMuX3ZpZXcuYnVmZmVyKSkgO1xuICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclJlc3BvbmQodGhpcy5fYXNzb2NpYXRlZFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIsIGJ5dGVzV3JpdHRlbik7XG4gICAgICAgIH1cbiAgICAgICAgcmVzcG9uZFdpdGhOZXdWaWV3KHZpZXcpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbUJZT0JSZXF1ZXN0KHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgYnlvYlJlcXVlc3RCcmFuZENoZWNrRXhjZXB0aW9uKCdyZXNwb25kV2l0aE5ld1ZpZXcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2VydFJlcXVpcmVkQXJndW1lbnQodmlldywgMSwgJ3Jlc3BvbmRXaXRoTmV3VmlldycpO1xuICAgICAgICAgICAgaWYgKCFBcnJheUJ1ZmZlci5pc1ZpZXcodmlldykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgY2FuIG9ubHkgcmVzcG9uZCB3aXRoIGFycmF5IGJ1ZmZlciB2aWV3cycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2Fzc29jaWF0ZWRSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGlzIEJZT0IgcmVxdWVzdCBoYXMgYmVlbiBpbnZhbGlkYXRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKElzRGV0YWNoZWRCdWZmZXIodmlldy5idWZmZXIpKSA7XG4gICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUmVzcG9uZFdpdGhOZXdWaWV3KHRoaXMuX2Fzc29jaWF0ZWRSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyLCB2aWV3KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZWFkYWJsZVN0cmVhbUJZT0JSZXF1ZXN0LnByb3RvdHlwZSwge1xuICAgICAgICByZXNwb25kOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgcmVzcG9uZFdpdGhOZXdWaWV3OiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgdmlldzogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGVTdHJlYW1CWU9CUmVxdWVzdC5wcm90b3R5cGUsIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ1JlYWRhYmxlU3RyZWFtQllPQlJlcXVlc3QnLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbGxvd3MgY29udHJvbCBvZiBhIHtAbGluayBSZWFkYWJsZVN0cmVhbSB8IHJlYWRhYmxlIGJ5dGUgc3RyZWFtfSdzIHN0YXRlIGFuZCBpbnRlcm5hbCBxdWV1ZS5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGFzcyBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbGxlZ2FsIGNvbnN0cnVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgQllPQiBwdWxsIHJlcXVlc3QsIG9yIGBudWxsYCBpZiB0aGVyZSBpc24ndCBvbmUuXG4gICAgICAgICAqL1xuICAgICAgICBnZXQgYnlvYlJlcXVlc3QoKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGJ5dGVTdHJlYW1Db250cm9sbGVyQnJhbmRDaGVja0V4Y2VwdGlvbignYnlvYlJlcXVlc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyR2V0QllPQlJlcXVlc3QodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIGRlc2lyZWQgc2l6ZSB0byBmaWxsIHRoZSBjb250cm9sbGVkIHN0cmVhbSdzIGludGVybmFsIHF1ZXVlLiBJdCBjYW4gYmUgbmVnYXRpdmUsIGlmIHRoZSBxdWV1ZSBpc1xuICAgICAgICAgKiBvdmVyLWZ1bGwuIEFuIHVuZGVybHlpbmcgYnl0ZSBzb3VyY2Ugb3VnaHQgdG8gdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGV0ZXJtaW5lIHdoZW4gYW5kIGhvdyB0byBhcHBseSBiYWNrcHJlc3N1cmUuXG4gICAgICAgICAqL1xuICAgICAgICBnZXQgZGVzaXJlZFNpemUoKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGJ5dGVTdHJlYW1Db250cm9sbGVyQnJhbmRDaGVja0V4Y2VwdGlvbignZGVzaXJlZFNpemUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyR2V0RGVzaXJlZFNpemUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsb3NlcyB0aGUgY29udHJvbGxlZCByZWFkYWJsZSBzdHJlYW0uIENvbnN1bWVycyB3aWxsIHN0aWxsIGJlIGFibGUgdG8gcmVhZCBhbnkgcHJldmlvdXNseS1lbnF1ZXVlZCBjaHVua3MgZnJvbVxuICAgICAgICAgKiB0aGUgc3RyZWFtLCBidXQgb25jZSB0aG9zZSBhcmUgcmVhZCwgdGhlIHN0cmVhbSB3aWxsIGJlY29tZSBjbG9zZWQuXG4gICAgICAgICAqL1xuICAgICAgICBjbG9zZSgpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgYnl0ZVN0cmVhbUNvbnRyb2xsZXJCcmFuZENoZWNrRXhjZXB0aW9uKCdjbG9zZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2Nsb3NlUmVxdWVzdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIHN0cmVhbSBoYXMgYWxyZWFkeSBiZWVuIGNsb3NlZDsgZG8gbm90IGNsb3NlIGl0IGFnYWluIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSAhPT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBzdHJlYW0gKGluICR7c3RhdGV9IHN0YXRlKSBpcyBub3QgaW4gdGhlIHJlYWRhYmxlIHN0YXRlIGFuZCBjYW5ub3QgYmUgY2xvc2VkYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2xvc2UodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgZW5xdWV1ZShjaHVuaykge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBieXRlU3RyZWFtQ29udHJvbGxlckJyYW5kQ2hlY2tFeGNlcHRpb24oJ2VucXVldWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFzc2VydFJlcXVpcmVkQXJndW1lbnQoY2h1bmssIDEsICdlbnF1ZXVlJyk7XG4gICAgICAgICAgICBpZiAoIUFycmF5QnVmZmVyLmlzVmlldyhjaHVuaykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjaHVuayBtdXN0IGJlIGFuIGFycmF5IGJ1ZmZlciB2aWV3Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2h1bmsuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NodW5rIG11c3QgaGF2ZSBub24temVybyBieXRlTGVuZ3RoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2h1bmsuYnVmZmVyLmJ5dGVMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBjaHVuaydzIGJ1ZmZlciBtdXN0IGhhdmUgbm9uLXplcm8gYnl0ZUxlbmd0aGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2Nsb3NlUmVxdWVzdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3RyZWFtIGlzIGNsb3NlZCBvciBkcmFpbmluZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSAhPT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFRoZSBzdHJlYW0gKGluICR7c3RhdGV9IHN0YXRlKSBpcyBub3QgaW4gdGhlIHJlYWRhYmxlIHN0YXRlIGFuZCBjYW5ub3QgYmUgZW5xdWV1ZWQgdG9gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFbnF1ZXVlKHRoaXMsIGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogRXJyb3JzIHRoZSBjb250cm9sbGVkIHJlYWRhYmxlIHN0cmVhbSwgbWFraW5nIGFsbCBmdXR1cmUgaW50ZXJhY3Rpb25zIHdpdGggaXQgZmFpbCB3aXRoIHRoZSBnaXZlbiBlcnJvciBgZWAuXG4gICAgICAgICAqL1xuICAgICAgICBlcnJvcihlID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGJ5dGVTdHJlYW1Db250cm9sbGVyQnJhbmRDaGVja0V4Y2VwdGlvbignZXJyb3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcih0aGlzLCBlKTtcbiAgICAgICAgfVxuICAgICAgICAvKiogQGludGVybmFsICovXG4gICAgICAgIFtDYW5jZWxTdGVwc10ocmVhc29uKSB7XG4gICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2xlYXJQZW5kaW5nUHVsbEludG9zKHRoaXMpO1xuICAgICAgICAgICAgUmVzZXRRdWV1ZSh0aGlzKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2NhbmNlbEFsZ29yaXRobShyZWFzb24pO1xuICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNsZWFyQWxnb3JpdGhtcyh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgLyoqIEBpbnRlcm5hbCAqL1xuICAgICAgICBbUHVsbFN0ZXBzXShyZWFkUmVxdWVzdCkge1xuICAgICAgICAgICAgY29uc3Qgc3RyZWFtID0gdGhpcy5fY29udHJvbGxlZFJlYWRhYmxlQnl0ZVN0cmVhbTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9xdWV1ZVRvdGFsU2l6ZSA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcXVldWVUb3RhbFNpemUgLT0gZW50cnkuYnl0ZUxlbmd0aDtcbiAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVySGFuZGxlUXVldWVEcmFpbih0aGlzKTtcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoZW50cnkuYnVmZmVyLCBlbnRyeS5ieXRlT2Zmc2V0LCBlbnRyeS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZWFkUmVxdWVzdC5fY2h1bmtTdGVwcyh2aWV3KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBhdXRvQWxsb2NhdGVDaHVua1NpemUgPSB0aGlzLl9hdXRvQWxsb2NhdGVDaHVua1NpemU7XG4gICAgICAgICAgICBpZiAoYXV0b0FsbG9jYXRlQ2h1bmtTaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgYnVmZmVyO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihhdXRvQWxsb2NhdGVDaHVua1NpemUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoYnVmZmVyRSkge1xuICAgICAgICAgICAgICAgICAgICByZWFkUmVxdWVzdC5fZXJyb3JTdGVwcyhidWZmZXJFKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBwdWxsSW50b0Rlc2NyaXB0b3IgPSB7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyQnl0ZUxlbmd0aDogYXV0b0FsbG9jYXRlQ2h1bmtTaXplLFxuICAgICAgICAgICAgICAgICAgICBieXRlT2Zmc2V0OiAwLFxuICAgICAgICAgICAgICAgICAgICBieXRlTGVuZ3RoOiBhdXRvQWxsb2NhdGVDaHVua1NpemUsXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzRmlsbGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50U2l6ZTogMSxcbiAgICAgICAgICAgICAgICAgICAgdmlld0NvbnN0cnVjdG9yOiBVaW50OEFycmF5LFxuICAgICAgICAgICAgICAgICAgICByZWFkZXJUeXBlOiAnZGVmYXVsdCdcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdQdWxsSW50b3MucHVzaChwdWxsSW50b0Rlc2NyaXB0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1BZGRSZWFkUmVxdWVzdChzdHJlYW0sIHJlYWRSZXF1ZXN0KTtcbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDYWxsUHVsbElmTmVlZGVkKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIucHJvdG90eXBlLCB7XG4gICAgICAgIGNsb3NlOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgZW5xdWV1ZTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIGVycm9yOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgYnlvYlJlcXVlc3Q6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICBkZXNpcmVkU2l6ZTogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlci5wcm90b3R5cGUsIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ1JlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXInLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBBYnN0cmFjdCBvcGVyYXRpb25zIGZvciB0aGUgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlci5cbiAgICBmdW5jdGlvbiBJc1JlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIoeCkge1xuICAgICAgICBpZiAoIXR5cGVJc09iamVjdCh4KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHgsICdfY29udHJvbGxlZFJlYWRhYmxlQnl0ZVN0cmVhbScpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBJc1JlYWRhYmxlU3RyZWFtQllPQlJlcXVlc3QoeCkge1xuICAgICAgICBpZiAoIXR5cGVJc09iamVjdCh4KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHgsICdfYXNzb2NpYXRlZFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXInKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW1CWU9CUmVxdWVzdDtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNhbGxQdWxsSWZOZWVkZWQoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBzaG91bGRQdWxsID0gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclNob3VsZENhbGxQdWxsKGNvbnRyb2xsZXIpO1xuICAgICAgICBpZiAoIXNob3VsZFB1bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udHJvbGxlci5fcHVsbGluZykge1xuICAgICAgICAgICAgY29udHJvbGxlci5fcHVsbEFnYWluID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb250cm9sbGVyLl9wdWxsaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gVE9ETzogVGVzdCBjb250cm9sbGVyIGFyZ3VtZW50XG4gICAgICAgIGNvbnN0IHB1bGxQcm9taXNlID0gY29udHJvbGxlci5fcHVsbEFsZ29yaXRobSgpO1xuICAgICAgICB1cG9uUHJvbWlzZShwdWxsUHJvbWlzZSwgKCkgPT4ge1xuICAgICAgICAgICAgY29udHJvbGxlci5fcHVsbGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuX3B1bGxBZ2Fpbikge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuX3B1bGxBZ2FpbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDYWxsUHVsbElmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBlID0+IHtcbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcihjb250cm9sbGVyLCBlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDbGVhclBlbmRpbmdQdWxsSW50b3MoY29udHJvbGxlcikge1xuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVySW52YWxpZGF0ZUJZT0JSZXF1ZXN0KGNvbnRyb2xsZXIpO1xuICAgICAgICBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zID0gbmV3IFNpbXBsZVF1ZXVlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDb21taXRQdWxsSW50b0Rlc2NyaXB0b3Ioc3RyZWFtLCBwdWxsSW50b0Rlc2NyaXB0b3IpIHtcbiAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHN0cmVhbS5fc3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxsZWRWaWV3ID0gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNvbnZlcnRQdWxsSW50b0Rlc2NyaXB0b3IocHVsbEludG9EZXNjcmlwdG9yKTtcbiAgICAgICAgaWYgKHB1bGxJbnRvRGVzY3JpcHRvci5yZWFkZXJUeXBlID09PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRnVsZmlsbFJlYWRSZXF1ZXN0KHN0cmVhbSwgZmlsbGVkVmlldywgZG9uZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBSZWFkYWJsZVN0cmVhbUZ1bGZpbGxSZWFkSW50b1JlcXVlc3Qoc3RyZWFtLCBmaWxsZWRWaWV3LCBkb25lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ29udmVydFB1bGxJbnRvRGVzY3JpcHRvcihwdWxsSW50b0Rlc2NyaXB0b3IpIHtcbiAgICAgICAgY29uc3QgYnl0ZXNGaWxsZWQgPSBwdWxsSW50b0Rlc2NyaXB0b3IuYnl0ZXNGaWxsZWQ7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRTaXplID0gcHVsbEludG9EZXNjcmlwdG9yLmVsZW1lbnRTaXplO1xuICAgICAgICByZXR1cm4gbmV3IHB1bGxJbnRvRGVzY3JpcHRvci52aWV3Q29uc3RydWN0b3IocHVsbEludG9EZXNjcmlwdG9yLmJ1ZmZlciwgcHVsbEludG9EZXNjcmlwdG9yLmJ5dGVPZmZzZXQsIGJ5dGVzRmlsbGVkIC8gZWxlbWVudFNpemUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyRW5xdWV1ZUNodW5rVG9RdWV1ZShjb250cm9sbGVyLCBidWZmZXIsIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgpIHtcbiAgICAgICAgY29udHJvbGxlci5fcXVldWUucHVzaCh7IGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCB9KTtcbiAgICAgICAgY29udHJvbGxlci5fcXVldWVUb3RhbFNpemUgKz0gYnl0ZUxlbmd0aDtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckZpbGxQdWxsSW50b0Rlc2NyaXB0b3JGcm9tUXVldWUoY29udHJvbGxlciwgcHVsbEludG9EZXNjcmlwdG9yKSB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnRTaXplID0gcHVsbEludG9EZXNjcmlwdG9yLmVsZW1lbnRTaXplO1xuICAgICAgICBjb25zdCBjdXJyZW50QWxpZ25lZEJ5dGVzID0gcHVsbEludG9EZXNjcmlwdG9yLmJ5dGVzRmlsbGVkIC0gcHVsbEludG9EZXNjcmlwdG9yLmJ5dGVzRmlsbGVkICUgZWxlbWVudFNpemU7XG4gICAgICAgIGNvbnN0IG1heEJ5dGVzVG9Db3B5ID0gTWF0aC5taW4oY29udHJvbGxlci5fcXVldWVUb3RhbFNpemUsIHB1bGxJbnRvRGVzY3JpcHRvci5ieXRlTGVuZ3RoIC0gcHVsbEludG9EZXNjcmlwdG9yLmJ5dGVzRmlsbGVkKTtcbiAgICAgICAgY29uc3QgbWF4Qnl0ZXNGaWxsZWQgPSBwdWxsSW50b0Rlc2NyaXB0b3IuYnl0ZXNGaWxsZWQgKyBtYXhCeXRlc1RvQ29weTtcbiAgICAgICAgY29uc3QgbWF4QWxpZ25lZEJ5dGVzID0gbWF4Qnl0ZXNGaWxsZWQgLSBtYXhCeXRlc0ZpbGxlZCAlIGVsZW1lbnRTaXplO1xuICAgICAgICBsZXQgdG90YWxCeXRlc1RvQ29weVJlbWFpbmluZyA9IG1heEJ5dGVzVG9Db3B5O1xuICAgICAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKG1heEFsaWduZWRCeXRlcyA+IGN1cnJlbnRBbGlnbmVkQnl0ZXMpIHtcbiAgICAgICAgICAgIHRvdGFsQnl0ZXNUb0NvcHlSZW1haW5pbmcgPSBtYXhBbGlnbmVkQnl0ZXMgLSBwdWxsSW50b0Rlc2NyaXB0b3IuYnl0ZXNGaWxsZWQ7XG4gICAgICAgICAgICByZWFkeSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcXVldWUgPSBjb250cm9sbGVyLl9xdWV1ZTtcbiAgICAgICAgd2hpbGUgKHRvdGFsQnl0ZXNUb0NvcHlSZW1haW5pbmcgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFkT2ZRdWV1ZSA9IHF1ZXVlLnBlZWsoKTtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVzVG9Db3B5ID0gTWF0aC5taW4odG90YWxCeXRlc1RvQ29weVJlbWFpbmluZywgaGVhZE9mUXVldWUuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICBjb25zdCBkZXN0U3RhcnQgPSBwdWxsSW50b0Rlc2NyaXB0b3IuYnl0ZU9mZnNldCArIHB1bGxJbnRvRGVzY3JpcHRvci5ieXRlc0ZpbGxlZDtcbiAgICAgICAgICAgIENvcHlEYXRhQmxvY2tCeXRlcyhwdWxsSW50b0Rlc2NyaXB0b3IuYnVmZmVyLCBkZXN0U3RhcnQsIGhlYWRPZlF1ZXVlLmJ1ZmZlciwgaGVhZE9mUXVldWUuYnl0ZU9mZnNldCwgYnl0ZXNUb0NvcHkpO1xuICAgICAgICAgICAgaWYgKGhlYWRPZlF1ZXVlLmJ5dGVMZW5ndGggPT09IGJ5dGVzVG9Db3B5KSB7XG4gICAgICAgICAgICAgICAgcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlYWRPZlF1ZXVlLmJ5dGVPZmZzZXQgKz0gYnl0ZXNUb0NvcHk7XG4gICAgICAgICAgICAgICAgaGVhZE9mUXVldWUuYnl0ZUxlbmd0aCAtPSBieXRlc1RvQ29weTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRyb2xsZXIuX3F1ZXVlVG90YWxTaXplIC09IGJ5dGVzVG9Db3B5O1xuICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckZpbGxIZWFkUHVsbEludG9EZXNjcmlwdG9yKGNvbnRyb2xsZXIsIGJ5dGVzVG9Db3B5LCBwdWxsSW50b0Rlc2NyaXB0b3IpO1xuICAgICAgICAgICAgdG90YWxCeXRlc1RvQ29weVJlbWFpbmluZyAtPSBieXRlc1RvQ29weTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVhZHk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJGaWxsSGVhZFB1bGxJbnRvRGVzY3JpcHRvcihjb250cm9sbGVyLCBzaXplLCBwdWxsSW50b0Rlc2NyaXB0b3IpIHtcbiAgICAgICAgcHVsbEludG9EZXNjcmlwdG9yLmJ5dGVzRmlsbGVkICs9IHNpemU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJIYW5kbGVRdWV1ZURyYWluKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgaWYgKGNvbnRyb2xsZXIuX3F1ZXVlVG90YWxTaXplID09PSAwICYmIGNvbnRyb2xsZXIuX2Nsb3NlUmVxdWVzdGVkKSB7XG4gICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKGNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1DbG9zZShjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDYWxsUHVsbElmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJJbnZhbGlkYXRlQllPQlJlcXVlc3QoY29udHJvbGxlcikge1xuICAgICAgICBpZiAoY29udHJvbGxlci5fYnlvYlJlcXVlc3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb250cm9sbGVyLl9ieW9iUmVxdWVzdC5fYXNzb2NpYXRlZFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnRyb2xsZXIuX2J5b2JSZXF1ZXN0Ll92aWV3ID0gbnVsbDtcbiAgICAgICAgY29udHJvbGxlci5fYnlvYlJlcXVlc3QgPSBudWxsO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUHJvY2Vzc1B1bGxJbnRvRGVzY3JpcHRvcnNVc2luZ1F1ZXVlKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgd2hpbGUgKGNvbnRyb2xsZXIuX3BlbmRpbmdQdWxsSW50b3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuX3F1ZXVlVG90YWxTaXplID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcHVsbEludG9EZXNjcmlwdG9yID0gY29udHJvbGxlci5fcGVuZGluZ1B1bGxJbnRvcy5wZWVrKCk7XG4gICAgICAgICAgICBpZiAoUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckZpbGxQdWxsSW50b0Rlc2NyaXB0b3JGcm9tUXVldWUoY29udHJvbGxlciwgcHVsbEludG9EZXNjcmlwdG9yKSkge1xuICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJTaGlmdFBlbmRpbmdQdWxsSW50byhjb250cm9sbGVyKTtcbiAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ29tbWl0UHVsbEludG9EZXNjcmlwdG9yKGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRSZWFkYWJsZUJ5dGVTdHJlYW0sIHB1bGxJbnRvRGVzY3JpcHRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclB1bGxJbnRvKGNvbnRyb2xsZXIsIHZpZXcsIHJlYWRJbnRvUmVxdWVzdCkge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtO1xuICAgICAgICBsZXQgZWxlbWVudFNpemUgPSAxO1xuICAgICAgICBpZiAodmlldy5jb25zdHJ1Y3RvciAhPT0gRGF0YVZpZXcpIHtcbiAgICAgICAgICAgIGVsZW1lbnRTaXplID0gdmlldy5jb25zdHJ1Y3Rvci5CWVRFU19QRVJfRUxFTUVOVDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdG9yID0gdmlldy5jb25zdHJ1Y3RvcjtcbiAgICAgICAgLy8gdHJ5IHtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gVHJhbnNmZXJBcnJheUJ1ZmZlcih2aWV3LmJ1ZmZlcik7XG4gICAgICAgIC8vIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gICByZWFkSW50b1JlcXVlc3QuX2Vycm9yU3RlcHMoZSk7XG4gICAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG4gICAgICAgIGNvbnN0IHB1bGxJbnRvRGVzY3JpcHRvciA9IHtcbiAgICAgICAgICAgIGJ1ZmZlcixcbiAgICAgICAgICAgIGJ1ZmZlckJ5dGVMZW5ndGg6IGJ1ZmZlci5ieXRlTGVuZ3RoLFxuICAgICAgICAgICAgYnl0ZU9mZnNldDogdmlldy5ieXRlT2Zmc2V0LFxuICAgICAgICAgICAgYnl0ZUxlbmd0aDogdmlldy5ieXRlTGVuZ3RoLFxuICAgICAgICAgICAgYnl0ZXNGaWxsZWQ6IDAsXG4gICAgICAgICAgICBlbGVtZW50U2l6ZSxcbiAgICAgICAgICAgIHZpZXdDb25zdHJ1Y3RvcjogY3RvcixcbiAgICAgICAgICAgIHJlYWRlclR5cGU6ICdieW9iJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAoY29udHJvbGxlci5fcGVuZGluZ1B1bGxJbnRvcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLnB1c2gocHVsbEludG9EZXNjcmlwdG9yKTtcbiAgICAgICAgICAgIC8vIE5vIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDYWxsUHVsbElmTmVlZGVkKCkgY2FsbCBzaW5jZTpcbiAgICAgICAgICAgIC8vIC0gTm8gY2hhbmdlIGhhcHBlbnMgb24gZGVzaXJlZFNpemVcbiAgICAgICAgICAgIC8vIC0gVGhlIHNvdXJjZSBoYXMgYWxyZWFkeSBiZWVuIG5vdGlmaWVkIG9mIHRoYXQgdGhlcmUncyBhdCBsZWFzdCAxIHBlbmRpbmcgcmVhZCh2aWV3KVxuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1BZGRSZWFkSW50b1JlcXVlc3Qoc3RyZWFtLCByZWFkSW50b1JlcXVlc3QpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHJlYW0uX3N0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgY29uc3QgZW1wdHlWaWV3ID0gbmV3IGN0b3IocHVsbEludG9EZXNjcmlwdG9yLmJ1ZmZlciwgcHVsbEludG9EZXNjcmlwdG9yLmJ5dGVPZmZzZXQsIDApO1xuICAgICAgICAgICAgcmVhZEludG9SZXF1ZXN0Ll9jbG9zZVN0ZXBzKGVtcHR5Vmlldyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRyb2xsZXIuX3F1ZXVlVG90YWxTaXplID4gMCkge1xuICAgICAgICAgICAgaWYgKFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJGaWxsUHVsbEludG9EZXNjcmlwdG9yRnJvbVF1ZXVlKGNvbnRyb2xsZXIsIHB1bGxJbnRvRGVzY3JpcHRvcikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxsZWRWaWV3ID0gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNvbnZlcnRQdWxsSW50b0Rlc2NyaXB0b3IocHVsbEludG9EZXNjcmlwdG9yKTtcbiAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVySGFuZGxlUXVldWVEcmFpbihjb250cm9sbGVyKTtcbiAgICAgICAgICAgICAgICByZWFkSW50b1JlcXVlc3QuX2NodW5rU3RlcHMoZmlsbGVkVmlldyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbnRyb2xsZXIuX2Nsb3NlUmVxdWVzdGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZSA9IG5ldyBUeXBlRXJyb3IoJ0luc3VmZmljaWVudCBieXRlcyB0byBmaWxsIGVsZW1lbnRzIGluIHRoZSBnaXZlbiBidWZmZXInKTtcbiAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyRXJyb3IoY29udHJvbGxlciwgZSk7XG4gICAgICAgICAgICAgICAgcmVhZEludG9SZXF1ZXN0Ll9lcnJvclN0ZXBzKGUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLnB1c2gocHVsbEludG9EZXNjcmlwdG9yKTtcbiAgICAgICAgUmVhZGFibGVTdHJlYW1BZGRSZWFkSW50b1JlcXVlc3Qoc3RyZWFtLCByZWFkSW50b1JlcXVlc3QpO1xuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2FsbFB1bGxJZk5lZWRlZChjb250cm9sbGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclJlc3BvbmRJbkNsb3NlZFN0YXRlKGNvbnRyb2xsZXIsIGZpcnN0RGVzY3JpcHRvcikge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtO1xuICAgICAgICBpZiAoUmVhZGFibGVTdHJlYW1IYXNCWU9CUmVhZGVyKHN0cmVhbSkpIHtcbiAgICAgICAgICAgIHdoaWxlIChSZWFkYWJsZVN0cmVhbUdldE51bVJlYWRJbnRvUmVxdWVzdHMoc3RyZWFtKSA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwdWxsSW50b0Rlc2NyaXB0b3IgPSBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyU2hpZnRQZW5kaW5nUHVsbEludG8oY29udHJvbGxlcik7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNvbW1pdFB1bGxJbnRvRGVzY3JpcHRvcihzdHJlYW0sIHB1bGxJbnRvRGVzY3JpcHRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclJlc3BvbmRJblJlYWRhYmxlU3RhdGUoY29udHJvbGxlciwgYnl0ZXNXcml0dGVuLCBwdWxsSW50b0Rlc2NyaXB0b3IpIHtcbiAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckZpbGxIZWFkUHVsbEludG9EZXNjcmlwdG9yKGNvbnRyb2xsZXIsIGJ5dGVzV3JpdHRlbiwgcHVsbEludG9EZXNjcmlwdG9yKTtcbiAgICAgICAgaWYgKHB1bGxJbnRvRGVzY3JpcHRvci5ieXRlc0ZpbGxlZCA8IHB1bGxJbnRvRGVzY3JpcHRvci5lbGVtZW50U2l6ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJTaGlmdFBlbmRpbmdQdWxsSW50byhjb250cm9sbGVyKTtcbiAgICAgICAgY29uc3QgcmVtYWluZGVyU2l6ZSA9IHB1bGxJbnRvRGVzY3JpcHRvci5ieXRlc0ZpbGxlZCAlIHB1bGxJbnRvRGVzY3JpcHRvci5lbGVtZW50U2l6ZTtcbiAgICAgICAgaWYgKHJlbWFpbmRlclNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBlbmQgPSBwdWxsSW50b0Rlc2NyaXB0b3IuYnl0ZU9mZnNldCArIHB1bGxJbnRvRGVzY3JpcHRvci5ieXRlc0ZpbGxlZDtcbiAgICAgICAgICAgIGNvbnN0IHJlbWFpbmRlciA9IEFycmF5QnVmZmVyU2xpY2UocHVsbEludG9EZXNjcmlwdG9yLmJ1ZmZlciwgZW5kIC0gcmVtYWluZGVyU2l6ZSwgZW5kKTtcbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFbnF1ZXVlQ2h1bmtUb1F1ZXVlKGNvbnRyb2xsZXIsIHJlbWFpbmRlciwgMCwgcmVtYWluZGVyLmJ5dGVMZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHB1bGxJbnRvRGVzY3JpcHRvci5ieXRlc0ZpbGxlZCAtPSByZW1haW5kZXJTaXplO1xuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ29tbWl0UHVsbEludG9EZXNjcmlwdG9yKGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRSZWFkYWJsZUJ5dGVTdHJlYW0sIHB1bGxJbnRvRGVzY3JpcHRvcik7XG4gICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJQcm9jZXNzUHVsbEludG9EZXNjcmlwdG9yc1VzaW5nUXVldWUoY29udHJvbGxlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJSZXNwb25kSW50ZXJuYWwoY29udHJvbGxlciwgYnl0ZXNXcml0dGVuKSB7XG4gICAgICAgIGNvbnN0IGZpcnN0RGVzY3JpcHRvciA9IGNvbnRyb2xsZXIuX3BlbmRpbmdQdWxsSW50b3MucGVlaygpO1xuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVySW52YWxpZGF0ZUJZT0JSZXF1ZXN0KGNvbnRyb2xsZXIpO1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRSZWFkYWJsZUJ5dGVTdHJlYW0uX3N0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUmVzcG9uZEluQ2xvc2VkU3RhdGUoY29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUmVzcG9uZEluUmVhZGFibGVTdGF0ZShjb250cm9sbGVyLCBieXRlc1dyaXR0ZW4sIGZpcnN0RGVzY3JpcHRvcik7XG4gICAgICAgIH1cbiAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNhbGxQdWxsSWZOZWVkZWQoY29udHJvbGxlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJTaGlmdFBlbmRpbmdQdWxsSW50byhjb250cm9sbGVyKSB7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBkZXNjcmlwdG9yO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyU2hvdWxkQ2FsbFB1bGwoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtO1xuICAgICAgICBpZiAoc3RyZWFtLl9zdGF0ZSAhPT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb250cm9sbGVyLl9jbG9zZVJlcXVlc3RlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29udHJvbGxlci5fc3RhcnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChSZWFkYWJsZVN0cmVhbUhhc0RlZmF1bHRSZWFkZXIoc3RyZWFtKSAmJiBSZWFkYWJsZVN0cmVhbUdldE51bVJlYWRSZXF1ZXN0cyhzdHJlYW0pID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFJlYWRhYmxlU3RyZWFtSGFzQllPQlJlYWRlcihzdHJlYW0pICYmIFJlYWRhYmxlU3RyZWFtR2V0TnVtUmVhZEludG9SZXF1ZXN0cyhzdHJlYW0pID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVzaXJlZFNpemUgPSBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyR2V0RGVzaXJlZFNpemUoY29udHJvbGxlcik7XG4gICAgICAgIGlmIChkZXNpcmVkU2l6ZSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNsZWFyQWxnb3JpdGhtcyhjb250cm9sbGVyKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuX3B1bGxBbGdvcml0aG0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnRyb2xsZXIuX2NhbmNlbEFsZ29yaXRobSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gQSBjbGllbnQgb2YgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlciBtYXkgdXNlIHRoZXNlIGZ1bmN0aW9ucyBkaXJlY3RseSB0byBieXBhc3Mgc3RhdGUgY2hlY2suXG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNsb3NlKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gY29udHJvbGxlci5fY29udHJvbGxlZFJlYWRhYmxlQnl0ZVN0cmVhbTtcbiAgICAgICAgaWYgKGNvbnRyb2xsZXIuX2Nsb3NlUmVxdWVzdGVkIHx8IHN0cmVhbS5fc3RhdGUgIT09ICdyZWFkYWJsZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udHJvbGxlci5fcXVldWVUb3RhbFNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb250cm9sbGVyLl9jbG9zZVJlcXVlc3RlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbnRyb2xsZXIuX3BlbmRpbmdQdWxsSW50b3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZmlyc3RQZW5kaW5nUHVsbEludG8gPSBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLnBlZWsoKTtcbiAgICAgICAgICAgIGlmIChmaXJzdFBlbmRpbmdQdWxsSW50by5ieXRlc0ZpbGxlZCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlID0gbmV3IFR5cGVFcnJvcignSW5zdWZmaWNpZW50IGJ5dGVzIHRvIGZpbGwgZWxlbWVudHMgaW4gdGhlIGdpdmVuIGJ1ZmZlcicpO1xuICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcihjb250cm9sbGVyLCBlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDbGVhckFsZ29yaXRobXMoY29udHJvbGxlcik7XG4gICAgICAgIFJlYWRhYmxlU3RyZWFtQ2xvc2Uoc3RyZWFtKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckVucXVldWUoY29udHJvbGxlciwgY2h1bmspIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gY29udHJvbGxlci5fY29udHJvbGxlZFJlYWRhYmxlQnl0ZVN0cmVhbTtcbiAgICAgICAgaWYgKGNvbnRyb2xsZXIuX2Nsb3NlUmVxdWVzdGVkIHx8IHN0cmVhbS5fc3RhdGUgIT09ICdyZWFkYWJsZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBidWZmZXIgPSBjaHVuay5idWZmZXI7XG4gICAgICAgIGNvbnN0IGJ5dGVPZmZzZXQgPSBjaHVuay5ieXRlT2Zmc2V0O1xuICAgICAgICBjb25zdCBieXRlTGVuZ3RoID0gY2h1bmsuYnl0ZUxlbmd0aDtcbiAgICAgICAgY29uc3QgdHJhbnNmZXJyZWRCdWZmZXIgPSBUcmFuc2ZlckFycmF5QnVmZmVyKGJ1ZmZlcik7XG4gICAgICAgIGlmIChjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0UGVuZGluZ1B1bGxJbnRvID0gY29udHJvbGxlci5fcGVuZGluZ1B1bGxJbnRvcy5wZWVrKCk7XG4gICAgICAgICAgICBpZiAoSXNEZXRhY2hlZEJ1ZmZlcihmaXJzdFBlbmRpbmdQdWxsSW50by5idWZmZXIpKSA7XG4gICAgICAgICAgICBmaXJzdFBlbmRpbmdQdWxsSW50by5idWZmZXIgPSBUcmFuc2ZlckFycmF5QnVmZmVyKGZpcnN0UGVuZGluZ1B1bGxJbnRvLmJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckludmFsaWRhdGVCWU9CUmVxdWVzdChjb250cm9sbGVyKTtcbiAgICAgICAgaWYgKFJlYWRhYmxlU3RyZWFtSGFzRGVmYXVsdFJlYWRlcihzdHJlYW0pKSB7XG4gICAgICAgICAgICBpZiAoUmVhZGFibGVTdHJlYW1HZXROdW1SZWFkUmVxdWVzdHMoc3RyZWFtKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFbnF1ZXVlQ2h1bmtUb1F1ZXVlKGNvbnRyb2xsZXIsIHRyYW5zZmVycmVkQnVmZmVyLCBieXRlT2Zmc2V0LCBieXRlTGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclNoaWZ0UGVuZGluZ1B1bGxJbnRvKGNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2ZlcnJlZFZpZXcgPSBuZXcgVWludDhBcnJheSh0cmFuc2ZlcnJlZEJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1GdWxmaWxsUmVhZFJlcXVlc3Qoc3RyZWFtLCB0cmFuc2ZlcnJlZFZpZXcsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChSZWFkYWJsZVN0cmVhbUhhc0JZT0JSZWFkZXIoc3RyZWFtKSkge1xuICAgICAgICAgICAgLy8gVE9ETzogSWRlYWxseSBpbiB0aGlzIGJyYW5jaCBkZXRhY2hpbmcgc2hvdWxkIGhhcHBlbiBvbmx5IGlmIHRoZSBidWZmZXIgaXMgbm90IGNvbnN1bWVkIGZ1bGx5LlxuICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckVucXVldWVDaHVua1RvUXVldWUoY29udHJvbGxlciwgdHJhbnNmZXJyZWRCdWZmZXIsIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclByb2Nlc3NQdWxsSW50b0Rlc2NyaXB0b3JzVXNpbmdRdWV1ZShjb250cm9sbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFbnF1ZXVlQ2h1bmtUb1F1ZXVlKGNvbnRyb2xsZXIsIHRyYW5zZmVycmVkQnVmZmVyLCBieXRlT2Zmc2V0LCBieXRlTGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2FsbFB1bGxJZk5lZWRlZChjb250cm9sbGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckVycm9yKGNvbnRyb2xsZXIsIGUpIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gY29udHJvbGxlci5fY29udHJvbGxlZFJlYWRhYmxlQnl0ZVN0cmVhbTtcbiAgICAgICAgaWYgKHN0cmVhbS5fc3RhdGUgIT09ICdyZWFkYWJsZScpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2xlYXJQZW5kaW5nUHVsbEludG9zKGNvbnRyb2xsZXIpO1xuICAgICAgICBSZXNldFF1ZXVlKGNvbnRyb2xsZXIpO1xuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKGNvbnRyb2xsZXIpO1xuICAgICAgICBSZWFkYWJsZVN0cmVhbUVycm9yKHN0cmVhbSwgZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJHZXRCWU9CUmVxdWVzdChjb250cm9sbGVyKSB7XG4gICAgICAgIGlmIChjb250cm9sbGVyLl9ieW9iUmVxdWVzdCA9PT0gbnVsbCAmJiBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0RGVzY3JpcHRvciA9IGNvbnRyb2xsZXIuX3BlbmRpbmdQdWxsSW50b3MucGVlaygpO1xuICAgICAgICAgICAgY29uc3QgdmlldyA9IG5ldyBVaW50OEFycmF5KGZpcnN0RGVzY3JpcHRvci5idWZmZXIsIGZpcnN0RGVzY3JpcHRvci5ieXRlT2Zmc2V0ICsgZmlyc3REZXNjcmlwdG9yLmJ5dGVzRmlsbGVkLCBmaXJzdERlc2NyaXB0b3IuYnl0ZUxlbmd0aCAtIGZpcnN0RGVzY3JpcHRvci5ieXRlc0ZpbGxlZCk7XG4gICAgICAgICAgICBjb25zdCBieW9iUmVxdWVzdCA9IE9iamVjdC5jcmVhdGUoUmVhZGFibGVTdHJlYW1CWU9CUmVxdWVzdC5wcm90b3R5cGUpO1xuICAgICAgICAgICAgU2V0VXBSZWFkYWJsZVN0cmVhbUJZT0JSZXF1ZXN0KGJ5b2JSZXF1ZXN0LCBjb250cm9sbGVyLCB2aWV3KTtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuX2J5b2JSZXF1ZXN0ID0gYnlvYlJlcXVlc3Q7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRyb2xsZXIuX2J5b2JSZXF1ZXN0O1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyR2V0RGVzaXJlZFNpemUoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRSZWFkYWJsZUJ5dGVTdHJlYW0uX3N0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRyb2xsZXIuX3N0cmF0ZWd5SFdNIC0gY29udHJvbGxlci5fcXVldWVUb3RhbFNpemU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJSZXNwb25kKGNvbnRyb2xsZXIsIGJ5dGVzV3JpdHRlbikge1xuICAgICAgICBjb25zdCBmaXJzdERlc2NyaXB0b3IgPSBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLnBlZWsoKTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgaWYgKHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgaWYgKGJ5dGVzV3JpdHRlbiAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2J5dGVzV3JpdHRlbiBtdXN0IGJlIDAgd2hlbiBjYWxsaW5nIHJlc3BvbmQoKSBvbiBhIGNsb3NlZCBzdHJlYW0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChieXRlc1dyaXR0ZW4gPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdieXRlc1dyaXR0ZW4gbXVzdCBiZSBncmVhdGVyIHRoYW4gMCB3aGVuIGNhbGxpbmcgcmVzcG9uZCgpIG9uIGEgcmVhZGFibGUgc3RyZWFtJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlyc3REZXNjcmlwdG9yLmJ5dGVzRmlsbGVkICsgYnl0ZXNXcml0dGVuID4gZmlyc3REZXNjcmlwdG9yLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignYnl0ZXNXcml0dGVuIG91dCBvZiByYW5nZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpcnN0RGVzY3JpcHRvci5idWZmZXIgPSBUcmFuc2ZlckFycmF5QnVmZmVyKGZpcnN0RGVzY3JpcHRvci5idWZmZXIpO1xuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUmVzcG9uZEludGVybmFsKGNvbnRyb2xsZXIsIGJ5dGVzV3JpdHRlbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJSZXNwb25kV2l0aE5ld1ZpZXcoY29udHJvbGxlciwgdmlldykge1xuICAgICAgICBjb25zdCBmaXJzdERlc2NyaXB0b3IgPSBjb250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLnBlZWsoKTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVCeXRlU3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgaWYgKHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgaWYgKHZpZXcuYnl0ZUxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSB2aWV3XFwncyBsZW5ndGggbXVzdCBiZSAwIHdoZW4gY2FsbGluZyByZXNwb25kV2l0aE5ld1ZpZXcoKSBvbiBhIGNsb3NlZCBzdHJlYW0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh2aWV3LmJ5dGVMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgdmlld1xcJ3MgbGVuZ3RoIG11c3QgYmUgZ3JlYXRlciB0aGFuIDAgd2hlbiBjYWxsaW5nIHJlc3BvbmRXaXRoTmV3VmlldygpIG9uIGEgcmVhZGFibGUgc3RyZWFtJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpcnN0RGVzY3JpcHRvci5ieXRlT2Zmc2V0ICsgZmlyc3REZXNjcmlwdG9yLmJ5dGVzRmlsbGVkICE9PSB2aWV3LmJ5dGVPZmZzZXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgcmVnaW9uIHNwZWNpZmllZCBieSB2aWV3IGRvZXMgbm90IG1hdGNoIGJ5b2JSZXF1ZXN0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpcnN0RGVzY3JpcHRvci5idWZmZXJCeXRlTGVuZ3RoICE9PSB2aWV3LmJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIGJ1ZmZlciBvZiB2aWV3IGhhcyBkaWZmZXJlbnQgY2FwYWNpdHkgdGhhbiBieW9iUmVxdWVzdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaXJzdERlc2NyaXB0b3IuYnl0ZXNGaWxsZWQgKyB2aWV3LmJ5dGVMZW5ndGggPiBmaXJzdERlc2NyaXB0b3IuYnl0ZUxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSByZWdpb24gc3BlY2lmaWVkIGJ5IHZpZXcgaXMgbGFyZ2VyIHRoYW4gYnlvYlJlcXVlc3QnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2aWV3Qnl0ZUxlbmd0aCA9IHZpZXcuYnl0ZUxlbmd0aDtcbiAgICAgICAgZmlyc3REZXNjcmlwdG9yLmJ1ZmZlciA9IFRyYW5zZmVyQXJyYXlCdWZmZXIodmlldy5idWZmZXIpO1xuICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUmVzcG9uZEludGVybmFsKGNvbnRyb2xsZXIsIHZpZXdCeXRlTGVuZ3RoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gU2V0VXBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyKHN0cmVhbSwgY29udHJvbGxlciwgc3RhcnRBbGdvcml0aG0sIHB1bGxBbGdvcml0aG0sIGNhbmNlbEFsZ29yaXRobSwgaGlnaFdhdGVyTWFyaywgYXV0b0FsbG9jYXRlQ2h1bmtTaXplKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRSZWFkYWJsZUJ5dGVTdHJlYW0gPSBzdHJlYW07XG4gICAgICAgIGNvbnRyb2xsZXIuX3B1bGxBZ2FpbiA9IGZhbHNlO1xuICAgICAgICBjb250cm9sbGVyLl9wdWxsaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnRyb2xsZXIuX2J5b2JSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgLy8gTmVlZCB0byBzZXQgdGhlIHNsb3RzIHNvIHRoYXQgdGhlIGFzc2VydCBkb2Vzbid0IGZpcmUuIEluIHRoZSBzcGVjIHRoZSBzbG90cyBhbHJlYWR5IGV4aXN0IGltcGxpY2l0bHkuXG4gICAgICAgIGNvbnRyb2xsZXIuX3F1ZXVlID0gY29udHJvbGxlci5fcXVldWVUb3RhbFNpemUgPSB1bmRlZmluZWQ7XG4gICAgICAgIFJlc2V0UXVldWUoY29udHJvbGxlcik7XG4gICAgICAgIGNvbnRyb2xsZXIuX2Nsb3NlUmVxdWVzdGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnRyb2xsZXIuX3N0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgY29udHJvbGxlci5fc3RyYXRlZ3lIV00gPSBoaWdoV2F0ZXJNYXJrO1xuICAgICAgICBjb250cm9sbGVyLl9wdWxsQWxnb3JpdGhtID0gcHVsbEFsZ29yaXRobTtcbiAgICAgICAgY29udHJvbGxlci5fY2FuY2VsQWxnb3JpdGhtID0gY2FuY2VsQWxnb3JpdGhtO1xuICAgICAgICBjb250cm9sbGVyLl9hdXRvQWxsb2NhdGVDaHVua1NpemUgPSBhdXRvQWxsb2NhdGVDaHVua1NpemU7XG4gICAgICAgIGNvbnRyb2xsZXIuX3BlbmRpbmdQdWxsSW50b3MgPSBuZXcgU2ltcGxlUXVldWUoKTtcbiAgICAgICAgc3RyZWFtLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgICAgICBjb25zdCBzdGFydFJlc3VsdCA9IHN0YXJ0QWxnb3JpdGhtKCk7XG4gICAgICAgIHVwb25Qcm9taXNlKHByb21pc2VSZXNvbHZlZFdpdGgoc3RhcnRSZXN1bHQpLCAoKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sbGVyLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDYWxsUHVsbElmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgICAgICB9LCByID0+IHtcbiAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcihjb250cm9sbGVyLCByKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFNldFVwUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckZyb21VbmRlcmx5aW5nU291cmNlKHN0cmVhbSwgdW5kZXJseWluZ0J5dGVTb3VyY2UsIGhpZ2hXYXRlck1hcmspIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IE9iamVjdC5jcmVhdGUoUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlci5wcm90b3R5cGUpO1xuICAgICAgICBsZXQgc3RhcnRBbGdvcml0aG0gPSAoKSA9PiB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBwdWxsQWxnb3JpdGhtID0gKCkgPT4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICBsZXQgY2FuY2VsQWxnb3JpdGhtID0gKCkgPT4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICBpZiAodW5kZXJseWluZ0J5dGVTb3VyY2Uuc3RhcnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc3RhcnRBbGdvcml0aG0gPSAoKSA9PiB1bmRlcmx5aW5nQnl0ZVNvdXJjZS5zdGFydChjb250cm9sbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodW5kZXJseWluZ0J5dGVTb3VyY2UucHVsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBwdWxsQWxnb3JpdGhtID0gKCkgPT4gdW5kZXJseWluZ0J5dGVTb3VyY2UucHVsbChjb250cm9sbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodW5kZXJseWluZ0J5dGVTb3VyY2UuY2FuY2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNhbmNlbEFsZ29yaXRobSA9IHJlYXNvbiA9PiB1bmRlcmx5aW5nQnl0ZVNvdXJjZS5jYW5jZWwocmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdXRvQWxsb2NhdGVDaHVua1NpemUgPSB1bmRlcmx5aW5nQnl0ZVNvdXJjZS5hdXRvQWxsb2NhdGVDaHVua1NpemU7XG4gICAgICAgIGlmIChhdXRvQWxsb2NhdGVDaHVua1NpemUgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2F1dG9BbGxvY2F0ZUNodW5rU2l6ZSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiAwJyk7XG4gICAgICAgIH1cbiAgICAgICAgU2V0VXBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyKHN0cmVhbSwgY29udHJvbGxlciwgc3RhcnRBbGdvcml0aG0sIHB1bGxBbGdvcml0aG0sIGNhbmNlbEFsZ29yaXRobSwgaGlnaFdhdGVyTWFyaywgYXV0b0FsbG9jYXRlQ2h1bmtTaXplKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gU2V0VXBSZWFkYWJsZVN0cmVhbUJZT0JSZXF1ZXN0KHJlcXVlc3QsIGNvbnRyb2xsZXIsIHZpZXcpIHtcbiAgICAgICAgcmVxdWVzdC5fYXNzb2NpYXRlZFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgICAgICByZXF1ZXN0Ll92aWV3ID0gdmlldztcbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFJlYWRhYmxlU3RyZWFtQllPQlJlcXVlc3QuXG4gICAgZnVuY3Rpb24gYnlvYlJlcXVlc3RCcmFuZENoZWNrRXhjZXB0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYFJlYWRhYmxlU3RyZWFtQllPQlJlcXVlc3QucHJvdG90eXBlLiR7bmFtZX0gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIFJlYWRhYmxlU3RyZWFtQllPQlJlcXVlc3RgKTtcbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIuXG4gICAgZnVuY3Rpb24gYnl0ZVN0cmVhbUNvbnRyb2xsZXJCcmFuZENoZWNrRXhjZXB0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIucHJvdG90eXBlLiR7bmFtZX0gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJgKTtcbiAgICB9XG5cbiAgICAvLyBBYnN0cmFjdCBvcGVyYXRpb25zIGZvciB0aGUgUmVhZGFibGVTdHJlYW0uXG4gICAgZnVuY3Rpb24gQWNxdWlyZVJlYWRhYmxlU3RyZWFtQllPQlJlYWRlcihzdHJlYW0pIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIoc3RyZWFtKTtcbiAgICB9XG4gICAgLy8gUmVhZGFibGVTdHJlYW0gQVBJIGV4cG9zZWQgZm9yIGNvbnRyb2xsZXJzLlxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtQWRkUmVhZEludG9SZXF1ZXN0KHN0cmVhbSwgcmVhZEludG9SZXF1ZXN0KSB7XG4gICAgICAgIHN0cmVhbS5fcmVhZGVyLl9yZWFkSW50b1JlcXVlc3RzLnB1c2gocmVhZEludG9SZXF1ZXN0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1GdWxmaWxsUmVhZEludG9SZXF1ZXN0KHN0cmVhbSwgY2h1bmssIGRvbmUpIHtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gc3RyZWFtLl9yZWFkZXI7XG4gICAgICAgIGNvbnN0IHJlYWRJbnRvUmVxdWVzdCA9IHJlYWRlci5fcmVhZEludG9SZXF1ZXN0cy5zaGlmdCgpO1xuICAgICAgICBpZiAoZG9uZSkge1xuICAgICAgICAgICAgcmVhZEludG9SZXF1ZXN0Ll9jbG9zZVN0ZXBzKGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlYWRJbnRvUmVxdWVzdC5fY2h1bmtTdGVwcyhjaHVuayk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1HZXROdW1SZWFkSW50b1JlcXVlc3RzKHN0cmVhbSkge1xuICAgICAgICByZXR1cm4gc3RyZWFtLl9yZWFkZXIuX3JlYWRJbnRvUmVxdWVzdHMubGVuZ3RoO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZVN0cmVhbUhhc0JZT0JSZWFkZXIoc3RyZWFtKSB7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHN0cmVhbS5fcmVhZGVyO1xuICAgICAgICBpZiAocmVhZGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW1CWU9CUmVhZGVyKHJlYWRlcikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQSBCWU9CIHJlYWRlciB2ZW5kZWQgYnkgYSB7QGxpbmsgUmVhZGFibGVTdHJlYW19LlxuICAgICAqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGNsYXNzIFJlYWRhYmxlU3RyZWFtQllPQlJlYWRlciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKHN0cmVhbSkge1xuICAgICAgICAgICAgYXNzZXJ0UmVxdWlyZWRBcmd1bWVudChzdHJlYW0sIDEsICdSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXInKTtcbiAgICAgICAgICAgIGFzc2VydFJlYWRhYmxlU3RyZWFtKHN0cmVhbSwgJ0ZpcnN0IHBhcmFtZXRlcicpO1xuICAgICAgICAgICAgaWYgKElzUmVhZGFibGVTdHJlYW1Mb2NrZWQoc3RyZWFtKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoaXMgc3RyZWFtIGhhcyBhbHJlYWR5IGJlZW4gbG9ja2VkIGZvciBleGNsdXNpdmUgcmVhZGluZyBieSBhbm90aGVyIHJlYWRlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIoc3RyZWFtLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnN0cnVjdCBhIFJlYWRhYmxlU3RyZWFtQllPQlJlYWRlciBmb3IgYSBzdHJlYW0gbm90IGNvbnN0cnVjdGVkIHdpdGggYSBieXRlICcgK1xuICAgICAgICAgICAgICAgICAgICAnc291cmNlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBSZWFkYWJsZVN0cmVhbVJlYWRlckdlbmVyaWNJbml0aWFsaXplKHRoaXMsIHN0cmVhbSk7XG4gICAgICAgICAgICB0aGlzLl9yZWFkSW50b1JlcXVlc3RzID0gbmV3IFNpbXBsZVF1ZXVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBmdWxmaWxsZWQgd2hlbiB0aGUgc3RyZWFtIGJlY29tZXMgY2xvc2VkLCBvciByZWplY3RlZCBpZiB0aGUgc3RyZWFtIGV2ZXIgZXJyb3JzIG9yXG4gICAgICAgICAqIHRoZSByZWFkZXIncyBsb2NrIGlzIHJlbGVhc2VkIGJlZm9yZSB0aGUgc3RyZWFtIGZpbmlzaGVzIGNsb3NpbmcuXG4gICAgICAgICAqL1xuICAgICAgICBnZXQgY2xvc2VkKCkge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtQllPQlJlYWRlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKGJ5b2JSZWFkZXJCcmFuZENoZWNrRXhjZXB0aW9uKCdjbG9zZWQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xvc2VkUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgdGhlIHJlYWRlciBpcyBhY3RpdmUsIGJlaGF2ZXMgdGhlIHNhbWUgYXMge0BsaW5rIFJlYWRhYmxlU3RyZWFtLmNhbmNlbCB8IHN0cmVhbS5jYW5jZWwocmVhc29uKX0uXG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWwocmVhc29uID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW1CWU9CUmVhZGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoYnlvYlJlYWRlckJyYW5kQ2hlY2tFeGNlcHRpb24oJ2NhbmNlbCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChyZWFkZXJMb2NrRXhjZXB0aW9uKCdjYW5jZWwnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhZGFibGVTdHJlYW1SZWFkZXJHZW5lcmljQ2FuY2VsKHRoaXMsIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEF0dGVtcHRzIHRvIHJlYWRzIGJ5dGVzIGludG8gdmlldywgYW5kIHJldHVybnMgYSBwcm9taXNlIHJlc29sdmVkIHdpdGggdGhlIHJlc3VsdC5cbiAgICAgICAgICpcbiAgICAgICAgICogSWYgcmVhZGluZyBhIGNodW5rIGNhdXNlcyB0aGUgcXVldWUgdG8gYmVjb21lIGVtcHR5LCBtb3JlIGRhdGEgd2lsbCBiZSBwdWxsZWQgZnJvbSB0aGUgdW5kZXJseWluZyBzb3VyY2UuXG4gICAgICAgICAqL1xuICAgICAgICByZWFkKHZpZXcpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChieW9iUmVhZGVyQnJhbmRDaGVja0V4Y2VwdGlvbigncmVhZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghQXJyYXlCdWZmZXIuaXNWaWV3KHZpZXcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgobmV3IFR5cGVFcnJvcigndmlldyBtdXN0IGJlIGFuIGFycmF5IGJ1ZmZlciB2aWV3JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZpZXcuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKG5ldyBUeXBlRXJyb3IoJ3ZpZXcgbXVzdCBoYXZlIG5vbi16ZXJvIGJ5dGVMZW5ndGgnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmlldy5idWZmZXIuYnl0ZUxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKG5ldyBUeXBlRXJyb3IoYHZpZXcncyBidWZmZXIgbXVzdCBoYXZlIG5vbi16ZXJvIGJ5dGVMZW5ndGhgKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoSXNEZXRhY2hlZEJ1ZmZlcih2aWV3LmJ1ZmZlcikpIDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChyZWFkZXJMb2NrRXhjZXB0aW9uKCdyZWFkIGZyb20nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgcmVzb2x2ZVByb21pc2U7XG4gICAgICAgICAgICBsZXQgcmVqZWN0UHJvbWlzZTtcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXdQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gICAgICAgICAgICAgICAgcmVqZWN0UHJvbWlzZSA9IHJlamVjdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVhZEludG9SZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgIF9jaHVua1N0ZXBzOiBjaHVuayA9PiByZXNvbHZlUHJvbWlzZSh7IHZhbHVlOiBjaHVuaywgZG9uZTogZmFsc2UgfSksXG4gICAgICAgICAgICAgICAgX2Nsb3NlU3RlcHM6IGNodW5rID0+IHJlc29sdmVQcm9taXNlKHsgdmFsdWU6IGNodW5rLCBkb25lOiB0cnVlIH0pLFxuICAgICAgICAgICAgICAgIF9lcnJvclN0ZXBzOiBlID0+IHJlamVjdFByb21pc2UoZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXJSZWFkKHRoaXMsIHZpZXcsIHJlYWRJbnRvUmVxdWVzdCk7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogUmVsZWFzZXMgdGhlIHJlYWRlcidzIGxvY2sgb24gdGhlIGNvcnJlc3BvbmRpbmcgc3RyZWFtLiBBZnRlciB0aGUgbG9jayBpcyByZWxlYXNlZCwgdGhlIHJlYWRlciBpcyBubyBsb25nZXIgYWN0aXZlLlxuICAgICAgICAgKiBJZiB0aGUgYXNzb2NpYXRlZCBzdHJlYW0gaXMgZXJyb3JlZCB3aGVuIHRoZSBsb2NrIGlzIHJlbGVhc2VkLCB0aGUgcmVhZGVyIHdpbGwgYXBwZWFyIGVycm9yZWQgaW4gdGhlIHNhbWUgd2F5XG4gICAgICAgICAqIGZyb20gbm93IG9uOyBvdGhlcndpc2UsIHRoZSByZWFkZXIgd2lsbCBhcHBlYXIgY2xvc2VkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBBIHJlYWRlcidzIGxvY2sgY2Fubm90IGJlIHJlbGVhc2VkIHdoaWxlIGl0IHN0aWxsIGhhcyBhIHBlbmRpbmcgcmVhZCByZXF1ZXN0LCBpLmUuLCBpZiBhIHByb21pc2UgcmV0dXJuZWQgYnlcbiAgICAgICAgICogdGhlIHJlYWRlcidzIHtAbGluayBSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIucmVhZCB8IHJlYWQoKX0gbWV0aG9kIGhhcyBub3QgeWV0IGJlZW4gc2V0dGxlZC4gQXR0ZW1wdGluZyB0b1xuICAgICAgICAgKiBkbyBzbyB3aWxsIHRocm93IGEgYFR5cGVFcnJvcmAgYW5kIGxlYXZlIHRoZSByZWFkZXIgbG9ja2VkIHRvIHRoZSBzdHJlYW0uXG4gICAgICAgICAqL1xuICAgICAgICByZWxlYXNlTG9jaygpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBieW9iUmVhZGVyQnJhbmRDaGVja0V4Y2VwdGlvbigncmVsZWFzZUxvY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9vd25lclJlYWRhYmxlU3RyZWFtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fcmVhZEludG9SZXF1ZXN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVHJpZWQgdG8gcmVsZWFzZSBhIHJlYWRlciBsb2NrIHdoZW4gdGhhdCByZWFkZXIgaGFzIHBlbmRpbmcgcmVhZCgpIGNhbGxzIHVuLXNldHRsZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtUmVhZGVyR2VuZXJpY1JlbGVhc2UodGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUmVhZGFibGVTdHJlYW1CWU9CUmVhZGVyLnByb3RvdHlwZSwge1xuICAgICAgICBjYW5jZWw6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICByZWFkOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgcmVsZWFzZUxvY2s6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICBjbG9zZWQ6IHsgZW51bWVyYWJsZTogdHJ1ZSB9XG4gICAgfSk7XG4gICAgaWYgKHR5cGVvZiBTeW1ib2xQb2x5ZmlsbC50b1N0cmluZ1RhZyA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlYWRhYmxlU3RyZWFtQllPQlJlYWRlci5wcm90b3R5cGUsIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ1JlYWRhYmxlU3RyZWFtQllPQlJlYWRlcicsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEFic3RyYWN0IG9wZXJhdGlvbnMgZm9yIHRoZSByZWFkZXJzLlxuICAgIGZ1bmN0aW9uIElzUmVhZGFibGVTdHJlYW1CWU9CUmVhZGVyKHgpIHtcbiAgICAgICAgaWYgKCF0eXBlSXNPYmplY3QoeCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX3JlYWRJbnRvUmVxdWVzdHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW1CWU9CUmVhZGVyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXJSZWFkKHJlYWRlciwgdmlldywgcmVhZEludG9SZXF1ZXN0KSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IHJlYWRlci5fb3duZXJSZWFkYWJsZVN0cmVhbTtcbiAgICAgICAgc3RyZWFtLl9kaXN0dXJiZWQgPSB0cnVlO1xuICAgICAgICBpZiAoc3RyZWFtLl9zdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgICByZWFkSW50b1JlcXVlc3QuX2Vycm9yU3RlcHMoc3RyZWFtLl9zdG9yZWRFcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUHVsbEludG8oc3RyZWFtLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIHZpZXcsIHJlYWRJbnRvUmVxdWVzdCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFJlYWRhYmxlU3RyZWFtQllPQlJlYWRlci5cbiAgICBmdW5jdGlvbiBieW9iUmVhZGVyQnJhbmRDaGVja0V4Y2VwdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKGBSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIucHJvdG90eXBlLiR7bmFtZX0gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIFJlYWRhYmxlU3RyZWFtQllPQlJlYWRlcmApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIEV4dHJhY3RIaWdoV2F0ZXJNYXJrKHN0cmF0ZWd5LCBkZWZhdWx0SFdNKSB7XG4gICAgICAgIGNvbnN0IHsgaGlnaFdhdGVyTWFyayB9ID0gc3RyYXRlZ3k7XG4gICAgICAgIGlmIChoaWdoV2F0ZXJNYXJrID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZhdWx0SFdNO1xuICAgICAgICB9XG4gICAgICAgIGlmIChOdW1iZXJJc05hTihoaWdoV2F0ZXJNYXJrKSB8fCBoaWdoV2F0ZXJNYXJrIDwgMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgaGlnaFdhdGVyTWFyaycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoaWdoV2F0ZXJNYXJrO1xuICAgIH1cbiAgICBmdW5jdGlvbiBFeHRyYWN0U2l6ZUFsZ29yaXRobShzdHJhdGVneSkge1xuICAgICAgICBjb25zdCB7IHNpemUgfSA9IHN0cmF0ZWd5O1xuICAgICAgICBpZiAoIXNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzaXplO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnZlcnRRdWV1aW5nU3RyYXRlZ3koaW5pdCwgY29udGV4dCkge1xuICAgICAgICBhc3NlcnREaWN0aW9uYXJ5KGluaXQsIGNvbnRleHQpO1xuICAgICAgICBjb25zdCBoaWdoV2F0ZXJNYXJrID0gaW5pdCA9PT0gbnVsbCB8fCBpbml0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBpbml0LmhpZ2hXYXRlck1hcms7XG4gICAgICAgIGNvbnN0IHNpemUgPSBpbml0ID09PSBudWxsIHx8IGluaXQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGluaXQuc2l6ZTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhpZ2hXYXRlck1hcms6IGhpZ2hXYXRlck1hcmsgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGNvbnZlcnRVbnJlc3RyaWN0ZWREb3VibGUoaGlnaFdhdGVyTWFyayksXG4gICAgICAgICAgICBzaXplOiBzaXplID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBjb252ZXJ0UXVldWluZ1N0cmF0ZWd5U2l6ZShzaXplLCBgJHtjb250ZXh0fSBoYXMgbWVtYmVyICdzaXplJyB0aGF0YClcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydFF1ZXVpbmdTdHJhdGVneVNpemUoZm4sIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RnVuY3Rpb24oZm4sIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gY2h1bmsgPT4gY29udmVydFVucmVzdHJpY3RlZERvdWJsZShmbihjaHVuaykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnZlcnRVbmRlcmx5aW5nU2luayhvcmlnaW5hbCwgY29udGV4dCkge1xuICAgICAgICBhc3NlcnREaWN0aW9uYXJ5KG9yaWdpbmFsLCBjb250ZXh0KTtcbiAgICAgICAgY29uc3QgYWJvcnQgPSBvcmlnaW5hbCA9PT0gbnVsbCB8fCBvcmlnaW5hbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3JpZ2luYWwuYWJvcnQ7XG4gICAgICAgIGNvbnN0IGNsb3NlID0gb3JpZ2luYWwgPT09IG51bGwgfHwgb3JpZ2luYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9yaWdpbmFsLmNsb3NlO1xuICAgICAgICBjb25zdCBzdGFydCA9IG9yaWdpbmFsID09PSBudWxsIHx8IG9yaWdpbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnaW5hbC5zdGFydDtcbiAgICAgICAgY29uc3QgdHlwZSA9IG9yaWdpbmFsID09PSBudWxsIHx8IG9yaWdpbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnaW5hbC50eXBlO1xuICAgICAgICBjb25zdCB3cml0ZSA9IG9yaWdpbmFsID09PSBudWxsIHx8IG9yaWdpbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnaW5hbC53cml0ZTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFib3J0OiBhYm9ydCA9PT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgICAgICB1bmRlZmluZWQgOlxuICAgICAgICAgICAgICAgIGNvbnZlcnRVbmRlcmx5aW5nU2lua0Fib3J0Q2FsbGJhY2soYWJvcnQsIG9yaWdpbmFsLCBgJHtjb250ZXh0fSBoYXMgbWVtYmVyICdhYm9ydCcgdGhhdGApLFxuICAgICAgICAgICAgY2xvc2U6IGNsb3NlID09PSB1bmRlZmluZWQgP1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgICAgICAgY29udmVydFVuZGVybHlpbmdTaW5rQ2xvc2VDYWxsYmFjayhjbG9zZSwgb3JpZ2luYWwsIGAke2NvbnRleHR9IGhhcyBtZW1iZXIgJ2Nsb3NlJyB0aGF0YCksXG4gICAgICAgICAgICBzdGFydDogc3RhcnQgPT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgICAgICAgICBjb252ZXJ0VW5kZXJseWluZ1NpbmtTdGFydENhbGxiYWNrKHN0YXJ0LCBvcmlnaW5hbCwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAnc3RhcnQnIHRoYXRgKSxcbiAgICAgICAgICAgIHdyaXRlOiB3cml0ZSA9PT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgICAgICB1bmRlZmluZWQgOlxuICAgICAgICAgICAgICAgIGNvbnZlcnRVbmRlcmx5aW5nU2lua1dyaXRlQ2FsbGJhY2sod3JpdGUsIG9yaWdpbmFsLCBgJHtjb250ZXh0fSBoYXMgbWVtYmVyICd3cml0ZScgdGhhdGApLFxuICAgICAgICAgICAgdHlwZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb252ZXJ0VW5kZXJseWluZ1NpbmtBYm9ydENhbGxiYWNrKGZuLCBvcmlnaW5hbCwgY29udGV4dCkge1xuICAgICAgICBhc3NlcnRGdW5jdGlvbihmbiwgY29udGV4dCk7XG4gICAgICAgIHJldHVybiAocmVhc29uKSA9PiBwcm9taXNlQ2FsbChmbiwgb3JpZ2luYWwsIFtyZWFzb25dKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydFVuZGVybHlpbmdTaW5rQ2xvc2VDYWxsYmFjayhmbiwgb3JpZ2luYWwsIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RnVuY3Rpb24oZm4sIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gKCkgPT4gcHJvbWlzZUNhbGwoZm4sIG9yaWdpbmFsLCBbXSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbnZlcnRVbmRlcmx5aW5nU2lua1N0YXJ0Q2FsbGJhY2soZm4sIG9yaWdpbmFsLCBjb250ZXh0KSB7XG4gICAgICAgIGFzc2VydEZ1bmN0aW9uKGZuLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIChjb250cm9sbGVyKSA9PiByZWZsZWN0Q2FsbChmbiwgb3JpZ2luYWwsIFtjb250cm9sbGVyXSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbnZlcnRVbmRlcmx5aW5nU2lua1dyaXRlQ2FsbGJhY2soZm4sIG9yaWdpbmFsLCBjb250ZXh0KSB7XG4gICAgICAgIGFzc2VydEZ1bmN0aW9uKGZuLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIChjaHVuaywgY29udHJvbGxlcikgPT4gcHJvbWlzZUNhbGwoZm4sIG9yaWdpbmFsLCBbY2h1bmssIGNvbnRyb2xsZXJdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc3NlcnRXcml0YWJsZVN0cmVhbSh4LCBjb250ZXh0KSB7XG4gICAgICAgIGlmICghSXNXcml0YWJsZVN0cmVhbSh4KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHtjb250ZXh0fSBpcyBub3QgYSBXcml0YWJsZVN0cmVhbS5gKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQWJvcnRTaWduYWwodmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZS5hYm9ydGVkID09PSAnYm9vbGVhbic7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKF9hKSB7XG4gICAgICAgICAgICAvLyBBYm9ydFNpZ25hbC5wcm90b3R5cGUuYWJvcnRlZCB0aHJvd3MgaWYgaXRzIGJyYW5kIGNoZWNrIGZhaWxzXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc3VwcG9ydHNBYm9ydENvbnRyb2xsZXIgPSB0eXBlb2YgQWJvcnRDb250cm9sbGVyID09PSAnZnVuY3Rpb24nO1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIG5ldyBBYm9ydENvbnRyb2xsZXIsIGlmIHN1cHBvcnRlZCBieSB0aGUgcGxhdGZvcm0uXG4gICAgICpcbiAgICAgKiBAaW50ZXJuYWxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVBYm9ydENvbnRyb2xsZXIoKSB7XG4gICAgICAgIGlmIChzdXBwb3J0c0Fib3J0Q29udHJvbGxlcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgd3JpdGFibGUgc3RyZWFtIHJlcHJlc2VudHMgYSBkZXN0aW5hdGlvbiBmb3IgZGF0YSwgaW50byB3aGljaCB5b3UgY2FuIHdyaXRlLlxuICAgICAqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGNsYXNzIFdyaXRhYmxlU3RyZWFtIHtcbiAgICAgICAgY29uc3RydWN0b3IocmF3VW5kZXJseWluZ1NpbmsgPSB7fSwgcmF3U3RyYXRlZ3kgPSB7fSkge1xuICAgICAgICAgICAgaWYgKHJhd1VuZGVybHlpbmdTaW5rID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByYXdVbmRlcmx5aW5nU2luayA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhc3NlcnRPYmplY3QocmF3VW5kZXJseWluZ1NpbmssICdGaXJzdCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gY29udmVydFF1ZXVpbmdTdHJhdGVneShyYXdTdHJhdGVneSwgJ1NlY29uZCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIGNvbnN0IHVuZGVybHlpbmdTaW5rID0gY29udmVydFVuZGVybHlpbmdTaW5rKHJhd1VuZGVybHlpbmdTaW5rLCAnRmlyc3QgcGFyYW1ldGVyJyk7XG4gICAgICAgICAgICBJbml0aWFsaXplV3JpdGFibGVTdHJlYW0odGhpcyk7XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gdW5kZXJseWluZ1NpbmsudHlwZTtcbiAgICAgICAgICAgIGlmICh0eXBlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCB0eXBlIGlzIHNwZWNpZmllZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc2l6ZUFsZ29yaXRobSA9IEV4dHJhY3RTaXplQWxnb3JpdGhtKHN0cmF0ZWd5KTtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2hXYXRlck1hcmsgPSBFeHRyYWN0SGlnaFdhdGVyTWFyayhzdHJhdGVneSwgMSk7XG4gICAgICAgICAgICBTZXRVcFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJGcm9tVW5kZXJseWluZ1NpbmsodGhpcywgdW5kZXJseWluZ1NpbmssIGhpZ2hXYXRlck1hcmssIHNpemVBbGdvcml0aG0pO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB3cml0YWJsZSBzdHJlYW0gaXMgbG9ja2VkIHRvIGEgd3JpdGVyLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0IGxvY2tlZCgpIHtcbiAgICAgICAgICAgIGlmICghSXNXcml0YWJsZVN0cmVhbSh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IHN0cmVhbUJyYW5kQ2hlY2tFeGNlcHRpb24kMignbG9ja2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gSXNXcml0YWJsZVN0cmVhbUxvY2tlZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQWJvcnRzIHRoZSBzdHJlYW0sIHNpZ25hbGluZyB0aGF0IHRoZSBwcm9kdWNlciBjYW4gbm8gbG9uZ2VyIHN1Y2Nlc3NmdWxseSB3cml0ZSB0byB0aGUgc3RyZWFtIGFuZCBpdCBpcyB0byBiZVxuICAgICAgICAgKiBpbW1lZGlhdGVseSBtb3ZlZCB0byBhbiBlcnJvcmVkIHN0YXRlLCB3aXRoIGFueSBxdWV1ZWQtdXAgd3JpdGVzIGRpc2NhcmRlZC4gVGhpcyB3aWxsIGFsc28gZXhlY3V0ZSBhbnkgYWJvcnRcbiAgICAgICAgICogbWVjaGFuaXNtIG9mIHRoZSB1bmRlcmx5aW5nIHNpbmsuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSByZXR1cm5lZCBwcm9taXNlIHdpbGwgZnVsZmlsbCBpZiB0aGUgc3RyZWFtIHNodXRzIGRvd24gc3VjY2Vzc2Z1bGx5LCBvciByZWplY3QgaWYgdGhlIHVuZGVybHlpbmcgc2luayBzaWduYWxlZFxuICAgICAgICAgKiB0aGF0IHRoZXJlIHdhcyBhbiBlcnJvciBkb2luZyBzby4gQWRkaXRpb25hbGx5LCBpdCB3aWxsIHJlamVjdCB3aXRoIGEgYFR5cGVFcnJvcmAgKHdpdGhvdXQgYXR0ZW1wdGluZyB0byBjYW5jZWxcbiAgICAgICAgICogdGhlIHN0cmVhbSkgaWYgdGhlIHN0cmVhbSBpcyBjdXJyZW50bHkgbG9ja2VkLlxuICAgICAgICAgKi9cbiAgICAgICAgYWJvcnQocmVhc29uID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIUlzV3JpdGFibGVTdHJlYW0odGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChzdHJlYW1CcmFuZENoZWNrRXhjZXB0aW9uJDIoJ2Fib3J0JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKElzV3JpdGFibGVTdHJlYW1Mb2NrZWQodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChuZXcgVHlwZUVycm9yKCdDYW5ub3QgYWJvcnQgYSBzdHJlYW0gdGhhdCBhbHJlYWR5IGhhcyBhIHdyaXRlcicpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBXcml0YWJsZVN0cmVhbUFib3J0KHRoaXMsIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsb3NlcyB0aGUgc3RyZWFtLiBUaGUgdW5kZXJseWluZyBzaW5rIHdpbGwgZmluaXNoIHByb2Nlc3NpbmcgYW55IHByZXZpb3VzbHktd3JpdHRlbiBjaHVua3MsIGJlZm9yZSBpbnZva2luZyBpdHNcbiAgICAgICAgICogY2xvc2UgYmVoYXZpb3IuIER1cmluZyB0aGlzIHRpbWUgYW55IGZ1cnRoZXIgYXR0ZW1wdHMgdG8gd3JpdGUgd2lsbCBmYWlsICh3aXRob3V0IGVycm9yaW5nIHRoZSBzdHJlYW0pLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgbWV0aG9kIHJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBmdWxmaWxsIGlmIGFsbCByZW1haW5pbmcgY2h1bmtzIGFyZSBzdWNjZXNzZnVsbHkgd3JpdHRlbiBhbmQgdGhlIHN0cmVhbVxuICAgICAgICAgKiBzdWNjZXNzZnVsbHkgY2xvc2VzLCBvciByZWplY3RzIGlmIGFuIGVycm9yIGlzIGVuY291bnRlcmVkIGR1cmluZyB0aGlzIHByb2Nlc3MuIEFkZGl0aW9uYWxseSwgaXQgd2lsbCByZWplY3Qgd2l0aFxuICAgICAgICAgKiBhIGBUeXBlRXJyb3JgICh3aXRob3V0IGF0dGVtcHRpbmcgdG8gY2FuY2VsIHRoZSBzdHJlYW0pIGlmIHRoZSBzdHJlYW0gaXMgY3VycmVudGx5IGxvY2tlZC5cbiAgICAgICAgICovXG4gICAgICAgIGNsb3NlKCkge1xuICAgICAgICAgICAgaWYgKCFJc1dyaXRhYmxlU3RyZWFtKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbiQyKCdjbG9zZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc1dyaXRhYmxlU3RyZWFtTG9ja2VkKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgobmV3IFR5cGVFcnJvcignQ2Fubm90IGNsb3NlIGEgc3RyZWFtIHRoYXQgYWxyZWFkeSBoYXMgYSB3cml0ZXInKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoV3JpdGFibGVTdHJlYW1DbG9zZVF1ZXVlZE9ySW5GbGlnaHQodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2xvc2UgYW4gYWxyZWFkeS1jbG9zaW5nIHN0cmVhbScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBXcml0YWJsZVN0cmVhbUNsb3NlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDcmVhdGVzIGEge0BsaW5rIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlciB8IHdyaXRlcn0gYW5kIGxvY2tzIHRoZSBzdHJlYW0gdG8gdGhlIG5ldyB3cml0ZXIuIFdoaWxlIHRoZSBzdHJlYW1cbiAgICAgICAgICogaXMgbG9ja2VkLCBubyBvdGhlciB3cml0ZXIgY2FuIGJlIGFjcXVpcmVkIHVudGlsIHRoaXMgb25lIGlzIHJlbGVhc2VkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgZXNwZWNpYWxseSB1c2VmdWwgZm9yIGNyZWF0aW5nIGFic3RyYWN0aW9ucyB0aGF0IGRlc2lyZSB0aGUgYWJpbGl0eSB0byB3cml0ZSB0byBhIHN0cmVhbVxuICAgICAgICAgKiB3aXRob3V0IGludGVycnVwdGlvbiBvciBpbnRlcmxlYXZpbmcuIEJ5IGdldHRpbmcgYSB3cml0ZXIgZm9yIHRoZSBzdHJlYW0sIHlvdSBjYW4gZW5zdXJlIG5vYm9keSBlbHNlIGNhbiB3cml0ZSBhdFxuICAgICAgICAgKiB0aGUgc2FtZSB0aW1lLCB3aGljaCB3b3VsZCBjYXVzZSB0aGUgcmVzdWx0aW5nIHdyaXR0ZW4gZGF0YSB0byBiZSB1bnByZWRpY3RhYmxlIGFuZCBwcm9iYWJseSB1c2VsZXNzLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0V3JpdGVyKCkge1xuICAgICAgICAgICAgaWYgKCFJc1dyaXRhYmxlU3RyZWFtKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbiQyKCdnZXRXcml0ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBBY3F1aXJlV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFdyaXRhYmxlU3RyZWFtLnByb3RvdHlwZSwge1xuICAgICAgICBhYm9ydDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIGNsb3NlOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgZ2V0V3JpdGVyOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgbG9ja2VkOiB7IGVudW1lcmFibGU6IHRydWUgfVxuICAgIH0pO1xuICAgIGlmICh0eXBlb2YgU3ltYm9sUG9seWZpbGwudG9TdHJpbmdUYWcgPT09ICdzeW1ib2wnKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXcml0YWJsZVN0cmVhbS5wcm90b3R5cGUsIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ1dyaXRhYmxlU3RyZWFtJyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gQWJzdHJhY3Qgb3BlcmF0aW9ucyBmb3IgdGhlIFdyaXRhYmxlU3RyZWFtLlxuICAgIGZ1bmN0aW9uIEFjcXVpcmVXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXIoc3RyZWFtKSB7XG4gICAgICAgIHJldHVybiBuZXcgV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyKHN0cmVhbSk7XG4gICAgfVxuICAgIC8vIFRocm93cyBpZiBhbmQgb25seSBpZiBzdGFydEFsZ29yaXRobSB0aHJvd3MuXG4gICAgZnVuY3Rpb24gQ3JlYXRlV3JpdGFibGVTdHJlYW0oc3RhcnRBbGdvcml0aG0sIHdyaXRlQWxnb3JpdGhtLCBjbG9zZUFsZ29yaXRobSwgYWJvcnRBbGdvcml0aG0sIGhpZ2hXYXRlck1hcmsgPSAxLCBzaXplQWxnb3JpdGhtID0gKCkgPT4gMSkge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBPYmplY3QuY3JlYXRlKFdyaXRhYmxlU3RyZWFtLnByb3RvdHlwZSk7XG4gICAgICAgIEluaXRpYWxpemVXcml0YWJsZVN0cmVhbShzdHJlYW0pO1xuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gT2JqZWN0LmNyZWF0ZShXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSk7XG4gICAgICAgIFNldFVwV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcihzdHJlYW0sIGNvbnRyb2xsZXIsIHN0YXJ0QWxnb3JpdGhtLCB3cml0ZUFsZ29yaXRobSwgY2xvc2VBbGdvcml0aG0sIGFib3J0QWxnb3JpdGhtLCBoaWdoV2F0ZXJNYXJrLCBzaXplQWxnb3JpdGhtKTtcbiAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gSW5pdGlhbGl6ZVdyaXRhYmxlU3RyZWFtKHN0cmVhbSkge1xuICAgICAgICBzdHJlYW0uX3N0YXRlID0gJ3dyaXRhYmxlJztcbiAgICAgICAgLy8gVGhlIGVycm9yIHRoYXQgd2lsbCBiZSByZXBvcnRlZCBieSBuZXcgbWV0aG9kIGNhbGxzIG9uY2UgdGhlIHN0YXRlIGJlY29tZXMgZXJyb3JlZC4gT25seSBzZXQgd2hlbiBbW3N0YXRlXV0gaXNcbiAgICAgICAgLy8gJ2Vycm9yaW5nJyBvciAnZXJyb3JlZCcuIE1heSBiZSBzZXQgdG8gYW4gdW5kZWZpbmVkIHZhbHVlLlxuICAgICAgICBzdHJlYW0uX3N0b3JlZEVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICBzdHJlYW0uX3dyaXRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSB0byB1bmRlZmluZWQgZmlyc3QgYmVjYXVzZSB0aGUgY29uc3RydWN0b3Igb2YgdGhlIGNvbnRyb2xsZXIgY2hlY2tzIHRoaXNcbiAgICAgICAgLy8gdmFyaWFibGUgdG8gdmFsaWRhdGUgdGhlIGNhbGxlci5cbiAgICAgICAgc3RyZWFtLl93cml0YWJsZVN0cmVhbUNvbnRyb2xsZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIC8vIFRoaXMgcXVldWUgaXMgcGxhY2VkIGhlcmUgaW5zdGVhZCBvZiB0aGUgd3JpdGVyIGNsYXNzIGluIG9yZGVyIHRvIGFsbG93IGZvciBwYXNzaW5nIGEgd3JpdGVyIHRvIHRoZSBuZXh0IGRhdGFcbiAgICAgICAgLy8gcHJvZHVjZXIgd2l0aG91dCB3YWl0aW5nIGZvciB0aGUgcXVldWVkIHdyaXRlcyB0byBmaW5pc2guXG4gICAgICAgIHN0cmVhbS5fd3JpdGVSZXF1ZXN0cyA9IG5ldyBTaW1wbGVRdWV1ZSgpO1xuICAgICAgICAvLyBXcml0ZSByZXF1ZXN0cyBhcmUgcmVtb3ZlZCBmcm9tIF93cml0ZVJlcXVlc3RzIHdoZW4gd3JpdGUoKSBpcyBjYWxsZWQgb24gdGhlIHVuZGVybHlpbmcgc2luay4gVGhpcyBwcmV2ZW50c1xuICAgICAgICAvLyB0aGVtIGZyb20gYmVpbmcgZXJyb25lb3VzbHkgcmVqZWN0ZWQgb24gZXJyb3IuIElmIGEgd3JpdGUoKSBjYWxsIGlzIGluLWZsaWdodCwgdGhlIHJlcXVlc3QgaXMgc3RvcmVkIGhlcmUuXG4gICAgICAgIHN0cmVhbS5faW5GbGlnaHRXcml0ZVJlcXVlc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIC8vIFRoZSBwcm9taXNlIHRoYXQgd2FzIHJldHVybmVkIGZyb20gd3JpdGVyLmNsb3NlKCkuIFN0b3JlZCBoZXJlIGJlY2F1c2UgaXQgbWF5IGJlIGZ1bGZpbGxlZCBhZnRlciB0aGUgd3JpdGVyXG4gICAgICAgIC8vIGhhcyBiZWVuIGRldGFjaGVkLlxuICAgICAgICBzdHJlYW0uX2Nsb3NlUmVxdWVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gQ2xvc2UgcmVxdWVzdCBpcyByZW1vdmVkIGZyb20gX2Nsb3NlUmVxdWVzdCB3aGVuIGNsb3NlKCkgaXMgY2FsbGVkIG9uIHRoZSB1bmRlcmx5aW5nIHNpbmsuIFRoaXMgcHJldmVudHMgaXRcbiAgICAgICAgLy8gZnJvbSBiZWluZyBlcnJvbmVvdXNseSByZWplY3RlZCBvbiBlcnJvci4gSWYgYSBjbG9zZSgpIGNhbGwgaXMgaW4tZmxpZ2h0LCB0aGUgcmVxdWVzdCBpcyBzdG9yZWQgaGVyZS5cbiAgICAgICAgc3RyZWFtLl9pbkZsaWdodENsb3NlUmVxdWVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gVGhlIHByb21pc2UgdGhhdCB3YXMgcmV0dXJuZWQgZnJvbSB3cml0ZXIuYWJvcnQoKS4gVGhpcyBtYXkgYWxzbyBiZSBmdWxmaWxsZWQgYWZ0ZXIgdGhlIHdyaXRlciBoYXMgZGV0YWNoZWQuXG4gICAgICAgIHN0cmVhbS5fcGVuZGluZ0Fib3J0UmVxdWVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gVGhlIGJhY2twcmVzc3VyZSBzaWduYWwgc2V0IGJ5IHRoZSBjb250cm9sbGVyLlxuICAgICAgICBzdHJlYW0uX2JhY2twcmVzc3VyZSA9IGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBJc1dyaXRhYmxlU3RyZWFtKHgpIHtcbiAgICAgICAgaWYgKCF0eXBlSXNPYmplY3QoeCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX3dyaXRhYmxlU3RyZWFtQ29udHJvbGxlcicpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBXcml0YWJsZVN0cmVhbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gSXNXcml0YWJsZVN0cmVhbUxvY2tlZChzdHJlYW0pIHtcbiAgICAgICAgaWYgKHN0cmVhbS5fd3JpdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1BYm9ydChzdHJlYW0sIHJlYXNvbikge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmIChzdHJlYW0uX3N0YXRlID09PSAnY2xvc2VkJyB8fCBzdHJlYW0uX3N0YXRlID09PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLl93cml0YWJsZVN0cmVhbUNvbnRyb2xsZXIuX2Fib3J0UmVhc29uID0gcmVhc29uO1xuICAgICAgICAoX2EgPSBzdHJlYW0uX3dyaXRhYmxlU3RyZWFtQ29udHJvbGxlci5fYWJvcnRDb250cm9sbGVyKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuYWJvcnQoKTtcbiAgICAgICAgLy8gVHlwZVNjcmlwdCBuYXJyb3dzIHRoZSB0eXBlIG9mIGBzdHJlYW0uX3N0YXRlYCBkb3duIHRvICd3cml0YWJsZScgfCAnZXJyb3JpbmcnLFxuICAgICAgICAvLyBidXQgaXQgZG9lc24ndCBrbm93IHRoYXQgc2lnbmFsaW5nIGFib3J0IHJ1bnMgYXV0aG9yIGNvZGUgdGhhdCBtaWdodCBoYXZlIGNoYW5nZWQgdGhlIHN0YXRlLlxuICAgICAgICAvLyBXaWRlbiB0aGUgdHlwZSBhZ2FpbiBieSBjYXN0aW5nIHRvIFdyaXRhYmxlU3RyZWFtU3RhdGUuXG4gICAgICAgIGNvbnN0IHN0YXRlID0gc3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgaWYgKHN0YXRlID09PSAnY2xvc2VkJyB8fCBzdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHJlYW0uX3BlbmRpbmdBYm9ydFJlcXVlc3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmVhbS5fcGVuZGluZ0Fib3J0UmVxdWVzdC5fcHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgd2FzQWxyZWFkeUVycm9yaW5nID0gZmFsc2U7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJ2Vycm9yaW5nJykge1xuICAgICAgICAgICAgd2FzQWxyZWFkeUVycm9yaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIHJlYXNvbiB3aWxsIG5vdCBiZSB1c2VkLCBzbyBkb24ndCBrZWVwIGEgcmVmZXJlbmNlIHRvIGl0LlxuICAgICAgICAgICAgcmVhc29uID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXdQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHN0cmVhbS5fcGVuZGluZ0Fib3J0UmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICBfcHJvbWlzZTogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgIF9yZXNvbHZlOiByZXNvbHZlLFxuICAgICAgICAgICAgICAgIF9yZWplY3Q6IHJlamVjdCxcbiAgICAgICAgICAgICAgICBfcmVhc29uOiByZWFzb24sXG4gICAgICAgICAgICAgICAgX3dhc0FscmVhZHlFcnJvcmluZzogd2FzQWxyZWFkeUVycm9yaW5nXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgc3RyZWFtLl9wZW5kaW5nQWJvcnRSZXF1ZXN0Ll9wcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgaWYgKCF3YXNBbHJlYWR5RXJyb3JpbmcpIHtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtU3RhcnRFcnJvcmluZyhzdHJlYW0sIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtQ2xvc2Uoc3RyZWFtKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgaWYgKHN0YXRlID09PSAnY2xvc2VkJyB8fCBzdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChuZXcgVHlwZUVycm9yKGBUaGUgc3RyZWFtIChpbiAke3N0YXRlfSBzdGF0ZSkgaXMgbm90IGluIHRoZSB3cml0YWJsZSBzdGF0ZSBhbmQgY2Fubm90IGJlIGNsb3NlZGApKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9taXNlID0gbmV3UHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjbG9zZVJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgX3Jlc29sdmU6IHJlc29sdmUsXG4gICAgICAgICAgICAgICAgX3JlamVjdDogcmVqZWN0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc3RyZWFtLl9jbG9zZVJlcXVlc3QgPSBjbG9zZVJlcXVlc3Q7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB3cml0ZXIgPSBzdHJlYW0uX3dyaXRlcjtcbiAgICAgICAgaWYgKHdyaXRlciAhPT0gdW5kZWZpbmVkICYmIHN0cmVhbS5fYmFja3ByZXNzdXJlICYmIHN0YXRlID09PSAnd3JpdGFibGUnKSB7XG4gICAgICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlUmVzb2x2ZSh3cml0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbG9zZShzdHJlYW0uX3dyaXRhYmxlU3RyZWFtQ29udHJvbGxlcik7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICAvLyBXcml0YWJsZVN0cmVhbSBBUEkgZXhwb3NlZCBmb3IgY29udHJvbGxlcnMuXG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1BZGRXcml0ZVJlcXVlc3Qoc3RyZWFtKSB7XG4gICAgICAgIGNvbnN0IHByb21pc2UgPSBuZXdQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHdyaXRlUmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICBfcmVzb2x2ZTogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICBfcmVqZWN0OiByZWplY3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzdHJlYW0uX3dyaXRlUmVxdWVzdHMucHVzaCh3cml0ZVJlcXVlc3QpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtRGVhbFdpdGhSZWplY3Rpb24oc3RyZWFtLCBlcnJvcikge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0cmVhbS5fc3RhdGU7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJ3dyaXRhYmxlJykge1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1TdGFydEVycm9yaW5nKHN0cmVhbSwgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFdyaXRhYmxlU3RyZWFtRmluaXNoRXJyb3Jpbmcoc3RyZWFtKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1TdGFydEVycm9yaW5nKHN0cmVhbSwgcmVhc29uKSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBzdHJlYW0uX3dyaXRhYmxlU3RyZWFtQ29udHJvbGxlcjtcbiAgICAgICAgc3RyZWFtLl9zdGF0ZSA9ICdlcnJvcmluZyc7XG4gICAgICAgIHN0cmVhbS5fc3RvcmVkRXJyb3IgPSByZWFzb247XG4gICAgICAgIGNvbnN0IHdyaXRlciA9IHN0cmVhbS5fd3JpdGVyO1xuICAgICAgICBpZiAod3JpdGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlckVuc3VyZVJlYWR5UHJvbWlzZVJlamVjdGVkKHdyaXRlciwgcmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIVdyaXRhYmxlU3RyZWFtSGFzT3BlcmF0aW9uTWFya2VkSW5GbGlnaHQoc3RyZWFtKSAmJiBjb250cm9sbGVyLl9zdGFydGVkKSB7XG4gICAgICAgICAgICBXcml0YWJsZVN0cmVhbUZpbmlzaEVycm9yaW5nKHN0cmVhbSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1GaW5pc2hFcnJvcmluZyhzdHJlYW0pIHtcbiAgICAgICAgc3RyZWFtLl9zdGF0ZSA9ICdlcnJvcmVkJztcbiAgICAgICAgc3RyZWFtLl93cml0YWJsZVN0cmVhbUNvbnRyb2xsZXJbRXJyb3JTdGVwc10oKTtcbiAgICAgICAgY29uc3Qgc3RvcmVkRXJyb3IgPSBzdHJlYW0uX3N0b3JlZEVycm9yO1xuICAgICAgICBzdHJlYW0uX3dyaXRlUmVxdWVzdHMuZm9yRWFjaCh3cml0ZVJlcXVlc3QgPT4ge1xuICAgICAgICAgICAgd3JpdGVSZXF1ZXN0Ll9yZWplY3Qoc3RvcmVkRXJyb3IpO1xuICAgICAgICB9KTtcbiAgICAgICAgc3RyZWFtLl93cml0ZVJlcXVlc3RzID0gbmV3IFNpbXBsZVF1ZXVlKCk7XG4gICAgICAgIGlmIChzdHJlYW0uX3BlbmRpbmdBYm9ydFJlcXVlc3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1SZWplY3RDbG9zZUFuZENsb3NlZFByb21pc2VJZk5lZWRlZChzdHJlYW0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFib3J0UmVxdWVzdCA9IHN0cmVhbS5fcGVuZGluZ0Fib3J0UmVxdWVzdDtcbiAgICAgICAgc3RyZWFtLl9wZW5kaW5nQWJvcnRSZXF1ZXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoYWJvcnRSZXF1ZXN0Ll93YXNBbHJlYWR5RXJyb3JpbmcpIHtcbiAgICAgICAgICAgIGFib3J0UmVxdWVzdC5fcmVqZWN0KHN0b3JlZEVycm9yKTtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtUmVqZWN0Q2xvc2VBbmRDbG9zZWRQcm9taXNlSWZOZWVkZWQoc3RyZWFtKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9taXNlID0gc3RyZWFtLl93cml0YWJsZVN0cmVhbUNvbnRyb2xsZXJbQWJvcnRTdGVwc10oYWJvcnRSZXF1ZXN0Ll9yZWFzb24pO1xuICAgICAgICB1cG9uUHJvbWlzZShwcm9taXNlLCAoKSA9PiB7XG4gICAgICAgICAgICBhYm9ydFJlcXVlc3QuX3Jlc29sdmUoKTtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtUmVqZWN0Q2xvc2VBbmRDbG9zZWRQcm9taXNlSWZOZWVkZWQoc3RyZWFtKTtcbiAgICAgICAgfSwgKHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgYWJvcnRSZXF1ZXN0Ll9yZWplY3QocmVhc29uKTtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtUmVqZWN0Q2xvc2VBbmRDbG9zZWRQcm9taXNlSWZOZWVkZWQoc3RyZWFtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtRmluaXNoSW5GbGlnaHRXcml0ZShzdHJlYW0pIHtcbiAgICAgICAgc3RyZWFtLl9pbkZsaWdodFdyaXRlUmVxdWVzdC5fcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICBzdHJlYW0uX2luRmxpZ2h0V3JpdGVSZXF1ZXN0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbUZpbmlzaEluRmxpZ2h0V3JpdGVXaXRoRXJyb3Ioc3RyZWFtLCBlcnJvcikge1xuICAgICAgICBzdHJlYW0uX2luRmxpZ2h0V3JpdGVSZXF1ZXN0Ll9yZWplY3QoZXJyb3IpO1xuICAgICAgICBzdHJlYW0uX2luRmxpZ2h0V3JpdGVSZXF1ZXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICBXcml0YWJsZVN0cmVhbURlYWxXaXRoUmVqZWN0aW9uKHN0cmVhbSwgZXJyb3IpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbUZpbmlzaEluRmxpZ2h0Q2xvc2Uoc3RyZWFtKSB7XG4gICAgICAgIHN0cmVhbS5faW5GbGlnaHRDbG9zZVJlcXVlc3QuX3Jlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgc3RyZWFtLl9pbkZsaWdodENsb3NlUmVxdWVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzdHJlYW0uX3N0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgPT09ICdlcnJvcmluZycpIHtcbiAgICAgICAgICAgIC8vIFRoZSBlcnJvciB3YXMgdG9vIGxhdGUgdG8gZG8gYW55dGhpbmcsIHNvIGl0IGlzIGlnbm9yZWQuXG4gICAgICAgICAgICBzdHJlYW0uX3N0b3JlZEVycm9yID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgaWYgKHN0cmVhbS5fcGVuZGluZ0Fib3J0UmVxdWVzdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc3RyZWFtLl9wZW5kaW5nQWJvcnRSZXF1ZXN0Ll9yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgc3RyZWFtLl9wZW5kaW5nQWJvcnRSZXF1ZXN0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN0cmVhbS5fc3RhdGUgPSAnY2xvc2VkJztcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gc3RyZWFtLl93cml0ZXI7XG4gICAgICAgIGlmICh3cml0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGVmYXVsdFdyaXRlckNsb3NlZFByb21pc2VSZXNvbHZlKHdyaXRlcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1GaW5pc2hJbkZsaWdodENsb3NlV2l0aEVycm9yKHN0cmVhbSwgZXJyb3IpIHtcbiAgICAgICAgc3RyZWFtLl9pbkZsaWdodENsb3NlUmVxdWVzdC5fcmVqZWN0KGVycm9yKTtcbiAgICAgICAgc3RyZWFtLl9pbkZsaWdodENsb3NlUmVxdWVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gTmV2ZXIgZXhlY3V0ZSBzaW5rIGFib3J0KCkgYWZ0ZXIgc2luayBjbG9zZSgpLlxuICAgICAgICBpZiAoc3RyZWFtLl9wZW5kaW5nQWJvcnRSZXF1ZXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN0cmVhbS5fcGVuZGluZ0Fib3J0UmVxdWVzdC5fcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIHN0cmVhbS5fcGVuZGluZ0Fib3J0UmVxdWVzdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBXcml0YWJsZVN0cmVhbURlYWxXaXRoUmVqZWN0aW9uKHN0cmVhbSwgZXJyb3IpO1xuICAgIH1cbiAgICAvLyBUT0RPKHJpY2VhKTogRml4IGFscGhhYmV0aWNhbCBvcmRlci5cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbUNsb3NlUXVldWVkT3JJbkZsaWdodChzdHJlYW0pIHtcbiAgICAgICAgaWYgKHN0cmVhbS5fY2xvc2VSZXF1ZXN0ID09PSB1bmRlZmluZWQgJiYgc3RyZWFtLl9pbkZsaWdodENsb3NlUmVxdWVzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtSGFzT3BlcmF0aW9uTWFya2VkSW5GbGlnaHQoc3RyZWFtKSB7XG4gICAgICAgIGlmIChzdHJlYW0uX2luRmxpZ2h0V3JpdGVSZXF1ZXN0ID09PSB1bmRlZmluZWQgJiYgc3RyZWFtLl9pbkZsaWdodENsb3NlUmVxdWVzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtTWFya0Nsb3NlUmVxdWVzdEluRmxpZ2h0KHN0cmVhbSkge1xuICAgICAgICBzdHJlYW0uX2luRmxpZ2h0Q2xvc2VSZXF1ZXN0ID0gc3RyZWFtLl9jbG9zZVJlcXVlc3Q7XG4gICAgICAgIHN0cmVhbS5fY2xvc2VSZXF1ZXN0ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbU1hcmtGaXJzdFdyaXRlUmVxdWVzdEluRmxpZ2h0KHN0cmVhbSkge1xuICAgICAgICBzdHJlYW0uX2luRmxpZ2h0V3JpdGVSZXF1ZXN0ID0gc3RyZWFtLl93cml0ZVJlcXVlc3RzLnNoaWZ0KCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtUmVqZWN0Q2xvc2VBbmRDbG9zZWRQcm9taXNlSWZOZWVkZWQoc3RyZWFtKSB7XG4gICAgICAgIGlmIChzdHJlYW0uX2Nsb3NlUmVxdWVzdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdHJlYW0uX2Nsb3NlUmVxdWVzdC5fcmVqZWN0KHN0cmVhbS5fc3RvcmVkRXJyb3IpO1xuICAgICAgICAgICAgc3RyZWFtLl9jbG9zZVJlcXVlc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgd3JpdGVyID0gc3RyZWFtLl93cml0ZXI7XG4gICAgICAgIGlmICh3cml0ZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGVmYXVsdFdyaXRlckNsb3NlZFByb21pc2VSZWplY3Qod3JpdGVyLCBzdHJlYW0uX3N0b3JlZEVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbVVwZGF0ZUJhY2twcmVzc3VyZShzdHJlYW0sIGJhY2twcmVzc3VyZSkge1xuICAgICAgICBjb25zdCB3cml0ZXIgPSBzdHJlYW0uX3dyaXRlcjtcbiAgICAgICAgaWYgKHdyaXRlciAhPT0gdW5kZWZpbmVkICYmIGJhY2twcmVzc3VyZSAhPT0gc3RyZWFtLl9iYWNrcHJlc3N1cmUpIHtcbiAgICAgICAgICAgIGlmIChiYWNrcHJlc3N1cmUpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlUmVzZXQod3JpdGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRXcml0ZXJSZWFkeVByb21pc2VSZXNvbHZlKHdyaXRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLl9iYWNrcHJlc3N1cmUgPSBiYWNrcHJlc3N1cmU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEEgZGVmYXVsdCB3cml0ZXIgdmVuZGVkIGJ5IGEge0BsaW5rIFdyaXRhYmxlU3RyZWFtfS5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGFzcyBXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXIge1xuICAgICAgICBjb25zdHJ1Y3RvcihzdHJlYW0pIHtcbiAgICAgICAgICAgIGFzc2VydFJlcXVpcmVkQXJndW1lbnQoc3RyZWFtLCAxLCAnV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyJyk7XG4gICAgICAgICAgICBhc3NlcnRXcml0YWJsZVN0cmVhbShzdHJlYW0sICdGaXJzdCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIGlmIChJc1dyaXRhYmxlU3RyZWFtTG9ja2VkKHN0cmVhbSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGlzIHN0cmVhbSBoYXMgYWxyZWFkeSBiZWVuIGxvY2tlZCBmb3IgZXhjbHVzaXZlIHdyaXRpbmcgYnkgYW5vdGhlciB3cml0ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX293bmVyV3JpdGFibGVTdHJlYW0gPSBzdHJlYW07XG4gICAgICAgICAgICBzdHJlYW0uX3dyaXRlciA9IHRoaXM7XG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IHN0cmVhbS5fc3RhdGU7XG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09ICd3cml0YWJsZScpIHtcbiAgICAgICAgICAgICAgICBpZiAoIVdyaXRhYmxlU3RyZWFtQ2xvc2VRdWV1ZWRPckluRmxpZ2h0KHN0cmVhbSkgJiYgc3RyZWFtLl9iYWNrcHJlc3N1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFdyaXRlclJlYWR5UHJvbWlzZUluaXRpYWxpemUodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlSW5pdGlhbGl6ZUFzUmVzb2x2ZWQodGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0YXRlID09PSAnZXJyb3JpbmcnKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFdyaXRlclJlYWR5UHJvbWlzZUluaXRpYWxpemVBc1JlamVjdGVkKHRoaXMsIHN0cmVhbS5fc3RvcmVkRXJyb3IpO1xuICAgICAgICAgICAgICAgIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZSh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgICAgIGRlZmF1bHRXcml0ZXJSZWFkeVByb21pc2VJbml0aWFsaXplQXNSZXNvbHZlZCh0aGlzKTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0V3JpdGVyQ2xvc2VkUHJvbWlzZUluaXRpYWxpemVBc1Jlc29sdmVkKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RvcmVkRXJyb3IgPSBzdHJlYW0uX3N0b3JlZEVycm9yO1xuICAgICAgICAgICAgICAgIGRlZmF1bHRXcml0ZXJSZWFkeVByb21pc2VJbml0aWFsaXplQXNSZWplY3RlZCh0aGlzLCBzdG9yZWRFcnJvcik7XG4gICAgICAgICAgICAgICAgZGVmYXVsdFdyaXRlckNsb3NlZFByb21pc2VJbml0aWFsaXplQXNSZWplY3RlZCh0aGlzLCBzdG9yZWRFcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBmdWxmaWxsZWQgd2hlbiB0aGUgc3RyZWFtIGJlY29tZXMgY2xvc2VkLCBvciByZWplY3RlZCBpZiB0aGUgc3RyZWFtIGV2ZXIgZXJyb3JzIG9yXG4gICAgICAgICAqIHRoZSB3cml0ZXLigJlzIGxvY2sgaXMgcmVsZWFzZWQgYmVmb3JlIHRoZSBzdHJlYW0gZmluaXNoZXMgY2xvc2luZy5cbiAgICAgICAgICovXG4gICAgICAgIGdldCBjbG9zZWQoKSB7XG4gICAgICAgICAgICBpZiAoIUlzV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoZGVmYXVsdFdyaXRlckJyYW5kQ2hlY2tFeGNlcHRpb24oJ2Nsb3NlZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbG9zZWRQcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBkZXNpcmVkIHNpemUgdG8gZmlsbCB0aGUgc3RyZWFt4oCZcyBpbnRlcm5hbCBxdWV1ZS4gSXQgY2FuIGJlIG5lZ2F0aXZlLCBpZiB0aGUgcXVldWUgaXMgb3Zlci1mdWxsLlxuICAgICAgICAgKiBBIHByb2R1Y2VyIGNhbiB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZXRlcm1pbmUgdGhlIHJpZ2h0IGFtb3VudCBvZiBkYXRhIHRvIHdyaXRlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBJdCB3aWxsIGJlIGBudWxsYCBpZiB0aGUgc3RyZWFtIGNhbm5vdCBiZSBzdWNjZXNzZnVsbHkgd3JpdHRlbiB0byAoZHVlIHRvIGVpdGhlciBiZWluZyBlcnJvcmVkLCBvciBoYXZpbmcgYW4gYWJvcnRcbiAgICAgICAgICogcXVldWVkIHVwKS4gSXQgd2lsbCByZXR1cm4gemVybyBpZiB0aGUgc3RyZWFtIGlzIGNsb3NlZC4gQW5kIHRoZSBnZXR0ZXIgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgaW52b2tlZCB3aGVuXG4gICAgICAgICAqIHRoZSB3cml0ZXLigJlzIGxvY2sgaXMgcmVsZWFzZWQuXG4gICAgICAgICAqL1xuICAgICAgICBnZXQgZGVzaXJlZFNpemUoKSB7XG4gICAgICAgICAgICBpZiAoIUlzV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGVmYXVsdFdyaXRlckJyYW5kQ2hlY2tFeGNlcHRpb24oJ2Rlc2lyZWRTaXplJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fb3duZXJXcml0YWJsZVN0cmVhbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGVmYXVsdFdyaXRlckxvY2tFeGNlcHRpb24oJ2Rlc2lyZWRTaXplJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyR2V0RGVzaXJlZFNpemUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCBiZSBmdWxmaWxsZWQgd2hlbiB0aGUgZGVzaXJlZCBzaXplIHRvIGZpbGwgdGhlIHN0cmVhbeKAmXMgaW50ZXJuYWwgcXVldWUgdHJhbnNpdGlvbnNcbiAgICAgICAgICogZnJvbSBub24tcG9zaXRpdmUgdG8gcG9zaXRpdmUsIHNpZ25hbGluZyB0aGF0IGl0IGlzIG5vIGxvbmdlciBhcHBseWluZyBiYWNrcHJlc3N1cmUuIE9uY2UgdGhlIGRlc2lyZWQgc2l6ZSBkaXBzXG4gICAgICAgICAqIGJhY2sgdG8gemVybyBvciBiZWxvdywgdGhlIGdldHRlciB3aWxsIHJldHVybiBhIG5ldyBwcm9taXNlIHRoYXQgc3RheXMgcGVuZGluZyB1bnRpbCB0aGUgbmV4dCB0cmFuc2l0aW9uLlxuICAgICAgICAgKlxuICAgICAgICAgKiBJZiB0aGUgc3RyZWFtIGJlY29tZXMgZXJyb3JlZCBvciBhYm9ydGVkLCBvciB0aGUgd3JpdGVy4oCZcyBsb2NrIGlzIHJlbGVhc2VkLCB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIGJlY29tZVxuICAgICAgICAgKiByZWplY3RlZC5cbiAgICAgICAgICovXG4gICAgICAgIGdldCByZWFkeSgpIHtcbiAgICAgICAgICAgIGlmICghSXNXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChkZWZhdWx0V3JpdGVyQnJhbmRDaGVja0V4Y2VwdGlvbigncmVhZHknKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVhZHlQcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiB0aGUgcmVhZGVyIGlzIGFjdGl2ZSwgYmVoYXZlcyB0aGUgc2FtZSBhcyB7QGxpbmsgV3JpdGFibGVTdHJlYW0uYWJvcnQgfCBzdHJlYW0uYWJvcnQocmVhc29uKX0uXG4gICAgICAgICAqL1xuICAgICAgICBhYm9ydChyZWFzb24gPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICghSXNXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChkZWZhdWx0V3JpdGVyQnJhbmRDaGVja0V4Y2VwdGlvbignYWJvcnQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fb3duZXJXcml0YWJsZVN0cmVhbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoZGVmYXVsdFdyaXRlckxvY2tFeGNlcHRpb24oJ2Fib3J0JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlckFib3J0KHRoaXMsIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRoZSByZWFkZXIgaXMgYWN0aXZlLCBiZWhhdmVzIHRoZSBzYW1lIGFzIHtAbGluayBXcml0YWJsZVN0cmVhbS5jbG9zZSB8IHN0cmVhbS5jbG9zZSgpfS5cbiAgICAgICAgICovXG4gICAgICAgIGNsb3NlKCkge1xuICAgICAgICAgICAgaWYgKCFJc1dyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKGRlZmF1bHRXcml0ZXJCcmFuZENoZWNrRXhjZXB0aW9uKCdjbG9zZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbSA9IHRoaXMuX293bmVyV3JpdGFibGVTdHJlYW07XG4gICAgICAgICAgICBpZiAoc3RyZWFtID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChkZWZhdWx0V3JpdGVyTG9ja0V4Y2VwdGlvbignY2xvc2UnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoV3JpdGFibGVTdHJlYW1DbG9zZVF1ZXVlZE9ySW5GbGlnaHQoc3RyZWFtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjbG9zZSBhbiBhbHJlYWR5LWNsb3Npbmcgc3RyZWFtJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlckNsb3NlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZWxlYXNlcyB0aGUgd3JpdGVy4oCZcyBsb2NrIG9uIHRoZSBjb3JyZXNwb25kaW5nIHN0cmVhbS4gQWZ0ZXIgdGhlIGxvY2sgaXMgcmVsZWFzZWQsIHRoZSB3cml0ZXIgaXMgbm8gbG9uZ2VyIGFjdGl2ZS5cbiAgICAgICAgICogSWYgdGhlIGFzc29jaWF0ZWQgc3RyZWFtIGlzIGVycm9yZWQgd2hlbiB0aGUgbG9jayBpcyByZWxlYXNlZCwgdGhlIHdyaXRlciB3aWxsIGFwcGVhciBlcnJvcmVkIGluIHRoZSBzYW1lIHdheSBmcm9tXG4gICAgICAgICAqIG5vdyBvbjsgb3RoZXJ3aXNlLCB0aGUgd3JpdGVyIHdpbGwgYXBwZWFyIGNsb3NlZC5cbiAgICAgICAgICpcbiAgICAgICAgICogTm90ZSB0aGF0IHRoZSBsb2NrIGNhbiBzdGlsbCBiZSByZWxlYXNlZCBldmVuIGlmIHNvbWUgb25nb2luZyB3cml0ZXMgaGF2ZSBub3QgeWV0IGZpbmlzaGVkIChpLmUuIGV2ZW4gaWYgdGhlXG4gICAgICAgICAqIHByb21pc2VzIHJldHVybmVkIGZyb20gcHJldmlvdXMgY2FsbHMgdG8ge0BsaW5rIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlci53cml0ZSB8IHdyaXRlKCl9IGhhdmUgbm90IHlldCBzZXR0bGVkKS5cbiAgICAgICAgICogSXTigJlzIG5vdCBuZWNlc3NhcnkgdG8gaG9sZCB0aGUgbG9jayBvbiB0aGUgd3JpdGVyIGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIHdyaXRlOyB0aGUgbG9jayBpbnN0ZWFkIHNpbXBseSBwcmV2ZW50c1xuICAgICAgICAgKiBvdGhlciBwcm9kdWNlcnMgZnJvbSB3cml0aW5nIGluIGFuIGludGVybGVhdmVkIG1hbm5lci5cbiAgICAgICAgICovXG4gICAgICAgIHJlbGVhc2VMb2NrKCkge1xuICAgICAgICAgICAgaWYgKCFJc1dyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGRlZmF1bHRXcml0ZXJCcmFuZENoZWNrRXhjZXB0aW9uKCdyZWxlYXNlTG9jaycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3RyZWFtID0gdGhpcy5fb3duZXJXcml0YWJsZVN0cmVhbTtcbiAgICAgICAgICAgIGlmIChzdHJlYW0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlclJlbGVhc2UodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGUoY2h1bmsgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICghSXNXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChkZWZhdWx0V3JpdGVyQnJhbmRDaGVja0V4Y2VwdGlvbignd3JpdGUnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fb3duZXJXcml0YWJsZVN0cmVhbSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoZGVmYXVsdFdyaXRlckxvY2tFeGNlcHRpb24oJ3dyaXRlIHRvJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcldyaXRlKHRoaXMsIGNodW5rKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXIucHJvdG90eXBlLCB7XG4gICAgICAgIGFib3J0OiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgY2xvc2U6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICByZWxlYXNlTG9jazogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHdyaXRlOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgY2xvc2VkOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgZGVzaXJlZFNpemU6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICByZWFkeTogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyLnByb3RvdHlwZSwgU3ltYm9sUG9seWZpbGwudG9TdHJpbmdUYWcsIHtcbiAgICAgICAgICAgIHZhbHVlOiAnV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyJyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gQWJzdHJhY3Qgb3BlcmF0aW9ucyBmb3IgdGhlIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlci5cbiAgICBmdW5jdGlvbiBJc1dyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcih4KSB7XG4gICAgICAgIGlmICghdHlwZUlzT2JqZWN0KHgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoeCwgJ19vd25lcldyaXRhYmxlU3RyZWFtJykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcjtcbiAgICB9XG4gICAgLy8gQSBjbGllbnQgb2YgV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyIG1heSB1c2UgdGhlc2UgZnVuY3Rpb25zIGRpcmVjdGx5IHRvIGJ5cGFzcyBzdGF0ZSBjaGVjay5cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXJBYm9ydCh3cml0ZXIsIHJlYXNvbikge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSB3cml0ZXIuX293bmVyV3JpdGFibGVTdHJlYW07XG4gICAgICAgIHJldHVybiBXcml0YWJsZVN0cmVhbUFib3J0KHN0cmVhbSwgcmVhc29uKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyQ2xvc2Uod3JpdGVyKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IHdyaXRlci5fb3duZXJXcml0YWJsZVN0cmVhbTtcbiAgICAgICAgcmV0dXJuIFdyaXRhYmxlU3RyZWFtQ2xvc2Uoc3RyZWFtKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyQ2xvc2VXaXRoRXJyb3JQcm9wYWdhdGlvbih3cml0ZXIpIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gd3JpdGVyLl9vd25lcldyaXRhYmxlU3RyZWFtO1xuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0cmVhbS5fc3RhdGU7XG4gICAgICAgIGlmIChXcml0YWJsZVN0cmVhbUNsb3NlUXVldWVkT3JJbkZsaWdodChzdHJlYW0pIHx8IHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlZFdpdGgodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoc3RyZWFtLl9zdG9yZWRFcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlckNsb3NlKHdyaXRlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlckVuc3VyZUNsb3NlZFByb21pc2VSZWplY3RlZCh3cml0ZXIsIGVycm9yKSB7XG4gICAgICAgIGlmICh3cml0ZXIuX2Nsb3NlZFByb21pc2VTdGF0ZSA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgICAgICAgICBkZWZhdWx0V3JpdGVyQ2xvc2VkUHJvbWlzZVJlamVjdCh3cml0ZXIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlUmVzZXRUb1JlamVjdGVkKHdyaXRlciwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlckVuc3VyZVJlYWR5UHJvbWlzZVJlamVjdGVkKHdyaXRlciwgZXJyb3IpIHtcbiAgICAgICAgaWYgKHdyaXRlci5fcmVhZHlQcm9taXNlU3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgICAgICAgZGVmYXVsdFdyaXRlclJlYWR5UHJvbWlzZVJlamVjdCh3cml0ZXIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmF1bHRXcml0ZXJSZWFkeVByb21pc2VSZXNldFRvUmVqZWN0ZWQod3JpdGVyLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyR2V0RGVzaXJlZFNpemUod3JpdGVyKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IHdyaXRlci5fb3duZXJXcml0YWJsZVN0cmVhbTtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBzdHJlYW0uX3N0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgPT09ICdlcnJvcmVkJyB8fCBzdGF0ZSA9PT0gJ2Vycm9yaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJHZXREZXNpcmVkU2l6ZShzdHJlYW0uX3dyaXRhYmxlU3RyZWFtQ29udHJvbGxlcik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlclJlbGVhc2Uod3JpdGVyKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IHdyaXRlci5fb3duZXJXcml0YWJsZVN0cmVhbTtcbiAgICAgICAgY29uc3QgcmVsZWFzZWRFcnJvciA9IG5ldyBUeXBlRXJyb3IoYFdyaXRlciB3YXMgcmVsZWFzZWQgYW5kIGNhbiBubyBsb25nZXIgYmUgdXNlZCB0byBtb25pdG9yIHRoZSBzdHJlYW0ncyBjbG9zZWRuZXNzYCk7XG4gICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlckVuc3VyZVJlYWR5UHJvbWlzZVJlamVjdGVkKHdyaXRlciwgcmVsZWFzZWRFcnJvcik7XG4gICAgICAgIC8vIFRoZSBzdGF0ZSB0cmFuc2l0aW9ucyB0byBcImVycm9yZWRcIiBiZWZvcmUgdGhlIHNpbmsgYWJvcnQoKSBtZXRob2QgcnVucywgYnV0IHRoZSB3cml0ZXIuY2xvc2VkIHByb21pc2UgaXMgbm90XG4gICAgICAgIC8vIHJlamVjdGVkIHVudGlsIGFmdGVyd2FyZHMuIFRoaXMgbWVhbnMgdGhhdCBzaW1wbHkgdGVzdGluZyBzdGF0ZSB3aWxsIG5vdCB3b3JrLlxuICAgICAgICBXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXJFbnN1cmVDbG9zZWRQcm9taXNlUmVqZWN0ZWQod3JpdGVyLCByZWxlYXNlZEVycm9yKTtcbiAgICAgICAgc3RyZWFtLl93cml0ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHdyaXRlci5fb3duZXJXcml0YWJsZVN0cmVhbSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyV3JpdGUod3JpdGVyLCBjaHVuaykge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSB3cml0ZXIuX293bmVyV3JpdGFibGVTdHJlYW07XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBzdHJlYW0uX3dyaXRhYmxlU3RyZWFtQ29udHJvbGxlcjtcbiAgICAgICAgY29uc3QgY2h1bmtTaXplID0gV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckdldENodW5rU2l6ZShjb250cm9sbGVyLCBjaHVuayk7XG4gICAgICAgIGlmIChzdHJlYW0gIT09IHdyaXRlci5fb3duZXJXcml0YWJsZVN0cmVhbSkge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoZGVmYXVsdFdyaXRlckxvY2tFeGNlcHRpb24oJ3dyaXRlIHRvJykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0YXRlID0gc3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgaWYgKHN0YXRlID09PSAnZXJyb3JlZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKHN0cmVhbS5fc3RvcmVkRXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChXcml0YWJsZVN0cmVhbUNsb3NlUXVldWVkT3JJbkZsaWdodChzdHJlYW0pIHx8IHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgobmV3IFR5cGVFcnJvcignVGhlIHN0cmVhbSBpcyBjbG9zaW5nIG9yIGNsb3NlZCBhbmQgY2Fubm90IGJlIHdyaXR0ZW4gdG8nKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlID09PSAnZXJyb3JpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChzdHJlYW0uX3N0b3JlZEVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcm9taXNlID0gV3JpdGFibGVTdHJlYW1BZGRXcml0ZVJlcXVlc3Qoc3RyZWFtKTtcbiAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcldyaXRlKGNvbnRyb2xsZXIsIGNodW5rLCBjaHVua1NpemUpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgY29uc3QgY2xvc2VTZW50aW5lbCA9IHt9O1xuICAgIC8qKlxuICAgICAqIEFsbG93cyBjb250cm9sIG9mIGEge0BsaW5rIFdyaXRhYmxlU3RyZWFtIHwgd3JpdGFibGUgc3RyZWFtfSdzIHN0YXRlIGFuZCBpbnRlcm5hbCBxdWV1ZS5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGFzcyBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbGxlZ2FsIGNvbnN0cnVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSByZWFzb24gd2hpY2ggd2FzIHBhc3NlZCB0byBgV3JpdGFibGVTdHJlYW0uYWJvcnQocmVhc29uKWAgd2hlbiB0aGUgc3RyZWFtIHdhcyBhYm9ydGVkLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAgICAgKiAgVGhpcyBwcm9wZXJ0eSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdGhlIHNwZWNpZmljYXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2hhdHdnL3N0cmVhbXMvcHVsbC8xMTc3LlxuICAgICAgICAgKiAgVXNlIHtAbGluayBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnNpZ25hbH0ncyBgcmVhc29uYCBpbnN0ZWFkLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0IGFib3J0UmVhc29uKCkge1xuICAgICAgICAgICAgaWYgKCFJc1dyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBkZWZhdWx0Q29udHJvbGxlckJyYW5kQ2hlY2tFeGNlcHRpb24kMignYWJvcnRSZWFzb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hYm9ydFJlYXNvbjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQW4gYEFib3J0U2lnbmFsYCB0aGF0IGNhbiBiZSB1c2VkIHRvIGFib3J0IHRoZSBwZW5kaW5nIHdyaXRlIG9yIGNsb3NlIG9wZXJhdGlvbiB3aGVuIHRoZSBzdHJlYW0gaXMgYWJvcnRlZC5cbiAgICAgICAgICovXG4gICAgICAgIGdldCBzaWduYWwoKSB7XG4gICAgICAgICAgICBpZiAoIUlzV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGRlZmF1bHRDb250cm9sbGVyQnJhbmRDaGVja0V4Y2VwdGlvbiQyKCdzaWduYWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9hYm9ydENvbnRyb2xsZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIC8vIE9sZGVyIGJyb3dzZXJzIG9yIG9sZGVyIE5vZGUgdmVyc2lvbnMgbWF5IG5vdCBzdXBwb3J0IGBBYm9ydENvbnRyb2xsZXJgIG9yIGBBYm9ydFNpZ25hbGAuXG4gICAgICAgICAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBidW5kbGUgYW5kIHNoaXAgYW4gYEFib3J0Q29udHJvbGxlcmAgcG9seWZpbGwgdG9nZXRoZXIgd2l0aCBvdXIgcG9seWZpbGwsXG4gICAgICAgICAgICAgICAgLy8gc28gaW5zdGVhZCB3ZSBvbmx5IGltcGxlbWVudCBzdXBwb3J0IGZvciBgc2lnbmFsYCBpZiB3ZSBmaW5kIGEgZ2xvYmFsIGBBYm9ydENvbnRyb2xsZXJgIGNvbnN0cnVjdG9yLlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1dyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIucHJvdG90eXBlLnNpZ25hbCBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYWJvcnRDb250cm9sbGVyLnNpZ25hbDtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQ2xvc2VzIHRoZSBjb250cm9sbGVkIHdyaXRhYmxlIHN0cmVhbSwgbWFraW5nIGFsbCBmdXR1cmUgaW50ZXJhY3Rpb25zIHdpdGggaXQgZmFpbCB3aXRoIHRoZSBnaXZlbiBlcnJvciBgZWAuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIGlzIHJhcmVseSB1c2VkLCBzaW5jZSB1c3VhbGx5IGl0IHN1ZmZpY2VzIHRvIHJldHVybiBhIHJlamVjdGVkIHByb21pc2UgZnJvbSBvbmUgb2YgdGhlIHVuZGVybHlpbmdcbiAgICAgICAgICogc2luaydzIG1ldGhvZHMuIEhvd2V2ZXIsIGl0IGNhbiBiZSB1c2VmdWwgZm9yIHN1ZGRlbmx5IHNodXR0aW5nIGRvd24gYSBzdHJlYW0gaW4gcmVzcG9uc2UgdG8gYW4gZXZlbnQgb3V0c2lkZSB0aGVcbiAgICAgICAgICogbm9ybWFsIGxpZmVjeWNsZSBvZiBpbnRlcmFjdGlvbnMgd2l0aCB0aGUgdW5kZXJseWluZyBzaW5rLlxuICAgICAgICAgKi9cbiAgICAgICAgZXJyb3IoZSA9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKCFJc1dyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBkZWZhdWx0Q29udHJvbGxlckJyYW5kQ2hlY2tFeGNlcHRpb24kMignZXJyb3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5fY29udHJvbGxlZFdyaXRhYmxlU3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSAhPT0gJ3dyaXRhYmxlJykge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBzdHJlYW0gaXMgY2xvc2VkLCBlcnJvcmVkIG9yIHdpbGwgYmUgc29vbi4gVGhlIHNpbmsgY2FuJ3QgZG8gYW55dGhpbmcgdXNlZnVsIGlmIGl0IGdldHMgYW4gZXJyb3IgaGVyZSwgc29cbiAgICAgICAgICAgICAgICAvLyBqdXN0IHRyZWF0IGl0IGFzIGEgbm8tb3AuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKHRoaXMsIGUpO1xuICAgICAgICB9XG4gICAgICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICAgICAgW0Fib3J0U3RlcHNdKHJlYXNvbikge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fYWJvcnRBbGdvcml0aG0ocmVhc29uKTtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbGVhckFsZ29yaXRobXModGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICAgICAgW0Vycm9yU3RlcHNdKCkge1xuICAgICAgICAgICAgUmVzZXRRdWV1ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSwge1xuICAgICAgICBhYm9ydFJlYXNvbjogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHNpZ25hbDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIGVycm9yOiB7IGVudW1lcmFibGU6IHRydWUgfVxuICAgIH0pO1xuICAgIGlmICh0eXBlb2YgU3ltYm9sUG9seWZpbGwudG9TdHJpbmdUYWcgPT09ICdzeW1ib2wnKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSwgU3ltYm9sUG9seWZpbGwudG9TdHJpbmdUYWcsIHtcbiAgICAgICAgICAgIHZhbHVlOiAnV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcicsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEFic3RyYWN0IG9wZXJhdGlvbnMgaW1wbGVtZW50aW5nIGludGVyZmFjZSByZXF1aXJlZCBieSB0aGUgV3JpdGFibGVTdHJlYW0uXG4gICAgZnVuY3Rpb24gSXNXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyKHgpIHtcbiAgICAgICAgaWYgKCF0eXBlSXNPYmplY3QoeCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX2NvbnRyb2xsZWRXcml0YWJsZVN0cmVhbScpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBTZXRVcFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIoc3RyZWFtLCBjb250cm9sbGVyLCBzdGFydEFsZ29yaXRobSwgd3JpdGVBbGdvcml0aG0sIGNsb3NlQWxnb3JpdGhtLCBhYm9ydEFsZ29yaXRobSwgaGlnaFdhdGVyTWFyaywgc2l6ZUFsZ29yaXRobSkge1xuICAgICAgICBjb250cm9sbGVyLl9jb250cm9sbGVkV3JpdGFibGVTdHJlYW0gPSBzdHJlYW07XG4gICAgICAgIHN0cmVhbS5fd3JpdGFibGVTdHJlYW1Db250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICAgICAgLy8gTmVlZCB0byBzZXQgdGhlIHNsb3RzIHNvIHRoYXQgdGhlIGFzc2VydCBkb2Vzbid0IGZpcmUuIEluIHRoZSBzcGVjIHRoZSBzbG90cyBhbHJlYWR5IGV4aXN0IGltcGxpY2l0bHkuXG4gICAgICAgIGNvbnRyb2xsZXIuX3F1ZXVlID0gdW5kZWZpbmVkO1xuICAgICAgICBjb250cm9sbGVyLl9xdWV1ZVRvdGFsU2l6ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgUmVzZXRRdWV1ZShjb250cm9sbGVyKTtcbiAgICAgICAgY29udHJvbGxlci5fYWJvcnRSZWFzb24gPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnRyb2xsZXIuX2Fib3J0Q29udHJvbGxlciA9IGNyZWF0ZUFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICBjb250cm9sbGVyLl9zdGFydGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnRyb2xsZXIuX3N0cmF0ZWd5U2l6ZUFsZ29yaXRobSA9IHNpemVBbGdvcml0aG07XG4gICAgICAgIGNvbnRyb2xsZXIuX3N0cmF0ZWd5SFdNID0gaGlnaFdhdGVyTWFyaztcbiAgICAgICAgY29udHJvbGxlci5fd3JpdGVBbGdvcml0aG0gPSB3cml0ZUFsZ29yaXRobTtcbiAgICAgICAgY29udHJvbGxlci5fY2xvc2VBbGdvcml0aG0gPSBjbG9zZUFsZ29yaXRobTtcbiAgICAgICAgY29udHJvbGxlci5fYWJvcnRBbGdvcml0aG0gPSBhYm9ydEFsZ29yaXRobTtcbiAgICAgICAgY29uc3QgYmFja3ByZXNzdXJlID0gV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckdldEJhY2twcmVzc3VyZShjb250cm9sbGVyKTtcbiAgICAgICAgV3JpdGFibGVTdHJlYW1VcGRhdGVCYWNrcHJlc3N1cmUoc3RyZWFtLCBiYWNrcHJlc3N1cmUpO1xuICAgICAgICBjb25zdCBzdGFydFJlc3VsdCA9IHN0YXJ0QWxnb3JpdGhtKCk7XG4gICAgICAgIGNvbnN0IHN0YXJ0UHJvbWlzZSA9IHByb21pc2VSZXNvbHZlZFdpdGgoc3RhcnRSZXN1bHQpO1xuICAgICAgICB1cG9uUHJvbWlzZShzdGFydFByb21pc2UsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckFkdmFuY2VRdWV1ZUlmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgICAgICB9LCByID0+IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuX3N0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1EZWFsV2l0aFJlamVjdGlvbihzdHJlYW0sIHIpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gU2V0VXBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyRnJvbVVuZGVybHlpbmdTaW5rKHN0cmVhbSwgdW5kZXJseWluZ1NpbmssIGhpZ2hXYXRlck1hcmssIHNpemVBbGdvcml0aG0pIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IE9iamVjdC5jcmVhdGUoV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlci5wcm90b3R5cGUpO1xuICAgICAgICBsZXQgc3RhcnRBbGdvcml0aG0gPSAoKSA9PiB1bmRlZmluZWQ7XG4gICAgICAgIGxldCB3cml0ZUFsZ29yaXRobSA9ICgpID0+IHByb21pc2VSZXNvbHZlZFdpdGgodW5kZWZpbmVkKTtcbiAgICAgICAgbGV0IGNsb3NlQWxnb3JpdGhtID0gKCkgPT4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICBsZXQgYWJvcnRBbGdvcml0aG0gPSAoKSA9PiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgIGlmICh1bmRlcmx5aW5nU2luay5zdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBzdGFydEFsZ29yaXRobSA9ICgpID0+IHVuZGVybHlpbmdTaW5rLnN0YXJ0KGNvbnRyb2xsZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1bmRlcmx5aW5nU2luay53cml0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3cml0ZUFsZ29yaXRobSA9IGNodW5rID0+IHVuZGVybHlpbmdTaW5rLndyaXRlKGNodW5rLCBjb250cm9sbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodW5kZXJseWluZ1NpbmsuY2xvc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2xvc2VBbGdvcml0aG0gPSAoKSA9PiB1bmRlcmx5aW5nU2luay5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1bmRlcmx5aW5nU2luay5hYm9ydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhYm9ydEFsZ29yaXRobSA9IHJlYXNvbiA9PiB1bmRlcmx5aW5nU2luay5hYm9ydChyZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIFNldFVwV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcihzdHJlYW0sIGNvbnRyb2xsZXIsIHN0YXJ0QWxnb3JpdGhtLCB3cml0ZUFsZ29yaXRobSwgY2xvc2VBbGdvcml0aG0sIGFib3J0QWxnb3JpdGhtLCBoaWdoV2F0ZXJNYXJrLCBzaXplQWxnb3JpdGhtKTtcbiAgICB9XG4gICAgLy8gQ2xlYXJBbGdvcml0aG1zIG1heSBiZSBjYWxsZWQgdHdpY2UuIEVycm9yaW5nIHRoZSBzYW1lIHN0cmVhbSBpbiBtdWx0aXBsZSB3YXlzIHdpbGwgb2Z0ZW4gcmVzdWx0IGluIHJlZHVuZGFudCBjYWxscy5cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgY29udHJvbGxlci5fd3JpdGVBbGdvcml0aG0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnRyb2xsZXIuX2Nsb3NlQWxnb3JpdGhtID0gdW5kZWZpbmVkO1xuICAgICAgICBjb250cm9sbGVyLl9hYm9ydEFsZ29yaXRobSA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29udHJvbGxlci5fc3RyYXRlZ3lTaXplQWxnb3JpdGhtID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2xvc2UoY29udHJvbGxlcikge1xuICAgICAgICBFbnF1ZXVlVmFsdWVXaXRoU2l6ZShjb250cm9sbGVyLCBjbG9zZVNlbnRpbmVsLCAwKTtcbiAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckFkdmFuY2VRdWV1ZUlmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyR2V0Q2h1bmtTaXplKGNvbnRyb2xsZXIsIGNodW5rKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gY29udHJvbGxlci5fc3RyYXRlZ3lTaXplQWxnb3JpdGhtKGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoY2h1bmtTaXplRSkge1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9ySWZOZWVkZWQoY29udHJvbGxlciwgY2h1bmtTaXplRSk7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyR2V0RGVzaXJlZFNpemUoY29udHJvbGxlcikge1xuICAgICAgICByZXR1cm4gY29udHJvbGxlci5fc3RyYXRlZ3lIV00gLSBjb250cm9sbGVyLl9xdWV1ZVRvdGFsU2l6ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcldyaXRlKGNvbnRyb2xsZXIsIGNodW5rLCBjaHVua1NpemUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIEVucXVldWVWYWx1ZVdpdGhTaXplKGNvbnRyb2xsZXIsIGNodW5rLCBjaHVua1NpemUpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlbnF1ZXVlRSkge1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9ySWZOZWVkZWQoY29udHJvbGxlciwgZW5xdWV1ZUUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRXcml0YWJsZVN0cmVhbTtcbiAgICAgICAgaWYgKCFXcml0YWJsZVN0cmVhbUNsb3NlUXVldWVkT3JJbkZsaWdodChzdHJlYW0pICYmIHN0cmVhbS5fc3RhdGUgPT09ICd3cml0YWJsZScpIHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2twcmVzc3VyZSA9IFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJHZXRCYWNrcHJlc3N1cmUoY29udHJvbGxlcik7XG4gICAgICAgICAgICBXcml0YWJsZVN0cmVhbVVwZGF0ZUJhY2twcmVzc3VyZShzdHJlYW0sIGJhY2twcmVzc3VyZSk7XG4gICAgICAgIH1cbiAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckFkdmFuY2VRdWV1ZUlmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgIH1cbiAgICAvLyBBYnN0cmFjdCBvcGVyYXRpb25zIGZvciB0aGUgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlci5cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQWR2YW5jZVF1ZXVlSWZOZWVkZWQoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkV3JpdGFibGVTdHJlYW07XG4gICAgICAgIGlmICghY29udHJvbGxlci5fc3RhcnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHJlYW0uX2luRmxpZ2h0V3JpdGVSZXF1ZXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGF0ZSA9IHN0cmVhbS5fc3RhdGU7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJ2Vycm9yaW5nJykge1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1GaW5pc2hFcnJvcmluZyhzdHJlYW0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb250cm9sbGVyLl9xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWx1ZSA9IFBlZWtRdWV1ZVZhbHVlKGNvbnRyb2xsZXIpO1xuICAgICAgICBpZiAodmFsdWUgPT09IGNsb3NlU2VudGluZWwpIHtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJQcm9jZXNzQ2xvc2UoY29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyUHJvY2Vzc1dyaXRlKGNvbnRyb2xsZXIsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyRXJyb3JJZk5lZWRlZChjb250cm9sbGVyLCBlcnJvcikge1xuICAgICAgICBpZiAoY29udHJvbGxlci5fY29udHJvbGxlZFdyaXRhYmxlU3RyZWFtLl9zdGF0ZSA9PT0gJ3dyaXRhYmxlJykge1xuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKGNvbnRyb2xsZXIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyUHJvY2Vzc0Nsb3NlKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gY29udHJvbGxlci5fY29udHJvbGxlZFdyaXRhYmxlU3RyZWFtO1xuICAgICAgICBXcml0YWJsZVN0cmVhbU1hcmtDbG9zZVJlcXVlc3RJbkZsaWdodChzdHJlYW0pO1xuICAgICAgICBEZXF1ZXVlVmFsdWUoY29udHJvbGxlcik7XG4gICAgICAgIGNvbnN0IHNpbmtDbG9zZVByb21pc2UgPSBjb250cm9sbGVyLl9jbG9zZUFsZ29yaXRobSgpO1xuICAgICAgICBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKGNvbnRyb2xsZXIpO1xuICAgICAgICB1cG9uUHJvbWlzZShzaW5rQ2xvc2VQcm9taXNlLCAoKSA9PiB7XG4gICAgICAgICAgICBXcml0YWJsZVN0cmVhbUZpbmlzaEluRmxpZ2h0Q2xvc2Uoc3RyZWFtKTtcbiAgICAgICAgfSwgcmVhc29uID0+IHtcbiAgICAgICAgICAgIFdyaXRhYmxlU3RyZWFtRmluaXNoSW5GbGlnaHRDbG9zZVdpdGhFcnJvcihzdHJlYW0sIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyUHJvY2Vzc1dyaXRlKGNvbnRyb2xsZXIsIGNodW5rKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRXcml0YWJsZVN0cmVhbTtcbiAgICAgICAgV3JpdGFibGVTdHJlYW1NYXJrRmlyc3RXcml0ZVJlcXVlc3RJbkZsaWdodChzdHJlYW0pO1xuICAgICAgICBjb25zdCBzaW5rV3JpdGVQcm9taXNlID0gY29udHJvbGxlci5fd3JpdGVBbGdvcml0aG0oY2h1bmspO1xuICAgICAgICB1cG9uUHJvbWlzZShzaW5rV3JpdGVQcm9taXNlLCAoKSA9PiB7XG4gICAgICAgICAgICBXcml0YWJsZVN0cmVhbUZpbmlzaEluRmxpZ2h0V3JpdGUoc3RyZWFtKTtcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gc3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgICAgIERlcXVldWVWYWx1ZShjb250cm9sbGVyKTtcbiAgICAgICAgICAgIGlmICghV3JpdGFibGVTdHJlYW1DbG9zZVF1ZXVlZE9ySW5GbGlnaHQoc3RyZWFtKSAmJiBzdGF0ZSA9PT0gJ3dyaXRhYmxlJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJhY2twcmVzc3VyZSA9IFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJHZXRCYWNrcHJlc3N1cmUoY29udHJvbGxlcik7XG4gICAgICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1VcGRhdGVCYWNrcHJlc3N1cmUoc3RyZWFtLCBiYWNrcHJlc3N1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckFkdmFuY2VRdWV1ZUlmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgICAgICB9LCByZWFzb24gPT4ge1xuICAgICAgICAgICAgaWYgKHN0cmVhbS5fc3RhdGUgPT09ICd3cml0YWJsZScpIHtcbiAgICAgICAgICAgICAgICBXcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKGNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgV3JpdGFibGVTdHJlYW1GaW5pc2hJbkZsaWdodFdyaXRlV2l0aEVycm9yKHN0cmVhbSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJHZXRCYWNrcHJlc3N1cmUoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBkZXNpcmVkU2l6ZSA9IFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJHZXREZXNpcmVkU2l6ZShjb250cm9sbGVyKTtcbiAgICAgICAgcmV0dXJuIGRlc2lyZWRTaXplIDw9IDA7XG4gICAgfVxuICAgIC8vIEEgY2xpZW50IG9mIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIgbWF5IHVzZSB0aGVzZSBmdW5jdGlvbnMgZGlyZWN0bHkgdG8gYnlwYXNzIHN0YXRlIGNoZWNrLlxuICAgIGZ1bmN0aW9uIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFcnJvcihjb250cm9sbGVyLCBlcnJvcikge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkV3JpdGFibGVTdHJlYW07XG4gICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbGVhckFsZ29yaXRobXMoY29udHJvbGxlcik7XG4gICAgICAgIFdyaXRhYmxlU3RyZWFtU3RhcnRFcnJvcmluZyhzdHJlYW0sIGVycm9yKTtcbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFdyaXRhYmxlU3RyZWFtLlxuICAgIGZ1bmN0aW9uIHN0cmVhbUJyYW5kQ2hlY2tFeGNlcHRpb24kMihuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKGBXcml0YWJsZVN0cmVhbS5wcm90b3R5cGUuJHtuYW1lfSBjYW4gb25seSBiZSB1c2VkIG9uIGEgV3JpdGFibGVTdHJlYW1gKTtcbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIuXG4gICAgZnVuY3Rpb24gZGVmYXVsdENvbnRyb2xsZXJCcmFuZENoZWNrRXhjZXB0aW9uJDIobmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlci5wcm90b3R5cGUuJHtuYW1lfSBjYW4gb25seSBiZSB1c2VkIG9uIGEgV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcmApO1xuICAgIH1cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyLlxuICAgIGZ1bmN0aW9uIGRlZmF1bHRXcml0ZXJCcmFuZENoZWNrRXhjZXB0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlci5wcm90b3R5cGUuJHtuYW1lfSBjYW4gb25seSBiZSB1c2VkIG9uIGEgV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyYCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlZmF1bHRXcml0ZXJMb2NrRXhjZXB0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCAnICsgbmFtZSArICcgYSBzdHJlYW0gdXNpbmcgYSByZWxlYXNlZCB3cml0ZXInKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmYXVsdFdyaXRlckNsb3NlZFByb21pc2VJbml0aWFsaXplKHdyaXRlcikge1xuICAgICAgICB3cml0ZXIuX2Nsb3NlZFByb21pc2UgPSBuZXdQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHdyaXRlci5fY2xvc2VkUHJvbWlzZV9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHdyaXRlci5fY2xvc2VkUHJvbWlzZV9yZWplY3QgPSByZWplY3Q7XG4gICAgICAgICAgICB3cml0ZXIuX2Nsb3NlZFByb21pc2VTdGF0ZSA9ICdwZW5kaW5nJztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZUFzUmVqZWN0ZWQod3JpdGVyLCByZWFzb24pIHtcbiAgICAgICAgZGVmYXVsdFdyaXRlckNsb3NlZFByb21pc2VJbml0aWFsaXplKHdyaXRlcik7XG4gICAgICAgIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlUmVqZWN0KHdyaXRlciwgcmVhc29uKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmYXVsdFdyaXRlckNsb3NlZFByb21pc2VJbml0aWFsaXplQXNSZXNvbHZlZCh3cml0ZXIpIHtcbiAgICAgICAgZGVmYXVsdFdyaXRlckNsb3NlZFByb21pc2VJbml0aWFsaXplKHdyaXRlcik7XG4gICAgICAgIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlUmVzb2x2ZSh3cml0ZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWZhdWx0V3JpdGVyQ2xvc2VkUHJvbWlzZVJlamVjdCh3cml0ZXIsIHJlYXNvbikge1xuICAgICAgICBpZiAod3JpdGVyLl9jbG9zZWRQcm9taXNlX3JlamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2V0UHJvbWlzZUlzSGFuZGxlZFRvVHJ1ZSh3cml0ZXIuX2Nsb3NlZFByb21pc2UpO1xuICAgICAgICB3cml0ZXIuX2Nsb3NlZFByb21pc2VfcmVqZWN0KHJlYXNvbik7XG4gICAgICAgIHdyaXRlci5fY2xvc2VkUHJvbWlzZV9yZXNvbHZlID0gdW5kZWZpbmVkO1xuICAgICAgICB3cml0ZXIuX2Nsb3NlZFByb21pc2VfcmVqZWN0ID0gdW5kZWZpbmVkO1xuICAgICAgICB3cml0ZXIuX2Nsb3NlZFByb21pc2VTdGF0ZSA9ICdyZWplY3RlZCc7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlUmVzZXRUb1JlamVjdGVkKHdyaXRlciwgcmVhc29uKSB7XG4gICAgICAgIGRlZmF1bHRXcml0ZXJDbG9zZWRQcm9taXNlSW5pdGlhbGl6ZUFzUmVqZWN0ZWQod3JpdGVyLCByZWFzb24pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWZhdWx0V3JpdGVyQ2xvc2VkUHJvbWlzZVJlc29sdmUod3JpdGVyKSB7XG4gICAgICAgIGlmICh3cml0ZXIuX2Nsb3NlZFByb21pc2VfcmVzb2x2ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGVyLl9jbG9zZWRQcm9taXNlX3Jlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgd3JpdGVyLl9jbG9zZWRQcm9taXNlX3Jlc29sdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHdyaXRlci5fY2xvc2VkUHJvbWlzZV9yZWplY3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHdyaXRlci5fY2xvc2VkUHJvbWlzZVN0YXRlID0gJ3Jlc29sdmVkJztcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmYXVsdFdyaXRlclJlYWR5UHJvbWlzZUluaXRpYWxpemUod3JpdGVyKSB7XG4gICAgICAgIHdyaXRlci5fcmVhZHlQcm9taXNlID0gbmV3UHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB3cml0ZXIuX3JlYWR5UHJvbWlzZV9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHdyaXRlci5fcmVhZHlQcm9taXNlX3JlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSk7XG4gICAgICAgIHdyaXRlci5fcmVhZHlQcm9taXNlU3RhdGUgPSAncGVuZGluZyc7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlZmF1bHRXcml0ZXJSZWFkeVByb21pc2VJbml0aWFsaXplQXNSZWplY3RlZCh3cml0ZXIsIHJlYXNvbikge1xuICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlSW5pdGlhbGl6ZSh3cml0ZXIpO1xuICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlUmVqZWN0KHdyaXRlciwgcmVhc29uKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmYXVsdFdyaXRlclJlYWR5UHJvbWlzZUluaXRpYWxpemVBc1Jlc29sdmVkKHdyaXRlcikge1xuICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlSW5pdGlhbGl6ZSh3cml0ZXIpO1xuICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlUmVzb2x2ZSh3cml0ZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlUmVqZWN0KHdyaXRlciwgcmVhc29uKSB7XG4gICAgICAgIGlmICh3cml0ZXIuX3JlYWR5UHJvbWlzZV9yZWplY3QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNldFByb21pc2VJc0hhbmRsZWRUb1RydWUod3JpdGVyLl9yZWFkeVByb21pc2UpO1xuICAgICAgICB3cml0ZXIuX3JlYWR5UHJvbWlzZV9yZWplY3QocmVhc29uKTtcbiAgICAgICAgd3JpdGVyLl9yZWFkeVByb21pc2VfcmVzb2x2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgd3JpdGVyLl9yZWFkeVByb21pc2VfcmVqZWN0ID0gdW5kZWZpbmVkO1xuICAgICAgICB3cml0ZXIuX3JlYWR5UHJvbWlzZVN0YXRlID0gJ3JlamVjdGVkJztcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmYXVsdFdyaXRlclJlYWR5UHJvbWlzZVJlc2V0KHdyaXRlcikge1xuICAgICAgICBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlSW5pdGlhbGl6ZSh3cml0ZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWZhdWx0V3JpdGVyUmVhZHlQcm9taXNlUmVzZXRUb1JlamVjdGVkKHdyaXRlciwgcmVhc29uKSB7XG4gICAgICAgIGRlZmF1bHRXcml0ZXJSZWFkeVByb21pc2VJbml0aWFsaXplQXNSZWplY3RlZCh3cml0ZXIsIHJlYXNvbik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlZmF1bHRXcml0ZXJSZWFkeVByb21pc2VSZXNvbHZlKHdyaXRlcikge1xuICAgICAgICBpZiAod3JpdGVyLl9yZWFkeVByb21pc2VfcmVzb2x2ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgd3JpdGVyLl9yZWFkeVByb21pc2VfcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICB3cml0ZXIuX3JlYWR5UHJvbWlzZV9yZXNvbHZlID0gdW5kZWZpbmVkO1xuICAgICAgICB3cml0ZXIuX3JlYWR5UHJvbWlzZV9yZWplY3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHdyaXRlci5fcmVhZHlQcm9taXNlU3RhdGUgPSAnZnVsZmlsbGVkJztcbiAgICB9XG5cbiAgICAvLy8gPHJlZmVyZW5jZSBsaWI9XCJkb21cIiAvPlxuICAgIGNvbnN0IE5hdGl2ZURPTUV4Y2VwdGlvbiA9IHR5cGVvZiBET01FeGNlcHRpb24gIT09ICd1bmRlZmluZWQnID8gRE9NRXhjZXB0aW9uIDogdW5kZWZpbmVkO1xuXG4gICAgLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJub2RlXCIgLz5cbiAgICBmdW5jdGlvbiBpc0RPTUV4Y2VwdGlvbkNvbnN0cnVjdG9yKGN0b3IpIHtcbiAgICAgICAgaWYgKCEodHlwZW9mIGN0b3IgPT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIGN0b3IgPT09ICdvYmplY3QnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgY3RvcigpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKF9hKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlRE9NRXhjZXB0aW9uUG9seWZpbGwoKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgICAgICAgY29uc3QgY3RvciA9IGZ1bmN0aW9uIERPTUV4Y2VwdGlvbihtZXNzYWdlLCBuYW1lKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlIHx8ICcnO1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZSB8fCAnRXJyb3InO1xuICAgICAgICAgICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgICAgICAgICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY3Rvci5wcm90b3R5cGUsICdjb25zdHJ1Y3RvcicsIHsgdmFsdWU6IGN0b3IsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiBjdG9yO1xuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVkZWNsYXJlXG4gICAgY29uc3QgRE9NRXhjZXB0aW9uJDEgPSBpc0RPTUV4Y2VwdGlvbkNvbnN0cnVjdG9yKE5hdGl2ZURPTUV4Y2VwdGlvbikgPyBOYXRpdmVET01FeGNlcHRpb24gOiBjcmVhdGVET01FeGNlcHRpb25Qb2x5ZmlsbCgpO1xuXG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1QaXBlVG8oc291cmNlLCBkZXN0LCBwcmV2ZW50Q2xvc2UsIHByZXZlbnRBYm9ydCwgcHJldmVudENhbmNlbCwgc2lnbmFsKSB7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IEFjcXVpcmVSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIoc291cmNlKTtcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gQWNxdWlyZVdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcihkZXN0KTtcbiAgICAgICAgc291cmNlLl9kaXN0dXJiZWQgPSB0cnVlO1xuICAgICAgICBsZXQgc2h1dHRpbmdEb3duID0gZmFsc2U7XG4gICAgICAgIC8vIFRoaXMgaXMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBzcGVjJ3MgcmVxdWlyZW1lbnQgdGhhdCB3ZSB3YWl0IGZvciBvbmdvaW5nIHdyaXRlcyBkdXJpbmcgc2h1dGRvd24uXG4gICAgICAgIGxldCBjdXJyZW50V3JpdGUgPSBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJldHVybiBuZXdQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBhYm9ydEFsZ29yaXRobTtcbiAgICAgICAgICAgIGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFib3J0QWxnb3JpdGhtID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBET01FeGNlcHRpb24kMSgnQWJvcnRlZCcsICdBYm9ydEVycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFjdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcmV2ZW50QWJvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbnMucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlc3QuX3N0YXRlID09PSAnd3JpdGFibGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBXcml0YWJsZVN0cmVhbUFib3J0KGRlc3QsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlZFdpdGgodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJldmVudENhbmNlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9ucy5wdXNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlLl9zdGF0ZSA9PT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gUmVhZGFibGVTdHJlYW1DYW5jZWwoc291cmNlLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzaHV0ZG93bldpdGhBY3Rpb24oKCkgPT4gUHJvbWlzZS5hbGwoYWN0aW9ucy5tYXAoYWN0aW9uID0+IGFjdGlvbigpKSksIHRydWUsIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChzaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgICAgICAgICBhYm9ydEFsZ29yaXRobSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0QWxnb3JpdGhtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFVzaW5nIHJlYWRlciBhbmQgd3JpdGVyLCByZWFkIGFsbCBjaHVua3MgZnJvbSB0aGlzIGFuZCB3cml0ZSB0aGVtIHRvIGRlc3RcbiAgICAgICAgICAgIC8vIC0gQmFja3ByZXNzdXJlIG11c3QgYmUgZW5mb3JjZWRcbiAgICAgICAgICAgIC8vIC0gU2h1dGRvd24gbXVzdCBzdG9wIGFsbCBhY3Rpdml0eVxuICAgICAgICAgICAgZnVuY3Rpb24gcGlwZUxvb3AoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld1Byb21pc2UoKHJlc29sdmVMb29wLCByZWplY3RMb29wKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIG5leHQoZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlTG9vcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVXNlIGBQZXJmb3JtUHJvbWlzZVRoZW5gIGluc3RlYWQgb2YgYHVwb25Qcm9taXNlYCB0byBhdm9pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZGluZyB1bm5lY2Vzc2FyeSBgLmNhdGNoKHJldGhyb3dBc3NlcnRpb25FcnJvclJlamVjdGlvbilgIGhhbmRsZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUGVyZm9ybVByb21pc2VUaGVuKHBpcGVTdGVwKCksIG5leHQsIHJlamVjdExvb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5leHQoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcGlwZVN0ZXAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNodXR0aW5nRG93bikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmVkV2l0aCh0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBlcmZvcm1Qcm9taXNlVGhlbih3cml0ZXIuX3JlYWR5UHJvbWlzZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3UHJvbWlzZSgocmVzb2x2ZVJlYWQsIHJlamVjdFJlYWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlclJlYWQocmVhZGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NodW5rU3RlcHM6IGNodW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFdyaXRlID0gUGVyZm9ybVByb21pc2VUaGVuKFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcldyaXRlKHdyaXRlciwgY2h1bmspLCB1bmRlZmluZWQsIG5vb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlUmVhZChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY2xvc2VTdGVwczogKCkgPT4gcmVzb2x2ZVJlYWQodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2Vycm9yU3RlcHM6IHJlamVjdFJlYWRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEVycm9ycyBtdXN0IGJlIHByb3BhZ2F0ZWQgZm9yd2FyZFxuICAgICAgICAgICAgaXNPckJlY29tZXNFcnJvcmVkKHNvdXJjZSwgcmVhZGVyLl9jbG9zZWRQcm9taXNlLCBzdG9yZWRFcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2ZW50QWJvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2h1dGRvd25XaXRoQWN0aW9uKCgpID0+IFdyaXRhYmxlU3RyZWFtQWJvcnQoZGVzdCwgc3RvcmVkRXJyb3IpLCB0cnVlLCBzdG9yZWRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaHV0ZG93bih0cnVlLCBzdG9yZWRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBFcnJvcnMgbXVzdCBiZSBwcm9wYWdhdGVkIGJhY2t3YXJkXG4gICAgICAgICAgICBpc09yQmVjb21lc0Vycm9yZWQoZGVzdCwgd3JpdGVyLl9jbG9zZWRQcm9taXNlLCBzdG9yZWRFcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFwcmV2ZW50Q2FuY2VsKSB7XG4gICAgICAgICAgICAgICAgICAgIHNodXRkb3duV2l0aEFjdGlvbigoKSA9PiBSZWFkYWJsZVN0cmVhbUNhbmNlbChzb3VyY2UsIHN0b3JlZEVycm9yKSwgdHJ1ZSwgc3RvcmVkRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2h1dGRvd24odHJ1ZSwgc3RvcmVkRXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ2xvc2luZyBtdXN0IGJlIHByb3BhZ2F0ZWQgZm9yd2FyZFxuICAgICAgICAgICAgaXNPckJlY29tZXNDbG9zZWQoc291cmNlLCByZWFkZXIuX2Nsb3NlZFByb21pc2UsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXByZXZlbnRDbG9zZSkge1xuICAgICAgICAgICAgICAgICAgICBzaHV0ZG93bldpdGhBY3Rpb24oKCkgPT4gV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyQ2xvc2VXaXRoRXJyb3JQcm9wYWdhdGlvbih3cml0ZXIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNodXRkb3duKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBDbG9zaW5nIG11c3QgYmUgcHJvcGFnYXRlZCBiYWNrd2FyZFxuICAgICAgICAgICAgaWYgKFdyaXRhYmxlU3RyZWFtQ2xvc2VRdWV1ZWRPckluRmxpZ2h0KGRlc3QpIHx8IGRlc3QuX3N0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlc3RDbG9zZWQgPSBuZXcgVHlwZUVycm9yKCd0aGUgZGVzdGluYXRpb24gd3JpdGFibGUgc3RyZWFtIGNsb3NlZCBiZWZvcmUgYWxsIGRhdGEgY291bGQgYmUgcGlwZWQgdG8gaXQnKTtcbiAgICAgICAgICAgICAgICBpZiAoIXByZXZlbnRDYW5jZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgc2h1dGRvd25XaXRoQWN0aW9uKCgpID0+IFJlYWRhYmxlU3RyZWFtQ2FuY2VsKHNvdXJjZSwgZGVzdENsb3NlZCksIHRydWUsIGRlc3RDbG9zZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2h1dGRvd24odHJ1ZSwgZGVzdENsb3NlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0UHJvbWlzZUlzSGFuZGxlZFRvVHJ1ZShwaXBlTG9vcCgpKTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHdhaXRGb3JXcml0ZXNUb0ZpbmlzaCgpIHtcbiAgICAgICAgICAgICAgICAvLyBBbm90aGVyIHdyaXRlIG1heSBoYXZlIHN0YXJ0ZWQgd2hpbGUgd2Ugd2VyZSB3YWl0aW5nIG9uIHRoaXMgY3VycmVudFdyaXRlLCBzbyB3ZSBoYXZlIHRvIGJlIHN1cmUgdG8gd2FpdFxuICAgICAgICAgICAgICAgIC8vIGZvciB0aGF0IHRvby5cbiAgICAgICAgICAgICAgICBjb25zdCBvbGRDdXJyZW50V3JpdGUgPSBjdXJyZW50V3JpdGU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFBlcmZvcm1Qcm9taXNlVGhlbihjdXJyZW50V3JpdGUsICgpID0+IG9sZEN1cnJlbnRXcml0ZSAhPT0gY3VycmVudFdyaXRlID8gd2FpdEZvcldyaXRlc1RvRmluaXNoKCkgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXNPckJlY29tZXNFcnJvcmVkKHN0cmVhbSwgcHJvbWlzZSwgYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0cmVhbS5fc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb24oc3RyZWFtLl9zdG9yZWRFcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cG9uUmVqZWN0aW9uKHByb21pc2UsIGFjdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXNPckJlY29tZXNDbG9zZWQoc3RyZWFtLCBwcm9taXNlLCBhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RyZWFtLl9zdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1cG9uRnVsZmlsbG1lbnQocHJvbWlzZSwgYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBzaHV0ZG93bldpdGhBY3Rpb24oYWN0aW9uLCBvcmlnaW5hbElzRXJyb3IsIG9yaWdpbmFsRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2h1dHRpbmdEb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2h1dHRpbmdEb3duID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoZGVzdC5fc3RhdGUgPT09ICd3cml0YWJsZScgJiYgIVdyaXRhYmxlU3RyZWFtQ2xvc2VRdWV1ZWRPckluRmxpZ2h0KGRlc3QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwb25GdWxmaWxsbWVudCh3YWl0Rm9yV3JpdGVzVG9GaW5pc2goKSwgZG9UaGVSZXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRvVGhlUmVzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBkb1RoZVJlc3QoKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwb25Qcm9taXNlKGFjdGlvbigpLCAoKSA9PiBmaW5hbGl6ZShvcmlnaW5hbElzRXJyb3IsIG9yaWdpbmFsRXJyb3IpLCBuZXdFcnJvciA9PiBmaW5hbGl6ZSh0cnVlLCBuZXdFcnJvcikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIHNodXRkb3duKGlzRXJyb3IsIGVycm9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNodXR0aW5nRG93bikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNodXR0aW5nRG93biA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGRlc3QuX3N0YXRlID09PSAnd3JpdGFibGUnICYmICFXcml0YWJsZVN0cmVhbUNsb3NlUXVldWVkT3JJbkZsaWdodChkZXN0KSkge1xuICAgICAgICAgICAgICAgICAgICB1cG9uRnVsZmlsbG1lbnQod2FpdEZvcldyaXRlc1RvRmluaXNoKCksICgpID0+IGZpbmFsaXplKGlzRXJyb3IsIGVycm9yKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaW5hbGl6ZShpc0Vycm9yLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZmluYWxpemUoaXNFcnJvciwgZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXJSZWxlYXNlKHdyaXRlcik7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1SZWFkZXJHZW5lcmljUmVsZWFzZShyZWFkZXIpO1xuICAgICAgICAgICAgICAgIGlmIChzaWduYWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBzaWduYWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBhYm9ydEFsZ29yaXRobSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpc0Vycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBbGxvd3MgY29udHJvbCBvZiBhIHtAbGluayBSZWFkYWJsZVN0cmVhbSB8IHJlYWRhYmxlIHN0cmVhbX0ncyBzdGF0ZSBhbmQgaW50ZXJuYWwgcXVldWUuXG4gICAgICpcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgY2xhc3MgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlciB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSWxsZWdhbCBjb25zdHJ1Y3RvcicpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBkZXNpcmVkIHNpemUgdG8gZmlsbCB0aGUgY29udHJvbGxlZCBzdHJlYW0ncyBpbnRlcm5hbCBxdWV1ZS4gSXQgY2FuIGJlIG5lZ2F0aXZlLCBpZiB0aGUgcXVldWUgaXNcbiAgICAgICAgICogb3Zlci1mdWxsLiBBbiB1bmRlcmx5aW5nIHNvdXJjZSBvdWdodCB0byB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZXRlcm1pbmUgd2hlbiBhbmQgaG93IHRvIGFwcGx5IGJhY2twcmVzc3VyZS5cbiAgICAgICAgICovXG4gICAgICAgIGdldCBkZXNpcmVkU2l6ZSgpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGVmYXVsdENvbnRyb2xsZXJCcmFuZENoZWNrRXhjZXB0aW9uJDEoJ2Rlc2lyZWRTaXplJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckdldERlc2lyZWRTaXplKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDbG9zZXMgdGhlIGNvbnRyb2xsZWQgcmVhZGFibGUgc3RyZWFtLiBDb25zdW1lcnMgd2lsbCBzdGlsbCBiZSBhYmxlIHRvIHJlYWQgYW55IHByZXZpb3VzbHktZW5xdWV1ZWQgY2h1bmtzIGZyb21cbiAgICAgICAgICogdGhlIHN0cmVhbSwgYnV0IG9uY2UgdGhvc2UgYXJlIHJlYWQsIHRoZSBzdHJlYW0gd2lsbCBiZWNvbWUgY2xvc2VkLlxuICAgICAgICAgKi9cbiAgICAgICAgY2xvc2UoKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGRlZmF1bHRDb250cm9sbGVyQnJhbmRDaGVja0V4Y2VwdGlvbiQxKCdjbG9zZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2FuQ2xvc2VPckVucXVldWUodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgc3RyZWFtIGlzIG5vdCBpbiBhIHN0YXRlIHRoYXQgcGVybWl0cyBjbG9zZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNsb3NlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGVucXVldWUoY2h1bmsgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGVmYXVsdENvbnRyb2xsZXJCcmFuZENoZWNrRXhjZXB0aW9uJDEoJ2VucXVldWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNhbkNsb3NlT3JFbnF1ZXVlKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIHN0cmVhbSBpcyBub3QgaW4gYSBzdGF0ZSB0aGF0IHBlcm1pdHMgZW5xdWV1ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFbnF1ZXVlKHRoaXMsIGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogRXJyb3JzIHRoZSBjb250cm9sbGVkIHJlYWRhYmxlIHN0cmVhbSwgbWFraW5nIGFsbCBmdXR1cmUgaW50ZXJhY3Rpb25zIHdpdGggaXQgZmFpbCB3aXRoIHRoZSBnaXZlbiBlcnJvciBgZWAuXG4gICAgICAgICAqL1xuICAgICAgICBlcnJvcihlID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcih0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGRlZmF1bHRDb250cm9sbGVyQnJhbmRDaGVja0V4Y2VwdGlvbiQxKCdlcnJvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKHRoaXMsIGUpO1xuICAgICAgICB9XG4gICAgICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICAgICAgW0NhbmNlbFN0ZXBzXShyZWFzb24pIHtcbiAgICAgICAgICAgIFJlc2V0UXVldWUodGhpcyk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9jYW5jZWxBbGdvcml0aG0ocmVhc29uKTtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbGVhckFsZ29yaXRobXModGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIC8qKiBAaW50ZXJuYWwgKi9cbiAgICAgICAgW1B1bGxTdGVwc10ocmVhZFJlcXVlc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0cmVhbSA9IHRoaXMuX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBEZXF1ZXVlVmFsdWUodGhpcyk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2Nsb3NlUmVxdWVzdGVkICYmIHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZVN0cmVhbUNsb3NlKHN0cmVhbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2FsbFB1bGxJZk5lZWRlZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVhZFJlcXVlc3QuX2NodW5rU3RlcHMoY2h1bmspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1BZGRSZWFkUmVxdWVzdChzdHJlYW0sIHJlYWRSZXF1ZXN0KTtcbiAgICAgICAgICAgICAgICBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2FsbFB1bGxJZk5lZWRlZCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSwge1xuICAgICAgICBjbG9zZTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIGVucXVldWU6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICBlcnJvcjogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIGRlc2lyZWRTaXplOiB7IGVudW1lcmFibGU6IHRydWUgfVxuICAgIH0pO1xuICAgIGlmICh0eXBlb2YgU3ltYm9sUG9seWZpbGwudG9TdHJpbmdUYWcgPT09ICdzeW1ib2wnKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSwgU3ltYm9sUG9seWZpbGwudG9TdHJpbmdUYWcsIHtcbiAgICAgICAgICAgIHZhbHVlOiAnUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcicsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEFic3RyYWN0IG9wZXJhdGlvbnMgZm9yIHRoZSBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLlxuICAgIGZ1bmN0aW9uIElzUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcih4KSB7XG4gICAgICAgIGlmICghdHlwZUlzT2JqZWN0KHgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoeCwgJ19jb250cm9sbGVkUmVhZGFibGVTdHJlYW0nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNhbGxQdWxsSWZOZWVkZWQoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBzaG91bGRQdWxsID0gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlclNob3VsZENhbGxQdWxsKGNvbnRyb2xsZXIpO1xuICAgICAgICBpZiAoIXNob3VsZFB1bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udHJvbGxlci5fcHVsbGluZykge1xuICAgICAgICAgICAgY29udHJvbGxlci5fcHVsbEFnYWluID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb250cm9sbGVyLl9wdWxsaW5nID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgcHVsbFByb21pc2UgPSBjb250cm9sbGVyLl9wdWxsQWxnb3JpdGhtKCk7XG4gICAgICAgIHVwb25Qcm9taXNlKHB1bGxQcm9taXNlLCAoKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sbGVyLl9wdWxsaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoY29udHJvbGxlci5fcHVsbEFnYWluKSB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5fcHVsbEFnYWluID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNhbGxQdWxsSWZOZWVkZWQoY29udHJvbGxlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGUgPT4ge1xuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKGNvbnRyb2xsZXIsIGUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlclNob3VsZENhbGxQdWxsKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gY29udHJvbGxlci5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtO1xuICAgICAgICBpZiAoIVJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDYW5DbG9zZU9yRW5xdWV1ZShjb250cm9sbGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29udHJvbGxlci5fc3RhcnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChJc1JlYWRhYmxlU3RyZWFtTG9ja2VkKHN0cmVhbSkgJiYgUmVhZGFibGVTdHJlYW1HZXROdW1SZWFkUmVxdWVzdHMoc3RyZWFtKSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlc2lyZWRTaXplID0gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckdldERlc2lyZWRTaXplKGNvbnRyb2xsZXIpO1xuICAgICAgICBpZiAoZGVzaXJlZFNpemUgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbGVhckFsZ29yaXRobXMoY29udHJvbGxlcikge1xuICAgICAgICBjb250cm9sbGVyLl9wdWxsQWxnb3JpdGhtID0gdW5kZWZpbmVkO1xuICAgICAgICBjb250cm9sbGVyLl9jYW5jZWxBbGdvcml0aG0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnRyb2xsZXIuX3N0cmF0ZWd5U2l6ZUFsZ29yaXRobSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgLy8gQSBjbGllbnQgb2YgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlciBtYXkgdXNlIHRoZXNlIGZ1bmN0aW9ucyBkaXJlY3RseSB0byBieXBhc3Mgc3RhdGUgY2hlY2suXG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNsb3NlKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgaWYgKCFSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2FuQ2xvc2VPckVucXVldWUoY29udHJvbGxlcikpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW07XG4gICAgICAgIGNvbnRyb2xsZXIuX2Nsb3NlUmVxdWVzdGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNvbnRyb2xsZXIuX3F1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNsZWFyQWxnb3JpdGhtcyhjb250cm9sbGVyKTtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtQ2xvc2Uoc3RyZWFtKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyRW5xdWV1ZShjb250cm9sbGVyLCBjaHVuaykge1xuICAgICAgICBpZiAoIVJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDYW5DbG9zZU9yRW5xdWV1ZShjb250cm9sbGVyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbTtcbiAgICAgICAgaWYgKElzUmVhZGFibGVTdHJlYW1Mb2NrZWQoc3RyZWFtKSAmJiBSZWFkYWJsZVN0cmVhbUdldE51bVJlYWRSZXF1ZXN0cyhzdHJlYW0pID4gMCkge1xuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1GdWxmaWxsUmVhZFJlcXVlc3Qoc3RyZWFtLCBjaHVuaywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGNodW5rU2l6ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2h1bmtTaXplID0gY29udHJvbGxlci5fc3RyYXRlZ3lTaXplQWxnb3JpdGhtKGNodW5rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChjaHVua1NpemVFKSB7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKGNvbnRyb2xsZXIsIGNodW5rU2l6ZUUpO1xuICAgICAgICAgICAgICAgIHRocm93IGNodW5rU2l6ZUU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIEVucXVldWVWYWx1ZVdpdGhTaXplKGNvbnRyb2xsZXIsIGNodW5rLCBjaHVua1NpemUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVucXVldWVFKSB7XG4gICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKGNvbnRyb2xsZXIsIGVucXVldWVFKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlbnF1ZXVlRTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2FsbFB1bGxJZk5lZWRlZChjb250cm9sbGVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKGNvbnRyb2xsZXIsIGUpIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gY29udHJvbGxlci5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtO1xuICAgICAgICBpZiAoc3RyZWFtLl9zdGF0ZSAhPT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFJlc2V0UXVldWUoY29udHJvbGxlcik7XG4gICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbGVhckFsZ29yaXRobXMoY29udHJvbGxlcik7XG4gICAgICAgIFJlYWRhYmxlU3RyZWFtRXJyb3Ioc3RyZWFtLCBlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckdldERlc2lyZWRTaXplKGNvbnRyb2xsZXIpIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBjb250cm9sbGVyLl9jb250cm9sbGVkUmVhZGFibGVTdHJlYW0uX3N0YXRlO1xuICAgICAgICBpZiAoc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRyb2xsZXIuX3N0cmF0ZWd5SFdNIC0gY29udHJvbGxlci5fcXVldWVUb3RhbFNpemU7XG4gICAgfVxuICAgIC8vIFRoaXMgaXMgdXNlZCBpbiB0aGUgaW1wbGVtZW50YXRpb24gb2YgVHJhbnNmb3JtU3RyZWFtLlxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJIYXNCYWNrcHJlc3N1cmUoY29udHJvbGxlcikge1xuICAgICAgICBpZiAoUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlclNob3VsZENhbGxQdWxsKGNvbnRyb2xsZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDYW5DbG9zZU9yRW5xdWV1ZShjb250cm9sbGVyKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gY29udHJvbGxlci5fY29udHJvbGxlZFJlYWRhYmxlU3RyZWFtLl9zdGF0ZTtcbiAgICAgICAgaWYgKCFjb250cm9sbGVyLl9jbG9zZVJlcXVlc3RlZCAmJiBzdGF0ZSA9PT0gJ3JlYWRhYmxlJykge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBTZXRVcFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIoc3RyZWFtLCBjb250cm9sbGVyLCBzdGFydEFsZ29yaXRobSwgcHVsbEFsZ29yaXRobSwgY2FuY2VsQWxnb3JpdGhtLCBoaWdoV2F0ZXJNYXJrLCBzaXplQWxnb3JpdGhtKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRSZWFkYWJsZVN0cmVhbSA9IHN0cmVhbTtcbiAgICAgICAgY29udHJvbGxlci5fcXVldWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnRyb2xsZXIuX3F1ZXVlVG90YWxTaXplID0gdW5kZWZpbmVkO1xuICAgICAgICBSZXNldFF1ZXVlKGNvbnRyb2xsZXIpO1xuICAgICAgICBjb250cm9sbGVyLl9zdGFydGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnRyb2xsZXIuX2Nsb3NlUmVxdWVzdGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnRyb2xsZXIuX3B1bGxBZ2FpbiA9IGZhbHNlO1xuICAgICAgICBjb250cm9sbGVyLl9wdWxsaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnRyb2xsZXIuX3N0cmF0ZWd5U2l6ZUFsZ29yaXRobSA9IHNpemVBbGdvcml0aG07XG4gICAgICAgIGNvbnRyb2xsZXIuX3N0cmF0ZWd5SFdNID0gaGlnaFdhdGVyTWFyaztcbiAgICAgICAgY29udHJvbGxlci5fcHVsbEFsZ29yaXRobSA9IHB1bGxBbGdvcml0aG07XG4gICAgICAgIGNvbnRyb2xsZXIuX2NhbmNlbEFsZ29yaXRobSA9IGNhbmNlbEFsZ29yaXRobTtcbiAgICAgICAgc3RyZWFtLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgICAgICBjb25zdCBzdGFydFJlc3VsdCA9IHN0YXJ0QWxnb3JpdGhtKCk7XG4gICAgICAgIHVwb25Qcm9taXNlKHByb21pc2VSZXNvbHZlZFdpdGgoc3RhcnRSZXN1bHQpLCAoKSA9PiB7XG4gICAgICAgICAgICBjb250cm9sbGVyLl9zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDYWxsUHVsbElmTmVlZGVkKGNvbnRyb2xsZXIpO1xuICAgICAgICB9LCByID0+IHtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFcnJvcihjb250cm9sbGVyLCByKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFNldFVwUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckZyb21VbmRlcmx5aW5nU291cmNlKHN0cmVhbSwgdW5kZXJseWluZ1NvdXJjZSwgaGlnaFdhdGVyTWFyaywgc2l6ZUFsZ29yaXRobSkge1xuICAgICAgICBjb25zdCBjb250cm9sbGVyID0gT2JqZWN0LmNyZWF0ZShSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSk7XG4gICAgICAgIGxldCBzdGFydEFsZ29yaXRobSA9ICgpID0+IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHB1bGxBbGdvcml0aG0gPSAoKSA9PiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgIGxldCBjYW5jZWxBbGdvcml0aG0gPSAoKSA9PiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgIGlmICh1bmRlcmx5aW5nU291cmNlLnN0YXJ0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN0YXJ0QWxnb3JpdGhtID0gKCkgPT4gdW5kZXJseWluZ1NvdXJjZS5zdGFydChjb250cm9sbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodW5kZXJseWluZ1NvdXJjZS5wdWxsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHB1bGxBbGdvcml0aG0gPSAoKSA9PiB1bmRlcmx5aW5nU291cmNlLnB1bGwoY29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVuZGVybHlpbmdTb3VyY2UuY2FuY2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNhbmNlbEFsZ29yaXRobSA9IHJlYXNvbiA9PiB1bmRlcmx5aW5nU291cmNlLmNhbmNlbChyZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIFNldFVwUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcihzdHJlYW0sIGNvbnRyb2xsZXIsIHN0YXJ0QWxnb3JpdGhtLCBwdWxsQWxnb3JpdGhtLCBjYW5jZWxBbGdvcml0aG0sIGhpZ2hXYXRlck1hcmssIHNpemVBbGdvcml0aG0pO1xuICAgIH1cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlci5cbiAgICBmdW5jdGlvbiBkZWZhdWx0Q29udHJvbGxlckJyYW5kQ2hlY2tFeGNlcHRpb24kMShuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKGBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZS4ke25hbWV9IGNhbiBvbmx5IGJlIHVzZWQgb24gYSBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyYCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUmVhZGFibGVTdHJlYW1UZWUoc3RyZWFtLCBjbG9uZUZvckJyYW5jaDIpIHtcbiAgICAgICAgaWYgKElzUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlcihzdHJlYW0uX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcikpIHtcbiAgICAgICAgICAgIHJldHVybiBSZWFkYWJsZUJ5dGVTdHJlYW1UZWUoc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUmVhZGFibGVTdHJlYW1EZWZhdWx0VGVlKHN0cmVhbSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtRGVmYXVsdFRlZShzdHJlYW0sIGNsb25lRm9yQnJhbmNoMikge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBBY3F1aXJlUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyKHN0cmVhbSk7XG4gICAgICAgIGxldCByZWFkaW5nID0gZmFsc2U7XG4gICAgICAgIGxldCByZWFkQWdhaW4gPSBmYWxzZTtcbiAgICAgICAgbGV0IGNhbmNlbGVkMSA9IGZhbHNlO1xuICAgICAgICBsZXQgY2FuY2VsZWQyID0gZmFsc2U7XG4gICAgICAgIGxldCByZWFzb24xO1xuICAgICAgICBsZXQgcmVhc29uMjtcbiAgICAgICAgbGV0IGJyYW5jaDE7XG4gICAgICAgIGxldCBicmFuY2gyO1xuICAgICAgICBsZXQgcmVzb2x2ZUNhbmNlbFByb21pc2U7XG4gICAgICAgIGNvbnN0IGNhbmNlbFByb21pc2UgPSBuZXdQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZUNhbmNlbFByb21pc2UgPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICAgICAgZnVuY3Rpb24gcHVsbEFsZ29yaXRobSgpIHtcbiAgICAgICAgICAgIGlmIChyZWFkaW5nKSB7XG4gICAgICAgICAgICAgICAgcmVhZEFnYWluID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVhZGluZyA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCByZWFkUmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICBfY2h1bmtTdGVwczogY2h1bmsgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIGRlbGF5ZWQgYSBtaWNyb3Rhc2sgYmVjYXVzZSBpdCB0YWtlcyBhdCBsZWFzdCBhIG1pY3JvdGFzayB0byBkZXRlY3QgZXJyb3JzICh1c2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyByZWFkZXIuX2Nsb3NlZFByb21pc2UgYmVsb3cpLCBhbmQgd2Ugd2FudCBlcnJvcnMgaW4gc3RyZWFtIHRvIGVycm9yIGJvdGggYnJhbmNoZXMgaW1tZWRpYXRlbHkuIFdlIGNhbm5vdCBsZXRcbiAgICAgICAgICAgICAgICAgICAgLy8gc3VjY2Vzc2Z1bCBzeW5jaHJvbm91c2x5LWF2YWlsYWJsZSByZWFkcyBnZXQgYWhlYWQgb2YgYXN5bmNocm9ub3VzbHktYXZhaWxhYmxlIGVycm9ycy5cbiAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZEFnYWluID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaHVuazEgPSBjaHVuaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rMiA9IGNodW5rO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gd2F5IHRvIGFjY2VzcyB0aGUgY2xvbmluZyBjb2RlIHJpZ2h0IG5vdyBpbiB0aGUgcmVmZXJlbmNlIGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2UgYWRkIG9uZSB0aGVuIHdlJ2xsIG5lZWQgYW4gaW1wbGVtZW50YXRpb24gZm9yIHNlcmlhbGl6YWJsZSBvYmplY3RzLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKCFjYW5jZWxlZDIgJiYgY2xvbmVGb3JCcmFuY2gyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGNodW5rMiA9IFN0cnVjdHVyZWREZXNlcmlhbGl6ZShTdHJ1Y3R1cmVkU2VyaWFsaXplKGNodW5rMikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjYW5jZWxlZDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyRW5xdWV1ZShicmFuY2gxLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIGNodW5rMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbmNlbGVkMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFbnF1ZXVlKGJyYW5jaDIuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciwgY2h1bmsyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWFkQWdhaW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWxsQWxnb3JpdGhtKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX2Nsb3NlU3RlcHM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbmNlbGVkMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNsb3NlKGJyYW5jaDEuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYW5jZWxlZDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbG9zZShicmFuY2gyLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2FuY2VsZWQxIHx8ICFjYW5jZWxlZDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVDYW5jZWxQcm9taXNlKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9lcnJvclN0ZXBzOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyUmVhZChyZWFkZXIsIHJlYWRSZXF1ZXN0KTtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gY2FuY2VsMUFsZ29yaXRobShyZWFzb24pIHtcbiAgICAgICAgICAgIGNhbmNlbGVkMSA9IHRydWU7XG4gICAgICAgICAgICByZWFzb24xID0gcmVhc29uO1xuICAgICAgICAgICAgaWYgKGNhbmNlbGVkMikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvc2l0ZVJlYXNvbiA9IENyZWF0ZUFycmF5RnJvbUxpc3QoW3JlYXNvbjEsIHJlYXNvbjJdKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW5jZWxSZXN1bHQgPSBSZWFkYWJsZVN0cmVhbUNhbmNlbChzdHJlYW0sIGNvbXBvc2l0ZVJlYXNvbik7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZUNhbmNlbFByb21pc2UoY2FuY2VsUmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjYW5jZWxQcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGNhbmNlbDJBbGdvcml0aG0ocmVhc29uKSB7XG4gICAgICAgICAgICBjYW5jZWxlZDIgPSB0cnVlO1xuICAgICAgICAgICAgcmVhc29uMiA9IHJlYXNvbjtcbiAgICAgICAgICAgIGlmIChjYW5jZWxlZDEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb3NpdGVSZWFzb24gPSBDcmVhdGVBcnJheUZyb21MaXN0KFtyZWFzb24xLCByZWFzb24yXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuY2VsUmVzdWx0ID0gUmVhZGFibGVTdHJlYW1DYW5jZWwoc3RyZWFtLCBjb21wb3NpdGVSZWFzb24pO1xuICAgICAgICAgICAgICAgIHJlc29sdmVDYW5jZWxQcm9taXNlKGNhbmNlbFJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2FuY2VsUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBzdGFydEFsZ29yaXRobSgpIHtcbiAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgfVxuICAgICAgICBicmFuY2gxID0gQ3JlYXRlUmVhZGFibGVTdHJlYW0oc3RhcnRBbGdvcml0aG0sIHB1bGxBbGdvcml0aG0sIGNhbmNlbDFBbGdvcml0aG0pO1xuICAgICAgICBicmFuY2gyID0gQ3JlYXRlUmVhZGFibGVTdHJlYW0oc3RhcnRBbGdvcml0aG0sIHB1bGxBbGdvcml0aG0sIGNhbmNlbDJBbGdvcml0aG0pO1xuICAgICAgICB1cG9uUmVqZWN0aW9uKHJlYWRlci5fY2xvc2VkUHJvbWlzZSwgKHIpID0+IHtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFcnJvcihicmFuY2gxLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIHIpO1xuICAgICAgICAgICAgUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKGJyYW5jaDIuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciwgcik7XG4gICAgICAgICAgICBpZiAoIWNhbmNlbGVkMSB8fCAhY2FuY2VsZWQyKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZUNhbmNlbFByb21pc2UodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBbYnJhbmNoMSwgYnJhbmNoMl07XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlQnl0ZVN0cmVhbVRlZShzdHJlYW0pIHtcbiAgICAgICAgbGV0IHJlYWRlciA9IEFjcXVpcmVSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIoc3RyZWFtKTtcbiAgICAgICAgbGV0IHJlYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgbGV0IHJlYWRBZ2FpbkZvckJyYW5jaDEgPSBmYWxzZTtcbiAgICAgICAgbGV0IHJlYWRBZ2FpbkZvckJyYW5jaDIgPSBmYWxzZTtcbiAgICAgICAgbGV0IGNhbmNlbGVkMSA9IGZhbHNlO1xuICAgICAgICBsZXQgY2FuY2VsZWQyID0gZmFsc2U7XG4gICAgICAgIGxldCByZWFzb24xO1xuICAgICAgICBsZXQgcmVhc29uMjtcbiAgICAgICAgbGV0IGJyYW5jaDE7XG4gICAgICAgIGxldCBicmFuY2gyO1xuICAgICAgICBsZXQgcmVzb2x2ZUNhbmNlbFByb21pc2U7XG4gICAgICAgIGNvbnN0IGNhbmNlbFByb21pc2UgPSBuZXdQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZUNhbmNlbFByb21pc2UgPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICAgICAgZnVuY3Rpb24gZm9yd2FyZFJlYWRlckVycm9yKHRoaXNSZWFkZXIpIHtcbiAgICAgICAgICAgIHVwb25SZWplY3Rpb24odGhpc1JlYWRlci5fY2xvc2VkUHJvbWlzZSwgciA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXNSZWFkZXIgIT09IHJlYWRlcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcihicmFuY2gxLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIHIpO1xuICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcihicmFuY2gyLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIHIpO1xuICAgICAgICAgICAgICAgIGlmICghY2FuY2VsZWQxIHx8ICFjYW5jZWxlZDIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZUNhbmNlbFByb21pc2UodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBwdWxsV2l0aERlZmF1bHRSZWFkZXIoKSB7XG4gICAgICAgICAgICBpZiAoSXNSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIocmVhZGVyKSkge1xuICAgICAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtUmVhZGVyR2VuZXJpY1JlbGVhc2UocmVhZGVyKTtcbiAgICAgICAgICAgICAgICByZWFkZXIgPSBBY3F1aXJlUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyKHN0cmVhbSk7XG4gICAgICAgICAgICAgICAgZm9yd2FyZFJlYWRlckVycm9yKHJlYWRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZWFkUmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICBfY2h1bmtTdGVwczogY2h1bmsgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIGRlbGF5ZWQgYSBtaWNyb3Rhc2sgYmVjYXVzZSBpdCB0YWtlcyBhdCBsZWFzdCBhIG1pY3JvdGFzayB0byBkZXRlY3QgZXJyb3JzICh1c2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyByZWFkZXIuX2Nsb3NlZFByb21pc2UgYmVsb3cpLCBhbmQgd2Ugd2FudCBlcnJvcnMgaW4gc3RyZWFtIHRvIGVycm9yIGJvdGggYnJhbmNoZXMgaW1tZWRpYXRlbHkuIFdlIGNhbm5vdCBsZXRcbiAgICAgICAgICAgICAgICAgICAgLy8gc3VjY2Vzc2Z1bCBzeW5jaHJvbm91c2x5LWF2YWlsYWJsZSByZWFkcyBnZXQgYWhlYWQgb2YgYXN5bmNocm9ub3VzbHktYXZhaWxhYmxlIGVycm9ycy5cbiAgICAgICAgICAgICAgICAgICAgcXVldWVNaWNyb3Rhc2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZEFnYWluRm9yQnJhbmNoMSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZEFnYWluRm9yQnJhbmNoMiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2h1bmsxID0gY2h1bms7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2h1bmsyID0gY2h1bms7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbmNlbGVkMSAmJiAhY2FuY2VsZWQyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsyID0gQ2xvbmVBc1VpbnQ4QXJyYXkoY2h1bmspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXRjaCAoY2xvbmVFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcihicmFuY2gxLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIGNsb25lRSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFcnJvcihicmFuY2gyLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIGNsb25lRSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVDYW5jZWxQcm9taXNlKFJlYWRhYmxlU3RyZWFtQ2FuY2VsKHN0cmVhbSwgY2xvbmVFKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbmNlbGVkMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJFbnF1ZXVlKGJyYW5jaDEuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciwgY2h1bmsxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2FuY2VsZWQyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckVucXVldWUoYnJhbmNoMi5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyLCBjaHVuazIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWRBZ2FpbkZvckJyYW5jaDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWxsMUFsZ29yaXRobSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocmVhZEFnYWluRm9yQnJhbmNoMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1bGwyQWxnb3JpdGhtKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX2Nsb3NlU3RlcHM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNhbmNlbGVkMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckNsb3NlKGJyYW5jaDEuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYW5jZWxlZDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDbG9zZShicmFuY2gyLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChicmFuY2gxLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIuX3BlbmRpbmdQdWxsSW50b3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclJlc3BvbmQoYnJhbmNoMS5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYnJhbmNoMi5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyLl9wZW5kaW5nUHVsbEludG9zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJSZXNwb25kKGJyYW5jaDIuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYW5jZWxlZDEgfHwgIWNhbmNlbGVkMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZUNhbmNlbFByb21pc2UodW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgX2Vycm9yU3RlcHM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVhZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXJSZWFkKHJlYWRlciwgcmVhZFJlcXVlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHB1bGxXaXRoQllPQlJlYWRlcih2aWV3LCBmb3JCcmFuY2gyKSB7XG4gICAgICAgICAgICBpZiAoSXNSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIocmVhZGVyKSkge1xuICAgICAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtUmVhZGVyR2VuZXJpY1JlbGVhc2UocmVhZGVyKTtcbiAgICAgICAgICAgICAgICByZWFkZXIgPSBBY3F1aXJlUmVhZGFibGVTdHJlYW1CWU9CUmVhZGVyKHN0cmVhbSk7XG4gICAgICAgICAgICAgICAgZm9yd2FyZFJlYWRlckVycm9yKHJlYWRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBieW9iQnJhbmNoID0gZm9yQnJhbmNoMiA/IGJyYW5jaDIgOiBicmFuY2gxO1xuICAgICAgICAgICAgY29uc3Qgb3RoZXJCcmFuY2ggPSBmb3JCcmFuY2gyID8gYnJhbmNoMSA6IGJyYW5jaDI7XG4gICAgICAgICAgICBjb25zdCByZWFkSW50b1JlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgX2NodW5rU3RlcHM6IGNodW5rID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBuZWVkcyB0byBiZSBkZWxheWVkIGEgbWljcm90YXNrIGJlY2F1c2UgaXQgdGFrZXMgYXQgbGVhc3QgYSBtaWNyb3Rhc2sgdG8gZGV0ZWN0IGVycm9ycyAodXNpbmdcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVhZGVyLl9jbG9zZWRQcm9taXNlIGJlbG93KSwgYW5kIHdlIHdhbnQgZXJyb3JzIGluIHN0cmVhbSB0byBlcnJvciBib3RoIGJyYW5jaGVzIGltbWVkaWF0ZWx5LiBXZSBjYW5ub3QgbGV0XG4gICAgICAgICAgICAgICAgICAgIC8vIHN1Y2Nlc3NmdWwgc3luY2hyb25vdXNseS1hdmFpbGFibGUgcmVhZHMgZ2V0IGFoZWFkIG9mIGFzeW5jaHJvbm91c2x5LWF2YWlsYWJsZSBlcnJvcnMuXG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRBZ2FpbkZvckJyYW5jaDEgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRBZ2FpbkZvckJyYW5jaDIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJ5b2JDYW5jZWxlZCA9IGZvckJyYW5jaDIgPyBjYW5jZWxlZDIgOiBjYW5jZWxlZDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvdGhlckNhbmNlbGVkID0gZm9yQnJhbmNoMiA/IGNhbmNlbGVkMSA6IGNhbmNlbGVkMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3RoZXJDYW5jZWxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjbG9uZWRDaHVuaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9uZWRDaHVuayA9IENsb25lQXNVaW50OEFycmF5KGNodW5rKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGNsb25lRSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyRXJyb3IoYnlvYkJyYW5jaC5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyLCBjbG9uZUUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyRXJyb3Iob3RoZXJCcmFuY2guX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciwgY2xvbmVFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZUNhbmNlbFByb21pc2UoUmVhZGFibGVTdHJlYW1DYW5jZWwoc3RyZWFtLCBjbG9uZUUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWJ5b2JDYW5jZWxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUmVzcG9uZFdpdGhOZXdWaWV3KGJ5b2JCcmFuY2guX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciwgY2h1bmspO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyRW5xdWV1ZShvdGhlckJyYW5jaC5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyLCBjbG9uZWRDaHVuayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghYnlvYkNhbmNlbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlclJlc3BvbmRXaXRoTmV3VmlldyhieW9iQnJhbmNoLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIGNodW5rKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWFkQWdhaW5Gb3JCcmFuY2gxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVsbDFBbGdvcml0aG0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlYWRBZ2FpbkZvckJyYW5jaDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdWxsMkFsZ29yaXRobSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF9jbG9zZVN0ZXBzOiBjaHVuayA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYnlvYkNhbmNlbGVkID0gZm9yQnJhbmNoMiA/IGNhbmNlbGVkMiA6IGNhbmNlbGVkMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3RoZXJDYW5jZWxlZCA9IGZvckJyYW5jaDIgPyBjYW5jZWxlZDEgOiBjYW5jZWxlZDI7XG4gICAgICAgICAgICAgICAgICAgIGlmICghYnlvYkNhbmNlbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyQ2xvc2UoYnlvYkJyYW5jaC5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIW90aGVyQ2FuY2VsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJDbG9zZShvdGhlckJyYW5jaC5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2h1bmsgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFieW9iQ2FuY2VsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyUmVzcG9uZFdpdGhOZXdWaWV3KGJ5b2JCcmFuY2guX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlciwgY2h1bmspO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFvdGhlckNhbmNlbGVkICYmIG90aGVyQnJhbmNoLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIuX3BlbmRpbmdQdWxsSW50b3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJSZXNwb25kKG90aGVyQnJhbmNoLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghYnlvYkNhbmNlbGVkIHx8ICFvdGhlckNhbmNlbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlQ2FuY2VsUHJvbWlzZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBfZXJyb3JTdGVwczogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWFkaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtQllPQlJlYWRlclJlYWQocmVhZGVyLCB2aWV3LCByZWFkSW50b1JlcXVlc3QpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHB1bGwxQWxnb3JpdGhtKCkge1xuICAgICAgICAgICAgaWYgKHJlYWRpbmcpIHtcbiAgICAgICAgICAgICAgICByZWFkQWdhaW5Gb3JCcmFuY2gxID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVhZGluZyA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCBieW9iUmVxdWVzdCA9IFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJHZXRCWU9CUmVxdWVzdChicmFuY2gxLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgaWYgKGJ5b2JSZXF1ZXN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcHVsbFdpdGhEZWZhdWx0UmVhZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBwdWxsV2l0aEJZT0JSZWFkZXIoYnlvYlJlcXVlc3QuX3ZpZXcsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gcHVsbDJBbGdvcml0aG0oKSB7XG4gICAgICAgICAgICBpZiAocmVhZGluZykge1xuICAgICAgICAgICAgICAgIHJlYWRBZ2FpbkZvckJyYW5jaDIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZWRXaXRoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWFkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnN0IGJ5b2JSZXF1ZXN0ID0gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlckdldEJZT0JSZXF1ZXN0KGJyYW5jaDIuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcik7XG4gICAgICAgICAgICBpZiAoYnlvYlJlcXVlc3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwdWxsV2l0aERlZmF1bHRSZWFkZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHB1bGxXaXRoQllPQlJlYWRlcihieW9iUmVxdWVzdC5fdmlldywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGNhbmNlbDFBbGdvcml0aG0ocmVhc29uKSB7XG4gICAgICAgICAgICBjYW5jZWxlZDEgPSB0cnVlO1xuICAgICAgICAgICAgcmVhc29uMSA9IHJlYXNvbjtcbiAgICAgICAgICAgIGlmIChjYW5jZWxlZDIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb3NpdGVSZWFzb24gPSBDcmVhdGVBcnJheUZyb21MaXN0KFtyZWFzb24xLCByZWFzb24yXSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY2FuY2VsUmVzdWx0ID0gUmVhZGFibGVTdHJlYW1DYW5jZWwoc3RyZWFtLCBjb21wb3NpdGVSZWFzb24pO1xuICAgICAgICAgICAgICAgIHJlc29sdmVDYW5jZWxQcm9taXNlKGNhbmNlbFJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2FuY2VsUHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBjYW5jZWwyQWxnb3JpdGhtKHJlYXNvbikge1xuICAgICAgICAgICAgY2FuY2VsZWQyID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlYXNvbjIgPSByZWFzb247XG4gICAgICAgICAgICBpZiAoY2FuY2VsZWQxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9zaXRlUmVhc29uID0gQ3JlYXRlQXJyYXlGcm9tTGlzdChbcmVhc29uMSwgcmVhc29uMl0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNhbmNlbFJlc3VsdCA9IFJlYWRhYmxlU3RyZWFtQ2FuY2VsKHN0cmVhbSwgY29tcG9zaXRlUmVhc29uKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlQ2FuY2VsUHJvbWlzZShjYW5jZWxSZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNhbmNlbFByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc3RhcnRBbGdvcml0aG0oKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYnJhbmNoMSA9IENyZWF0ZVJlYWRhYmxlQnl0ZVN0cmVhbShzdGFydEFsZ29yaXRobSwgcHVsbDFBbGdvcml0aG0sIGNhbmNlbDFBbGdvcml0aG0pO1xuICAgICAgICBicmFuY2gyID0gQ3JlYXRlUmVhZGFibGVCeXRlU3RyZWFtKHN0YXJ0QWxnb3JpdGhtLCBwdWxsMkFsZ29yaXRobSwgY2FuY2VsMkFsZ29yaXRobSk7XG4gICAgICAgIGZvcndhcmRSZWFkZXJFcnJvcihyZWFkZXIpO1xuICAgICAgICByZXR1cm4gW2JyYW5jaDEsIGJyYW5jaDJdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnZlcnRVbmRlcmx5aW5nRGVmYXVsdE9yQnl0ZVNvdXJjZShzb3VyY2UsIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RGljdGlvbmFyeShzb3VyY2UsIGNvbnRleHQpO1xuICAgICAgICBjb25zdCBvcmlnaW5hbCA9IHNvdXJjZTtcbiAgICAgICAgY29uc3QgYXV0b0FsbG9jYXRlQ2h1bmtTaXplID0gb3JpZ2luYWwgPT09IG51bGwgfHwgb3JpZ2luYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9yaWdpbmFsLmF1dG9BbGxvY2F0ZUNodW5rU2l6ZTtcbiAgICAgICAgY29uc3QgY2FuY2VsID0gb3JpZ2luYWwgPT09IG51bGwgfHwgb3JpZ2luYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9yaWdpbmFsLmNhbmNlbDtcbiAgICAgICAgY29uc3QgcHVsbCA9IG9yaWdpbmFsID09PSBudWxsIHx8IG9yaWdpbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnaW5hbC5wdWxsO1xuICAgICAgICBjb25zdCBzdGFydCA9IG9yaWdpbmFsID09PSBudWxsIHx8IG9yaWdpbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnaW5hbC5zdGFydDtcbiAgICAgICAgY29uc3QgdHlwZSA9IG9yaWdpbmFsID09PSBudWxsIHx8IG9yaWdpbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnaW5hbC50eXBlO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYXV0b0FsbG9jYXRlQ2h1bmtTaXplOiBhdXRvQWxsb2NhdGVDaHVua1NpemUgPT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgICAgICAgICBjb252ZXJ0VW5zaWduZWRMb25nTG9uZ1dpdGhFbmZvcmNlUmFuZ2UoYXV0b0FsbG9jYXRlQ2h1bmtTaXplLCBgJHtjb250ZXh0fSBoYXMgbWVtYmVyICdhdXRvQWxsb2NhdGVDaHVua1NpemUnIHRoYXRgKSxcbiAgICAgICAgICAgIGNhbmNlbDogY2FuY2VsID09PSB1bmRlZmluZWQgP1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgICAgICAgY29udmVydFVuZGVybHlpbmdTb3VyY2VDYW5jZWxDYWxsYmFjayhjYW5jZWwsIG9yaWdpbmFsLCBgJHtjb250ZXh0fSBoYXMgbWVtYmVyICdjYW5jZWwnIHRoYXRgKSxcbiAgICAgICAgICAgIHB1bGw6IHB1bGwgPT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgICAgICAgICBjb252ZXJ0VW5kZXJseWluZ1NvdXJjZVB1bGxDYWxsYmFjayhwdWxsLCBvcmlnaW5hbCwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAncHVsbCcgdGhhdGApLFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0ID09PSB1bmRlZmluZWQgP1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgICAgICAgY29udmVydFVuZGVybHlpbmdTb3VyY2VTdGFydENhbGxiYWNrKHN0YXJ0LCBvcmlnaW5hbCwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAnc3RhcnQnIHRoYXRgKSxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGNvbnZlcnRSZWFkYWJsZVN0cmVhbVR5cGUodHlwZSwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAndHlwZScgdGhhdGApXG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbnZlcnRVbmRlcmx5aW5nU291cmNlQ2FuY2VsQ2FsbGJhY2soZm4sIG9yaWdpbmFsLCBjb250ZXh0KSB7XG4gICAgICAgIGFzc2VydEZ1bmN0aW9uKGZuLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIChyZWFzb24pID0+IHByb21pc2VDYWxsKGZuLCBvcmlnaW5hbCwgW3JlYXNvbl0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb252ZXJ0VW5kZXJseWluZ1NvdXJjZVB1bGxDYWxsYmFjayhmbiwgb3JpZ2luYWwsIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RnVuY3Rpb24oZm4sIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gKGNvbnRyb2xsZXIpID0+IHByb21pc2VDYWxsKGZuLCBvcmlnaW5hbCwgW2NvbnRyb2xsZXJdKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydFVuZGVybHlpbmdTb3VyY2VTdGFydENhbGxiYWNrKGZuLCBvcmlnaW5hbCwgY29udGV4dCkge1xuICAgICAgICBhc3NlcnRGdW5jdGlvbihmbiwgY29udGV4dCk7XG4gICAgICAgIHJldHVybiAoY29udHJvbGxlcikgPT4gcmVmbGVjdENhbGwoZm4sIG9yaWdpbmFsLCBbY29udHJvbGxlcl0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb252ZXJ0UmVhZGFibGVTdHJlYW1UeXBlKHR5cGUsIGNvbnRleHQpIHtcbiAgICAgICAgdHlwZSA9IGAke3R5cGV9YDtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdieXRlcycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7Y29udGV4dH0gJyR7dHlwZX0nIGlzIG5vdCBhIHZhbGlkIGVudW1lcmF0aW9uIHZhbHVlIGZvciBSZWFkYWJsZVN0cmVhbVR5cGVgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb252ZXJ0UmVhZGVyT3B0aW9ucyhvcHRpb25zLCBjb250ZXh0KSB7XG4gICAgICAgIGFzc2VydERpY3Rpb25hcnkob3B0aW9ucywgY29udGV4dCk7XG4gICAgICAgIGNvbnN0IG1vZGUgPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMubW9kZTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1vZGU6IG1vZGUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGNvbnZlcnRSZWFkYWJsZVN0cmVhbVJlYWRlck1vZGUobW9kZSwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAnbW9kZScgdGhhdGApXG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbnZlcnRSZWFkYWJsZVN0cmVhbVJlYWRlck1vZGUobW9kZSwgY29udGV4dCkge1xuICAgICAgICBtb2RlID0gYCR7bW9kZX1gO1xuICAgICAgICBpZiAobW9kZSAhPT0gJ2J5b2InKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke2NvbnRleHR9ICcke21vZGV9JyBpcyBub3QgYSB2YWxpZCBlbnVtZXJhdGlvbiB2YWx1ZSBmb3IgUmVhZGFibGVTdHJlYW1SZWFkZXJNb2RlYCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1vZGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29udmVydEl0ZXJhdG9yT3B0aW9ucyhvcHRpb25zLCBjb250ZXh0KSB7XG4gICAgICAgIGFzc2VydERpY3Rpb25hcnkob3B0aW9ucywgY29udGV4dCk7XG4gICAgICAgIGNvbnN0IHByZXZlbnRDYW5jZWwgPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMucHJldmVudENhbmNlbDtcbiAgICAgICAgcmV0dXJuIHsgcHJldmVudENhbmNlbDogQm9vbGVhbihwcmV2ZW50Q2FuY2VsKSB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnZlcnRQaXBlT3B0aW9ucyhvcHRpb25zLCBjb250ZXh0KSB7XG4gICAgICAgIGFzc2VydERpY3Rpb25hcnkob3B0aW9ucywgY29udGV4dCk7XG4gICAgICAgIGNvbnN0IHByZXZlbnRBYm9ydCA9IG9wdGlvbnMgPT09IG51bGwgfHwgb3B0aW9ucyA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3B0aW9ucy5wcmV2ZW50QWJvcnQ7XG4gICAgICAgIGNvbnN0IHByZXZlbnRDYW5jZWwgPSBvcHRpb25zID09PSBudWxsIHx8IG9wdGlvbnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9wdGlvbnMucHJldmVudENhbmNlbDtcbiAgICAgICAgY29uc3QgcHJldmVudENsb3NlID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLnByZXZlbnRDbG9zZTtcbiAgICAgICAgY29uc3Qgc2lnbmFsID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLnNpZ25hbDtcbiAgICAgICAgaWYgKHNpZ25hbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhc3NlcnRBYm9ydFNpZ25hbChzaWduYWwsIGAke2NvbnRleHR9IGhhcyBtZW1iZXIgJ3NpZ25hbCcgdGhhdGApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcmV2ZW50QWJvcnQ6IEJvb2xlYW4ocHJldmVudEFib3J0KSxcbiAgICAgICAgICAgIHByZXZlbnRDYW5jZWw6IEJvb2xlYW4ocHJldmVudENhbmNlbCksXG4gICAgICAgICAgICBwcmV2ZW50Q2xvc2U6IEJvb2xlYW4ocHJldmVudENsb3NlKSxcbiAgICAgICAgICAgIHNpZ25hbFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhc3NlcnRBYm9ydFNpZ25hbChzaWduYWwsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCFpc0Fib3J0U2lnbmFsKHNpZ25hbCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCR7Y29udGV4dH0gaXMgbm90IGFuIEFib3J0U2lnbmFsLmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29udmVydFJlYWRhYmxlV3JpdGFibGVQYWlyKHBhaXIsIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RGljdGlvbmFyeShwYWlyLCBjb250ZXh0KTtcbiAgICAgICAgY29uc3QgcmVhZGFibGUgPSBwYWlyID09PSBudWxsIHx8IHBhaXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhaXIucmVhZGFibGU7XG4gICAgICAgIGFzc2VydFJlcXVpcmVkRmllbGQocmVhZGFibGUsICdyZWFkYWJsZScsICdSZWFkYWJsZVdyaXRhYmxlUGFpcicpO1xuICAgICAgICBhc3NlcnRSZWFkYWJsZVN0cmVhbShyZWFkYWJsZSwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAncmVhZGFibGUnIHRoYXRgKTtcbiAgICAgICAgY29uc3Qgd3JpdGFibGUgPSBwYWlyID09PSBudWxsIHx8IHBhaXIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHBhaXIud3JpdGFibGU7XG4gICAgICAgIGFzc2VydFJlcXVpcmVkRmllbGQod3JpdGFibGUsICd3cml0YWJsZScsICdSZWFkYWJsZVdyaXRhYmxlUGFpcicpO1xuICAgICAgICBhc3NlcnRXcml0YWJsZVN0cmVhbSh3cml0YWJsZSwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAnd3JpdGFibGUnIHRoYXRgKTtcbiAgICAgICAgcmV0dXJuIHsgcmVhZGFibGUsIHdyaXRhYmxlIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSByZWFkYWJsZSBzdHJlYW0gcmVwcmVzZW50cyBhIHNvdXJjZSBvZiBkYXRhLCBmcm9tIHdoaWNoIHlvdSBjYW4gcmVhZC5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGFzcyBSZWFkYWJsZVN0cmVhbSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKHJhd1VuZGVybHlpbmdTb3VyY2UgPSB7fSwgcmF3U3RyYXRlZ3kgPSB7fSkge1xuICAgICAgICAgICAgaWYgKHJhd1VuZGVybHlpbmdTb3VyY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJhd1VuZGVybHlpbmdTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0T2JqZWN0KHJhd1VuZGVybHlpbmdTb3VyY2UsICdGaXJzdCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHN0cmF0ZWd5ID0gY29udmVydFF1ZXVpbmdTdHJhdGVneShyYXdTdHJhdGVneSwgJ1NlY29uZCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIGNvbnN0IHVuZGVybHlpbmdTb3VyY2UgPSBjb252ZXJ0VW5kZXJseWluZ0RlZmF1bHRPckJ5dGVTb3VyY2UocmF3VW5kZXJseWluZ1NvdXJjZSwgJ0ZpcnN0IHBhcmFtZXRlcicpO1xuICAgICAgICAgICAgSW5pdGlhbGl6ZVJlYWRhYmxlU3RyZWFtKHRoaXMpO1xuICAgICAgICAgICAgaWYgKHVuZGVybHlpbmdTb3VyY2UudHlwZSA9PT0gJ2J5dGVzJykge1xuICAgICAgICAgICAgICAgIGlmIChzdHJhdGVneS5zaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSBzdHJhdGVneSBmb3IgYSBieXRlIHN0cmVhbSBjYW5ub3QgaGF2ZSBhIHNpemUgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgaGlnaFdhdGVyTWFyayA9IEV4dHJhY3RIaWdoV2F0ZXJNYXJrKHN0cmF0ZWd5LCAwKTtcbiAgICAgICAgICAgICAgICBTZXRVcFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXJGcm9tVW5kZXJseWluZ1NvdXJjZSh0aGlzLCB1bmRlcmx5aW5nU291cmNlLCBoaWdoV2F0ZXJNYXJrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNpemVBbGdvcml0aG0gPSBFeHRyYWN0U2l6ZUFsZ29yaXRobShzdHJhdGVneSk7XG4gICAgICAgICAgICAgICAgY29uc3QgaGlnaFdhdGVyTWFyayA9IEV4dHJhY3RIaWdoV2F0ZXJNYXJrKHN0cmF0ZWd5LCAxKTtcbiAgICAgICAgICAgICAgICBTZXRVcFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJGcm9tVW5kZXJseWluZ1NvdXJjZSh0aGlzLCB1bmRlcmx5aW5nU291cmNlLCBoaWdoV2F0ZXJNYXJrLCBzaXplQWxnb3JpdGhtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogV2hldGhlciBvciBub3QgdGhlIHJlYWRhYmxlIHN0cmVhbSBpcyBsb2NrZWQgdG8gYSB7QGxpbmsgUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyIHwgcmVhZGVyfS5cbiAgICAgICAgICovXG4gICAgICAgIGdldCBsb2NrZWQoKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW0odGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBzdHJlYW1CcmFuZENoZWNrRXhjZXB0aW9uJDEoJ2xvY2tlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIElzUmVhZGFibGVTdHJlYW1Mb2NrZWQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbmNlbHMgdGhlIHN0cmVhbSwgc2lnbmFsaW5nIGEgbG9zcyBvZiBpbnRlcmVzdCBpbiB0aGUgc3RyZWFtIGJ5IGEgY29uc3VtZXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBzdXBwbGllZCBgcmVhc29uYCBhcmd1bWVudCB3aWxsIGJlIGdpdmVuIHRvIHRoZSB1bmRlcmx5aW5nIHNvdXJjZSdzIHtAbGluayBVbmRlcmx5aW5nU291cmNlLmNhbmNlbCB8IGNhbmNlbCgpfVxuICAgICAgICAgKiBtZXRob2QsIHdoaWNoIG1pZ2h0IG9yIG1pZ2h0IG5vdCB1c2UgaXQuXG4gICAgICAgICAqL1xuICAgICAgICBjYW5jZWwocmVhc29uID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIUlzUmVhZGFibGVTdHJlYW0odGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChzdHJlYW1CcmFuZENoZWNrRXhjZXB0aW9uJDEoJ2NhbmNlbCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc1JlYWRhYmxlU3RyZWFtTG9ja2VkKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgobmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbmNlbCBhIHN0cmVhbSB0aGF0IGFscmVhZHkgaGFzIGEgcmVhZGVyJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWRhYmxlU3RyZWFtQ2FuY2VsKHRoaXMsIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0UmVhZGVyKHJhd09wdGlvbnMgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbSh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IHN0cmVhbUJyYW5kQ2hlY2tFeGNlcHRpb24kMSgnZ2V0UmVhZGVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gY29udmVydFJlYWRlck9wdGlvbnMocmF3T3B0aW9ucywgJ0ZpcnN0IHBhcmFtZXRlcicpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMubW9kZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEFjcXVpcmVSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQWNxdWlyZVJlYWRhYmxlU3RyZWFtQllPQlJlYWRlcih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBwaXBlVGhyb3VnaChyYXdUcmFuc2Zvcm0sIHJhd09wdGlvbnMgPSB7fSkge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbiQxKCdwaXBlVGhyb3VnaCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXNzZXJ0UmVxdWlyZWRBcmd1bWVudChyYXdUcmFuc2Zvcm0sIDEsICdwaXBlVGhyb3VnaCcpO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gY29udmVydFJlYWRhYmxlV3JpdGFibGVQYWlyKHJhd1RyYW5zZm9ybSwgJ0ZpcnN0IHBhcmFtZXRlcicpO1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGNvbnZlcnRQaXBlT3B0aW9ucyhyYXdPcHRpb25zLCAnU2Vjb25kIHBhcmFtZXRlcicpO1xuICAgICAgICAgICAgaWYgKElzUmVhZGFibGVTdHJlYW1Mb2NrZWQodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUucGlwZVRocm91Z2ggY2Fubm90IGJlIHVzZWQgb24gYSBsb2NrZWQgUmVhZGFibGVTdHJlYW0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChJc1dyaXRhYmxlU3RyZWFtTG9ja2VkKHRyYW5zZm9ybS53cml0YWJsZSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUucGlwZVRocm91Z2ggY2Fubm90IGJlIHVzZWQgb24gYSBsb2NrZWQgV3JpdGFibGVTdHJlYW0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHByb21pc2UgPSBSZWFkYWJsZVN0cmVhbVBpcGVUbyh0aGlzLCB0cmFuc2Zvcm0ud3JpdGFibGUsIG9wdGlvbnMucHJldmVudENsb3NlLCBvcHRpb25zLnByZXZlbnRBYm9ydCwgb3B0aW9ucy5wcmV2ZW50Q2FuY2VsLCBvcHRpb25zLnNpZ25hbCk7XG4gICAgICAgICAgICBzZXRQcm9taXNlSXNIYW5kbGVkVG9UcnVlKHByb21pc2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybS5yZWFkYWJsZTtcbiAgICAgICAgfVxuICAgICAgICBwaXBlVG8oZGVzdGluYXRpb24sIHJhd09wdGlvbnMgPSB7fSkge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbiQxKCdwaXBlVG8nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVzdGluYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKGBQYXJhbWV0ZXIgMSBpcyByZXF1aXJlZCBpbiAncGlwZVRvJy5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghSXNXcml0YWJsZVN0cmVhbShkZXN0aW5hdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChuZXcgVHlwZUVycm9yKGBSZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUucGlwZVRvJ3MgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIFdyaXRhYmxlU3RyZWFtYCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IG9wdGlvbnM7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBjb252ZXJ0UGlwZU9wdGlvbnMocmF3T3B0aW9ucywgJ1NlY29uZCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZWplY3RlZFdpdGgoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoSXNSZWFkYWJsZVN0cmVhbUxvY2tlZCh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9taXNlUmVqZWN0ZWRXaXRoKG5ldyBUeXBlRXJyb3IoJ1JlYWRhYmxlU3RyZWFtLnByb3RvdHlwZS5waXBlVG8gY2Fubm90IGJlIHVzZWQgb24gYSBsb2NrZWQgUmVhZGFibGVTdHJlYW0nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoSXNXcml0YWJsZVN0cmVhbUxvY2tlZChkZXN0aW5hdGlvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChuZXcgVHlwZUVycm9yKCdSZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUucGlwZVRvIGNhbm5vdCBiZSB1c2VkIG9uIGEgbG9ja2VkIFdyaXRhYmxlU3RyZWFtJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFJlYWRhYmxlU3RyZWFtUGlwZVRvKHRoaXMsIGRlc3RpbmF0aW9uLCBvcHRpb25zLnByZXZlbnRDbG9zZSwgb3B0aW9ucy5wcmV2ZW50QWJvcnQsIG9wdGlvbnMucHJldmVudENhbmNlbCwgb3B0aW9ucy5zaWduYWwpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUZWVzIHRoaXMgcmVhZGFibGUgc3RyZWFtLCByZXR1cm5pbmcgYSB0d28tZWxlbWVudCBhcnJheSBjb250YWluaW5nIHRoZSB0d28gcmVzdWx0aW5nIGJyYW5jaGVzIGFzXG4gICAgICAgICAqIG5ldyB7QGxpbmsgUmVhZGFibGVTdHJlYW19IGluc3RhbmNlcy5cbiAgICAgICAgICpcbiAgICAgICAgICogVGVlaW5nIGEgc3RyZWFtIHdpbGwgbG9jayBpdCwgcHJldmVudGluZyBhbnkgb3RoZXIgY29uc3VtZXIgZnJvbSBhY3F1aXJpbmcgYSByZWFkZXIuXG4gICAgICAgICAqIFRvIGNhbmNlbCB0aGUgc3RyZWFtLCBjYW5jZWwgYm90aCBvZiB0aGUgcmVzdWx0aW5nIGJyYW5jaGVzOyBhIGNvbXBvc2l0ZSBjYW5jZWxsYXRpb24gcmVhc29uIHdpbGwgdGhlbiBiZVxuICAgICAgICAgKiBwcm9wYWdhdGVkIHRvIHRoZSBzdHJlYW0ncyB1bmRlcmx5aW5nIHNvdXJjZS5cbiAgICAgICAgICpcbiAgICAgICAgICogTm90ZSB0aGF0IHRoZSBjaHVua3Mgc2VlbiBpbiBlYWNoIGJyYW5jaCB3aWxsIGJlIHRoZSBzYW1lIG9iamVjdC4gSWYgdGhlIGNodW5rcyBhcmUgbm90IGltbXV0YWJsZSxcbiAgICAgICAgICogdGhpcyBjb3VsZCBhbGxvdyBpbnRlcmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGJyYW5jaGVzLlxuICAgICAgICAgKi9cbiAgICAgICAgdGVlKCkge1xuICAgICAgICAgICAgaWYgKCFJc1JlYWRhYmxlU3RyZWFtKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbiQxKCd0ZWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGJyYW5jaGVzID0gUmVhZGFibGVTdHJlYW1UZWUodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gQ3JlYXRlQXJyYXlGcm9tTGlzdChicmFuY2hlcyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVzKHJhd09wdGlvbnMgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICghSXNSZWFkYWJsZVN0cmVhbSh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IHN0cmVhbUJyYW5kQ2hlY2tFeGNlcHRpb24kMSgndmFsdWVzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gY29udmVydEl0ZXJhdG9yT3B0aW9ucyhyYXdPcHRpb25zLCAnRmlyc3QgcGFyYW1ldGVyJyk7XG4gICAgICAgICAgICByZXR1cm4gQWNxdWlyZVJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvcih0aGlzLCBvcHRpb25zLnByZXZlbnRDYW5jZWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFJlYWRhYmxlU3RyZWFtLnByb3RvdHlwZSwge1xuICAgICAgICBjYW5jZWw6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICBnZXRSZWFkZXI6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICBwaXBlVGhyb3VnaDogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHBpcGVUbzogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHRlZTogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIHZhbHVlczogeyBlbnVtZXJhYmxlOiB0cnVlIH0sXG4gICAgICAgIGxvY2tlZDogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlLCBTeW1ib2xQb2x5ZmlsbC50b1N0cmluZ1RhZywge1xuICAgICAgICAgICAgdmFsdWU6ICdSZWFkYWJsZVN0cmVhbScsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgU3ltYm9sUG9seWZpbGwuYXN5bmNJdGVyYXRvciA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFJlYWRhYmxlU3RyZWFtLnByb3RvdHlwZSwgU3ltYm9sUG9seWZpbGwuYXN5bmNJdGVyYXRvciwge1xuICAgICAgICAgICAgdmFsdWU6IFJlYWRhYmxlU3RyZWFtLnByb3RvdHlwZS52YWx1ZXMsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gQWJzdHJhY3Qgb3BlcmF0aW9ucyBmb3IgdGhlIFJlYWRhYmxlU3RyZWFtLlxuICAgIC8vIFRocm93cyBpZiBhbmQgb25seSBpZiBzdGFydEFsZ29yaXRobSB0aHJvd3MuXG4gICAgZnVuY3Rpb24gQ3JlYXRlUmVhZGFibGVTdHJlYW0oc3RhcnRBbGdvcml0aG0sIHB1bGxBbGdvcml0aG0sIGNhbmNlbEFsZ29yaXRobSwgaGlnaFdhdGVyTWFyayA9IDEsIHNpemVBbGdvcml0aG0gPSAoKSA9PiAxKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbSA9IE9iamVjdC5jcmVhdGUoUmVhZGFibGVTdHJlYW0ucHJvdG90eXBlKTtcbiAgICAgICAgSW5pdGlhbGl6ZVJlYWRhYmxlU3RyZWFtKHN0cmVhbSk7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBPYmplY3QuY3JlYXRlKFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIucHJvdG90eXBlKTtcbiAgICAgICAgU2V0VXBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyKHN0cmVhbSwgY29udHJvbGxlciwgc3RhcnRBbGdvcml0aG0sIHB1bGxBbGdvcml0aG0sIGNhbmNlbEFsZ29yaXRobSwgaGlnaFdhdGVyTWFyaywgc2l6ZUFsZ29yaXRobSk7XG4gICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgfVxuICAgIC8vIFRocm93cyBpZiBhbmQgb25seSBpZiBzdGFydEFsZ29yaXRobSB0aHJvd3MuXG4gICAgZnVuY3Rpb24gQ3JlYXRlUmVhZGFibGVCeXRlU3RyZWFtKHN0YXJ0QWxnb3JpdGhtLCBwdWxsQWxnb3JpdGhtLCBjYW5jZWxBbGdvcml0aG0pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtID0gT2JqZWN0LmNyZWF0ZShSZWFkYWJsZVN0cmVhbS5wcm90b3R5cGUpO1xuICAgICAgICBJbml0aWFsaXplUmVhZGFibGVTdHJlYW0oc3RyZWFtKTtcbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IE9iamVjdC5jcmVhdGUoUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlci5wcm90b3R5cGUpO1xuICAgICAgICBTZXRVcFJlYWRhYmxlQnl0ZVN0cmVhbUNvbnRyb2xsZXIoc3RyZWFtLCBjb250cm9sbGVyLCBzdGFydEFsZ29yaXRobSwgcHVsbEFsZ29yaXRobSwgY2FuY2VsQWxnb3JpdGhtLCAwLCB1bmRlZmluZWQpO1xuICAgICAgICByZXR1cm4gc3RyZWFtO1xuICAgIH1cbiAgICBmdW5jdGlvbiBJbml0aWFsaXplUmVhZGFibGVTdHJlYW0oc3RyZWFtKSB7XG4gICAgICAgIHN0cmVhbS5fc3RhdGUgPSAncmVhZGFibGUnO1xuICAgICAgICBzdHJlYW0uX3JlYWRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgc3RyZWFtLl9zdG9yZWRFcnJvciA9IHVuZGVmaW5lZDtcbiAgICAgICAgc3RyZWFtLl9kaXN0dXJiZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gSXNSZWFkYWJsZVN0cmVhbSh4KSB7XG4gICAgICAgIGlmICghdHlwZUlzT2JqZWN0KHgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoeCwgJ19yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXInKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW07XG4gICAgfVxuICAgIGZ1bmN0aW9uIElzUmVhZGFibGVTdHJlYW1Mb2NrZWQoc3RyZWFtKSB7XG4gICAgICAgIGlmIChzdHJlYW0uX3JlYWRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vIFJlYWRhYmxlU3RyZWFtIEFQSSBleHBvc2VkIGZvciBjb250cm9sbGVycy5cbiAgICBmdW5jdGlvbiBSZWFkYWJsZVN0cmVhbUNhbmNlbChzdHJlYW0sIHJlYXNvbikge1xuICAgICAgICBzdHJlYW0uX2Rpc3R1cmJlZCA9IHRydWU7XG4gICAgICAgIGlmIChzdHJlYW0uX3N0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlZFdpdGgodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RyZWFtLl9zdGF0ZSA9PT0gJ2Vycm9yZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aChzdHJlYW0uX3N0b3JlZEVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBSZWFkYWJsZVN0cmVhbUNsb3NlKHN0cmVhbSk7XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHN0cmVhbS5fcmVhZGVyO1xuICAgICAgICBpZiAocmVhZGVyICE9PSB1bmRlZmluZWQgJiYgSXNSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIocmVhZGVyKSkge1xuICAgICAgICAgICAgcmVhZGVyLl9yZWFkSW50b1JlcXVlc3RzLmZvckVhY2gocmVhZEludG9SZXF1ZXN0ID0+IHtcbiAgICAgICAgICAgICAgICByZWFkSW50b1JlcXVlc3QuX2Nsb3NlU3RlcHModW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVhZGVyLl9yZWFkSW50b1JlcXVlc3RzID0gbmV3IFNpbXBsZVF1ZXVlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc291cmNlQ2FuY2VsUHJvbWlzZSA9IHN0cmVhbS5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyW0NhbmNlbFN0ZXBzXShyZWFzb24pO1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtUHJvbWlzZVdpdGgoc291cmNlQ2FuY2VsUHJvbWlzZSwgbm9vcCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFJlYWRhYmxlU3RyZWFtQ2xvc2Uoc3RyZWFtKSB7XG4gICAgICAgIHN0cmVhbS5fc3RhdGUgPSAnY2xvc2VkJztcbiAgICAgICAgY29uc3QgcmVhZGVyID0gc3RyZWFtLl9yZWFkZXI7XG4gICAgICAgIGlmIChyZWFkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlUmVzb2x2ZShyZWFkZXIpO1xuICAgICAgICBpZiAoSXNSZWFkYWJsZVN0cmVhbURlZmF1bHRSZWFkZXIocmVhZGVyKSkge1xuICAgICAgICAgICAgcmVhZGVyLl9yZWFkUmVxdWVzdHMuZm9yRWFjaChyZWFkUmVxdWVzdCA9PiB7XG4gICAgICAgICAgICAgICAgcmVhZFJlcXVlc3QuX2Nsb3NlU3RlcHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVhZGVyLl9yZWFkUmVxdWVzdHMgPSBuZXcgU2ltcGxlUXVldWUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFkYWJsZVN0cmVhbUVycm9yKHN0cmVhbSwgZSkge1xuICAgICAgICBzdHJlYW0uX3N0YXRlID0gJ2Vycm9yZWQnO1xuICAgICAgICBzdHJlYW0uX3N0b3JlZEVycm9yID0gZTtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gc3RyZWFtLl9yZWFkZXI7XG4gICAgICAgIGlmIChyZWFkZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHRSZWFkZXJDbG9zZWRQcm9taXNlUmVqZWN0KHJlYWRlciwgZSk7XG4gICAgICAgIGlmIChJc1JlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlcihyZWFkZXIpKSB7XG4gICAgICAgICAgICByZWFkZXIuX3JlYWRSZXF1ZXN0cy5mb3JFYWNoKHJlYWRSZXF1ZXN0ID0+IHtcbiAgICAgICAgICAgICAgICByZWFkUmVxdWVzdC5fZXJyb3JTdGVwcyhlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVhZGVyLl9yZWFkUmVxdWVzdHMgPSBuZXcgU2ltcGxlUXVldWUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlYWRlci5fcmVhZEludG9SZXF1ZXN0cy5mb3JFYWNoKHJlYWRJbnRvUmVxdWVzdCA9PiB7XG4gICAgICAgICAgICAgICAgcmVhZEludG9SZXF1ZXN0Ll9lcnJvclN0ZXBzKGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZWFkZXIuX3JlYWRJbnRvUmVxdWVzdHMgPSBuZXcgU2ltcGxlUXVldWUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgUmVhZGFibGVTdHJlYW0uXG4gICAgZnVuY3Rpb24gc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbiQxKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYFJlYWRhYmxlU3RyZWFtLnByb3RvdHlwZS4ke25hbWV9IGNhbiBvbmx5IGJlIHVzZWQgb24gYSBSZWFkYWJsZVN0cmVhbWApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnZlcnRRdWV1aW5nU3RyYXRlZ3lJbml0KGluaXQsIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RGljdGlvbmFyeShpbml0LCBjb250ZXh0KTtcbiAgICAgICAgY29uc3QgaGlnaFdhdGVyTWFyayA9IGluaXQgPT09IG51bGwgfHwgaW5pdCA9PT0gdm9pZCAwID8gdm9pZCAwIDogaW5pdC5oaWdoV2F0ZXJNYXJrO1xuICAgICAgICBhc3NlcnRSZXF1aXJlZEZpZWxkKGhpZ2hXYXRlck1hcmssICdoaWdoV2F0ZXJNYXJrJywgJ1F1ZXVpbmdTdHJhdGVneUluaXQnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGhpZ2hXYXRlck1hcms6IGNvbnZlcnRVbnJlc3RyaWN0ZWREb3VibGUoaGlnaFdhdGVyTWFyaylcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUaGUgc2l6ZSBmdW5jdGlvbiBtdXN0IG5vdCBoYXZlIGEgcHJvdG90eXBlIHByb3BlcnR5IG5vciBiZSBhIGNvbnN0cnVjdG9yXG4gICAgY29uc3QgYnl0ZUxlbmd0aFNpemVGdW5jdGlvbiA9IChjaHVuaykgPT4ge1xuICAgICAgICByZXR1cm4gY2h1bmsuYnl0ZUxlbmd0aDtcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShieXRlTGVuZ3RoU2l6ZUZ1bmN0aW9uLCAnbmFtZScsIHtcbiAgICAgICAgICAgIHZhbHVlOiAnc2l6ZScsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGNhdGNoIChfYSkge1xuICAgICAgICAvLyBUaGlzIHByb3BlcnR5IGlzIG5vbi1jb25maWd1cmFibGUgaW4gb2xkZXIgYnJvd3NlcnMsIHNvIGlnbm9yZSBpZiB0aGlzIHRocm93cy5cbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vbmFtZSNicm93c2VyX2NvbXBhdGliaWxpdHlcbiAgICB9XG4gICAgLyoqXG4gICAgICogQSBxdWV1aW5nIHN0cmF0ZWd5IHRoYXQgY291bnRzIHRoZSBudW1iZXIgb2YgYnl0ZXMgaW4gZWFjaCBjaHVuay5cbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBjbGFzcyBCeXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5IHtcbiAgICAgICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICAgICAgYXNzZXJ0UmVxdWlyZWRBcmd1bWVudChvcHRpb25zLCAxLCAnQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneScpO1xuICAgICAgICAgICAgb3B0aW9ucyA9IGNvbnZlcnRRdWV1aW5nU3RyYXRlZ3lJbml0KG9wdGlvbnMsICdGaXJzdCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIHRoaXMuX2J5dGVMZW5ndGhRdWV1aW5nU3RyYXRlZ3lIaWdoV2F0ZXJNYXJrID0gb3B0aW9ucy5oaWdoV2F0ZXJNYXJrO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXR1cm5zIHRoZSBoaWdoIHdhdGVyIG1hcmsgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0IGhpZ2hXYXRlck1hcmsoKSB7XG4gICAgICAgICAgICBpZiAoIUlzQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneSh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGJ5dGVMZW5ndGhCcmFuZENoZWNrRXhjZXB0aW9uKCdoaWdoV2F0ZXJNYXJrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneUhpZ2hXYXRlck1hcms7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE1lYXN1cmVzIHRoZSBzaXplIG9mIGBjaHVua2AgYnkgcmV0dXJuaW5nIHRoZSB2YWx1ZSBvZiBpdHMgYGJ5dGVMZW5ndGhgIHByb3BlcnR5LlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0IHNpemUoKSB7XG4gICAgICAgICAgICBpZiAoIUlzQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneSh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGJ5dGVMZW5ndGhCcmFuZENoZWNrRXhjZXB0aW9uKCdzaXplJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYnl0ZUxlbmd0aFNpemVGdW5jdGlvbjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhCeXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5LnByb3RvdHlwZSwge1xuICAgICAgICBoaWdoV2F0ZXJNYXJrOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgc2l6ZTogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneS5wcm90b3R5cGUsIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ0J5dGVMZW5ndGhRdWV1aW5nU3RyYXRlZ3knLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zIGZvciB0aGUgQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneS5cbiAgICBmdW5jdGlvbiBieXRlTGVuZ3RoQnJhbmRDaGVja0V4Y2VwdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKGBCeXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5LnByb3RvdHlwZS4ke25hbWV9IGNhbiBvbmx5IGJlIHVzZWQgb24gYSBCeXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5YCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIElzQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneSh4KSB7XG4gICAgICAgIGlmICghdHlwZUlzT2JqZWN0KHgpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoeCwgJ19ieXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5SGlnaFdhdGVyTWFyaycpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBCeXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5O1xuICAgIH1cblxuICAgIC8vIFRoZSBzaXplIGZ1bmN0aW9uIG11c3Qgbm90IGhhdmUgYSBwcm90b3R5cGUgcHJvcGVydHkgbm9yIGJlIGEgY29uc3RydWN0b3JcbiAgICBjb25zdCBjb3VudFNpemVGdW5jdGlvbiA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY291bnRTaXplRnVuY3Rpb24sICduYW1lJywge1xuICAgICAgICAgICAgdmFsdWU6ICdzaXplJyxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY2F0Y2ggKF9hKSB7XG4gICAgICAgIC8vIFRoaXMgcHJvcGVydHkgaXMgbm9uLWNvbmZpZ3VyYWJsZSBpbiBvbGRlciBicm93c2Vycywgc28gaWdub3JlIGlmIHRoaXMgdGhyb3dzLlxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9uYW1lI2Jyb3dzZXJfY29tcGF0aWJpbGl0eVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBIHF1ZXVpbmcgc3RyYXRlZ3kgdGhhdCBjb3VudHMgdGhlIG51bWJlciBvZiBjaHVua3MuXG4gICAgICpcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgY2xhc3MgQ291bnRRdWV1aW5nU3RyYXRlZ3kge1xuICAgICAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgICAgICBhc3NlcnRSZXF1aXJlZEFyZ3VtZW50KG9wdGlvbnMsIDEsICdDb3VudFF1ZXVpbmdTdHJhdGVneScpO1xuICAgICAgICAgICAgb3B0aW9ucyA9IGNvbnZlcnRRdWV1aW5nU3RyYXRlZ3lJbml0KG9wdGlvbnMsICdGaXJzdCBwYXJhbWV0ZXInKTtcbiAgICAgICAgICAgIHRoaXMuX2NvdW50UXVldWluZ1N0cmF0ZWd5SGlnaFdhdGVyTWFyayA9IG9wdGlvbnMuaGlnaFdhdGVyTWFyaztcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogUmV0dXJucyB0aGUgaGlnaCB3YXRlciBtYXJrIHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgICAgICovXG4gICAgICAgIGdldCBoaWdoV2F0ZXJNYXJrKCkge1xuICAgICAgICAgICAgaWYgKCFJc0NvdW50UXVldWluZ1N0cmF0ZWd5KHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgY291bnRCcmFuZENoZWNrRXhjZXB0aW9uKCdoaWdoV2F0ZXJNYXJrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY291bnRRdWV1aW5nU3RyYXRlZ3lIaWdoV2F0ZXJNYXJrO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBNZWFzdXJlcyB0aGUgc2l6ZSBvZiBgY2h1bmtgIGJ5IGFsd2F5cyByZXR1cm5pbmcgMS5cbiAgICAgICAgICogVGhpcyBlbnN1cmVzIHRoYXQgdGhlIHRvdGFsIHF1ZXVlIHNpemUgaXMgYSBjb3VudCBvZiB0aGUgbnVtYmVyIG9mIGNodW5rcyBpbiB0aGUgcXVldWUuXG4gICAgICAgICAqL1xuICAgICAgICBnZXQgc2l6ZSgpIHtcbiAgICAgICAgICAgIGlmICghSXNDb3VudFF1ZXVpbmdTdHJhdGVneSh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRocm93IGNvdW50QnJhbmRDaGVja0V4Y2VwdGlvbignc2l6ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvdW50U2l6ZUZ1bmN0aW9uO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKENvdW50UXVldWluZ1N0cmF0ZWd5LnByb3RvdHlwZSwge1xuICAgICAgICBoaWdoV2F0ZXJNYXJrOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgc2l6ZTogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ291bnRRdWV1aW5nU3RyYXRlZ3kucHJvdG90eXBlLCBTeW1ib2xQb2x5ZmlsbC50b1N0cmluZ1RhZywge1xuICAgICAgICAgICAgdmFsdWU6ICdDb3VudFF1ZXVpbmdTdHJhdGVneScsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIEhlbHBlciBmdW5jdGlvbnMgZm9yIHRoZSBDb3VudFF1ZXVpbmdTdHJhdGVneS5cbiAgICBmdW5jdGlvbiBjb3VudEJyYW5kQ2hlY2tFeGNlcHRpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihgQ291bnRRdWV1aW5nU3RyYXRlZ3kucHJvdG90eXBlLiR7bmFtZX0gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIENvdW50UXVldWluZ1N0cmF0ZWd5YCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIElzQ291bnRRdWV1aW5nU3RyYXRlZ3koeCkge1xuICAgICAgICBpZiAoIXR5cGVJc09iamVjdCh4KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHgsICdfY291bnRRdWV1aW5nU3RyYXRlZ3lIaWdoV2F0ZXJNYXJrJykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIENvdW50UXVldWluZ1N0cmF0ZWd5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbnZlcnRUcmFuc2Zvcm1lcihvcmlnaW5hbCwgY29udGV4dCkge1xuICAgICAgICBhc3NlcnREaWN0aW9uYXJ5KG9yaWdpbmFsLCBjb250ZXh0KTtcbiAgICAgICAgY29uc3QgZmx1c2ggPSBvcmlnaW5hbCA9PT0gbnVsbCB8fCBvcmlnaW5hbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3JpZ2luYWwuZmx1c2g7XG4gICAgICAgIGNvbnN0IHJlYWRhYmxlVHlwZSA9IG9yaWdpbmFsID09PSBudWxsIHx8IG9yaWdpbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcmlnaW5hbC5yZWFkYWJsZVR5cGU7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gb3JpZ2luYWwgPT09IG51bGwgfHwgb3JpZ2luYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9yaWdpbmFsLnN0YXJ0O1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBvcmlnaW5hbCA9PT0gbnVsbCB8fCBvcmlnaW5hbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3JpZ2luYWwudHJhbnNmb3JtO1xuICAgICAgICBjb25zdCB3cml0YWJsZVR5cGUgPSBvcmlnaW5hbCA9PT0gbnVsbCB8fCBvcmlnaW5hbCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb3JpZ2luYWwud3JpdGFibGVUeXBlO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmx1c2g6IGZsdXNoID09PSB1bmRlZmluZWQgP1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgICAgICAgY29udmVydFRyYW5zZm9ybWVyRmx1c2hDYWxsYmFjayhmbHVzaCwgb3JpZ2luYWwsIGAke2NvbnRleHR9IGhhcyBtZW1iZXIgJ2ZsdXNoJyB0aGF0YCksXG4gICAgICAgICAgICByZWFkYWJsZVR5cGUsXG4gICAgICAgICAgICBzdGFydDogc3RhcnQgPT09IHVuZGVmaW5lZCA/XG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgICAgICAgICBjb252ZXJ0VHJhbnNmb3JtZXJTdGFydENhbGxiYWNrKHN0YXJ0LCBvcmlnaW5hbCwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAnc3RhcnQnIHRoYXRgKSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNmb3JtID09PSB1bmRlZmluZWQgP1xuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgICAgICAgY29udmVydFRyYW5zZm9ybWVyVHJhbnNmb3JtQ2FsbGJhY2sodHJhbnNmb3JtLCBvcmlnaW5hbCwgYCR7Y29udGV4dH0gaGFzIG1lbWJlciAndHJhbnNmb3JtJyB0aGF0YCksXG4gICAgICAgICAgICB3cml0YWJsZVR5cGVcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydFRyYW5zZm9ybWVyRmx1c2hDYWxsYmFjayhmbiwgb3JpZ2luYWwsIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RnVuY3Rpb24oZm4sIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gKGNvbnRyb2xsZXIpID0+IHByb21pc2VDYWxsKGZuLCBvcmlnaW5hbCwgW2NvbnRyb2xsZXJdKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydFRyYW5zZm9ybWVyU3RhcnRDYWxsYmFjayhmbiwgb3JpZ2luYWwsIGNvbnRleHQpIHtcbiAgICAgICAgYXNzZXJ0RnVuY3Rpb24oZm4sIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gKGNvbnRyb2xsZXIpID0+IHJlZmxlY3RDYWxsKGZuLCBvcmlnaW5hbCwgW2NvbnRyb2xsZXJdKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udmVydFRyYW5zZm9ybWVyVHJhbnNmb3JtQ2FsbGJhY2soZm4sIG9yaWdpbmFsLCBjb250ZXh0KSB7XG4gICAgICAgIGFzc2VydEZ1bmN0aW9uKGZuLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIChjaHVuaywgY29udHJvbGxlcikgPT4gcHJvbWlzZUNhbGwoZm4sIG9yaWdpbmFsLCBbY2h1bmssIGNvbnRyb2xsZXJdKTtcbiAgICB9XG5cbiAgICAvLyBDbGFzcyBUcmFuc2Zvcm1TdHJlYW1cbiAgICAvKipcbiAgICAgKiBBIHRyYW5zZm9ybSBzdHJlYW0gY29uc2lzdHMgb2YgYSBwYWlyIG9mIHN0cmVhbXM6IGEge0BsaW5rIFdyaXRhYmxlU3RyZWFtIHwgd3JpdGFibGUgc3RyZWFtfSxcbiAgICAgKiBrbm93biBhcyBpdHMgd3JpdGFibGUgc2lkZSwgYW5kIGEge0BsaW5rIFJlYWRhYmxlU3RyZWFtIHwgcmVhZGFibGUgc3RyZWFtfSwga25vd24gYXMgaXRzIHJlYWRhYmxlIHNpZGUuXG4gICAgICogSW4gYSBtYW5uZXIgc3BlY2lmaWMgdG8gdGhlIHRyYW5zZm9ybSBzdHJlYW0gaW4gcXVlc3Rpb24sIHdyaXRlcyB0byB0aGUgd3JpdGFibGUgc2lkZSByZXN1bHQgaW4gbmV3IGRhdGEgYmVpbmdcbiAgICAgKiBtYWRlIGF2YWlsYWJsZSBmb3IgcmVhZGluZyBmcm9tIHRoZSByZWFkYWJsZSBzaWRlLlxuICAgICAqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGNsYXNzIFRyYW5zZm9ybVN0cmVhbSB7XG4gICAgICAgIGNvbnN0cnVjdG9yKHJhd1RyYW5zZm9ybWVyID0ge30sIHJhd1dyaXRhYmxlU3RyYXRlZ3kgPSB7fSwgcmF3UmVhZGFibGVTdHJhdGVneSA9IHt9KSB7XG4gICAgICAgICAgICBpZiAocmF3VHJhbnNmb3JtZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJhd1RyYW5zZm9ybWVyID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHdyaXRhYmxlU3RyYXRlZ3kgPSBjb252ZXJ0UXVldWluZ1N0cmF0ZWd5KHJhd1dyaXRhYmxlU3RyYXRlZ3ksICdTZWNvbmQgcGFyYW1ldGVyJyk7XG4gICAgICAgICAgICBjb25zdCByZWFkYWJsZVN0cmF0ZWd5ID0gY29udmVydFF1ZXVpbmdTdHJhdGVneShyYXdSZWFkYWJsZVN0cmF0ZWd5LCAnVGhpcmQgcGFyYW1ldGVyJyk7XG4gICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IGNvbnZlcnRUcmFuc2Zvcm1lcihyYXdUcmFuc2Zvcm1lciwgJ0ZpcnN0IHBhcmFtZXRlcicpO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybWVyLnJlYWRhYmxlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgcmVhZGFibGVUeXBlIHNwZWNpZmllZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybWVyLndyaXRhYmxlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgd3JpdGFibGVUeXBlIHNwZWNpZmllZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVhZGFibGVIaWdoV2F0ZXJNYXJrID0gRXh0cmFjdEhpZ2hXYXRlck1hcmsocmVhZGFibGVTdHJhdGVneSwgMCk7XG4gICAgICAgICAgICBjb25zdCByZWFkYWJsZVNpemVBbGdvcml0aG0gPSBFeHRyYWN0U2l6ZUFsZ29yaXRobShyZWFkYWJsZVN0cmF0ZWd5KTtcbiAgICAgICAgICAgIGNvbnN0IHdyaXRhYmxlSGlnaFdhdGVyTWFyayA9IEV4dHJhY3RIaWdoV2F0ZXJNYXJrKHdyaXRhYmxlU3RyYXRlZ3ksIDEpO1xuICAgICAgICAgICAgY29uc3Qgd3JpdGFibGVTaXplQWxnb3JpdGhtID0gRXh0cmFjdFNpemVBbGdvcml0aG0od3JpdGFibGVTdHJhdGVneSk7XG4gICAgICAgICAgICBsZXQgc3RhcnRQcm9taXNlX3Jlc29sdmU7XG4gICAgICAgICAgICBjb25zdCBzdGFydFByb21pc2UgPSBuZXdQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0UHJvbWlzZV9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgSW5pdGlhbGl6ZVRyYW5zZm9ybVN0cmVhbSh0aGlzLCBzdGFydFByb21pc2UsIHdyaXRhYmxlSGlnaFdhdGVyTWFyaywgd3JpdGFibGVTaXplQWxnb3JpdGhtLCByZWFkYWJsZUhpZ2hXYXRlck1hcmssIHJlYWRhYmxlU2l6ZUFsZ29yaXRobSk7XG4gICAgICAgICAgICBTZXRVcFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyRnJvbVRyYW5zZm9ybWVyKHRoaXMsIHRyYW5zZm9ybWVyKTtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm1lci5zdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRQcm9taXNlX3Jlc29sdmUodHJhbnNmb3JtZXIuc3RhcnQodGhpcy5fdHJhbnNmb3JtU3RyZWFtQ29udHJvbGxlcikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhcnRQcm9taXNlX3Jlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHJlYWRhYmxlIHNpZGUgb2YgdGhlIHRyYW5zZm9ybSBzdHJlYW0uXG4gICAgICAgICAqL1xuICAgICAgICBnZXQgcmVhZGFibGUoKSB7XG4gICAgICAgICAgICBpZiAoIUlzVHJhbnNmb3JtU3RyZWFtKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbigncmVhZGFibGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWFkYWJsZTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHdyaXRhYmxlIHNpZGUgb2YgdGhlIHRyYW5zZm9ybSBzdHJlYW0uXG4gICAgICAgICAqL1xuICAgICAgICBnZXQgd3JpdGFibGUoKSB7XG4gICAgICAgICAgICBpZiAoIUlzVHJhbnNmb3JtU3RyZWFtKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgc3RyZWFtQnJhbmRDaGVja0V4Y2VwdGlvbignd3JpdGFibGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93cml0YWJsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhUcmFuc2Zvcm1TdHJlYW0ucHJvdG90eXBlLCB7XG4gICAgICAgIHJlYWRhYmxlOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgd3JpdGFibGU6IHsgZW51bWVyYWJsZTogdHJ1ZSB9XG4gICAgfSk7XG4gICAgaWYgKHR5cGVvZiBTeW1ib2xQb2x5ZmlsbC50b1N0cmluZ1RhZyA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFRyYW5zZm9ybVN0cmVhbS5wcm90b3R5cGUsIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnLCB7XG4gICAgICAgICAgICB2YWx1ZTogJ1RyYW5zZm9ybVN0cmVhbScsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIEluaXRpYWxpemVUcmFuc2Zvcm1TdHJlYW0oc3RyZWFtLCBzdGFydFByb21pc2UsIHdyaXRhYmxlSGlnaFdhdGVyTWFyaywgd3JpdGFibGVTaXplQWxnb3JpdGhtLCByZWFkYWJsZUhpZ2hXYXRlck1hcmssIHJlYWRhYmxlU2l6ZUFsZ29yaXRobSkge1xuICAgICAgICBmdW5jdGlvbiBzdGFydEFsZ29yaXRobSgpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFydFByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gd3JpdGVBbGdvcml0aG0oY2h1bmspIHtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0U2lua1dyaXRlQWxnb3JpdGhtKHN0cmVhbSwgY2h1bmspO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGFib3J0QWxnb3JpdGhtKHJlYXNvbikge1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRTaW5rQWJvcnRBbGdvcml0aG0oc3RyZWFtLCByZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGNsb3NlQWxnb3JpdGhtKCkge1xuICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRTaW5rQ2xvc2VBbGdvcml0aG0oc3RyZWFtKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0uX3dyaXRhYmxlID0gQ3JlYXRlV3JpdGFibGVTdHJlYW0oc3RhcnRBbGdvcml0aG0sIHdyaXRlQWxnb3JpdGhtLCBjbG9zZUFsZ29yaXRobSwgYWJvcnRBbGdvcml0aG0sIHdyaXRhYmxlSGlnaFdhdGVyTWFyaywgd3JpdGFibGVTaXplQWxnb3JpdGhtKTtcbiAgICAgICAgZnVuY3Rpb24gcHVsbEFsZ29yaXRobSgpIHtcbiAgICAgICAgICAgIHJldHVybiBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0U291cmNlUHVsbEFsZ29yaXRobShzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGNhbmNlbEFsZ29yaXRobShyZWFzb24pIHtcbiAgICAgICAgICAgIFRyYW5zZm9ybVN0cmVhbUVycm9yV3JpdGFibGVBbmRVbmJsb2NrV3JpdGUoc3RyZWFtLCByZWFzb24pO1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlZFdpdGgodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJlYW0uX3JlYWRhYmxlID0gQ3JlYXRlUmVhZGFibGVTdHJlYW0oc3RhcnRBbGdvcml0aG0sIHB1bGxBbGdvcml0aG0sIGNhbmNlbEFsZ29yaXRobSwgcmVhZGFibGVIaWdoV2F0ZXJNYXJrLCByZWFkYWJsZVNpemVBbGdvcml0aG0pO1xuICAgICAgICAvLyBUaGUgW1tiYWNrcHJlc3N1cmVdXSBzbG90IGlzIHNldCB0byB1bmRlZmluZWQgc28gdGhhdCBpdCBjYW4gYmUgaW5pdGlhbGlzZWQgYnkgVHJhbnNmb3JtU3RyZWFtU2V0QmFja3ByZXNzdXJlLlxuICAgICAgICBzdHJlYW0uX2JhY2twcmVzc3VyZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgc3RyZWFtLl9iYWNrcHJlc3N1cmVDaGFuZ2VQcm9taXNlID0gdW5kZWZpbmVkO1xuICAgICAgICBzdHJlYW0uX2JhY2twcmVzc3VyZUNoYW5nZVByb21pc2VfcmVzb2x2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgVHJhbnNmb3JtU3RyZWFtU2V0QmFja3ByZXNzdXJlKHN0cmVhbSwgdHJ1ZSk7XG4gICAgICAgIHN0cmVhbS5fdHJhbnNmb3JtU3RyZWFtQ29udHJvbGxlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gSXNUcmFuc2Zvcm1TdHJlYW0oeCkge1xuICAgICAgICBpZiAoIXR5cGVJc09iamVjdCh4KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHgsICdfdHJhbnNmb3JtU3RyZWFtQ29udHJvbGxlcicpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBUcmFuc2Zvcm1TdHJlYW07XG4gICAgfVxuICAgIC8vIFRoaXMgaXMgYSBuby1vcCBpZiBib3RoIHNpZGVzIGFyZSBhbHJlYWR5IGVycm9yZWQuXG4gICAgZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtRXJyb3Ioc3RyZWFtLCBlKSB7XG4gICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFcnJvcihzdHJlYW0uX3JlYWRhYmxlLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXIsIGUpO1xuICAgICAgICBUcmFuc2Zvcm1TdHJlYW1FcnJvcldyaXRhYmxlQW5kVW5ibG9ja1dyaXRlKHN0cmVhbSwgZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFRyYW5zZm9ybVN0cmVhbUVycm9yV3JpdGFibGVBbmRVbmJsb2NrV3JpdGUoc3RyZWFtLCBlKSB7XG4gICAgICAgIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKHN0cmVhbS5fdHJhbnNmb3JtU3RyZWFtQ29udHJvbGxlcik7XG4gICAgICAgIFdyaXRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFcnJvcklmTmVlZGVkKHN0cmVhbS5fd3JpdGFibGUuX3dyaXRhYmxlU3RyZWFtQ29udHJvbGxlciwgZSk7XG4gICAgICAgIGlmIChzdHJlYW0uX2JhY2twcmVzc3VyZSkge1xuICAgICAgICAgICAgLy8gUHJldGVuZCB0aGF0IHB1bGwoKSB3YXMgY2FsbGVkIHRvIHBlcm1pdCBhbnkgcGVuZGluZyB3cml0ZSgpIGNhbGxzIHRvIGNvbXBsZXRlLiBUcmFuc2Zvcm1TdHJlYW1TZXRCYWNrcHJlc3N1cmUoKVxuICAgICAgICAgICAgLy8gY2Fubm90IGJlIGNhbGxlZCBmcm9tIGVucXVldWUoKSBvciBwdWxsKCkgb25jZSB0aGUgUmVhZGFibGVTdHJlYW0gaXMgZXJyb3JlZCwgc28gdGhpcyB3aWxsIHdpbGwgYmUgdGhlIGZpbmFsIHRpbWVcbiAgICAgICAgICAgIC8vIF9iYWNrcHJlc3N1cmUgaXMgc2V0LlxuICAgICAgICAgICAgVHJhbnNmb3JtU3RyZWFtU2V0QmFja3ByZXNzdXJlKHN0cmVhbSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIFRyYW5zZm9ybVN0cmVhbVNldEJhY2twcmVzc3VyZShzdHJlYW0sIGJhY2twcmVzc3VyZSkge1xuICAgICAgICAvLyBQYXNzZXMgYWxzbyB3aGVuIGNhbGxlZCBkdXJpbmcgY29uc3RydWN0aW9uLlxuICAgICAgICBpZiAoc3RyZWFtLl9iYWNrcHJlc3N1cmVDaGFuZ2VQcm9taXNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN0cmVhbS5fYmFja3ByZXNzdXJlQ2hhbmdlUHJvbWlzZV9yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgc3RyZWFtLl9iYWNrcHJlc3N1cmVDaGFuZ2VQcm9taXNlID0gbmV3UHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHN0cmVhbS5fYmFja3ByZXNzdXJlQ2hhbmdlUHJvbWlzZV9yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHN0cmVhbS5fYmFja3ByZXNzdXJlID0gYmFja3ByZXNzdXJlO1xuICAgIH1cbiAgICAvLyBDbGFzcyBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlclxuICAgIC8qKlxuICAgICAqIEFsbG93cyBjb250cm9sIG9mIHRoZSB7QGxpbmsgUmVhZGFibGVTdHJlYW19IGFuZCB7QGxpbmsgV3JpdGFibGVTdHJlYW19IG9mIHRoZSBhc3NvY2lhdGVkIHtAbGluayBUcmFuc2Zvcm1TdHJlYW19LlxuICAgICAqXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGNsYXNzIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyIHtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbGxlZ2FsIGNvbnN0cnVjdG9yJyk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldHVybnMgdGhlIGRlc2lyZWQgc2l6ZSB0byBmaWxsIHRoZSByZWFkYWJsZSBzaWRl4oCZcyBpbnRlcm5hbCBxdWV1ZS4gSXQgY2FuIGJlIG5lZ2F0aXZlLCBpZiB0aGUgcXVldWUgaXMgb3Zlci1mdWxsLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0IGRlc2lyZWRTaXplKCkge1xuICAgICAgICAgICAgaWYgKCFJc1RyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGVmYXVsdENvbnRyb2xsZXJCcmFuZENoZWNrRXhjZXB0aW9uKCdkZXNpcmVkU2l6ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVhZGFibGVDb250cm9sbGVyID0gdGhpcy5fY29udHJvbGxlZFRyYW5zZm9ybVN0cmVhbS5fcmVhZGFibGUuX3JlYWRhYmxlU3RyZWFtQ29udHJvbGxlcjtcbiAgICAgICAgICAgIHJldHVybiBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyR2V0RGVzaXJlZFNpemUocmVhZGFibGVDb250cm9sbGVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbnF1ZXVlKGNodW5rID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIUlzVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBkZWZhdWx0Q29udHJvbGxlckJyYW5kQ2hlY2tFeGNlcHRpb24oJ2VucXVldWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyRW5xdWV1ZSh0aGlzLCBjaHVuayk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVycm9ycyBib3RoIHRoZSByZWFkYWJsZSBzaWRlIGFuZCB0aGUgd3JpdGFibGUgc2lkZSBvZiB0aGUgY29udHJvbGxlZCB0cmFuc2Zvcm0gc3RyZWFtLCBtYWtpbmcgYWxsIGZ1dHVyZVxuICAgICAgICAgKiBpbnRlcmFjdGlvbnMgd2l0aCBpdCBmYWlsIHdpdGggdGhlIGdpdmVuIGVycm9yIGBlYC4gQW55IGNodW5rcyBxdWV1ZWQgZm9yIHRyYW5zZm9ybWF0aW9uIHdpbGwgYmUgZGlzY2FyZGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgZXJyb3IocmVhc29uID0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIUlzVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIodGhpcykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBkZWZhdWx0Q29udHJvbGxlckJyYW5kQ2hlY2tFeGNlcHRpb24oJ2Vycm9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlckVycm9yKHRoaXMsIHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENsb3NlcyB0aGUgcmVhZGFibGUgc2lkZSBhbmQgZXJyb3JzIHRoZSB3cml0YWJsZSBzaWRlIG9mIHRoZSBjb250cm9sbGVkIHRyYW5zZm9ybSBzdHJlYW0uIFRoaXMgaXMgdXNlZnVsIHdoZW4gdGhlXG4gICAgICAgICAqIHRyYW5zZm9ybWVyIG9ubHkgbmVlZHMgdG8gY29uc3VtZSBhIHBvcnRpb24gb2YgdGhlIGNodW5rcyB3cml0dGVuIHRvIHRoZSB3cml0YWJsZSBzaWRlLlxuICAgICAgICAgKi9cbiAgICAgICAgdGVybWluYXRlKCkge1xuICAgICAgICAgICAgaWYgKCFJc1RyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZGVmYXVsdENvbnRyb2xsZXJCcmFuZENoZWNrRXhjZXB0aW9uKCd0ZXJtaW5hdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyVGVybWluYXRlKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSwge1xuICAgICAgICBlbnF1ZXVlOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgICAgICAgZXJyb3I6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICB0ZXJtaW5hdGU6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICAgICAgICBkZXNpcmVkU2l6ZTogeyBlbnVtZXJhYmxlOiB0cnVlIH1cbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIFN5bWJvbFBvbHlmaWxsLnRvU3RyaW5nVGFnID09PSAnc3ltYm9sJykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIucHJvdG90eXBlLCBTeW1ib2xQb2x5ZmlsbC50b1N0cmluZ1RhZywge1xuICAgICAgICAgICAgdmFsdWU6ICdUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlcicsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFRyYW5zZm9ybSBTdHJlYW0gRGVmYXVsdCBDb250cm9sbGVyIEFic3RyYWN0IE9wZXJhdGlvbnNcbiAgICBmdW5jdGlvbiBJc1RyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyKHgpIHtcbiAgICAgICAgaWYgKCF0eXBlSXNPYmplY3QoeCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh4LCAnX2NvbnRyb2xsZWRUcmFuc2Zvcm1TdHJlYW0nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFNldFVwVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIoc3RyZWFtLCBjb250cm9sbGVyLCB0cmFuc2Zvcm1BbGdvcml0aG0sIGZsdXNoQWxnb3JpdGhtKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRUcmFuc2Zvcm1TdHJlYW0gPSBzdHJlYW07XG4gICAgICAgIHN0cmVhbS5fdHJhbnNmb3JtU3RyZWFtQ29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgICAgIGNvbnRyb2xsZXIuX3RyYW5zZm9ybUFsZ29yaXRobSA9IHRyYW5zZm9ybUFsZ29yaXRobTtcbiAgICAgICAgY29udHJvbGxlci5fZmx1c2hBbGdvcml0aG0gPSBmbHVzaEFsZ29yaXRobTtcbiAgICB9XG4gICAgZnVuY3Rpb24gU2V0VXBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlckZyb21UcmFuc2Zvcm1lcihzdHJlYW0sIHRyYW5zZm9ybWVyKSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBPYmplY3QuY3JlYXRlKFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyLnByb3RvdHlwZSk7XG4gICAgICAgIGxldCB0cmFuc2Zvcm1BbGdvcml0aG0gPSAoY2h1bmspID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFbnF1ZXVlKGNvbnRyb2xsZXIsIGNodW5rKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKHRyYW5zZm9ybVJlc3VsdEUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvbWlzZVJlamVjdGVkV2l0aCh0cmFuc2Zvcm1SZXN1bHRFKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGZsdXNoQWxnb3JpdGhtID0gKCkgPT4gcHJvbWlzZVJlc29sdmVkV2l0aCh1bmRlZmluZWQpO1xuICAgICAgICBpZiAodHJhbnNmb3JtZXIudHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRyYW5zZm9ybUFsZ29yaXRobSA9IGNodW5rID0+IHRyYW5zZm9ybWVyLnRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zZm9ybWVyLmZsdXNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZsdXNoQWxnb3JpdGhtID0gKCkgPT4gdHJhbnNmb3JtZXIuZmx1c2goY29udHJvbGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgU2V0VXBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlcihzdHJlYW0sIGNvbnRyb2xsZXIsIHRyYW5zZm9ybUFsZ29yaXRobSwgZmx1c2hBbGdvcml0aG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlckNsZWFyQWxnb3JpdGhtcyhjb250cm9sbGVyKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuX3RyYW5zZm9ybUFsZ29yaXRobSA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29udHJvbGxlci5fZmx1c2hBbGdvcml0aG0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyRW5xdWV1ZShjb250cm9sbGVyLCBjaHVuaykge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkVHJhbnNmb3JtU3RyZWFtO1xuICAgICAgICBjb25zdCByZWFkYWJsZUNvbnRyb2xsZXIgPSBzdHJlYW0uX3JlYWRhYmxlLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI7XG4gICAgICAgIGlmICghUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckNhbkNsb3NlT3JFbnF1ZXVlKHJlYWRhYmxlQ29udHJvbGxlcikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlYWRhYmxlIHNpZGUgaXMgbm90IGluIGEgc3RhdGUgdGhhdCBwZXJtaXRzIGVucXVldWUnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXZSB0aHJvdHRsZSB0cmFuc2Zvcm0gaW52b2NhdGlvbnMgYmFzZWQgb24gdGhlIGJhY2twcmVzc3VyZSBvZiB0aGUgUmVhZGFibGVTdHJlYW0sIGJ1dCB3ZSBzdGlsbFxuICAgICAgICAvLyBhY2NlcHQgVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFbnF1ZXVlKCkgY2FsbHMuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyRW5xdWV1ZShyZWFkYWJsZUNvbnRyb2xsZXIsIGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIHdoZW4gcmVhZGFibGVTdHJhdGVneS5zaXplKCkgdGhyb3dzLlxuICAgICAgICAgICAgVHJhbnNmb3JtU3RyZWFtRXJyb3JXcml0YWJsZUFuZFVuYmxvY2tXcml0ZShzdHJlYW0sIGUpO1xuICAgICAgICAgICAgdGhyb3cgc3RyZWFtLl9yZWFkYWJsZS5fc3RvcmVkRXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmFja3ByZXNzdXJlID0gUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlckhhc0JhY2twcmVzc3VyZShyZWFkYWJsZUNvbnRyb2xsZXIpO1xuICAgICAgICBpZiAoYmFja3ByZXNzdXJlICE9PSBzdHJlYW0uX2JhY2twcmVzc3VyZSkge1xuICAgICAgICAgICAgVHJhbnNmb3JtU3RyZWFtU2V0QmFja3ByZXNzdXJlKHN0cmVhbSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJFcnJvcihjb250cm9sbGVyLCBlKSB7XG4gICAgICAgIFRyYW5zZm9ybVN0cmVhbUVycm9yKGNvbnRyb2xsZXIuX2NvbnRyb2xsZWRUcmFuc2Zvcm1TdHJlYW0sIGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlclBlcmZvcm1UcmFuc2Zvcm0oY29udHJvbGxlciwgY2h1bmspIHtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtUHJvbWlzZSA9IGNvbnRyb2xsZXIuX3RyYW5zZm9ybUFsZ29yaXRobShjaHVuayk7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1Qcm9taXNlV2l0aCh0cmFuc2Zvcm1Qcm9taXNlLCB1bmRlZmluZWQsIHIgPT4ge1xuICAgICAgICAgICAgVHJhbnNmb3JtU3RyZWFtRXJyb3IoY29udHJvbGxlci5fY29udHJvbGxlZFRyYW5zZm9ybVN0cmVhbSwgcik7XG4gICAgICAgICAgICB0aHJvdyByO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJUZXJtaW5hdGUoY29udHJvbGxlcikge1xuICAgICAgICBjb25zdCBzdHJlYW0gPSBjb250cm9sbGVyLl9jb250cm9sbGVkVHJhbnNmb3JtU3RyZWFtO1xuICAgICAgICBjb25zdCByZWFkYWJsZUNvbnRyb2xsZXIgPSBzdHJlYW0uX3JlYWRhYmxlLl9yZWFkYWJsZVN0cmVhbUNvbnRyb2xsZXI7XG4gICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbG9zZShyZWFkYWJsZUNvbnRyb2xsZXIpO1xuICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBUeXBlRXJyb3IoJ1RyYW5zZm9ybVN0cmVhbSB0ZXJtaW5hdGVkJyk7XG4gICAgICAgIFRyYW5zZm9ybVN0cmVhbUVycm9yV3JpdGFibGVBbmRVbmJsb2NrV3JpdGUoc3RyZWFtLCBlcnJvcik7XG4gICAgfVxuICAgIC8vIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRTaW5rIEFsZ29yaXRobXNcbiAgICBmdW5jdGlvbiBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0U2lua1dyaXRlQWxnb3JpdGhtKHN0cmVhbSwgY2h1bmspIHtcbiAgICAgICAgY29uc3QgY29udHJvbGxlciA9IHN0cmVhbS5fdHJhbnNmb3JtU3RyZWFtQ29udHJvbGxlcjtcbiAgICAgICAgaWYgKHN0cmVhbS5fYmFja3ByZXNzdXJlKSB7XG4gICAgICAgICAgICBjb25zdCBiYWNrcHJlc3N1cmVDaGFuZ2VQcm9taXNlID0gc3RyZWFtLl9iYWNrcHJlc3N1cmVDaGFuZ2VQcm9taXNlO1xuICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVByb21pc2VXaXRoKGJhY2twcmVzc3VyZUNoYW5nZVByb21pc2UsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB3cml0YWJsZSA9IHN0cmVhbS5fd3JpdGFibGU7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSB3cml0YWJsZS5fc3RhdGU7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlID09PSAnZXJyb3JpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IHdyaXRhYmxlLl9zdG9yZWRFcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyUGVyZm9ybVRyYW5zZm9ybShjb250cm9sbGVyLCBjaHVuayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJQZXJmb3JtVHJhbnNmb3JtKGNvbnRyb2xsZXIsIGNodW5rKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtRGVmYXVsdFNpbmtBYm9ydEFsZ29yaXRobShzdHJlYW0sIHJlYXNvbikge1xuICAgICAgICAvLyBhYm9ydCgpIGlzIG5vdCBjYWxsZWQgc3luY2hyb25vdXNseSwgc28gaXQgaXMgcG9zc2libGUgZm9yIGFib3J0KCkgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHN0cmVhbSBpcyBhbHJlYWR5XG4gICAgICAgIC8vIGVycm9yZWQuXG4gICAgICAgIFRyYW5zZm9ybVN0cmVhbUVycm9yKHN0cmVhbSwgcmVhc29uKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlZFdpdGgodW5kZWZpbmVkKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtRGVmYXVsdFNpbmtDbG9zZUFsZ29yaXRobShzdHJlYW0pIHtcbiAgICAgICAgLy8gc3RyZWFtLl9yZWFkYWJsZSBjYW5ub3QgY2hhbmdlIGFmdGVyIGNvbnN0cnVjdGlvbiwgc28gY2FjaGluZyBpdCBhY3Jvc3MgYSBjYWxsIHRvIHVzZXIgY29kZSBpcyBzYWZlLlxuICAgICAgICBjb25zdCByZWFkYWJsZSA9IHN0cmVhbS5fcmVhZGFibGU7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xsZXIgPSBzdHJlYW0uX3RyYW5zZm9ybVN0cmVhbUNvbnRyb2xsZXI7XG4gICAgICAgIGNvbnN0IGZsdXNoUHJvbWlzZSA9IGNvbnRyb2xsZXIuX2ZsdXNoQWxnb3JpdGhtKCk7XG4gICAgICAgIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyQ2xlYXJBbGdvcml0aG1zKGNvbnRyb2xsZXIpO1xuICAgICAgICAvLyBSZXR1cm4gYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdpdGggdW5kZWZpbmVkIG9uIHN1Y2Nlc3MuXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1Qcm9taXNlV2l0aChmbHVzaFByb21pc2UsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChyZWFkYWJsZS5fc3RhdGUgPT09ICdlcnJvcmVkJykge1xuICAgICAgICAgICAgICAgIHRocm93IHJlYWRhYmxlLl9zdG9yZWRFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJDbG9zZShyZWFkYWJsZS5fcmVhZGFibGVTdHJlYW1Db250cm9sbGVyKTtcbiAgICAgICAgfSwgciA9PiB7XG4gICAgICAgICAgICBUcmFuc2Zvcm1TdHJlYW1FcnJvcihzdHJlYW0sIHIpO1xuICAgICAgICAgICAgdGhyb3cgcmVhZGFibGUuX3N0b3JlZEVycm9yO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVHJhbnNmb3JtU3RyZWFtRGVmYXVsdFNvdXJjZSBBbGdvcml0aG1zXG4gICAgZnVuY3Rpb24gVHJhbnNmb3JtU3RyZWFtRGVmYXVsdFNvdXJjZVB1bGxBbGdvcml0aG0oc3RyZWFtKSB7XG4gICAgICAgIC8vIEludmFyaWFudC4gRW5mb3JjZWQgYnkgdGhlIHByb21pc2VzIHJldHVybmVkIGJ5IHN0YXJ0KCkgYW5kIHB1bGwoKS5cbiAgICAgICAgVHJhbnNmb3JtU3RyZWFtU2V0QmFja3ByZXNzdXJlKHN0cmVhbSwgZmFsc2UpO1xuICAgICAgICAvLyBQcmV2ZW50IHRoZSBuZXh0IHB1bGwoKSBjYWxsIHVudGlsIHRoZXJlIGlzIGJhY2twcmVzc3VyZS5cbiAgICAgICAgcmV0dXJuIHN0cmVhbS5fYmFja3ByZXNzdXJlQ2hhbmdlUHJvbWlzZTtcbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyLlxuICAgIGZ1bmN0aW9uIGRlZmF1bHRDb250cm9sbGVyQnJhbmRDaGVja0V4Y2VwdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKGBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlci5wcm90b3R5cGUuJHtuYW1lfSBjYW4gb25seSBiZSB1c2VkIG9uIGEgVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXJgKTtcbiAgICB9XG4gICAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgdGhlIFRyYW5zZm9ybVN0cmVhbS5cbiAgICBmdW5jdGlvbiBzdHJlYW1CcmFuZENoZWNrRXhjZXB0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoYFRyYW5zZm9ybVN0cmVhbS5wcm90b3R5cGUuJHtuYW1lfSBjYW4gb25seSBiZSB1c2VkIG9uIGEgVHJhbnNmb3JtU3RyZWFtYCk7XG4gICAgfVxuXG4gICAgZXhwb3J0cy5CeXRlTGVuZ3RoUXVldWluZ1N0cmF0ZWd5ID0gQnl0ZUxlbmd0aFF1ZXVpbmdTdHJhdGVneTtcbiAgICBleHBvcnRzLkNvdW50UXVldWluZ1N0cmF0ZWd5ID0gQ291bnRRdWV1aW5nU3RyYXRlZ3k7XG4gICAgZXhwb3J0cy5SZWFkYWJsZUJ5dGVTdHJlYW1Db250cm9sbGVyID0gUmVhZGFibGVCeXRlU3RyZWFtQ29udHJvbGxlcjtcbiAgICBleHBvcnRzLlJlYWRhYmxlU3RyZWFtID0gUmVhZGFibGVTdHJlYW07XG4gICAgZXhwb3J0cy5SZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXIgPSBSZWFkYWJsZVN0cmVhbUJZT0JSZWFkZXI7XG4gICAgZXhwb3J0cy5SZWFkYWJsZVN0cmVhbUJZT0JSZXF1ZXN0ID0gUmVhZGFibGVTdHJlYW1CWU9CUmVxdWVzdDtcbiAgICBleHBvcnRzLlJlYWRhYmxlU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIgPSBSZWFkYWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyO1xuICAgIGV4cG9ydHMuUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyID0gUmVhZGFibGVTdHJlYW1EZWZhdWx0UmVhZGVyO1xuICAgIGV4cG9ydHMuVHJhbnNmb3JtU3RyZWFtID0gVHJhbnNmb3JtU3RyZWFtO1xuICAgIGV4cG9ydHMuVHJhbnNmb3JtU3RyZWFtRGVmYXVsdENvbnRyb2xsZXIgPSBUcmFuc2Zvcm1TdHJlYW1EZWZhdWx0Q29udHJvbGxlcjtcbiAgICBleHBvcnRzLldyaXRhYmxlU3RyZWFtID0gV3JpdGFibGVTdHJlYW07XG4gICAgZXhwb3J0cy5Xcml0YWJsZVN0cmVhbURlZmF1bHRDb250cm9sbGVyID0gV3JpdGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcjtcbiAgICBleHBvcnRzLldyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlciA9IFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcjtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wb255ZmlsbC5lczIwMTguanMubWFwXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJidWZmZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpidWZmZXJcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpmc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOmh0dHBcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpodHRwc1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOm5ldFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnBhdGhcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTpwcm9jZXNzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6c3RyZWFtXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5vZGU6c3RyZWFtL3dlYlwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnVybFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJub2RlOnV0aWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibm9kZTp6bGliXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIndvcmtlcl90aHJlYWRzXCIpOyIsIi8qIGM4IGlnbm9yZSBzdGFydCAqL1xuLy8gNjQgS2lCIChzYW1lIHNpemUgY2hyb21lIHNsaWNlIHRoZWlycyBibG9iIGludG8gVWludDhhcnJheSdzKVxuY29uc3QgUE9PTF9TSVpFID0gNjU1MzZcblxuaWYgKCFnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtKSB7XG4gIC8vIGBub2RlOnN0cmVhbS93ZWJgIGdvdCBpbnRyb2R1Y2VkIGluIHYxNi41LjAgYXMgZXhwZXJpbWVudGFsXG4gIC8vIGFuZCBpdCdzIHByZWZlcnJlZCBvdmVyIHRoZSBwb2x5ZmlsbGVkIHZlcnNpb24uIFNvIHdlIGFsc29cbiAgLy8gc3VwcHJlc3MgdGhlIHdhcm5pbmcgdGhhdCBnZXRzIGVtaXR0ZWQgYnkgTm9kZUpTIGZvciB1c2luZyBpdC5cbiAgdHJ5IHtcbiAgICBjb25zdCBwcm9jZXNzID0gcmVxdWlyZSgnbm9kZTpwcm9jZXNzJylcbiAgICBjb25zdCB7IGVtaXRXYXJuaW5nIH0gPSBwcm9jZXNzXG4gICAgdHJ5IHtcbiAgICAgIHByb2Nlc3MuZW1pdFdhcm5pbmcgPSAoKSA9PiB7fVxuICAgICAgT2JqZWN0LmFzc2lnbihnbG9iYWxUaGlzLCByZXF1aXJlKCdub2RlOnN0cmVhbS93ZWInKSlcbiAgICAgIHByb2Nlc3MuZW1pdFdhcm5pbmcgPSBlbWl0V2FybmluZ1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBwcm9jZXNzLmVtaXRXYXJuaW5nID0gZW1pdFdhcm5pbmdcbiAgICAgIHRocm93IGVycm9yXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIGZhbGxiYWNrIHRvIHBvbHlmaWxsIGltcGxlbWVudGF0aW9uXG4gICAgT2JqZWN0LmFzc2lnbihnbG9iYWxUaGlzLCByZXF1aXJlKCd3ZWItc3RyZWFtcy1wb2x5ZmlsbC9kaXN0L3BvbnlmaWxsLmVzMjAxOC5qcycpKVxuICB9XG59XG5cbnRyeSB7XG4gIC8vIERvbid0IHVzZSBub2RlOiBwcmVmaXggZm9yIHRoaXMsIHJlcXVpcmUrbm9kZTogaXMgbm90IHN1cHBvcnRlZCB1bnRpbCBub2RlIHYxNC4xNFxuICAvLyBPbmx5IGBpbXBvcnQoKWAgY2FuIHVzZSBwcmVmaXggaW4gMTIuMjAgYW5kIGxhdGVyXG4gIGNvbnN0IHsgQmxvYiB9ID0gcmVxdWlyZSgnYnVmZmVyJylcbiAgaWYgKEJsb2IgJiYgIUJsb2IucHJvdG90eXBlLnN0cmVhbSkge1xuICAgIEJsb2IucHJvdG90eXBlLnN0cmVhbSA9IGZ1bmN0aW9uIG5hbWUgKHBhcmFtcykge1xuICAgICAgbGV0IHBvc2l0aW9uID0gMFxuICAgICAgY29uc3QgYmxvYiA9IHRoaXNcblxuICAgICAgcmV0dXJuIG5ldyBSZWFkYWJsZVN0cmVhbSh7XG4gICAgICAgIHR5cGU6ICdieXRlcycsXG4gICAgICAgIGFzeW5jIHB1bGwgKGN0cmwpIHtcbiAgICAgICAgICBjb25zdCBjaHVuayA9IGJsb2Iuc2xpY2UocG9zaXRpb24sIE1hdGgubWluKGJsb2Iuc2l6ZSwgcG9zaXRpb24gKyBQT09MX1NJWkUpKVxuICAgICAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGNodW5rLmFycmF5QnVmZmVyKClcbiAgICAgICAgICBwb3NpdGlvbiArPSBidWZmZXIuYnl0ZUxlbmd0aFxuICAgICAgICAgIGN0cmwuZW5xdWV1ZShuZXcgVWludDhBcnJheShidWZmZXIpKVxuXG4gICAgICAgICAgaWYgKHBvc2l0aW9uID09PSBibG9iLnNpemUpIHtcbiAgICAgICAgICAgIGN0cmwuY2xvc2UoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn0gY2F0Y2ggKGVycm9yKSB7fVxuLyogYzggaWdub3JlIGVuZCAqL1xuIiwiLyoqXG4gKiBSZXR1cm5zIGEgYEJ1ZmZlcmAgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBVUkkgYHVyaWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVyaSBEYXRhIFVSSSB0byB0dXJuIGludG8gYSBCdWZmZXIgaW5zdGFuY2VcbiAqIEByZXR1cm5zIHtCdWZmZXJ9IEJ1ZmZlciBpbnN0YW5jZSBmcm9tIERhdGEgVVJJXG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGF0YVVyaVRvQnVmZmVyKHVyaSkge1xuICAgIGlmICghL15kYXRhOi9pLnRlc3QodXJpKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdXJpYCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBEYXRhIFVSSSAobXVzdCBiZWdpbiB3aXRoIFwiZGF0YTpcIiknKTtcbiAgICB9XG4gICAgLy8gc3RyaXAgbmV3bGluZXNcbiAgICB1cmkgPSB1cmkucmVwbGFjZSgvXFxyP1xcbi9nLCAnJyk7XG4gICAgLy8gc3BsaXQgdGhlIFVSSSB1cCBpbnRvIHRoZSBcIm1ldGFkYXRhXCIgYW5kIHRoZSBcImRhdGFcIiBwb3J0aW9uc1xuICAgIGNvbnN0IGZpcnN0Q29tbWEgPSB1cmkuaW5kZXhPZignLCcpO1xuICAgIGlmIChmaXJzdENvbW1hID09PSAtMSB8fCBmaXJzdENvbW1hIDw9IDQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWFsZm9ybWVkIGRhdGE6IFVSSScpO1xuICAgIH1cbiAgICAvLyByZW1vdmUgdGhlIFwiZGF0YTpcIiBzY2hlbWUgYW5kIHBhcnNlIHRoZSBtZXRhZGF0YVxuICAgIGNvbnN0IG1ldGEgPSB1cmkuc3Vic3RyaW5nKDUsIGZpcnN0Q29tbWEpLnNwbGl0KCc7Jyk7XG4gICAgbGV0IGNoYXJzZXQgPSAnJztcbiAgICBsZXQgYmFzZTY0ID0gZmFsc2U7XG4gICAgY29uc3QgdHlwZSA9IG1ldGFbMF0gfHwgJ3RleHQvcGxhaW4nO1xuICAgIGxldCB0eXBlRnVsbCA9IHR5cGU7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBtZXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChtZXRhW2ldID09PSAnYmFzZTY0Jykge1xuICAgICAgICAgICAgYmFzZTY0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHR5cGVGdWxsICs9IGA7JHttZXRhW2ldfWA7XG4gICAgICAgICAgICBpZiAobWV0YVtpXS5pbmRleE9mKCdjaGFyc2V0PScpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY2hhcnNldCA9IG1ldGFbaV0uc3Vic3RyaW5nKDgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGRlZmF1bHRzIHRvIFVTLUFTQ0lJIG9ubHkgaWYgdHlwZSBpcyBub3QgcHJvdmlkZWRcbiAgICBpZiAoIW1ldGFbMF0gJiYgIWNoYXJzZXQubGVuZ3RoKSB7XG4gICAgICAgIHR5cGVGdWxsICs9ICc7Y2hhcnNldD1VUy1BU0NJSSc7XG4gICAgICAgIGNoYXJzZXQgPSAnVVMtQVNDSUknO1xuICAgIH1cbiAgICAvLyBnZXQgdGhlIGVuY29kZWQgZGF0YSBwb3J0aW9uIGFuZCBkZWNvZGUgVVJJLWVuY29kZWQgY2hhcnNcbiAgICBjb25zdCBlbmNvZGluZyA9IGJhc2U2NCA/ICdiYXNlNjQnIDogJ2FzY2lpJztcbiAgICBjb25zdCBkYXRhID0gdW5lc2NhcGUodXJpLnN1YnN0cmluZyhmaXJzdENvbW1hICsgMSkpO1xuICAgIGNvbnN0IGJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGRhdGEsIGVuY29kaW5nKTtcbiAgICAvLyBzZXQgYC50eXBlYCBhbmQgYC50eXBlRnVsbGAgcHJvcGVydGllcyB0byBNSU1FIHR5cGVcbiAgICBidWZmZXIudHlwZSA9IHR5cGU7XG4gICAgYnVmZmVyLnR5cGVGdWxsID0gdHlwZUZ1bGw7XG4gICAgLy8gc2V0IHRoZSBgLmNoYXJzZXRgIHByb3BlcnR5XG4gICAgYnVmZmVyLmNoYXJzZXQgPSBjaGFyc2V0O1xuICAgIHJldHVybiBidWZmZXI7XG59XG5leHBvcnQgZGVmYXVsdCBkYXRhVXJpVG9CdWZmZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLCJpbXBvcnQgQmxvYiBmcm9tICcuL2luZGV4LmpzJ1xuXG5jb25zdCBfRmlsZSA9IGNsYXNzIEZpbGUgZXh0ZW5kcyBCbG9iIHtcbiAgI2xhc3RNb2RpZmllZCA9IDBcbiAgI25hbWUgPSAnJ1xuXG4gIC8qKlxuICAgKiBAcGFyYW0geypbXX0gZmlsZUJpdHNcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVOYW1lXG4gICAqIEBwYXJhbSB7e2xhc3RNb2RpZmllZD86IG51bWJlciwgdHlwZT86IHN0cmluZ319IG9wdGlvbnNcbiAgICovLy8gQHRzLWlnbm9yZVxuICBjb25zdHJ1Y3RvciAoZmlsZUJpdHMsIGZpbGVOYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEZhaWxlZCB0byBjb25zdHJ1Y3QgJ0ZpbGUnOiAyIGFyZ3VtZW50cyByZXF1aXJlZCwgYnV0IG9ubHkgJHthcmd1bWVudHMubGVuZ3RofSBwcmVzZW50LmApXG4gICAgfVxuICAgIHN1cGVyKGZpbGVCaXRzLCBvcHRpb25zKVxuXG4gICAgaWYgKG9wdGlvbnMgPT09IG51bGwpIG9wdGlvbnMgPSB7fVxuXG4gICAgLy8gU2ltdWxhdGUgV2ViSURMIHR5cGUgY2FzdGluZyBmb3IgTmFOIHZhbHVlIGluIGxhc3RNb2RpZmllZCBvcHRpb24uXG4gICAgY29uc3QgbGFzdE1vZGlmaWVkID0gb3B0aW9ucy5sYXN0TW9kaWZpZWQgPT09IHVuZGVmaW5lZCA/IERhdGUubm93KCkgOiBOdW1iZXIob3B0aW9ucy5sYXN0TW9kaWZpZWQpXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4obGFzdE1vZGlmaWVkKSkge1xuICAgICAgdGhpcy4jbGFzdE1vZGlmaWVkID0gbGFzdE1vZGlmaWVkXG4gICAgfVxuXG4gICAgdGhpcy4jbmFtZSA9IFN0cmluZyhmaWxlTmFtZSlcbiAgfVxuXG4gIGdldCBuYW1lICgpIHtcbiAgICByZXR1cm4gdGhpcy4jbmFtZVxuICB9XG5cbiAgZ2V0IGxhc3RNb2RpZmllZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2xhc3RNb2RpZmllZFxuICB9XG5cbiAgZ2V0IFtTeW1ib2wudG9TdHJpbmdUYWddICgpIHtcbiAgICByZXR1cm4gJ0ZpbGUnXG4gIH1cblxuICBzdGF0aWMgW1N5bWJvbC5oYXNJbnN0YW5jZV0gKG9iamVjdCkge1xuICAgIHJldHVybiAhIW9iamVjdCAmJiBvYmplY3QgaW5zdGFuY2VvZiBCbG9iICYmXG4gICAgICAvXihGaWxlKSQvLnRlc3Qob2JqZWN0W1N5bWJvbC50b1N0cmluZ1RhZ10pXG4gIH1cbn1cblxuLyoqIEB0eXBlIHt0eXBlb2YgZ2xvYmFsVGhpcy5GaWxlfSAqLy8vIEB0cy1pZ25vcmVcbmV4cG9ydCBjb25zdCBGaWxlID0gX0ZpbGVcbmV4cG9ydCBkZWZhdWx0IEZpbGVcbiIsImltcG9ydCB7IHN0YXRTeW5jLCBjcmVhdGVSZWFkU3RyZWFtLCBwcm9taXNlcyBhcyBmcyB9IGZyb20gJ25vZGU6ZnMnXG5pbXBvcnQgeyBiYXNlbmFtZSB9IGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCBET01FeGNlcHRpb24gZnJvbSAnbm9kZS1kb21leGNlcHRpb24nXG5cbmltcG9ydCBGaWxlIGZyb20gJy4vZmlsZS5qcydcbmltcG9ydCBCbG9iIGZyb20gJy4vaW5kZXguanMnXG5cbmNvbnN0IHsgc3RhdCB9ID0gZnNcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBmaWxlcGF0aCBvbiB0aGUgZGlza1xuICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXSBtaW1ldHlwZSB0byB1c2VcbiAqL1xuY29uc3QgYmxvYkZyb21TeW5jID0gKHBhdGgsIHR5cGUpID0+IGZyb21CbG9iKHN0YXRTeW5jKHBhdGgpLCBwYXRoLCB0eXBlKVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIGZpbGVwYXRoIG9uIHRoZSBkaXNrXG4gKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdIG1pbWV0eXBlIHRvIHVzZVxuICogQHJldHVybnMge1Byb21pc2U8QmxvYj59XG4gKi9cbmNvbnN0IGJsb2JGcm9tID0gKHBhdGgsIHR5cGUpID0+IHN0YXQocGF0aCkudGhlbihzdGF0ID0+IGZyb21CbG9iKHN0YXQsIHBhdGgsIHR5cGUpKVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIGZpbGVwYXRoIG9uIHRoZSBkaXNrXG4gKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdIG1pbWV0eXBlIHRvIHVzZVxuICogQHJldHVybnMge1Byb21pc2U8RmlsZT59XG4gKi9cbmNvbnN0IGZpbGVGcm9tID0gKHBhdGgsIHR5cGUpID0+IHN0YXQocGF0aCkudGhlbihzdGF0ID0+IGZyb21GaWxlKHN0YXQsIHBhdGgsIHR5cGUpKVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIGZpbGVwYXRoIG9uIHRoZSBkaXNrXG4gKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdIG1pbWV0eXBlIHRvIHVzZVxuICovXG5jb25zdCBmaWxlRnJvbVN5bmMgPSAocGF0aCwgdHlwZSkgPT4gZnJvbUZpbGUoc3RhdFN5bmMocGF0aCksIHBhdGgsIHR5cGUpXG5cbi8vIEB0cy1pZ25vcmVcbmNvbnN0IGZyb21CbG9iID0gKHN0YXQsIHBhdGgsIHR5cGUgPSAnJykgPT4gbmV3IEJsb2IoW25ldyBCbG9iRGF0YUl0ZW0oe1xuICBwYXRoLFxuICBzaXplOiBzdGF0LnNpemUsXG4gIGxhc3RNb2RpZmllZDogc3RhdC5tdGltZU1zLFxuICBzdGFydDogMFxufSldLCB7IHR5cGUgfSlcblxuLy8gQHRzLWlnbm9yZVxuY29uc3QgZnJvbUZpbGUgPSAoc3RhdCwgcGF0aCwgdHlwZSA9ICcnKSA9PiBuZXcgRmlsZShbbmV3IEJsb2JEYXRhSXRlbSh7XG4gIHBhdGgsXG4gIHNpemU6IHN0YXQuc2l6ZSxcbiAgbGFzdE1vZGlmaWVkOiBzdGF0Lm10aW1lTXMsXG4gIHN0YXJ0OiAwXG59KV0sIGJhc2VuYW1lKHBhdGgpLCB7IHR5cGUsIGxhc3RNb2RpZmllZDogc3RhdC5tdGltZU1zIH0pXG5cbi8qKlxuICogVGhpcyBpcyBhIGJsb2IgYmFja2VkIHVwIGJ5IGEgZmlsZSBvbiB0aGUgZGlza1xuICogd2l0aCBtaW5pdW0gcmVxdWlyZW1lbnQuIEl0cyB3cmFwcGVkIGFyb3VuZCBhIEJsb2IgYXMgYSBibG9iUGFydFxuICogc28geW91IGhhdmUgbm8gZGlyZWN0IGFjY2VzcyB0byB0aGlzLlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmNsYXNzIEJsb2JEYXRhSXRlbSB7XG4gICNwYXRoXG4gICNzdGFydFxuXG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XG4gICAgdGhpcy4jcGF0aCA9IG9wdGlvbnMucGF0aFxuICAgIHRoaXMuI3N0YXJ0ID0gb3B0aW9ucy5zdGFydFxuICAgIHRoaXMuc2l6ZSA9IG9wdGlvbnMuc2l6ZVxuICAgIHRoaXMubGFzdE1vZGlmaWVkID0gb3B0aW9ucy5sYXN0TW9kaWZpZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBTbGljaW5nIGFyZ3VtZW50cyBpcyBmaXJzdCB2YWxpZGF0ZWQgYW5kIGZvcm1hdHRlZFxuICAgKiB0byBub3QgYmUgb3V0IG9mIHJhbmdlIGJ5IEJsb2IucHJvdG90eXBlLnNsaWNlXG4gICAqL1xuICBzbGljZSAoc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBuZXcgQmxvYkRhdGFJdGVtKHtcbiAgICAgIHBhdGg6IHRoaXMuI3BhdGgsXG4gICAgICBsYXN0TW9kaWZpZWQ6IHRoaXMubGFzdE1vZGlmaWVkLFxuICAgICAgc2l6ZTogZW5kIC0gc3RhcnQsXG4gICAgICBzdGFydDogdGhpcy4jc3RhcnQgKyBzdGFydFxuICAgIH0pXG4gIH1cblxuICBhc3luYyAqIHN0cmVhbSAoKSB7XG4gICAgY29uc3QgeyBtdGltZU1zIH0gPSBhd2FpdCBzdGF0KHRoaXMuI3BhdGgpXG4gICAgaWYgKG10aW1lTXMgPiB0aGlzLmxhc3RNb2RpZmllZCkge1xuICAgICAgdGhyb3cgbmV3IERPTUV4Y2VwdGlvbignVGhlIHJlcXVlc3RlZCBmaWxlIGNvdWxkIG5vdCBiZSByZWFkLCB0eXBpY2FsbHkgZHVlIHRvIHBlcm1pc3Npb24gcHJvYmxlbXMgdGhhdCBoYXZlIG9jY3VycmVkIGFmdGVyIGEgcmVmZXJlbmNlIHRvIGEgZmlsZSB3YXMgYWNxdWlyZWQuJywgJ05vdFJlYWRhYmxlRXJyb3InKVxuICAgIH1cbiAgICB5aWVsZCAqIGNyZWF0ZVJlYWRTdHJlYW0odGhpcy4jcGF0aCwge1xuICAgICAgc3RhcnQ6IHRoaXMuI3N0YXJ0LFxuICAgICAgZW5kOiB0aGlzLiNzdGFydCArIHRoaXMuc2l6ZSAtIDFcbiAgICB9KVxuICB9XG5cbiAgZ2V0IFtTeW1ib2wudG9TdHJpbmdUYWddICgpIHtcbiAgICByZXR1cm4gJ0Jsb2InXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYmxvYkZyb21TeW5jXG5leHBvcnQgeyBGaWxlLCBCbG9iLCBibG9iRnJvbSwgYmxvYkZyb21TeW5jLCBmaWxlRnJvbSwgZmlsZUZyb21TeW5jIH1cbiIsIi8qISBmZXRjaC1ibG9iLiBNSVQgTGljZW5zZS4gSmltbXkgV8OkcnRpbmcgPGh0dHBzOi8vamltbXkud2FydGluZy5zZS9vcGVuc291cmNlPiAqL1xuXG4vLyBUT0RPIChqaW1teXdhcnRpbmcpOiBpbiB0aGUgZmVhdHVyZSB1c2UgY29uZGl0aW9uYWwgbG9hZGluZyB3aXRoIHRvcCBsZXZlbCBhd2FpdCAocmVxdWlyZXMgMTQueClcbi8vIE5vZGUgaGFzIHJlY2VudGx5IGFkZGVkIHdoYXR3ZyBzdHJlYW0gaW50byBjb3JlXG5cbmltcG9ydCAnLi9zdHJlYW1zLmNqcydcblxuLy8gNjQgS2lCIChzYW1lIHNpemUgY2hyb21lIHNsaWNlIHRoZWlycyBibG9iIGludG8gVWludDhhcnJheSdzKVxuY29uc3QgUE9PTF9TSVpFID0gNjU1MzZcblxuLyoqIEBwYXJhbSB7KEJsb2IgfCBVaW50OEFycmF5KVtdfSBwYXJ0cyAqL1xuYXN5bmMgZnVuY3Rpb24gKiB0b0l0ZXJhdG9yIChwYXJ0cywgY2xvbmUgPSB0cnVlKSB7XG4gIGZvciAoY29uc3QgcGFydCBvZiBwYXJ0cykge1xuICAgIGlmICgnc3RyZWFtJyBpbiBwYXJ0KSB7XG4gICAgICB5aWVsZCAqICgvKiogQHR5cGUge0FzeW5jSXRlcmFibGVJdGVyYXRvcjxVaW50OEFycmF5Pn0gKi8gKHBhcnQuc3RyZWFtKCkpKVxuICAgIH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHBhcnQpKSB7XG4gICAgICBpZiAoY2xvbmUpIHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gcGFydC5ieXRlT2Zmc2V0XG4gICAgICAgIGNvbnN0IGVuZCA9IHBhcnQuYnl0ZU9mZnNldCArIHBhcnQuYnl0ZUxlbmd0aFxuICAgICAgICB3aGlsZSAocG9zaXRpb24gIT09IGVuZCkge1xuICAgICAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1pbihlbmQgLSBwb3NpdGlvbiwgUE9PTF9TSVpFKVxuICAgICAgICAgIGNvbnN0IGNodW5rID0gcGFydC5idWZmZXIuc2xpY2UocG9zaXRpb24sIHBvc2l0aW9uICsgc2l6ZSlcbiAgICAgICAgICBwb3NpdGlvbiArPSBjaHVuay5ieXRlTGVuZ3RoXG4gICAgICAgICAgeWllbGQgbmV3IFVpbnQ4QXJyYXkoY2h1bmspXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHlpZWxkIHBhcnRcbiAgICAgIH1cbiAgICAvKiBjOCBpZ25vcmUgbmV4dCAxMCAqL1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBGb3IgYmxvYnMgdGhhdCBoYXZlIGFycmF5QnVmZmVyIGJ1dCBubyBzdHJlYW0gbWV0aG9kIChub2RlcyBidWZmZXIuQmxvYilcbiAgICAgIGxldCBwb3NpdGlvbiA9IDAsIGIgPSAoLyoqIEB0eXBlIHtCbG9ifSAqLyAocGFydCkpXG4gICAgICB3aGlsZSAocG9zaXRpb24gIT09IGIuc2l6ZSkge1xuICAgICAgICBjb25zdCBjaHVuayA9IGIuc2xpY2UocG9zaXRpb24sIE1hdGgubWluKGIuc2l6ZSwgcG9zaXRpb24gKyBQT09MX1NJWkUpKVxuICAgICAgICBjb25zdCBidWZmZXIgPSBhd2FpdCBjaHVuay5hcnJheUJ1ZmZlcigpXG4gICAgICAgIHBvc2l0aW9uICs9IGJ1ZmZlci5ieXRlTGVuZ3RoXG4gICAgICAgIHlpZWxkIG5ldyBVaW50OEFycmF5KGJ1ZmZlcilcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY29uc3QgX0Jsb2IgPSBjbGFzcyBCbG9iIHtcbiAgLyoqIEB0eXBlIHtBcnJheS48KEJsb2J8VWludDhBcnJheSk+fSAqL1xuICAjcGFydHMgPSBbXVxuICAjdHlwZSA9ICcnXG4gICNzaXplID0gMFxuICAjZW5kaW5ncyA9ICd0cmFuc3BhcmVudCdcblxuICAvKipcbiAgICogVGhlIEJsb2IoKSBjb25zdHJ1Y3RvciByZXR1cm5zIGEgbmV3IEJsb2Igb2JqZWN0LiBUaGUgY29udGVudFxuICAgKiBvZiB0aGUgYmxvYiBjb25zaXN0cyBvZiB0aGUgY29uY2F0ZW5hdGlvbiBvZiB0aGUgdmFsdWVzIGdpdmVuXG4gICAqIGluIHRoZSBwYXJhbWV0ZXIgYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gYmxvYlBhcnRzXG4gICAqIEBwYXJhbSB7eyB0eXBlPzogc3RyaW5nLCBlbmRpbmdzPzogc3RyaW5nIH19IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IgKGJsb2JQYXJ0cyA9IFtdLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAodHlwZW9mIGJsb2JQYXJ0cyAhPT0gJ29iamVjdCcgfHwgYmxvYlBhcnRzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ0Jsb2JcXCc6IFRoZSBwcm92aWRlZCB2YWx1ZSBjYW5ub3QgYmUgY29udmVydGVkIHRvIGEgc2VxdWVuY2UuJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGJsb2JQYXJ0c1tTeW1ib2wuaXRlcmF0b3JdICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ0Jsb2JcXCc6IFRoZSBvYmplY3QgbXVzdCBoYXZlIGEgY2FsbGFibGUgQEBpdGVyYXRvciBwcm9wZXJ0eS4nKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9wdGlvbnMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnQmxvYlxcJzogcGFyYW1ldGVyIDIgY2Fubm90IGNvbnZlcnQgdG8gZGljdGlvbmFyeS4nKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zID09PSBudWxsKSBvcHRpb25zID0ge31cblxuICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBibG9iUGFydHMpIHtcbiAgICAgIGxldCBwYXJ0XG4gICAgICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGVsZW1lbnQpKSB7XG4gICAgICAgIHBhcnQgPSBuZXcgVWludDhBcnJheShlbGVtZW50LmJ1ZmZlci5zbGljZShlbGVtZW50LmJ5dGVPZmZzZXQsIGVsZW1lbnQuYnl0ZU9mZnNldCArIGVsZW1lbnQuYnl0ZUxlbmd0aCkpXG4gICAgICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgICBwYXJ0ID0gbmV3IFVpbnQ4QXJyYXkoZWxlbWVudC5zbGljZSgwKSlcbiAgICAgIH0gZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICAgICAgcGFydCA9IGVsZW1lbnRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnQgPSBlbmNvZGVyLmVuY29kZShgJHtlbGVtZW50fWApXG4gICAgICB9XG5cbiAgICAgIHRoaXMuI3NpemUgKz0gQXJyYXlCdWZmZXIuaXNWaWV3KHBhcnQpID8gcGFydC5ieXRlTGVuZ3RoIDogcGFydC5zaXplXG4gICAgICB0aGlzLiNwYXJ0cy5wdXNoKHBhcnQpXG4gICAgfVxuXG4gICAgdGhpcy4jZW5kaW5ncyA9IGAke29wdGlvbnMuZW5kaW5ncyA9PT0gdW5kZWZpbmVkID8gJ3RyYW5zcGFyZW50JyA6IG9wdGlvbnMuZW5kaW5nc31gXG4gICAgY29uc3QgdHlwZSA9IG9wdGlvbnMudHlwZSA9PT0gdW5kZWZpbmVkID8gJycgOiBTdHJpbmcob3B0aW9ucy50eXBlKVxuICAgIHRoaXMuI3R5cGUgPSAvXltcXHgyMC1cXHg3RV0qJC8udGVzdCh0eXBlKSA/IHR5cGUgOiAnJ1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBCbG9iIGludGVyZmFjZSdzIHNpemUgcHJvcGVydHkgcmV0dXJucyB0aGVcbiAgICogc2l6ZSBvZiB0aGUgQmxvYiBpbiBieXRlcy5cbiAgICovXG4gIGdldCBzaXplICgpIHtcbiAgICByZXR1cm4gdGhpcy4jc2l6ZVxuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0eXBlIHByb3BlcnR5IG9mIGEgQmxvYiBvYmplY3QgcmV0dXJucyB0aGUgTUlNRSB0eXBlIG9mIHRoZSBmaWxlLlxuICAgKi9cbiAgZ2V0IHR5cGUgKCkge1xuICAgIHJldHVybiB0aGlzLiN0eXBlXG4gIH1cblxuICAvKipcbiAgICogVGhlIHRleHQoKSBtZXRob2QgaW4gdGhlIEJsb2IgaW50ZXJmYWNlIHJldHVybnMgYSBQcm9taXNlXG4gICAqIHRoYXQgcmVzb2x2ZXMgd2l0aCBhIHN0cmluZyBjb250YWluaW5nIHRoZSBjb250ZW50cyBvZlxuICAgKiB0aGUgYmxvYiwgaW50ZXJwcmV0ZWQgYXMgVVRGLTguXG4gICAqXG4gICAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIGFzeW5jIHRleHQgKCkge1xuICAgIC8vIE1vcmUgb3B0aW1pemVkIHRoYW4gdXNpbmcgdGhpcy5hcnJheUJ1ZmZlcigpXG4gICAgLy8gdGhhdCByZXF1aXJlcyB0d2ljZSBhcyBtdWNoIHJhbVxuICAgIGNvbnN0IGRlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKVxuICAgIGxldCBzdHIgPSAnJ1xuICAgIGZvciBhd2FpdCAoY29uc3QgcGFydCBvZiB0b0l0ZXJhdG9yKHRoaXMuI3BhcnRzLCBmYWxzZSkpIHtcbiAgICAgIHN0ciArPSBkZWNvZGVyLmRlY29kZShwYXJ0LCB7IHN0cmVhbTogdHJ1ZSB9KVxuICAgIH1cbiAgICAvLyBSZW1haW5pbmdcbiAgICBzdHIgKz0gZGVjb2Rlci5kZWNvZGUoKVxuICAgIHJldHVybiBzdHJcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYXJyYXlCdWZmZXIoKSBtZXRob2QgaW4gdGhlIEJsb2IgaW50ZXJmYWNlIHJldHVybnMgYVxuICAgKiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIGJsb2IgYXNcbiAgICogYmluYXJ5IGRhdGEgY29udGFpbmVkIGluIGFuIEFycmF5QnVmZmVyLlxuICAgKlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPEFycmF5QnVmZmVyPn1cbiAgICovXG4gIGFzeW5jIGFycmF5QnVmZmVyICgpIHtcbiAgICAvLyBFYXNpZXIgd2F5Li4uIEp1c3QgYSB1bm5lY2Vzc2FyeSBvdmVyaGVhZFxuICAgIC8vIGNvbnN0IHZpZXcgPSBuZXcgVWludDhBcnJheSh0aGlzLnNpemUpO1xuICAgIC8vIGF3YWl0IHRoaXMuc3RyZWFtKCkuZ2V0UmVhZGVyKHttb2RlOiAnYnlvYid9KS5yZWFkKHZpZXcpO1xuICAgIC8vIHJldHVybiB2aWV3LmJ1ZmZlcjtcblxuICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheSh0aGlzLnNpemUpXG4gICAgbGV0IG9mZnNldCA9IDBcbiAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHRvSXRlcmF0b3IodGhpcy4jcGFydHMsIGZhbHNlKSkge1xuICAgICAgZGF0YS5zZXQoY2h1bmssIG9mZnNldClcbiAgICAgIG9mZnNldCArPSBjaHVuay5sZW5ndGhcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YS5idWZmZXJcbiAgfVxuXG4gIHN0cmVhbSAoKSB7XG4gICAgY29uc3QgaXQgPSB0b0l0ZXJhdG9yKHRoaXMuI3BhcnRzLCB0cnVlKVxuXG4gICAgcmV0dXJuIG5ldyBnbG9iYWxUaGlzLlJlYWRhYmxlU3RyZWFtKHtcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHR5cGU6ICdieXRlcycsXG4gICAgICBhc3luYyBwdWxsIChjdHJsKSB7XG4gICAgICAgIGNvbnN0IGNodW5rID0gYXdhaXQgaXQubmV4dCgpXG4gICAgICAgIGNodW5rLmRvbmUgPyBjdHJsLmNsb3NlKCkgOiBjdHJsLmVucXVldWUoY2h1bmsudmFsdWUpXG4gICAgICB9LFxuXG4gICAgICBhc3luYyBjYW5jZWwgKCkge1xuICAgICAgICBhd2FpdCBpdC5yZXR1cm4oKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVGhlIEJsb2IgaW50ZXJmYWNlJ3Mgc2xpY2UoKSBtZXRob2QgY3JlYXRlcyBhbmQgcmV0dXJucyBhXG4gICAqIG5ldyBCbG9iIG9iamVjdCB3aGljaCBjb250YWlucyBkYXRhIGZyb20gYSBzdWJzZXQgb2YgdGhlXG4gICAqIGJsb2Igb24gd2hpY2ggaXQncyBjYWxsZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnRdXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdXG4gICAqL1xuICBzbGljZSAoc3RhcnQgPSAwLCBlbmQgPSB0aGlzLnNpemUsIHR5cGUgPSAnJykge1xuICAgIGNvbnN0IHsgc2l6ZSB9ID0gdGhpc1xuXG4gICAgbGV0IHJlbGF0aXZlU3RhcnQgPSBzdGFydCA8IDAgPyBNYXRoLm1heChzaXplICsgc3RhcnQsIDApIDogTWF0aC5taW4oc3RhcnQsIHNpemUpXG4gICAgbGV0IHJlbGF0aXZlRW5kID0gZW5kIDwgMCA/IE1hdGgubWF4KHNpemUgKyBlbmQsIDApIDogTWF0aC5taW4oZW5kLCBzaXplKVxuXG4gICAgY29uc3Qgc3BhbiA9IE1hdGgubWF4KHJlbGF0aXZlRW5kIC0gcmVsYXRpdmVTdGFydCwgMClcbiAgICBjb25zdCBwYXJ0cyA9IHRoaXMuI3BhcnRzXG4gICAgY29uc3QgYmxvYlBhcnRzID0gW11cbiAgICBsZXQgYWRkZWQgPSAwXG5cbiAgICBmb3IgKGNvbnN0IHBhcnQgb2YgcGFydHMpIHtcbiAgICAgIC8vIGRvbid0IGFkZCB0aGUgb3ZlcmZsb3cgdG8gbmV3IGJsb2JQYXJ0c1xuICAgICAgaWYgKGFkZGVkID49IHNwYW4pIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2l6ZSA9IEFycmF5QnVmZmVyLmlzVmlldyhwYXJ0KSA/IHBhcnQuYnl0ZUxlbmd0aCA6IHBhcnQuc2l6ZVxuICAgICAgaWYgKHJlbGF0aXZlU3RhcnQgJiYgc2l6ZSA8PSByZWxhdGl2ZVN0YXJ0KSB7XG4gICAgICAgIC8vIFNraXAgdGhlIGJlZ2lubmluZyBhbmQgY2hhbmdlIHRoZSByZWxhdGl2ZVxuICAgICAgICAvLyBzdGFydCAmIGVuZCBwb3NpdGlvbiBhcyB3ZSBza2lwIHRoZSB1bndhbnRlZCBwYXJ0c1xuICAgICAgICByZWxhdGl2ZVN0YXJ0IC09IHNpemVcbiAgICAgICAgcmVsYXRpdmVFbmQgLT0gc2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGNodW5rXG4gICAgICAgIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcocGFydCkpIHtcbiAgICAgICAgICBjaHVuayA9IHBhcnQuc3ViYXJyYXkocmVsYXRpdmVTdGFydCwgTWF0aC5taW4oc2l6ZSwgcmVsYXRpdmVFbmQpKVxuICAgICAgICAgIGFkZGVkICs9IGNodW5rLmJ5dGVMZW5ndGhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaHVuayA9IHBhcnQuc2xpY2UocmVsYXRpdmVTdGFydCwgTWF0aC5taW4oc2l6ZSwgcmVsYXRpdmVFbmQpKVxuICAgICAgICAgIGFkZGVkICs9IGNodW5rLnNpemVcbiAgICAgICAgfVxuICAgICAgICByZWxhdGl2ZUVuZCAtPSBzaXplXG4gICAgICAgIGJsb2JQYXJ0cy5wdXNoKGNodW5rKVxuICAgICAgICByZWxhdGl2ZVN0YXJ0ID0gMCAvLyBBbGwgbmV4dCBzZXF1ZW50aWFsIHBhcnRzIHNob3VsZCBzdGFydCBhdCAwXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtdLCB7IHR5cGU6IFN0cmluZyh0eXBlKS50b0xvd2VyQ2FzZSgpIH0pXG4gICAgYmxvYi4jc2l6ZSA9IHNwYW5cbiAgICBibG9iLiNwYXJ0cyA9IGJsb2JQYXJ0c1xuXG4gICAgcmV0dXJuIGJsb2JcbiAgfVxuXG4gIGdldCBbU3ltYm9sLnRvU3RyaW5nVGFnXSAoKSB7XG4gICAgcmV0dXJuICdCbG9iJ1xuICB9XG5cbiAgc3RhdGljIFtTeW1ib2wuaGFzSW5zdGFuY2VdIChvYmplY3QpIHtcbiAgICByZXR1cm4gKFxuICAgICAgb2JqZWN0ICYmXG4gICAgICB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgKFxuICAgICAgICB0eXBlb2Ygb2JqZWN0LnN0cmVhbSA9PT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgICB0eXBlb2Ygb2JqZWN0LmFycmF5QnVmZmVyID09PSAnZnVuY3Rpb24nXG4gICAgICApICYmXG4gICAgICAvXihCbG9ifEZpbGUpJC8udGVzdChvYmplY3RbU3ltYm9sLnRvU3RyaW5nVGFnXSlcbiAgICApXG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoX0Jsb2IucHJvdG90eXBlLCB7XG4gIHNpemU6IHsgZW51bWVyYWJsZTogdHJ1ZSB9LFxuICB0eXBlOiB7IGVudW1lcmFibGU6IHRydWUgfSxcbiAgc2xpY2U6IHsgZW51bWVyYWJsZTogdHJ1ZSB9XG59KVxuXG4vKiogQHR5cGUge3R5cGVvZiBnbG9iYWxUaGlzLkJsb2J9ICovXG5leHBvcnQgY29uc3QgQmxvYiA9IF9CbG9iXG5leHBvcnQgZGVmYXVsdCBCbG9iXG4iLCIvKiEgZm9ybWRhdGEtcG9seWZpbGwuIE1JVCBMaWNlbnNlLiBKaW1teSBXw6RydGluZyA8aHR0cHM6Ly9qaW1teS53YXJ0aW5nLnNlL29wZW5zb3VyY2U+ICovXG5cbmltcG9ydCBDIGZyb20gJ2ZldGNoLWJsb2InXG5pbXBvcnQgRiBmcm9tICdmZXRjaC1ibG9iL2ZpbGUuanMnXG5cbnZhciB7dG9TdHJpbmdUYWc6dCxpdGVyYXRvcjppLGhhc0luc3RhbmNlOmh9PVN5bWJvbCxcbnI9TWF0aC5yYW5kb20sXG5tPSdhcHBlbmQsc2V0LGdldCxnZXRBbGwsZGVsZXRlLGtleXMsdmFsdWVzLGVudHJpZXMsZm9yRWFjaCxjb25zdHJ1Y3Rvcicuc3BsaXQoJywnKSxcbmY9KGEsYixjKT0+KGErPScnLC9eKEJsb2J8RmlsZSkkLy50ZXN0KGIgJiYgYlt0XSk/WyhjPWMhPT12b2lkIDA/YysnJzpiW3RdPT0nRmlsZSc/Yi5uYW1lOidibG9iJyxhKSxiLm5hbWUhPT1jfHxiW3RdPT0nYmxvYic/bmV3IEYoW2JdLGMsYik6Yl06W2EsYisnJ10pLFxuZT0oYyxmKT0+KGY/YzpjLnJlcGxhY2UoL1xccj9cXG58XFxyL2csJ1xcclxcbicpKS5yZXBsYWNlKC9cXG4vZywnJTBBJykucmVwbGFjZSgvXFxyL2csJyUwRCcpLnJlcGxhY2UoL1wiL2csJyUyMicpLFxueD0obiwgYSwgZSk9PntpZihhLmxlbmd0aDxlKXt0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gZXhlY3V0ZSAnJHtufScgb24gJ0Zvcm1EYXRhJzogJHtlfSBhcmd1bWVudHMgcmVxdWlyZWQsIGJ1dCBvbmx5ICR7YS5sZW5ndGh9IHByZXNlbnQuYCl9fVxuXG5leHBvcnQgY29uc3QgRmlsZSA9IEZcblxuLyoqIEB0eXBlIHt0eXBlb2YgZ2xvYmFsVGhpcy5Gb3JtRGF0YX0gKi9cbmV4cG9ydCBjb25zdCBGb3JtRGF0YSA9IGNsYXNzIEZvcm1EYXRhIHtcbiNkPVtdO1xuY29uc3RydWN0b3IoLi4uYSl7aWYoYS5sZW5ndGgpdGhyb3cgbmV3IFR5cGVFcnJvcihgRmFpbGVkIHRvIGNvbnN0cnVjdCAnRm9ybURhdGEnOiBwYXJhbWV0ZXIgMSBpcyBub3Qgb2YgdHlwZSAnSFRNTEZvcm1FbGVtZW50Jy5gKX1cbmdldCBbdF0oKSB7cmV0dXJuICdGb3JtRGF0YSd9XG5baV0oKXtyZXR1cm4gdGhpcy5lbnRyaWVzKCl9XG5zdGF0aWMgW2hdKG8pIHtyZXR1cm4gbyYmdHlwZW9mIG89PT0nb2JqZWN0JyYmb1t0XT09PSdGb3JtRGF0YScmJiFtLnNvbWUobT0+dHlwZW9mIG9bbV0hPSdmdW5jdGlvbicpfVxuYXBwZW5kKC4uLmEpe3goJ2FwcGVuZCcsYXJndW1lbnRzLDIpO3RoaXMuI2QucHVzaChmKC4uLmEpKX1cbmRlbGV0ZShhKXt4KCdkZWxldGUnLGFyZ3VtZW50cywxKTthKz0nJzt0aGlzLiNkPXRoaXMuI2QuZmlsdGVyKChbYl0pPT5iIT09YSl9XG5nZXQoYSl7eCgnZ2V0Jyxhcmd1bWVudHMsMSk7YSs9Jyc7Zm9yKHZhciBiPXRoaXMuI2QsbD1iLmxlbmd0aCxjPTA7YzxsO2MrKylpZihiW2NdWzBdPT09YSlyZXR1cm4gYltjXVsxXTtyZXR1cm4gbnVsbH1cbmdldEFsbChhLGIpe3goJ2dldEFsbCcsYXJndW1lbnRzLDEpO2I9W107YSs9Jyc7dGhpcy4jZC5mb3JFYWNoKGM9PmNbMF09PT1hJiZiLnB1c2goY1sxXSkpO3JldHVybiBifVxuaGFzKGEpe3goJ2hhcycsYXJndW1lbnRzLDEpO2ErPScnO3JldHVybiB0aGlzLiNkLnNvbWUoYj0+YlswXT09PWEpfVxuZm9yRWFjaChhLGIpe3goJ2ZvckVhY2gnLGFyZ3VtZW50cywxKTtmb3IodmFyIFtjLGRdb2YgdGhpcylhLmNhbGwoYixkLGMsdGhpcyl9XG5zZXQoLi4uYSl7eCgnc2V0Jyxhcmd1bWVudHMsMik7dmFyIGI9W10sYz0hMDthPWYoLi4uYSk7dGhpcy4jZC5mb3JFYWNoKGQ9PntkWzBdPT09YVswXT9jJiYoYz0hYi5wdXNoKGEpKTpiLnB1c2goZCl9KTtjJiZiLnB1c2goYSk7dGhpcy4jZD1ifVxuKmVudHJpZXMoKXt5aWVsZCp0aGlzLiNkfVxuKmtleXMoKXtmb3IodmFyW2Fdb2YgdGhpcyl5aWVsZCBhfVxuKnZhbHVlcygpe2Zvcih2YXJbLGFdb2YgdGhpcyl5aWVsZCBhfX1cblxuLyoqIEBwYXJhbSB7Rm9ybURhdGF9IEYgKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtRGF0YVRvQmxvYiAoRixCPUMpe1xudmFyIGI9YCR7cigpfSR7cigpfWAucmVwbGFjZSgvXFwuL2csICcnKS5zbGljZSgtMjgpLnBhZFN0YXJ0KDMyLCAnLScpLGM9W10scD1gLS0ke2J9XFxyXFxuQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPVwiYFxuRi5mb3JFYWNoKCh2LG4pPT50eXBlb2Ygdj09J3N0cmluZydcbj9jLnB1c2gocCtlKG4pK2BcIlxcclxcblxcclxcbiR7di5yZXBsYWNlKC9cXHIoPyFcXG4pfCg/PCFcXHIpXFxuL2csICdcXHJcXG4nKX1cXHJcXG5gKVxuOmMucHVzaChwK2UobikrYFwiOyBmaWxlbmFtZT1cIiR7ZSh2Lm5hbWUsIDEpfVwiXFxyXFxuQ29udGVudC1UeXBlOiAke3YudHlwZXx8XCJhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cIn1cXHJcXG5cXHJcXG5gLCB2LCAnXFxyXFxuJykpXG5jLnB1c2goYC0tJHtifS0tYClcbnJldHVybiBuZXcgQihjLHt0eXBlOlwibXVsdGlwYXJ0L2Zvcm0tZGF0YTsgYm91bmRhcnk9XCIrYn0pfVxuIiwiXG4vKipcbiAqIEJvZHkuanNcbiAqXG4gKiBCb2R5IGludGVyZmFjZSBwcm92aWRlcyBjb21tb24gbWV0aG9kcyBmb3IgUmVxdWVzdCBhbmQgUmVzcG9uc2VcbiAqL1xuXG5pbXBvcnQgU3RyZWFtLCB7UGFzc1Rocm91Z2h9IGZyb20gJ25vZGU6c3RyZWFtJztcbmltcG9ydCB7dHlwZXMsIGRlcHJlY2F0ZSwgcHJvbWlzaWZ5fSBmcm9tICdub2RlOnV0aWwnO1xuaW1wb3J0IHtCdWZmZXJ9IGZyb20gJ25vZGU6YnVmZmVyJztcblxuaW1wb3J0IEJsb2IgZnJvbSAnZmV0Y2gtYmxvYic7XG5pbXBvcnQge0Zvcm1EYXRhLCBmb3JtRGF0YVRvQmxvYn0gZnJvbSAnZm9ybWRhdGEtcG9seWZpbGwvZXNtLm1pbi5qcyc7XG5cbmltcG9ydCB7RmV0Y2hFcnJvcn0gZnJvbSAnLi9lcnJvcnMvZmV0Y2gtZXJyb3IuanMnO1xuaW1wb3J0IHtGZXRjaEJhc2VFcnJvcn0gZnJvbSAnLi9lcnJvcnMvYmFzZS5qcyc7XG5pbXBvcnQge2lzQmxvYiwgaXNVUkxTZWFyY2hQYXJhbWV0ZXJzfSBmcm9tICcuL3V0aWxzL2lzLmpzJztcblxuY29uc3QgcGlwZWxpbmUgPSBwcm9taXNpZnkoU3RyZWFtLnBpcGVsaW5lKTtcbmNvbnN0IElOVEVSTkFMUyA9IFN5bWJvbCgnQm9keSBpbnRlcm5hbHMnKTtcblxuLyoqXG4gKiBCb2R5IG1peGluXG4gKlxuICogUmVmOiBodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jYm9keVxuICpcbiAqIEBwYXJhbSAgIFN0cmVhbSAgYm9keSAgUmVhZGFibGUgc3RyZWFtXG4gKiBAcGFyYW0gICBPYmplY3QgIG9wdHMgIFJlc3BvbnNlIG9wdGlvbnNcbiAqIEByZXR1cm4gIFZvaWRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQm9keSB7XG5cdGNvbnN0cnVjdG9yKGJvZHksIHtcblx0XHRzaXplID0gMFxuXHR9ID0ge30pIHtcblx0XHRsZXQgYm91bmRhcnkgPSBudWxsO1xuXG5cdFx0aWYgKGJvZHkgPT09IG51bGwpIHtcblx0XHRcdC8vIEJvZHkgaXMgdW5kZWZpbmVkIG9yIG51bGxcblx0XHRcdGJvZHkgPSBudWxsO1xuXHRcdH0gZWxzZSBpZiAoaXNVUkxTZWFyY2hQYXJhbWV0ZXJzKGJvZHkpKSB7XG5cdFx0XHQvLyBCb2R5IGlzIGEgVVJMU2VhcmNoUGFyYW1zXG5cdFx0XHRib2R5ID0gQnVmZmVyLmZyb20oYm9keS50b1N0cmluZygpKTtcblx0XHR9IGVsc2UgaWYgKGlzQmxvYihib2R5KSkge1xuXHRcdFx0Ly8gQm9keSBpcyBibG9iXG5cdFx0fSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIHtcblx0XHRcdC8vIEJvZHkgaXMgQnVmZmVyXG5cdFx0fSBlbHNlIGlmICh0eXBlcy5pc0FueUFycmF5QnVmZmVyKGJvZHkpKSB7XG5cdFx0XHQvLyBCb2R5IGlzIEFycmF5QnVmZmVyXG5cdFx0XHRib2R5ID0gQnVmZmVyLmZyb20oYm9keSk7XG5cdFx0fSBlbHNlIGlmIChBcnJheUJ1ZmZlci5pc1ZpZXcoYm9keSkpIHtcblx0XHRcdC8vIEJvZHkgaXMgQXJyYXlCdWZmZXJWaWV3XG5cdFx0XHRib2R5ID0gQnVmZmVyLmZyb20oYm9keS5idWZmZXIsIGJvZHkuYnl0ZU9mZnNldCwgYm9keS5ieXRlTGVuZ3RoKTtcblx0XHR9IGVsc2UgaWYgKGJvZHkgaW5zdGFuY2VvZiBTdHJlYW0pIHtcblx0XHRcdC8vIEJvZHkgaXMgc3RyZWFtXG5cdFx0fSBlbHNlIGlmIChib2R5IGluc3RhbmNlb2YgRm9ybURhdGEpIHtcblx0XHRcdC8vIEJvZHkgaXMgRm9ybURhdGFcblx0XHRcdGJvZHkgPSBmb3JtRGF0YVRvQmxvYihib2R5KTtcblx0XHRcdGJvdW5kYXJ5ID0gYm9keS50eXBlLnNwbGl0KCc9JylbMV07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE5vbmUgb2YgdGhlIGFib3ZlXG5cdFx0XHQvLyBjb2VyY2UgdG8gc3RyaW5nIHRoZW4gYnVmZmVyXG5cdFx0XHRib2R5ID0gQnVmZmVyLmZyb20oU3RyaW5nKGJvZHkpKTtcblx0XHR9XG5cblx0XHRsZXQgc3RyZWFtID0gYm9keTtcblxuXHRcdGlmIChCdWZmZXIuaXNCdWZmZXIoYm9keSkpIHtcblx0XHRcdHN0cmVhbSA9IFN0cmVhbS5SZWFkYWJsZS5mcm9tKGJvZHkpO1xuXHRcdH0gZWxzZSBpZiAoaXNCbG9iKGJvZHkpKSB7XG5cdFx0XHRzdHJlYW0gPSBTdHJlYW0uUmVhZGFibGUuZnJvbShib2R5LnN0cmVhbSgpKTtcblx0XHR9XG5cblx0XHR0aGlzW0lOVEVSTkFMU10gPSB7XG5cdFx0XHRib2R5LFxuXHRcdFx0c3RyZWFtLFxuXHRcdFx0Ym91bmRhcnksXG5cdFx0XHRkaXN0dXJiZWQ6IGZhbHNlLFxuXHRcdFx0ZXJyb3I6IG51bGxcblx0XHR9O1xuXHRcdHRoaXMuc2l6ZSA9IHNpemU7XG5cblx0XHRpZiAoYm9keSBpbnN0YW5jZW9mIFN0cmVhbSkge1xuXHRcdFx0Ym9keS5vbignZXJyb3InLCBlcnJvcl8gPT4ge1xuXHRcdFx0XHRjb25zdCBlcnJvciA9IGVycm9yXyBpbnN0YW5jZW9mIEZldGNoQmFzZUVycm9yID9cblx0XHRcdFx0XHRlcnJvcl8gOlxuXHRcdFx0XHRcdG5ldyBGZXRjaEVycm9yKGBJbnZhbGlkIHJlc3BvbnNlIGJvZHkgd2hpbGUgdHJ5aW5nIHRvIGZldGNoICR7dGhpcy51cmx9OiAke2Vycm9yXy5tZXNzYWdlfWAsICdzeXN0ZW0nLCBlcnJvcl8pO1xuXHRcdFx0XHR0aGlzW0lOVEVSTkFMU10uZXJyb3IgPSBlcnJvcjtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGdldCBib2R5KCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uc3RyZWFtO1xuXHR9XG5cblx0Z2V0IGJvZHlVc2VkKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uZGlzdHVyYmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlY29kZSByZXNwb25zZSBhcyBBcnJheUJ1ZmZlclxuXHQgKlxuXHQgKiBAcmV0dXJuICBQcm9taXNlXG5cdCAqL1xuXHRhc3luYyBhcnJheUJ1ZmZlcigpIHtcblx0XHRjb25zdCB7YnVmZmVyLCBieXRlT2Zmc2V0LCBieXRlTGVuZ3RofSA9IGF3YWl0IGNvbnN1bWVCb2R5KHRoaXMpO1xuXHRcdHJldHVybiBidWZmZXIuc2xpY2UoYnl0ZU9mZnNldCwgYnl0ZU9mZnNldCArIGJ5dGVMZW5ndGgpO1xuXHR9XG5cblx0YXN5bmMgZm9ybURhdGEoKSB7XG5cdFx0Y29uc3QgY3QgPSB0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKTtcblxuXHRcdGlmIChjdC5zdGFydHNXaXRoKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKSkge1xuXHRcdFx0Y29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblx0XHRcdGNvbnN0IHBhcmFtZXRlcnMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGF3YWl0IHRoaXMudGV4dCgpKTtcblxuXHRcdFx0Zm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIHBhcmFtZXRlcnMpIHtcblx0XHRcdFx0Zm9ybURhdGEuYXBwZW5kKG5hbWUsIHZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZvcm1EYXRhO1xuXHRcdH1cblxuXHRcdGNvbnN0IHt0b0Zvcm1EYXRhfSA9IGF3YWl0IGltcG9ydCgnLi91dGlscy9tdWx0aXBhcnQtcGFyc2VyLmpzJyk7XG5cdFx0cmV0dXJuIHRvRm9ybURhdGEodGhpcy5ib2R5LCBjdCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJuIHJhdyByZXNwb25zZSBhcyBCbG9iXG5cdCAqXG5cdCAqIEByZXR1cm4gUHJvbWlzZVxuXHQgKi9cblx0YXN5bmMgYmxvYigpIHtcblx0XHRjb25zdCBjdCA9ICh0aGlzLmhlYWRlcnMgJiYgdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHx8ICh0aGlzW0lOVEVSTkFMU10uYm9keSAmJiB0aGlzW0lOVEVSTkFMU10uYm9keS50eXBlKSB8fCAnJztcblx0XHRjb25zdCBidWYgPSBhd2FpdCB0aGlzLmFycmF5QnVmZmVyKCk7XG5cblx0XHRyZXR1cm4gbmV3IEJsb2IoW2J1Zl0sIHtcblx0XHRcdHR5cGU6IGN0XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVjb2RlIHJlc3BvbnNlIGFzIGpzb25cblx0ICpcblx0ICogQHJldHVybiAgUHJvbWlzZVxuXHQgKi9cblx0YXN5bmMganNvbigpIHtcblx0XHRjb25zdCB0ZXh0ID0gYXdhaXQgdGhpcy50ZXh0KCk7XG5cdFx0cmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVjb2RlIHJlc3BvbnNlIGFzIHRleHRcblx0ICpcblx0ICogQHJldHVybiAgUHJvbWlzZVxuXHQgKi9cblx0YXN5bmMgdGV4dCgpIHtcblx0XHRjb25zdCBidWZmZXIgPSBhd2FpdCBjb25zdW1lQm9keSh0aGlzKTtcblx0XHRyZXR1cm4gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJ1ZmZlcik7XG5cdH1cblxuXHQvKipcblx0ICogRGVjb2RlIHJlc3BvbnNlIGFzIGJ1ZmZlciAobm9uLXNwZWMgYXBpKVxuXHQgKlxuXHQgKiBAcmV0dXJuICBQcm9taXNlXG5cdCAqL1xuXHRidWZmZXIoKSB7XG5cdFx0cmV0dXJuIGNvbnN1bWVCb2R5KHRoaXMpO1xuXHR9XG59XG5cbkJvZHkucHJvdG90eXBlLmJ1ZmZlciA9IGRlcHJlY2F0ZShCb2R5LnByb3RvdHlwZS5idWZmZXIsICdQbGVhc2UgdXNlIFxcJ3Jlc3BvbnNlLmFycmF5QnVmZmVyKClcXCcgaW5zdGVhZCBvZiBcXCdyZXNwb25zZS5idWZmZXIoKVxcJycsICdub2RlLWZldGNoI2J1ZmZlcicpO1xuXG4vLyBJbiBicm93c2VycywgYWxsIHByb3BlcnRpZXMgYXJlIGVudW1lcmFibGUuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhCb2R5LnByb3RvdHlwZSwge1xuXHRib2R5OiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdGJvZHlVc2VkOiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdGFycmF5QnVmZmVyOiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdGJsb2I6IHtlbnVtZXJhYmxlOiB0cnVlfSxcblx0anNvbjoge2VudW1lcmFibGU6IHRydWV9LFxuXHR0ZXh0OiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdGRhdGE6IHtnZXQ6IGRlcHJlY2F0ZSgoKSA9PiB7fSxcblx0XHQnZGF0YSBkb2VzblxcJ3QgZXhpc3QsIHVzZSBqc29uKCksIHRleHQoKSwgYXJyYXlCdWZmZXIoKSwgb3IgYm9keSBpbnN0ZWFkJyxcblx0XHQnaHR0cHM6Ly9naXRodWIuY29tL25vZGUtZmV0Y2gvbm9kZS1mZXRjaC9pc3N1ZXMvMTAwMCAocmVzcG9uc2UpJyl9XG59KTtcblxuLyoqXG4gKiBDb25zdW1lIGFuZCBjb252ZXJ0IGFuIGVudGlyZSBCb2R5IHRvIGEgQnVmZmVyLlxuICpcbiAqIFJlZjogaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI2NvbmNlcHQtYm9keS1jb25zdW1lLWJvZHlcbiAqXG4gKiBAcmV0dXJuIFByb21pc2VcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY29uc3VtZUJvZHkoZGF0YSkge1xuXHRpZiAoZGF0YVtJTlRFUk5BTFNdLmRpc3R1cmJlZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYGJvZHkgdXNlZCBhbHJlYWR5IGZvcjogJHtkYXRhLnVybH1gKTtcblx0fVxuXG5cdGRhdGFbSU5URVJOQUxTXS5kaXN0dXJiZWQgPSB0cnVlO1xuXG5cdGlmIChkYXRhW0lOVEVSTkFMU10uZXJyb3IpIHtcblx0XHR0aHJvdyBkYXRhW0lOVEVSTkFMU10uZXJyb3I7XG5cdH1cblxuXHRjb25zdCB7Ym9keX0gPSBkYXRhO1xuXG5cdC8vIEJvZHkgaXMgbnVsbFxuXHRpZiAoYm9keSA9PT0gbnVsbCkge1xuXHRcdHJldHVybiBCdWZmZXIuYWxsb2MoMCk7XG5cdH1cblxuXHQvKiBjOCBpZ25vcmUgbmV4dCAzICovXG5cdGlmICghKGJvZHkgaW5zdGFuY2VvZiBTdHJlYW0pKSB7XG5cdFx0cmV0dXJuIEJ1ZmZlci5hbGxvYygwKTtcblx0fVxuXG5cdC8vIEJvZHkgaXMgc3RyZWFtXG5cdC8vIGdldCByZWFkeSB0byBhY3R1YWxseSBjb25zdW1lIHRoZSBib2R5XG5cdGNvbnN0IGFjY3VtID0gW107XG5cdGxldCBhY2N1bUJ5dGVzID0gMDtcblxuXHR0cnkge1xuXHRcdGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2YgYm9keSkge1xuXHRcdFx0aWYgKGRhdGEuc2l6ZSA+IDAgJiYgYWNjdW1CeXRlcyArIGNodW5rLmxlbmd0aCA+IGRhdGEuc2l6ZSkge1xuXHRcdFx0XHRjb25zdCBlcnJvciA9IG5ldyBGZXRjaEVycm9yKGBjb250ZW50IHNpemUgYXQgJHtkYXRhLnVybH0gb3ZlciBsaW1pdDogJHtkYXRhLnNpemV9YCwgJ21heC1zaXplJyk7XG5cdFx0XHRcdGJvZHkuZGVzdHJveShlcnJvcik7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXG5cdFx0XHRhY2N1bUJ5dGVzICs9IGNodW5rLmxlbmd0aDtcblx0XHRcdGFjY3VtLnB1c2goY2h1bmspO1xuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRjb25zdCBlcnJvcl8gPSBlcnJvciBpbnN0YW5jZW9mIEZldGNoQmFzZUVycm9yID8gZXJyb3IgOiBuZXcgRmV0Y2hFcnJvcihgSW52YWxpZCByZXNwb25zZSBib2R5IHdoaWxlIHRyeWluZyB0byBmZXRjaCAke2RhdGEudXJsfTogJHtlcnJvci5tZXNzYWdlfWAsICdzeXN0ZW0nLCBlcnJvcik7XG5cdFx0dGhyb3cgZXJyb3JfO1xuXHR9XG5cblx0aWYgKGJvZHkucmVhZGFibGVFbmRlZCA9PT0gdHJ1ZSB8fCBib2R5Ll9yZWFkYWJsZVN0YXRlLmVuZGVkID09PSB0cnVlKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmIChhY2N1bS5ldmVyeShjID0+IHR5cGVvZiBjID09PSAnc3RyaW5nJykpIHtcblx0XHRcdFx0cmV0dXJuIEJ1ZmZlci5mcm9tKGFjY3VtLmpvaW4oJycpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIEJ1ZmZlci5jb25jYXQoYWNjdW0sIGFjY3VtQnl0ZXMpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRmV0Y2hFcnJvcihgQ291bGQgbm90IGNyZWF0ZSBCdWZmZXIgZnJvbSByZXNwb25zZSBib2R5IGZvciAke2RhdGEudXJsfTogJHtlcnJvci5tZXNzYWdlfWAsICdzeXN0ZW0nLCBlcnJvcik7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBGZXRjaEVycm9yKGBQcmVtYXR1cmUgY2xvc2Ugb2Ygc2VydmVyIHJlc3BvbnNlIHdoaWxlIHRyeWluZyB0byBmZXRjaCAke2RhdGEudXJsfWApO1xuXHR9XG59XG5cbi8qKlxuICogQ2xvbmUgYm9keSBnaXZlbiBSZXMvUmVxIGluc3RhbmNlXG4gKlxuICogQHBhcmFtICAgTWl4ZWQgICBpbnN0YW5jZSAgICAgICBSZXNwb25zZSBvciBSZXF1ZXN0IGluc3RhbmNlXG4gKiBAcGFyYW0gICBTdHJpbmcgIGhpZ2hXYXRlck1hcmsgIGhpZ2hXYXRlck1hcmsgZm9yIGJvdGggUGFzc1Rocm91Z2ggYm9keSBzdHJlYW1zXG4gKiBAcmV0dXJuICBNaXhlZFxuICovXG5leHBvcnQgY29uc3QgY2xvbmUgPSAoaW5zdGFuY2UsIGhpZ2hXYXRlck1hcmspID0+IHtcblx0bGV0IHAxO1xuXHRsZXQgcDI7XG5cdGxldCB7Ym9keX0gPSBpbnN0YW5jZVtJTlRFUk5BTFNdO1xuXG5cdC8vIERvbid0IGFsbG93IGNsb25pbmcgYSB1c2VkIGJvZHlcblx0aWYgKGluc3RhbmNlLmJvZHlVc2VkKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgY2xvbmUgYm9keSBhZnRlciBpdCBpcyB1c2VkJyk7XG5cdH1cblxuXHQvLyBDaGVjayB0aGF0IGJvZHkgaXMgYSBzdHJlYW0gYW5kIG5vdCBmb3JtLWRhdGEgb2JqZWN0XG5cdC8vIG5vdGU6IHdlIGNhbid0IGNsb25lIHRoZSBmb3JtLWRhdGEgb2JqZWN0IHdpdGhvdXQgaGF2aW5nIGl0IGFzIGEgZGVwZW5kZW5jeVxuXHRpZiAoKGJvZHkgaW5zdGFuY2VvZiBTdHJlYW0pICYmICh0eXBlb2YgYm9keS5nZXRCb3VuZGFyeSAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHQvLyBUZWUgaW5zdGFuY2UgYm9keVxuXHRcdHAxID0gbmV3IFBhc3NUaHJvdWdoKHtoaWdoV2F0ZXJNYXJrfSk7XG5cdFx0cDIgPSBuZXcgUGFzc1Rocm91Z2goe2hpZ2hXYXRlck1hcmt9KTtcblx0XHRib2R5LnBpcGUocDEpO1xuXHRcdGJvZHkucGlwZShwMik7XG5cdFx0Ly8gU2V0IGluc3RhbmNlIGJvZHkgdG8gdGVlZCBib2R5IGFuZCByZXR1cm4gdGhlIG90aGVyIHRlZWQgYm9keVxuXHRcdGluc3RhbmNlW0lOVEVSTkFMU10uc3RyZWFtID0gcDE7XG5cdFx0Ym9keSA9IHAyO1xuXHR9XG5cblx0cmV0dXJuIGJvZHk7XG59O1xuXG5jb25zdCBnZXROb25TcGVjRm9ybURhdGFCb3VuZGFyeSA9IGRlcHJlY2F0ZShcblx0Ym9keSA9PiBib2R5LmdldEJvdW5kYXJ5KCksXG5cdCdmb3JtLWRhdGEgZG9lc25cXCd0IGZvbGxvdyB0aGUgc3BlYyBhbmQgcmVxdWlyZXMgc3BlY2lhbCB0cmVhdG1lbnQuIFVzZSBhbHRlcm5hdGl2ZSBwYWNrYWdlJyxcblx0J2h0dHBzOi8vZ2l0aHViLmNvbS9ub2RlLWZldGNoL25vZGUtZmV0Y2gvaXNzdWVzLzExNjcnXG4pO1xuXG4vKipcbiAqIFBlcmZvcm1zIHRoZSBvcGVyYXRpb24gXCJleHRyYWN0IGEgYENvbnRlbnQtVHlwZWAgdmFsdWUgZnJvbSB8b2JqZWN0fFwiIGFzXG4gKiBzcGVjaWZpZWQgaW4gdGhlIHNwZWNpZmljYXRpb246XG4gKiBodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jY29uY2VwdC1ib2R5aW5pdC1leHRyYWN0XG4gKlxuICogVGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgaW5zdGFuY2UuYm9keSBpcyBwcmVzZW50LlxuICpcbiAqIEBwYXJhbSB7YW55fSBib2R5IEFueSBvcHRpb25zLmJvZHkgaW5wdXRcbiAqIEByZXR1cm5zIHtzdHJpbmcgfCBudWxsfVxuICovXG5leHBvcnQgY29uc3QgZXh0cmFjdENvbnRlbnRUeXBlID0gKGJvZHksIHJlcXVlc3QpID0+IHtcblx0Ly8gQm9keSBpcyBudWxsIG9yIHVuZGVmaW5lZFxuXHRpZiAoYm9keSA9PT0gbnVsbCkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gQm9keSBpcyBzdHJpbmdcblx0aWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Jztcblx0fVxuXG5cdC8vIEJvZHkgaXMgYSBVUkxTZWFyY2hQYXJhbXNcblx0aWYgKGlzVVJMU2VhcmNoUGFyYW1ldGVycyhib2R5KSkge1xuXHRcdHJldHVybiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnO1xuXHR9XG5cblx0Ly8gQm9keSBpcyBibG9iXG5cdGlmIChpc0Jsb2IoYm9keSkpIHtcblx0XHRyZXR1cm4gYm9keS50eXBlIHx8IG51bGw7XG5cdH1cblxuXHQvLyBCb2R5IGlzIGEgQnVmZmVyIChCdWZmZXIsIEFycmF5QnVmZmVyIG9yIEFycmF5QnVmZmVyVmlldylcblx0aWYgKEJ1ZmZlci5pc0J1ZmZlcihib2R5KSB8fCB0eXBlcy5pc0FueUFycmF5QnVmZmVyKGJvZHkpIHx8IEFycmF5QnVmZmVyLmlzVmlldyhib2R5KSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0aWYgKGJvZHkgaW5zdGFuY2VvZiBGb3JtRGF0YSkge1xuXHRcdHJldHVybiBgbXVsdGlwYXJ0L2Zvcm0tZGF0YTsgYm91bmRhcnk9JHtyZXF1ZXN0W0lOVEVSTkFMU10uYm91bmRhcnl9YDtcblx0fVxuXG5cdC8vIERldGVjdCBmb3JtIGRhdGEgaW5wdXQgZnJvbSBmb3JtLWRhdGEgbW9kdWxlXG5cdGlmIChib2R5ICYmIHR5cGVvZiBib2R5LmdldEJvdW5kYXJ5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIGBtdWx0aXBhcnQvZm9ybS1kYXRhO2JvdW5kYXJ5PSR7Z2V0Tm9uU3BlY0Zvcm1EYXRhQm91bmRhcnkoYm9keSl9YDtcblx0fVxuXG5cdC8vIEJvZHkgaXMgc3RyZWFtIC0gY2FuJ3QgcmVhbGx5IGRvIG11Y2ggYWJvdXQgdGhpc1xuXHRpZiAoYm9keSBpbnN0YW5jZW9mIFN0cmVhbSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gQm9keSBjb25zdHJ1Y3RvciBkZWZhdWx0cyBvdGhlciB0aGluZ3MgdG8gc3RyaW5nXG5cdHJldHVybiAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04Jztcbn07XG5cbi8qKlxuICogVGhlIEZldGNoIFN0YW5kYXJkIHRyZWF0cyB0aGlzIGFzIGlmIFwidG90YWwgYnl0ZXNcIiBpcyBhIHByb3BlcnR5IG9uIHRoZSBib2R5LlxuICogRm9yIHVzLCB3ZSBoYXZlIHRvIGV4cGxpY2l0bHkgZ2V0IGl0IHdpdGggYSBmdW5jdGlvbi5cbiAqXG4gKiByZWY6IGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNjb25jZXB0LWJvZHktdG90YWwtYnl0ZXNcbiAqXG4gKiBAcGFyYW0ge2FueX0gb2JqLmJvZHkgQm9keSBvYmplY3QgZnJvbSB0aGUgQm9keSBpbnN0YW5jZS5cbiAqIEByZXR1cm5zIHtudW1iZXIgfCBudWxsfVxuICovXG5leHBvcnQgY29uc3QgZ2V0VG90YWxCeXRlcyA9IHJlcXVlc3QgPT4ge1xuXHRjb25zdCB7Ym9keX0gPSByZXF1ZXN0W0lOVEVSTkFMU107XG5cblx0Ly8gQm9keSBpcyBudWxsIG9yIHVuZGVmaW5lZFxuXHRpZiAoYm9keSA9PT0gbnVsbCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cblx0Ly8gQm9keSBpcyBCbG9iXG5cdGlmIChpc0Jsb2IoYm9keSkpIHtcblx0XHRyZXR1cm4gYm9keS5zaXplO1xuXHR9XG5cblx0Ly8gQm9keSBpcyBCdWZmZXJcblx0aWYgKEJ1ZmZlci5pc0J1ZmZlcihib2R5KSkge1xuXHRcdHJldHVybiBib2R5Lmxlbmd0aDtcblx0fVxuXG5cdC8vIERldGVjdCBmb3JtIGRhdGEgaW5wdXQgZnJvbSBmb3JtLWRhdGEgbW9kdWxlXG5cdGlmIChib2R5ICYmIHR5cGVvZiBib2R5LmdldExlbmd0aFN5bmMgPT09ICdmdW5jdGlvbicpIHtcblx0XHRyZXR1cm4gYm9keS5oYXNLbm93bkxlbmd0aCAmJiBib2R5Lmhhc0tub3duTGVuZ3RoKCkgPyBib2R5LmdldExlbmd0aFN5bmMoKSA6IG51bGw7XG5cdH1cblxuXHQvLyBCb2R5IGlzIHN0cmVhbVxuXHRyZXR1cm4gbnVsbDtcbn07XG5cbi8qKlxuICogV3JpdGUgYSBCb2R5IHRvIGEgTm9kZS5qcyBXcml0YWJsZVN0cmVhbSAoZS5nLiBodHRwLlJlcXVlc3QpIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmVhbS5Xcml0YWJsZX0gZGVzdCBUaGUgc3RyZWFtIHRvIHdyaXRlIHRvLlxuICogQHBhcmFtIG9iai5ib2R5IEJvZHkgb2JqZWN0IGZyb20gdGhlIEJvZHkgaW5zdGFuY2UuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn1cbiAqL1xuZXhwb3J0IGNvbnN0IHdyaXRlVG9TdHJlYW0gPSBhc3luYyAoZGVzdCwge2JvZHl9KSA9PiB7XG5cdGlmIChib2R5ID09PSBudWxsKSB7XG5cdFx0Ly8gQm9keSBpcyBudWxsXG5cdFx0ZGVzdC5lbmQoKTtcblx0fSBlbHNlIHtcblx0XHQvLyBCb2R5IGlzIHN0cmVhbVxuXHRcdGF3YWl0IHBpcGVsaW5lKGJvZHksIGRlc3QpO1xuXHR9XG59O1xuIiwiaW1wb3J0IHtGZXRjaEJhc2VFcnJvcn0gZnJvbSAnLi9iYXNlLmpzJztcblxuLyoqXG4gKiBBYm9ydEVycm9yIGludGVyZmFjZSBmb3IgY2FuY2VsbGVkIHJlcXVlc3RzXG4gKi9cbmV4cG9ydCBjbGFzcyBBYm9ydEVycm9yIGV4dGVuZHMgRmV0Y2hCYXNlRXJyb3Ige1xuXHRjb25zdHJ1Y3RvcihtZXNzYWdlLCB0eXBlID0gJ2Fib3J0ZWQnKSB7XG5cdFx0c3VwZXIobWVzc2FnZSwgdHlwZSk7XG5cdH1cbn1cbiIsImV4cG9ydCBjbGFzcyBGZXRjaEJhc2VFcnJvciBleHRlbmRzIEVycm9yIHtcblx0Y29uc3RydWN0b3IobWVzc2FnZSwgdHlwZSkge1xuXHRcdHN1cGVyKG1lc3NhZ2UpO1xuXHRcdC8vIEhpZGUgY3VzdG9tIGVycm9yIGltcGxlbWVudGF0aW9uIGRldGFpbHMgZnJvbSBlbmQtdXNlcnNcblx0XHRFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCB0aGlzLmNvbnN0cnVjdG9yKTtcblxuXHRcdHRoaXMudHlwZSA9IHR5cGU7XG5cdH1cblxuXHRnZXQgbmFtZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuXHR9XG5cblx0Z2V0IFtTeW1ib2wudG9TdHJpbmdUYWddKCkge1xuXHRcdHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG5cdH1cbn1cbiIsIlxuaW1wb3J0IHtGZXRjaEJhc2VFcnJvcn0gZnJvbSAnLi9iYXNlLmpzJztcblxuLyoqXG4gKiBAdHlwZWRlZiB7eyBhZGRyZXNzPzogc3RyaW5nLCBjb2RlOiBzdHJpbmcsIGRlc3Q/OiBzdHJpbmcsIGVycm5vOiBudW1iZXIsIGluZm8/OiBvYmplY3QsIG1lc3NhZ2U6IHN0cmluZywgcGF0aD86IHN0cmluZywgcG9ydD86IG51bWJlciwgc3lzY2FsbDogc3RyaW5nfX0gU3lzdGVtRXJyb3JcbiovXG5cbi8qKlxuICogRmV0Y2hFcnJvciBpbnRlcmZhY2UgZm9yIG9wZXJhdGlvbmFsIGVycm9yc1xuICovXG5leHBvcnQgY2xhc3MgRmV0Y2hFcnJvciBleHRlbmRzIEZldGNoQmFzZUVycm9yIHtcblx0LyoqXG5cdCAqIEBwYXJhbSAge3N0cmluZ30gbWVzc2FnZSAtICAgICAgRXJyb3IgbWVzc2FnZSBmb3IgaHVtYW5cblx0ICogQHBhcmFtICB7c3RyaW5nfSBbdHlwZV0gLSAgICAgICAgRXJyb3IgdHlwZSBmb3IgbWFjaGluZVxuXHQgKiBAcGFyYW0gIHtTeXN0ZW1FcnJvcn0gW3N5c3RlbUVycm9yXSAtIEZvciBOb2RlLmpzIHN5c3RlbSBlcnJvclxuXHQgKi9cblx0Y29uc3RydWN0b3IobWVzc2FnZSwgdHlwZSwgc3lzdGVtRXJyb3IpIHtcblx0XHRzdXBlcihtZXNzYWdlLCB0eXBlKTtcblx0XHQvLyBXaGVuIGVyci50eXBlIGlzIGBzeXN0ZW1gLCBlcnIuZXJyb3JlZFN5c0NhbGwgY29udGFpbnMgc3lzdGVtIGVycm9yIGFuZCBlcnIuY29kZSBjb250YWlucyBzeXN0ZW0gZXJyb3IgY29kZVxuXHRcdGlmIChzeXN0ZW1FcnJvcikge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW11bHRpLWFzc2lnblxuXHRcdFx0dGhpcy5jb2RlID0gdGhpcy5lcnJubyA9IHN5c3RlbUVycm9yLmNvZGU7XG5cdFx0XHR0aGlzLmVycm9yZWRTeXNDYWxsID0gc3lzdGVtRXJyb3Iuc3lzY2FsbDtcblx0XHR9XG5cdH1cbn1cbiIsIi8qKlxuICogSGVhZGVycy5qc1xuICpcbiAqIEhlYWRlcnMgY2xhc3Mgb2ZmZXJzIGNvbnZlbmllbnQgaGVscGVyc1xuICovXG5cbmltcG9ydCB7dHlwZXN9IGZyb20gJ25vZGU6dXRpbCc7XG5pbXBvcnQgaHR0cCBmcm9tICdub2RlOmh0dHAnO1xuXG4vKiBjOCBpZ25vcmUgbmV4dCA5ICovXG5jb25zdCB2YWxpZGF0ZUhlYWRlck5hbWUgPSB0eXBlb2YgaHR0cC52YWxpZGF0ZUhlYWRlck5hbWUgPT09ICdmdW5jdGlvbicgP1xuXHRodHRwLnZhbGlkYXRlSGVhZGVyTmFtZSA6XG5cdG5hbWUgPT4ge1xuXHRcdGlmICghL15bXFxeYFxcLVxcdyEjJCUmJyorLnx+XSskLy50ZXN0KG5hbWUpKSB7XG5cdFx0XHRjb25zdCBlcnJvciA9IG5ldyBUeXBlRXJyb3IoYEhlYWRlciBuYW1lIG11c3QgYmUgYSB2YWxpZCBIVFRQIHRva2VuIFske25hbWV9XWApO1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVycm9yLCAnY29kZScsIHt2YWx1ZTogJ0VSUl9JTlZBTElEX0hUVFBfVE9LRU4nfSk7XG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHR9XG5cdH07XG5cbi8qIGM4IGlnbm9yZSBuZXh0IDkgKi9cbmNvbnN0IHZhbGlkYXRlSGVhZGVyVmFsdWUgPSB0eXBlb2YgaHR0cC52YWxpZGF0ZUhlYWRlclZhbHVlID09PSAnZnVuY3Rpb24nID9cblx0aHR0cC52YWxpZGF0ZUhlYWRlclZhbHVlIDpcblx0KG5hbWUsIHZhbHVlKSA9PiB7XG5cdFx0aWYgKC9bXlxcdFxcdTAwMjAtXFx1MDA3RVxcdTAwODAtXFx1MDBGRl0vLnRlc3QodmFsdWUpKSB7XG5cdFx0XHRjb25zdCBlcnJvciA9IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBjb250ZW50IFtcIiR7bmFtZX1cIl1gKTtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlcnJvciwgJ2NvZGUnLCB7dmFsdWU6ICdFUlJfSU5WQUxJRF9DSEFSJ30pO1xuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fVxuXHR9O1xuXG4vKipcbiAqIEB0eXBlZGVmIHtIZWFkZXJzIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IEl0ZXJhYmxlPHJlYWRvbmx5IFtzdHJpbmcsIHN0cmluZ10+IHwgSXRlcmFibGU8SXRlcmFibGU8c3RyaW5nPj59IEhlYWRlcnNJbml0XG4gKi9cblxuLyoqXG4gKiBUaGlzIEZldGNoIEFQSSBpbnRlcmZhY2UgYWxsb3dzIHlvdSB0byBwZXJmb3JtIHZhcmlvdXMgYWN0aW9ucyBvbiBIVFRQIHJlcXVlc3QgYW5kIHJlc3BvbnNlIGhlYWRlcnMuXG4gKiBUaGVzZSBhY3Rpb25zIGluY2x1ZGUgcmV0cmlldmluZywgc2V0dGluZywgYWRkaW5nIHRvLCBhbmQgcmVtb3ZpbmcuXG4gKiBBIEhlYWRlcnMgb2JqZWN0IGhhcyBhbiBhc3NvY2lhdGVkIGhlYWRlciBsaXN0LCB3aGljaCBpcyBpbml0aWFsbHkgZW1wdHkgYW5kIGNvbnNpc3RzIG9mIHplcm8gb3IgbW9yZSBuYW1lIGFuZCB2YWx1ZSBwYWlycy5cbiAqIFlvdSBjYW4gYWRkIHRvIHRoaXMgdXNpbmcgbWV0aG9kcyBsaWtlIGFwcGVuZCgpIChzZWUgRXhhbXBsZXMuKVxuICogSW4gYWxsIG1ldGhvZHMgb2YgdGhpcyBpbnRlcmZhY2UsIGhlYWRlciBuYW1lcyBhcmUgbWF0Y2hlZCBieSBjYXNlLWluc2Vuc2l0aXZlIGJ5dGUgc2VxdWVuY2UuXG4gKlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZWFkZXJzIGV4dGVuZHMgVVJMU2VhcmNoUGFyYW1zIHtcblx0LyoqXG5cdCAqIEhlYWRlcnMgY2xhc3Ncblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7SGVhZGVyc0luaXR9IFtpbml0XSAtIFJlc3BvbnNlIGhlYWRlcnNcblx0ICovXG5cdGNvbnN0cnVjdG9yKGluaXQpIHtcblx0XHQvLyBWYWxpZGF0ZSBhbmQgbm9ybWFsaXplIGluaXQgb2JqZWN0IGluIFtuYW1lLCB2YWx1ZShzKV1bXVxuXHRcdC8qKiBAdHlwZSB7c3RyaW5nW11bXX0gKi9cblx0XHRsZXQgcmVzdWx0ID0gW107XG5cdFx0aWYgKGluaXQgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG5cdFx0XHRjb25zdCByYXcgPSBpbml0LnJhdygpO1xuXHRcdFx0Zm9yIChjb25zdCBbbmFtZSwgdmFsdWVzXSBvZiBPYmplY3QuZW50cmllcyhyYXcpKSB7XG5cdFx0XHRcdHJlc3VsdC5wdXNoKC4uLnZhbHVlcy5tYXAodmFsdWUgPT4gW25hbWUsIHZhbHVlXSkpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoaW5pdCA9PSBudWxsKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCwgZXFlcWVxXG5cdFx0XHQvLyBObyBvcFxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIGluaXQgPT09ICdvYmplY3QnICYmICF0eXBlcy5pc0JveGVkUHJpbWl0aXZlKGluaXQpKSB7XG5cdFx0XHRjb25zdCBtZXRob2QgPSBpbml0W1N5bWJvbC5pdGVyYXRvcl07XG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZXEtbnVsbCwgZXFlcWVxXG5cdFx0XHRpZiAobWV0aG9kID09IG51bGwpIHtcblx0XHRcdFx0Ly8gUmVjb3JkPEJ5dGVTdHJpbmcsIEJ5dGVTdHJpbmc+XG5cdFx0XHRcdHJlc3VsdC5wdXNoKC4uLk9iamVjdC5lbnRyaWVzKGluaXQpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgbWV0aG9kICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignSGVhZGVyIHBhaXJzIG11c3QgYmUgaXRlcmFibGUnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFNlcXVlbmNlPHNlcXVlbmNlPEJ5dGVTdHJpbmc+PlxuXHRcdFx0XHQvLyBOb3RlOiBwZXIgc3BlYyB3ZSBoYXZlIHRvIGZpcnN0IGV4aGF1c3QgdGhlIGxpc3RzIHRoZW4gcHJvY2VzcyB0aGVtXG5cdFx0XHRcdHJlc3VsdCA9IFsuLi5pbml0XVxuXHRcdFx0XHRcdC5tYXAocGFpciA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdHR5cGVvZiBwYWlyICE9PSAnb2JqZWN0JyB8fCB0eXBlcy5pc0JveGVkUHJpbWl0aXZlKHBhaXIpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRWFjaCBoZWFkZXIgcGFpciBtdXN0IGJlIGFuIGl0ZXJhYmxlIG9iamVjdCcpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gWy4uLnBhaXJdO1xuXHRcdFx0XHRcdH0pLm1hcChwYWlyID0+IHtcblx0XHRcdFx0XHRcdGlmIChwYWlyLmxlbmd0aCAhPT0gMikge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFYWNoIGhlYWRlciBwYWlyIG11c3QgYmUgYSBuYW1lL3ZhbHVlIHR1cGxlJyk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBbLi4ucGFpcl07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnSGVhZGVyc1xcJzogVGhlIHByb3ZpZGVkIHZhbHVlIGlzIG5vdCBvZiB0eXBlIFxcJyhzZXF1ZW5jZTxzZXF1ZW5jZTxCeXRlU3RyaW5nPj4gb3IgcmVjb3JkPEJ5dGVTdHJpbmcsIEJ5dGVTdHJpbmc+KScpO1xuXHRcdH1cblxuXHRcdC8vIFZhbGlkYXRlIGFuZCBsb3dlcmNhc2Vcblx0XHRyZXN1bHQgPVxuXHRcdFx0cmVzdWx0Lmxlbmd0aCA+IDAgP1xuXHRcdFx0XHRyZXN1bHQubWFwKChbbmFtZSwgdmFsdWVdKSA9PiB7XG5cdFx0XHRcdFx0dmFsaWRhdGVIZWFkZXJOYW1lKG5hbWUpO1xuXHRcdFx0XHRcdHZhbGlkYXRlSGVhZGVyVmFsdWUobmFtZSwgU3RyaW5nKHZhbHVlKSk7XG5cdFx0XHRcdFx0cmV0dXJuIFtTdHJpbmcobmFtZSkudG9Mb3dlckNhc2UoKSwgU3RyaW5nKHZhbHVlKV07XG5cdFx0XHRcdH0pIDpcblx0XHRcdFx0dW5kZWZpbmVkO1xuXG5cdFx0c3VwZXIocmVzdWx0KTtcblxuXHRcdC8vIFJldHVybmluZyBhIFByb3h5IHRoYXQgd2lsbCBsb3dlcmNhc2Uga2V5IG5hbWVzLCB2YWxpZGF0ZSBwYXJhbWV0ZXJzIGFuZCBzb3J0IGtleXNcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RydWN0b3ItcmV0dXJuXG5cdFx0cmV0dXJuIG5ldyBQcm94eSh0aGlzLCB7XG5cdFx0XHRnZXQodGFyZ2V0LCBwLCByZWNlaXZlcikge1xuXHRcdFx0XHRzd2l0Y2ggKHApIHtcblx0XHRcdFx0XHRjYXNlICdhcHBlbmQnOlxuXHRcdFx0XHRcdGNhc2UgJ3NldCc6XG5cdFx0XHRcdFx0XHRyZXR1cm4gKG5hbWUsIHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHZhbGlkYXRlSGVhZGVyTmFtZShuYW1lKTtcblx0XHRcdFx0XHRcdFx0dmFsaWRhdGVIZWFkZXJWYWx1ZShuYW1lLCBTdHJpbmcodmFsdWUpKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGVbcF0uY2FsbChcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQsXG5cdFx0XHRcdFx0XHRcdFx0U3RyaW5nKG5hbWUpLnRvTG93ZXJDYXNlKCksXG5cdFx0XHRcdFx0XHRcdFx0U3RyaW5nKHZhbHVlKVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGNhc2UgJ2RlbGV0ZSc6XG5cdFx0XHRcdFx0Y2FzZSAnaGFzJzpcblx0XHRcdFx0XHRjYXNlICdnZXRBbGwnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG5hbWUgPT4ge1xuXHRcdFx0XHRcdFx0XHR2YWxpZGF0ZUhlYWRlck5hbWUobmFtZSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlW3BdLmNhbGwoXG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0LFxuXHRcdFx0XHRcdFx0XHRcdFN0cmluZyhuYW1lKS50b0xvd2VyQ2FzZSgpXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0Y2FzZSAna2V5cyc6XG5cdFx0XHRcdFx0XHRyZXR1cm4gKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHR0YXJnZXQuc29ydCgpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV3IFNldChVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmtleXMuY2FsbCh0YXJnZXQpKS5rZXlzKCk7XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHJldHVybiBSZWZsZWN0LmdldCh0YXJnZXQsIHAsIHJlY2VpdmVyKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdC8qIGM4IGlnbm9yZSBuZXh0ICovXG5cdH1cblxuXHRnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG5cdFx0cmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZTtcblx0fVxuXG5cdHRvU3RyaW5nKCkge1xuXHRcdHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpcyk7XG5cdH1cblxuXHRnZXQobmFtZSkge1xuXHRcdGNvbnN0IHZhbHVlcyA9IHRoaXMuZ2V0QWxsKG5hbWUpO1xuXHRcdGlmICh2YWx1ZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRsZXQgdmFsdWUgPSB2YWx1ZXMuam9pbignLCAnKTtcblx0XHRpZiAoL15jb250ZW50LWVuY29kaW5nJC9pLnRlc3QobmFtZSkpIHtcblx0XHRcdHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnID0gdW5kZWZpbmVkKSB7XG5cdFx0Zm9yIChjb25zdCBuYW1lIG9mIHRoaXMua2V5cygpKSB7XG5cdFx0XHRSZWZsZWN0LmFwcGx5KGNhbGxiYWNrLCB0aGlzQXJnLCBbdGhpcy5nZXQobmFtZSksIG5hbWUsIHRoaXNdKTtcblx0XHR9XG5cdH1cblxuXHQqIHZhbHVlcygpIHtcblx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5rZXlzKCkpIHtcblx0XHRcdHlpZWxkIHRoaXMuZ2V0KG5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAdHlwZSB7KCkgPT4gSXRlcmFibGVJdGVyYXRvcjxbc3RyaW5nLCBzdHJpbmddPn1cblx0ICovXG5cdCogZW50cmllcygpIHtcblx0XHRmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5rZXlzKCkpIHtcblx0XHRcdHlpZWxkIFtuYW1lLCB0aGlzLmdldChuYW1lKV07XG5cdFx0fVxuXHR9XG5cblx0W1N5bWJvbC5pdGVyYXRvcl0oKSB7XG5cdFx0cmV0dXJuIHRoaXMuZW50cmllcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5vZGUtZmV0Y2ggbm9uLXNwZWMgbWV0aG9kXG5cdCAqIHJldHVybmluZyBhbGwgaGVhZGVycyBhbmQgdGhlaXIgdmFsdWVzIGFzIGFycmF5XG5cdCAqIEByZXR1cm5zIHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT59XG5cdCAqL1xuXHRyYXcoKSB7XG5cdFx0cmV0dXJuIFsuLi50aGlzLmtleXMoKV0ucmVkdWNlKChyZXN1bHQsIGtleSkgPT4ge1xuXHRcdFx0cmVzdWx0W2tleV0gPSB0aGlzLmdldEFsbChrZXkpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9LCB7fSk7XG5cdH1cblxuXHQvKipcblx0ICogRm9yIGJldHRlciBjb25zb2xlLmxvZyhoZWFkZXJzKSBhbmQgYWxzbyB0byBjb252ZXJ0IEhlYWRlcnMgaW50byBOb2RlLmpzIFJlcXVlc3QgY29tcGF0aWJsZSBmb3JtYXRcblx0ICovXG5cdFtTeW1ib2wuZm9yKCdub2RlanMudXRpbC5pbnNwZWN0LmN1c3RvbScpXSgpIHtcblx0XHRyZXR1cm4gWy4uLnRoaXMua2V5cygpXS5yZWR1Y2UoKHJlc3VsdCwga2V5KSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZXMgPSB0aGlzLmdldEFsbChrZXkpO1xuXHRcdFx0Ly8gSHR0cC5yZXF1ZXN0KCkgb25seSBzdXBwb3J0cyBzdHJpbmcgYXMgSG9zdCBoZWFkZXIuXG5cdFx0XHQvLyBUaGlzIGhhY2sgbWFrZXMgc3BlY2lmeWluZyBjdXN0b20gSG9zdCBoZWFkZXIgcG9zc2libGUuXG5cdFx0XHRpZiAoa2V5ID09PSAnaG9zdCcpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSB2YWx1ZXNbMF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IHZhbHVlcy5sZW5ndGggPiAxID8gdmFsdWVzIDogdmFsdWVzWzBdO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH0sIHt9KTtcblx0fVxufVxuXG4vKipcbiAqIFJlLXNoYXBpbmcgb2JqZWN0IGZvciBXZWIgSURMIHRlc3RzXG4gKiBPbmx5IG5lZWQgdG8gZG8gaXQgZm9yIG92ZXJyaWRkZW4gbWV0aG9kc1xuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhcblx0SGVhZGVycy5wcm90b3R5cGUsXG5cdFsnZ2V0JywgJ2VudHJpZXMnLCAnZm9yRWFjaCcsICd2YWx1ZXMnXS5yZWR1Y2UoKHJlc3VsdCwgcHJvcGVydHkpID0+IHtcblx0XHRyZXN1bHRbcHJvcGVydHldID0ge2VudW1lcmFibGU6IHRydWV9O1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sIHt9KVxuKTtcblxuLyoqXG4gKiBDcmVhdGUgYSBIZWFkZXJzIG9iamVjdCBmcm9tIGFuIGh0dHAuSW5jb21pbmdNZXNzYWdlLnJhd0hlYWRlcnMsIGlnbm9yaW5nIHRob3NlIHRoYXQgZG9cbiAqIG5vdCBjb25mb3JtIHRvIEhUVFAgZ3JhbW1hciBwcm9kdWN0aW9ucy5cbiAqIEBwYXJhbSB7aW1wb3J0KCdodHRwJykuSW5jb21pbmdNZXNzYWdlWydyYXdIZWFkZXJzJ119IGhlYWRlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21SYXdIZWFkZXJzKGhlYWRlcnMgPSBbXSkge1xuXHRyZXR1cm4gbmV3IEhlYWRlcnMoXG5cdFx0aGVhZGVyc1xuXHRcdFx0Ly8gU3BsaXQgaW50byBwYWlyc1xuXHRcdFx0LnJlZHVjZSgocmVzdWx0LCB2YWx1ZSwgaW5kZXgsIGFycmF5KSA9PiB7XG5cdFx0XHRcdGlmIChpbmRleCAlIDIgPT09IDApIHtcblx0XHRcdFx0XHRyZXN1bHQucHVzaChhcnJheS5zbGljZShpbmRleCwgaW5kZXggKyAyKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSwgW10pXG5cdFx0XHQuZmlsdGVyKChbbmFtZSwgdmFsdWVdKSA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dmFsaWRhdGVIZWFkZXJOYW1lKG5hbWUpO1xuXHRcdFx0XHRcdHZhbGlkYXRlSGVhZGVyVmFsdWUobmFtZSwgU3RyaW5nKHZhbHVlKSk7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblxuXHQpO1xufVxuIiwiLyoqXG4gKiBJbmRleC5qc1xuICpcbiAqIGEgcmVxdWVzdCBBUEkgY29tcGF0aWJsZSB3aXRoIHdpbmRvdy5mZXRjaFxuICpcbiAqIEFsbCBzcGVjIGFsZ29yaXRobSBzdGVwIG51bWJlcnMgYXJlIGJhc2VkIG9uIGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnL2NvbW1pdC1zbmFwc2hvdHMvYWU3MTY4MjJjYjNhNjE4NDMyMjZjZDA5MGVlZmM2NTg5NDQ2YzFkMi8uXG4gKi9cblxuaW1wb3J0IGh0dHAgZnJvbSAnbm9kZTpodHRwJztcbmltcG9ydCBodHRwcyBmcm9tICdub2RlOmh0dHBzJztcbmltcG9ydCB6bGliIGZyb20gJ25vZGU6emxpYic7XG5pbXBvcnQgU3RyZWFtLCB7UGFzc1Rocm91Z2gsIHBpcGVsaW5lIGFzIHB1bXB9IGZyb20gJ25vZGU6c3RyZWFtJztcbmltcG9ydCB7QnVmZmVyfSBmcm9tICdub2RlOmJ1ZmZlcic7XG5cbmltcG9ydCBkYXRhVXJpVG9CdWZmZXIgZnJvbSAnZGF0YS11cmktdG8tYnVmZmVyJztcblxuaW1wb3J0IHt3cml0ZVRvU3RyZWFtLCBjbG9uZX0gZnJvbSAnLi9ib2R5LmpzJztcbmltcG9ydCBSZXNwb25zZSBmcm9tICcuL3Jlc3BvbnNlLmpzJztcbmltcG9ydCBIZWFkZXJzLCB7ZnJvbVJhd0hlYWRlcnN9IGZyb20gJy4vaGVhZGVycy5qcyc7XG5pbXBvcnQgUmVxdWVzdCwge2dldE5vZGVSZXF1ZXN0T3B0aW9uc30gZnJvbSAnLi9yZXF1ZXN0LmpzJztcbmltcG9ydCB7RmV0Y2hFcnJvcn0gZnJvbSAnLi9lcnJvcnMvZmV0Y2gtZXJyb3IuanMnO1xuaW1wb3J0IHtBYm9ydEVycm9yfSBmcm9tICcuL2Vycm9ycy9hYm9ydC1lcnJvci5qcyc7XG5pbXBvcnQge2lzUmVkaXJlY3R9IGZyb20gJy4vdXRpbHMvaXMtcmVkaXJlY3QuanMnO1xuaW1wb3J0IHtGb3JtRGF0YX0gZnJvbSAnZm9ybWRhdGEtcG9seWZpbGwvZXNtLm1pbi5qcyc7XG5pbXBvcnQge2lzRG9tYWluT3JTdWJkb21haW4sIGlzU2FtZVByb3RvY29sfSBmcm9tICcuL3V0aWxzL2lzLmpzJztcbmltcG9ydCB7cGFyc2VSZWZlcnJlclBvbGljeUZyb21IZWFkZXJ9IGZyb20gJy4vdXRpbHMvcmVmZXJyZXIuanMnO1xuaW1wb3J0IHtcblx0QmxvYixcblx0RmlsZSxcblx0ZmlsZUZyb21TeW5jLFxuXHRmaWxlRnJvbSxcblx0YmxvYkZyb21TeW5jLFxuXHRibG9iRnJvbVxufSBmcm9tICdmZXRjaC1ibG9iL2Zyb20uanMnO1xuXG5leHBvcnQge0Zvcm1EYXRhLCBIZWFkZXJzLCBSZXF1ZXN0LCBSZXNwb25zZSwgRmV0Y2hFcnJvciwgQWJvcnRFcnJvciwgaXNSZWRpcmVjdH07XG5leHBvcnQge0Jsb2IsIEZpbGUsIGZpbGVGcm9tU3luYywgZmlsZUZyb20sIGJsb2JGcm9tU3luYywgYmxvYkZyb219O1xuXG5jb25zdCBzdXBwb3J0ZWRTY2hlbWFzID0gbmV3IFNldChbJ2RhdGE6JywgJ2h0dHA6JywgJ2h0dHBzOiddKTtcblxuLyoqXG4gKiBGZXRjaCBmdW5jdGlvblxuICpcbiAqIEBwYXJhbSAgIHtzdHJpbmcgfCBVUkwgfCBpbXBvcnQoJy4vcmVxdWVzdCcpLmRlZmF1bHR9IHVybCAtIEFic29sdXRlIHVybCBvciBSZXF1ZXN0IGluc3RhbmNlXG4gKiBAcGFyYW0gICB7Kn0gW29wdGlvbnNfXSAtIEZldGNoIG9wdGlvbnNcbiAqIEByZXR1cm4gIHtQcm9taXNlPGltcG9ydCgnLi9yZXNwb25zZScpLmRlZmF1bHQ+fVxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBmZXRjaCh1cmwsIG9wdGlvbnNfKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0Ly8gQnVpbGQgcmVxdWVzdCBvYmplY3Rcblx0XHRjb25zdCByZXF1ZXN0ID0gbmV3IFJlcXVlc3QodXJsLCBvcHRpb25zXyk7XG5cdFx0Y29uc3Qge3BhcnNlZFVSTCwgb3B0aW9uc30gPSBnZXROb2RlUmVxdWVzdE9wdGlvbnMocmVxdWVzdCk7XG5cdFx0aWYgKCFzdXBwb3J0ZWRTY2hlbWFzLmhhcyhwYXJzZWRVUkwucHJvdG9jb2wpKSB7XG5cdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBub2RlLWZldGNoIGNhbm5vdCBsb2FkICR7dXJsfS4gVVJMIHNjaGVtZSBcIiR7cGFyc2VkVVJMLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpfVwiIGlzIG5vdCBzdXBwb3J0ZWQuYCk7XG5cdFx0fVxuXG5cdFx0aWYgKHBhcnNlZFVSTC5wcm90b2NvbCA9PT0gJ2RhdGE6Jykge1xuXHRcdFx0Y29uc3QgZGF0YSA9IGRhdGFVcmlUb0J1ZmZlcihyZXF1ZXN0LnVybCk7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IG5ldyBSZXNwb25zZShkYXRhLCB7aGVhZGVyczogeydDb250ZW50LVR5cGUnOiBkYXRhLnR5cGVGdWxsfX0pO1xuXHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV3JhcCBodHRwLnJlcXVlc3QgaW50byBmZXRjaFxuXHRcdGNvbnN0IHNlbmQgPSAocGFyc2VkVVJMLnByb3RvY29sID09PSAnaHR0cHM6JyA/IGh0dHBzIDogaHR0cCkucmVxdWVzdDtcblx0XHRjb25zdCB7c2lnbmFsfSA9IHJlcXVlc3Q7XG5cdFx0bGV0IHJlc3BvbnNlID0gbnVsbDtcblxuXHRcdGNvbnN0IGFib3J0ID0gKCkgPT4ge1xuXHRcdFx0Y29uc3QgZXJyb3IgPSBuZXcgQWJvcnRFcnJvcignVGhlIG9wZXJhdGlvbiB3YXMgYWJvcnRlZC4nKTtcblx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHRpZiAocmVxdWVzdC5ib2R5ICYmIHJlcXVlc3QuYm9keSBpbnN0YW5jZW9mIFN0cmVhbS5SZWFkYWJsZSkge1xuXHRcdFx0XHRyZXF1ZXN0LmJvZHkuZGVzdHJveShlcnJvcik7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghcmVzcG9uc2UgfHwgIXJlc3BvbnNlLmJvZHkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXNwb25zZS5ib2R5LmVtaXQoJ2Vycm9yJywgZXJyb3IpO1xuXHRcdH07XG5cblx0XHRpZiAoc2lnbmFsICYmIHNpZ25hbC5hYm9ydGVkKSB7XG5cdFx0XHRhYm9ydCgpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGFib3J0QW5kRmluYWxpemUgPSAoKSA9PiB7XG5cdFx0XHRhYm9ydCgpO1xuXHRcdFx0ZmluYWxpemUoKTtcblx0XHR9O1xuXG5cdFx0Ly8gU2VuZCByZXF1ZXN0XG5cdFx0Y29uc3QgcmVxdWVzdF8gPSBzZW5kKHBhcnNlZFVSTC50b1N0cmluZygpLCBvcHRpb25zKTtcblxuXHRcdGlmIChzaWduYWwpIHtcblx0XHRcdHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0QW5kRmluYWxpemUpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZpbmFsaXplID0gKCkgPT4ge1xuXHRcdFx0cmVxdWVzdF8uYWJvcnQoKTtcblx0XHRcdGlmIChzaWduYWwpIHtcblx0XHRcdFx0c2lnbmFsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRBbmRGaW5hbGl6ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHJlcXVlc3RfLm9uKCdlcnJvcicsIGVycm9yID0+IHtcblx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcihgcmVxdWVzdCB0byAke3JlcXVlc3QudXJsfSBmYWlsZWQsIHJlYXNvbjogJHtlcnJvci5tZXNzYWdlfWAsICdzeXN0ZW0nLCBlcnJvcikpO1xuXHRcdFx0ZmluYWxpemUoKTtcblx0XHR9KTtcblxuXHRcdGZpeFJlc3BvbnNlQ2h1bmtlZFRyYW5zZmVyQmFkRW5kaW5nKHJlcXVlc3RfLCBlcnJvciA9PiB7XG5cdFx0XHRpZiAocmVzcG9uc2UgJiYgcmVzcG9uc2UuYm9keSkge1xuXHRcdFx0XHRyZXNwb25zZS5ib2R5LmRlc3Ryb3koZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0LyogYzggaWdub3JlIG5leHQgMTggKi9cblx0XHRpZiAocHJvY2Vzcy52ZXJzaW9uIDwgJ3YxNCcpIHtcblx0XHRcdC8vIEJlZm9yZSBOb2RlLmpzIDE0LCBwaXBlbGluZSgpIGRvZXMgbm90IGZ1bGx5IHN1cHBvcnQgYXN5bmMgaXRlcmF0b3JzIGFuZCBkb2VzIG5vdCBhbHdheXNcblx0XHRcdC8vIHByb3Blcmx5IGhhbmRsZSB3aGVuIHRoZSBzb2NrZXQgY2xvc2UvZW5kIGV2ZW50cyBhcmUgb3V0IG9mIG9yZGVyLlxuXHRcdFx0cmVxdWVzdF8ub24oJ3NvY2tldCcsIHMgPT4ge1xuXHRcdFx0XHRsZXQgZW5kZWRXaXRoRXZlbnRzQ291bnQ7XG5cdFx0XHRcdHMucHJlcGVuZExpc3RlbmVyKCdlbmQnLCAoKSA9PiB7XG5cdFx0XHRcdFx0ZW5kZWRXaXRoRXZlbnRzQ291bnQgPSBzLl9ldmVudHNDb3VudDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHMucHJlcGVuZExpc3RlbmVyKCdjbG9zZScsIGhhZEVycm9yID0+IHtcblx0XHRcdFx0XHQvLyBpZiBlbmQgaGFwcGVuZWQgYmVmb3JlIGNsb3NlIGJ1dCB0aGUgc29ja2V0IGRpZG4ndCBlbWl0IGFuIGVycm9yLCBkbyBpdCBub3dcblx0XHRcdFx0XHRpZiAocmVzcG9uc2UgJiYgZW5kZWRXaXRoRXZlbnRzQ291bnQgPCBzLl9ldmVudHNDb3VudCAmJiAhaGFkRXJyb3IpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdQcmVtYXR1cmUgY2xvc2UnKTtcblx0XHRcdFx0XHRcdGVycm9yLmNvZGUgPSAnRVJSX1NUUkVBTV9QUkVNQVRVUkVfQ0xPU0UnO1xuXHRcdFx0XHRcdFx0cmVzcG9uc2UuYm9keS5lbWl0KCdlcnJvcicsIGVycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmVxdWVzdF8ub24oJ3Jlc3BvbnNlJywgcmVzcG9uc2VfID0+IHtcblx0XHRcdHJlcXVlc3RfLnNldFRpbWVvdXQoMCk7XG5cdFx0XHRjb25zdCBoZWFkZXJzID0gZnJvbVJhd0hlYWRlcnMocmVzcG9uc2VfLnJhd0hlYWRlcnMpO1xuXG5cdFx0XHQvLyBIVFRQIGZldGNoIHN0ZXAgNVxuXHRcdFx0aWYgKGlzUmVkaXJlY3QocmVzcG9uc2VfLnN0YXR1c0NvZGUpKSB7XG5cdFx0XHRcdC8vIEhUVFAgZmV0Y2ggc3RlcCA1LjJcblx0XHRcdFx0Y29uc3QgbG9jYXRpb24gPSBoZWFkZXJzLmdldCgnTG9jYXRpb24nKTtcblxuXHRcdFx0XHQvLyBIVFRQIGZldGNoIHN0ZXAgNS4zXG5cdFx0XHRcdGxldCBsb2NhdGlvblVSTCA9IG51bGw7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0bG9jYXRpb25VUkwgPSBsb2NhdGlvbiA9PT0gbnVsbCA/IG51bGwgOiBuZXcgVVJMKGxvY2F0aW9uLCByZXF1ZXN0LnVybCk7XG5cdFx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRcdC8vIGVycm9yIGhlcmUgY2FuIG9ubHkgYmUgaW52YWxpZCBVUkwgaW4gTG9jYXRpb246IGhlYWRlclxuXHRcdFx0XHRcdC8vIGRvIG5vdCB0aHJvdyB3aGVuIG9wdGlvbnMucmVkaXJlY3QgPT0gbWFudWFsXG5cdFx0XHRcdFx0Ly8gbGV0IHRoZSB1c2VyIGV4dHJhY3QgdGhlIGVycm9ybmVvdXMgcmVkaXJlY3QgVVJMXG5cdFx0XHRcdFx0aWYgKHJlcXVlc3QucmVkaXJlY3QgIT09ICdtYW51YWwnKSB7XG5cdFx0XHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYHVyaSByZXF1ZXN0ZWQgcmVzcG9uZHMgd2l0aCBhbiBpbnZhbGlkIHJlZGlyZWN0IFVSTDogJHtsb2NhdGlvbn1gLCAnaW52YWxpZC1yZWRpcmVjdCcpKTtcblx0XHRcdFx0XHRcdGZpbmFsaXplKCk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSFRUUCBmZXRjaCBzdGVwIDUuNVxuXHRcdFx0XHRzd2l0Y2ggKHJlcXVlc3QucmVkaXJlY3QpIHtcblx0XHRcdFx0XHRjYXNlICdlcnJvcic6XG5cdFx0XHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYHVyaSByZXF1ZXN0ZWQgcmVzcG9uZHMgd2l0aCBhIHJlZGlyZWN0LCByZWRpcmVjdCBtb2RlIGlzIHNldCB0byBlcnJvcjogJHtyZXF1ZXN0LnVybH1gLCAnbm8tcmVkaXJlY3QnKSk7XG5cdFx0XHRcdFx0XHRmaW5hbGl6ZSgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdGNhc2UgJ21hbnVhbCc6XG5cdFx0XHRcdFx0XHQvLyBOb3RoaW5nIHRvIGRvXG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlICdmb2xsb3cnOiB7XG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgMlxuXHRcdFx0XHRcdFx0aWYgKGxvY2F0aW9uVVJMID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgNVxuXHRcdFx0XHRcdFx0aWYgKHJlcXVlc3QuY291bnRlciA+PSByZXF1ZXN0LmZvbGxvdykge1xuXHRcdFx0XHRcdFx0XHRyZWplY3QobmV3IEZldGNoRXJyb3IoYG1heGltdW0gcmVkaXJlY3QgcmVhY2hlZCBhdDogJHtyZXF1ZXN0LnVybH1gLCAnbWF4LXJlZGlyZWN0JykpO1xuXHRcdFx0XHRcdFx0XHRmaW5hbGl6ZSgpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vIEhUVFAtcmVkaXJlY3QgZmV0Y2ggc3RlcCA2IChjb3VudGVyIGluY3JlbWVudClcblx0XHRcdFx0XHRcdC8vIENyZWF0ZSBhIG5ldyBSZXF1ZXN0IG9iamVjdC5cblx0XHRcdFx0XHRcdGNvbnN0IHJlcXVlc3RPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0XHRoZWFkZXJzOiBuZXcgSGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMpLFxuXHRcdFx0XHRcdFx0XHRmb2xsb3c6IHJlcXVlc3QuZm9sbG93LFxuXHRcdFx0XHRcdFx0XHRjb3VudGVyOiByZXF1ZXN0LmNvdW50ZXIgKyAxLFxuXHRcdFx0XHRcdFx0XHRhZ2VudDogcmVxdWVzdC5hZ2VudCxcblx0XHRcdFx0XHRcdFx0Y29tcHJlc3M6IHJlcXVlc3QuY29tcHJlc3MsXG5cdFx0XHRcdFx0XHRcdG1ldGhvZDogcmVxdWVzdC5tZXRob2QsXG5cdFx0XHRcdFx0XHRcdGJvZHk6IGNsb25lKHJlcXVlc3QpLFxuXHRcdFx0XHRcdFx0XHRzaWduYWw6IHJlcXVlc3Quc2lnbmFsLFxuXHRcdFx0XHRcdFx0XHRzaXplOiByZXF1ZXN0LnNpemUsXG5cdFx0XHRcdFx0XHRcdHJlZmVycmVyOiByZXF1ZXN0LnJlZmVycmVyLFxuXHRcdFx0XHRcdFx0XHRyZWZlcnJlclBvbGljeTogcmVxdWVzdC5yZWZlcnJlclBvbGljeVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0Ly8gd2hlbiBmb3J3YXJkaW5nIHNlbnNpdGl2ZSBoZWFkZXJzIGxpa2UgXCJBdXRob3JpemF0aW9uXCIsXG5cdFx0XHRcdFx0XHQvLyBcIldXVy1BdXRoZW50aWNhdGVcIiwgYW5kIFwiQ29va2llXCIgdG8gdW50cnVzdGVkIHRhcmdldHMsXG5cdFx0XHRcdFx0XHQvLyBoZWFkZXJzIHdpbGwgYmUgaWdub3JlZCB3aGVuIGZvbGxvd2luZyBhIHJlZGlyZWN0IHRvIGEgZG9tYWluXG5cdFx0XHRcdFx0XHQvLyB0aGF0IGlzIG5vdCBhIHN1YmRvbWFpbiBtYXRjaCBvciBleGFjdCBtYXRjaCBvZiB0aGUgaW5pdGlhbCBkb21haW4uXG5cdFx0XHRcdFx0XHQvLyBGb3IgZXhhbXBsZSwgYSByZWRpcmVjdCBmcm9tIFwiZm9vLmNvbVwiIHRvIGVpdGhlciBcImZvby5jb21cIiBvciBcInN1Yi5mb28uY29tXCJcblx0XHRcdFx0XHRcdC8vIHdpbGwgZm9yd2FyZCB0aGUgc2Vuc2l0aXZlIGhlYWRlcnMsIGJ1dCBhIHJlZGlyZWN0IHRvIFwiYmFyLmNvbVwiIHdpbGwgbm90LlxuXHRcdFx0XHRcdFx0Ly8gaGVhZGVycyB3aWxsIGFsc28gYmUgaWdub3JlZCB3aGVuIGZvbGxvd2luZyBhIHJlZGlyZWN0IHRvIGEgZG9tYWluIHVzaW5nXG5cdFx0XHRcdFx0XHQvLyBhIGRpZmZlcmVudCBwcm90b2NvbC4gRm9yIGV4YW1wbGUsIGEgcmVkaXJlY3QgZnJvbSBcImh0dHBzOi8vZm9vLmNvbVwiIHRvIFwiaHR0cDovL2Zvby5jb21cIlxuXHRcdFx0XHRcdFx0Ly8gd2lsbCBub3QgZm9yd2FyZCB0aGUgc2Vuc2l0aXZlIGhlYWRlcnNcblx0XHRcdFx0XHRcdGlmICghaXNEb21haW5PclN1YmRvbWFpbihyZXF1ZXN0LnVybCwgbG9jYXRpb25VUkwpIHx8ICFpc1NhbWVQcm90b2NvbChyZXF1ZXN0LnVybCwgbG9jYXRpb25VUkwpKSB7XG5cdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgbmFtZSBvZiBbJ2F1dGhvcml6YXRpb24nLCAnd3d3LWF1dGhlbnRpY2F0ZScsICdjb29raWUnLCAnY29va2llMiddKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVxdWVzdE9wdGlvbnMuaGVhZGVycy5kZWxldGUobmFtZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gSFRUUC1yZWRpcmVjdCBmZXRjaCBzdGVwIDlcblx0XHRcdFx0XHRcdGlmIChyZXNwb25zZV8uc3RhdHVzQ29kZSAhPT0gMzAzICYmIHJlcXVlc3QuYm9keSAmJiBvcHRpb25zXy5ib2R5IGluc3RhbmNlb2YgU3RyZWFtLlJlYWRhYmxlKSB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChuZXcgRmV0Y2hFcnJvcignQ2Fubm90IGZvbGxvdyByZWRpcmVjdCB3aXRoIGJvZHkgYmVpbmcgYSByZWFkYWJsZSBzdHJlYW0nLCAndW5zdXBwb3J0ZWQtcmVkaXJlY3QnKSk7XG5cdFx0XHRcdFx0XHRcdGZpbmFsaXplKCk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gSFRUUC1yZWRpcmVjdCBmZXRjaCBzdGVwIDExXG5cdFx0XHRcdFx0XHRpZiAocmVzcG9uc2VfLnN0YXR1c0NvZGUgPT09IDMwMyB8fCAoKHJlc3BvbnNlXy5zdGF0dXNDb2RlID09PSAzMDEgfHwgcmVzcG9uc2VfLnN0YXR1c0NvZGUgPT09IDMwMikgJiYgcmVxdWVzdC5tZXRob2QgPT09ICdQT1NUJykpIHtcblx0XHRcdFx0XHRcdFx0cmVxdWVzdE9wdGlvbnMubWV0aG9kID0gJ0dFVCc7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RPcHRpb25zLmJvZHkgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RPcHRpb25zLmhlYWRlcnMuZGVsZXRlKCdjb250ZW50LWxlbmd0aCcpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBIVFRQLXJlZGlyZWN0IGZldGNoIHN0ZXAgMTRcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3BvbnNlUmVmZXJyZXJQb2xpY3kgPSBwYXJzZVJlZmVycmVyUG9saWN5RnJvbUhlYWRlcihoZWFkZXJzKTtcblx0XHRcdFx0XHRcdGlmIChyZXNwb25zZVJlZmVycmVyUG9saWN5KSB7XG5cdFx0XHRcdFx0XHRcdHJlcXVlc3RPcHRpb25zLnJlZmVycmVyUG9saWN5ID0gcmVzcG9uc2VSZWZlcnJlclBvbGljeTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gSFRUUC1yZWRpcmVjdCBmZXRjaCBzdGVwIDE1XG5cdFx0XHRcdFx0XHRyZXNvbHZlKGZldGNoKG5ldyBSZXF1ZXN0KGxvY2F0aW9uVVJMLCByZXF1ZXN0T3B0aW9ucykpKTtcblx0XHRcdFx0XHRcdGZpbmFsaXplKCk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHJldHVybiByZWplY3QobmV3IFR5cGVFcnJvcihgUmVkaXJlY3Qgb3B0aW9uICcke3JlcXVlc3QucmVkaXJlY3R9JyBpcyBub3QgYSB2YWxpZCB2YWx1ZSBvZiBSZXF1ZXN0UmVkaXJlY3RgKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gUHJlcGFyZSByZXNwb25zZVxuXHRcdFx0aWYgKHNpZ25hbCkge1xuXHRcdFx0XHRyZXNwb25zZV8ub25jZSgnZW5kJywgKCkgPT4ge1xuXHRcdFx0XHRcdHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0QW5kRmluYWxpemUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGJvZHkgPSBwdW1wKHJlc3BvbnNlXywgbmV3IFBhc3NUaHJvdWdoKCksIGVycm9yID0+IHtcblx0XHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHQvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL3B1bGwvMjkzNzZcblx0XHRcdC8qIGM4IGlnbm9yZSBuZXh0IDMgKi9cblx0XHRcdGlmIChwcm9jZXNzLnZlcnNpb24gPCAndjEyLjEwJykge1xuXHRcdFx0XHRyZXNwb25zZV8ub24oJ2Fib3J0ZWQnLCBhYm9ydEFuZEZpbmFsaXplKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcmVzcG9uc2VPcHRpb25zID0ge1xuXHRcdFx0XHR1cmw6IHJlcXVlc3QudXJsLFxuXHRcdFx0XHRzdGF0dXM6IHJlc3BvbnNlXy5zdGF0dXNDb2RlLFxuXHRcdFx0XHRzdGF0dXNUZXh0OiByZXNwb25zZV8uc3RhdHVzTWVzc2FnZSxcblx0XHRcdFx0aGVhZGVycyxcblx0XHRcdFx0c2l6ZTogcmVxdWVzdC5zaXplLFxuXHRcdFx0XHRjb3VudGVyOiByZXF1ZXN0LmNvdW50ZXIsXG5cdFx0XHRcdGhpZ2hXYXRlck1hcms6IHJlcXVlc3QuaGlnaFdhdGVyTWFya1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gSFRUUC1uZXR3b3JrIGZldGNoIHN0ZXAgMTIuMS4xLjNcblx0XHRcdGNvbnN0IGNvZGluZ3MgPSBoZWFkZXJzLmdldCgnQ29udGVudC1FbmNvZGluZycpO1xuXG5cdFx0XHQvLyBIVFRQLW5ldHdvcmsgZmV0Y2ggc3RlcCAxMi4xLjEuNDogaGFuZGxlIGNvbnRlbnQgY29kaW5nc1xuXG5cdFx0XHQvLyBpbiBmb2xsb3dpbmcgc2NlbmFyaW9zIHdlIGlnbm9yZSBjb21wcmVzc2lvbiBzdXBwb3J0XG5cdFx0XHQvLyAxLiBjb21wcmVzc2lvbiBzdXBwb3J0IGlzIGRpc2FibGVkXG5cdFx0XHQvLyAyLiBIRUFEIHJlcXVlc3Rcblx0XHRcdC8vIDMuIG5vIENvbnRlbnQtRW5jb2RpbmcgaGVhZGVyXG5cdFx0XHQvLyA0LiBubyBjb250ZW50IHJlc3BvbnNlICgyMDQpXG5cdFx0XHQvLyA1LiBjb250ZW50IG5vdCBtb2RpZmllZCByZXNwb25zZSAoMzA0KVxuXHRcdFx0aWYgKCFyZXF1ZXN0LmNvbXByZXNzIHx8IHJlcXVlc3QubWV0aG9kID09PSAnSEVBRCcgfHwgY29kaW5ncyA9PT0gbnVsbCB8fCByZXNwb25zZV8uc3RhdHVzQ29kZSA9PT0gMjA0IHx8IHJlc3BvbnNlXy5zdGF0dXNDb2RlID09PSAzMDQpIHtcblx0XHRcdFx0cmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UoYm9keSwgcmVzcG9uc2VPcHRpb25zKTtcblx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRm9yIE5vZGUgdjYrXG5cdFx0XHQvLyBCZSBsZXNzIHN0cmljdCB3aGVuIGRlY29kaW5nIGNvbXByZXNzZWQgcmVzcG9uc2VzLCBzaW5jZSBzb21ldGltZXNcblx0XHRcdC8vIHNlcnZlcnMgc2VuZCBzbGlnaHRseSBpbnZhbGlkIHJlc3BvbnNlcyB0aGF0IGFyZSBzdGlsbCBhY2NlcHRlZFxuXHRcdFx0Ly8gYnkgY29tbW9uIGJyb3dzZXJzLlxuXHRcdFx0Ly8gQWx3YXlzIHVzaW5nIFpfU1lOQ19GTFVTSCBpcyB3aGF0IGNVUkwgZG9lcy5cblx0XHRcdGNvbnN0IHpsaWJPcHRpb25zID0ge1xuXHRcdFx0XHRmbHVzaDogemxpYi5aX1NZTkNfRkxVU0gsXG5cdFx0XHRcdGZpbmlzaEZsdXNoOiB6bGliLlpfU1lOQ19GTFVTSFxuXHRcdFx0fTtcblxuXHRcdFx0Ly8gRm9yIGd6aXBcblx0XHRcdGlmIChjb2RpbmdzID09PSAnZ3ppcCcgfHwgY29kaW5ncyA9PT0gJ3gtZ3ppcCcpIHtcblx0XHRcdFx0Ym9keSA9IHB1bXAoYm9keSwgemxpYi5jcmVhdGVHdW56aXAoemxpYk9wdGlvbnMpLCBlcnJvciA9PiB7XG5cdFx0XHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHksIHJlc3BvbnNlT3B0aW9ucyk7XG5cdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZvciBkZWZsYXRlXG5cdFx0XHRpZiAoY29kaW5ncyA9PT0gJ2RlZmxhdGUnIHx8IGNvZGluZ3MgPT09ICd4LWRlZmxhdGUnKSB7XG5cdFx0XHRcdC8vIEhhbmRsZSB0aGUgaW5mYW1vdXMgcmF3IGRlZmxhdGUgcmVzcG9uc2UgZnJvbSBvbGQgc2VydmVyc1xuXHRcdFx0XHQvLyBhIGhhY2sgZm9yIG9sZCBJSVMgYW5kIEFwYWNoZSBzZXJ2ZXJzXG5cdFx0XHRcdGNvbnN0IHJhdyA9IHB1bXAocmVzcG9uc2VfLCBuZXcgUGFzc1Rocm91Z2goKSwgZXJyb3IgPT4ge1xuXHRcdFx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyYXcub25jZSgnZGF0YScsIGNodW5rID0+IHtcblx0XHRcdFx0XHQvLyBTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNzUxOTgyOFxuXHRcdFx0XHRcdGlmICgoY2h1bmtbMF0gJiAweDBGKSA9PT0gMHgwOCkge1xuXHRcdFx0XHRcdFx0Ym9keSA9IHB1bXAoYm9keSwgemxpYi5jcmVhdGVJbmZsYXRlKCksIGVycm9yID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmVqZWN0KGVycm9yKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGJvZHkgPSBwdW1wKGJvZHksIHpsaWIuY3JlYXRlSW5mbGF0ZVJhdygpLCBlcnJvciA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHksIHJlc3BvbnNlT3B0aW9ucyk7XG5cdFx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyYXcub25jZSgnZW5kJywgKCkgPT4ge1xuXHRcdFx0XHRcdC8vIFNvbWUgb2xkIElJUyBzZXJ2ZXJzIHJldHVybiB6ZXJvLWxlbmd0aCBPSyBkZWZsYXRlIHJlc3BvbnNlcywgc29cblx0XHRcdFx0XHQvLyAnZGF0YScgaXMgbmV2ZXIgZW1pdHRlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlLWZldGNoL25vZGUtZmV0Y2gvcHVsbC85MDNcblx0XHRcdFx0XHRpZiAoIXJlc3BvbnNlKSB7XG5cdFx0XHRcdFx0XHRyZXNwb25zZSA9IG5ldyBSZXNwb25zZShib2R5LCByZXNwb25zZU9wdGlvbnMpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBGb3IgYnJcblx0XHRcdGlmIChjb2RpbmdzID09PSAnYnInKSB7XG5cdFx0XHRcdGJvZHkgPSBwdW1wKGJvZHksIHpsaWIuY3JlYXRlQnJvdGxpRGVjb21wcmVzcygpLCBlcnJvciA9PiB7XG5cdFx0XHRcdFx0aWYgKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKGJvZHksIHJlc3BvbnNlT3B0aW9ucyk7XG5cdFx0XHRcdHJlc29sdmUocmVzcG9uc2UpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIE90aGVyd2lzZSwgdXNlIHJlc3BvbnNlIGFzLWlzXG5cdFx0XHRyZXNwb25zZSA9IG5ldyBSZXNwb25zZShib2R5LCByZXNwb25zZU9wdGlvbnMpO1xuXHRcdFx0cmVzb2x2ZShyZXNwb25zZSk7XG5cdFx0fSk7XG5cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJvbWlzZS9wcmVmZXItYXdhaXQtdG8tdGhlblxuXHRcdHdyaXRlVG9TdHJlYW0ocmVxdWVzdF8sIHJlcXVlc3QpLmNhdGNoKHJlamVjdCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBmaXhSZXNwb25zZUNodW5rZWRUcmFuc2ZlckJhZEVuZGluZyhyZXF1ZXN0LCBlcnJvckNhbGxiYWNrKSB7XG5cdGNvbnN0IExBU1RfQ0hVTksgPSBCdWZmZXIuZnJvbSgnMFxcclxcblxcclxcbicpO1xuXG5cdGxldCBpc0NodW5rZWRUcmFuc2ZlciA9IGZhbHNlO1xuXHRsZXQgcHJvcGVyTGFzdENodW5rUmVjZWl2ZWQgPSBmYWxzZTtcblx0bGV0IHByZXZpb3VzQ2h1bms7XG5cblx0cmVxdWVzdC5vbigncmVzcG9uc2UnLCByZXNwb25zZSA9PiB7XG5cdFx0Y29uc3Qge2hlYWRlcnN9ID0gcmVzcG9uc2U7XG5cdFx0aXNDaHVua2VkVHJhbnNmZXIgPSBoZWFkZXJzWyd0cmFuc2Zlci1lbmNvZGluZyddID09PSAnY2h1bmtlZCcgJiYgIWhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ107XG5cdH0pO1xuXG5cdHJlcXVlc3Qub24oJ3NvY2tldCcsIHNvY2tldCA9PiB7XG5cdFx0Y29uc3Qgb25Tb2NrZXRDbG9zZSA9ICgpID0+IHtcblx0XHRcdGlmIChpc0NodW5rZWRUcmFuc2ZlciAmJiAhcHJvcGVyTGFzdENodW5rUmVjZWl2ZWQpIHtcblx0XHRcdFx0Y29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ1ByZW1hdHVyZSBjbG9zZScpO1xuXHRcdFx0XHRlcnJvci5jb2RlID0gJ0VSUl9TVFJFQU1fUFJFTUFUVVJFX0NMT1NFJztcblx0XHRcdFx0ZXJyb3JDYWxsYmFjayhlcnJvcik7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uRGF0YSA9IGJ1ZiA9PiB7XG5cdFx0XHRwcm9wZXJMYXN0Q2h1bmtSZWNlaXZlZCA9IEJ1ZmZlci5jb21wYXJlKGJ1Zi5zbGljZSgtNSksIExBU1RfQ0hVTkspID09PSAwO1xuXG5cdFx0XHQvLyBTb21ldGltZXMgZmluYWwgMC1sZW5ndGggY2h1bmsgYW5kIGVuZCBvZiBtZXNzYWdlIGNvZGUgYXJlIGluIHNlcGFyYXRlIHBhY2tldHNcblx0XHRcdGlmICghcHJvcGVyTGFzdENodW5rUmVjZWl2ZWQgJiYgcHJldmlvdXNDaHVuaykge1xuXHRcdFx0XHRwcm9wZXJMYXN0Q2h1bmtSZWNlaXZlZCA9IChcblx0XHRcdFx0XHRCdWZmZXIuY29tcGFyZShwcmV2aW91c0NodW5rLnNsaWNlKC0zKSwgTEFTVF9DSFVOSy5zbGljZSgwLCAzKSkgPT09IDAgJiZcblx0XHRcdFx0XHRCdWZmZXIuY29tcGFyZShidWYuc2xpY2UoLTIpLCBMQVNUX0NIVU5LLnNsaWNlKDMpKSA9PT0gMFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRwcmV2aW91c0NodW5rID0gYnVmO1xuXHRcdH07XG5cblx0XHRzb2NrZXQucHJlcGVuZExpc3RlbmVyKCdjbG9zZScsIG9uU29ja2V0Q2xvc2UpO1xuXHRcdHNvY2tldC5vbignZGF0YScsIG9uRGF0YSk7XG5cblx0XHRyZXF1ZXN0Lm9uKCdjbG9zZScsICgpID0+IHtcblx0XHRcdHNvY2tldC5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBvblNvY2tldENsb3NlKTtcblx0XHRcdHNvY2tldC5yZW1vdmVMaXN0ZW5lcignZGF0YScsIG9uRGF0YSk7XG5cdFx0fSk7XG5cdH0pO1xufVxuIiwiLyoqXG4gKiBSZXF1ZXN0LmpzXG4gKlxuICogUmVxdWVzdCBjbGFzcyBjb250YWlucyBzZXJ2ZXIgb25seSBvcHRpb25zXG4gKlxuICogQWxsIHNwZWMgYWxnb3JpdGhtIHN0ZXAgbnVtYmVycyBhcmUgYmFzZWQgb24gaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvY29tbWl0LXNuYXBzaG90cy9hZTcxNjgyMmNiM2E2MTg0MzIyNmNkMDkwZWVmYzY1ODk0NDZjMWQyLy5cbiAqL1xuXG5pbXBvcnQge2Zvcm1hdCBhcyBmb3JtYXRVcmx9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB7ZGVwcmVjYXRlfSBmcm9tICdub2RlOnV0aWwnO1xuaW1wb3J0IEhlYWRlcnMgZnJvbSAnLi9oZWFkZXJzLmpzJztcbmltcG9ydCBCb2R5LCB7Y2xvbmUsIGV4dHJhY3RDb250ZW50VHlwZSwgZ2V0VG90YWxCeXRlc30gZnJvbSAnLi9ib2R5LmpzJztcbmltcG9ydCB7aXNBYm9ydFNpZ25hbH0gZnJvbSAnLi91dGlscy9pcy5qcyc7XG5pbXBvcnQge2dldFNlYXJjaH0gZnJvbSAnLi91dGlscy9nZXQtc2VhcmNoLmpzJztcbmltcG9ydCB7XG5cdHZhbGlkYXRlUmVmZXJyZXJQb2xpY3ksIGRldGVybWluZVJlcXVlc3RzUmVmZXJyZXIsIERFRkFVTFRfUkVGRVJSRVJfUE9MSUNZXG59IGZyb20gJy4vdXRpbHMvcmVmZXJyZXIuanMnO1xuXG5jb25zdCBJTlRFUk5BTFMgPSBTeW1ib2woJ1JlcXVlc3QgaW50ZXJuYWxzJyk7XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gaW5zdGFuY2Ugb2YgUmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0gIHsqfSBvYmplY3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmNvbnN0IGlzUmVxdWVzdCA9IG9iamVjdCA9PiB7XG5cdHJldHVybiAoXG5cdFx0dHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcblx0XHR0eXBlb2Ygb2JqZWN0W0lOVEVSTkFMU10gPT09ICdvYmplY3QnXG5cdCk7XG59O1xuXG5jb25zdCBkb0JhZERhdGFXYXJuID0gZGVwcmVjYXRlKCgpID0+IHt9LFxuXHQnLmRhdGEgaXMgbm90IGEgdmFsaWQgUmVxdWVzdEluaXQgcHJvcGVydHksIHVzZSAuYm9keSBpbnN0ZWFkJyxcblx0J2h0dHBzOi8vZ2l0aHViLmNvbS9ub2RlLWZldGNoL25vZGUtZmV0Y2gvaXNzdWVzLzEwMDAgKHJlcXVlc3QpJyk7XG5cbi8qKlxuICogUmVxdWVzdCBjbGFzc1xuICpcbiAqIFJlZjogaHR0cHM6Ly9mZXRjaC5zcGVjLndoYXR3Zy5vcmcvI3JlcXVlc3QtY2xhc3NcbiAqXG4gKiBAcGFyYW0gICBNaXhlZCAgIGlucHV0ICBVcmwgb3IgUmVxdWVzdCBpbnN0YW5jZVxuICogQHBhcmFtICAgT2JqZWN0ICBpbml0ICAgQ3VzdG9tIG9wdGlvbnNcbiAqIEByZXR1cm4gIFZvaWRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVxdWVzdCBleHRlbmRzIEJvZHkge1xuXHRjb25zdHJ1Y3RvcihpbnB1dCwgaW5pdCA9IHt9KSB7XG5cdFx0bGV0IHBhcnNlZFVSTDtcblxuXHRcdC8vIE5vcm1hbGl6ZSBpbnB1dCBhbmQgZm9yY2UgVVJMIHRvIGJlIGVuY29kZWQgYXMgVVRGLTggKGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlLWZldGNoL25vZGUtZmV0Y2gvaXNzdWVzLzI0NSlcblx0XHRpZiAoaXNSZXF1ZXN0KGlucHV0KSkge1xuXHRcdFx0cGFyc2VkVVJMID0gbmV3IFVSTChpbnB1dC51cmwpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwYXJzZWRVUkwgPSBuZXcgVVJMKGlucHV0KTtcblx0XHRcdGlucHV0ID0ge307XG5cdFx0fVxuXG5cdFx0aWYgKHBhcnNlZFVSTC51c2VybmFtZSAhPT0gJycgfHwgcGFyc2VkVVJMLnBhc3N3b3JkICE9PSAnJykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgJHtwYXJzZWRVUkx9IGlzIGFuIHVybCB3aXRoIGVtYmVkZGVkIGNyZWRlbnRpYWxzLmApO1xuXHRcdH1cblxuXHRcdGxldCBtZXRob2QgPSBpbml0Lm1ldGhvZCB8fCBpbnB1dC5tZXRob2QgfHwgJ0dFVCc7XG5cdFx0aWYgKC9eKGRlbGV0ZXxnZXR8aGVhZHxvcHRpb25zfHBvc3R8cHV0KSQvaS50ZXN0KG1ldGhvZCkpIHtcblx0XHRcdG1ldGhvZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpO1xuXHRcdH1cblxuXHRcdGlmICghaXNSZXF1ZXN0KGluaXQpICYmICdkYXRhJyBpbiBpbml0KSB7XG5cdFx0XHRkb0JhZERhdGFXYXJuKCk7XG5cdFx0fVxuXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVxLW51bGwsIGVxZXFlcVxuXHRcdGlmICgoaW5pdC5ib2R5ICE9IG51bGwgfHwgKGlzUmVxdWVzdChpbnB1dCkgJiYgaW5wdXQuYm9keSAhPT0gbnVsbCkpICYmXG5cdFx0XHQobWV0aG9kID09PSAnR0VUJyB8fCBtZXRob2QgPT09ICdIRUFEJykpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlcXVlc3Qgd2l0aCBHRVQvSEVBRCBtZXRob2QgY2Fubm90IGhhdmUgYm9keScpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGlucHV0Qm9keSA9IGluaXQuYm9keSA/XG5cdFx0XHRpbml0LmJvZHkgOlxuXHRcdFx0KGlzUmVxdWVzdChpbnB1dCkgJiYgaW5wdXQuYm9keSAhPT0gbnVsbCA/XG5cdFx0XHRcdGNsb25lKGlucHV0KSA6XG5cdFx0XHRcdG51bGwpO1xuXG5cdFx0c3VwZXIoaW5wdXRCb2R5LCB7XG5cdFx0XHRzaXplOiBpbml0LnNpemUgfHwgaW5wdXQuc2l6ZSB8fCAwXG5cdFx0fSk7XG5cblx0XHRjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5pdC5oZWFkZXJzIHx8IGlucHV0LmhlYWRlcnMgfHwge30pO1xuXG5cdFx0aWYgKGlucHV0Qm9keSAhPT0gbnVsbCAmJiAhaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG5cdFx0XHRjb25zdCBjb250ZW50VHlwZSA9IGV4dHJhY3RDb250ZW50VHlwZShpbnB1dEJvZHksIHRoaXMpO1xuXHRcdFx0aWYgKGNvbnRlbnRUeXBlKSB7XG5cdFx0XHRcdGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCBjb250ZW50VHlwZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IHNpZ25hbCA9IGlzUmVxdWVzdChpbnB1dCkgP1xuXHRcdFx0aW5wdXQuc2lnbmFsIDpcblx0XHRcdG51bGw7XG5cdFx0aWYgKCdzaWduYWwnIGluIGluaXQpIHtcblx0XHRcdHNpZ25hbCA9IGluaXQuc2lnbmFsO1xuXHRcdH1cblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lcS1udWxsLCBlcWVxZXFcblx0XHRpZiAoc2lnbmFsICE9IG51bGwgJiYgIWlzQWJvcnRTaWduYWwoc2lnbmFsKSkge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgc2lnbmFsIHRvIGJlIGFuIGluc3RhbmNlb2YgQWJvcnRTaWduYWwgb3IgRXZlbnRUYXJnZXQnKTtcblx0XHR9XG5cblx0XHQvLyDCpzUuNCwgUmVxdWVzdCBjb25zdHJ1Y3RvciBzdGVwcywgc3RlcCAxNS4xXG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWVxLW51bGwsIGVxZXFlcVxuXHRcdGxldCByZWZlcnJlciA9IGluaXQucmVmZXJyZXIgPT0gbnVsbCA/IGlucHV0LnJlZmVycmVyIDogaW5pdC5yZWZlcnJlcjtcblx0XHRpZiAocmVmZXJyZXIgPT09ICcnKSB7XG5cdFx0XHQvLyDCpzUuNCwgUmVxdWVzdCBjb25zdHJ1Y3RvciBzdGVwcywgc3RlcCAxNS4yXG5cdFx0XHRyZWZlcnJlciA9ICduby1yZWZlcnJlcic7XG5cdFx0fSBlbHNlIGlmIChyZWZlcnJlcikge1xuXHRcdFx0Ly8gwqc1LjQsIFJlcXVlc3QgY29uc3RydWN0b3Igc3RlcHMsIHN0ZXAgMTUuMy4xLCAxNS4zLjJcblx0XHRcdGNvbnN0IHBhcnNlZFJlZmVycmVyID0gbmV3IFVSTChyZWZlcnJlcik7XG5cdFx0XHQvLyDCpzUuNCwgUmVxdWVzdCBjb25zdHJ1Y3RvciBzdGVwcywgc3RlcCAxNS4zLjMsIDE1LjMuNFxuXHRcdFx0cmVmZXJyZXIgPSAvXmFib3V0OihcXC9cXC8pP2NsaWVudCQvLnRlc3QocGFyc2VkUmVmZXJyZXIpID8gJ2NsaWVudCcgOiBwYXJzZWRSZWZlcnJlcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVmZXJyZXIgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0dGhpc1tJTlRFUk5BTFNdID0ge1xuXHRcdFx0bWV0aG9kLFxuXHRcdFx0cmVkaXJlY3Q6IGluaXQucmVkaXJlY3QgfHwgaW5wdXQucmVkaXJlY3QgfHwgJ2ZvbGxvdycsXG5cdFx0XHRoZWFkZXJzLFxuXHRcdFx0cGFyc2VkVVJMLFxuXHRcdFx0c2lnbmFsLFxuXHRcdFx0cmVmZXJyZXJcblx0XHR9O1xuXG5cdFx0Ly8gTm9kZS1mZXRjaC1vbmx5IG9wdGlvbnNcblx0XHR0aGlzLmZvbGxvdyA9IGluaXQuZm9sbG93ID09PSB1bmRlZmluZWQgPyAoaW5wdXQuZm9sbG93ID09PSB1bmRlZmluZWQgPyAyMCA6IGlucHV0LmZvbGxvdykgOiBpbml0LmZvbGxvdztcblx0XHR0aGlzLmNvbXByZXNzID0gaW5pdC5jb21wcmVzcyA9PT0gdW5kZWZpbmVkID8gKGlucHV0LmNvbXByZXNzID09PSB1bmRlZmluZWQgPyB0cnVlIDogaW5wdXQuY29tcHJlc3MpIDogaW5pdC5jb21wcmVzcztcblx0XHR0aGlzLmNvdW50ZXIgPSBpbml0LmNvdW50ZXIgfHwgaW5wdXQuY291bnRlciB8fCAwO1xuXHRcdHRoaXMuYWdlbnQgPSBpbml0LmFnZW50IHx8IGlucHV0LmFnZW50O1xuXHRcdHRoaXMuaGlnaFdhdGVyTWFyayA9IGluaXQuaGlnaFdhdGVyTWFyayB8fCBpbnB1dC5oaWdoV2F0ZXJNYXJrIHx8IDE2Mzg0O1xuXHRcdHRoaXMuaW5zZWN1cmVIVFRQUGFyc2VyID0gaW5pdC5pbnNlY3VyZUhUVFBQYXJzZXIgfHwgaW5wdXQuaW5zZWN1cmVIVFRQUGFyc2VyIHx8IGZhbHNlO1xuXG5cdFx0Ly8gwqc1LjQsIFJlcXVlc3QgY29uc3RydWN0b3Igc3RlcHMsIHN0ZXAgMTYuXG5cdFx0Ly8gRGVmYXVsdCBpcyBlbXB0eSBzdHJpbmcgcGVyIGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNjb25jZXB0LXJlcXVlc3QtcmVmZXJyZXItcG9saWN5XG5cdFx0dGhpcy5yZWZlcnJlclBvbGljeSA9IGluaXQucmVmZXJyZXJQb2xpY3kgfHwgaW5wdXQucmVmZXJyZXJQb2xpY3kgfHwgJyc7XG5cdH1cblxuXHQvKiogQHJldHVybnMge3N0cmluZ30gKi9cblx0Z2V0IG1ldGhvZCgpIHtcblx0XHRyZXR1cm4gdGhpc1tJTlRFUk5BTFNdLm1ldGhvZDtcblx0fVxuXG5cdC8qKiBAcmV0dXJucyB7c3RyaW5nfSAqL1xuXHRnZXQgdXJsKCkge1xuXHRcdHJldHVybiBmb3JtYXRVcmwodGhpc1tJTlRFUk5BTFNdLnBhcnNlZFVSTCk7XG5cdH1cblxuXHQvKiogQHJldHVybnMge0hlYWRlcnN9ICovXG5cdGdldCBoZWFkZXJzKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uaGVhZGVycztcblx0fVxuXG5cdGdldCByZWRpcmVjdCgpIHtcblx0XHRyZXR1cm4gdGhpc1tJTlRFUk5BTFNdLnJlZGlyZWN0O1xuXHR9XG5cblx0LyoqIEByZXR1cm5zIHtBYm9ydFNpZ25hbH0gKi9cblx0Z2V0IHNpZ25hbCgpIHtcblx0XHRyZXR1cm4gdGhpc1tJTlRFUk5BTFNdLnNpZ25hbDtcblx0fVxuXG5cdC8vIGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNkb20tcmVxdWVzdC1yZWZlcnJlclxuXHRnZXQgcmVmZXJyZXIoKSB7XG5cdFx0aWYgKHRoaXNbSU5URVJOQUxTXS5yZWZlcnJlciA9PT0gJ25vLXJlZmVycmVyJykge1xuXHRcdFx0cmV0dXJuICcnO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzW0lOVEVSTkFMU10ucmVmZXJyZXIgPT09ICdjbGllbnQnKSB7XG5cdFx0XHRyZXR1cm4gJ2Fib3V0OmNsaWVudCc7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXNbSU5URVJOQUxTXS5yZWZlcnJlcikge1xuXHRcdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTXS5yZWZlcnJlci50b1N0cmluZygpO1xuXHRcdH1cblxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRnZXQgcmVmZXJyZXJQb2xpY3koKSB7XG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTXS5yZWZlcnJlclBvbGljeTtcblx0fVxuXG5cdHNldCByZWZlcnJlclBvbGljeShyZWZlcnJlclBvbGljeSkge1xuXHRcdHRoaXNbSU5URVJOQUxTXS5yZWZlcnJlclBvbGljeSA9IHZhbGlkYXRlUmVmZXJyZXJQb2xpY3kocmVmZXJyZXJQb2xpY3kpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsb25lIHRoaXMgcmVxdWVzdFxuXHQgKlxuXHQgKiBAcmV0dXJuICBSZXF1ZXN0XG5cdCAqL1xuXHRjbG9uZSgpIHtcblx0XHRyZXR1cm4gbmV3IFJlcXVlc3QodGhpcyk7XG5cdH1cblxuXHRnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG5cdFx0cmV0dXJuICdSZXF1ZXN0Jztcblx0fVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhSZXF1ZXN0LnByb3RvdHlwZSwge1xuXHRtZXRob2Q6IHtlbnVtZXJhYmxlOiB0cnVlfSxcblx0dXJsOiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdGhlYWRlcnM6IHtlbnVtZXJhYmxlOiB0cnVlfSxcblx0cmVkaXJlY3Q6IHtlbnVtZXJhYmxlOiB0cnVlfSxcblx0Y2xvbmU6IHtlbnVtZXJhYmxlOiB0cnVlfSxcblx0c2lnbmFsOiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdHJlZmVycmVyOiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdHJlZmVycmVyUG9saWN5OiB7ZW51bWVyYWJsZTogdHJ1ZX1cbn0pO1xuXG4vKipcbiAqIENvbnZlcnQgYSBSZXF1ZXN0IHRvIE5vZGUuanMgaHR0cCByZXF1ZXN0IG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtSZXF1ZXN0fSByZXF1ZXN0IC0gQSBSZXF1ZXN0IGluc3RhbmNlXG4gKiBAcmV0dXJuIFRoZSBvcHRpb25zIG9iamVjdCB0byBiZSBwYXNzZWQgdG8gaHR0cC5yZXF1ZXN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXROb2RlUmVxdWVzdE9wdGlvbnMgPSByZXF1ZXN0ID0+IHtcblx0Y29uc3Qge3BhcnNlZFVSTH0gPSByZXF1ZXN0W0lOVEVSTkFMU107XG5cdGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhyZXF1ZXN0W0lOVEVSTkFMU10uaGVhZGVycyk7XG5cblx0Ly8gRmV0Y2ggc3RlcCAxLjNcblx0aWYgKCFoZWFkZXJzLmhhcygnQWNjZXB0JykpIHtcblx0XHRoZWFkZXJzLnNldCgnQWNjZXB0JywgJyovKicpO1xuXHR9XG5cblx0Ly8gSFRUUC1uZXR3b3JrLW9yLWNhY2hlIGZldGNoIHN0ZXBzIDIuNC0yLjdcblx0bGV0IGNvbnRlbnRMZW5ndGhWYWx1ZSA9IG51bGw7XG5cdGlmIChyZXF1ZXN0LmJvZHkgPT09IG51bGwgJiYgL14ocG9zdHxwdXQpJC9pLnRlc3QocmVxdWVzdC5tZXRob2QpKSB7XG5cdFx0Y29udGVudExlbmd0aFZhbHVlID0gJzAnO1xuXHR9XG5cblx0aWYgKHJlcXVlc3QuYm9keSAhPT0gbnVsbCkge1xuXHRcdGNvbnN0IHRvdGFsQnl0ZXMgPSBnZXRUb3RhbEJ5dGVzKHJlcXVlc3QpO1xuXHRcdC8vIFNldCBDb250ZW50LUxlbmd0aCBpZiB0b3RhbEJ5dGVzIGlzIGEgbnVtYmVyICh0aGF0IGlzIG5vdCBOYU4pXG5cdFx0aWYgKHR5cGVvZiB0b3RhbEJ5dGVzID09PSAnbnVtYmVyJyAmJiAhTnVtYmVyLmlzTmFOKHRvdGFsQnl0ZXMpKSB7XG5cdFx0XHRjb250ZW50TGVuZ3RoVmFsdWUgPSBTdHJpbmcodG90YWxCeXRlcyk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKGNvbnRlbnRMZW5ndGhWYWx1ZSkge1xuXHRcdGhlYWRlcnMuc2V0KCdDb250ZW50LUxlbmd0aCcsIGNvbnRlbnRMZW5ndGhWYWx1ZSk7XG5cdH1cblxuXHQvLyA0LjEuIE1haW4gZmV0Y2gsIHN0ZXAgMi42XG5cdC8vID4gSWYgcmVxdWVzdCdzIHJlZmVycmVyIHBvbGljeSBpcyB0aGUgZW1wdHkgc3RyaW5nLCB0aGVuIHNldCByZXF1ZXN0J3MgcmVmZXJyZXIgcG9saWN5IHRvIHRoZVxuXHQvLyA+IGRlZmF1bHQgcmVmZXJyZXIgcG9saWN5LlxuXHRpZiAocmVxdWVzdC5yZWZlcnJlclBvbGljeSA9PT0gJycpIHtcblx0XHRyZXF1ZXN0LnJlZmVycmVyUG9saWN5ID0gREVGQVVMVF9SRUZFUlJFUl9QT0xJQ1k7XG5cdH1cblxuXHQvLyA0LjEuIE1haW4gZmV0Y2gsIHN0ZXAgMi43XG5cdC8vID4gSWYgcmVxdWVzdCdzIHJlZmVycmVyIGlzIG5vdCBcIm5vLXJlZmVycmVyXCIsIHNldCByZXF1ZXN0J3MgcmVmZXJyZXIgdG8gdGhlIHJlc3VsdCBvZiBpbnZva2luZ1xuXHQvLyA+IGRldGVybWluZSByZXF1ZXN0J3MgcmVmZXJyZXIuXG5cdGlmIChyZXF1ZXN0LnJlZmVycmVyICYmIHJlcXVlc3QucmVmZXJyZXIgIT09ICduby1yZWZlcnJlcicpIHtcblx0XHRyZXF1ZXN0W0lOVEVSTkFMU10ucmVmZXJyZXIgPSBkZXRlcm1pbmVSZXF1ZXN0c1JlZmVycmVyKHJlcXVlc3QpO1xuXHR9IGVsc2Uge1xuXHRcdHJlcXVlc3RbSU5URVJOQUxTXS5yZWZlcnJlciA9ICduby1yZWZlcnJlcic7XG5cdH1cblxuXHQvLyA0LjUuIEhUVFAtbmV0d29yay1vci1jYWNoZSBmZXRjaCwgc3RlcCA2Ljlcblx0Ly8gPiBJZiBodHRwUmVxdWVzdCdzIHJlZmVycmVyIGlzIGEgVVJMLCB0aGVuIGFwcGVuZCBgUmVmZXJlcmAvaHR0cFJlcXVlc3QncyByZWZlcnJlciwgc2VyaWFsaXplZFxuXHQvLyA+ICBhbmQgaXNvbW9ycGhpYyBlbmNvZGVkLCB0byBodHRwUmVxdWVzdCdzIGhlYWRlciBsaXN0LlxuXHRpZiAocmVxdWVzdFtJTlRFUk5BTFNdLnJlZmVycmVyIGluc3RhbmNlb2YgVVJMKSB7XG5cdFx0aGVhZGVycy5zZXQoJ1JlZmVyZXInLCByZXF1ZXN0LnJlZmVycmVyKTtcblx0fVxuXG5cdC8vIEhUVFAtbmV0d29yay1vci1jYWNoZSBmZXRjaCBzdGVwIDIuMTFcblx0aWYgKCFoZWFkZXJzLmhhcygnVXNlci1BZ2VudCcpKSB7XG5cdFx0aGVhZGVycy5zZXQoJ1VzZXItQWdlbnQnLCAnbm9kZS1mZXRjaCcpO1xuXHR9XG5cblx0Ly8gSFRUUC1uZXR3b3JrLW9yLWNhY2hlIGZldGNoIHN0ZXAgMi4xNVxuXHRpZiAocmVxdWVzdC5jb21wcmVzcyAmJiAhaGVhZGVycy5oYXMoJ0FjY2VwdC1FbmNvZGluZycpKSB7XG5cdFx0aGVhZGVycy5zZXQoJ0FjY2VwdC1FbmNvZGluZycsICdnemlwLCBkZWZsYXRlLCBicicpO1xuXHR9XG5cblx0bGV0IHthZ2VudH0gPSByZXF1ZXN0O1xuXHRpZiAodHlwZW9mIGFnZW50ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0YWdlbnQgPSBhZ2VudChwYXJzZWRVUkwpO1xuXHR9XG5cblx0aWYgKCFoZWFkZXJzLmhhcygnQ29ubmVjdGlvbicpICYmICFhZ2VudCkge1xuXHRcdGhlYWRlcnMuc2V0KCdDb25uZWN0aW9uJywgJ2Nsb3NlJyk7XG5cdH1cblxuXHQvLyBIVFRQLW5ldHdvcmsgZmV0Y2ggc3RlcCA0LjJcblx0Ly8gY2h1bmtlZCBlbmNvZGluZyBpcyBoYW5kbGVkIGJ5IE5vZGUuanNcblxuXHRjb25zdCBzZWFyY2ggPSBnZXRTZWFyY2gocGFyc2VkVVJMKTtcblxuXHQvLyBQYXNzIHRoZSBmdWxsIFVSTCBkaXJlY3RseSB0byByZXF1ZXN0KCksIGJ1dCBvdmVyd3JpdGUgdGhlIGZvbGxvd2luZ1xuXHQvLyBvcHRpb25zOlxuXHRjb25zdCBvcHRpb25zID0ge1xuXHRcdC8vIE92ZXJ3cml0ZSBzZWFyY2ggdG8gcmV0YWluIHRyYWlsaW5nID8gKGlzc3VlICM3NzYpXG5cdFx0cGF0aDogcGFyc2VkVVJMLnBhdGhuYW1lICsgc2VhcmNoLFxuXHRcdC8vIFRoZSBmb2xsb3dpbmcgb3B0aW9ucyBhcmUgbm90IGV4cHJlc3NlZCBpbiB0aGUgVVJMXG5cdFx0bWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcblx0XHRoZWFkZXJzOiBoZWFkZXJzW1N5bWJvbC5mb3IoJ25vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tJyldKCksXG5cdFx0aW5zZWN1cmVIVFRQUGFyc2VyOiByZXF1ZXN0Lmluc2VjdXJlSFRUUFBhcnNlcixcblx0XHRhZ2VudFxuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0LyoqIEB0eXBlIHtVUkx9ICovXG5cdFx0cGFyc2VkVVJMLFxuXHRcdG9wdGlvbnNcblx0fTtcbn07XG4iLCIvKipcbiAqIFJlc3BvbnNlLmpzXG4gKlxuICogUmVzcG9uc2UgY2xhc3MgcHJvdmlkZXMgY29udGVudCBkZWNvZGluZ1xuICovXG5cbmltcG9ydCBIZWFkZXJzIGZyb20gJy4vaGVhZGVycy5qcyc7XG5pbXBvcnQgQm9keSwge2Nsb25lLCBleHRyYWN0Q29udGVudFR5cGV9IGZyb20gJy4vYm9keS5qcyc7XG5pbXBvcnQge2lzUmVkaXJlY3R9IGZyb20gJy4vdXRpbHMvaXMtcmVkaXJlY3QuanMnO1xuXG5jb25zdCBJTlRFUk5BTFMgPSBTeW1ib2woJ1Jlc3BvbnNlIGludGVybmFscycpO1xuXG4vKipcbiAqIFJlc3BvbnNlIGNsYXNzXG4gKlxuICogUmVmOiBodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jcmVzcG9uc2UtY2xhc3NcbiAqXG4gKiBAcGFyYW0gICBTdHJlYW0gIGJvZHkgIFJlYWRhYmxlIHN0cmVhbVxuICogQHBhcmFtICAgT2JqZWN0ICBvcHRzICBSZXNwb25zZSBvcHRpb25zXG4gKiBAcmV0dXJuICBWb2lkXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3BvbnNlIGV4dGVuZHMgQm9keSB7XG5cdGNvbnN0cnVjdG9yKGJvZHkgPSBudWxsLCBvcHRpb25zID0ge30pIHtcblx0XHRzdXBlcihib2R5LCBvcHRpb25zKTtcblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1lcS1udWxsLCBlcWVxZXEsIG5vLW5lZ2F0ZWQtY29uZGl0aW9uXG5cdFx0Y29uc3Qgc3RhdHVzID0gb3B0aW9ucy5zdGF0dXMgIT0gbnVsbCA/IG9wdGlvbnMuc3RhdHVzIDogMjAwO1xuXG5cdFx0Y29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycyk7XG5cblx0XHRpZiAoYm9keSAhPT0gbnVsbCAmJiAhaGVhZGVycy5oYXMoJ0NvbnRlbnQtVHlwZScpKSB7XG5cdFx0XHRjb25zdCBjb250ZW50VHlwZSA9IGV4dHJhY3RDb250ZW50VHlwZShib2R5LCB0aGlzKTtcblx0XHRcdGlmIChjb250ZW50VHlwZSkge1xuXHRcdFx0XHRoZWFkZXJzLmFwcGVuZCgnQ29udGVudC1UeXBlJywgY29udGVudFR5cGUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXNbSU5URVJOQUxTXSA9IHtcblx0XHRcdHR5cGU6ICdkZWZhdWx0Jyxcblx0XHRcdHVybDogb3B0aW9ucy51cmwsXG5cdFx0XHRzdGF0dXMsXG5cdFx0XHRzdGF0dXNUZXh0OiBvcHRpb25zLnN0YXR1c1RleHQgfHwgJycsXG5cdFx0XHRoZWFkZXJzLFxuXHRcdFx0Y291bnRlcjogb3B0aW9ucy5jb3VudGVyLFxuXHRcdFx0aGlnaFdhdGVyTWFyazogb3B0aW9ucy5oaWdoV2F0ZXJNYXJrXG5cdFx0fTtcblx0fVxuXG5cdGdldCB0eXBlKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10udHlwZTtcblx0fVxuXG5cdGdldCB1cmwoKSB7XG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTXS51cmwgfHwgJyc7XG5cdH1cblxuXHRnZXQgc3RhdHVzKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uc3RhdHVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlbmllbmNlIHByb3BlcnR5IHJlcHJlc2VudGluZyBpZiB0aGUgcmVxdWVzdCBlbmRlZCBub3JtYWxseVxuXHQgKi9cblx0Z2V0IG9rKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uc3RhdHVzID49IDIwMCAmJiB0aGlzW0lOVEVSTkFMU10uc3RhdHVzIDwgMzAwO1xuXHR9XG5cblx0Z2V0IHJlZGlyZWN0ZWQoKSB7XG5cdFx0cmV0dXJuIHRoaXNbSU5URVJOQUxTXS5jb3VudGVyID4gMDtcblx0fVxuXG5cdGdldCBzdGF0dXNUZXh0KCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uc3RhdHVzVGV4dDtcblx0fVxuXG5cdGdldCBoZWFkZXJzKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uaGVhZGVycztcblx0fVxuXG5cdGdldCBoaWdoV2F0ZXJNYXJrKCkge1xuXHRcdHJldHVybiB0aGlzW0lOVEVSTkFMU10uaGlnaFdhdGVyTWFyaztcblx0fVxuXG5cdC8qKlxuXHQgKiBDbG9uZSB0aGlzIHJlc3BvbnNlXG5cdCAqXG5cdCAqIEByZXR1cm4gIFJlc3BvbnNlXG5cdCAqL1xuXHRjbG9uZSgpIHtcblx0XHRyZXR1cm4gbmV3IFJlc3BvbnNlKGNsb25lKHRoaXMsIHRoaXMuaGlnaFdhdGVyTWFyayksIHtcblx0XHRcdHR5cGU6IHRoaXMudHlwZSxcblx0XHRcdHVybDogdGhpcy51cmwsXG5cdFx0XHRzdGF0dXM6IHRoaXMuc3RhdHVzLFxuXHRcdFx0c3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuXHRcdFx0aGVhZGVyczogdGhpcy5oZWFkZXJzLFxuXHRcdFx0b2s6IHRoaXMub2ssXG5cdFx0XHRyZWRpcmVjdGVkOiB0aGlzLnJlZGlyZWN0ZWQsXG5cdFx0XHRzaXplOiB0aGlzLnNpemUsXG5cdFx0XHRoaWdoV2F0ZXJNYXJrOiB0aGlzLmhpZ2hXYXRlck1hcmtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdXJsICAgIFRoZSBVUkwgdGhhdCB0aGUgbmV3IHJlc3BvbnNlIGlzIHRvIG9yaWdpbmF0ZSBmcm9tLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gc3RhdHVzIEFuIG9wdGlvbmFsIHN0YXR1cyBjb2RlIGZvciB0aGUgcmVzcG9uc2UgKGUuZy4sIDMwMi4pXG5cdCAqIEByZXR1cm5zIHtSZXNwb25zZX0gICAgQSBSZXNwb25zZSBvYmplY3QuXG5cdCAqL1xuXHRzdGF0aWMgcmVkaXJlY3QodXJsLCBzdGF0dXMgPSAzMDIpIHtcblx0XHRpZiAoIWlzUmVkaXJlY3Qoc3RhdHVzKSkge1xuXHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ZhaWxlZCB0byBleGVjdXRlIFwicmVkaXJlY3RcIiBvbiBcInJlc3BvbnNlXCI6IEludmFsaWQgc3RhdHVzIGNvZGUnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtcblx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0bG9jYXRpb246IG5ldyBVUkwodXJsKS50b1N0cmluZygpXG5cdFx0XHR9LFxuXHRcdFx0c3RhdHVzXG5cdFx0fSk7XG5cdH1cblxuXHRzdGF0aWMgZXJyb3IoKSB7XG5cdFx0Y29uc3QgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KTtcblx0XHRyZXNwb25zZVtJTlRFUk5BTFNdLnR5cGUgPSAnZXJyb3InO1xuXHRcdHJldHVybiByZXNwb25zZTtcblx0fVxuXG5cdHN0YXRpYyBqc29uKGRhdGEgPSB1bmRlZmluZWQsIGluaXQgPSB7fSkge1xuXHRcdGNvbnN0IGJvZHkgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcblxuXHRcdGlmIChib2R5ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ2RhdGEgaXMgbm90IEpTT04gc2VyaWFsaXphYmxlJyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaGVhZGVycyA9IG5ldyBIZWFkZXJzKGluaXQgJiYgaW5pdC5oZWFkZXJzKTtcblxuXHRcdGlmICghaGVhZGVycy5oYXMoJ2NvbnRlbnQtdHlwZScpKSB7XG5cdFx0XHRoZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIHtcblx0XHRcdC4uLmluaXQsXG5cdFx0XHRoZWFkZXJzXG5cdFx0fSk7XG5cdH1cblxuXHRnZXQgW1N5bWJvbC50b1N0cmluZ1RhZ10oKSB7XG5cdFx0cmV0dXJuICdSZXNwb25zZSc7XG5cdH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoUmVzcG9uc2UucHJvdG90eXBlLCB7XG5cdHR5cGU6IHtlbnVtZXJhYmxlOiB0cnVlfSxcblx0dXJsOiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdHN0YXR1czoge2VudW1lcmFibGU6IHRydWV9LFxuXHRvazoge2VudW1lcmFibGU6IHRydWV9LFxuXHRyZWRpcmVjdGVkOiB7ZW51bWVyYWJsZTogdHJ1ZX0sXG5cdHN0YXR1c1RleHQ6IHtlbnVtZXJhYmxlOiB0cnVlfSxcblx0aGVhZGVyczoge2VudW1lcmFibGU6IHRydWV9LFxuXHRjbG9uZToge2VudW1lcmFibGU6IHRydWV9XG59KTtcbiIsImV4cG9ydCBjb25zdCBnZXRTZWFyY2ggPSBwYXJzZWRVUkwgPT4ge1xuXHRpZiAocGFyc2VkVVJMLnNlYXJjaCkge1xuXHRcdHJldHVybiBwYXJzZWRVUkwuc2VhcmNoO1xuXHR9XG5cblx0Y29uc3QgbGFzdE9mZnNldCA9IHBhcnNlZFVSTC5ocmVmLmxlbmd0aCAtIDE7XG5cdGNvbnN0IGhhc2ggPSBwYXJzZWRVUkwuaGFzaCB8fCAocGFyc2VkVVJMLmhyZWZbbGFzdE9mZnNldF0gPT09ICcjJyA/ICcjJyA6ICcnKTtcblx0cmV0dXJuIHBhcnNlZFVSTC5ocmVmW2xhc3RPZmZzZXQgLSBoYXNoLmxlbmd0aF0gPT09ICc/JyA/ICc/JyA6ICcnO1xufTtcbiIsImNvbnN0IHJlZGlyZWN0U3RhdHVzID0gbmV3IFNldChbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdKTtcblxuLyoqXG4gKiBSZWRpcmVjdCBjb2RlIG1hdGNoaW5nXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IGNvZGUgLSBTdGF0dXMgY29kZVxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGNvbnN0IGlzUmVkaXJlY3QgPSBjb2RlID0+IHtcblx0cmV0dXJuIHJlZGlyZWN0U3RhdHVzLmhhcyhjb2RlKTtcbn07XG4iLCIvKipcbiAqIElzLmpzXG4gKlxuICogT2JqZWN0IHR5cGUgY2hlY2tzLlxuICovXG5cbmNvbnN0IE5BTUUgPSBTeW1ib2wudG9TdHJpbmdUYWc7XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKiByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlLWZldGNoL25vZGUtZmV0Y2gvaXNzdWVzLzI5NiNpc3N1ZWNvbW1lbnQtMzA3NTk4MTQzXG4gKiBAcGFyYW0geyp9IG9iamVjdCAtIE9iamVjdCB0byBjaGVjayBmb3JcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBjb25zdCBpc1VSTFNlYXJjaFBhcmFtZXRlcnMgPSBvYmplY3QgPT4ge1xuXHRyZXR1cm4gKFxuXHRcdHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmXG5cdFx0dHlwZW9mIG9iamVjdC5hcHBlbmQgPT09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2Ygb2JqZWN0LmRlbGV0ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBvYmplY3QuZ2V0ID09PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIG9iamVjdC5nZXRBbGwgPT09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2Ygb2JqZWN0LmhhcyA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBvYmplY3Quc2V0ID09PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIG9iamVjdC5zb3J0ID09PSAnZnVuY3Rpb24nICYmXG5cdFx0b2JqZWN0W05BTUVdID09PSAnVVJMU2VhcmNoUGFyYW1zJ1xuXHQpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqZWN0YCBpcyBhIFczQyBgQmxvYmAgb2JqZWN0ICh3aGljaCBgRmlsZWAgaW5oZXJpdHMgZnJvbSlcbiAqIEBwYXJhbSB7Kn0gb2JqZWN0IC0gT2JqZWN0IHRvIGNoZWNrIGZvclxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZXhwb3J0IGNvbnN0IGlzQmxvYiA9IG9iamVjdCA9PiB7XG5cdHJldHVybiAoXG5cdFx0b2JqZWN0ICYmXG5cdFx0dHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcblx0XHR0eXBlb2Ygb2JqZWN0LmFycmF5QnVmZmVyID09PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIG9iamVjdC50eXBlID09PSAnc3RyaW5nJyAmJlxuXHRcdHR5cGVvZiBvYmplY3Quc3RyZWFtID09PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdC9eKEJsb2J8RmlsZSkkLy50ZXN0KG9iamVjdFtOQU1FXSlcblx0KTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gaW5zdGFuY2Ugb2YgQWJvcnRTaWduYWwuXG4gKiBAcGFyYW0geyp9IG9iamVjdCAtIE9iamVjdCB0byBjaGVjayBmb3JcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBjb25zdCBpc0Fib3J0U2lnbmFsID0gb2JqZWN0ID0+IHtcblx0cmV0dXJuIChcblx0XHR0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiAoXG5cdFx0XHRvYmplY3RbTkFNRV0gPT09ICdBYm9ydFNpZ25hbCcgfHxcblx0XHRcdG9iamVjdFtOQU1FXSA9PT0gJ0V2ZW50VGFyZ2V0J1xuXHRcdClcblx0KTtcbn07XG5cbi8qKlxuICogaXNEb21haW5PclN1YmRvbWFpbiByZXBvcnRzIHdoZXRoZXIgc3ViIGlzIGEgc3ViZG9tYWluIChvciBleGFjdCBtYXRjaCkgb2ZcbiAqIHRoZSBwYXJlbnQgZG9tYWluLlxuICpcbiAqIEJvdGggZG9tYWlucyBtdXN0IGFscmVhZHkgYmUgaW4gY2Fub25pY2FsIGZvcm0uXG4gKiBAcGFyYW0ge3N0cmluZ3xVUkx9IG9yaWdpbmFsXG4gKiBAcGFyYW0ge3N0cmluZ3xVUkx9IGRlc3RpbmF0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBpc0RvbWFpbk9yU3ViZG9tYWluID0gKGRlc3RpbmF0aW9uLCBvcmlnaW5hbCkgPT4ge1xuXHRjb25zdCBvcmlnID0gbmV3IFVSTChvcmlnaW5hbCkuaG9zdG5hbWU7XG5cdGNvbnN0IGRlc3QgPSBuZXcgVVJMKGRlc3RpbmF0aW9uKS5ob3N0bmFtZTtcblxuXHRyZXR1cm4gb3JpZyA9PT0gZGVzdCB8fCBvcmlnLmVuZHNXaXRoKGAuJHtkZXN0fWApO1xufTtcblxuLyoqXG4gKiBpc1NhbWVQcm90b2NvbCByZXBvcnRzIHdoZXRoZXIgdGhlIHR3byBwcm92aWRlZCBVUkxzIHVzZSB0aGUgc2FtZSBwcm90b2NvbC5cbiAqXG4gKiBCb3RoIGRvbWFpbnMgbXVzdCBhbHJlYWR5IGJlIGluIGNhbm9uaWNhbCBmb3JtLlxuICogQHBhcmFtIHtzdHJpbmd8VVJMfSBvcmlnaW5hbFxuICogQHBhcmFtIHtzdHJpbmd8VVJMfSBkZXN0aW5hdGlvblxuICovXG5leHBvcnQgY29uc3QgaXNTYW1lUHJvdG9jb2wgPSAoZGVzdGluYXRpb24sIG9yaWdpbmFsKSA9PiB7XG5cdGNvbnN0IG9yaWcgPSBuZXcgVVJMKG9yaWdpbmFsKS5wcm90b2NvbDtcblx0Y29uc3QgZGVzdCA9IG5ldyBVUkwoZGVzdGluYXRpb24pLnByb3RvY29sO1xuXG5cdHJldHVybiBvcmlnID09PSBkZXN0O1xufTtcbiIsImltcG9ydCB7aXNJUH0gZnJvbSAnbm9kZTpuZXQnO1xuXG4vKipcbiAqIEBleHRlcm5hbCBVUkxcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9VUkx8VVJMfVxuICovXG5cbi8qKlxuICogQG1vZHVsZSB1dGlscy9yZWZlcnJlclxuICogQHByaXZhdGVcbiAqL1xuXG4vKipcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby93ZWJhcHBzZWMtcmVmZXJyZXItcG9saWN5LyNzdHJpcC11cmx8UmVmZXJyZXIgUG9saWN5IMKnOC40LiBTdHJpcCB1cmwgZm9yIHVzZSBhcyBhIHJlZmVycmVyfVxuICogQHBhcmFtIHtzdHJpbmd9IFVSTFxuICogQHBhcmFtIHtib29sZWFufSBbb3JpZ2luT25seT1mYWxzZV1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwVVJMRm9yVXNlQXNBUmVmZXJyZXIodXJsLCBvcmlnaW5Pbmx5ID0gZmFsc2UpIHtcblx0Ly8gMS4gSWYgdXJsIGlzIG51bGwsIHJldHVybiBubyByZWZlcnJlci5cblx0aWYgKHVybCA9PSBudWxsKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZXEtbnVsbCwgZXFlcWVxXG5cdFx0cmV0dXJuICduby1yZWZlcnJlcic7XG5cdH1cblxuXHR1cmwgPSBuZXcgVVJMKHVybCk7XG5cblx0Ly8gMi4gSWYgdXJsJ3Mgc2NoZW1lIGlzIGEgbG9jYWwgc2NoZW1lLCB0aGVuIHJldHVybiBubyByZWZlcnJlci5cblx0aWYgKC9eKGFib3V0fGJsb2J8ZGF0YSk6JC8udGVzdCh1cmwucHJvdG9jb2wpKSB7XG5cdFx0cmV0dXJuICduby1yZWZlcnJlcic7XG5cdH1cblxuXHQvLyAzLiBTZXQgdXJsJ3MgdXNlcm5hbWUgdG8gdGhlIGVtcHR5IHN0cmluZy5cblx0dXJsLnVzZXJuYW1lID0gJyc7XG5cblx0Ly8gNC4gU2V0IHVybCdzIHBhc3N3b3JkIHRvIG51bGwuXG5cdC8vIE5vdGU6IGBudWxsYCBhcHBlYXJzIHRvIGJlIGEgbWlzdGFrZSBhcyB0aGlzIGFjdHVhbGx5IHJlc3VsdHMgaW4gdGhlIHBhc3N3b3JkIGJlaW5nIGBcIm51bGxcImAuXG5cdHVybC5wYXNzd29yZCA9ICcnO1xuXG5cdC8vIDUuIFNldCB1cmwncyBmcmFnbWVudCB0byBudWxsLlxuXHQvLyBOb3RlOiBgbnVsbGAgYXBwZWFycyB0byBiZSBhIG1pc3Rha2UgYXMgdGhpcyBhY3R1YWxseSByZXN1bHRzIGluIHRoZSBmcmFnbWVudCBiZWluZyBgXCIjbnVsbFwiYC5cblx0dXJsLmhhc2ggPSAnJztcblxuXHQvLyA2LiBJZiB0aGUgb3JpZ2luLW9ubHkgZmxhZyBpcyB0cnVlLCB0aGVuOlxuXHRpZiAob3JpZ2luT25seSkge1xuXHRcdC8vIDYuMS4gU2V0IHVybCdzIHBhdGggdG8gbnVsbC5cblx0XHQvLyBOb3RlOiBgbnVsbGAgYXBwZWFycyB0byBiZSBhIG1pc3Rha2UgYXMgdGhpcyBhY3R1YWxseSByZXN1bHRzIGluIHRoZSBwYXRoIGJlaW5nIGBcIi9udWxsXCJgLlxuXHRcdHVybC5wYXRobmFtZSA9ICcnO1xuXG5cdFx0Ly8gNi4yLiBTZXQgdXJsJ3MgcXVlcnkgdG8gbnVsbC5cblx0XHQvLyBOb3RlOiBgbnVsbGAgYXBwZWFycyB0byBiZSBhIG1pc3Rha2UgYXMgdGhpcyBhY3R1YWxseSByZXN1bHRzIGluIHRoZSBxdWVyeSBiZWluZyBgXCI/bnVsbFwiYC5cblx0XHR1cmwuc2VhcmNoID0gJyc7XG5cdH1cblxuXHQvLyA3LiBSZXR1cm4gdXJsLlxuXHRyZXR1cm4gdXJsO1xufVxuXG4vKipcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby93ZWJhcHBzZWMtcmVmZXJyZXItcG9saWN5LyNlbnVtZGVmLXJlZmVycmVycG9saWN5fGVudW0gUmVmZXJyZXJQb2xpY3l9XG4gKi9cbmV4cG9ydCBjb25zdCBSZWZlcnJlclBvbGljeSA9IG5ldyBTZXQoW1xuXHQnJyxcblx0J25vLXJlZmVycmVyJyxcblx0J25vLXJlZmVycmVyLXdoZW4tZG93bmdyYWRlJyxcblx0J3NhbWUtb3JpZ2luJyxcblx0J29yaWdpbicsXG5cdCdzdHJpY3Qtb3JpZ2luJyxcblx0J29yaWdpbi13aGVuLWNyb3NzLW9yaWdpbicsXG5cdCdzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJyxcblx0J3Vuc2FmZS11cmwnXG5dKTtcblxuLyoqXG4gKiBAc2VlIHtAbGluayBodHRwczovL3czYy5naXRodWIuaW8vd2ViYXBwc2VjLXJlZmVycmVyLXBvbGljeS8jZGVmYXVsdC1yZWZlcnJlci1wb2xpY3l8ZGVmYXVsdCByZWZlcnJlciBwb2xpY3l9XG4gKi9cbmV4cG9ydCBjb25zdCBERUZBVUxUX1JFRkVSUkVSX1BPTElDWSA9ICdzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJztcblxuLyoqXG4gKiBAc2VlIHtAbGluayBodHRwczovL3czYy5naXRodWIuaW8vd2ViYXBwc2VjLXJlZmVycmVyLXBvbGljeS8jcmVmZXJyZXItcG9saWNpZXN8UmVmZXJyZXIgUG9saWN5IMKnMy4gUmVmZXJyZXIgUG9saWNpZXN9XG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmZXJyZXJQb2xpY3lcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHJlZmVycmVyUG9saWN5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVJlZmVycmVyUG9saWN5KHJlZmVycmVyUG9saWN5KSB7XG5cdGlmICghUmVmZXJyZXJQb2xpY3kuaGFzKHJlZmVycmVyUG9saWN5KSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgcmVmZXJyZXJQb2xpY3k6ICR7cmVmZXJyZXJQb2xpY3l9YCk7XG5cdH1cblxuXHRyZXR1cm4gcmVmZXJyZXJQb2xpY3k7XG59XG5cbi8qKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYmFwcHNlYy1zZWN1cmUtY29udGV4dHMvI2lzLW9yaWdpbi10cnVzdHdvcnRoeXxSZWZlcnJlciBQb2xpY3kgwqczLjIuIElzIG9yaWdpbiBwb3RlbnRpYWxseSB0cnVzdHdvcnRoeT99XG4gKiBAcGFyYW0ge2V4dGVybmFsOlVSTH0gdXJsXG4gKiBAcmV0dXJucyBgdHJ1ZWA6IFwiUG90ZW50aWFsbHkgVHJ1c3R3b3J0aHlcIiwgYGZhbHNlYDogXCJOb3QgVHJ1c3R3b3J0aHlcIlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNPcmlnaW5Qb3RlbnRpYWxseVRydXN0d29ydGh5KHVybCkge1xuXHQvLyAxLiBJZiBvcmlnaW4gaXMgYW4gb3BhcXVlIG9yaWdpbiwgcmV0dXJuIFwiTm90IFRydXN0d29ydGh5XCIuXG5cdC8vIE5vdCBhcHBsaWNhYmxlXG5cblx0Ly8gMi4gQXNzZXJ0OiBvcmlnaW4gaXMgYSB0dXBsZSBvcmlnaW4uXG5cdC8vIE5vdCBmb3IgaW1wbGVtZW50YXRpb25zXG5cblx0Ly8gMy4gSWYgb3JpZ2luJ3Mgc2NoZW1lIGlzIGVpdGhlciBcImh0dHBzXCIgb3IgXCJ3c3NcIiwgcmV0dXJuIFwiUG90ZW50aWFsbHkgVHJ1c3R3b3J0aHlcIi5cblx0aWYgKC9eKGh0dHB8d3MpczokLy50ZXN0KHVybC5wcm90b2NvbCkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIDQuIElmIG9yaWdpbidzIGhvc3QgY29tcG9uZW50IG1hdGNoZXMgb25lIG9mIHRoZSBDSURSIG5vdGF0aW9ucyAxMjcuMC4wLjAvOCBvciA6OjEvMTI4IFtSRkM0NjMyXSwgcmV0dXJuIFwiUG90ZW50aWFsbHkgVHJ1c3R3b3J0aHlcIi5cblx0Y29uc3QgaG9zdElwID0gdXJsLmhvc3QucmVwbGFjZSgvKF5cXFspfChdJCkvZywgJycpO1xuXHRjb25zdCBob3N0SVBWZXJzaW9uID0gaXNJUChob3N0SXApO1xuXG5cdGlmIChob3N0SVBWZXJzaW9uID09PSA0ICYmIC9eMTI3XFwuLy50ZXN0KGhvc3RJcCkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChob3N0SVBWZXJzaW9uID09PSA2ICYmIC9eKCgoMCs6KXs3fSl8KDo6KDArOil7MCw2fSkpMCoxJC8udGVzdChob3N0SXApKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyA1LiBJZiBvcmlnaW4ncyBob3N0IGNvbXBvbmVudCBpcyBcImxvY2FsaG9zdFwiIG9yIGZhbGxzIHdpdGhpbiBcIi5sb2NhbGhvc3RcIiwgYW5kIHRoZSB1c2VyIGFnZW50IGNvbmZvcm1zIHRvIHRoZSBuYW1lIHJlc29sdXRpb24gcnVsZXMgaW4gW2xldC1sb2NhbGhvc3QtYmUtbG9jYWxob3N0XSwgcmV0dXJuIFwiUG90ZW50aWFsbHkgVHJ1c3R3b3J0aHlcIi5cblx0Ly8gV2UgYXJlIHJldHVybmluZyBGQUxTRSBoZXJlIGJlY2F1c2Ugd2UgY2Fubm90IGVuc3VyZSBjb25mb3JtYW5jZSB0b1xuXHQvLyBsZXQtbG9jYWxob3N0LWJlLWxvYWxob3N0IChodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtd2VzdC1sZXQtbG9jYWxob3N0LWJlLWxvY2FsaG9zdClcblx0aWYgKHVybC5ob3N0ID09PSAnbG9jYWxob3N0JyB8fCB1cmwuaG9zdC5lbmRzV2l0aCgnLmxvY2FsaG9zdCcpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gNi4gSWYgb3JpZ2luJ3Mgc2NoZW1lIGNvbXBvbmVudCBpcyBmaWxlLCByZXR1cm4gXCJQb3RlbnRpYWxseSBUcnVzdHdvcnRoeVwiLlxuXHRpZiAodXJsLnByb3RvY29sID09PSAnZmlsZTonKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyA3LiBJZiBvcmlnaW4ncyBzY2hlbWUgY29tcG9uZW50IGlzIG9uZSB3aGljaCB0aGUgdXNlciBhZ2VudCBjb25zaWRlcnMgdG8gYmUgYXV0aGVudGljYXRlZCwgcmV0dXJuIFwiUG90ZW50aWFsbHkgVHJ1c3R3b3J0aHlcIi5cblx0Ly8gTm90IHN1cHBvcnRlZFxuXG5cdC8vIDguIElmIG9yaWdpbiBoYXMgYmVlbiBjb25maWd1cmVkIGFzIGEgdHJ1c3R3b3J0aHkgb3JpZ2luLCByZXR1cm4gXCJQb3RlbnRpYWxseSBUcnVzdHdvcnRoeVwiLlxuXHQvLyBOb3Qgc3VwcG9ydGVkXG5cblx0Ly8gOS4gUmV0dXJuIFwiTm90IFRydXN0d29ydGh5XCIuXG5cdHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBAc2VlIHtAbGluayBodHRwczovL3czYy5naXRodWIuaW8vd2ViYXBwc2VjLXNlY3VyZS1jb250ZXh0cy8jaXMtdXJsLXRydXN0d29ydGh5fFJlZmVycmVyIFBvbGljeSDCpzMuMy4gSXMgdXJsIHBvdGVudGlhbGx5IHRydXN0d29ydGh5P31cbiAqIEBwYXJhbSB7ZXh0ZXJuYWw6VVJMfSB1cmxcbiAqIEByZXR1cm5zIGB0cnVlYDogXCJQb3RlbnRpYWxseSBUcnVzdHdvcnRoeVwiLCBgZmFsc2VgOiBcIk5vdCBUcnVzdHdvcnRoeVwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1VybFBvdGVudGlhbGx5VHJ1c3R3b3J0aHkodXJsKSB7XG5cdC8vIDEuIElmIHVybCBpcyBcImFib3V0OmJsYW5rXCIgb3IgXCJhYm91dDpzcmNkb2NcIiwgcmV0dXJuIFwiUG90ZW50aWFsbHkgVHJ1c3R3b3J0aHlcIi5cblx0aWYgKC9eYWJvdXQ6KGJsYW5rfHNyY2RvYykkLy50ZXN0KHVybCkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIDIuIElmIHVybCdzIHNjaGVtZSBpcyBcImRhdGFcIiwgcmV0dXJuIFwiUG90ZW50aWFsbHkgVHJ1c3R3b3J0aHlcIi5cblx0aWYgKHVybC5wcm90b2NvbCA9PT0gJ2RhdGE6Jykge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gTm90ZTogVGhlIG9yaWdpbiBvZiBibG9iOiBhbmQgZmlsZXN5c3RlbTogVVJMcyBpcyB0aGUgb3JpZ2luIG9mIHRoZSBjb250ZXh0IGluIHdoaWNoIHRoZXkgd2VyZVxuXHQvLyBjcmVhdGVkLiBUaGVyZWZvcmUsIGJsb2JzIGNyZWF0ZWQgaW4gYSB0cnVzdHdvcnRoeSBvcmlnaW4gd2lsbCB0aGVtc2VsdmVzIGJlIHBvdGVudGlhbGx5XG5cdC8vIHRydXN0d29ydGh5LlxuXHRpZiAoL14oYmxvYnxmaWxlc3lzdGVtKTokLy50ZXN0KHVybC5wcm90b2NvbCkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIDMuIFJldHVybiB0aGUgcmVzdWx0IG9mIGV4ZWN1dGluZyDCpzMuMiBJcyBvcmlnaW4gcG90ZW50aWFsbHkgdHJ1c3R3b3J0aHk/IG9uIHVybCdzIG9yaWdpbi5cblx0cmV0dXJuIGlzT3JpZ2luUG90ZW50aWFsbHlUcnVzdHdvcnRoeSh1cmwpO1xufVxuXG4vKipcbiAqIE1vZGlmaWVzIHRoZSByZWZlcnJlclVSTCB0byBlbmZvcmNlIGFueSBleHRyYSBzZWN1cml0eSBwb2xpY3kgY29uc2lkZXJhdGlvbnMuXG4gKiBAc2VlIHtAbGluayBodHRwczovL3czYy5naXRodWIuaW8vd2ViYXBwc2VjLXJlZmVycmVyLXBvbGljeS8jZGV0ZXJtaW5lLXJlcXVlc3RzLXJlZmVycmVyfFJlZmVycmVyIFBvbGljeSDCpzguMy4gRGV0ZXJtaW5lIHJlcXVlc3QncyBSZWZlcnJlcn0sIHN0ZXAgN1xuICogQGNhbGxiYWNrIG1vZHVsZTp1dGlscy9yZWZlcnJlcn5yZWZlcnJlclVSTENhbGxiYWNrXG4gKiBAcGFyYW0ge2V4dGVybmFsOlVSTH0gcmVmZXJyZXJVUkxcbiAqIEByZXR1cm5zIHtleHRlcm5hbDpVUkx9IG1vZGlmaWVkIHJlZmVycmVyVVJMXG4gKi9cblxuLyoqXG4gKiBNb2RpZmllcyB0aGUgcmVmZXJyZXJPcmlnaW4gdG8gZW5mb3JjZSBhbnkgZXh0cmEgc2VjdXJpdHkgcG9saWN5IGNvbnNpZGVyYXRpb25zLlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYmFwcHNlYy1yZWZlcnJlci1wb2xpY3kvI2RldGVybWluZS1yZXF1ZXN0cy1yZWZlcnJlcnxSZWZlcnJlciBQb2xpY3kgwqc4LjMuIERldGVybWluZSByZXF1ZXN0J3MgUmVmZXJyZXJ9LCBzdGVwIDdcbiAqIEBjYWxsYmFjayBtb2R1bGU6dXRpbHMvcmVmZXJyZXJ+cmVmZXJyZXJPcmlnaW5DYWxsYmFja1xuICogQHBhcmFtIHtleHRlcm5hbDpVUkx9IHJlZmVycmVyT3JpZ2luXG4gKiBAcmV0dXJucyB7ZXh0ZXJuYWw6VVJMfSBtb2RpZmllZCByZWZlcnJlck9yaWdpblxuICovXG5cbi8qKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYmFwcHNlYy1yZWZlcnJlci1wb2xpY3kvI2RldGVybWluZS1yZXF1ZXN0cy1yZWZlcnJlcnxSZWZlcnJlciBQb2xpY3kgwqc4LjMuIERldGVybWluZSByZXF1ZXN0J3MgUmVmZXJyZXJ9XG4gKiBAcGFyYW0ge1JlcXVlc3R9IHJlcXVlc3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBvXG4gKiBAcGFyYW0ge21vZHVsZTp1dGlscy9yZWZlcnJlcn5yZWZlcnJlclVSTENhbGxiYWNrfSBvLnJlZmVycmVyVVJMQ2FsbGJhY2tcbiAqIEBwYXJhbSB7bW9kdWxlOnV0aWxzL3JlZmVycmVyfnJlZmVycmVyT3JpZ2luQ2FsbGJhY2t9IG8ucmVmZXJyZXJPcmlnaW5DYWxsYmFja1xuICogQHJldHVybnMge2V4dGVybmFsOlVSTH0gUmVxdWVzdCdzIHJlZmVycmVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmVSZXF1ZXN0c1JlZmVycmVyKHJlcXVlc3QsIHtyZWZlcnJlclVSTENhbGxiYWNrLCByZWZlcnJlck9yaWdpbkNhbGxiYWNrfSA9IHt9KSB7XG5cdC8vIFRoZXJlIGFyZSAyIG5vdGVzIGluIHRoZSBzcGVjaWZpY2F0aW9uIGFib3V0IGludmFsaWQgcHJlLWNvbmRpdGlvbnMuICBXZSByZXR1cm4gbnVsbCwgaGVyZSwgZm9yXG5cdC8vIHRoZXNlIGNhc2VzOlxuXHQvLyA+IE5vdGU6IElmIHJlcXVlc3QncyByZWZlcnJlciBpcyBcIm5vLXJlZmVycmVyXCIsIEZldGNoIHdpbGwgbm90IGNhbGwgaW50byB0aGlzIGFsZ29yaXRobS5cblx0Ly8gPiBOb3RlOiBJZiByZXF1ZXN0J3MgcmVmZXJyZXIgcG9saWN5IGlzIHRoZSBlbXB0eSBzdHJpbmcsIEZldGNoIHdpbGwgbm90IGNhbGwgaW50byB0aGlzXG5cdC8vID4gYWxnb3JpdGhtLlxuXHRpZiAocmVxdWVzdC5yZWZlcnJlciA9PT0gJ25vLXJlZmVycmVyJyB8fCByZXF1ZXN0LnJlZmVycmVyUG9saWN5ID09PSAnJykge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0Ly8gMS4gTGV0IHBvbGljeSBiZSByZXF1ZXN0J3MgYXNzb2NpYXRlZCByZWZlcnJlciBwb2xpY3kuXG5cdGNvbnN0IHBvbGljeSA9IHJlcXVlc3QucmVmZXJyZXJQb2xpY3k7XG5cblx0Ly8gMi4gTGV0IGVudmlyb25tZW50IGJlIHJlcXVlc3QncyBjbGllbnQuXG5cdC8vIG5vdCBhcHBsaWNhYmxlIHRvIG5vZGUuanNcblxuXHQvLyAzLiBTd2l0Y2ggb24gcmVxdWVzdCdzIHJlZmVycmVyOlxuXHRpZiAocmVxdWVzdC5yZWZlcnJlciA9PT0gJ2Fib3V0OmNsaWVudCcpIHtcblx0XHRyZXR1cm4gJ25vLXJlZmVycmVyJztcblx0fVxuXG5cdC8vIFwiYSBVUkxcIjogTGV0IHJlZmVycmVyU291cmNlIGJlIHJlcXVlc3QncyByZWZlcnJlci5cblx0Y29uc3QgcmVmZXJyZXJTb3VyY2UgPSByZXF1ZXN0LnJlZmVycmVyO1xuXG5cdC8vIDQuIExldCByZXF1ZXN0J3MgcmVmZXJyZXJVUkwgYmUgdGhlIHJlc3VsdCBvZiBzdHJpcHBpbmcgcmVmZXJyZXJTb3VyY2UgZm9yIHVzZSBhcyBhIHJlZmVycmVyLlxuXHRsZXQgcmVmZXJyZXJVUkwgPSBzdHJpcFVSTEZvclVzZUFzQVJlZmVycmVyKHJlZmVycmVyU291cmNlKTtcblxuXHQvLyA1LiBMZXQgcmVmZXJyZXJPcmlnaW4gYmUgdGhlIHJlc3VsdCBvZiBzdHJpcHBpbmcgcmVmZXJyZXJTb3VyY2UgZm9yIHVzZSBhcyBhIHJlZmVycmVyLCB3aXRoIHRoZVxuXHQvLyAgICBvcmlnaW4tb25seSBmbGFnIHNldCB0byB0cnVlLlxuXHRsZXQgcmVmZXJyZXJPcmlnaW4gPSBzdHJpcFVSTEZvclVzZUFzQVJlZmVycmVyKHJlZmVycmVyU291cmNlLCB0cnVlKTtcblxuXHQvLyA2LiBJZiB0aGUgcmVzdWx0IG9mIHNlcmlhbGl6aW5nIHJlZmVycmVyVVJMIGlzIGEgc3RyaW5nIHdob3NlIGxlbmd0aCBpcyBncmVhdGVyIHRoYW4gNDA5Niwgc2V0XG5cdC8vICAgIHJlZmVycmVyVVJMIHRvIHJlZmVycmVyT3JpZ2luLlxuXHRpZiAocmVmZXJyZXJVUkwudG9TdHJpbmcoKS5sZW5ndGggPiA0MDk2KSB7XG5cdFx0cmVmZXJyZXJVUkwgPSByZWZlcnJlck9yaWdpbjtcblx0fVxuXG5cdC8vIDcuIFRoZSB1c2VyIGFnZW50IE1BWSBhbHRlciByZWZlcnJlclVSTCBvciByZWZlcnJlck9yaWdpbiBhdCB0aGlzIHBvaW50IHRvIGVuZm9yY2UgYXJiaXRyYXJ5XG5cdC8vICAgIHBvbGljeSBjb25zaWRlcmF0aW9ucyBpbiB0aGUgaW50ZXJlc3RzIG9mIG1pbmltaXppbmcgZGF0YSBsZWFrYWdlLiBGb3IgZXhhbXBsZSwgdGhlIHVzZXJcblx0Ly8gICAgYWdlbnQgY291bGQgc3RyaXAgdGhlIFVSTCBkb3duIHRvIGFuIG9yaWdpbiwgbW9kaWZ5IGl0cyBob3N0LCByZXBsYWNlIGl0IHdpdGggYW4gZW1wdHlcblx0Ly8gICAgc3RyaW5nLCBldGMuXG5cdGlmIChyZWZlcnJlclVSTENhbGxiYWNrKSB7XG5cdFx0cmVmZXJyZXJVUkwgPSByZWZlcnJlclVSTENhbGxiYWNrKHJlZmVycmVyVVJMKTtcblx0fVxuXG5cdGlmIChyZWZlcnJlck9yaWdpbkNhbGxiYWNrKSB7XG5cdFx0cmVmZXJyZXJPcmlnaW4gPSByZWZlcnJlck9yaWdpbkNhbGxiYWNrKHJlZmVycmVyT3JpZ2luKTtcblx0fVxuXG5cdC8vIDguRXhlY3V0ZSB0aGUgc3RhdGVtZW50cyBjb3JyZXNwb25kaW5nIHRvIHRoZSB2YWx1ZSBvZiBwb2xpY3k6XG5cdGNvbnN0IGN1cnJlbnRVUkwgPSBuZXcgVVJMKHJlcXVlc3QudXJsKTtcblxuXHRzd2l0Y2ggKHBvbGljeSkge1xuXHRcdGNhc2UgJ25vLXJlZmVycmVyJzpcblx0XHRcdHJldHVybiAnbm8tcmVmZXJyZXInO1xuXG5cdFx0Y2FzZSAnb3JpZ2luJzpcblx0XHRcdHJldHVybiByZWZlcnJlck9yaWdpbjtcblxuXHRcdGNhc2UgJ3Vuc2FmZS11cmwnOlxuXHRcdFx0cmV0dXJuIHJlZmVycmVyVVJMO1xuXG5cdFx0Y2FzZSAnc3RyaWN0LW9yaWdpbic6XG5cdFx0XHQvLyAxLiBJZiByZWZlcnJlclVSTCBpcyBhIHBvdGVudGlhbGx5IHRydXN0d29ydGh5IFVSTCBhbmQgcmVxdWVzdCdzIGN1cnJlbnQgVVJMIGlzIG5vdCBhXG5cdFx0XHQvLyAgICBwb3RlbnRpYWxseSB0cnVzdHdvcnRoeSBVUkwsIHRoZW4gcmV0dXJuIG5vIHJlZmVycmVyLlxuXHRcdFx0aWYgKGlzVXJsUG90ZW50aWFsbHlUcnVzdHdvcnRoeShyZWZlcnJlclVSTCkgJiYgIWlzVXJsUG90ZW50aWFsbHlUcnVzdHdvcnRoeShjdXJyZW50VVJMKSkge1xuXHRcdFx0XHRyZXR1cm4gJ25vLXJlZmVycmVyJztcblx0XHRcdH1cblxuXHRcdFx0Ly8gMi4gUmV0dXJuIHJlZmVycmVyT3JpZ2luLlxuXHRcdFx0cmV0dXJuIHJlZmVycmVyT3JpZ2luLnRvU3RyaW5nKCk7XG5cblx0XHRjYXNlICdzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJzpcblx0XHRcdC8vIDEuIElmIHRoZSBvcmlnaW4gb2YgcmVmZXJyZXJVUkwgYW5kIHRoZSBvcmlnaW4gb2YgcmVxdWVzdCdzIGN1cnJlbnQgVVJMIGFyZSB0aGUgc2FtZSwgdGhlblxuXHRcdFx0Ly8gICAgcmV0dXJuIHJlZmVycmVyVVJMLlxuXHRcdFx0aWYgKHJlZmVycmVyVVJMLm9yaWdpbiA9PT0gY3VycmVudFVSTC5vcmlnaW4pIHtcblx0XHRcdFx0cmV0dXJuIHJlZmVycmVyVVJMO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyAyLiBJZiByZWZlcnJlclVSTCBpcyBhIHBvdGVudGlhbGx5IHRydXN0d29ydGh5IFVSTCBhbmQgcmVxdWVzdCdzIGN1cnJlbnQgVVJMIGlzIG5vdCBhXG5cdFx0XHQvLyAgICBwb3RlbnRpYWxseSB0cnVzdHdvcnRoeSBVUkwsIHRoZW4gcmV0dXJuIG5vIHJlZmVycmVyLlxuXHRcdFx0aWYgKGlzVXJsUG90ZW50aWFsbHlUcnVzdHdvcnRoeShyZWZlcnJlclVSTCkgJiYgIWlzVXJsUG90ZW50aWFsbHlUcnVzdHdvcnRoeShjdXJyZW50VVJMKSkge1xuXHRcdFx0XHRyZXR1cm4gJ25vLXJlZmVycmVyJztcblx0XHRcdH1cblxuXHRcdFx0Ly8gMy4gUmV0dXJuIHJlZmVycmVyT3JpZ2luLlxuXHRcdFx0cmV0dXJuIHJlZmVycmVyT3JpZ2luO1xuXG5cdFx0Y2FzZSAnc2FtZS1vcmlnaW4nOlxuXHRcdFx0Ly8gMS4gSWYgdGhlIG9yaWdpbiBvZiByZWZlcnJlclVSTCBhbmQgdGhlIG9yaWdpbiBvZiByZXF1ZXN0J3MgY3VycmVudCBVUkwgYXJlIHRoZSBzYW1lLCB0aGVuXG5cdFx0XHQvLyAgICByZXR1cm4gcmVmZXJyZXJVUkwuXG5cdFx0XHRpZiAocmVmZXJyZXJVUkwub3JpZ2luID09PSBjdXJyZW50VVJMLm9yaWdpbikge1xuXHRcdFx0XHRyZXR1cm4gcmVmZXJyZXJVUkw7XG5cdFx0XHR9XG5cblx0XHRcdC8vIDIuIFJldHVybiBubyByZWZlcnJlci5cblx0XHRcdHJldHVybiAnbm8tcmVmZXJyZXInO1xuXG5cdFx0Y2FzZSAnb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJzpcblx0XHRcdC8vIDEuIElmIHRoZSBvcmlnaW4gb2YgcmVmZXJyZXJVUkwgYW5kIHRoZSBvcmlnaW4gb2YgcmVxdWVzdCdzIGN1cnJlbnQgVVJMIGFyZSB0aGUgc2FtZSwgdGhlblxuXHRcdFx0Ly8gICAgcmV0dXJuIHJlZmVycmVyVVJMLlxuXHRcdFx0aWYgKHJlZmVycmVyVVJMLm9yaWdpbiA9PT0gY3VycmVudFVSTC5vcmlnaW4pIHtcblx0XHRcdFx0cmV0dXJuIHJlZmVycmVyVVJMO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZXR1cm4gcmVmZXJyZXJPcmlnaW4uXG5cdFx0XHRyZXR1cm4gcmVmZXJyZXJPcmlnaW47XG5cblx0XHRjYXNlICduby1yZWZlcnJlci13aGVuLWRvd25ncmFkZSc6XG5cdFx0XHQvLyAxLiBJZiByZWZlcnJlclVSTCBpcyBhIHBvdGVudGlhbGx5IHRydXN0d29ydGh5IFVSTCBhbmQgcmVxdWVzdCdzIGN1cnJlbnQgVVJMIGlzIG5vdCBhXG5cdFx0XHQvLyAgICBwb3RlbnRpYWxseSB0cnVzdHdvcnRoeSBVUkwsIHRoZW4gcmV0dXJuIG5vIHJlZmVycmVyLlxuXHRcdFx0aWYgKGlzVXJsUG90ZW50aWFsbHlUcnVzdHdvcnRoeShyZWZlcnJlclVSTCkgJiYgIWlzVXJsUG90ZW50aWFsbHlUcnVzdHdvcnRoeShjdXJyZW50VVJMKSkge1xuXHRcdFx0XHRyZXR1cm4gJ25vLXJlZmVycmVyJztcblx0XHRcdH1cblxuXHRcdFx0Ly8gMi4gUmV0dXJuIHJlZmVycmVyVVJMLlxuXHRcdFx0cmV0dXJuIHJlZmVycmVyVVJMO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgcmVmZXJyZXJQb2xpY3k6ICR7cG9saWN5fWApO1xuXHR9XG59XG5cbi8qKlxuICogQHNlZSB7QGxpbmsgaHR0cHM6Ly93M2MuZ2l0aHViLmlvL3dlYmFwcHNlYy1yZWZlcnJlci1wb2xpY3kvI3BhcnNlLXJlZmVycmVyLXBvbGljeS1mcm9tLWhlYWRlcnxSZWZlcnJlciBQb2xpY3kgwqc4LjEuIFBhcnNlIGEgcmVmZXJyZXIgcG9saWN5IGZyb20gYSBSZWZlcnJlci1Qb2xpY3kgaGVhZGVyfVxuICogQHBhcmFtIHtIZWFkZXJzfSBoZWFkZXJzIFJlc3BvbnNlIGhlYWRlcnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHBvbGljeVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VSZWZlcnJlclBvbGljeUZyb21IZWFkZXIoaGVhZGVycykge1xuXHQvLyAxLiBMZXQgcG9saWN5LXRva2VucyBiZSB0aGUgcmVzdWx0IG9mIGV4dHJhY3RpbmcgaGVhZGVyIGxpc3QgdmFsdWVzIGdpdmVuIGBSZWZlcnJlci1Qb2xpY3lgXG5cdC8vICAgIGFuZCByZXNwb25zZeKAmXMgaGVhZGVyIGxpc3QuXG5cdGNvbnN0IHBvbGljeVRva2VucyA9IChoZWFkZXJzLmdldCgncmVmZXJyZXItcG9saWN5JykgfHwgJycpLnNwbGl0KC9bLFxcc10rLyk7XG5cblx0Ly8gMi4gTGV0IHBvbGljeSBiZSB0aGUgZW1wdHkgc3RyaW5nLlxuXHRsZXQgcG9saWN5ID0gJyc7XG5cblx0Ly8gMy4gRm9yIGVhY2ggdG9rZW4gaW4gcG9saWN5LXRva2VucywgaWYgdG9rZW4gaXMgYSByZWZlcnJlciBwb2xpY3kgYW5kIHRva2VuIGlzIG5vdCB0aGUgZW1wdHlcblx0Ly8gICAgc3RyaW5nLCB0aGVuIHNldCBwb2xpY3kgdG8gdG9rZW4uXG5cdC8vIE5vdGU6IFRoaXMgYWxnb3JpdGhtIGxvb3BzIG92ZXIgbXVsdGlwbGUgcG9saWN5IHZhbHVlcyB0byBhbGxvdyBkZXBsb3ltZW50IG9mIG5ldyBwb2xpY3lcblx0Ly8gdmFsdWVzIHdpdGggZmFsbGJhY2tzIGZvciBvbGRlciB1c2VyIGFnZW50cywgYXMgZGVzY3JpYmVkIGluIMKnIDExLjEgVW5rbm93biBQb2xpY3kgVmFsdWVzLlxuXHRmb3IgKGNvbnN0IHRva2VuIG9mIHBvbGljeVRva2Vucykge1xuXHRcdGlmICh0b2tlbiAmJiBSZWZlcnJlclBvbGljeS5oYXModG9rZW4pKSB7XG5cdFx0XHRwb2xpY3kgPSB0b2tlbjtcblx0XHR9XG5cdH1cblxuXHQvLyA0LiBSZXR1cm4gcG9saWN5LlxuXHRyZXR1cm4gcG9saWN5O1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmYgPSB7fTtcbi8vIFRoaXMgZmlsZSBjb250YWlucyBvbmx5IHRoZSBlbnRyeSBjaHVuay5cbi8vIFRoZSBjaHVuayBsb2FkaW5nIGZ1bmN0aW9uIGZvciBhZGRpdGlvbmFsIGNodW5rc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5lID0gKGNodW5rSWQpID0+IHtcblx0cmV0dXJuIFByb21pc2UuYWxsKE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uZikucmVkdWNlKChwcm9taXNlcywga2V5KSA9PiB7XG5cdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5mW2tleV0oY2h1bmtJZCwgcHJvbWlzZXMpO1xuXHRcdHJldHVybiBwcm9taXNlcztcblx0fSwgW10pKTtcbn07IiwiLy8gVGhpcyBmdW5jdGlvbiBhbGxvdyB0byByZWZlcmVuY2UgYXN5bmMgY2h1bmtzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnUgPSAoY2h1bmtJZCkgPT4ge1xuXHQvLyByZXR1cm4gdXJsIGZvciBmaWxlbmFtZXMgYmFzZWQgb24gdGVtcGxhdGVcblx0cmV0dXJuIFwiXCIgKyBjaHVua0lkICsgXCIubWFpbi5qc1wiO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCJ2YXIgaW5Qcm9ncmVzcyA9IHt9O1xudmFyIGRhdGFXZWJwYWNrUHJlZml4ID0gXCJqc29ucGFyc2VyOlwiO1xuLy8gbG9hZFNjcmlwdCBmdW5jdGlvbiB0byBsb2FkIGEgc2NyaXB0IHZpYSBzY3JpcHQgdGFnXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmwgPSAodXJsLCBkb25lLCBrZXksIGNodW5rSWQpID0+IHtcblx0aWYoaW5Qcm9ncmVzc1t1cmxdKSB7IGluUHJvZ3Jlc3NbdXJsXS5wdXNoKGRvbmUpOyByZXR1cm47IH1cblx0dmFyIHNjcmlwdCwgbmVlZEF0dGFjaDtcblx0aWYoa2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgcyA9IHNjcmlwdHNbaV07XG5cdFx0XHRpZihzLmdldEF0dHJpYnV0ZShcInNyY1wiKSA9PSB1cmwgfHwgcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIikgPT0gZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpIHsgc2NyaXB0ID0gczsgYnJlYWs7IH1cblx0XHR9XG5cdH1cblx0aWYoIXNjcmlwdCkge1xuXHRcdG5lZWRBdHRhY2ggPSB0cnVlO1xuXHRcdHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG5cdFx0c2NyaXB0LmNoYXJzZXQgPSAndXRmLTgnO1xuXHRcdHNjcmlwdC50aW1lb3V0ID0gMTIwO1xuXHRcdGlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLm5jKSB7XG5cdFx0XHRzY3JpcHQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgX193ZWJwYWNrX3JlcXVpcmVfXy5uYyk7XG5cdFx0fVxuXHRcdHNjcmlwdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdlYnBhY2tcIiwgZGF0YVdlYnBhY2tQcmVmaXggKyBrZXkpO1xuXHRcdHNjcmlwdC5zcmMgPSB1cmw7XG5cdH1cblx0aW5Qcm9ncmVzc1t1cmxdID0gW2RvbmVdO1xuXHR2YXIgb25TY3JpcHRDb21wbGV0ZSA9IChwcmV2LCBldmVudCkgPT4ge1xuXHRcdC8vIGF2b2lkIG1lbSBsZWFrcyBpbiBJRS5cblx0XHRzY3JpcHQub25lcnJvciA9IHNjcmlwdC5vbmxvYWQgPSBudWxsO1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblx0XHR2YXIgZG9uZUZucyA9IGluUHJvZ3Jlc3NbdXJsXTtcblx0XHRkZWxldGUgaW5Qcm9ncmVzc1t1cmxdO1xuXHRcdHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG5cdFx0ZG9uZUZucyAmJiBkb25lRm5zLmZvckVhY2goKGZuKSA9PiAoZm4oZXZlbnQpKSk7XG5cdFx0aWYocHJldikgcmV0dXJuIHByZXYoZXZlbnQpO1xuXHR9O1xuXHR2YXIgdGltZW91dCA9IHNldFRpbWVvdXQob25TY3JpcHRDb21wbGV0ZS5iaW5kKG51bGwsIHVuZGVmaW5lZCwgeyB0eXBlOiAndGltZW91dCcsIHRhcmdldDogc2NyaXB0IH0pLCAxMjAwMDApO1xuXHRzY3JpcHQub25lcnJvciA9IG9uU2NyaXB0Q29tcGxldGUuYmluZChudWxsLCBzY3JpcHQub25lcnJvcik7XG5cdHNjcmlwdC5vbmxvYWQgPSBvblNjcmlwdENvbXBsZXRlLmJpbmQobnVsbCwgc2NyaXB0Lm9ubG9hZCk7XG5cdG5lZWRBdHRhY2ggJiYgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpO1xufTsiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5mLmogPSAoY2h1bmtJZCwgcHJvbWlzZXMpID0+IHtcblx0XHQvLyBKU09OUCBjaHVuayBsb2FkaW5nIGZvciBqYXZhc2NyaXB0XG5cdFx0dmFyIGluc3RhbGxlZENodW5rRGF0YSA9IF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpID8gaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdIDogdW5kZWZpbmVkO1xuXHRcdGlmKGluc3RhbGxlZENodW5rRGF0YSAhPT0gMCkgeyAvLyAwIG1lYW5zIFwiYWxyZWFkeSBpbnN0YWxsZWRcIi5cblxuXHRcdFx0Ly8gYSBQcm9taXNlIG1lYW5zIFwiY3VycmVudGx5IGxvYWRpbmdcIi5cblx0XHRcdGlmKGluc3RhbGxlZENodW5rRGF0YSkge1xuXHRcdFx0XHRwcm9taXNlcy5wdXNoKGluc3RhbGxlZENodW5rRGF0YVsyXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZih0cnVlKSB7IC8vIGFsbCBjaHVua3MgaGF2ZSBKU1xuXHRcdFx0XHRcdC8vIHNldHVwIFByb21pc2UgaW4gY2h1bmsgY2FjaGVcblx0XHRcdFx0XHR2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IChpbnN0YWxsZWRDaHVua0RhdGEgPSBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSBbcmVzb2x2ZSwgcmVqZWN0XSkpO1xuXHRcdFx0XHRcdHByb21pc2VzLnB1c2goaW5zdGFsbGVkQ2h1bmtEYXRhWzJdID0gcHJvbWlzZSk7XG5cblx0XHRcdFx0XHQvLyBzdGFydCBjaHVuayBsb2FkaW5nXG5cdFx0XHRcdFx0dmFyIHVybCA9IF9fd2VicGFja19yZXF1aXJlX18ucCArIF9fd2VicGFja19yZXF1aXJlX18udShjaHVua0lkKTtcblx0XHRcdFx0XHQvLyBjcmVhdGUgZXJyb3IgYmVmb3JlIHN0YWNrIHVud291bmQgdG8gZ2V0IHVzZWZ1bCBzdGFja3RyYWNlIGxhdGVyXG5cdFx0XHRcdFx0dmFyIGVycm9yID0gbmV3IEVycm9yKCk7XG5cdFx0XHRcdFx0dmFyIGxvYWRpbmdFbmRlZCA9IChldmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkpIHtcblx0XHRcdFx0XHRcdFx0aW5zdGFsbGVkQ2h1bmtEYXRhID0gaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdO1xuXHRcdFx0XHRcdFx0XHRpZihpbnN0YWxsZWRDaHVua0RhdGEgIT09IDApIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0aWYoaW5zdGFsbGVkQ2h1bmtEYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0dmFyIGVycm9yVHlwZSA9IGV2ZW50ICYmIChldmVudC50eXBlID09PSAnbG9hZCcgPyAnbWlzc2luZycgOiBldmVudC50eXBlKTtcblx0XHRcdFx0XHRcdFx0XHR2YXIgcmVhbFNyYyA9IGV2ZW50ICYmIGV2ZW50LnRhcmdldCAmJiBldmVudC50YXJnZXQuc3JjO1xuXHRcdFx0XHRcdFx0XHRcdGVycm9yLm1lc3NhZ2UgPSAnTG9hZGluZyBjaHVuayAnICsgY2h1bmtJZCArICcgZmFpbGVkLlxcbignICsgZXJyb3JUeXBlICsgJzogJyArIHJlYWxTcmMgKyAnKSc7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IubmFtZSA9ICdDaHVua0xvYWRFcnJvcic7XG5cdFx0XHRcdFx0XHRcdFx0ZXJyb3IudHlwZSA9IGVycm9yVHlwZTtcblx0XHRcdFx0XHRcdFx0XHRlcnJvci5yZXF1ZXN0ID0gcmVhbFNyYztcblx0XHRcdFx0XHRcdFx0XHRpbnN0YWxsZWRDaHVua0RhdGFbMV0oZXJyb3IpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmwodXJsLCBsb2FkaW5nRW5kZWQsIFwiY2h1bmstXCIgKyBjaHVua0lkLCBjaHVua0lkKTtcblx0XHRcdFx0fSBlbHNlIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdFx0XHR9XG5cdFx0fVxufTtcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuLy8gbm8gb24gY2h1bmtzIGxvYWRlZFxuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblxufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gdGhpc1tcIndlYnBhY2tDaHVua2pzb25wYXJzZXJcIl0gPSB0aGlzW1wid2VicGFja0NodW5ranNvbnBhcnNlclwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcGFyc2VyLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9