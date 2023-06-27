import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { parseJwt } from '../helpers/decodeToken';
import { AuthDto } from './dto/auth.dto';
import { CA } from './dto/ca.dto';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) { }

  async handleAuth(authDTO: AuthDto, token: string) {
    try {
      const tokenPayload = parseJwt(token?.split(" ")?.[1]);
      const userEmail = tokenPayload.email;

      const permissionRes = await lastValueFrom(
        this.httpService
          .post(
            `${process.env.AUTH_SELF_URL}/user/checkPermission`,
            {
              caId: authDTO.caId,
              userEmail
            }, { headers: { Authorization: token } }
          )
          .pipe(map((response) => response.data)),
      );

      if (permissionRes) {
        const caRes = await lastValueFrom(
          this.httpService
            .get(
              `${process.env.CONSENT_MANAGER_URI}/${authDTO.caId}/verify`
            )
            .pipe(map((response) => response.data)),
        );
        if (!caRes.caId) {
          return "An error occured while verifying Consent Artifact";
        }

        console.log("CA RES---->", caRes)

        const responseData = await lastValueFrom(
          this.httpService
            .post(
              process.env.LINK_TO_AUTHORIZATION_SERVICE,
              { consentArtifact: caRes, gql: authDTO.gql }
            )
            .pipe(map((response) => response.data)),
        );

        return responseData;

      } else {
        throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: `You can only access or modify Consents which are associated with you.`,
        }, HttpStatus.FORBIDDEN);
      }
    } catch (err) {
      console.log('err: ', err);
      if (err?.response?.data || err?.response)
        return err?.response?.data || err?.response;
      throw new InternalServerErrorException();
    }
  }

  handleRegister = async (data: CA, token: string) => {
    try {
      const tokenPayload = parseJwt(token?.split(" ")?.[1]);
      const userEmail = tokenPayload.email;
      let ca = data.consentArtifact
      const caRes = await lastValueFrom(
        this.httpService
          .post(
            `${process.env.CONSENT_MANAGER_URI}/register`,
            { ca }
          )
          .pipe(map((response) => response.data)),
      );
      if (!caRes.caId) {
        return "An error occured while creating Consent Artifact";
      }

      // Adding registered CA to user's data on FA.
      const userRes = await lastValueFrom(
        this.httpService
          .patch(
            `${process.env.AUTH_SELF_URL}/user/updateUserCaIds`,
            {
              caId: caRes.caId,
              userEmail
            }, { headers: { Authorization: token } }
          )
          .pipe(map((response) => response.data)),
      );

      return caRes;

    } catch (err) {
      console.log('err: ', err);
      if (err?.response?.data)
        return err?.response?.data;
      throw new InternalServerErrorException();
    }
  }

  handleConsent = async (caId: string, type: string, token: string) => {
    try {
      const tokenPayload = parseJwt(token?.split(" ")?.[1]);
      const userEmail = tokenPayload.email;

      const permissionRes = await lastValueFrom(
        this.httpService
          .post(
            `${process.env.AUTH_SELF_URL}/user/checkPermission`,
            {
              caId,
              userEmail
            }, { headers: { Authorization: token } }
          )
          .pipe(map((response) => response.data)),
      );

      if (permissionRes) {
        const caRes = await lastValueFrom(
          this.httpService
            .patch(
              `${process.env.CONSENT_MANAGER_URI}/${caId}/${type}`
            )
            .pipe(map((response) => response.data)),
        );

        if (!caRes.caId) {
          return "An error occured while performing the requested action";
        }

        return caRes;

      } else {
        throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: `You can only access or modify Consents which are associated with you.`,
        }, HttpStatus.FORBIDDEN);
      }

    } catch (err) {
      console.log('err: ', err);
      if (err?.response)
        return err?.response;
      throw new InternalServerErrorException;
    }
  }
}
