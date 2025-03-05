import { PrismaClient } from "@prisma/client";
import { User } from "@src/types/user.types";

export class UserModel {
  constructor(private prisma: PrismaClient) {}

  async createUser(name: string, email: string): Promise<User> {
    return this.prisma.user.create({
      data: { name, email },
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User | null> {
    console.log("id ", id);
    return this.prisma.user.findUnique({ where: { id } });
  }
}
