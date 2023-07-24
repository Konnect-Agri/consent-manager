import { ForbiddenException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { isSubset } from '../gql-utils';
import { lastValueFrom, map } from 'rxjs';
import { ConsentArtifact } from './interface/req-checker.interface';

@Injectable()
export class ReqCheckerService {
  constructor(private readonly httpService: HttpService) { }

  async reqChecker(body: any) {
    let consentArtifact = body.consentArtifact
    let gqlQuery = body.gql
    let requestType = body.requestType
    let queryObject = body.queryObject

    if (!isSubset(consentArtifact.consent_artifact.data, requestType == 'GQL' ? gqlQuery : queryObject)) {
      throw new ForbiddenException('Forbidden.');
    } else {
      // call the resolver here

      const requestOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
        redirect: 'follow',
      };
      try {
        const responseData = await lastValueFrom(
          this.httpService
            .post(process.env.RESOLVER_URI, body, requestOptions)
            .pipe(
              map((response) => {
                return response.data;
              }),
            ),
        );
        console.log(responseData);
        return responseData;
      } catch (err) {
        console.log('error: ', err);
      }
    }
  }
}
