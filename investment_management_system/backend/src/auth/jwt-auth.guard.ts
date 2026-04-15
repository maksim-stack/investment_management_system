import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    // Временно 
    handleRequest(err, user, info, context) {
        console.log('JWT guard:', { err, user, info });
        return super.handleRequest(err, user, info, context);
    }
}