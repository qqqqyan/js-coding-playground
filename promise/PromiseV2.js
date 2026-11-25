// Promise V2: multiple .then callbacks, rejection, .catch, and chaining.
// A learning implementation; it does not yet adopt returned Promises/thenables.

class PromiseV2 {
  constructor(fn) {
    this.state = 'pending';
    this.value = undefined;
    this.callbacks = [];

    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.state = 'fulfilled';
      this.value = value;
      this.notify();
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.value = reason;
      this.notify();
    };

    try {
      fn(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(resolveCallback, rejectedCallback) {
    return new PromiseV2((resolve, reject) => {
      // This executor runs immediately. It registers a reaction on
      // the current Promise; it does NOT immediately resolve the new one.
      this.callbacks.push({
        onFulfilled: resolveCallback,
        onRejected: rejectedCallback,
        resolve,
        reject,
      });
      this.notify();
    });
  }

  catch(rejectedCallback) {
    return this.then(undefined, rejectedCallback);
  }

  notify() {
    if (this.state === 'pending') return;

    const callbacks = this.callbacks.splice(0);
    for (const reaction of callbacks) {
      queueMicrotask(() => {
        const handler =
          this.state === 'fulfilled'
            ? reaction.onFulfilled
            : reaction.onRejected;

        if (typeof handler !== 'function') {
          if (this.state === 'fulfilled') reaction.resolve(this.value);
          else reaction.reject(this.value);
          return;
        }

        try {
          const result = handler(this.value);
          reaction.resolve(result);
        } catch (error) {
          reaction.reject(error);
        }
      });
    }
  }
}

module.exports = PromiseV2;
