Add Jobs to Sidekiq from Node.js
================================

Enqueue jobs to sidekiq from your node apps. Closely mirrors the official 
ruby sidekiq interface and supports job scheduling.


Installation
------------

```shell
npm install sidekiq --save
```


Usage
-----

```javascript
// Require the module
const Sidekiq = require('@imcrazytwkr/node-sidekiq');

// Or import it
import Sidekiq from '@imcrazytwkr/node-sidekiq';

// Construct a sidekiq object with your redis connection and optional namespace
const sidekiq = new Sidekiq(redisCon, process.env.NODE_ENV);

// Add a job to sidekiq (returns task options object with Job ID)
const task = await sidekiq.enqueue('WorkerClass', ['argument', 'array'], {
    retry: false,
    queue: 'critical',
});

// Schedule a job in sidekiq (also returns task options object with Job ID)
const task = await sidekiq.enqueue('WorkerClass', ['some', 'args'], {
    at: new Date(2013, 11, 1),
});

// Cancel any job you have previously started
await sidekiq.dequeue('WorkerClass', task);
```


Reporting Bugs or Feature Requests
----------------------------------

Please report any bugs or feature requests on the github issues page for this
project here:

[https://github.com/imcrazytwkr/node-sidekiq](https://github.com/imcrazytwkr/node-sidekiq)


Contributing
------------

-   [Fork](https://help.github.com/articles/fork-a-repo) the [repository on github](https://github.com/imcrazytwkr/node-sidekiq)
-   Edit files directly inside `lib` because no translation requires!
-   Commit and push until you are happy with your contribution
-   [Make a pull request](https://help.github.com/articles/using-pull-requests)
-   Thanks!


License
-------

This is free software released under the MIT License.
See [LICENSE](https://github.com/imcrazytwkr/node-sidekiq/blob/master/LICENSE) for details.
