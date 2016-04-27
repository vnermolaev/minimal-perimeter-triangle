// Type definitions for AVA 0.6
// Project: https://github.com/sindresorhus/ava
// Definitions by: Wouter Kuijper <wouter.kuijper@nedap.com>
// Definitions: TBD

declare module "ava" {

interface TestCtx {
    plan(n: number);
    end();
    pass(msg?: string);
    fail(msg?: string);
    ok(value: any, msg?: string);
    notOk(value: any, msg?: string);
    true(value: any, msg?: string);
    false(value: any, msg?: string);
    is(value: any, expected: any, msg?: string);
    not(value: any, expected: any, msg?: string);
    same(value: any, expected: any, msg?: string);
    notSame(value: any, expected: any, msg?: string);
    throws(functionOrPromise: any, error: any, msg?: string);
}

interface Test {
    (title: string, body: (t: TestCtx)=>void);
    (body: (t: TestCtx)=>void);
    serial(body: (t: TestCtx)=>void);
    serial(title: string, body: (t: TestCtx)=>void);
    only(body: (t: TestCtx)=>void);
    only(title: string, body: (t: TestCtx)=>void);
    skip(body: (t: TestCtx)=>void);
    skip(title: string, body: (t: TestCtx)=>void);
    before(body: (t: TestCtx)=>void);
    before(title: string, body: (t: TestCtx)=>void);
    after(body: (t: TestCtx)=>void);
    after(title: string, body: (t: TestCtx)=>void);
    beforeEach(body: (t: TestCtx)=>void);
    beforeEach(title: string, body: (t: TestCtx)=>void);
    afterEach(body: (t: TestCtx)=>void);
    afterEach(title: string, body: (t: TestCtx)=>void);
}

function test(title: string, body: (t: TestCtx)=>void);
function test(body: (t: TestCtx)=>void);

module test {
    function serial(body: (t: TestCtx)=>void);
    function serial(title: string, body: (t: TestCtx)=>void);
    function only(body: (t: TestCtx)=>void);
    function only(title: string, body: (t: TestCtx)=>void);
    function skip(body: (t: TestCtx)=>void);
    function skip(title: string, body: (t: TestCtx)=>void);
    function before(body: (t: TestCtx)=>void);
    function before(title: string, body: (t: TestCtx)=>void);
    function after(body: (t: TestCtx)=>void);
    function after(title: string, body: (t: TestCtx)=>void);
    function beforeEach(body: (t: TestCtx)=>void);
    function beforeEach(title: string, body: (t: TestCtx)=>void);
    function afterEach(body: (t: TestCtx)=>void);
    function afterEach(title: string, body: (t: TestCtx)=>void);
}

    export = test;
}

