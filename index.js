export default (originalFn, reporter, timer) => {
    if(typeof reporter !== 'function') {
        reporter = (duration) => console.log('Function call duration(' + originalFn.name + '): ' + duration);
    }
    if(typeof timer !== 'function') {
        timer = Date.now;
    }

    return function () {
        const hasCallback = (typeof arguments[arguments.length - 1] === 'function');
        const context = this;
        const startTime = timer();
        const report = () => reporter(timer() - startTime);
        
        if (hasCallback) {
            const originalCallback = arguments[arguments.length - 1];
            arguments[arguments.length - 1] = function () {
                report();
                originalCallback.apply(null, arguments);
            }
        }

        const result = originalFn.apply(context, arguments);

        if (!hasCallback) {
            if (isThenable(result)) {
                result.then(report, report);
            } else {
                report();
            }
        }

        return result;
    }
}

const isThenable = value => !!value && typeof value.then === 'function';