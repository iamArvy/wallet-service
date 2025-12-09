import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class UserModelAction {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({ where });
  }

  findAndCreate(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserCreateInput,
    updateData?: Prisma.UserUpdateInput,
  ) {
    return this.prisma.user.upsert({
      where,
      create: data,
      update: updateData || {},
    });
  }

  findOrCreate(
    where: Prisma.UserWhereUniqueInput,
    create: Prisma.UserCreateInput,
    updateData?: Prisma.UserUpdateInput,
  ) {
    return this.prisma.user.upsert({
      where,
      create,
      update: updateData || {},
    });
  }

  update(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where, data });
  }

  delete(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.delete({ where });
  }
  // Define user model actions here
}
