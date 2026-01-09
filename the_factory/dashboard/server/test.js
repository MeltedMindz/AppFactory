import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(5175, '127.0.0.1', () => {
  console.log('Test server running on 5175');
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});