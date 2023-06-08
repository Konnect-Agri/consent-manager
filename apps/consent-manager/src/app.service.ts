import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { CAObject, CAStates, WebhookRequest } from './app.interface';
import { PrismaService } from './prisma.service';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ConsentArtifact } from './types/consentArtifact';
import { CARequests } from '@prisma/client';
import MagicBellClient, { Notification } from '@magicbell/core';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    MagicBellClient.configure({
      apiKey: this.configService.get<string>('MAGICBELL_API_KEY'),
      apiSecret: this.configService.get<string>('MAGICBELL_API_SECRET'),
    });
  }

  getUuid(): string {
    return uuidv4();
  }

  updateCACount(caId: string, ca: any): Promise<any> {
    return this.prisma.cARequests.update({
      where: {
        caId: caId,
      },
      data: {
        consent_artifact: ca,
      },
    });
  }

  async getCA(caId: string): Promise<CARequests> {
    return this.prisma.cARequests.findUnique({
      where: {
        caId: caId,
      }
    });
  }

  async getQueryCountByKey(key: string): Promise<any> {
    const count = this.cacheManager.get(key) == null ? 0 : parseInt(await this.cacheManager.get(key)) + 1
    // const ttl = parseInt(this.getCA(key)['frequency']['ttl']);
    // this.cacheManager.set(key, count, ttl);
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

  async updateCaStatus(caId: string, state: CAStates): Promise<CARequests> {
    return this.prisma.cARequests.update({
      where: {
        caId: caId,
      },
      data: {
        state: state,
      }
    });
  }

  async updateFrequency(ca: CARequests): Promise<any> {
    if (ca == null) {
      return 404;
    } else {
      const consentArtifact: ConsentArtifact = ca['consent_artifact'] as ConsentArtifact;
      const currDate = new Date();

      // If the Consent Artifact has expired
      if ((new Date(consentArtifact.expires) <= currDate) || ca.state == 'EXPIRED') {
        return 410;
      }
      // If the Consent Artifact has been revoked.
      if (ca.state == 'REVOKED') {
        return 403;
      }

      // If the Consent Artifact has been revoked.
      if (ca.state == 'DECLINE') {
        return 403;
      }

      // If the Consent Artifact has been revoked.
      if (ca.state == 'CREATED') {
        return 401;
      }

      if (ca.total_attempts + 1 <= consentArtifact.total_queries_allowed) {
        const currentValue = await this.cacheManager.get(ca.caId);
        if (!currentValue || currentValue == null) {
          this.cacheManager.set(ca.caId, 1, consentArtifact.frequency.ttl);
          await this.prisma.cARequests.update({
            where: {
              caId: ca.caId,
            },
            data: {
              total_attempts: ca.total_attempts + 1,
            }
          });
          return 200;
        } else {
          const nextValue: number = parseInt(currentValue as string) + 1;
          if (nextValue > consentArtifact.frequency.limit) {
            return 429;
          } else {
            await this.cacheManager.set(ca.caId, nextValue, consentArtifact.frequency.ttl);
            await this.prisma.cARequests.update({
              where: {
                caId: ca.caId,
              },
              data: {
                total_attempts: ca.total_attempts + 1,
              }
            });
            return 200;
          }
        }
      } else {
        return 429;
      }
    }
  }

  updateProof(caId: string, body: ConsentArtifact, state: CAStates): Promise<any> {
    return this.prisma.cARequests.update({
      where: {
        caId: caId,
      },
      data: {
        consent_artifact: body as object,
        state: state,
      }
    });
  }

  tokenizeRequest(payload: ConsentArtifact): any {
    var privateKEY = fs.readFileSync(process.cwd() + '/apps/consent-manager/keys/private.key', 'utf8');
    var signOptions: any = {
      issuer: this.configService.get<string>('JWT_ISSUER'),
      subject: payload.user.id,
      audience: payload.consumer.id,
      expiresIn: "120h",
      algorithm: this.configService.get<string>('JWT_ALGORITHM')
    };
    const proof = {
      type: this.configService.get<string>('JWT_ALGORITHM'),
      created: new Date().toLocaleString(),
      proofPurpose: "jwtVerify",
      verificationMethod: this.configService.get<string>('PUBLIC_KEY_URL'),
      jws: jwt.sign(payload as object, privateKEY, signOptions)
    }
    return proof;
  }

  async register(ca: ConsentArtifact, userId: string, webhook_url: string): Promise<CARequests> {
    const caId = this.getUuid();
    ca.id = caId;
    const c: CARequests = await this.prisma.cARequests.create({
      data: {
        caId: caId,
        consent_artifact: ca as object,
        userId: userId,
        state: CAStates.CREATED,
        created_by: "API",
        webhook_url: webhook_url,
      }
    })
    await this.notifyUserOnMagicBell(ca);
    return c;
  }

  async notifyUserOnMagicBell(ca: ConsentArtifact): Promise<any> {
    await Notification.create({
      title: 'Consent Artifact Requested',
      content: `A consent artifact has been requested by ${ca.consumer.id} for the following fields: ${ca.data}`,
      recipients: [{ email: ca.user.id }],
      custom_attributes: ca as Record<string, unknown>,
    }).then((notification) => {
      console.log(notification);
    });
  }
}
