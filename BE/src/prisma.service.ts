import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, PrismaPromise } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async Init() {
    try {
      await this.$connect();
    } catch (e) {
      console.log(e);
    }
  }


  async handlePrismaError<T>(promise: PrismaPromise<T> | Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      console.error('Prisma Error:', error);
      throw new Error('Database error occurred');
    }
  }

}

// @Injectable()
// export class PrismaService extends PrismaClient implements OnModuleInit {
//   async onModuleInit() {
//     try {
//       await this.$connect();
//     }
//     catch (e) {
//       console.log(e);
//     }
//   }
// }
