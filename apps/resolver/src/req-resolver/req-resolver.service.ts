import { Body, Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class ReqResolverService {
  constructor(private readonly httpService: HttpService) { }

  async resolveQuery(body: any) {
    let farmerData = null
    if (body.requestType == 'gql') {

      if (!body.gql) return 'no query';
      const graphql = JSON.stringify({
        query: body.gql,
        variables: {},
      });
      try {

        // Extracting Aadhar Number from the query
        let aadhar = body.gql.toString().split(")")[0]
        aadhar = body.gql.toString().slice(aadhar.indexOf('aadhar'))
        aadhar = aadhar.slice(aadhar.indexOf("\"") + 1, aadhar.indexOf("\"") + 13)

        // Fetching farmer's data from KO
        const requestOptions = {
          headers: {
            'Authorization': process.env.KO_AUTH_TOKEN,
          }
        };

        console.log(`${process.env.KO_API_URL}/api/KrushakPortal/getFarmerDetails`, aadhar, requestOptions)

        farmerData = await lastValueFrom(
          this.httpService
            .post(`${process.env.KO_API_URL}/api/KrushakPortal/getFarmerDetails`, { aadhaar_no: aadhar }, requestOptions)
            .pipe(
              map((response) => {
                return response.data;
              }),
            ),
        );

      } catch (e) {
        console.log('error: ', e);
        throw new InternalServerErrorException();
      }
    } else {
      // Perform REST operation
      farmerData = await this.httpService.axiosRef.request({
        method: body.queryObject.method,
        url: `${process.env.KO_API_URL}/api/KrushakPortal/getFarmerDetails`,
        headers: {
          'Authorization': process.env.KO_AUTH_TOKEN,
        },
        data: body.queryObject.body
      })
      farmerData = farmerData.data;
    }

    let userHashMap = new Map();
    console.log()
    if (Object.keys(farmerData?.data)?.length > 0) {
      Object.keys(farmerData?.data).forEach(key => {
        if (Object.keys(farmerData.data[key]).length && (typeof farmerData.data[key] == 'object')) {
          Object.keys(farmerData.data[key]).forEach(el => {
            userHashMap[el] = farmerData.data[key][el];
          })
        }
      })

      // Creating response object
      const responseObj = {};
      console.log(userHashMap)

      if (body.requestType == 'gql') {

        // Extracting fields for the requested data
        let fields = body.gql.toString().split(")")[1]
        let items = fields.split("\n")
        items = items.filter(el => !(el.includes("}") || el.includes("{"))).map(el => el.trim())

        // Retrieving requested fields from user hash map
        items.forEach(el => {
          responseObj[el] = userHashMap[el]
        })
        console.log(responseObj)
        return responseObj;
      } else {
        // Retrieving requested fields from user hash map for a REST requestType
        body.queryObject.data.forEach(el => {
          responseObj[el] = userHashMap[el]
        })
        return responseObj;
      }
    } else {
      return null;
    }
  }
}