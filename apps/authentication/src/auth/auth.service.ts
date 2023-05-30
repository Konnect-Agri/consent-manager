import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) { }

  async handleAuth(authDTO: AuthDto) {
    //TODO: add consent artifact processin
    try {
      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      // const myHeaders = new Headers();
      // myHeaders.append('Content-Type', 'application/json');

      const raw = authDTO.consentArtifact;
      // var raw = JSON.stringify({
      //   "id": "927d81cf-77ee-4528-94d1-2d98a2595740",
      //   "caId": "036232e5-0ac7-4863-bad2-c70e70ef2d2f",
      //   "consent_artifact": {
      //     "id": "036232e5-0ac7-4863-bad2-c70e70ef2d2f",
      //     "log": {
      //       "consent_use": {
      //         "url": "https://sample-log/api/v1/log"
      //       },
      //       "data_access": {
      //         "url": "https://sample-log/api/v1/log"
      //       }
      //     },
      //     "data": "<Valid superset GraphQL query of consented data>",
      //     "user": {
      //       "id": "farmer-1@gmail.com"
      //     },
      //     "proof": {
      //       "jws": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAzNjIzMmU1LTBhYzctNDg2My1iYWQyLWM3MGU3MGVmMmQyZiIsImxvZyI6eyJjb25zZW50X3VzZSI6eyJ1cmwiOiJodHRwczovL3NhbXBsZS1sb2cvYXBpL3YxL2xvZyJ9LCJkYXRhX2FjY2VzcyI6eyJ1cmwiOiJodHRwczovL3NhbXBsZS1sb2cvYXBpL3YxL2xvZyJ9fSwiZGF0YSI6IjxWYWxpZCBzdXBlcnNldCBHcmFwaFFMIHF1ZXJ5IG9mIGNvbnNlbnRlZCBkYXRhPiIsInVzZXIiOnsiaWQiOiJmYXJtZXItMUBnbWFpbC5jb20ifSwiY3JlYXRlZCI6IllZWVktTU0tRERUaGg6bW06c3Nabi5uIiwiZXhwaXJlcyI6IllZWVktTU0tRERUaGg6bW06c3Nabi5uIiwicHVycG9zZSI6IiIsInJldm9rZXIiOnsiaWQiOiJkaWQ6dXNlcjoxMjMiLCJ1cmwiOiJodHRwczovL3NhbXBsZS1yZXZva2VyL2FwaS92MS9yZXZva2UifSwiY29uc3VtZXIiOnsiaWQiOiJkaWQ6Y29uc3VtZXI6MTIzIiwidXJsIjoiaHR0cHM6Ly9zYW1wbGUtY29uc3VtZXIvYXBpL3YxL2NvbnN1bWUifSwicHJvdmlkZXIiOnsiaWQiOiJkaWQ6cHJvaWRlcjoxMjMiLCJ1cmwiOiJodHRwczovL3NhbXBsZS1jb25zdW1lci9hcGkvdjEifSwiY29sbGVjdG9yIjp7ImlkIjoiZGlkOmNvbGxlY3RvcjoxMjMiLCJ1cmwiOiJodHRwczovL2ExMTItMTAzLTIxMi0xNDctMTMwLmluLm5ncm9rLmlvIn0sImZyZXF1ZW5jeSI6eyJ0dGwiOjUsImxpbWl0IjoyfSwicmV2b2NhYmxlIjpmYWxzZSwic2lnbmF0dXJlIjoiIiwidXNlcl9zaWduIjoiIiwiY29sbGVjdG9yX3NpZ24iOiIiLCJ0b3RhbF9xdWVyaWVzX2FsbG93ZWQiOjEwLCJpYXQiOjE2Njk5Mzk1OTYsImV4cCI6MTY3MDM3MTU5NiwiYXVkIjoiZGlkOmNvbnN1bWVyOjEyMyIsImlzcyI6ImNvbnNlbnQtbWFuYWdlciIsInN1YiI6ImZhcm1lci0xQGdtYWlsLmNvbSJ9.UNyoXDgMxbIVaBoK0J7OBX7ybUlZNx309KdbetoeJLqGaZbfFav3rZyoPnQNpQyAFHp8MaNczzlI0JlTSStqJl0E-Z1oGK6M-hREE1261zSxZMAueIgpNEVpNiUH4gRhleTBaKPH0EoZT27ORqZmULb2UMDfw1Gy9RuH7cHzJYdBDmi5fkePhsN8T3Z03OgnUWHHPTxwS4_szS3fLGMmJvUTyrK-UBwkMslajdoWN3vcp4MERv60F8yIk7GqGGkNHEiaLe_g_Zi73KOKDbdWOLapQiO8kwpAyblu6maNF8w4VdIft4zFT4SiloJWxeYNZUeT0ROHscTbdLOaTCn-Ag",
      //       "type": "RS256",
      //       "created": "12/2/2022, 12:06:36 AM",
      //       "proofPurpose": "jwtVerify",
      //       "verificationMethod": "https://auth.konnect.samagra.io/.well-known/jwks"
      //     },
      //     "created": "YYYY-MM-DDThh:mm:ssZn.n",
      //     "expires": "YYYY-MM-DDThh:mm:ssZn.n",
      //     "purpose": "",
      //     "revoker": {
      //       "id": "did:user:123",
      //       "url": "https://sample-revoker/api/v1/revoke"
      //     },
      //     "consumer": {
      //       "id": "did:consumer:123",
      //       "url": "https://sample-consumer/api/v1/consume"
      //     },
      //     "provider": {
      //       "id": "did:proider:123",
      //       "url": "https://sample-consumer/api/v1"
      //     },
      //     "collector": {
      //       "id": "did:collector:123",
      //       "url": "https://a112-103-212-147-130.in.ngrok.io"
      //     },
      //     "frequency": {
      //       "ttl": 5,
      //       "limit": 2
      //     },
      //     "revocable": false,
      //     "signature": "",
      //     "user_sign": "",
      //     "collector_sign": "",
      //     "total_queries_allowed": 10
      //   },
      //   "userId": "farmer-1@gmail.com",
      //   "state": "ACCEPT",
      //   "created_at": "2022-12-02T00:05:46.090Z",
      //   "created_by": "API",
      //   "updated_at": "2022-12-02T00:05:46.090Z",
      //   "updated_by": null,
      //   "webhook_url": "https://sample-consumer/api/v1/consume",
      //   "total_attempts": 0
      // });
      const reqOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: raw,
        redirect: 'follow',
      };
      // fetch('https://api.consent-manager.konnect.samagra.io/verify', reqOptions)
      //   .then((response) => response.text())
      //   .then((result) => console.log(result))
      //   .catch((error) => {
      //     console.log('error', error);
      //     throw new InternalServerErrorException(error);
      //   });

      // this.httpService.post(
      //   'https://api.consent-manager.konnect.samagra.io/verify',
      //   raw,
      //   reqOptions,
      // );

      const caRes = await lastValueFrom(
        this.httpService
          .post(
            `${process.env.CONSENT_MANAGER_URI}/verify`,
            raw,
            reqOptions,
          )
          .pipe(map((response) => response.data)),
      );

      if (caRes.status != 200) {
        return "An error occured while verifying Consent Artifact";
      }

      const responseData = await lastValueFrom(
        this.httpService
          .post(
            process.env.LINK_TO_AUTHORIZATION_SERVICE,
            { consentArtifact: authDTO.consentArtifact, gql: authDTO.gql },
            requestOptions,
          )
          .pipe(map((response) => response.data)),
      );

      return responseData;
    } catch (err) {
      console.log('err: ', err);
      if (err?.response?.data)
        return err?.response?.data;
      throw new InternalServerErrorException();
    }
  }
}
