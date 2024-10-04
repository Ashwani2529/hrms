import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';

//DECORATOR
export const Roles = Reflector.createDecorator<string[]>();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {    
    // return true; // TODO: REMOVE LATER
    
    const flags = this.reflector.get(Roles, context.getHandler());
    
    if (!flags) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user:any = request.user;

    if(this.matchRoles(flags, user.p_flags)){
      if(JSON.stringify(user.p_flags) === JSON.stringify(["EMP"]) ){
        request.userId = user?.userId
      }
      return true;
    }

    return false;
  }

  matchRoles(flags: string[], userFlags: string[]): boolean {
    return flags.some(flag => userFlags.includes(flag));
  }
}
