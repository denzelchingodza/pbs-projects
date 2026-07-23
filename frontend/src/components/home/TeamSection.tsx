/**
 * Real leadership team, shown on the About page. Replaces the generic
 * "Meet the Founder" placeholder (AboutFounder.tsx, kept around unused for
 * now rather than deleted, in case it's wanted again later) now that there
 * are two real, named people to show instead of an unfilled single bio.
 *
 * Editorial layout, not a pair of identical boxed cards: each member gets a
 * large portrait photo and generous, left aligned type, and the two
 * entries alternate photo left/right so the section reads as one designed
 * spread rather than a repeated component stacked twice. A thin rule and
 * wide vertical gap separate the two instead of a card border, and a soft
 * orange panel sits behind each photo, the same accent treatment the
 * homepage hero uses, so this ties back into the rest of the site rather
 * than looking like a bolted on block.
 *
 * Photos live in public/images/team/. Until a given member's photo file is
 * actually supplied, their spot falls back to a plain initials panel, so
 * the page never shows a broken image.
 */
import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: string; // path in public/images/team/, once supplied
}

const TEAM: TeamMember[] = [
  {
    name: "Panashe Simbi",
    role: "CEO",
    bio: "Leads PBS Projects' overall direction and client relationships, making sure every job, from the first quote to the final install, reflects the standard the business is built on.",
    photo: "/images/team/panashe-simbi.jpg",
  },
  {
    name: "Herbert Matembunze",
    role: "Operations Manager",
    bio: "Runs the day to day of every project, scheduling, materials, and the installation team, so each job stays on track and on time from start to finish.",
    photo: "/images/team/herbert-matembunze.jpg",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TeamCard({ member, reversed }: { member: TeamMember; reversed: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-10 md:gap-16 md:items-center ${
        reversed ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <div className="relative w-full max-w-[280px] md:max-w-none md:w-2/5 shrink-0">
        <div className="absolute -inset-4 bg-orange/10 rounded-2xl -z-10" aria-hidden="true" />
        {member.photo ? (
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={member.photo}
              alt={`${member.name}, ${member.role} at PBS Projects`}
              fill
              sizes="(max-width: 768px) 80vw, 340px"
              className="object-cover object-top"
            />
          </div>
        ) : (
          <div className="w-full aspect-[4/5] rounded-2xl bg-dark text-white flex items-center justify-center text-4xl font-bold shadow-lg">
            {initials(member.name)}
          </div>
        )}
      </div>
      <div className="flex-1 text-center md:text-left">
        <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em]">{member.role}</p>
        <h3 className="mt-2 font-bold text-dark text-2xl sm:text-3xl tracking-tight">{member.name}</h3>
        <p className="mt-4 text-neutral-600 text-[15px] leading-relaxed max-w-md mx-auto md:mx-0">
          {member.bio}
        </p>
      </div>
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">
          Leadership
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight text-center mb-16">
          Meet the Team
        </h2>
        <div className="divide-y divide-neutral-200">
          {TEAM.map((member, i) => (
            <div key={member.name} className={i === 0 ? "pb-16 md:pb-20" : "pt-16 md:pt-20"}>
              <TeamCard member={member} reversed={i % 2 === 1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
