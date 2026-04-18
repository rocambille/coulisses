/*
  Purpose:
  Centralize all mocked data for both API and React tests.
  This ensures consistency and eliminates duplication.

  Naming:
  Use descriptive names (e.g., teacherUser, mainPlay) to make tests more readable.
*/

// ---------------------------------------------------------
// Users
// ---------------------------------------------------------

export const allUsers: User[] = [
  {
    id: 1,
    email: "foo@mail.com",
    name: "foo",
  },
  {
    id: 2,
    email: "bar@mail.com",
    name: "bar",
  },
];

export const fooUser = allUsers[0];
export const barUser = allUsers[1];

// ---------------------------------------------------------
// Items
// ---------------------------------------------------------

export const allItems: Item[] = [
  {
    id: 1,
    title: "Stuff",
    user_id: fooUser.id,
  },
  {
    id: 2,
    title: "Doodads",
    user_id: barUser.id,
  },
];

// ---------------------------------------------------------
// Other data
// ---------------------------------------------------------

export const insertId = 42;
