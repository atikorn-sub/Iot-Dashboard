import mongoose from 'mongoose';

export const connectDatabase = async (uri: string): Promise<void> => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
