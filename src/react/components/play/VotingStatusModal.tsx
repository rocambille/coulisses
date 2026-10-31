/*
  Purpose:
  Show admins who voted on the scenes of a play, and who still has to.
  Covers every active scene, or a single one when `scene` is provided.
*/

import { Suspense, use } from "react";
import { getOrFetch } from "../../helpers/cache";
import Modal from "../ui/Modal";
import NotifyButton from "../ui/NotifyButton";

type Member = VotingStatus["members"][number];

function MemberList({
  title,
  members,
  detail,
}: {
  title: string;
  members: Member[];
  detail?: (member: Member) => string;
}) {
  if (members.length === 0) return null;

  return (
    <section>
      <h4>
        {title} ({members.length})
      </h4>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            {member.name}
            {detail && <small> ({detail(member)})</small>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function VotingStatusContent({
  playId,
  scene,
}: {
  playId: string;
  scene?: Scene;
}) {
  const { active_scene_ids, members } = use(
    getOrFetch<VotingStatus>(`/api/plays/${playId}/voting-status`),
  );

  const sceneIds = scene ? [scene.id] : active_scene_ids;

  if (sceneIds.length === 0) {
    return <p>Aucune scène active pour le moment.</p>;
  }

  const countVotes = (member: Member) =>
    sceneIds.filter((id) => member.voted_scene_ids.includes(id)).length;

  // A reminder covers the whole play, so it is offered on the global view only
  const canRemind =
    scene == null &&
    members.some(
      (member) =>
        member.role === "ACTOR" && countVotes(member) < sceneIds.length,
    );

  // Admins may vote, but they are not expected to: no reminder for them
  const tracked = members.filter(
    (member) => member.role === "ACTOR" || countVotes(member) > 0,
  );

  return (
    <>
      <MemberList
        title="N'ont pas encore voté"
        members={tracked.filter((member) => countVotes(member) === 0)}
      />
      <MemberList
        title="Vote en cours"
        members={tracked.filter((member) => {
          const votes = countVotes(member);
          return votes > 0 && votes < sceneIds.length;
        })}
        detail={(member) => `${countVotes(member)}/${sceneIds.length} scènes`}
      />
      <MemberList
        title="Ont voté"
        members={tracked.filter(
          (member) => countVotes(member) === sceneIds.length,
        )}
      />
      {canRemind && (
        <NotifyButton
          playId={playId}
          kind="VOTE_REMINDER"
          label="📣 Relancer les comédiens"
        />
      )}
    </>
  );
}

export default function VotingStatusModal({
  playId,
  scene,
  onClose,
}: {
  playId: string;
  scene?: Scene;
  onClose: () => void;
}) {
  return (
    <Modal
      title={scene ? `Votes : ${scene.title}` : "Suivi des votes"}
      onClose={onClose}
    >
      {/* Local boundary: Layout's one would replace the whole page */}
      <Suspense fallback={<p aria-busy="true">Chargement…</p>}>
        <VotingStatusContent playId={playId} scene={scene} />
      </Suspense>
    </Modal>
  );
}
