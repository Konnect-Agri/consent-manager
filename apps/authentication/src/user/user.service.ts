import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class UserService {
  constructor(private readonly httpService: HttpService) { }

  async getUserDetails(email: string) {
    try {
      const userRes = await lastValueFrom(
        this.httpService
          .get(
            `https://auth.konnect.samagra.io/api/user?email=${email}`,
            {
              headers: {
                Authorization: 'S2lTEmQZHrIjWUq30-4UJQDq0FYqSXOUhak24zcYZHYFbXTKawwCu0dr'
              }
            }
          )
          .pipe(map((response) => response.data)),
      );
      return userRes
    }
    catch (error) {
      console.log("ERROR --->", error.message, error.code)
      if (error.message == 'Request failed with status code 404')
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          error: `User with the email ${email} doesn't exist.`,
        }, HttpStatus.NOT_FOUND);
    }
    return null;
  }

  async updateUserCaIds(data, token) {
    try {

      // Getting user data from Fusion Auth
      let userRes = await lastValueFrom(
        this.httpService
          .get(
            `http://localhost:6000/user/${data.userEmail}`, {
            headers: {
              Authorization: token
            }
          }
          )
          .pipe(map((response) => response.data)),
      );
      userRes = userRes.user;
      if (userRes?.data?.registeredCAs?.length) {
        userRes.data = { ...userRes.data, registeredCAs: [...userRes.data.registeredCAs, data.caId] }
      } else {
        userRes.data = {
          registeredCAs: [data.caId]
        }
      }

      // Updating user data in fusion auth
      const userUpdateRes = await lastValueFrom(
        this.httpService
          .put(
            `https://auth.konnect.samagra.io/api/user/${userRes.id}`, {
            user: userRes
          },
            {
              headers: {
                Authorization: 'S2lTEmQZHrIjWUq30-4UJQDq0FYqSXOUhak24zcYZHYFbXTKawwCu0dr'
              }
            }
          )
          .pipe(map((response) => response.data)),
      );

      console.log("Updated User Response----> ", userUpdateRes)
      return userUpdateRes;
    }
    catch (error) {
      console.log(error)
    }
    return null;
  }

  async checkPermission(data, token) {
    try {

      // Getting user data from Fusion Auth
      let userRes = await lastValueFrom(
        this.httpService
          .get(
            `http://localhost:6000/user/${data.userEmail}`, {
            headers: {
              Authorization: token
            }
          }
          )
          .pipe(map((response) => response.data)),
      );

      userRes = userRes.user;
      // Check if caId exists in the list of registered CAs or not.
      if (userRes?.data?.registeredCAs?.length) {
        return userRes?.data?.registeredCAs?.includes(data.caId);
      }
      return false;

    }
    catch (error) {
      console.log(error)
    }
    return null;
  }
}
