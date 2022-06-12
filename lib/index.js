const { randomBytes } = require('crypto');
const { promisify } = require('util');

const getRandomBytes = promisify(randomBytes);

const getQueueName = queueName => queueName || 'default';

const generateJobId = () => getRandomBytes(12).then(buf => buf.toString('hex'));

const noop = () => {};

function normalizeDate(date) {
  if (date instanceof Date) {
    return normalizeDate(date.getTime());
  }

  // Normalizing all invalid timestamp values
  // to undefined
  if (!Number.isFinite(date)) {
    return undefined;
  }

  // This solution conforms to Ruby's `Time.now#to_f`
  // which is heavily used in Sidekiq
  return Number.isInteger(date) ? date / 1000 : date;
}

class Sidekiq {
  constructor(redisConnection, namespace = 'sidekiq') {
    this.redisConnection = redisConnection;
    this.namespace = namespace;
  }

  namespaceKey(key) {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  getQueueKey(queueName) {
    return this.namespaceKey(`queue:${getQueueName(queueName)}`);
  }

  async enqueue(workerClass, args = [], options = {}) {
    const jid = await generateJobId();

    const task = {
      ...options,
      class: workerClass,
      args,
      jid,
    };

    task.at = normalizeDate(task.at);
    if (Number.isFinite(task.at)) {
      await this.redisConnection.zAdd(
        this.namespaceKey('schedule'),
        task.at,
        JSON.stringify(task)
      );

      return task;
    }

    task.enqueued_at = normalizeDate(Date.now());
    await this.redisConnection.lPush(this.getQueueKey(task.queue), JSON.stringify(task));
    await this.redisConnection.sAdd(this.namespaceKey('queues'), getQueueName(task.queue));

    return task;
  }

  dequeue(task) {
    const payload = JSON.stringify(task);

    const promise = Number.isFinite(payload.at)
      ? this.redisConnection.zRem(this.namespaceKey('schedule'), payload)
      : this.redisConnection.lRem(this.getQueueKey(task.queue), 0, payload);

    return promise.then(noop);
  }

};

module.exports = Sidekiq;
