import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ReqResolverService {
  constructor(private readonly httpService: HttpService) { }

  async resolveQuery(gqlQuery: JSON) {
    if (!gqlQuery) return 'no query';
    const graphql = JSON.stringify({
      query: gqlQuery,
      variables: {},
    });

    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.SECRET,
      },
      body: graphql,
      redirect: 'follow',
    };

    try {
      const responseData = await lastValueFrom(
        this.httpService
          .post(process.env.SERVER_URI, graphql, requestOptions)
          .pipe(
            map((response) => {
              return response.data;
            }),
          ),
      );
      return responseData;
    } catch (e) {
      console.log('error: ', e);
      throw new InternalServerErrorException();
    }
  }
}
