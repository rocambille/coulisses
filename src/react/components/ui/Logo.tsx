/*
  Purpose:
  Render the Coulisses mark (rampe, spot, flaque, C) as inline SVG.

  Design notes:
  - The "C" is a vectorized Fraunces glyph (outlined path), not live text:
    it renders identically everywhere, with zero font-loading dependency.
  - `compact` drops the rampe and flaque — the version that still reads
    at nav-bar / favicon size. Use it anywhere the full mark would be
    too small to read (nav, inline avatars, tight spaces).
*/

const C_PATH =
  "M1342 369Q1341 298 1302.5 226.5Q1264 155 1191.5 95.0Q1119 35 1015.5 -1.0Q912 -37 780 -37Q564 -37 407.0 56.0Q250 149 164.5 313.5Q79 478 79 691Q79 853 129.5 988.0Q180 1123 271.5 1223.5Q363 1324 486.0 1379.5Q609 1435 754 1435Q854 1435 917.0 1415.5Q980 1396 1016.0 1376.0Q1052 1356 1073 1356Q1098 1356 1111.0 1373.5Q1124 1391 1138.0 1408.0Q1152 1425 1177 1425Q1195 1425 1207.0 1413.5Q1219 1402 1227 1375L1332 1030Q1339 1007 1327.5 989.0Q1316 971 1293 966Q1269 961 1250.0 970.5Q1231 980 1220 1004Q1166 1124 1100.5 1194.5Q1035 1265 959.0 1296.0Q883 1327 795 1327Q706 1327 632.0 1286.5Q558 1246 504.0 1171.0Q450 1096 420.5 991.0Q391 886 391 755Q391 554 453.5 414.5Q516 275 624.0 203.0Q732 131 871 131Q1004 131 1102.5 194.5Q1201 258 1256 374Q1267 397 1281.0 404.5Q1295 412 1312 409Q1327 407 1334.5 396.5Q1342 386 1342 369Z";

const INK = "#171310";
const AMBER = "#F0A830";

type LogoProps = {
  /** Drops the rampe and flaque, keeping only the C and the spot. */
  compact?: boolean;
  /** CSS height; width follows the mark's natural aspect ratio. */
  size?: string;
  className?: string;
};

function Logo({ compact = false, size = "1.5rem", className }: LogoProps) {
  if (compact) {
    return (
      <svg
        viewBox="0 0 64 64"
        style={{ height: size, width: "auto", display: "block" }}
        className={className}
        role="img"
        aria-label="Coulisses"
      >
        <path
          transform="translate(10.76,50) scale(0.0299,-0.0299)"
          d={C_PATH}
          fill={INK}
        />
        <circle cx="50" cy="12" r="7" fill={AMBER} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 220 300"
      style={{ height: size, width: "auto", display: "block" }}
      className={className}
      role="img"
      aria-label="Coulisses"
    >
      <line
        x1="87.5"
        y1="35"
        x2="177.5"
        y2="35"
        stroke={INK}
        strokeWidth="7.5"
        strokeLinecap="round"
      />
      <circle cx="177.5" cy="35" r="15" fill={INK} />
      <ellipse cx="104" cy="257" rx="76.5" ry="19.5" fill={AMBER} />
      <path
        transform="translate(60.3,200) scale(0.08051,-0.08051)"
        d={C_PATH}
        fill={INK}
      />
    </svg>
  );
}

export default Logo;
