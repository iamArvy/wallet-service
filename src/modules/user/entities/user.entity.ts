// export class User {
//   id: string;
//   email: string;
//   first_name: string | null;
//   last_name: string | null;
//   name: string | null;
//   profile_picture: string | null;
//   provider: string;
//   google_id: string | null;
//   created_at: Date;
//   updated_at: Date;
// }

import { Expose } from 'class-transformer';

export class User {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  first_name: string;

  @Expose()
  last_name: string;

  @Expose()
  profile_picture: string | null;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  // Optional: exclude sensitive fields like password
  // @Exclude()
  // password?: string;
}
