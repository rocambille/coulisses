declare module "*.css";

type Json = string | number | bigint | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: Json };
type JsonArray = Json[];

type CastingMatrix =
  import("../express/modules/casting/castingSchemas").CastingMatrix;
type EventData = import("../express/modules/event/eventSchemas").EventData;
type EventPresence =
  import("../express/modules/event/eventSchemas").EventPresence;
type Play = import("../express/modules/play/playSchemas").Play;
type PlayPreference =
  import("../express/modules/preference/preferenceSchemas").PlayPreference;
type RolePreference =
  import("../express/modules/preference/preferenceSchemas").RolePreference;
type RoleWithScenes =
  import("../express/modules/role/roleSchemas").RoleWithScenes;
type Scene = import("../express/modules/scene/sceneSchemas").Scene;
type ScenePreference =
  import("../express/modules/preference/preferenceSchemas").ScenePreference;
type Troupe = import("../express/modules/troupe/troupeSchemas").Troupe;
type TroupeMember =
  import("../express/modules/troupe/troupeSchemas").TroupeMember;
type User = import("../express/modules/user/userSchemas").User;

type NavItem = {
  label: string;
  to: string;
};
