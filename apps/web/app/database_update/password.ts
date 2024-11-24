import { prisma } from "@repo/prisma_database/client";
import * as argon2 from "argon2";

import { getUserId } from "../userId/userID";

export const password_update = async (password: string) => {
    try{
        const userId = await getUserId();
        if(!userId){
            return false
        }
        const hashedPassword = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 65536,
          timeCost: 3,
          parallelism: 4
        });
      
        await prisma.user.update({
          where: {
            id: userId // Replace 'id' with your actual user ID field
          },
          data: {
            password: hashedPassword
          }
        });
        return true
    }catch(error){
        console.log(error)
        return false
    }
};