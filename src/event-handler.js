(function (factory) {
    module.exports = exports = factory(
        require('rx-lite')
    );
}(function (Rx) {
    return {
        create: function () {
            function subject (value) {
                subject.onNext(value);
            }

            /* eslint-disable guard-for-in */
            for (var key in Rx.Subject.prototype) {
                subject[key] = Rx.Subject.prototype[key];
            }
            /* eslint-enable guard-for-in */

            Rx.Subject.call(subject);

            return subject;
        }
    };
}));
