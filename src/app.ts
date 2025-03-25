import { clearAllRedis, envs } from './config';
import { AppRoutes } from './routes';
import { Server } from './server';

(async () => {
  main();
})();

async function main() {
  const server = new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });

  await server.start();
}
