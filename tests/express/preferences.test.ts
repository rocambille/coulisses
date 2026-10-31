/*
  Purpose:
  Check the voting status rules that the seeded contract data does not reach.
*/

import contracts from "../contracts";
import { mainScenes } from "../fixtures/scenes";
import { actorUser, teacherUser } from "../fixtures/users";
import { check, mockedDatabase, setupMocks } from "./test-utils";

const votingStatusBody = async () => {
  const test = contracts.preferences.voting_status;

  const { body } = await check(
    {
      ...test,
      cases: {
        current: {
          request: test.cases.as_admin.request,
          response: { status: 200, body: expect.anything() },
        },
      },
    },
    "current",
  );

  return body as VotingStatus;
};

describe("GET /api/plays/:playId/voting-status", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should ignore votes on inactive scenes", async () => {
    const [, inactiveScene] = mainScenes;

    mockedDatabase
      .prepare(
        "insert into scene_preference(user_id, scene_id, level) values(?, ?, 'HIGH')",
      )
      .run(actorUser.id, inactiveScene.id);

    const { members } = await votingStatusBody();

    expect(
      members.find((member) => member.id === actorUser.id)?.voted_scene_ids,
    ).toEqual([mainScenes[0].id]);
  });

  it("should not track soft-deleted members", async () => {
    mockedDatabase
      .prepare(
        "update user set deleted_at = '2026-01-01T00:00:00Z' where id = ?",
      )
      .run(actorUser.id);

    const { members } = await votingStatusBody();

    expect(members.map((member) => member.id)).toEqual([teacherUser.id]);
  });
});
