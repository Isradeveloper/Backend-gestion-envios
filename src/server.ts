import express, { Router } from 'express';
import { swaggerMiddleware } from './config';
import cors from 'cors';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

interface Options {
  port: number;
  routes: Router;
}

export class Server {
  public readonly app = express();
  private serverListener?: HttpServer;
  private static io: SocketIOServer;
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes } = options;
    this.port = port;
    this.routes = routes;
  }

  async start() {
    //* Middlewares
    swaggerMiddleware(this.app);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());

    //* Crear servidor HTTP y WebSocket
    this.serverListener = createServer(this.app);
    Server.io = new SocketIOServer(this.serverListener, {
      cors: {
        origin: '*', // Permitir conexiones desde cualquier origen
      },
    });

    //* Manejo de eventos de conexión de WebSocket
    Server.io.on('connection', (socket: Socket) => {
      console.log(`Nuevo cliente conectado: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
      });
    });

    //* Rutas
    this.app.use(this.routes);

    //* Iniciar servidor
    this.serverListener.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }

  public close() {
    this.serverListener?.close();
  }

  //* Método estático para emitir eventos desde cualquier parte del proyecto
  public static emitSocketEvent(eventName: string, data: any) {
    if (Server.io) {
      Server.io.emit(eventName, data);
    }
  }
}
