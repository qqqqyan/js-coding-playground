// Minimal Promise happy path, following the proposed design.
// Deliberately excludes chaining, catch, and full Promise/A+ behavior.

class Promise {
  constructor(fn) {
    this.state = 'pending';
    this.value = undefined;
    this.promiseCallback = undefined;

    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.value = value;
      this.state = 'resolved';
      this.notify();
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.value = reason;
      this.state = 'rejected';
    };

    fn(resolve, reject);
  }

  then(resolveCallback) {
    this.promiseCallback = resolveCallback;
    this.notify();
  }

  notify() {
    if (this.state === 'resolved' && this.promiseCallback) {
      const callback = this.promiseCallback;
      this.promiseCallback = undefined;
      queueMicrotask(() => callback(this.value));
    }
  }
}

module.exports = Promise;
