export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: string,
    public readonly createdAt: Date,
    public readonly active: boolean,
  ) {}

  static fromJson({
    id,
    name,
    email,
    password,
    role,
    created_at,
    active,
  }: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    created_at: string;
    active: boolean;
  }) {
    return new User(
      id,
      name,
      email,
      password,
      role,
      new Date(created_at),
      active,
    );
  }
}
