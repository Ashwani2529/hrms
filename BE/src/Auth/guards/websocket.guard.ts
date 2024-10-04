import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WebSocketGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      if (!request.handshake.headers['authorization']) {
        throw new Error('Add Auth Token');
      }

      const authHeader = request.handshake.headers['authorization'];
      const token = authHeader.split(' ')[1];

      if (!token) {
        throw new Error('Token not found');
      }

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return false;
      }

      await this.jwtService.verify(token);
      
      return true;
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}
