import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: Request): boolean {
    // return true; // TODO: REMOVE LATER

    if (request.url.includes('auth')) {
      return true;
    }

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    try {
      // special toekn for checkin
      if (
        token ===
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0Nzc0NDhlYS1kOGIzLTRjNGQtYjllZC03ZjU3NjIzMjc0NmUiLCJlbWFpbCI6ImFkbWluQGhlbGl2ZXJzZS5jb20iLCJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiQURNSU4iLCJwX2ZsYWdzIjpbIkFETUlOIl0sImNvbXBhbnlfaWQiOiJjNWY1ZmM1NC0wMGJhLTQwNTUtYjRlNS1lMWY2ZGU2OTg0MWEiLCJpYXQiOjE3MTkzNDMxNDIsImV4cCI6MTcxOTQyOTU0Mn0.urWTpOWBlMTjP7y7FCSHaE7OTmSZj_j-CdGryYK9CG4'
      ) {
        if (request.route.path !== '/checkin/autoCheckin') {
          return false;
        }

        return true;
      }

      const decoded = this.jwtService.verify(token);

      request.user = decoded;
      return true;
    } catch (err) {
      return false;
    }
  }
}
