import test from 'tape';
import profiler from './index.js';

test('Should profile a callback based function', (t) => {
    t.plan(2);
    const tolerance = 3; 
    const testDuration = 50;
    const testResponse = {};
    const testFn = callback => {
        setTimeout(() => {callback(null, testResponse)}, testDuration);
    };
    const testCallback = (err, result) => {
        t.equal(result, testResponse, 'Original callback is executed')
    }

    const reporter = (duration) => {
        t.assert(Math.abs(duration - testDuration) <= tolerance, 'Duration measurement is within tolerance');
    }

    const profiledFn = profiler(testFn, reporter);

    profiledFn(testCallback);
});

test('Should profile a promise based function', (t) => {
    t.plan(2);
    const tolerance = 3; 
    const testDuration = 50;
    const testResponse = {};
    const testFn = () => {
        return new Promise(resolve => {
            setTimeout(() => {resolve(testResponse)}, testDuration);
        });
    };
    
    const reporter = (duration) => {
        t.assert(Math.abs(duration - testDuration) <= tolerance, 'Duration measurement is within tolerance');
    }

    Promise.resolve()
        .then(profiler(testFn, reporter))
        .then(result => t.equal(result, testResponse, 'Promise chain is continued'));
});

test('Should profile a promise based function that rejects', (t) => {
    t.plan(2);
    const tolerance = 3; 
    const testDuration = 50;
    const testReason = {};
    const testFn = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {reject(testReason)}, testDuration);
        });
    };
    
    const reporter = (duration) => {
        t.assert(Math.abs(duration - testDuration) <= tolerance, 'Duration measurement is within tolerance');
    }

    Promise.resolve()
        .then(profiler(testFn, reporter))
        .catch(() => t.pass('Promise chain is rejected'));
});

test('Should profile a normal function', (t) => {
    t.plan(2);
    const tolerance = 3; 
    const testDuration = 50;
    const testResponse = {};
    const testFn = function () {
        let start = Date.now();
        while(Date.now() < start + testDuration ) {};
        return testResponse;
    };
    
    const reporter = (duration) => {
        t.assert(Math.abs(duration - testDuration) <= tolerance, 'Duration measurement is within tolerance');
    }

    const profiledFn = profiler(testFn, reporter)

    t.equal(profiledFn(), testResponse, 'Returns correct value');
});

test('Should profile an object method', (t) => {
    t.plan(2);
    const tolerance = 3; 
    const testDuration = 50;
    const testObj = {
        testResponse:{},
        testFn: function () {
            let start = Date.now();
            while(Date.now() < start + testDuration ) {};
            return this.testResponse;
        }
    };
    
    const reporter = (duration) => {
        t.assert(Math.abs(duration - testDuration) <= tolerance, 'Duration measurement is within tolerance');
    }

    testObj.profiledFn = profiler(testObj.testFn, reporter)

    t.equal(testObj.profiledFn(), testObj.testResponse, 'Returns correct value');
});