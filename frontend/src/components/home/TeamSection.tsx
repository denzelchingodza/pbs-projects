/**
 * Real leadership team, shown on the About page. Replaces the generic
 * "Meet the Founder" placeholder (AboutFounder.tsx, kept around unused for
 * now rather than deleted, in case it's wanted again later) now that there
 * are two real, named people to show instead of an unfilled single bio.
 *
 * Photos are square headshots in public/images/team/. Until those exist,
 * each card falls back to the same initials-badge pattern the founder
 * section already used, so the page never shows a broken image.
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
  },
  {
    name: "Herbert Matembunze",
    role: "Operations Manager",
    bio: "Runs the day to day of every project, scheduling, materials, and the installation team, so each job stays on track and on time from start to finish.",
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

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
      {member.photo ? (
        <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden shadow-md ring-4 ring-orange/10">
          <Image src={member.photo} alt={member.name} fill sizes="112px" className="object-cover" />
        </div>
      ) : (
        <div className="w-28 h-28 mx-auto rounded-full bg-dark text-white flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-orange/10">
          {initials(member.name)}
        </div>
      )}
      <h3 className="mt-5 font-bold text-dark text-lg">{member.name}</h3>
      <p className="text-orange text-xs font-semibold uppercase tracking-widest mt-1">{member.role}</p>
      <p className="text-neutral-600 text-sm leading-relaxed mt-3">{member.bio}</p>
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-4xl mx-auto">
        <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">
          Leadership
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight text-center mb-10">
          Meet the Team
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {TEAM.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
