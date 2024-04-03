import path from 'node:path';
import { Worker } from 'node:worker_threads';

function parallelSum(numbers, numWorkers) {
  return new Promise((resolve, reject) => {
    const chunkSize = Math.ceil(numbers.length / numWorkers);
    const workers = [];
    let completedWorkers = 0;
    let totalSum = 0;

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(
        path.resolve(import.meta.dirname, './worker-sum.js')
      );
      workers.push(worker);
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize, numbers.length);
      const chunk = numbers.slice(start, end);
      worker.postMessage({ numbers: chunk });

      worker.on('message', (sum) => {
        totalSum += sum;
        completedWorkers++;
        if (completedWorkers === numWorkers) {
          resolve(totalSum);
        }
      });

      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    }
  });
}

const numbers = Array.from({ length: 1e8 }, () =>
  Math.floor(Math.random() * 100)
);
const numWorkers = 10;
console.time('Multi-threaded sum');
parallelSum(numbers, numWorkers)
  .then((sum) => {
    console.timeEnd('Multi-threaded sum');
    console.log('Sum:', sum);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

function sumArray() {
  let sum = 0;
  for (const num of numbers) {
    sum += num;
  }
  return sum;
}

console.time('Single-threaded sum');
const singleThreadSum = sumArray();
console.timeEnd('Single-threaded sum');
console.log('Sum:', singleThreadSum);
