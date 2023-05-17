import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    console.log('context: ', context.getHandler());
    console.log(
      'context.switchToHttp().getRequest(): ',
      context.switchToHttp().getRequest()['user']['roles'],
    );
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log('roles: ', roles);
    // if (!roles) {
    //   console.log('sending false from here!');
    //   return true;
    // }

    let isAllowed = false;
    const request: Request = context.switchToHttp().getRequest();
    try {
      const tokenRoles: string[] = request['user']['roles'];
      // for (const role of roles) {
      //   if (tokenRoles.indexOf(role) > -1) {
      //     isAllowed = true;
      //     break;
      //   }
      // }
      if (tokenRoles.indexOf('Data Consumer') > -1) {
        isAllowed = true;
      }
    } catch (error) {
      console.log({ err: error });
      isAllowed = false;
    }
    return isAllowed;
  }

  handleRequest(err, user, info) {
    console.log('in handle request!');
    console.log({ handleRequest: info, err: err, user: user });
    return user;
  }
}
