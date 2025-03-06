import User from '../models/User.js';
import { signToken } from '../services/auth.js';
import { AuthenticationError } from 'apollo-server-express';

export const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }
      return await User.findById(context.user._id).populate('savedBooks');
    },
  },

  Mutation: {
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user);
      return { token, user };
    },

    addUser: async (
        _parent: any,
        { username, email, password }: { username: string; email: string; password: string }
      ) => {
        try {
          // Check if user already exists before creating
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            throw new AuthenticationError('User already exists');
          }
      
          // Create user
          const user = await User.create({ username, email, password });
          console.log("✅ New user created:", user);
      
          // Generate token once
          const token = signToken(user);
          if (!token) {
            throw new Error('Token generation failed');
          }
      
          return { token, user };
        } catch (error) {
          console.error('❌ Error in addUser mutation:', error);
          throw new Error('Failed to create user');
        }
      },
      
      

    saveBook: async (_parent: any, { book }: { book: any }, context: any) => {
      console.log("🟡 Context User:", context.user);
      console.log("🟡 Received Book Data:", book);

      if (!context.user) {
        throw new AuthenticationError('You must be logged in');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: book } },
        { new: true, runValidators: true }
      ).populate("savedBooks");
    
      console.log("✅ Updated User Data:", updatedUser);
      return updatedUser;
    },

    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
      console.log("🟡 Received delete request for bookId:", bookId);
      console.log("🟡 Context User:", context.user);

      if (!context.user) {
        console.error("❌ User not authenticated");
        throw new AuthenticationError("You must be logged in");
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } }, // Ensure `bookId` is used correctly
        { new: true }
      ).populate("savedBooks");

      console.log("✅ Updated user after book deletion:", updatedUser);
      return updatedUser;
    },
  },
};
