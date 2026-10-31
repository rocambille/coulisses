/*
  Purpose:
  Check what the plays contract cannot see from the HTTP response alone:
  the rows and files left behind by a creation with an attached document.
*/

import fs from "node:fs";

import { deleteUploadedFile } from "../../src/express/helpers/upload";
import contracts from "../contracts";
import { check, mockedDatabase, setupMocks } from "./test-utils";

// Other test files upload in parallel: check the exact file, not the folder
const expectUploadDiscarded = (rmSync: ReturnType<typeof spyOnRmSync>) => {
  const [uploadedFile] = rmSync.mock.calls[0];

  expect(String(uploadedFile)).toMatch(/uploads\/plays\/.*\.webp$/);
  expect(fs.existsSync(uploadedFile)).toBe(false);
};

const spyOnRmSync = () => vi.spyOn(fs, "rmSync");

const countPlays = () =>
  mockedDatabase.prepare("select count(*) as count from play").get()?.count;

describe("POST /api/troupes/:troupeId/plays with a document", () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should store the document with the new play", async () => {
    const response = await check(contracts.plays.add, "as_admin_with_document");

    const rows = mockedDatabase
      .prepare("select * from play_document where play_id = ?")
      .all(response.body.insertId);

    expect(rows).toEqual([
      expect.objectContaining({
        file_url: expect.stringMatching(/^\/uploads\/plays\/.*\.webp$/),
        mime_type: "image/webp",
        original_name: "page1.webp",
        order_index: 1,
      }),
    ]);

    deleteUploadedFile(String(rows[0].file_url));
  });

  it("should keep accents in the original file name", async () => {
    const test = contracts.plays.add;
    const { as_admin_with_document: withDocument } = test.cases;
    const attach = withDocument.request.attach as NonNullable<
      typeof withDocument.request.attach
    >;

    const response = await check(
      {
        ...test,
        cases: {
          accented: {
            ...withDocument,
            request: {
              ...withDocument.request,
              attach: {
                ...attach,
                options: {
                  filename: "Molière - Le Médecin.webp",
                  contentType: "image/webp",
                },
              },
            },
          },
        },
      },
      "accented",
    );

    const row = mockedDatabase
      .prepare("select * from play_document where play_id = ?")
      .get(response.body.insertId);

    deleteUploadedFile(String(row?.file_url));

    expect(row?.original_name).toBe("Molière - Le Médecin.webp");
  });

  it("should not keep the file when the play is rejected", async () => {
    const rmSync = spyOnRmSync();

    await check(contracts.plays.add, "bad_request_with_document");

    expectUploadDiscarded(rmSync);
  });

  it("should roll back the play when the document cannot be stored", async () => {
    const playsBefore = countPlays();
    const rmSync = spyOnRmSync();

    mockedDatabase.exec(
      `create trigger reject_document before insert on play_document
       begin select raise(abort, 'rejected'); end`,
    );

    await check(
      {
        ...contracts.plays.add,
        cases: {
          failure: {
            ...contracts.plays.add.cases.as_admin_with_document,
            response: { status: 500, body: expect.anything() },
          },
        },
      },
      "failure",
    );

    expect(countPlays()).toBe(playsBefore);
    expectUploadDiscarded(rmSync);
  });
});
