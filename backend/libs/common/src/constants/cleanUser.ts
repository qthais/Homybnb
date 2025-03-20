


// Clean up user object by transforming null values to undefined
const cleanUser = (user: any) => {
  return {
    ...user,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    image: user.image ?? undefined,
    hashedPassword: user.hashedPassword ?? undefined,
    accounts: user.accounts ?? [],
  };
};

export default cleanUser;
