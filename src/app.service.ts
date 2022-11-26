import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { CAObject, CAStates, WebhookRequest } from './app.interface';
import { PrismaService } from './prisma.service';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ){}

  getUuid(): string {
    return uuidv4();
  }

  updateCACount(caId: string, ca: any): Promise<any>{
    return this.prisma.cARequests.update({
      where: {
        caId: caId,
      },
      data: {
        consent_artifact: ca,
      },
    });
  }

  async getCA(caId: string): Promise<any> {
    const res = await this.prisma.cARequests.findUnique({
      where: {
        caId: caId,
      },
      select: {
        consent_artifact: true,
      }
    });
    const ca = res.consent_artifact;
    ca['total_query_count'] = ca['total_query_count'] + 1;
    await this.updateCACount(caId, ca);
    return ca;
  }

  async getQueryCountByKey(key: string): Promise<any> {
    const count = this.cacheManager.get(key) == null ? 0 : parseInt(await this.cacheManager.get(key)) + 1
    const ttl = parseInt(this.getCA(key)['frequency']['ttl']);
    this.cacheManager.set(key, count, ttl);
    return count;
    // if(this.cacheManager.get(key)){
    //   const count = parseInt(await this.cacheManager.get(key)) + 1;
    //   return count;
    // }
    // else {
    //   const ttl = parseInt(this.getCA(key)['frequency']['ttl'])
    //   this.cacheManager.set(key, 1, ttl);
    //   return 1;
    // }
  }

  updateCaStatus(caId: string, state: CAStates): any {
    return this.prisma.cARequests.update({
      where: {
        caId: caId,
      },
      data: {
        state: state,
      }
    });
  }
  
  tokenizeRequest(payload: any): any {
    var privateKEY  = fs.readFileSync('../keys/private.key', 'utf8');
    var signOptions = {
      issuer: this.configService.get<string>('JWT_ISSUER'),
      subject: this.configService.get<string>('JWT_SUBJECT'),
      audience: this.configService.get<string>('JWT_AUDIENCE'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES'),
      algorithm: this.configService.get<string>('JWT_ALGORITHM')
    };
    const proof = {
      type: this.configService.get<number>('JWT_ALGORITHM'),
      created: new Date().toLocaleString(),
      proofPurpose: "jwtVerify",
      verificationMethod: this.configService.get<number>('PUBLIC_KEY_URL'),
    }
    payload['proof'] = proof;
    const token = jwt.sign(payload, privateKEY, signOptions);
    return payload;
  }

  register(ca: object, userId: string, webhook_url: object): void {
    const caObject = this.prisma.cARequests.create({
      data: {
        caId: this.getUuid(),
      consent_artifact: ca,
      userId: userId,
      state: CAStates.CREATED,
      created_by: "API",
      webhook_url: webhook_url,
      }
    })
  }
}
