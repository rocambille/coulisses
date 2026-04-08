import {
  allUsers,
  insertId,
  mainMatrix,
  mainPlay,
  mainPlayMembers,
  mainPreferences,
  mainRoles,
  mainScenes,
  openingNightEvent,
  teacherUser,
} from "./mocks";

/**
 * API Contracts: The Point of Truth for API responses.
 *
 * Each entry defines { status, body } for a given endpoint action.
 * These are used by:
 * 1. API tests: expect(response.status).toBe(contracts.plays.browse.status)
 *               expect(response.body).toEqual(contracts.plays.browse.body)
 * 2. React mocks: respond(contract.body, contract.status)
 */
export const contracts = {
  auth: {
    magicLink: {
      status: 200,
      body: {
        message: "Magic link sent to your email",
        _testing_link: "http://localhost:5173/verify?token=fake_jwt_token",
        _testing_token: "fake_jwt_token",
      },
    },
    me: { status: 200, body: teacherUser },
    verifySuccess: { status: 201, body: teacherUser },
    logout: { status: 204, body: {} },
  },
  events: {
    update: { status: 204, body: {} },
    delete: { status: 204, body: {} },
  },
  health: {
    get: { status: 200, body: "hello, world!" },
    post: { status: 200, body: "hello, world!" },
  },
  plays: {
    browse: { status: 200, body: [mainPlay] },
    get: { status: 200, body: mainPlay },
    create: { status: 201, body: { insertId } },
    update: { status: 204, body: {} },
    delete: { status: 204, body: {} },

    // Nested resources

    castings: {
      browse: { status: 200, body: mainMatrix },
      assign: { status: 201, body: {} },
      unassign: { status: 204, body: {} },
    },
    events: {
      browse: { status: 200, body: [openingNightEvent] },
      create: { status: 201, body: { insertId } },
    },
    members: {
      browse: { status: 200, body: mainPlayMembers },
      invite: { status: 204, body: {} },
    },
    preferences: {
      browse: { status: 200, body: mainPreferences },
    },
    roles: {
      browse: {
        status: 200,
        body: [
          { ...mainRoles[0], scenes: [mainScenes[0]] },
          { ...mainRoles[1], scenes: [] },
        ],
      },
      create: { status: 201, body: { insertId } },
    },
    scenes: {
      browse: { status: 200, body: mainScenes },
      create: { status: 201, body: { insertId } },
    },
  },
  scenes: {
    get: { status: 200, body: mainScenes[0] },
    update: { status: 204, body: {} },
    delete: { status: 204, body: {} },

    // Nested resources

    preferences: {
      upsert: { status: 204, body: {} },
    },
  },
  users: {
    browse: { status: 200, body: allUsers },
    get: { status: 200, body: teacherUser },
    update: { status: 204, body: {} },
    delete: { status: 204, body: {} },
  },
  errors: {
    unauthorized: { status: 401, body: {} },
    forbidden: { status: 403, body: {} },
    notFound: { status: 404, body: {} },
    badRequest: { status: 400, body: {} },
  },
};
