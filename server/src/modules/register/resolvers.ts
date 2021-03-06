import jwt from "jsonwebtoken";
import { ResolverMap } from "../../types";
import bcrypt from "bcryptjs";
import { registerSchema } from "../../schemas/registerSchema";
import { formatYupError } from "../../utils/formatYupErrors";

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (_, args, { prisma, res }) => {
      try {
        await registerSchema.validate(args.input, {
          abortEarly: false
        });
      } catch (err) {
        return { errors: formatYupError(err) };
      }

      // hash the password
      const password = await bcrypt.hash(args.input.password, 10);

      const user = await prisma.createUser({
        email: args.input.email,
        password
      });

      // make secret key in env
      const token = jwt.sign(
        {
          userId: user.id
        },
        "randomtokenapp"
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365
      });

      return {
        user
      };
    }
  }
};
